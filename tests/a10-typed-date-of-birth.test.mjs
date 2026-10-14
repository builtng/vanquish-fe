import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { validateDateOfBirth, parseDateOfBirth } from "../lib/dates.js";

describe("FIX A10: Typed Date of Birth & Validation", () => {
  test("parseDateOfBirth correctly parses DD/MM/YYYY, YYYY-MM-DD, and object values", () => {
    const fromUk = parseDateOfBirth("25/12/1990");
    assert.strictEqual(fromUk.day, "25");
    assert.strictEqual(fromUk.month, "12");
    assert.strictEqual(fromUk.year, "1990");
    assert.strictEqual(fromUk.dayNum, 25);
    assert.strictEqual(fromUk.monthNum, 12);
    assert.strictEqual(fromUk.yearNum, 1990);

    const fromIso = parseDateOfBirth("1990-12-25");
    assert.strictEqual(fromIso.day, "25");
    assert.strictEqual(fromIso.month, "12");
    assert.strictEqual(fromIso.year, "1990");

    const fromObj = parseDateOfBirth({ day: "05", month: "08", year: "1985" });
    assert.strictEqual(fromObj.day, "05");
    assert.strictEqual(fromObj.month, "08");
    assert.strictEqual(fromObj.year, "1985");
  });

  test("validateDateOfBirth rejects empty, partial, and malformed inputs", () => {
    assert.strictEqual(validateDateOfBirth(""), "Date of birth is required");
    assert.strictEqual(validateDateOfBirth(null), "Date of birth is required");
    assert.strictEqual(validateDateOfBirth("   "), "Date of birth is required");

    assert.strictEqual(
      validateDateOfBirth("15/05"),
      "Please enter a valid date of birth (DD/MM/YYYY)"
    );
    assert.strictEqual(
      validateDateOfBirth("15/05/90"),
      "Please enter a valid date of birth (DD/MM/YYYY)"
    );
    assert.strictEqual(
      validateDateOfBirth("35/05/1990"),
      "Day must be between 1 and 31"
    );
    assert.strictEqual(
      validateDateOfBirth("15/13/1990"),
      "Month must be between 1 and 12"
    );
    assert.strictEqual(
      validateDateOfBirth("31/04/1990"),
      "Please enter a valid day for the selected month"
    );
    assert.strictEqual(
      validateDateOfBirth("29/02/2023"),
      "Please enter a valid day for the selected month"
    );
  });

  test("validateDateOfBirth rejects future dates", () => {
    const nextYear = new Date().getFullYear() + 1;
    assert.strictEqual(
      validateDateOfBirth(`01/01/${nextYear}`),
      "Date of birth cannot be in the future"
    );

    // Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const d = String(tomorrow.getDate()).padStart(2, "0");
    const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const y = tomorrow.getFullYear();
    assert.strictEqual(
      validateDateOfBirth(`${d}/${m}/${y}`),
      "Date of birth cannot be in the future"
    );
  });

  test("validateDateOfBirth rejects applicants under 18 years old", () => {
    const today = new Date();

    // 17 years old (born exactly 17 years ago)
    const y17 = today.getFullYear() - 17;
    const d17 = String(today.getDate()).padStart(2, "0");
    const m17 = String(today.getMonth() + 1).padStart(2, "0");
    assert.strictEqual(
      validateDateOfBirth(`${d17}/${m17}/${y17}`),
      "You must be at least 18 years old to apply"
    );

    // 10 years old
    const y10 = today.getFullYear() - 10;
    assert.strictEqual(
      validateDateOfBirth(`15/06/${y10}`),
      "You must be at least 18 years old to apply"
    );

    // Turned 18 yesterday (valid)
    const yesterday18 = new Date(today);
    yesterday18.setFullYear(today.getFullYear() - 18);
    yesterday18.setDate(yesterday18.getDate() - 1);
    const d18 = String(yesterday18.getDate()).padStart(2, "0");
    const m18 = String(yesterday18.getMonth() + 1).padStart(2, "0");
    const y18 = yesterday18.getFullYear();
    assert.strictEqual(validateDateOfBirth(`${d18}/${m18}/${y18}`), null);

    // 25 years old (valid)
    assert.strictEqual(validateDateOfBirth("15/05/1998"), null);
    assert.strictEqual(validateDateOfBirth("1998-05-15"), null);
  });

  test("app/counsellor/page.jsx uses DateOfBirthInput and validateDateOfBirth", () => {
    const filePath = path.resolve(
      import.meta.dirname,
      "../app/counsellor/page.jsx"
    );
    const content = fs.readFileSync(filePath, "utf-8");

    assert.ok(
      content.includes("DateOfBirthInput"),
      "counsellor/page.jsx must import and render DateOfBirthInput"
    );
    assert.ok(
      content.includes("validateDateOfBirth"),
      "counsellor/page.jsx must use validateDateOfBirth in validateStep"
    );
    assert.ok(
      !content.includes('type="date"\n                    value={formData.dateOfBirth}'),
      "counsellor/page.jsx must not use input type=date for dateOfBirth"
    );
  });

  test("app/qualified-counsellor-form/page.jsx uses DateOfBirthInput and validateDateOfBirth", () => {
    const filePath = path.resolve(
      import.meta.dirname,
      "../app/qualified-counsellor-form/page.jsx"
    );
    const content = fs.readFileSync(filePath, "utf-8");

    assert.ok(
      content.includes("DateOfBirthInput"),
      "qualified-counsellor-form/page.jsx must import and render DateOfBirthInput"
    );
    assert.ok(
      content.includes("validateDateOfBirth"),
      "qualified-counsellor-form/page.jsx must use validateDateOfBirth in validateStep"
    );
    assert.ok(
      !content.includes('type="date"\n                      name="dateOfBirth"'),
      "qualified-counsellor-form/page.jsx must not use input type=date for dateOfBirth"
    );
  });
});
