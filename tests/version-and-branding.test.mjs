import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import nextConfig from "../next.config.mjs";

describe("Prompt 3: Version Consistency & Branding Verification", () => {
  it("next.config.mjs defines a visible build identifier", () => {
    assert.ok(nextConfig.env, "env config should exist");
    assert.ok(
      nextConfig.env.NEXT_PUBLIC_BUILD_IDENTIFIER,
      "NEXT_PUBLIC_BUILD_IDENTIFIER must be defined"
    );
    const buildIdPattern = /^Build \d{4}-\d{2}-\d{2} [a-f0-9]+$/;
    assert.match(
      nextConfig.env.NEXT_PUBLIC_BUILD_IDENTIFIER,
      buildIdPattern,
      `Build identifier must match pattern "Build YYYY-MM-DD hash", got: ${nextConfig.env.NEXT_PUBLIC_BUILD_IDENTIFIER}`
    );
  });

  it("next.config.mjs sets Cache-Control headers preventing stale HTML caching", async () => {
    assert.ok(typeof nextConfig.headers === "function", "headers function must exist in nextConfig");
    const headersConfig = await nextConfig.headers();
    
    // Check root header rule
    const rootRule = headersConfig.find(h => h.source === "/:path*");
    assert.ok(rootRule, "Root path header rule must exist");
    const rootCacheHeader = rootRule.headers.find(h => h.key === "Cache-Control");
    assert.ok(rootCacheHeader, "Root Cache-Control header must exist");
    assert.match(rootCacheHeader.value, /max-age=0/);
    assert.match(rootCacheHeader.value, /must-revalidate/);

    // Check dashboard and form specific rules
    const dashboardRule = headersConfig.find(h => h.source === "/dashboard/:path*");
    assert.ok(dashboardRule, "Dashboard Cache-Control rule must exist");
    const dashCacheHeader = dashboardRule.headers.find(h => h.key === "Cache-Control");
    assert.match(dashCacheHeader.value, /no-store/);

    const formRule = headersConfig.find(h => h.source.includes("mid-range-intake"));
    assert.ok(formRule, "Intake forms Cache-Control rule must exist");
    const formCacheHeader = formRule.headers.find(h => h.key === "Cache-Control");
    assert.match(formCacheHeader.value, /no-store/);
  });

  it("mid-range-intake renders 'Vanquish Therapies' in disclosure text without flicker", () => {
    const filePath = path.resolve("frontend/app/mid-range-intake/page.jsx");
    const content = fs.readFileSync(filePath, "utf8");

    // Must not contain the old dynamic expression that flickers
    assert.doesNotMatch(
      content,
      /By completing this form, you \(client\) are giving permission\s+for your information to be shared within\{" "\}\s+\{branding\.company_name/
    );

    // Must statically render Vanquish Therapies in disclosure text
    assert.match(
      content,
      /By completing this form, you \(client\) are giving permission\s+for your information to be shared within Vanquish Therapies/
    );
  });

  it("low-cost-intake renders 'Vanquish Therapies' in disclosure text without flicker", () => {
    const filePath = path.resolve("frontend/app/low-cost-intake/page.jsx");
    const content = fs.readFileSync(filePath, "utf8");

    assert.doesNotMatch(
      content,
      /By completing this form, you \(client\) are giving permission\s+for your information to be shared within\{" "\}\s+\{branding\.company_name/
    );

    assert.match(
      content,
      /By completing this form, you \(client\) are giving permission\s+for your information to be shared within Vanquish Therapies/
    );
  });

  it("coaching page renders 'Vanquish Therapies' in disclosure and capacity button", () => {
    const filePath = path.resolve("frontend/app/coaching/page.jsx");
    const content = fs.readFileSync(filePath, "utf8");

    assert.match(
      content,
      /By completing this form, you \(client\) are giving permission\s+for your information to be shared within Vanquish Therapies/
    );

    assert.doesNotMatch(content, /Continue with VQT COACHING & THERAPY/);
    assert.match(content, /Continue with Vanquish Therapies Coaching & Therapy/);
  });

  it("agreement clauses use 'Vanquish Therapies' without 'VQT' acronym", () => {
    const filePath = path.resolve("frontend/components/AgreementClauses.jsx");
    const content = fs.readFileSync(filePath, "utf8");

    assert.doesNotMatch(content, /Vanquish Therapies<\/strong>\s*\(VQT\)/);
    assert.doesNotMatch(content, /Please note &ndash; VQT and online/);
    assert.match(content, /Please note &ndash; Vanquish Therapies and online/);
  });

  it("no client-facing code references 'VQT Management'", () => {
    const files = [
      "frontend/app/mid-range-intake/page.jsx",
      "frontend/app/low-cost-intake/page.jsx",
      "frontend/app/coaching/page.jsx",
      "frontend/app/qualified-counsellor-form/page.jsx",
      "frontend/app/clform/page.jsx",
      "frontend/app/tcform/page.jsx",
      "frontend/app/client-booking/page.jsx",
      "frontend/components/AgreementClauses.jsx",
      "frontend/components/PublicFormWrapper.jsx",
      "frontend/contexts/BrandingContext.jsx",
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      if (fs.existsSync(fullPath)) {
        const text = fs.readFileSync(fullPath, "utf8");
        assert.ok(
          !text.includes("VQT Management"),
          `File ${f} should not contain "VQT Management"`
        );
      }
    }
  });
});
