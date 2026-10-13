import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper replicated from app/dashboard/consultations/page.jsx
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

const formatUkTime = (dateObjOrStr) => {
  if (!dateObjOrStr) return null;
  const d = dateObjOrStr instanceof Date ? dateObjOrStr : parseBackendDate(dateObjOrStr);
  if (!d || isNaN(d.getTime())) return null;
  return d.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
  });
};

test('CHECK E01: New consultation shows in Upcoming list and Overview count rises', () => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days in future

  const rawConsultations = [
    {
      id: 101,
      consultation_id: 'CONS101',
      client_id: 1,
      client: { id: 1, name: 'Alice Upcoming', email: 'alice@example.com' },
      status: 'scheduled',
      scheduled_at: futureDate.toISOString(),
      created_at: now.toISOString(),
      payment_status: 'paid',
    },
  ];

  // Transform as done in app/dashboard/consultations/page.jsx
  const transformed = rawConsultations.map((consultation) => {
    const scheduledDateObj = parseBackendDate(consultation.scheduled_at);
    return {
      id: consultation.id,
      consultationId: consultation.consultation_id,
      clientName: consultation.client.name,
      scheduledAt: consultation.scheduled_at,
      scheduledDateObj,
      date: formatUkDate(scheduledDateObj),
      time: formatUkTime(scheduledDateObj),
      status: consultation.status === 'scheduled' ? 'Booked' : consultation.status,
    };
  });

  // Upcoming filter: status === 'Booked' && scheduledDateObj > now
  const upcomingList = transformed.filter(
    (c) => c.status === 'Booked' && c.scheduledDateObj && c.scheduledDateObj.getTime() > now.getTime()
  );

  // 1. Consultation is in the Upcoming list
  assert.strictEqual(upcomingList.length, 1);
  assert.strictEqual(upcomingList[0].id, 101);
  assert.strictEqual(upcomingList[0].clientName, 'Alice Upcoming');

  // 2. Upcoming count rises
  const upcomingCount = transformed.filter(
    (c) => c.status === 'Booked' && c.scheduledDateObj && c.scheduledDateObj.getTime() > now.getTime()
  ).length;
  assert.strictEqual(upcomingCount, 1);
});

test('CHECK E01: Admin notification activity log is transformed and displayed for consultation booked', () => {
  const activities = [
    {
      id: 1,
      action: 'consultation_booked',
      description: 'Alice Upcoming booked a consultation for Friday, Oct 17, 2026 2:00 PM',
      created_at: new Date().toISOString(),
    },
  ];

  // Replicate transform from app/dashboard/page.jsx
  const transformedActivities = activities.map((log, index) => {
    let color = 'gray';
    if (log.action.includes('completed') || log.action.includes('matched') || log.action.includes('signed')) {
      color = 'green';
    } else if (log.action.includes('consultation') || log.action.includes('booked')) {
      color = 'blue';
    }

    return {
      id: log.id || index,
      client: log.description?.split(' ')[0] || 'System',
      action: log.description?.substring(log.description.indexOf(' ') + 1) || log.action,
      color,
    };
  });

  assert.strictEqual(transformedActivities.length, 1);
  assert.strictEqual(transformedActivities[0].color, 'blue');
  assert.strictEqual(transformedActivities[0].client, 'Alice');
});
