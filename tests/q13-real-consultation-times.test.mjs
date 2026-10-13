import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q13: Real consultation times only", () => {
  const filteredCounsellorsContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );
  const intakeContent = fs.readFileSync(
    path.join(rootDir, "app/mid-range-intake/page.jsx"),
    "utf8"
  );

  // 1. Delete made-up times ("s1" to "s10") and hardcoded dates
  for (let i = 1; i <= 10; i++) {
    assert.ok(
      !filteredCounsellorsContent.includes(`id: "s${i}"`),
      `Must not contain fake slot id s${i}`
    );
  }
  assert.ok(
    !filteredCounsellorsContent.includes("[20, 21, 24, 27, 28, 31]"),
    "Must not contain hardcoded available days array"
  );
  assert.ok(
    !filteredCounsellorsContent.includes("Monday, 20 May 2024"),
    "Must not contain hardcoded default date"
  );

  // 2. When a date has no slots, show message
  assert.ok(
    filteredCounsellorsContent.includes("No times available on this date. Please choose another date."),
    "Must display exact message when date has no slots"
  );

  // 3. Step 10 validation must block moving forward without a slot ID
  assert.ok(
    intakeContent.includes("if (!formData.consultationSlotId)"),
    "Must require real consultationSlotId to advance past Step 10"
  );

  // 5. Every call to /consultation-slots/available must request ascending order (order=asc)
  assert.ok(
    intakeContent.includes("/consultation-slots/available?order=asc"),
    "app/mid-range-intake/page.jsx must request /consultation-slots/available?order=asc"
  );

  const lowCostContent = fs.readFileSync(
    path.join(rootDir, "app/low-cost-intake/page.jsx"),
    "utf8"
  );
  assert.ok(
    lowCostContent.includes("/consultation-slots/available?order=asc"),
    "app/low-cost-intake/page.jsx must request /consultation-slots/available?order=asc"
  );

  const apiContent = fs.readFileSync(
    path.join(rootDir, "lib/api.js"),
    "utf8"
  );
  assert.match(
    apiContent,
    /getAvailableConsultationSlots\s*\(\s*order\s*=\s*["']asc["']\s*\)/,
    "lib/api.js must default getAvailableConsultationSlots to order='asc'"
  );
  assert.ok(
    apiContent.includes("/consultation-slots/available${query}") ||
      apiContent.includes("/consultation-slots/available?order="),
    "lib/api.js must include order query parameter for available consultation slots"
  );

  // Scan all files in app/ and lib/ that reference /consultation-slots/available
  function findFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(findFiles(fullPath));
      } else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".js")) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const allFiles = findFiles(path.join(rootDir, "app")).concat(findFiles(path.join(rootDir, "lib")));
  for (const file of allFiles) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("/consultation-slots/available")) {
      assert.ok(
        content.includes("order=asc") || content.includes("${query}") || content.includes("order="),
        `File ${path.relative(rootDir, file)} calls /consultation-slots/available without ascending order parameter!`
      );
    }
  }
});
