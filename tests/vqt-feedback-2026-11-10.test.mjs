import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Counsellor login: Forgot password goes to the reset page and back to the counsellor login", () => {
  const login = read("app/counsellor-login/page.jsx");
  assert.ok(login.includes('href="/forgot-password?portal=counsellor"'));
  assert.ok(!/href="#"[\s\S]{0,200}Forgot password/.test(login), "Forgot password must not be a dead # link");

  const forgot = read("app/forgot-password/page.jsx");
  assert.ok(forgot.includes('setLoginHref("/counsellor-login")'));
  const reset = read("app/reset-password/page.jsx");
  assert.ok(reset.includes('searchParams.get("portal") === "counsellor" ? "/counsellor-login" : "/"'));

  const proxy = read("proxy.js");
  assert.ok(proxy.includes('"/forgot-password"') && proxy.includes('"/reset-password"'));
});

test("Pending and completed matches: Low Cost can be matched manually with a note", () => {
  const pending = read("app/dashboard/pending-matches/page.jsx");
  assert.ok(pending.includes("Match manually"));
  assert.ok(pending.includes("manual_override: manualOverride"));
  assert.ok(pending.includes('Please add a note explaining why you are matching manually.'));
  assert.ok(pending.includes("if (manualOverride) return true;"), "override shows every weekly time");

  const completed = read("app/dashboard/completed-matches/page.jsx");
  assert.ok(completed.includes("Match manually"));
  assert.ok(completed.includes("!selectedSlotToAssign.isOverlap && !manualOverride"));
});

test("Placement response page uses offer wording for qualified counsellors", () => {
  const page = read("app/placement-response/[token]/page.jsx");
  assert.ok(page.includes('setIsQualified(data.applicant_type === "qualified")'));
  assert.ok(page.includes("Confirm Your Offer"));
});

test("Protected documents open through the shared API address, in a new tab", () => {
  const helper = read("lib/openProtectedDocument.js");
  assert.ok(helper.includes("apiService.baseURL"), "must not rely on the raw NEXT_PUBLIC_API_URL value");
  assert.ok(helper.includes('window.open("", "_blank")'));
  assert.ok(helper.includes("data?.message"), "shows the server's reason when a file cannot be opened");
});

test("Emergency contact email is hidden on client forms behind one switch (easy to restore)", () => {
  assert.ok(read("lib/constants.js").includes("export const SHOW_EMERGENCY_CONTACT_EMAIL = false;"));
  for (const page of ["app/low-cost-intake/page.jsx", "app/mid-range-intake/page.jsx"]) {
    const src = read(page);
    assert.ok(/\{SHOW_EMERGENCY_CONTACT_EMAIL && \(\s*<div>\s*<label[\s\S]{0,200}Emergency Contact Email/.test(src), page);
    assert.ok(src.includes("emergency_contact_email: SHOW_EMERGENCY_CONTACT_EMAIL ?"), page);
  }
});

test("Low Cost agreement: Section 07 wording updated and the two points removed", () => {
  const src = read("app/agreement/low-cost/page.jsx");
  assert.ok(src.includes("Sessions must be booked <strong>at least 48 hours</strong>"));
  assert.ok(src.includes("If not, the system automatically closes the"));
  assert.ok(!src.includes("Missing a week without booking creates a gap"));
  assert.ok(!src.includes("Sessions continue until the client or counsellor"));
});

test("Admin Edit Client and client profile also hide the emergency contact email", () => {
  const edit = read("app/dashboard/clients/edit/page.jsx");
  assert.ok(/\{SHOW_EMERGENCY_CONTACT_EMAIL && \(\s*<div>\s*<label[\s\S]{0,200}Contact Email/.test(edit));
  const details = read("app/dashboard/client-details/[uuid]/page.jsx");
  assert.ok(details.includes("{SHOW_EMERGENCY_CONTACT_EMAIL && client.emergencyContact.email && ("));
});
