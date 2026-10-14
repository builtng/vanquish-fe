import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

test("FIX F05: Applicant document viewing verification", async (t) => {
  await t.test("Trainee counsellor detail page uses authenticated document endpoint with Authorization token", () => {
    const filePath = path.join(root, "app/dashboard/training-counsellors/details/[uuid]/page.jsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // Must fetch from authenticated endpoint
    assert.match(
      content,
      /\/training-counsellors\/\$\{tcUuid\}\/document\/\$\{fieldName\}/,
      "Expected trainee counsellor document URL to use authenticated endpoint"
    );
    assert.match(
      content,
      /Authorization.*Bearer/i,
      "Expected fetch request to include Authorization Bearer header"
    );
    // Should create blob and trigger download/open
    assert.match(
      content,
      /URL\.createObjectURL\(blob\)/,
      "Expected blob URL creation for secure file opening"
    );
  });

  await t.test("Trainee application detail page uses authenticated document endpoint with Authorization token", () => {
    const filePath = path.join(root, "app/dashboard/trainee-applications/[id]/page.jsx");
    const content = fs.readFileSync(filePath, "utf-8");

    assert.match(
      content,
      /\/trainee-applications\/\$\{appId\}\/document\/\$\{field\}/,
      "Expected trainee application document URL to use authenticated endpoint"
    );
    assert.match(
      content,
      /Authorization.*Bearer/i,
      "Expected DocLink to include Authorization Bearer header"
    );
    assert.match(
      content,
      /URL\.createObjectURL\(blob\)/,
      "Expected DocLink to use blob URL"
    );
  });

  await t.test("Qualified applications pages use authenticated document endpoint", () => {
    const idPagePath = path.join(root, "app/dashboard/qualified-applications/[id]/page.jsx");
    const idContent = fs.readFileSync(idPagePath, "utf-8");

    assert.match(
      idContent,
      /\/qc-applications\/\$\{id\}\/document\/\$\{doc\.field\}/,
      "Expected qualified application [id] page to use authenticated document endpoint"
    );
    assert.match(
      idContent,
      /Authorization.*Bearer/i,
      "Expected qualified application [id] fetch to include Authorization Bearer header"
    );

    const listPagePath = path.join(root, "app/dashboard/qualified-applications/page.jsx");
    const listContent = fs.readFileSync(listPagePath, "utf-8");

    assert.match(
      listContent,
      /\/qc-applications\/\$\{selectedApp\.id\}\/document\/\$\{doc\.field\}/,
      "Expected qualified application list page modal to use authenticated document endpoint"
    );
    assert.match(
      listContent,
      /Authorization.*Bearer/i,
      "Expected qualified application list modal to include Authorization Bearer header"
    );
  });
});
