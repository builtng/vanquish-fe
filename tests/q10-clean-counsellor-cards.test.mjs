import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q10: Clean up counsellor cards on Mid Range and Coaching forms", () => {
  const fileContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );

  // 1. None of the removed strings/sections should be present in card/modal rendering
  assert.ok(
    !fileContent.includes("Online (Video) or In-Person"),
    "Must not contain 'Online (Video) or In-Person'"
  );
  assert.ok(
    !fileContent.includes("Insurance:"),
    "Must not contain 'Insurance:' block"
  );
  assert.ok(
    !fileContent.includes("Education & Credentials"),
    "Must not contain 'Education & Credentials' section"
  );

  // 2. qualification_title and formatYearsOfExperience should no longer be rendered under counsellor names
  assert.ok(
    !fileContent.includes("counsellor.qualification_title"),
    "Must not render qualification_title under counsellor name"
  );
  assert.ok(
    !fileContent.includes("formatYearsOfExperience("),
    "Must not render formatYearsOfExperience under counsellor name"
  );

  // 3. Name, photo, modality, bio, fit label/score must remain
  assert.ok(
    fileContent.includes("counsellor.name") || fileContent.includes("counsellor.photo_url"),
    "Must retain counsellor name and photo"
  );
  assert.ok(
    fileContent.includes("counsellor.modality"),
    "Must retain counsellor modality"
  );
  assert.ok(
    fileContent.includes("counsellor.bio"),
    "Must retain counsellor bio"
  );
});
