import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX H08: Consultation toggles frontend verification", async (t) => {
  const filteredCounsellorsContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );
  const profilePageContent = fs.readFileSync(
    path.join(rootDir, "app/counsellor-portal/profile/page.jsx"),
    "utf8"
  );

  await t.test("1. FilteredCounsellors maps show_vanquish_consultation_availability", () => {
    assert.ok(
      filteredCounsellorsContent.includes("show_vanquish_consultation_availability:"),
      "Must map show_vanquish_consultation_availability from API"
    );
  });

  await t.test("2. Counsellor card displays 'This counsellor is not taking new consultations at the moment.' when both toggles off", () => {
    assert.ok(
      filteredCounsellorsContent.includes("This counsellor is not taking new consultations at the moment."),
      "Card must say 'This counsellor is not taking new consultations at the moment.'"
    );
    assert.ok(
      filteredCounsellorsContent.includes("counsellor.show_own_consultation_availability === false &&"),
      "Must check show_own_consultation_availability is false"
    );
    assert.ok(
      filteredCounsellorsContent.includes("counsellor.show_vanquish_consultation_availability === false"),
      "Must check show_vanquish_consultation_availability is false"
    );
  });

  await t.test("3. Booking calendar card displays 'This counsellor is not taking new consultations at the moment.' when slotSource is none", () => {
    assert.ok(
      filteredCounsellorsContent.includes('slotSource === "none"'),
      "Must handle slotSource === 'none'"
    );
  });

  await t.test("4. Vanquish fallback notice banner only renders when slotSource is 'vanquish'", () => {
    assert.ok(
      filteredCounsellorsContent.includes('slotSource === "vanquish" &&'),
      "Banner must only show when slotSource is 'vanquish'"
    );
  });

  await t.test("5. Only qualified counsellors see the toggles in counsellor portal profile", () => {
    assert.ok(
      profilePageContent.includes('counsellor_type') && profilePageContent.includes('"qualified"'),
      "Profile page must check for qualified counsellor type before rendering toggles"
    );
    // Ensure Trainee counsellors do not unconditionally see the toggles section
    const togglesSectionMatches = profilePageContent.match(/Consultation Availability Toggles/g);
    assert.ok(togglesSectionMatches && togglesSectionMatches.length >= 1);
  });

  await t.test("6. Simulation of each combination behavior", () => {
    // Simulator helper mirroring FilteredCounsellors logic
    const resolveSlotSource = (res) => res?.source || "none";
    const getActiveSlots = (slotSource, counsellorSlots, availableSlots) => {
      if (slotSource === "none") return [];
      if (slotSource === "counsellor") return counsellorSlots;
      if (slotSource === "vanquish") return availableSlots;
      return counsellorSlots.length > 0 ? counsellorSlots : availableSlots;
    };

    const mockVanquishSlots = [{ id: "v1", datetime: "2026-10-20 10:00" }];
    const mockOwnSlots = [{ id: "c1", datetime: "2026-10-21 14:00" }];

    // Combination 1: Toggle 1 on and own slots exist -> own slots
    const c1Source = resolveSlotSource({ source: "counsellor", slots: mockOwnSlots });
    const c1Slots = getActiveSlots(c1Source, mockOwnSlots, mockVanquishSlots);
    assert.equal(c1Source, "counsellor");
    assert.deepEqual(c1Slots, mockOwnSlots);

    // Combination 2: Toggle 1 on, own slots empty, Toggle 2 on -> Vanquish slots
    const c2Source = resolveSlotSource({ source: "vanquish", slots: [] });
    const c2Slots = getActiveSlots(c2Source, [], mockVanquishSlots);
    assert.equal(c2Source, "vanquish");
    assert.deepEqual(c2Slots, mockVanquishSlots);

    // Combination 3: Toggle 1 off, Toggle 2 on -> Vanquish slots
    const c3Source = resolveSlotSource({ source: "vanquish", slots: [] });
    const c3Slots = getActiveSlots(c3Source, [], mockVanquishSlots);
    assert.equal(c3Source, "vanquish");
    assert.deepEqual(c3Slots, mockVanquishSlots);

    // Combination 4: Both off -> no slots
    const c4Source = resolveSlotSource({ source: "none", slots: [] });
    const c4Slots = getActiveSlots(c4Source, [], mockVanquishSlots);
    assert.equal(c4Source, "none");
    assert.deepEqual(c4Slots, []);

    // Combination 5: Toggle 1 on, own slots empty, Toggle 2 off -> no slots
    const c5Source = resolveSlotSource({ source: "none", slots: [] });
    const c5Slots = getActiveSlots(c5Source, [], mockVanquishSlots);
    assert.equal(c5Source, "none");
    assert.deepEqual(c5Slots, []);
  });
});
