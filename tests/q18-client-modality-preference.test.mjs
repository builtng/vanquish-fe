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

  // 5. Recalculate list when client goes back and changes answers
  assert.ok(
    filteredCounsellors.includes("formData.modalityPreference"),
    "useEffect dependencies must include formData.modalityPreference for re-fetching"
  );
});
