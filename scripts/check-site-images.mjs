import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const catalogSource = fs.readFileSync(path.join(root, 'src/data/sitePhotos.ts'), 'utf8');
const catalogModule = ts.transpileModule(catalogSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { sitePhotos } = await import(`data:text/javascript;base64,${Buffer.from(catalogModule).toString('base64')}`);

function jpegDimensions(file) {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, `${file}: invalid JPEG`);
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset], 0xff, `${file}: invalid JPEG marker`);
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = bytes.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error(`${file}: dimensions missing`);
}

let totalBytes = 0;
for (const [name, asset] of Object.entries(sitePhotos)) {
  const fullPath = path.join(root, 'public', asset.src);
  const smallPath = fullPath.replace('.jpg', '-768.jpg');
  const full = jpegDimensions(fullPath);
  const small = jpegDimensions(smallPath);
  assert.deepEqual(full, { width: asset.width, height: asset.height }, `${name}: catalog dimensions`);
  assert.equal(small.width, 768, `${name}: mobile width`);
  assert.ok(Math.abs(small.height - full.height * 768 / full.width) <= 1, `${name}: mobile aspect ratio`);
  for (const file of [fullPath, smallPath]) {
    const bytes = fs.statSync(file).size;
    assert.ok(bytes < 600_000, `${name}: image exceeds compression budget`);
    totalBytes += bytes;
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : /\.(tsx?|css)$/.test(entry.name) ? [file] : [];
  });
}

for (const file of walk(path.join(root, 'src'))) {
  const source = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /(?:i\.pravatar\.cc|images\.pexels\.com|\/images\/editorial\/|www\.forbes\.com\/advisor\/wp-content|metropol-hero\.jpg|home-loan-img\.jpg)/, `${file}: stale marketing image`);
  for (const match of source.matchAll(/photo="([a-z]+)"/g)) {
    assert.ok(sitePhotos[match[1]], `${file}: unknown photo ${match[1]}`);
  }
}

console.log(`Image checks passed: ${Object.keys(sitePhotos).length} photographs, ${Object.keys(sitePhotos).length * 2} local JPEGs, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total.`);
