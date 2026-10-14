import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX H04: Availability instruction text", async (t) => {
  const pagePath = path.join(rootDir, "app/mid-range-intake/page.jsx");
  const pickerPath = path.join(rootDir, "components/WeeklyAvailabilityPicker.jsx");

  assert.ok(fs.existsSync(pagePath), "mid-range-intake/page.jsx must exist");
  assert.ok(fs.existsSync(pickerPath), "WeeklyAvailabilityPicker.jsx must exist");

  const pageContent = fs.readFileSync(pagePath, "utf8");
  const pickerContent = fs.readFileSync(pickerPath, "utf8");

  await t.test("1. Availability step instruction text is exactly as specified", () => {
    const expectedInstruction =
      "Select 1 day and time slot for your recurring weekly counselling sessions, the more slots you select the more counsellors or coaches to choose from.";

    assert.ok(
      pageContent.includes(expectedInstruction),
      `mid-range-intake/page.jsx must contain the exact instruction: "${expectedInstruction}"`
    );
  });

  await t.test("2. Q08 sentence remains intact in WeeklyAvailabilityPicker", () => {
    const q08Sentence = "The more availability you provide, the more options you will have.";
    assert.ok(
      pickerContent.includes(q08Sentence),
      `WeeklyAvailabilityPicker.jsx must contain Q08 sentence: "${q08Sentence}"`
    );
  });

  await t.test("3. 'delay in matching' sentence does NOT appear anywhere", () => {
    const forbiddenText =
      "Please note if this info is not provided there can be a delay in matching you with a counsellor.";

    assert.ok(
      !pageContent.includes(forbiddenText),
      "mid-range-intake/page.jsx must NOT contain the forbidden delay-in-matching sentence"
    );
    assert.ok(
      !pickerContent.includes(forbiddenText),
      "WeeklyAvailabilityPicker.jsx must NOT contain the forbidden delay-in-matching sentence"
    );

    // Also verify partial match is not present in intake
    assert.ok(
      !pageContent.toLowerCase().includes("delay in matching"),
      "mid-range-intake/page.jsx must NOT mention 'delay in matching'"
    );
    assert.ok(
      !pickerContent.toLowerCase().includes("delay in matching"),
      "WeeklyAvailabilityPicker.jsx must NOT mention 'delay in matching'"
    );
  });
});
