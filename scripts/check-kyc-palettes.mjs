import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const source = ts.createSourceFile('BrandingContext.tsx', fs.readFileSync('src/contexts/BrandingContext.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let palettes;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'SITE_PALETTES') {
    palettes = node.initializer.expression.elements.map((element) => Object.fromEntries(
      element.properties.map((property) => [property.name.getText(source), property.initializer.text]),
    ));
  }
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(palettes?.length);
if (process.env.KYC_PALETTES) {
  const selected = new Set(process.env.KYC_PALETTES.split(','));
  palettes = palettes.filter((palette) => selected.has(palette.id));
  assert.equal(palettes.length, selected.size, 'Unknown KYC test palette');
}

// Exercise real routes and controls against local fixtures. All external
// requests are intercepted; no accounts or identity documents are submitted.
const server = await createServer({
  server: { host: '127.0.0.1', port: 0, open: false, hmr: false, watch: null },
  plugins: [{
    name: 'kyc-test-entry',
    enforce: 'pre',
    transform(_code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/src/App.tsx')) return;
      // Keep the real KYC screens, guards, and branding provider while avoiding
      // loading unrelated CRM and dashboard screens on each test navigation.
      return `
        import { BrowserRouter, Routes, Route } from 'react-router-dom';
        import { BrandingProvider } from './contexts/BrandingContext';
        import { LanguageProvider } from './contexts/LanguageContext';
        import KycRoute from './routes/KycRoute';
        import KycStatusRoute from './routes/KycStatusRoute';
        import KycVerification from './pages/KycVerification';
        import KycStatus from './pages/KycStatus';
        import Header from './components/Header';
        export default function App() {
          return <BrowserRouter><BrandingProvider><LanguageProvider><Routes>
            <Route path="/" element={<div className="public-site"><Header /></div>} />
            <Route path="/kyc" element={<KycRoute><KycVerification /></KycRoute>} />
            <Route path="/kyc-status" element={<KycStatusRoute><KycStatus /></KycStatusRoute>} />
          </Routes></LanguageProvider></BrandingProvider></BrowserRouter>;
        }
      `;
    },
  }],
});
const image = {
  name: 'fixture.png', mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
};
let browser;
let checks = 0;
try {
  await server.listen();
  const baseUrl = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    page.setDefaultTimeout(15_000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    if (process.env.KYC_CSS_BASE_URL) {
      await page.route('**/src/index.css*', async (route) => {
        const response = await fetch(`${process.env.KYC_CSS_BASE_URL}/src/index.css`);
        assert.ok(response.ok, 'Could not read the active preview stylesheet');
        await route.fulfill({ contentType: 'application/javascript', body: await response.text() });
      });
    }
    let palette;
    let status = 'pending';
    await page.addInitScript(() => localStorage.setItem('betashares-cookie-consent', JSON.stringify({
      version: '2026-06-13', updatedAt: new Date().toISOString(),
      preferences: { necessary: true, functional: false, analytics: false, marketing: false },
    })));
    await page.route('**/src/contexts/AuthContext.tsx*', (route) => route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const useAuth = () => ({
          user: { id: 'kyc-test', email: 'kyc@example.test', user_metadata: { full_name: 'KYC Test' } },
          loading: false, pinVerified: true, kycStatus: ${JSON.stringify(status)},
          refreshKycStatus: async () => {}, signOut: async () => {},
        });
        export const AuthProvider = ({ children }) => children;
      `,
    }));
    await page.route('https://**/*', (route) => {
      const url = new URL(route.request().url());
      if (!url.hostname.endsWith('.supabase.co')) return route.abort();
      assert.equal(route.request().method(), 'GET', 'KYC theme checks must not write to the backend');
      return route.fulfill({ json: url.pathname.includes('/site_branding') ? { palette: palette.id } : [] });
    });

    async function color(locator, property, expected) {
      const values = await locator.evaluate(async (element, { property, expected }) => {
        await new Promise(requestAnimationFrame);
        for (const animation of element.getAnimations()) animation.finish();
        const context = document.createElement('canvas').getContext('2d');
        const rgba = (value) => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data];
        };
        return { actual: rgba(getComputedStyle(element).getPropertyValue(property)), expected: rgba(expected) };
      }, { property, expected });
      assert.deepEqual(values.actual, values.expected, `${viewport.width}px ${palette.id}: ${property}`);
      checks++;
    }

    async function checkShell() {
      await page.waitForFunction((id) => document.documentElement.dataset.sitePalette === id, palette.id);
      await color(page.locator('.kyc-shell'), 'background-color', palette.surface);
      await color(page.locator('.kyc-shell .site-navbar'), 'background-color', palette.dark);
      await color(page.locator('.kyc-shell .site-navbar-accent'), 'background-color', palette.accent);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'KYC page overflows horizontally');
    }

    for (palette of palettes) {
      await page.goto(baseUrl);
      await page.waitForFunction((id) => document.documentElement.dataset.sitePalette === id, palette.id);
      await color(page.locator('header.site-navbar'), 'background-color', palette.dark);
      await color(page.locator('header .site-navbar-accent'), 'background-color', palette.accent);
      for (status of ['pending', 'submitted', 'rejected']) {
        await page.goto(`${baseUrl}/kyc-status`);
        await page.getByRole('heading', { name: /Verification (Required|Under Review|Declined)/ }).waitFor();
        await page.mouse.move(0, 0);
        await checkShell();
        await color(page.locator('.kyc-shell svg').nth(1), 'color', palette.primary);
        if (status !== 'submitted') {
          const button = page.getByRole('button', { name: /^(Start|Resubmit) Verification$/ });
          await color(button, 'background-color', palette.primary);
          await button.hover();
          await color(button, 'background-color', palette.dark);
        }
      }

      status = 'pending';
      await page.goto(`${baseUrl}/kyc`);
      await page.getByRole('heading', { name: 'Personal Information', exact: true }).waitFor();
      await checkShell();
      await page.locator('input[type="date"]').fill('1990-01-01');
      await page.locator('input[type="date"]').focus();
      await color(page.locator('input[type="date"]'), '--tw-ring-color', `color-mix(in srgb, ${palette.primary} 20%, transparent)`);
      await page.getByRole('button', { name: 'Select nationality' }).click();
      await page.getByRole('option', { name: 'Germany', exact: true }).click();
      await page.getByRole('button', { name: 'Germany', exact: true }).click();
      await color(page.getByRole('option', { name: 'Germany', exact: true }), 'color', palette.primary);
      await color(page.getByRole('option', { name: 'Germany', exact: true }), 'background-color', `color-mix(in srgb, ${palette.accent} 20%, transparent)`);
      await page.getByRole('option', { name: 'Germany', exact: true }).click();
      const next = page.getByRole('button', { name: 'Continue', exact: true });
      await page.mouse.move(0, 0);
      await color(next, 'background-color', palette.primary);
      await next.click();
      await page.getByRole('heading', { name: 'Residential Address', exact: true }).waitFor();
      await page.getByPlaceholder('123 Main Street').fill('1 Example Street');
      await page.locator('input[type="text"]').nth(2).fill('Berlin');
      await page.locator('input[type="text"]').nth(4).fill('10115');
      await page.getByRole('button', { name: 'Select', exact: true }).click();
      await page.getByRole('option', { name: 'Germany', exact: true }).click();
      await next.click();
      await page.getByRole('heading', { name: 'Identity Document', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Passport', exact: true }).click();
      await page.getByRole('option', { name: 'National ID Card', exact: true }).click();
      await page.getByPlaceholder('Enter your document number').fill('TEST-123');
      await color(page.getByRole('button', { name: /Upload front of ID/ }), 'border-top-color', `color-mix(in srgb, ${palette.primary} 20%, transparent)`);
      await page.locator('input[type="file"]').nth(0).setInputFiles(image);
      await page.locator('img[alt="Preview"]').first().waitFor();
      await page.locator('input[type="file"]').nth(0).setInputFiles(image);
      await page.locator('img[alt="Preview"]').nth(1).waitFor();
      await next.click();
      await page.getByRole('heading', { name: 'Selfie Verification', exact: true }).waitFor();
      await page.locator('input[type="file"]').setInputFiles(image);
      await page.locator('img[alt="Preview"]').waitFor();
      await page.mouse.move(0, 0);
      await color(page.getByRole('button', { name: 'Submit Verification', exact: true }), 'background-color', palette.primary);
      await color(page.locator('.kyc-shell img[alt="Preview"]').locator('..').getByRole('button'), 'background-color', `color-mix(in srgb, ${palette.primary} 90%, transparent)`);
      assert.deepEqual(errors, [], 'KYC flow raised browser errors');
      console.log(`${viewport.width}px: ${palette.name} passed.`);
    }
    await page.close();
  }
  console.log(`KYC themes passed ${checks} color checks across ${palettes.length} palettes, all four steps, three status screens, dropdown portals, and desktop/mobile layouts.`);
} finally {
  await browser?.close();
  await server.close();
}
