import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(rootDir, p), "utf8");

test("16 Nov: the Emergency contact step is switched off on both intake forms", () => {
  assert.match(read("lib/constants.js"), /export const SHOW_EMERGENCY_CONTACT_STEP = false;/);
});

for (const [form, step] of [["app/low-cost-intake/page.jsx", 10], ["app/mid-range-intake/page.jsx", 11]]) {
  test(`${form}: Emergency step (${step}) is skipped, hidden from the progress bar and never blocks submit`, () => {
    const src = read(form);
    assert.ok(src.includes(`const EMERGENCY_STEP = ${step};`));

    // Next / Previous jump over it
    assert.ok(src.includes("if (next === EMERGENCY_STEP && !SHOW_EMERGENCY_CONTACT_STEP) next += 1;"));
    assert.ok(src.includes("if (prev === EMERGENCY_STEP && !SHOW_EMERGENCY_CONTACT_STEP) prev -= 1;"));

    // Progress bar and counters use the visible steps only
    assert.ok(src.includes("{visibleSteps.map((step, index) => {"));
    assert.ok(!src.includes("{steps.map((step, index) => {"));
    assert.ok(src.includes("Step {visibleStepNumber} of {visibleSteps.length}"));

    // Its validation is switched off (Low Cost re-validates step 10 on submit)
    const caseStart = src.indexOf(`case ${step}: // Emergency`);
    assert.ok(caseStart > 0);
    assert.ok(src.slice(caseStart, caseStart + 120).includes("if (!SHOW_EMERGENCY_CONTACT_STEP) break;"));
  });
}
