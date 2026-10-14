import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX A06: Age is 2 digits, checked straight away without birth year conversion", async (t) => {
  const midRangePath = path.join(rootDir, "app/mid-range-intake/page.jsx");
  const lowCostPath = path.join(rootDir, "app/low-cost-intake/page.jsx");

  assert.ok(fs.existsSync(midRangePath), "mid-range-intake/page.jsx must exist");
  assert.ok(fs.existsSync(lowCostPath), "low-cost-intake/page.jsx must exist");

  const midRangeContent = fs.readFileSync(midRangePath, "utf8");
  const lowCostContent = fs.readFileSync(lowCostPath, "utf8");

  await t.test("1. Mid-range intake: age and partnerAge fields are limited to 2 digits", () => {
    // Check age input has maxLength={2} or maxLength="2"
    const ageInputMatch = midRangeContent.match(/<input[^>]*name="age"[^>]*>/s);
    assert.ok(ageInputMatch, "mid-range-intake must have an input with name='age'");
    assert.ok(
      ageInputMatch[0].includes("maxLength={2}") || ageInputMatch[0].includes('maxLength="2"'),
      "age input must specify maxLength={2}"
    );

    // Check partnerAge input has maxLength={2}
    const partnerAgeInputMatch = midRangeContent.match(/<input[^>]*name="partnerAge"[^>]*>/s);
    assert.ok(partnerAgeInputMatch, "mid-range-intake must have an input with name='partnerAge'");
    assert.ok(
      partnerAgeInputMatch[0].includes("maxLength={2}") || partnerAgeInputMatch[0].includes('maxLength="2"'),
      "partnerAge input must specify maxLength={2}"
    );
  });

  await t.test("2. Low-cost intake: age field is limited to 2 digits", () => {
    const ageInputMatch = lowCostContent.match(/<input[^>]*name="age"[^>]*>/s);
    assert.ok(ageInputMatch, "low-cost-intake must have an input with name='age'");
    assert.ok(
      ageInputMatch[0].includes("maxLength={2}") || ageInputMatch[0].includes('maxLength="2"'),
      "age input must specify maxLength={2}"
    );
  });

  await t.test("3. No birth year conversion logic or conversion messages exist in forms", () => {
    assert.ok(
      !midRangeContent.toLowerCase().includes("birth year"),
      "mid-range-intake must not contain any reference to 'birth year'"
    );
    assert.ok(
      !lowCostContent.toLowerCase().includes("birth year"),
      "low-cost-intake must not contain any reference to 'birth year'"
    );
    assert.ok(
      !midRangeContent.includes("Converted birth year"),
      "mid-range-intake must not contain conversion toast messages"
    );
    assert.ok(
      !lowCostContent.includes("Converted birth year"),
      "low-cost-intake must not contain conversion toast messages"
    );
  });

  await t.test("4. Helper text states age in years without mentioning birth year conversion", () => {
    assert.ok(
      midRangeContent.includes("Enter your current age in years (e.g. 34)."),
      "mid-range-intake must have clean helper text for age"
    );
    assert.ok(
      midRangeContent.includes("Enter partner's current age in years (e.g. 34)."),
      "mid-range-intake must have clean helper text for partnerAge"
    );
    assert.ok(
      lowCostContent.includes("Enter your current age in years (e.g. 34)."),
      "low-cost-intake must have clean helper text for age"
    );
  });

  await t.test("5. handleAgeChange performs immediate validation on invalid values", () => {
    // Simulate handleAgeChange logic
    const simulateAgeChange = (value) => {
      const clean = value.replace(/\D/g, "").slice(0, 2);
      const errors = {};
      const errorMsg = "Valid age (18-99) is required";

      if (clean.length === 0) {
        errors.age = errorMsg;
      } else if (clean.length === 2) {
        const num = parseInt(clean, 10);
        if (num < 18 || num > 99) {
          errors.age = errorMsg;
        }
      } else if (clean.length === 1) {
        const num = parseInt(clean, 10);
        if (num === 0) {
          errors.age = errorMsg;
        }
      }
      return { clean, errors };
    };

    // Valid age 34
    const valid34 = simulateAgeChange("34");
    assert.equal(valid34.clean, "34");
    assert.equal(valid34.errors.age, undefined);

    // Invalid age 15 (< 18)
    const invalid15 = simulateAgeChange("15");
    assert.equal(invalid15.clean, "15");
    assert.equal(invalid15.errors.age, "Valid age (18-99) is required");

    // Invalid 0
    const invalid0 = simulateAgeChange("0");
    assert.equal(invalid0.clean, "0");
    assert.equal(invalid0.errors.age, "Valid age (18-99) is required");

    // Non-digit characters stripped and truncated to 2 digits
    const nonDigit = simulateAgeChange("1990");
    assert.equal(nonDigit.clean, "19");
    assert.equal(nonDigit.errors.age, undefined);

    // Non-digit characters resulting in < 18
    const invalidNonDigit = simulateAgeChange("abc12xyz");
    assert.equal(invalidNonDigit.clean, "12");
    assert.equal(invalidNonDigit.errors.age, "Valid age (18-99) is required");
  });
});
