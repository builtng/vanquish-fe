import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const CLIENT_BOOKING_PATH = path.resolve('app/client-booking/page.jsx');
const PENDING_MATCHES_PATH = path.resolve('app/dashboard/pending-matches/page.jsx');
const COMPLETED_MATCHES_PATH = path.resolve('app/dashboard/completed-matches/page.jsx');

test('FIX N05: Low Cost session time set by Vanquish frontend checks', async (t) => {
  const clientBookingSrc = fs.readFileSync(CLIENT_BOOKING_PATH, 'utf-8');
  const pendingMatchesSrc = fs.readFileSync(PENDING_MATCHES_PATH, 'utf-8');
  const completedMatchesSrc = fs.readFileSync(COMPLETED_MATCHES_PATH, 'utf-8');

  await t.test('1. Client booking: handleBookBlock delegates to handleConfirmAutoBlock for Low Cost', () => {
    assert.match(
      clientBookingSrc,
      /handleBookBlock[\s\S]*?clientData\?\.client\?\.service_type\s*===\s*["']Low Cost["'][\s\S]*?return\s+handleConfirmAutoBlock\(\)/,
      'handleBookBlock must immediately delegate to handleConfirmAutoBlock for Low Cost clients rather than allowing date/time picking'
    );
  });

  await t.test('2. Client booking: Low Cost client sees assigned day & time or pending status', () => {
    assert.match(
      clientBookingSrc,
      /Allocated Day & Time/,
      'Allocated Day & Time card section must be present'
    );
    assert.match(
      clientBookingSrc,
      /Pending assignment by Vanquish/,
      'Pending assignment notice must be shown when Low Cost client does not yet have an allocated slot'
    );
    assert.match(
      clientBookingSrc,
      /Session Time Being Assigned/,
      'Modal must inform client that Low Cost session time is assigned by administration team'
    );
  });

  await t.test('3. Client booking: CalendarPicker is not shown for Low Cost block booking', () => {
    assert.match(
      clientBookingSrc,
      /client\?\.service_type\s*!==\s*["']Low Cost["'][\s\S]*?<CalendarPicker/,
      'CalendarPicker must only be rendered when service_type is not Low Cost'
    );
  });

  await t.test('4. Admin pending-matches: offers only overlapping slots for Low Cost', () => {
    assert.match(
      pendingMatchesSrc,
      /selectedClient\?\.serviceType\s*===\s*["']Low Cost["']\s*\?\s*\([\s\S]*?Overlapping Slots Only/,
      'Pending matches must show Overlapping Slots Only badge and not offer All Slots toggle for Low Cost'
    );
    assert.match(
      pendingMatchesSrc,
      /if\s*\(\s*isLowCost\s*\)\s*return\s+slot\.isOverlap;/,
      'Slots to render must strictly filter to slot.isOverlap for Low Cost clients'
    );
    assert.match(
      pendingMatchesSrc,
      /if\s*\(\s*isLowCost\s*&&\s*!slot\.isOverlap\s*\)\s*return/,
      'Non-overlapping slots cannot be selected for Low Cost clients'
    );
    assert.match(
      pendingMatchesSrc,
      /if\s*\(\s*selectedClient\.serviceType\s*===\s*["']Low Cost["'][\s\S]*?!selectedSlot\.isOverlap[\s\S]*?Low Cost session time must be in both the client's and counsellor's availability/,
      'Submitting match assignment must enforce that selected slot is an overlapping slot'
    );
  });

  await t.test('5. Admin completed-matches: offers only overlapping slots for Low Cost', () => {
    assert.match(
      completedMatchesSrc,
      /assignSlotClient\?\.serviceType\s*===\s*["']Low Cost["']\s*\?\s*\([\s\S]*?Overlapping Slots Only/,
      'Completed matches Assign Session Time must restrict to Overlapping Slots Only for Low Cost'
    );
    assert.match(
      completedMatchesSrc,
      /if\s*\(\s*isLowCost\s*\)\s*return\s+slot\.isOverlap;/,
      'Completed matches slotsToRender must restrict to slot.isOverlap for Low Cost'
    );
    assert.match(
      completedMatchesSrc,
      /assignSlotClient\?\.serviceType\s*===\s*["']Low Cost["']\s*&&\s*!selectedSlotToAssign\.isOverlap/,
      'Saving assigned slot must reject non-overlapping slots for Low Cost'
    );
  });

  await t.test('6. Mid Range and Coaching are unchanged', () => {
    assert.match(
      clientBookingSrc,
      /pricing\[serviceType\]\s*\|\|\s*pricing\[["']Mid Range["']\]/,
      'Mid Range pricing fallback remains intact'
    );
    assert.match(
      clientBookingSrc,
      /setPendingBookingData\(\{\s*client_uuid:\s*clientData\.client\.uuid,\s*start_date:\s*selectedDate\s*\|\|\s*selectedSlot\.date,\s*time_slot:\s*selectedSlot\s*\?\s*selectedSlot\.time\s*:\s*null,\s*sessions_count:\s*sessionsCount,\s*\}\)/,
      'Flexible start date and time slot selection remains intact for Mid Range and Coaching'
    );
  });
});
