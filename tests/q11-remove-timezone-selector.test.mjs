import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q11: Remove the time zone selector and show UK time label", () => {
  const fileContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );

  // 1. Selector and options AEST, EST, PST must NOT exist in the file
  assert.ok(
    !fileContent.includes("<option value=\"AEST\">"),
    "Must not contain AEST option"
  );
  assert.ok(
    !fileContent.includes("<option value=\"EST\">"),
    "Must not contain EST option"
  );
  assert.ok(
    !fileContent.includes("<option value=\"PST\">"),
    "Must not contain PST option"
  );
  assert.ok(
    !fileContent.includes("setTimezone"),
    "Must not contain setTimezone state setter"
  );

  // 2. Must render the exact label 'All times are UK time.'
  assert.ok(
    fileContent.includes("All times are UK time."),
    "Must display 'All times are UK time.'"
  );
});
