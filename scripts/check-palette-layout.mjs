import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

// Exercise the real CRM UI against local fixtures; never sign in to or write to
// the configured Supabase project during this layout regression check.
const server = await createServer({ server: { host: '127.0.0.1', port: 0, open: false } });
let browser;
try {
  await server.listen();
  const baseUrl = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
  let checks = 0;

  for (const viewport of [
    { width: 1892, height: 935 },
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    let savedBranding = { palette: 'ocean' };
    let rejectSave = false;
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('betashares-cookie-consent', JSON.stringify({
        version: '2026-06-13', updatedAt: new Date().toISOString(),
        preferences: { necessary: true, functional: false, analytics: false, marketing: false },
      }));
    });

    await page.route('**/src/contexts/AuthContext.tsx*', (route) => route.fulfill({
      contentType: 'application/javascript',
      body: `
        const auth = {
          user: { id: 'layout-test', email: 'layout@example.test' }, profile: {},
          crmRole: 'admin', loading: false, isAdmin: true, isCrmStaff: true,
          pinVerified: true, signOut: async () => {},
        };
        export const useAuth = () => auth;
        export const AuthProvider = ({ children }) => children;
      `,
    }));
    await page.route('**/src/lib/crmIpAccess.ts*', (route) => route.fulfill({
      contentType: 'application/javascript',
      body: `
        const status = { allowed: true, current_ip: '127.0.0.1', ip_check_enabled: false, enforcement_enabled: false, entries: [] };
        export const checkCrmIpAccess = async () => status;
        export const listCrmIpWhitelist = async () => status;
        export const addCrmIpWhitelistEntry = async () => ({});
        export const deleteCrmIpWhitelistEntry = async () => ({});
        export const setCrmIpCheckEnabled = async () => status;
      `,
    }));
    await page.route('https://**/*', (route) => {
      const url = new URL(route.request().url());
      if (!url.hostname.endsWith('.supabase.co')) return route.abort();
      if (!url.pathname.includes('/site_branding')) return route.fulfill({ json: [] });
      if (route.request().method() !== 'GET') {
        if (rejectSave) {
          return route.fulfill({ status: 400, json: {
            code: '23514', message: 'new row violates check constraint "site_branding_palette_check"',
          } });
        }
        savedBranding = { ...JSON.parse(route.request().postData()), updated_at: new Date().toISOString() };
      }
      return route.fulfill({ json: savedBranding });
    });

    async function assertFullViewport(label) {
      // Allow a frame for focus scrolling and React's selection update.
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const layout = await page.evaluate(() => {
        const rect = document.querySelector('.crm-workspace').getBoundingClientRect();
        const main = document.querySelector('.crm-workspace__content');
        const mainRect = main.getBoundingClientRect();
        return {
          scrollY, top: rect.top, bottom: rect.bottom, mainBottom: mainRect.bottom,
          height: innerHeight, scrollable: main.scrollHeight > main.clientHeight,
          bottomCovered: Boolean(document.elementFromPoint(innerWidth / 2, innerHeight - 2)?.closest('.crm-workspace')),
        };
      });
      assert.equal(layout.scrollY, 0, `${label}: document scrolled`);
      assert.equal(layout.top, 0, `${label}: CRM moved above viewport`);
      assert.equal(layout.bottom, layout.height, `${label}: blank area below CRM`);
      assert.equal(layout.mainBottom, layout.height, `${label}: scroll panel shrank`);
      assert.ok(layout.scrollable, `${label}: long form must remain scrollable`);
      assert.ok(layout.bottomCovered, `${label}: bottom of viewport is outside CRM`);
      assert.deepEqual(errors, [], `${label}: browser errors`);
      checks++;
    }

    await page.goto(`${baseUrl}/crm-admin`);
    const radios = page.locator('input[name="site-palette"]');
    await radios.first().waitFor({ state: 'attached' });
    const palettes = await radios.evaluateAll((inputs) => inputs.map((input) => input.value));
    assert.ok(palettes.length >= 12, 'All palette choices must be exercised');

    for (const palette of palettes) {
      const radio = page.locator(`input[name="site-palette"][value="${palette}"]`);
      await radio.locator('..').click();
      assert.ok(await radio.isChecked(), `${palette}: mouse selection failed`);
      await assertFullViewport(`${viewport.width}px mouse ${palette}`);
    }

    await radios.first().locator('..').click();
    for (let index = 1; index <= palettes.length; index++) {
      await page.keyboard.press('ArrowRight');
      assert.ok(await radios.nth(index % palettes.length).isChecked(), 'Keyboard selection failed');
      await assertFullViewport(`${viewport.width}px keyboard ${index}`);
    }

    await page.getByRole('button', { name: 'Save site settings' }).click();
    await page.getByText('Branding, color palette, favicons, institutional settings, and legal contact email updated across the site.').waitFor();
    await assertFullViewport(`${viewport.width}px save`);

    rejectSave = true;
    await radios.nth(6).locator('..').click();
    await page.getByRole('button', { name: 'Save site settings' }).click();
    await page.getByText(/The database palette list is out of date/).waitFor();
    await assertFullViewport(`${viewport.width}px rejected save`);

    // The controls at the end of the long form must still be reachable.
    await page.getByPlaceholder('Enter any license text').scrollIntoViewIfNeeded();
    await assertFullViewport(`${viewport.width}px lower form`);
    await page.close();
  }
  console.log(`Palette layout passed ${checks} checks across 12 themes and 5 desktop/mobile viewports, including keyboard selection and successful/rejected saves.`);
} finally {
  await browser?.close();
  await server.close();
}
