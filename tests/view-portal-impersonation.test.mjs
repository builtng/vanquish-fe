import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(rootDir, p), "utf8");

function fakeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

test("View portal: the counsellor token lives in sessionStorage only and expires", async () => {
  globalThis.window = { sessionStorage: fakeStorage(), localStorage: fakeStorage() };
  const imp = await import(path.join(rootDir, "lib/impersonation.js"));

  assert.equal(imp.isImpersonating(), false);
  imp.setImpersonation({
    token: "1|abc",
    expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
    counsellor: { name: "Rooshan C" },
  });
  assert.equal(imp.getImpersonation().token, "1|abc");
  assert.equal(imp.getImpersonation().counsellor.name, "Rooshan C");
  assert.equal(window.localStorage.getItem("api_token"), null, "never written to localStorage");

  imp.clearImpersonation();
  assert.equal(imp.isImpersonating(), false);

  imp.setImpersonation({ token: "2|old", expires_at: new Date(Date.now() - 1000).toISOString() });
  assert.equal(imp.getImpersonation(), null, "an expired view is ignored");
});

test("api.js: impersonation token wins in its tab; clearing it never signs the admin out", () => {
  const api = read("lib/api.js");
  const getToken = api.slice(api.indexOf("  getToken() {"), api.indexOf("  clearToken() {"));
  assert.ok(getToken.indexOf("getImpersonation()") < getToken.indexOf('localStorage.getItem("api_token")'));

  const clearToken = api.slice(api.indexOf("  clearToken() {"), api.indexOf("async startImpersonation"));
  assert.ok(clearToken.indexOf("clearImpersonation()") < clearToken.indexOf('localStorage.removeItem("api_token")'));
  assert.match(clearToken, /clearImpersonation\(\);\s*return;/);

  const setToken = api.slice(api.indexOf("  setToken(token) {"), api.indexOf("  getToken() {"));
  assert.ok(setToken.includes("!isImpersonating()"));

  assert.ok(api.includes("`/admin/impersonate/${tcUuid}`"));
  assert.ok(api.includes('"/admin/impersonate/stop"'));
});

test("View portal: token handed over by postMessage, not the URL; banner with Exit; buttons for admins", () => {
  const imp = read("lib/impersonation.js");
  assert.ok(imp.includes('window.open("/portal-view", "_blank")'));
  assert.ok(!/portal-view\?|portal-view#/.test(imp), "token never in the URL");
  assert.ok(imp.includes("postMessage({ type: IMPERSONATION_PAYLOAD, payload }, origin)"));

  const viewAs = read("app/portal-view/page.jsx");
  assert.ok(viewAs.includes("event.origin !== origin || event.source !== opener"));
  assert.ok(viewAs.includes("setImpersonation(event.data.payload)"));

  const banner = read("components/ImpersonationBanner.jsx");
  assert.ok(banner.includes("Viewing as {name}, read-only"));
  assert.ok(banner.includes("stopImpersonation()"));
  assert.ok(read("app/counsellor-portal/layout.js").includes("<ImpersonationBanner />"));

  const button = read("components/ViewPortalButton.jsx");
  assert.ok(button.includes('["admin", "super_admin"].includes(user?.role)'));
  assert.ok(read("app/dashboard/training-counsellors/page.jsx").includes("<ViewPortalButton"));
  assert.ok(read("app/dashboard/training-counsellors/details/[uuid]/page.jsx").includes("<ViewPortalButton"));

  // No live (Pusher) connection with the admin's token inside a view tab
  assert.ok(read("lib/echo.js").includes("if (isImpersonating()) return null;"));
});

test("Counsellor profile documents open through the shared openProtectedDocument helper", () => {
  const page = read("app/dashboard/training-counsellors/details/[uuid]/page.jsx");
  assert.ok(page.includes('import { openProtectedDocument } from "@/lib/openProtectedDocument";'));
  assert.ok(page.includes("openProtectedDocument(\n                                        `/training-counsellors/${uuid}/document/${doc.id}`"));
});
