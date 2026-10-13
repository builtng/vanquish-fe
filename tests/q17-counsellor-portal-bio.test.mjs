import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q17: Bio in the qualified counsellor portal", () => {
  const profilePage = fs.readFileSync(
    path.join(rootDir, "app/counsellor-portal/profile/page.jsx"),
    "utf8"
  );
  const apiFile = fs.readFileSync(
    path.join(rootDir, "lib/api.js"),
    "utf8"
  );
  const filteredCounsellors = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );

  // 1. Add a "Bio" box to the counsellor portal profile for qualified counsellors
  assert.ok(
    profilePage.includes('tcData?.counsellor_type === "Qualified"') ||
    profilePage.includes("tcData?.counsellor_type === 'Qualified'"),
    "Bio box must be conditionally rendered only for Qualified counsellors"
  );

  // 2. Plain text, maximum 1,200 characters, with a live character count
  assert.ok(
    profilePage.includes("maxLength={1200}") || profilePage.includes('maxLength="1200"'),
    "Bio textarea must have maximum 1,200 characters"
  );
  assert.ok(
    profilePage.includes("1,200 characters") || profilePage.includes("1200 characters") || profilePage.includes("1,200"),
    "Bio box must display live character count against 1,200 limit"
  );
  assert.ok(
    profilePage.includes("bio.length"),
    "Bio box must display live character count based on bio.length"
  );

  // 3. Trainee counsellors do not see it
  // Ensure the section is wrapped in the Qualified counsellor guard
  const bioSectionRegex = /tcData\?\.counsellor_type === ["']Qualified["'][\s\S]*?counsellor-bio/;
  assert.ok(
    bioSectionRegex.test(profilePage),
    "Bio input must only be rendered within Qualified counsellor guard so trainees do not see it"
  );

  // 4. API method saves to backend counsellor bio endpoint
  assert.ok(
    apiFile.includes("updateCounsellorBio(bio)"),
    "apiService must provide updateCounsellorBio method"
  );
  assert.ok(
    apiFile.includes('"/counsellor/bio"') || apiFile.includes("'/counsellor/bio'"),
    "updateCounsellorBio must send PUT request to /counsellor/bio"
  );

  // 5. It shows on the counsellor's card on the client form
  assert.ok(
    filteredCounsellors.includes("counsellor.bio"),
    "FilteredCounsellors must render counsellor.bio on counsellor cards"
  );
});
