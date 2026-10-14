import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX F03: Session notes reminder wording", async (t) => {
  const sessionNotesPath = path.join(
    rootDir,
    "app/counsellor-portal/pages/session-notes/page.jsx",
  );
  const portalDashboardPath = path.join(
    rootDir,
    "app/counsellor-portal/page.jsx",
  );

  assert.ok(fs.existsSync(sessionNotesPath), "session-notes/page.jsx must exist");
  assert.ok(fs.existsSync(portalDashboardPath), "counsellor-portal/page.jsx must exist");

  const sessionNotesContent = fs.readFileSync(sessionNotesPath, "utf8");
  const portalDashboardContent = fs.readFileSync(portalDashboardPath, "utf8");

  const expectedWording = "All session notes must be submitted immediately after your session.";
  const forbiddenWording = "All session notes must be submitted within 24 hours of completion.";

  await t.test("1. Session notes page has the exact new reminder wording", () => {
    assert.ok(
      sessionNotesContent.includes(expectedWording),
      `session-notes/page.jsx must contain exact wording: "${expectedWording}"`
    );
    assert.ok(
      !sessionNotesContent.includes(forbiddenWording),
      "session-notes/page.jsx must NOT contain old 24 hours wording"
    );
  });

  await t.test("2. Counsellor portal dashboard displays the exact reminder wording", () => {
    assert.ok(
      portalDashboardContent.includes(expectedWording),
      `counsellor-portal/page.jsx must contain exact wording: "${expectedWording}"`
    );
  });
});
