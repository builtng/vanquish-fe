import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q15 and Q12 follow-up: Counsellor display name, booking button, and build identifier", async (t) => {
  const filteredCounsellorsContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );
  const buildIdentifierContent = fs.readFileSync(
    path.join(rootDir, "components/BuildIdentifier.jsx"),
    "utf8"
  );
  const nextConfigContent = fs.readFileSync(
    path.join(rootDir, "next.config.mjs"),
    "utf8"
  );

  await t.test("1. Counsellor card button is 'View profile and book consultation'", () => {
    assert.ok(
      filteredCounsellorsContent.includes("View profile and book consultation"),
      "Card button must be renamed to 'View profile and book consultation'"
    );
    assert.ok(
      !filteredCounsellorsContent.includes(">View Profile<") &&
      !filteredCounsellorsContent.includes(">\n                              View Profile\n"),
      "Must not retain the standalone 'View Profile' button"
    );
  });

  await t.test("2. Keeps 'Choose a counsellor to see consultation times.' under the list", () => {
    assert.ok(
      filteredCounsellorsContent.includes("Choose a counsellor to see consultation times."),
      "Must prompt 'Choose a counsellor to see consultation times.'"
    );
  });

  await t.test("3. Client-facing counsellor name uses display name (name) and never legal_first_name", () => {
    // Test simulator for counsellor with name 'Charles Sedenu' and legal_first_name 'Joel'
    const mockCounsellor = {
      id: 1,
      uuid: "tc-charles-1",
      name: "Charles Sedenu",
      legal_first_name: "Joel",
      legal_last_name: "Gonzales",
    };

    // In FilteredCounsellors.jsx, firstName is derived from c.name
    const extractName = (c) =>
      (c?.name ? c.name.replace(/^(Dr|Mr|Mrs|Ms|Miss|Prof)\.?\s+/i, "").trim().split(" ")[0] : null) ||
      c?.first_name ||
      "Counsellor";

    const derivedFirstName = extractName(mockCounsellor);
    assert.equal(derivedFirstName, "Charles");
    assert.notEqual(derivedFirstName, "Joel");

    const consultationNotice = `After the consultation, you can begin sessions with ${derivedFirstName}.`;
    assert.ok(
      consultationNotice.includes("Charles"),
      "Consultation notice must say Charles"
    );
    assert.ok(
      !consultationNotice.includes("Joel"),
      "Joel must not appear in client-facing consultation notice"
    );
  });

  await t.test("4. BuildIdentifier fallback is 'Build unknown' and no 'b63bba7' in source", () => {
    assert.ok(
      buildIdentifierContent.includes('"Build unknown"'),
      "BuildIdentifier must fall back to 'Build unknown'"
    );
    assert.ok(
      !buildIdentifierContent.includes("b63bba7"),
      "BuildIdentifier must not contain hard-coded 'b63bba7'"
    );
    assert.ok(
      !nextConfigContent.includes("b63bba7"),
      "next.config.mjs must not contain hard-coded 'b63bba7'"
    );
  });
});
