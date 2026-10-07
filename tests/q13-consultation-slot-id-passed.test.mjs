import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function findFiles(dir, exts = [".jsx", ".js", ".tsx", ".ts"]) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFiles(fullPath, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

test("Any StripePaymentWrapper with paymentType=\"consultation\" must pass consultationSlotId", () => {
  const files = findFiles(rootDir);
  let checkedCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    if (!content.includes("<StripePaymentWrapper")) {
      continue;
    }

    // Match each <StripePaymentWrapper ... /> or <StripePaymentWrapper ...> block
    const regex = /<StripePaymentWrapper\b([^>]*?)(\/?>)/gs;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const propsString = match[1];
      if (/paymentType=(?:\{["']consultation["']\}|["']consultation["'])/.test(propsString)) {
        checkedCount++;
        const hasSlotId = /consultationSlotId=/.test(propsString);
        assert.ok(
          hasSlotId,
          `File ${path.relative(rootDir, file)} renders StripePaymentWrapper with paymentType="consultation" but is missing consultationSlotId!\nProps: ${propsString}`
        );
      }
    }
  }

  assert.ok(checkedCount >= 3, `Expected at least 3 consultation wrappers checked, found ${checkedCount}`);
});
