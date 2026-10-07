import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

describe("FIX Q04: 'Previously worked with Vanquish' follow-up tests", () => {
  const fileContent = fs.readFileSync(
    new URL("../app/qualified-counsellor-form/page.jsx", import.meta.url),
    "utf8"
  );

  it("1. Renders the exact required follow-up label when previousVanquishWork is Yes", () => {
    const requiredLabel =
      "Please specify the role and capacity in which you previously worked with Vanquish Therapies. If you completed a placement with us, please explain which areas you feel you would need to further develop or improve in order to transition into a Qualified Counsellor role within the Practice, and how you would work towards these areas of development.";

    assert.ok(
      fileContent.includes(requiredLabel),
      "Form must include the exact follow-up label specified in Q04"
    );

    // Follow-up textarea must only render when previousVanquishWork === 'Yes'
    assert.match(
      fileContent,
      /formData\.previousVanquishWork\s*===\s*["']Yes["']\s*&&\s*\(/,
      "Follow-up textarea must conditionally render only when previousVanquishWork === 'Yes'"
    );

    assert.ok(
      fileContent.includes('name="areasToImprove"'),
      "Follow-up textarea must be bound to areasToImprove"
    );
  });

  it("2. Blocks moving to Next when Yes is selected and areasToImprove is empty", () => {
    // Check validation logic in validateStep
    assert.match(
      fileContent,
      /formData\.previousVanquishWork\s*===\s*["']Yes["']\s*&&\s*!formData\.areasToImprove\?\.trim\(\)/,
      "validateStep must check that areasToImprove is non-empty when previousVanquishWork is Yes"
    );
  });

  it("3. Hides follow-up, clears areasToImprove, and does not block Next when No is selected", () => {
    // When previousVanquishWork changes away from 'Yes', areasToImprove must be cleared
    assert.match(
      fileContent,
      /if\s*\(\s*field\s*===\s*["']previousVanquishWork["']\s*&&\s*value\s*!==\s*["']Yes["']\s*\)\s*\{\s*updated\.areasToImprove\s*=\s*["']["'];/,
      "handleInputChange must clear areasToImprove when previousVanquishWork is not Yes"
    );
  });

  it("4. Submits real areas_to_improve when Yes, and sends nothing when No (no hard-coded 'N/A')", () => {
    // Must NOT contain hard-coded 'areas_to_improve: formData.areasToImprove || "N/A"'
    assert.doesNotMatch(
      fileContent,
      /areas_to_improve:\s*formData\.areasToImprove\s*\|\|\s*["']N\/A["']/,
      "Must remove the hard-coded 'N/A' fallback"
    );

    // When Yes, submit real value; when No, send nothing (omitted from payload)
    assert.match(
      fileContent,
      /\.\.\.\(formData\.previousVanquishWork\s*===\s*["']Yes["']\s*&&\s*formData\.areasToImprove\?\.trim\(\)\s*\?\s*\{\s*areas_to_improve:\s*formData\.areasToImprove\.trim\(\)\s*\}\s*:\s*\{\}\)/,
      "submitData must include areas_to_improve only when Yes, and omit it when No"
    );
  });

  it("5. Counselling-related education and training details is NOT used as the follow-up", () => {
    const trainingDetailsPrompt =
      "Please provide details of all counselling-related education, qualifications, training, and professional experience.";

    assert.ok(
      fileContent.includes(trainingDetailsPrompt),
      "General counselling training details prompt must still exist independently"
    );

    // It must remain bound to counsellorTrainingDetails, not areasToImprove
    assert.ok(
      fileContent.includes('name="counsellorTrainingDetails"'),
      "General counselling training details must be bound to counsellorTrainingDetails"
    );
  });

  it("6. Admin View screen displays 'previously worked with Vanquish' answer and follow-up text", () => {
    const adminPageContent = fs.readFileSync(
      new URL("../app/dashboard/qualified-applications/page.jsx", import.meta.url),
      "utf8"
    );
    const adminDetailPageContent = fs.readFileSync(
      new URL("../app/dashboard/qualified-applications/[id]/page.jsx", import.meta.url),
      "utf8"
    );

    // Detail modal in list page
    assert.ok(
      adminPageContent.includes("Previously Worked With Vanquish"),
      "Admin detail modal must display 'Previously Worked With Vanquish'"
    );
    assert.ok(
      adminPageContent.includes("selectedApp.areas_to_improve || selectedApp.answers?.areas_to_improve"),
      "Admin detail modal must display follow-up areas_to_improve"
    );

    // Dedicated [id] page
    assert.ok(
      adminDetailPageContent.includes("Previously Worked With Vanquish"),
      "Admin [id] page must display 'Previously Worked With Vanquish'"
    );
    assert.ok(
      adminDetailPageContent.includes("areasToImprove"),
      "Admin [id] page must display follow-up areasToImprove"
    );
  });
});

