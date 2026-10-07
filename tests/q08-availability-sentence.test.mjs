import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q08: Availability sentence on Mid Range and Coaching form", () => {
  const pickerPath = path.join(rootDir, "components/WeeklyAvailabilityPicker.jsx");
  assert.ok(fs.existsSync(pickerPath), "WeeklyAvailabilityPicker.jsx must exist");

  const pickerContent = fs.readFileSync(pickerPath, "utf8");
  const expectedSentence = "The more availability you provide, the more options you will have.";

  assert.ok(
    pickerContent.includes(expectedSentence),
    `WeeklyAvailabilityPicker.jsx must contain the exact sentence: "${expectedSentence}"`
  );

  // Check that mid-range-intake and coaching pages render WeeklyAvailabilityPicker
  const midRangePath = path.join(rootDir, "app/mid-range-intake/page.jsx");
  const coachingPath = path.join(rootDir, "app/coaching/page.jsx");

  assert.ok(fs.existsSync(midRangePath), "mid-range-intake page must exist");
  assert.ok(fs.existsSync(coachingPath), "coaching page must exist");

  const midRangeContent = fs.readFileSync(midRangePath, "utf8");
  const coachingContent = fs.readFileSync(coachingPath, "utf8");

  assert.ok(
    midRangeContent.includes("WeeklyAvailabilityPicker"),
    "Mid Range intake form must use WeeklyAvailabilityPicker"
  );
  assert.ok(
    coachingContent.includes("WeeklyAvailabilityPicker"),
    "Coaching & Counselling form must use WeeklyAvailabilityPicker"
  );
});
