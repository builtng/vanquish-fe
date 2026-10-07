import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q09: Remove 'Prefer younger counsellor' option from every client form", () => {
  const targetFiles = [
    "app/mid-range-intake/page.jsx",
    "app/low-cost-intake/page.jsx",
    "app/clform/page.jsx",
  ];

  for (const relativePath of targetFiles) {
    const filePath = path.join(rootDir, relativePath);
    assert.ok(fs.existsSync(filePath), `${relativePath} must exist`);

    const content = fs.readFileSync(filePath, "utf8");

    // Must not contain "Prefer younger counsellor"
    assert.ok(
      !content.includes("Prefer younger counsellor"),
      `${relativePath} must not contain 'Prefer younger counsellor'`
    );

    // Must not contain option value Younger
    assert.ok(
      !content.includes('value="Younger"'),
      `${relativePath} must not contain option value="Younger"`
    );
  }
});
