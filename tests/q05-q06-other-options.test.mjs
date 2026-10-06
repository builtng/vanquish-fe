import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

describe("FIX Q05 & Q06: 'Other' text boxes on the QC form", () => {
  const qcFormContent = fs.readFileSync(
    new URL("../app/qualified-counsellor-form/page.jsx", import.meta.url),
    "utf8"
  );
  const otherOptionContent = fs.readFileSync(
    new URL("../components/OtherOption.jsx", import.meta.url),
    "utf8"
  );
  const adminPageContent = fs.readFileSync(
    new URL("../app/dashboard/qualified-applications/page.jsx", import.meta.url),
    "utf8"
  );

  it("1. OtherOption reusable component exists and handles conditional rendering & labels", () => {
    assert.match(
      otherOptionContent,
      /export\s+default\s+function\s+OtherOption/,
      "OtherOption component must have a default export"
    );
    assert.match(
      otherOptionContent,
      /if\s*\(!isTicked\)\s*return\s+null/,
      "OtherOption must hide completely (return null) when unticked"
    );
    assert.ok(
      otherOptionContent.includes("{label}"),
      "OtherOption must render the provided label"
    );
    assert.ok(
      otherOptionContent.includes("text-red-500"),
      "OtherOption must render required indicator / error in red"
    );
  });

  it("2. Q05: Shows required text box with exact label when 'Other (not listed above)' is ticked in areas of support", () => {
    const q05ExactLabel =
      "Other areas of support you have experience with (not listed above)";

    assert.ok(
      qcFormContent.includes(q05ExactLabel),
      `QC form must include exact label: "${q05ExactLabel}"`
    );

    // Reuses OtherOption for experienceAreas
    assert.match(
      qcFormContent,
      /formData\.experienceAreas\.includes\(["']Other \(not listed above\)["']\)/,
      "Experience areas OtherOption must be controlled by whether 'Other (not listed above)' is in experienceAreas"
    );
    assert.ok(
      qcFormContent.includes('name="otherExperienceAreas"'),
      "Experience areas OtherOption must be bound to otherExperienceAreas"
    );
  });

  it("3. Q05: Blocks Next when Other areas of support is ticked but empty; unticking clears it", () => {
    // Validation check in validateStep
    assert.match(
      qcFormContent,
      /formData\.experienceAreas\.includes\(["']Other \(not listed above\)["']\)\s*&&\s*!formData\.otherExperienceAreas\?\.trim\(\)/,
      "validateStep must check that otherExperienceAreas is filled when 'Other (not listed above)' is ticked"
    );

    // Clearing on untick in handleArrayToggle
    assert.match(
      qcFormContent,
      /updated\.otherExperienceAreas\s*=\s*["']["']/,
      "handleArrayToggle must clear otherExperienceAreas when 'Other (not listed above)' is unticked"
    );
  });

  it("4. Q06: Shows required box with exact label when 'Other (not listed above)' is ticked in modalities", () => {
    const q06ExactLabel =
      "For any modalities/therapeutic approaches not listed above, please specify below";

    assert.ok(
      qcFormContent.includes(q06ExactLabel),
      `QC form must include exact label: "${q06ExactLabel}"`
    );

    // Reuses OtherOption for modalities
    assert.match(
      qcFormContent,
      /formData\.modalities\.includes\(["']Other \(not listed above\)["']\)/,
      "Modalities OtherOption must be controlled by whether 'Other (not listed above)' is in modalities"
    );
    assert.ok(
      qcFormContent.includes('name="otherModalities"'),
      "Modalities OtherOption must be bound to otherModalities"
    );
  });

  it("5. Q06: Blocks Next when Other modalities is ticked but empty; unticking clears it", () => {
    // Validation check in validateStep
    assert.match(
      qcFormContent,
      /formData\.modalities\.includes\(["']Other \(not listed above\)["']\)\s*&&\s*!formData\.otherModalities\?\.trim\(\)/,
      "validateStep must check that otherModalities is filled when 'Other (not listed above)' is ticked"
    );

    // Clearing on untick in handleArrayToggle
    assert.match(
      qcFormContent,
      /updated\.otherModalities\s*=\s*["']["']/,
      "handleArrayToggle must clear otherModalities when 'Other (not listed above)' is unticked"
    );
  });

  it("6. Submissions include other_modalities and other_experience_areas only when ticked", () => {
    assert.match(
      qcFormContent,
      /\.\.\.\(formData\.modalities\.includes\(["']Other \(not listed above\)["']\)\s*&&\s*formData\.otherModalities\?\.trim\(\)\s*\?\s*\{\s*other_modalities:\s*formData\.otherModalities\.trim\(\)\s*\}\s*:\s*\{\}\)/,
      "submitData must include other_modalities only when 'Other (not listed above)' is ticked, sending nothing when unticked"
    );
    assert.match(
      qcFormContent,
      /\.\.\.\(formData\.experienceAreas\.includes\(["']Other \(not listed above\)["']\)\s*&&\s*formData\.otherExperienceAreas\?\.trim\(\)\s*\?\s*\{\s*other_experience_areas:\s*formData\.otherExperienceAreas\.trim\(\)\s*\}\s*:\s*\{\}\)/,
      "submitData must include other_experience_areas only when 'Other (not listed above)' is ticked, sending nothing when unticked"
    );
  });

  it("7. Admin qualified applications displays other modalities and other support areas", () => {
    assert.match(
      adminPageContent,
      /selectedApp\.other_modalities\s*\|\|\s*selectedApp\.answers\?\.other_modalities/,
      "Admin detail modal must display other modalities if present"
    );
    assert.match(
      adminPageContent,
      /selectedApp\.other_experience_areas\s*\|\|\s*selectedApp\.answers\?\.other_experience_areas/,
      "Admin detail modal must display other experience areas if present"
    );
  });
});
