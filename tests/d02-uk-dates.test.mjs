import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { formatDate, formatDateTime, formatTime, formatDateNumeric, UK_LOCALE, UK_TIMEZONE } from "../lib/dates.js";

describe("FIX D02: UK Dates Everywhere", () => {
  test("lib/dates.js exports correct constants and formats dates in UK format with Europe/London timezone", () => {
    assert.strictEqual(UK_LOCALE, "en-GB");
    assert.strictEqual(UK_TIMEZONE, "Europe/London");

    // 2026-09-03 14:05:00 in London (BST is UTC+1, so 13:05:00 UTC)
    const testDateUtc = new Date("2026-09-03T13:05:00Z");

    const dateStr = formatDate(testDateUtc);
    assert.ok(
      dateStr.includes("3") && (dateStr.includes("Sep") || dateStr.includes("Sept")) && dateStr.includes("2026"),
      `Expected UK date format, got: ${dateStr}`
    );

    const dateTimeStr = formatDateTime(testDateUtc);
    assert.ok(
      dateTimeStr.includes("3") && (dateTimeStr.includes("Sep") || dateTimeStr.includes("Sept")) && dateTimeStr.includes("2026"),
      `Expected UK date in dateTime, got: ${dateTimeStr}`
    );
    assert.ok(dateTimeStr.includes("14:05"), `Expected 14:05 in dateTime, got: ${dateTimeStr}`);

    const timeStr = formatTime(testDateUtc);
    assert.strictEqual(timeStr, "14:05");

    const numericStr = formatDateNumeric(testDateUtc);
    assert.strictEqual(numericStr, "03/09/2026");
  });

  test("handles null, undefined and invalid date values safely", () => {
    assert.strictEqual(formatDate(null), "");
    assert.strictEqual(formatDate(undefined), "");
    assert.strictEqual(formatDate(""), "");
    assert.strictEqual(formatDate("invalid-date"), "");

    assert.strictEqual(formatDateTime(null), "");
    assert.strictEqual(formatTime(null), "");
    assert.strictEqual(formatDateNumeric(null), "");
  });

  test("verifies no bare toLocaleDateString(), toLocaleString(), or toLocaleTimeString() exist in app/ and components/", () => {
    const frontendDir = path.resolve(import.meta.dirname, "..");
    
    function walkDir(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
          results = results.concat(walkDir(full));
        } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
          results.push(full);
        }
      });
      return results;
    }

    const files = [
      ...walkDir(path.join(frontendDir, "app")),
      ...walkDir(path.join(frontendDir, "components")),
    ];

    const bareDateRegex = /\.toLocaleDateString\s*\(\s*\)/g;
    const bareDateTimeRegex = /\.toLocaleString\s*\(\s*\)/g;
    const bareTimeRegex = /\.toLocaleTimeString\s*\(\s*\)/g;
    const undefinedLocaleRegex = /\.toLocale(DateString|TimeString|String)\s*\(\s*(undefined|\[\s*\])/g;

    const violations = [];

    for (const f of files) {
      const relPath = path.relative(frontendDir, f);
      const content = fs.readFileSync(f, "utf-8");

      if (bareDateRegex.test(content)) {
        violations.push(`${relPath}: bare toLocaleDateString()`);
      }
      if (bareDateTimeRegex.test(content)) {
        violations.push(`${relPath}: bare toLocaleString()`);
      }
      if (bareTimeRegex.test(content)) {
        violations.push(`${relPath}: bare toLocaleTimeString()`);
      }
      if (undefinedLocaleRegex.test(content)) {
        violations.push(`${relPath}: undefined/empty array locale in toLocale method`);
      }
    }

    assert.strictEqual(
      violations.length,
      0,
      `Found bare or undefined toLocale calls in codebase:\n${violations.join("\n")}`
    );
  });
});
