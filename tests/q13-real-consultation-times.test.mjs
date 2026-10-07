import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q13: Real consultation times only", () => {
  const filteredCounsellorsContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );
  const intakeContent = fs.readFileSync(
    path.join(rootDir, "app/mid-range-intake/page.jsx"),
    "utf8"
  );

  // 1. Delete made-up times ("s1" to "s10") and hardcoded dates
  for (let i = 1; i <= 10; i++) {
    assert.ok(
      !filteredCounsellorsContent.includes(`id: "s${i}"`),
      `Must not contain fake slot id s${i}`
    );
  }
  assert.ok(
    !filteredCounsellorsContent.includes("[20, 21, 24, 27, 28, 31]"),
    "Must not contain hardcoded available days array"
  );
  assert.ok(
    !filteredCounsellorsContent.includes("Monday, 20 May 2024"),
    "Must not contain hardcoded default date"
  );

  // 2. When a date has no slots, show message
  assert.ok(
    filteredCounsellorsContent.includes("No times available on this date. Please choose another date."),
    "Must display exact message when date has no slots"
  );

  // 3. Step 10 validation must block moving forward without a slot ID
  assert.ok(
    intakeContent.includes("if (!formData.consultationSlotId)"),
    "Must require real consultationSlotId to advance past Step 10"
  );

  // 4. Fallback to Vanquish consultation pool
  assert.ok(
    filteredCounsellorsContent.includes("setCounsellorSlots(availableSlots)"),
    "Must fall back to Vanquish pool availableSlots when counsellor has no own slots"
  );
});
