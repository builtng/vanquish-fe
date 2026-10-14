import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX H05: Service names and Coaching price", async (t) => {
  const pagePath = path.join(rootDir, "app/mid-range-intake/page.jsx");
  assert.ok(fs.existsSync(pagePath), "mid-range-intake/page.jsx must exist");

  const pageContent = fs.readFileSync(pagePath, "utf8");

  await t.test("1. Uses client service labels with dynamic price from settings", () => {
    assert.ok(
      pageContent.includes("Mid-range Counselling Service"),
      "Must include base label 'Mid-range Counselling Service'"
    );
    assert.ok(
      pageContent.includes("Coaching & Counselling Service"),
      "Must include base label 'Coaching & Counselling Service'"
    );
    assert.ok(
      pageContent.includes("`${s.baseTitle} (£${s.price}+)`"),
      "Must dynamically format title with price (£${s.price}+)"
    );
  });

  await t.test("2. Shows exact error message when prices cannot load", () => {
    const expectedErrorMsg =
      "We could not load the price. Please refresh the page or contact help@vanquishtherapies.co.uk.";
    assert.ok(
      pageContent.includes(expectedErrorMsg),
      `Must display exact error message: "${expectedErrorMsg}"`
    );
  });

  await t.test("3. Removed hard-coded price fallbacks (40 and 50) from session pricing", () => {
    // Should NOT have hardcoded 40 or 50 in sessionPricing state
    assert.ok(
      !pageContent.includes('"Mid Range": 40.0'),
      "sessionPricing initial state must not have 40.0 fallback"
    );
    assert.ok(
      !pageContent.includes('"Counselling & Coaching": 50.0'),
      "sessionPricing initial state must not have 50.0 fallback"
    );

    // Should NOT have Starting from £40 or Starting from £50 in mid-range-intake
    assert.ok(
      !pageContent.includes("Starting from £40"),
      "Must not have 'Starting from £40' text"
    );
    assert.ok(
      !pageContent.includes("Starting from £50"),
      "Must not have 'Starting from £50' text"
    );
    assert.ok(
      !pageContent.includes("Starting from £"),
      "Must not have 'Starting from £' text in mid-range-intake"
    );
  });
});
