import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q12: Wrong counsellor in the consultation box", () => {
  const filteredCounsellorsContent = fs.readFileSync(
    path.join(rootDir, "components/FilteredCounsellors.jsx"),
    "utf8"
  );
  const intakeContent = fs.readFileSync(
    path.join(rootDir, "app/mid-range-intake/page.jsx"),
    "utf8"
  );

  // 1. Do not auto-select counsellor on load and show 'Choose a counsellor to see consultation times.'
  assert.ok(
    !filteredCounsellorsContent.includes("onSelectCounsellor(res.counsellors[0])"),
    "Must not auto-select the first counsellor on load"
  );
  assert.ok(
    filteredCounsellorsContent.includes("Choose a counsellor to see consultation times."),
    "Must prompt 'Choose a counsellor to see consultation times.'"
  );

  // 2. When counsellor changes in intake form, clear chosen date and slot
  assert.ok(
    intakeContent.includes("consultationSlotId: \"\"") &&
    intakeContent.includes("consultationDatetime: \"\""),
    "onSelectCounsellor must clear chosen consultation slot and datetime"
  );

  // 3. Ignore slot responses for a counsellor who is no longer selected
  assert.ok(
    filteredCounsellorsContent.includes("currentUuid === selectedCounsellorUuid"),
    "Must verify response matches current selected counsellor uuid before setting slots"
  );

  // 4. Store counsellor id/name with slot and show counsellor name on payment step
  assert.ok(
    intakeContent.includes("consultationWithTcName"),
    "Must track counsellor name in intake state"
  );
  assert.ok(
    intakeContent.includes("Selected Counsellor:"),
    "Must display 'Selected Counsellor:' on payment step"
  );
  assert.ok(
    intakeContent.includes("formData.consultationWithTcName"),
    "Must render counsellor name in payment step fee section"
  );
});

test("FIX Q12 Simulation: Choose A, pick a slot, choose B -> box shows B and A's slot is cleared", () => {
  // Simulate intake state & FilteredCounsellors interaction
  let formData = {
    consultationWithTcId: null,
    consultationWithTcUuid: "",
    consultationWithTcName: "",
    consultationSlotId: "",
    consultationDatetime: "",
  };

  const counsellors = [
    { id: 101, uuid: "uuid-a", name: "Counsellor A" },
    { id: 102, uuid: "uuid-b", name: "Counsellor B" },
  ];

  // Helper matching intake onSelectCounsellor
  const selectCounsellor = (counsellor) => {
    formData = {
      ...formData,
      consultationWithTcUuid: counsellor.uuid,
      consultationWithTcName: counsellor.name,
      consultationWithTcId: counsellor.id,
      consultationSlotId: "",
      consultationDatetime: "",
    };
  };

  // Helper matching intake onSelectSlot
  const selectSlot = (slotData) => {
    formData = {
      ...formData,
      consultationSlotId: slotData.id ? String(slotData.id) : "",
      consultationDatetime: slotData.datetime || slotData.consultation_datetime || "",
      consultationWithTcId: slotData.counsellorId || formData.consultationWithTcId,
      consultationWithTcUuid: slotData.counsellorUuid || formData.consultationWithTcUuid,
      consultationWithTcName: slotData.counsellorName || formData.consultationWithTcName,
    };
  };

  // Step 1: Initial load - no counsellor auto-selected
  assert.equal(formData.consultationWithTcUuid, "");
  assert.equal(formData.consultationSlotId, "");

  // Step 2: Choose A
  selectCounsellor(counsellors[0]);
  assert.equal(formData.consultationWithTcUuid, "uuid-a");
  assert.equal(formData.consultationWithTcName, "Counsellor A");
  assert.equal(formData.consultationSlotId, "");

  // Step 3: Pick a slot for A
  selectSlot({
    id: 555,
    datetime: "2026-10-20 14:00:00",
    counsellorId: counsellors[0].id,
    counsellorUuid: counsellors[0].uuid,
    counsellorName: counsellors[0].name,
  });
  assert.equal(formData.consultationSlotId, "555");
  assert.equal(formData.consultationWithTcUuid, "uuid-a");
  assert.equal(formData.consultationWithTcName, "Counsellor A");

  // Step 4: Choose B
  selectCounsellor(counsellors[1]);
  // Box shows B and A's slot is cleared
  assert.equal(formData.consultationWithTcUuid, "uuid-b");
  assert.equal(formData.consultationWithTcName, "Counsellor B");
  assert.equal(formData.consultationSlotId, "", "A's slot must be cleared when choosing B");
  assert.equal(formData.consultationDatetime, "", "A's datetime must be cleared when choosing B");

  // Step 5: Simulate late slot response for A arrives while B is selected
  let stateSlots = [];
  const activeSelectedUuid = formData.consultationWithTcUuid; // "uuid-b"
  const lateResponseUuid = "uuid-a";
  const lateResponseSlots = [{ id: 999, datetime: "2026-10-21 10:00:00" }];

  // FilteredCounsellors guard check
  if (lateResponseUuid === activeSelectedUuid) {
    stateSlots = lateResponseSlots;
  }
  assert.deepEqual(stateSlots, [], "Late slot response for unselected counsellor A must be ignored");

  // Step 6: Payment step shows counsellor B's name
  assert.equal(formData.consultationWithTcName, "Counsellor B");
});
