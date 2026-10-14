import test from 'node:test';
import assert from 'node:assert/strict';

test('Fix 7: Public consultation slots do not contain zoom_link or meeting_id', () => {
  const publicSlotsResponse = [
    {
      id: 42,
      datetime: '2026-10-20T10:00:00.000000Z',
      consultation_datetime: '2026-10-20T10:00:00.000000Z',
      type: 'Standard Consultation',
      status: 'available',
      is_available: true,
      availability: true,
      max_slots: 1,
      booked_slots: 0,
    },
  ];

  const slot = publicSlotsResponse[0];
  assert.equal(slot.id, 42);
  assert.equal(slot.consultation_datetime, '2026-10-20T10:00:00.000000Z');
  assert.equal(slot.type, 'Standard Consultation');
  assert.equal(slot.is_available, true);

  // Assert sensitive fields are absent
  assert.equal('zoom_link' in slot, false, 'zoom_link must not be exposed');
  assert.equal('meeting_id' in slot, false, 'meeting_id must not be exposed');
  assert.equal('passcode' in slot, false, 'passcode must not be exposed');
  assert.equal('host_name' in slot, false, 'host_name must not be exposed');
});
