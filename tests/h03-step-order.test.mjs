import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX H03: Mid Range and Coaching step order", async (t) => {
  const pagePath = path.join(rootDir, "app/mid-range-intake/page.jsx");
  assert.ok(fs.existsSync(pagePath), "mid-range-intake/page.jsx must exist");

  const fileContent = fs.readFileSync(pagePath, "utf8");

  await t.test("1. Step titles render in the exact required order", () => {
    const expectedStepTitles = [
      "Service information",
      "Personal",
      "About you",
      "Support",
      "Counsellor preferences",
      "Referral",
      "Assessment",
      "Availability",
      "Filtered counsellors",
      "Consultation",
      "Emergency",
      "Payment",
    ];

    // Find the steps array in the file
    const stepsMatch = fileContent.match(/const\s+steps\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(stepsMatch, "steps array must be defined in mid-range-intake/page.jsx");

    const stepsBlock = stepsMatch[1];
    const titleMatches = [...stepsBlock.matchAll(/title:\s*["']([^"']+)["']/g)].map(
      (m) => m[1]
    );

    assert.equal(
      titleMatches.length,
      expectedStepTitles.length,
      `Expected ${expectedStepTitles.length} steps, got ${titleMatches.length}`
    );

    assert.deepEqual(
      titleMatches,
      expectedStepTitles,
      `Step titles must match exact order: ${expectedStepTitles.join(", ")}`
    );
  });

  await t.test("2. No two steps share a name (no duplicate step titles, no second 'Service' step)", () => {
    const stepsMatch = fileContent.match(/const\s+steps\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(stepsMatch);
    const titleMatches = [...stepsMatch[1].matchAll(/title:\s*["']([^"']+)["']/g)].map(
      (m) => m[1]
    );

    const uniqueTitles = new Set(titleMatches);
    assert.equal(
      uniqueTitles.size,
      titleMatches.length,
      "Every step title must be unique"
    );

    assert.ok(
      !titleMatches.includes("Service"),
      "There should be no step titled simply 'Service' (replaced by 'Service information')"
    );
  });

  await t.test("3. Counsellor preferences comes before Availability", () => {
    const stepsMatch = fileContent.match(/const\s+steps\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(stepsMatch);
    const titleMatches = [...stepsMatch[1].matchAll(/title:\s*["']([^"']+)["']/g)].map(
      (m) => m[1]
    );

    const prefIndex = titleMatches.indexOf("Counsellor preferences");
    const availIndex = titleMatches.indexOf("Availability");

    assert.ok(prefIndex !== -1, "Counsellor preferences step must exist");
    assert.ok(availIndex !== -1, "Availability step must exist");
    assert.ok(
      prefIndex < availIndex,
      `Counsellor preferences (index ${prefIndex}) must come before Availability (index ${availIndex})`
    );
  });

  await t.test("4. Each step's validation aligns with its fields in validateStep", () => {
    // Validate that validateStep defines cases 1 through 12
    const validateStepMatch = fileContent.match(/const\s+validateStep\s*=\s*\(([\s\S]*?)switch\s*\(\w+\)\s*\{([\s\S]*?)\n\s*return\s+stepErrors;/);
    assert.ok(validateStepMatch, "validateStep function must exist");

    const switchBody = validateStepMatch[2];

    // Step 4 (Support) must validate support areas AND merged medical & disability fields
    const case4Match = switchBody.match(/case\s+4:([\s\S]*?)(?=case\s+5:)/);
    assert.ok(case4Match, "case 4 must exist in validateStep");
    const case4Content = case4Match[1];
    assert.ok(case4Content.includes("supportAreas"), "case 4 must validate supportAreas");
    assert.ok(case4Content.includes("concernsDetails"), "case 4 must validate concernsDetails");
    assert.ok(case4Content.includes("onMedication"), "case 4 must validate onMedication");
    assert.ok(case4Content.includes("disabilities"), "case 4 must validate disabilities");

    // Step 8 (Availability) must validate availability
    const case8Match = switchBody.match(/case\s+8:([\s\S]*?)(?=case\s+9:)/);
    assert.ok(case8Match, "case 8 must exist in validateStep");
    const case8Content = case8Match[1];
    assert.ok(case8Content.includes("availability"), "case 8 must validate availability");

    // Step 9 (Filtered counsellors) must validate consultationWithTcUuid
    const case9Match = switchBody.match(/case\s+9:([\s\S]*?)(?=case\s+10:)/);
    assert.ok(case9Match, "case 9 must exist in validateStep");
    const case9Content = case9Match[1];
    assert.ok(case9Content.includes("consultationWithTcUuid"), "case 9 must validate consultationWithTcUuid");

    // Step 10 (Consultation) must validate consultationSlotId
    const case10Match = switchBody.match(/case\s+10:([\s\S]*?)(?=case\s+11:)/);
    assert.ok(case10Match, "case 10 must exist in validateStep");
    const case10Content = case10Match[1];
    assert.ok(case10Content.includes("consultationSlotId"), "case 10 must validate consultationSlotId");
  });

  await t.test("5. JSX step renders appear in exact sequential order (1 to 12)", () => {
    const stepRenderMatches = [...fileContent.matchAll(/currentStep\s*===\s*(\d+)\s*&&/g)].map(
      (m) => parseInt(m[1], 10)
    );

    const expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    assert.deepEqual(
      stepRenderMatches,
      expectedOrder,
      `JSX step blocks must render in sequence 1 through 12: got ${stepRenderMatches.join(", ")}`
    );
  });
});
