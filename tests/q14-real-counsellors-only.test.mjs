import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q14: Show only real counsellors, and enough of them", () => {
  const filteredCounsellorsContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );

  // 1. Delete FALLBACK_COUNSELLORS (Sarah Mitchell, Jessica Thompson, Emily Rose) and the merge
  assert.ok(
    !filteredCounsellorsContent.includes("Sarah Mitchell"),
    "Must not contain Sarah Mitchell"
  );
  assert.ok(
    !filteredCounsellorsContent.includes("Jessica Thompson"),
    "Must not contain Jessica Thompson"
  );
  assert.ok(
    !filteredCounsellorsContent.includes("Emily Rose"),
    "Must not contain Emily Rose"
  );
  assert.ok(
    !filteredCounsellorsContent.includes("FALLBACK_COUNSELLORS"),
    "Must not define FALLBACK_COUNSELLORS constant"
  );

  // 2. No match message
  assert.ok(
    filteredCounsellorsContent.includes(
      "No counsellors match all your preferences right now. Please widen your availability or preferences, or contact help@vanquishtherapies.co.uk."
    ),
    "Must display exact no match message"
  );

  // 3. Send 'No preference' when a preference is empty
  assert.ok(
    filteredCounsellorsContent.includes("gender_preference: formData.genderPreference || \"No preference\""),
    "Must send 'No preference' when genderPreference is empty"
  );
  assert.ok(
    !filteredCounsellorsContent.includes("gender_preference: formData.genderPreference || \"Female\""),
    "Must not send 'Female' as fallback for empty gender preference"
  );
  assert.ok(
    filteredCounsellorsContent.includes("return \"No preference\";"),
    "clientPreferenceSummary must return 'No preference' when gender preference is not set"
  );

  // 4. Hide empty fields and do not invent profile data
  assert.ok(
    !filteredCounsellorsContent.includes('modality: c.modality || "Integrative Therapy"'),
    "Must not fall back to 'Integrative Therapy' for empty modality"
  );
  assert.ok(
    !filteredCounsellorsContent.includes('["Trauma", "Anxiety", "Depression", "Relationships"]'),
    "Must not invent hardcoded sample list for topics_with_experience"
  );
  assert.match(
    filteredCounsellorsContent,
    /\{counsellor\.bio\s*&&\s*\(/,
    "Must conditionally render counsellor bio only when present"
  );
  assert.match(
    filteredCounsellorsContent,
    /\{counsellor\.modality\s*&&\s*\(/,
    "Must conditionally render counsellor modality only when present"
  );
  assert.match(
    filteredCounsellorsContent,
    /\{counsellor\.specialty\s*&&\s*\(/,
    "Must conditionally render counsellor specialty only when present"
  );
  assert.match(
    filteredCounsellorsContent,
    /\{Array\.isArray\(counsellor\.topics_with_experience\)\s*&&\s*counsellor\.topics_with_experience\.length\s*>\s*0\s*&&\s*\(/,
    "Must conditionally render topics_with_experience only when non-empty array"
  );
});
