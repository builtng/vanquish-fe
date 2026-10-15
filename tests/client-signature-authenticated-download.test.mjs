import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

test("Client agreement signature: authenticated download route verification", async (t) => {
  await t.test("client-details page does not link signature directly to public storage", () => {
    const pagePath = path.join(root, "app/dashboard/client-details/[uuid]/page.jsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    // Must not use apiService.getStorageUrl for signatureUrl
    assert.doesNotMatch(
      content,
      /getStorageUrl\s*\(\s*client\.agreement\.signatureUrl\s*\)/,
      "Expected client-details page to not open signature directly via public getStorageUrl"
    );

    // Must trigger authenticated download handler
    assert.match(
      content,
      /handleDownloadSignature/,
      "Expected client-details page to have handleDownloadSignature handler"
    );
    assert.match(
      content,
      /downloadClientSignature\s*\(/,
      "Expected handleDownloadSignature to call apiService.downloadClientSignature"
    );
  });

  await t.test("apiService defines downloadClientSignature using authenticated route with token", () => {
    const apiPath = path.join(root, "lib/api.js");
    const content = fs.readFileSync(apiPath, "utf-8");

    assert.match(
      content,
      /downloadClientSignature\s*\(\s*uuid\s*\)/,
      "Expected apiService to define downloadClientSignature method"
    );
    assert.match(
      content,
      /\/clients\/\$\{uuid\}\/signature/,
      "Expected downloadClientSignature to call /clients/${uuid}/signature"
    );
    assert.match(
      content,
      /Authorization:\s*`Bearer\s*\$\{token\}`/,
      "Expected downloadClientSignature to pass Authorization Bearer token header"
    );
    assert.match(
      content,
      /URL\.createObjectURL\s*\(\s*blob\s*\)/,
      "Expected downloadClientSignature to create object URL for download"
    );
  });
});
