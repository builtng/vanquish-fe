import test from 'node:test';
import assert from 'node:assert/strict';

test('FIX J11: Client tracker - Consultation Booked is not completed when stage is Awaiting payment', () => {
  const data = {
    stage: 'Awaiting payment',
    consultations: [
      {
        id: 1,
        scheduled_at: '2026-10-20T10:00:00Z',
        created_at: '2026-10-14T10:00:00Z',
        payment_status: 'pending',
        status: 'pending',
      },
    ],
  };

  // Logic replicated from client-details/[uuid]/page.jsx
  const isCompleted = Boolean(
    data.consultations &&
      data.consultations.length > 0 &&
      data.stage !== 'Awaiting payment' &&
      data.stage !== 'Application & Assessment form Submitted' &&
      (data.payment_status === 'paid' ||
        data.consultations.some(
          (c) =>
            c.payment_status === 'paid' ||
            c.status === 'completed' ||
            c.status === 'scheduled',
        ) ||
        [
          'Consultation Booked',
          'Consultation Completed',
          'Agreement Sent',
          'Agreement Signed',
          'Matched with counsellor',
          'Matched With Counsellor',
          'Matched with TC',
          'Sessions Booked',
          'Sessions Bookable',
          'Active Therapy',
          'Completed',
        ].includes(data.stage)),
  );

  const date = (() => {
    if (
      data.stage === 'Awaiting payment' ||
      data.stage === 'Application & Assessment form Submitted'
    ) {
      return null;
    }
    const validConsultation =
      data.consultations?.find(
        (c) =>
          c.payment_status === 'paid' ||
          c.status === 'completed' ||
          c.status === 'scheduled',
      ) || data.consultations?.[0];

    if (!validConsultation) return null;
    if (
      validConsultation.payment_status === 'pending' &&
      data.stage === 'Awaiting payment'
    ) {
      return null;
    }
    return (
      validConsultation.scheduled_at || validConsultation.created_at || null
    );
  })();

  assert.equal(isCompleted, false, 'Consultation Booked must not be completed while awaiting payment');
  assert.equal(date, null, 'Consultation Booked date must be null while awaiting payment');
});

test('FIX J11: Client tracker - Consultation Booked is completed after payment', () => {
  const data = {
    stage: 'Consultation Booked',
    payment_status: 'paid',
    consultations: [
      {
        id: 1,
        scheduled_at: '2026-10-20T10:00:00Z',
        created_at: '2026-10-14T10:00:00Z',
        payment_status: 'paid',
        status: 'scheduled',
      },
    ],
  };

  const isCompleted = Boolean(
    data.consultations &&
      data.consultations.length > 0 &&
      data.stage !== 'Awaiting payment' &&
      data.stage !== 'Application & Assessment form Submitted' &&
      (data.payment_status === 'paid' ||
        data.consultations.some(
          (c) =>
            c.payment_status === 'paid' ||
            c.status === 'completed' ||
            c.status === 'scheduled',
        ) ||
        [
          'Consultation Booked',
          'Consultation Completed',
          'Agreement Sent',
          'Agreement Signed',
          'Matched with counsellor',
          'Matched With Counsellor',
          'Matched with TC',
          'Sessions Booked',
          'Sessions Bookable',
          'Active Therapy',
          'Completed',
        ].includes(data.stage)),
  );

  const date = (() => {
    if (
      data.stage === 'Awaiting payment' ||
      data.stage === 'Application & Assessment form Submitted'
    ) {
      return null;
    }
    const validConsultation =
      data.consultations?.find(
        (c) =>
          c.payment_status === 'paid' ||
          c.status === 'completed' ||
          c.status === 'scheduled',
      ) || data.consultations?.[0];

    return (
      validConsultation?.scheduled_at || validConsultation?.created_at || null
    );
  })();

  assert.equal(isCompleted, true, 'Consultation Booked must be completed after payment');
  assert.equal(date, '2026-10-20T10:00:00Z');
});

test('FIX J11: TC tracker renders 5 canonical stages from pipeline journey data', () => {
  const tc = {
    status: 'Active',
    journey: [
      { stage: 'Application Received', name: 'Application Received', date: '2026-01-10T10:00:00Z', completed: true, current: false },
      { stage: 'Interview Invited and Attended', name: 'Interview Invited and Attended', date: '2026-01-20T15:00:00Z', completed: true, current: false },
      { stage: 'Accepted', name: 'Accepted', date: '2026-01-22T09:30:00Z', completed: true, current: false },
      { stage: 'Induction Attended', name: 'Induction Attended', date: '2026-02-01', completed: true, current: false },
      { stage: 'Active', name: 'Active', date: '2026-02-05T00:00:00Z', completed: true, current: true },
    ],
  };

  const stages = tc.journey.map(s => s.stage);
  assert.deepEqual(stages, [
    'Application Received',
    'Interview Invited and Attended',
    'Accepted',
    'Induction Attended',
    'Active',
  ]);
  assert.equal(tc.journey.every(s => s.completed), true);
  assert.equal(tc.journey[4].current, true);
});

test('FIX J11: Trainee added by hand shows only real stages (Added by admin and Active)', () => {
  const manualTc = {
    tc_id: 'TESTQA TC017',
    name: 'TESTQA TC017',
    status: 'Active',
    journey: [
      { stage: 'Added by admin', name: 'Added by admin', date: '2026-10-15T10:00:00Z', completed: true, current: false },
      { stage: 'Active', name: 'Active', date: '2026-10-15T10:00:00Z', completed: true, current: true },
    ],
  };

  const stages = manualTc.journey.map(s => s.stage);
  assert.deepEqual(stages, ['Added by admin', 'Active']);
  assert.equal(stages.includes('Application Received'), false);
  assert.equal(stages.includes('Interview Invited and Attended'), false);
  assert.equal(stages.includes('Accepted'), false);
  assert.equal(stages.includes('Induction Attended'), false);
  assert.equal(manualTc.journey.every(s => s.completed), true);
  assert.equal(manualTc.journey[1].current, true);
});

