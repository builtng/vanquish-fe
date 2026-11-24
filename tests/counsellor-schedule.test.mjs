import test from "node:test";
import assert from "node:assert/strict";
import { upcomingSchedule, scheduleLabel, ukTime, ukDate } from "../lib/counsellorSchedule.js";

test("booked therapy sessions appear alongside consultations, soonest first (VQT #8)", () => {
  const list = upcomingSchedule({
    upcoming_consultations: [{ id: 1, scheduled_at: "2026-12-05T09:00:00Z" }],
    upcoming_sessions: [
      { id: 1, scheduled_at: "2026-12-08T10:00:00Z", is_block_booking: true, block_number: 2, total_sessions_in_block: 4 },
      { id: 2, scheduled_at: "2026-12-01T10:00:00Z", is_block_booking: true, block_number: 1, total_sessions_in_block: 4 },
    ],
  });
  assert.deepEqual(list.map((i) => i.key), ["session-2", "consultation-1", "session-1"]);
  assert.equal(scheduleLabel(list[0]), "Session 1 of 4");
  assert.equal(scheduleLabel(list[1]), "Consultation");
});

test("no data gives an empty list", () => {
  assert.deepEqual(upcomingSchedule(null), []);
  assert.deepEqual(upcomingSchedule({ upcoming_consultations: [] }), []);
});

test("times are UK time whatever the viewer's time zone", () => {
  // 10:00 UTC in December = 10:00 UK; 09:00 UTC in June = 10:00 UK (BST).
  assert.equal(ukTime("2026-12-01T10:00:00.000000Z"), "10:00");
  assert.equal(ukTime("2026-06-02T09:00:00Z"), "10:00");
  assert.equal(ukDate("2026-12-01T23:30:00Z", { day: "numeric" }), "1");
});
