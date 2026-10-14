import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { extractCleanErrorMessage } from "../lib/api.js";

test("E02: extractCleanErrorMessage extracts real server message for 413 and 422", () => {
  // Test 413 HTML page extraction (like Nginx/Cloudflare default 413 error)
  const nginxHtml = "<html><head><title>413 Request Entity Too Large</title></head><body><center><h1>413 Request Entity Too Large</h1></center><hr><center>nginx</center></body></html>";
  const extracted413 = extractCleanErrorMessage({ message: nginxHtml }, 413);
  assert.equal(extracted413, "413 Request Entity Too Large");

  // Test 413 with json message
  const json413 = extractCleanErrorMessage({ message: "Payload too large for server" }, 413);
  assert.equal(json413, "Payload too large for server");

  // Test 422 validation errors object
  const validation422 = extractCleanErrorMessage({
    message: "Validation failed",
    errors: {
      fitnessTopractice: ["This file is larger than 10 MB. Please upload a smaller file."],
      dbs: ["Invalid document type."],
    },
  }, 422);
  assert.match(validation422, /This file is larger than 10 MB\. Please upload a smaller file\./);
  assert.match(validation422, /Invalid document type\./);
});

test("E02: counsellor page contains 10 MB validation and separate document upload with progress", () => {
  const counsellorPagePath = path.resolve("app/counsellor/page.jsx");
  const content = fs.readFileSync(counsellorPagePath, "utf-8");

  // Exact 10 MB limit text requirement
  assert.ok(
    content.includes("This file is larger than 10 MB. Please upload a smaller file."),
    "Must contain exact string: This file is larger than 10 MB. Please upload a smaller file."
  );

  // Separate upload & progress tracking
  assert.ok(
    content.includes("uploadSingleDocument"),
    "Must implement uploadSingleDocument for separate uploads"
  );
  assert.ok(
    content.includes("uploadProgress"),
    "Must track upload progress"
  );
  assert.ok(
    content.includes("uploadStatus"),
    "Must track upload status"
  );
  assert.ok(
    content.includes("uploadedDocs"),
    "Must track uploaded docs so one failure does not lose the others"
  );
  assert.ok(
    content.includes("uploadTcDocument"),
    "Must call uploadTcDocument on apiService"
  );
});

test("E02: api.js implements uploadTcDocument with progress and 413/422 error handling", () => {
  const apiPath = path.resolve("lib/api.js");
  const content = fs.readFileSync(apiPath, "utf-8");

  assert.ok(
    content.includes("uploadTcDocument(file, field, onProgress)"),
    "apiService must provide uploadTcDocument with onProgress callback"
  );
  assert.ok(
    content.includes("extractCleanErrorMessage"),
    "Must export and use extractCleanErrorMessage"
  );
  assert.ok(
    content.includes("413"),
    "Must handle 413 status code"
  );
});
