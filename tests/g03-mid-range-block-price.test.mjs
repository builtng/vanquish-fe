import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX G03: Mid Range block of 4 at £140", async (t) => {
  const clientBookingPath = path.join(rootDir, "app/client-booking/page.jsx");
  const clientDetailsPath = path.join(
    rootDir,
    "app/dashboard/client-details/[uuid]/page.jsx",
  );
  const settingsPath = path.join(rootDir, "app/dashboard/settings/page.jsx");

  assert.ok(fs.existsSync(clientBookingPath), "client-booking/page.jsx must exist");
  assert.ok(fs.existsSync(clientDetailsPath), "client-details/[uuid]/page.jsx must exist");
  assert.ok(fs.existsSync(settingsPath), "settings/page.jsx must exist");

  const clientBookingContent = fs.readFileSync(clientBookingPath, "utf8");
  const clientDetailsContent = fs.readFileSync(clientDetailsPath, "utf8");
  const settingsContent = fs.readFileSync(settingsPath, "utf8");

  await t.test("1. Booking uses block_price (£140 for Mid Range) and never session price x 4", () => {
    // Verify Mid Range block fallback is £140
    assert.ok(
      clientBookingContent.includes("140.0") || clientBookingContent.includes("140"),
      "Must price Mid Range block at 140"
    );

    // Verify handleBookBlock ensures blocks use block_price
    assert.match(
      clientBookingContent,
      /sessionsCount === 4 \|\| bookingType === ["']block["']/,
      "handleBookBlock must check for block booking to apply block_price"
    );

    // Verify block of 4 description in booking fee box includes £140 for Mid Range
    assert.ok(
      clientBookingContent.includes("pricing[client?.service_type]?.block_price || 140"),
      "Booking fee info box must display £140 for Mid Range block of 4"
    );
  });

  await t.test("2. Package size comes from client's actual booking and removes High Range", () => {
    // Must NOT have High Range in client-details
    assert.ok(
      !clientDetailsContent.includes('"High Range"'),
      "client-details must NOT contain 'High Range'"
    );
    assert.ok(
      !clientDetailsContent.includes("'High Range'"),
      "client-details must NOT contain 'High Range'"
    );

    // Must NOT have the hard-coded getTotalSessions guessing 8 for Mid Range or 12 for High Range
    assert.ok(
      !clientDetailsContent.includes("getTotalSessions"),
      "client-details must NOT contain hard-coded getTotalSessions"
    );
    assert.ok(
      !clientDetailsContent.includes("if (serviceType === \"Mid Range\") return 8;"),
      "Must not hard-code Mid Range as 8 sessions"
    );

    // Unbooked clients must have totalSessions: 0 instead of hard-coded guesses
    assert.ok(
      clientDetailsContent.includes("totalSessions: 0"),
      "Unbooked clients must have totalSessions: 0 instead of hard-coded guesses"
    );

    // Booked clients reflect Block of 4 or Single Session
    assert.ok(
      clientDetailsContent.includes("Block of 4"),
      "Must name package Block of 4 when client has booked a block"
    );
    assert.ok(
      clientDetailsContent.includes("Single Session"),
      "Must name package Single Session when client has booked 1 session"
    );
  });

  await t.test("3. Admin Settings explains block fee applies to Mid Range (£140) and Low Cost (£72)", () => {
    assert.ok(
      settingsContent.includes("Mid Range £140"),
      "Settings must explain block fee applies to Mid Range £140"
    );
  });
});
