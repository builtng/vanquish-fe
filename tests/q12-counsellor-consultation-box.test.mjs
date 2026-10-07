import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q12: Wrong counsellor in the consultation box", () => {
  const filteredCounsellorsContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );
  const intakeContent = fs.readFileSync(
    path.join(rootDir, "app/mid-range-intake/page.jsx"),
    "utf8"
  );

  // 1. Do not auto-select counsellor on load and show 'Choose a counsellor to see consultation times.'
  assert.ok(
    !filteredCounsellorsContent.includes("onSelectCounsellor(res.counsellors[0])"),
    "Must not auto-select the first counsellor on load"
  );
  assert.ok(
    filteredCounsellorsContent.includes("Choose a counsellor to see consultation times."),
    "Must prompt 'Choose a counsellor to see consultation times.'"
  );

  // 2. When counsellor changes in intake form, clear chosen date and slot
  assert.ok(
    intakeContent.includes("consultationSlotId: \"\"") &&
    intakeContent.includes("consultationDatetime: \"\""),
    "onSelectCounsellor must clear chosen consultation slot and datetime"
  );

  // 3. Ignore slot responses for a counsellor who is no longer selected
  assert.ok(
    filteredCounsellorsContent.includes("currentUuid === selectedCounsellorUuid"),
    "Must verify response matches current selected counsellor uuid before setting slots"
  );

  // 4. Store counsellor id/name with slot and show counsellor name on payment step
  assert.ok(
    intakeContent.includes("consultationWithTcName"),
    "Must track counsellor name in intake state"
  );
  assert.ok(
    intakeContent.includes("Selected Counsellor:"),
    "Must display 'Selected Counsellor:' on payment step"
  );
  assert.ok(
    intakeContent.includes("formData.consultationWithTcName"),
    "Must render counsellor name in payment step fee section"
  );
});
