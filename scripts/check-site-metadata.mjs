import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function importTypeScript(source) {
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

for (const file of ['index.html', 'public/site.webmanifest', 'vercel.json', 'scripts/generate-social-preview.ps1']) {
  assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /betashares/i, `${file}: obsolete metadata`);
}

// Exercise brand changes against stale and missing head tags, including duplicates.
const tags = [];
const element = () => ({
  attrs: {},
  setAttribute(key, value) { this.attrs[key] = value; },
  set content(value) { this.attrs.content = value; },
});
const stale = element();
stale.attrs = { property: 'og:title', content: 'Old site title' };
tags.push(stale, { ...stale, attrs: { ...stale.attrs } });
globalThis.document = {
  title: 'Old site title',
  createElement: element,
  head: {
    appendChild(meta) { tags.push(meta); },
    querySelectorAll(selector) {
      const [, attribute, key] = selector.match(/^meta\[(\w+)="([^"]+)"\]$/);
      return tags.filter(meta => meta.attrs[attribute] === key);
    },
  },
};

const { updateSiteMetadata } = await importTypeScript(fs.readFileSync('src/lib/siteMetadata.ts', 'utf8'));
for (const name of ['Bankera', 'Ocean Finance', 'North & South <Bank>', '']) {
  updateSiteMetadata(name);
  assert.equal(document.title, name || 'Secure Digital Banking');
  for (const meta of tags) {
    assert.ok(meta.attrs.content.toLowerCase().includes((name || 'Banking').toLowerCase()), `Missing brand in ${JSON.stringify(meta.attrs)}`);
    assert.doesNotMatch(meta.attrs.content, /betashares|Old site title/i);
  }
}
assert.equal(tags.length, 11, 'Updates should reuse existing tags');

// Check fallback behavior for cached/database legacy branding without loading React.
const brandingText = fs.readFileSync('src/contexts/BrandingContext.tsx', 'utf8');
const brandingSource = ts.createSourceFile('BrandingContext.tsx', brandingText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const wanted = new Set(['LEGACY_BRAND_WORD', 'DEFAULT_BRANDING', 'cleanText', 'cleanBrandText', 'matchReplacementCase', 'applyBrandingToText']);
const declarations = [];
for (const statement of brandingSource.statements) {
  if (ts.isFunctionDeclaration(statement) && wanted.has(statement.name?.text)) declarations.push(statement.getText(brandingSource));
  if (ts.isVariableStatement(statement) && statement.declarationList.declarations.some(declaration => wanted.has(declaration.name.getText(brandingSource)))) {
    declarations.push(statement.getText(brandingSource));
  }
}
const branding = await importTypeScript(`${declarations.join('\n')}\nexport { cleanBrandText };`);
assert.doesNotMatch(JSON.stringify(branding.DEFAULT_BRANDING), /betashares/i);
assert.equal(branding.cleanBrandText(' BetaShares ', 'Banking'), 'Banking');
assert.equal(branding.cleanBrandText('Bankera', 'Banking'), 'Bankera');
assert.equal(branding.applyBrandingToText('Why BetaShares', { brandKeyword: 'Bankera' }), 'Why Bankera');
assert.equal(branding.applyBrandingToText('Why BetaShares'), 'Why Banking');
delete globalThis.document;
console.log('Metadata checks passed: static cleanup, CRM brand changes, missing/duplicate tags, legacy fallback.');
