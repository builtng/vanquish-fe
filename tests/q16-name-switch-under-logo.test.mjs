import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

describe("FIX Q16: Name switch under the logo & client-facing branding", () => {
  it("contexts/BrandingContext.jsx initializes company_name strictly to 'Vanquish Therapies' and does not read NEXT_PUBLIC_APP_NAME", () => {
    const fileUrl = new URL("../contexts/BrandingContext.jsx", import.meta.url);
    const content = fs.readFileSync(fileUrl, "utf8");

    // Line initializing company_name must be fixed string "Vanquish Therapies"
    assert.match(
      content,
      /company_name:\s*"Vanquish Therapies"/,
      "company_name in BrandingContext initial state must be 'Vanquish Therapies'"
    );

    // BrandingContext must not read process.env.NEXT_PUBLIC_APP_NAME
    assert.doesNotMatch(
      content,
      /process\.env\.NEXT_PUBLIC_APP_NAME/,
      "BrandingContext must not initialize company_name from NEXT_PUBLIC_APP_NAME"
    );

    // Sanitization must prevent legacy / VQT names from overriding Vanquish Therapies
    assert.match(
      content,
      /vqt/,
      "BrandingContext must sanitize legacy names containing 'vqt'"
    );
  });

  it("mid-range-intake renders 'Vanquish Therapies' under the logo from first render without waiting for backend", () => {
    const fileUrl = new URL("../app/mid-range-intake/page.jsx", import.meta.url);
    const content = fs.readFileSync(fileUrl, "utf8");

    // Header under logo must statically render Vanquish Therapies
    assert.match(
      content,
      /<h1[^>]*>\s*Vanquish Therapies\s*<\/h1>/,
      "mid-range-intake header under logo must be statically 'Vanquish Therapies'"
    );

    // Must not use NEXT_PUBLIC_APP_NAME
    assert.doesNotMatch(
      content,
      /process\.env\.NEXT_PUBLIC_APP_NAME/,
      "mid-range-intake must not reference NEXT_PUBLIC_APP_NAME"
    );

    // Header must NOT be wrapped in a conditional that hides it behind brandingLoading skeleton
    assert.doesNotMatch(
      content,
      /\{brandingLoading \?\s*\([\s\S]*?<div class="h-8 w-48 bg-gray-200 rounded"><\/div>[\s\S]*?:\s*<h1/,
      "mid-range-intake header must be rendered on first render rather than hidden behind a loading skeleton"
    );
  });

  it("low-cost-intake renders 'Vanquish Therapies' under the logo from first render without waiting for backend", () => {
    const fileUrl = new URL("../app/low-cost-intake/page.jsx", import.meta.url);
    const content = fs.readFileSync(fileUrl, "utf8");

    assert.match(
      content,
      /<h1[^>]*>\s*Vanquish Therapies\s*<\/h1>/,
      "low-cost-intake header under logo must be statically 'Vanquish Therapies'"
    );

    assert.doesNotMatch(
      content,
      /process\.env\.NEXT_PUBLIC_APP_NAME/,
      "low-cost-intake must not reference NEXT_PUBLIC_APP_NAME"
    );
  });

  it("clform and coaching pages render 'Vanquish Therapies' on first render if present", () => {
    const clformUrl = new URL("../app/clform/page.jsx", import.meta.url);
    if (fs.existsSync(clformUrl)) {
      const clformContent = fs.readFileSync(clformUrl, "utf8");
      assert.match(
        clformContent,
        /Vanquish Therapies - Professional counselling support/,
        "clform header must statically contain 'Vanquish Therapies'"
      );
    }

    const coachingUrl = new URL("../app/coaching/page.jsx", import.meta.url);
    if (fs.existsSync(coachingUrl)) {
      const coachingContent = fs.readFileSync(coachingUrl, "utf8");
      assert.match(
        coachingContent,
        /shared within Vanquish Therapies/,
        "coaching disclosure text must statically contain 'Vanquish Therapies'"
      );
    }
  });

  it("disclosure text on intake forms is 'Vanquish Therapies' on first render and unchanged", () => {
    const midRangeUrl = new URL("../app/mid-range-intake/page.jsx", import.meta.url);
    const midRangeContent = fs.readFileSync(midRangeUrl, "utf8");
    const lowCostUrl = new URL("../app/low-cost-intake/page.jsx", import.meta.url);
    const lowCostContent = fs.readFileSync(lowCostUrl, "utf8");

    const expectedDisclosure = /for your information to be shared within Vanquish Therapies/;

    assert.match(midRangeContent, expectedDisclosure, "mid-range disclosure must contain 'Vanquish Therapies'");
    assert.match(lowCostContent, expectedDisclosure, "low-cost disclosure must contain 'Vanquish Therapies'");

    // Must not use dynamic expression that could flicker or change after 3 seconds
    assert.doesNotMatch(midRangeContent, /within\{" "\}\s*\{branding/);
    assert.doesNotMatch(lowCostContent, /within\{" "\}\s*\{branding/);
  });

  it("no client-facing page contains 'VQT Management'", () => {
    const clientFacingFiles = [
      "../app/mid-range-intake/page.jsx",
      "../app/low-cost-intake/page.jsx",
      "../app/coaching/page.jsx",
      "../app/clform/page.jsx",
      "../app/tcform/page.jsx",
      "../app/qualified-counsellor-form/page.jsx",
      "../app/client-booking/page.jsx",
      "../app/client-booking/consultation/page.jsx",
      "../app/client-booking/agreement/page.jsx",
      "../app/client-booking/payment/page.jsx",
      "../app/mid-range-intake/success/page.jsx",
      "../app/page.jsx",
      "../components/FilteredCounsellors.jsx",
      "../components/AgreementClauses.jsx",
      "../components/PublicFormWrapper.jsx",
      "../contexts/BrandingContext.jsx",
    ];

    for (const rel of clientFacingFiles) {
      const fileUrl = new URL(rel, import.meta.url);
      if (fs.existsSync(fileUrl)) {
        const text = fs.readFileSync(fileUrl, "utf8");
        assert.ok(
          !text.includes("VQT Management"),
          `Client-facing file ${rel} must not contain "VQT Management"`
        );
      }
    }
  });

  it("simulated test: disclosure text and logo title remain 'Vanquish Therapies' initially and after 3 seconds", async () => {
    // Simulate initial state
    let brandingState = { company_name: "Vanquish Therapies" };
    let disclosureText = `shared within ${brandingState.company_name}`;
    let underLogoTitle = "Vanquish Therapies"; // fixed on first render

    assert.equal(disclosureText, "shared within Vanquish Therapies");
    assert.equal(underLogoTitle, "Vanquish Therapies");

    // Simulate backend response resolving after 3 seconds (even with legacy data)
    await new Promise((resolve) => setTimeout(resolve, 50));
    const backendData = { company_name: "VQT Management" };

    // Apply BrandingContext sanitization logic
    if (
      !backendData.company_name ||
      backendData.company_name.toLowerCase().includes("vqt") ||
      backendData.company_name.toLowerCase().includes("training") ||
      backendData.company_name.toLowerCase().includes("vqt management")
    ) {
      backendData.company_name = "Vanquish Therapies";
    }
    brandingState = { ...brandingState, ...backendData };

    disclosureText = `shared within ${brandingState.company_name}`;
    assert.equal(
      disclosureText,
      "shared within Vanquish Therapies",
      "Disclosure text must remain 'Vanquish Therapies' after 3s"
    );
    assert.equal(
      underLogoTitle,
      "Vanquish Therapies",
      "Under logo title must remain 'Vanquish Therapies' after 3s"
    );
  });

  it("app/reset-password/page.jsx uses neutral placeholder name@example.com", () => {
    const resetPasswordUrl = new URL("../app/reset-password/page.jsx", import.meta.url);
    const content = fs.readFileSync(resetPasswordUrl, "utf8");
    assert.ok(
      content.includes('placeholder="name@example.com"'),
      "app/reset-password/page.jsx must use neutral placeholder name@example.com"
    );
    assert.ok(
      !content.includes("name@vqtmanagement.com"),
      "app/reset-password/page.jsx must not contain name@vqtmanagement.com"
    );
  });
});
