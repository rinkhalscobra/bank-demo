import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/components/dashboard/workspace/dropdownPosition.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
});
const { getDropdownPosition } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

// Regression: a 188px filter field must not produce a 220px menu.
assert.deepEqual(
  getDropdownPosition({ left: 75, top: 569, bottom: 614, width: 188 }, { left: 0, top: 0, width: 1585, height: 763 }, 56),
  { left: 75, top: 621, width: 188, maxHeight: 56 },
);

// A short menu still opens below the trigger when it fits there.
assert.equal(getDropdownPosition({ left: 20, top: 450, bottom: 494, width: 180 }, { left: 0, top: 0, width: 390, height: 600 }, 60).top, 501);

// On-screen keyboard: the visible viewport is smaller and offset from the page.
const keyboard = getDropdownPosition({ left: 20, top: 360, bottom: 404, width: 280 }, { left: 0, top: 120, width: 320, height: 320 }, 300);
assert.ok(keyboard.top < 360);
assert.ok(keyboard.top >= 128 && keyboard.top + keyboard.maxHeight <= 432);

let cases = 3;
for (const width of [280, 320, 360, 390, 540, 768, 1024, 1440, 1920]) {
  for (const height of [240, 480, 720, 960]) {
    for (const offset of [0, 80]) {
      const viewport = { left: offset, top: offset, width, height };
      for (const triggerWidth of [96, 188, 235, 420]) {
        for (const top of [8, height / 2, height - 52]) {
          for (const left of [8, width / 2, width - 80]) {
            for (const contentHeight of [40, 70, 320, 720]) {
              const rect = { left: left + offset, top: top + offset, bottom: top + offset + 44, width: triggerWidth };
              const menu = getDropdownPosition(rect, viewport, contentHeight);
              assert.ok(menu.left >= offset + 8);
              assert.ok(menu.left + menu.width <= offset + width - 8);
              assert.ok(menu.top >= offset + 8);
              assert.ok(menu.top + menu.maxHeight <= offset + height - 8);
              assert.ok(menu.width <= triggerWidth);
              assert.ok(menu.maxHeight >= 0 && menu.maxHeight <= Math.min(320, contentHeight));
              if (rect.left + triggerWidth <= offset + width - 8) {
                assert.equal(menu.width, triggerWidth);
                assert.equal(menu.left, rect.left);
              }
              cases += 1;
            }
          }
        }
      }
    }
  }
}

console.log(`Dropdown positioning passed ${cases} viewport, edge, and keyboard cases.`);
