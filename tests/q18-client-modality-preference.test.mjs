import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q18: Client modality preference with 'Unsure'", () => {
  const midRangePage = fs.readFileSync(
    path.join(rootDir, "app/mid-range-intake/page.jsx"),
    "utf8"
  );
  const filteredCounsellors = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );

  // 1. On the Counsellor preferences step, ask: "Which therapeutic approaches or modalities would you prefer to work with?"
  assert.ok(
    midRangePage.includes(
      "Which therapeutic approaches or modalities would you prefer to work with?"
    ),
    "Must ask the exact modality preference question on Step 7"
  );

  // Uses shared list from Q07 plus "Unsure"
  assert.ok(
    midRangePage.includes("MODALITY_OPTIONS") &&
      midRangePage.includes('from "@/lib/constants/modalities"'),
    "Must import MODALITY_OPTIONS from shared modalities constants"
  );
  assert.ok(
    midRangePage.includes('<option value="Unsure">Unsure</option>'),
    "Must include 'Unsure' option"
  );

  // Default is 'Unsure'
  assert.ok(
    midRangePage.includes('modalityPreference: "Unsure"'),
    "Default modalityPreference must be 'Unsure'"
  );

  // 2. Sent to /mid-range-intake/filtered-counsellors
  assert.ok(
    filteredCounsellors.includes("modality_preference:"),
    "FilteredCounsellors must send modality_preference in payload"
  );

  // 3. "Unsure": lists each counsellor's modalities on their card
  assert.ok(
    filteredCounsellors.includes("counsellor.modality"),
    "FilteredCounsellors must list counsellor.modality on counsellor cards"
  );

  // 4. Show "Modality" under preferences matched only when the client chose one (not when Unsure)
  assert.ok(
    filteredCounsellors.includes("unsure"),
    "clientModality must filter out 'unsure' so Modality is hidden when Unsure is selected"
  );
  assert.ok(
    filteredCounsellors.includes("{clientModality &&"),
    "Modality criteria block must be guarded by clientModality"
  );

  // 6. "Other (not listed above)" must NOT be offered to clients on Mid Range form
  assert.ok(
    midRangePage.includes('modality !== "Other (not listed above)"'),
    "Must filter out 'Other (not listed above)' from client modality options on Mid Range form"
  );

  // 7. Admin client-details and clients/edit include modality preference
  const clientDetailsPage = fs.readFileSync(
    path.join(rootDir, "app/dashboard/client-details/[uuid]/page.jsx"),
    "utf8"
  );
  assert.ok(
    clientDetailsPage.includes("Modality Preference"),
    "client-details must display Modality Preference"
  );
  assert.ok(
    clientDetailsPage.includes("modality_preference: preferencesForm.modalityPreference"),
    "client-details must save modality_preference"
  );

  const clientEditPage = fs.readFileSync(
    path.join(rootDir, "app/dashboard/clients/edit/page.jsx"),
    "utf8"
  );
  assert.ok(
    clientEditPage.includes("Modality Preference"),
    "clients/edit must display Modality Preference"
  );
  assert.ok(
    clientEditPage.includes("modality_preference: formData.modalityPreference"),
    "clients/edit must save modality_preference"
  );
});

