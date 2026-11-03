import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("AuthContext provides refreshUser, which the counsellor profile page calls after saving", () => {
  const auth = fs.readFileSync(path.join(rootDir, "contexts/AuthContext.jsx"), "utf8");
  assert.ok(auth.includes("const refreshUser = async () =>"), "refreshUser must be defined");
  assert.ok(
    /AuthContext\.Provider value=\{\{[^}]*refreshUser[^}]*\}\}/.test(auth),
    "refreshUser must be passed through the AuthContext provider"
  );

  const profile = fs.readFileSync(path.join(rootDir, "app/counsellor-portal/profile/page.jsx"), "utf8");
  assert.ok(profile.includes("refreshUser"), "Profile page uses refreshUser");
});

test("Counsellor profile: removing a photo stops the removing spinner", () => {
  const profile = fs.readFileSync(path.join(rootDir, "app/counsellor-portal/profile/page.jsx"), "utf8");
  const start = profile.indexOf("const handleDeletePhoto = async");
  const end = profile.indexOf("};", profile.indexOf("finally", start));
  assert.ok(profile.slice(start, end).includes("setDeletingPhoto(false)"));
});
