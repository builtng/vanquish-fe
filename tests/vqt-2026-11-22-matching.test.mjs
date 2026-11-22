import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(rootDir, p), "utf8");

test("22 Nov #2/#3: slots match by start time, whatever format each form saved", async () => {
  const m = await import(path.join(rootDir, "lib/availabilityMatcher.js"));
  for (const s of ["10am-1050am", "10am-11am", "10:00am - 10:50am", "10:00", "10AM-11AM", "morning-early"]) {
    assert.deepEqual(m.slotStartTimes(s), ["10:00"], s);
  }
  assert.deepEqual(m.slotStartTimes("1pm-2pm"), ["13:00"]);
  assert.deepEqual(m.slotStartTimes("12pm-1250pm"), ["12:00"]);

  // Client form format vs counsellor form format, different day-name case.
  const r = m.computeOverlapSchedule(
    { Tuesday: ["10am-1050am"], monday: ["1pm-150pm"] },
    { tuesday: ["10am-11am"], Monday: ["13:00"] },
  );
  assert.equal(r.totalOverlapCount, 2);
  assert.deepEqual(r.overlappingSlotsList.map((x) => `${x.day} ${x.slot}`).sort(), ["Monday 1pm-150pm", "Tuesday 10am-1050am"]);
});

test("22 Nov #4: Practitioners 'Assign Client' sends the weekly day and time for Low Cost clients", () => {
  const page = read("app/dashboard/training-counsellors/page.jsx");
  assert.ok(page.includes('import { computeOverlapSchedule } from "@/lib/availabilityMatcher";'));
  assert.ok(page.includes("allocated_day: assignForm.day"));
  assert.ok(page.includes("allocated_time: assignForm.slot"));
  assert.ok(page.includes("manual_override: manual"));
  assert.ok(page.includes('id="assignDay"') && page.includes('id="assignSlot"'));
});

test("22 Nov #7: booking banner names the last session and the booking deadline, not 'block ends'", () => {
  const page = read("app/client-booking/page.jsx");
  assert.ok(!page.includes("will come to an end on"));
  assert.ok(page.includes("Your last booked session is"));
  assert.ok(page.includes("Book your next block by"));
});
