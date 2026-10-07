import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("Q07: One modality list defined in lib/constants/modalities.js with Integrative Therapy only once", async () => {
  const modalitiesFilePath = path.join(rootDir, "lib/constants/modalities.js");
  assert.ok(fs.existsSync(modalitiesFilePath), "lib/constants/modalities.js must exist");

  const modalitiesModule = await import(`file://${modalitiesFilePath}`);
  const { MODALITY_OPTIONS, MODALITY_SELECT_OPTIONS } = modalitiesModule;

  assert.ok(Array.isArray(MODALITY_OPTIONS), "MODALITY_OPTIONS must be an array");
  
  // Check "Integrative Therapy" is present exactly once
  const countIntegrativeTherapy = MODALITY_OPTIONS.filter((m) => m === "Integrative Therapy").length;
  assert.equal(countIntegrativeTherapy, 1, "'Integrative Therapy' must be in MODALITY_OPTIONS exactly once");

  // Check bare "Integrative" is NOT in MODALITY_OPTIONS
  const countIntegrative = MODALITY_OPTIONS.filter((m) => m === "Integrative").length;
  assert.equal(countIntegrative, 0, "Bare 'Integrative' must not be in MODALITY_OPTIONS");

  // Check no duplicates in MODALITY_OPTIONS
  const uniqueModalities = new Set(MODALITY_OPTIONS);
  assert.equal(uniqueModalities.size, MODALITY_OPTIONS.length, "MODALITY_OPTIONS must contain no duplicates");

  // Check MODALITY_SELECT_OPTIONS has matching entries
  assert.ok(Array.isArray(MODALITY_SELECT_OPTIONS), "MODALITY_SELECT_OPTIONS must be an array");
  assert.equal(MODALITY_SELECT_OPTIONS.length, MODALITY_OPTIONS.length);

  // Check forms import from @/lib/constants or lib/constants
  const targetFiles = [
    "app/qualified-counsellor-form/page.jsx",
    "app/clform/page.jsx",
    "app/tcform/page.jsx",
    "app/counsellor/page.jsx",
  ];

  for (const relativePath of targetFiles) {
    const filePath = path.join(rootDir, relativePath);
    const content = fs.readFileSync(filePath, "utf8");

    // Must import MODALITY_OPTIONS
    assert.ok(
      content.includes("MODALITY_OPTIONS"),
      `${relativePath} must use MODALITY_OPTIONS`
    );

    // Must NOT define inline MODALITY_OPTIONS array
    assert.ok(
      !content.includes("const MODALITY_OPTIONS = [") && !content.includes("const MODALITY_OPTIONS = ["),
      `${relativePath} must not define an inline MODALITY_OPTIONS array`
    );
  }
});
