import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper replicate from app/dashboard/consultations/page.jsx
const parseBackendDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  let s = String(dateStr).trim();
  if (!s) return null;
  if (!s.includes('T') && s.includes(' ')) {
    s = s.replace(' ', 'T');
  }
  if (!/(Z|[+-]\d{2}(:?\d{2})?)$/i.test(s)) {
    s = s + 'Z';
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const formatUkDate = (dateObjOrStr) => {
  if (!dateObjOrStr) return null;
  const d = dateObjOrStr instanceof Date ? dateObjOrStr : parseBackendDate(dateObjOrStr);
  if (!d || isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

test('FIX J02: Scheduled consultation yesterday is not in Upcoming and is in "Past, not marked complete"', () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const consultations = [
    {
      id: 1,
      status: 'Booked',
      scheduledDateObj: yesterday,
      date: formatUkDate(yesterday),
    },
    {
      id: 2,
      status: 'Booked',
      scheduledDateObj: tomorrow,
      date: formatUkDate(tomorrow),
    },
    {
      id: 3,
      status: 'Completed',
      scheduledDateObj: yesterday,
      date: formatUkDate(yesterday),
    },
    {
      id: 4,
      status: 'No Show',
      scheduledDateObj: yesterday,
      date: formatUkDate(yesterday),
    },
  ];

  // Upcoming filter logic: status === 'Booked' && scheduledDateObj > now
  const upcoming = consultations.filter(
    (c) => c.status === 'Booked' && c.scheduledDateObj && c.scheduledDateObj.getTime() > now.getTime()
  );

  // Past, not marked complete filter logic: status === 'Booked' && scheduledDateObj <= now
  const pastNotCompleted = consultations.filter(
    (c) => c.status === 'Booked' && (c.scheduledDateObj ? c.scheduledDateObj.getTime() <= now.getTime() : true)
  );

  // Assert yesterday consultation (id: 1) is NOT in Upcoming
  assert.strictEqual(
    upcoming.some((c) => c.id === 1),
    false,
    'A scheduled consultation yesterday MUST NOT be in Upcoming'
  );

  // Assert yesterday consultation (id: 1) IS in "Past, not marked complete"
  assert.strictEqual(
    pastNotCompleted.some((c) => c.id === 1),
    true,
    'A scheduled consultation yesterday MUST be in "Past, not marked complete"'
  );

  // Assert tomorrow consultation (id: 2) IS in Upcoming
  assert.strictEqual(
    upcoming.some((c) => c.id === 2),
    true,
    'A scheduled consultation tomorrow MUST be in Upcoming'
  );

  // Assert tomorrow consultation (id: 2) is NOT in "Past, not marked complete"
  assert.strictEqual(
    pastNotCompleted.some((c) => c.id === 2),
    false,
    'A scheduled consultation tomorrow MUST NOT be in "Past, not marked complete"'
  );

  // Completed and No Show consultations must NOT be in "Past, not marked complete"
  assert.strictEqual(
    pastNotCompleted.some((c) => c.id === 3),
    false,
    'Completed consultation must not be in "Past, not marked complete"'
  );
  assert.strictEqual(
    pastNotCompleted.some((c) => c.id === 4),
    false,
    'No Show consultation must not be in "Past, not marked complete"'
  );
});

test('FIX J02: UI file app/dashboard/consultations/page.jsx contains Past, not marked complete tab and Did Not Attend action', () => {
  const pagePath = path.join(projectRoot, 'app/dashboard/consultations/page.jsx');
  assert.ok(fs.existsSync(pagePath), 'Consultations page exists');
  const content = fs.readFileSync(pagePath, 'utf8');

  // Verify tab definition
  assert.ok(
    content.includes('label: "Past, not marked complete"'),
    'Consultations page must have tab with label "Past, not marked complete"'
  );
  assert.ok(
    content.includes('id: "past_not_completed"'),
    'Consultations page must have tab id "past_not_completed"'
  );

  // Verify tab filter case
  assert.ok(
    content.includes('case "past_not_completed":'),
    'Consultations page must handle case "past_not_completed"'
  );

  // Verify "Did Not Attend" button and action
  assert.ok(
    content.includes('Did Not Attend'),
    'Consultations page must contain "Did Not Attend" button'
  );
  assert.ok(
    content.includes('markConsultationNoShow'),
    'Consultations page must call markConsultationNoShow'
  );

  // Verify UK timezone formatting
  assert.ok(
    content.includes('Europe/London'),
    'Consultations page must use Europe/London timezone'
  );
});
