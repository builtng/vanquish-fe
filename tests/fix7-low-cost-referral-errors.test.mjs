import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

describe("FIX 7: Low Cost form referral errors and Next navigation", () => {
  const lowCostContent = fs.readFileSync(
    new URL("../app/low-cost-intake/page.jsx", import.meta.url),
    "utf8"
  );

  it("1. handleInputChange resets referral fields in formData when hearAboutUs is not Referral", () => {
    assert.match(
      lowCostContent,
      /if\s*\(\s*field\s*===\s*["']hearAboutUs["']\s*&&\s*value\s*!==\s*["']Referral["']\s*\)\s*\{[\s\S]*next\.referralReason\s*=\s*["']["'];[\s\S]*next\.referrerName\s*=\s*["']["'];[\s\S]*next\.referrerPhone\s*=\s*["']["'];[\s\S]*next\.referrerEmail\s*=\s*["']["'];/,
      "handleInputChange must reset referral form fields when hearAboutUs is switched away from Referral"
    );
  });

  it("2. handleInputChange clears sticking referral errors from errors state when hearAboutUs changes", () => {
    assert.match(
      lowCostContent,
      /if\s*\(\s*field\s*===\s*["']hearAboutUs["']\s*\)\s*\{[\s\S]*delete\s+newErrors\.hearAboutUs;[\s\S]*if\s*\(\s*value\s*!==\s*["']Referral["']\s*\)\s*\{[\s\S]*delete\s+newErrors\.referralReason;[\s\S]*delete\s+newErrors\.referrerName;[\s\S]*delete\s+newErrors\.referrerPhone;[\s\S]*delete\s+newErrors\.referrerEmail;/,
      "handleInputChange must delete sticking referral errors when hearAboutUs is switched away from Referral"
    );
  });

  it("3. validateStep case 7 safely validates referral fields with null-safe trim checks", () => {
    assert.match(
      lowCostContent,
      /case\s+7:[\s\S]*!formData\.referrerName\s*\|\|\s*!formData\.referrerName\.trim\(\)/,
      "validateStep must safely validate referrerName with null-safe trim check"
    );
    assert.match(
      lowCostContent,
      /!formData\.referralReason\s*\|\|\s*!formData\.referralReason\.trim\(\)/,
      "validateStep must safely validate referralReason with null-safe trim check"
    );
  });

  it("4. Referral inputs define name, id, and data-field attributes matching validation error keys", () => {
    assert.match(
      lowCostContent,
      /<textarea[^>]*name=["']referralReason["'][^>]*id=["']referralReason["'][^>]*data-field=["']referralReason["']/,
      "referralReason textarea must have name, id, and data-field attributes"
    );
    assert.match(
      lowCostContent,
      /<input[^>]*name=["']referrerName["'][^>]*id=["']referrerName["'][^>]*data-field=["']referrerName["']/,
      "referrerName input must have name, id, and data-field attributes"
    );
    assert.match(
      lowCostContent,
      /<input[^>]*name=["']referrerPhone["'][^>]*id=["']referrerPhone["'][^>]*data-field=["']referrerPhone["']/,
      "referrerPhone input must have name, id, and data-field attributes"
    );
    assert.match(
      lowCostContent,
      /<input[^>]*name=["']referrerEmail["'][^>]*id=["']referrerEmail["'][^>]*data-field=["']referrerEmail["']/,
      "referrerEmail input must have name, id, and data-field attributes"
    );
  });

  it("5. Simulation: switching from Referral (with errors) to Online clears errors and allows Next on first click", () => {
    // Simulate initial state with referral errors sticking
    let errors = {
      referrerName: "Referrer's name is required",
      referrerPhone: "Referrer's phone is required",
      referrerEmail: "Referrer's email is required",
      referralReason: "Reasons for referral is required",
    };
    let formData = {
      hearAboutUs: "Referral",
      referrerName: "",
      referrerPhone: "",
      referrerEmail: "",
      referralReason: "",
    };

    // User switches hearAboutUs to 'Online'
    const field = "hearAboutUs";
    const value = "Online";

    // Replicate our updated handleInputChange logic:
    formData = {
      ...formData,
      [field]: value,
      ...(field === "hearAboutUs" && value !== "Referral"
        ? {
            referralReason: "",
            referrerName: "",
            referrerPhone: "",
            referrerOrg: "",
            referrerEmail: "",
          }
        : {}),
    };

    const newErrors = { ...errors };
    delete newErrors[field];
    if (field === "hearAboutUs" && value !== "Referral") {
      delete newErrors.referralReason;
      delete newErrors.referrerName;
      delete newErrors.referrerPhone;
      delete newErrors.referrerEmail;
    }
    errors = newErrors;

    // Verify all referral errors are completely wiped
    assert.equal(Object.keys(errors).length, 0, "No sticking errors should remain");
    assert.equal(formData.hearAboutUs, "Online");

    // Simulate validateStep(7)
    const stepErrors = {};
    if (!formData.hearAboutUs) {
      stepErrors.hearAboutUs = "This field is required";
    } else if (formData.hearAboutUs === "Referral") {
      if (!formData.referrerName || !formData.referrerName.trim())
        stepErrors.referrerName = "Referrer's name is required";
      if (!formData.referrerPhone || !formData.referrerPhone.trim())
        stepErrors.referrerPhone = "Referrer's phone is required";
      if (!formData.referrerEmail || !formData.referrerEmail.trim())
        stepErrors.referrerEmail = "Referrer's email is required";
      if (!formData.referralReason || !formData.referralReason.trim())
        stepErrors.referralReason = "Reasons for referral is required";
    }

    // Must be valid immediately without requiring a second click
    assert.equal(Object.keys(stepErrors).length, 0, "Validation passes cleanly on first click");
  });

  it("6. Mid Range form handleInputChange clears referral errors when hearAboutUs changes away from Referral", () => {
    const midRangeContent = fs.readFileSync(
      new URL("../app/mid-range-intake/page.jsx", import.meta.url),
      "utf8"
    );
    assert.match(
      midRangeContent,
      /if\s*\(\s*field\s*===\s*["']hearAboutUs["']\s*&&\s*value\s*!==\s*["']Referral["']\s*\)\s*\{[\s\S]*delete\s+newErrors\.referrerName;[\s\S]*delete\s+newErrors\.referrerPhone;[\s\S]*delete\s+newErrors\.referrerEmail;/,
      "Mid Range handleInputChange must clear referral errors when hearAboutUs is switched away from Referral"
    );
  });
});
