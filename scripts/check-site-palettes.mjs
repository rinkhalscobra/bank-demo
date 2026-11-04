import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'src/contexts/BrandingContext.tsx');
const source = ts.createSourceFile(sourcePath, fs.readFileSync(sourcePath, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let paletteArray;

function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'SITE_PALETTES') {
    paletteArray = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
  }
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(paletteArray && ts.isArrayLiteralExpression(paletteArray));

const palettes = paletteArray.elements.map((element) => Object.fromEntries(
  element.properties.map((property) => [property.name.getText(source), property.initializer.text]),
));
assert.equal(new Set(palettes.map((palette) => palette.id)).size, palettes.length, 'Duplicate palette IDs');
assert.equal(new Set(palettes.map((palette) => palette.name)).size, palettes.length, 'Duplicate palette names');

// Keep the picker and database allowlist in sync, so a new preset can be saved.
const directory = path.join(root, 'supabase/migrations');
const migration = fs.readdirSync(directory).sort().reverse().map((file) => fs.readFileSync(path.join(directory, file), 'utf8'))
  .find((sql) => sql.includes('ADD CONSTRAINT site_branding_palette_check'));
const allowed = migration?.match(/CHECK\s*\(palette\s+IN\s*\(([\s\S]*?)\)\)/i)?.[1];
assert.ok(allowed, 'Palette database constraint was not found');
const ids = [...allowed.matchAll(/'([^']+)'/g)].map((match) => match[1]).sort();
assert.deepEqual(palettes.map((palette) => palette.id).sort(), ids, 'Palette choices and database allowlist differ');

function luminance(hex) {
  const [red, green, blue] = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return red * .2126 + green * .7152 + blue * .0722;
}
function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => a - b);
  return (values[1] + .05) / (values[0] + .05);
}
const preservedIds = new Set(['classic', 'ocean', 'forest', 'royal', 'slate']);
for (const palette of palettes) {
  for (const role of ['primary', 'dark', 'accent', 'surface']) assert.match(palette[role], /^#[\da-f]{6}$/i);
  if (preservedIds.has(palette.id)) continue;
  for (const [name, first, second] of [
    ['button text', '#FFFFFF', palette.primary],
    ['inverse text', '#FFFFFF', palette.dark],
    ['active navigation', palette.dark, palette.accent],
    ['headings', palette.primary, palette.surface],
    ['footer accents', palette.accent, palette.dark],
  ]) assert.ok(contrast(first, second) >= 4.5, `${palette.name}: insufficient ${name} contrast`);
}

console.log(`Validated ${palettes.length} palettes, the database allowlist, and contrast for ${palettes.filter((palette) => !preservedIds.has(palette.id)).length} new themes.`);
