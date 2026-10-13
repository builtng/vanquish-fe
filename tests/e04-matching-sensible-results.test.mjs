import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scorePractitioner,
  computeSuggestedTCs,
  checkNotReadyExclusion,
  BREAKDOWN_LABELS,
} from '../lib/matchingAlgorithm.js';

// Three Test Counsellors
const TC1_SARAH = {
  id: 'tc-001',
  uuid: 'tc-001',
  name: 'Sarah Johnson',
  status: 'Active',
  counsellor_type: 'Trainee',
  current_clients: 2,
  max_clients: 6,
  modality: 'CBT',
  topics_with_experience: ['Anxiety & Panic Attacks', 'Depression', 'Work-Related Stress'],
  topics_not_ready_for: ['Domestic Violence', 'Sexual Abuse/Assault', 'Suicidal Ideation'],
  availability: {
    Monday: ['10am-1050am', '11am-1150am'],
    Wednesday: ['1pm-150pm'],
  },
  gender: 'Female',
  age: 32,
  ethnicity: 'White British',
  sexual_orientation: 'Heterosexual',
};

const TC2_DAVID = {
  id: 'tc-002',
  uuid: 'tc-002',
  name: 'David Chen',
  status: 'Active',
  counsellor_type: 'Trainee',
  current_clients: 4,
  max_clients: 6,
  modality: 'Person-Centred',
  topics_with_experience: [
    'Childhood Trauma',
    'PTSD',
    'Bereavement & Grief',
    'Depression',
    'Anxiety & Panic Attacks',
  ],
  topics_not_ready_for: ['Eating Disorders', 'OCD'],
  availability: {
    Monday: ['1pm-150pm', '2pm-250pm'],
    Thursday: ['5pm-550pm'],
  },
  gender: 'Male',
  age: 38,
  ethnicity: 'Asian',
  sexual_orientation: 'Heterosexual',
};

const TC3_PRIYA = {
  id: 'tc-003',
  uuid: 'tc-003',
  name: 'Priya Patel',
  status: 'Active',
  counsellor_type: 'Trainee',
  current_clients: 1,
  max_clients: 6,
  modality: 'Integrative Therapy',
  topics_with_experience: [
    'Depression',
    'Anxiety & Panic Attacks',
    'Relationship Issues',
    'Low Self-Esteem',
    'Domestic Violence',
  ],
  topics_not_ready_for: ['Eating Disorders', 'Addiction & Substance Misuse'],
  availability: {
    Monday: ['10am-1050am'],
    Tuesday: ['10am-1050am'],
  },
  gender: 'Female',
  age: 29,
  ethnicity: 'British Indian',
  sexual_orientation: 'Heterosexual',
};

// Two Test Clients
const CLIENT1_ALEX = {
  id: 'cl-001',
  name: 'Alex Taylor',
  serviceType: 'Low Cost',
  primaryIssues: ['Anxiety & Panic Attacks', 'Domestic Violence'],
  recommendedModality: 'Integrative Therapy',
  availability: {
    Monday: ['10am-1050am', '11am-1150am'],
  },
  genderPreference: 'Female',
  agePreference: '20-30',
  ethnicityPreference: 'No preference',
  orientationPreference: 'No preference',
};

const CLIENT2_JORDAN = {
  id: 'cl-002',
  name: 'Jordan Smith',
  serviceType: 'Low Cost',
  primaryIssues: ['Depression'],
  recommendedModality: 'No preference',
  availability: {
    Monday: ['1pm-150pm'],
  },
  genderPreference: 'No preference',
  agePreference: 'No preference',
  ethnicityPreference: 'No preference',
  orientationPreference: 'No preference',
};

test('CHECK E04: Matching gives sensible results with VQT six weights and exact exclusion', () => {
  const counsellors = [TC1_SARAH, TC2_DAVID, TC3_PRIYA];
  const clients = [CLIENT1_ALEX, CLIENT2_JORDAN];

  // Evaluate all 6 pairs
  const matrix = [];
  for (const client of clients) {
    for (const tc of counsellors) {
      const result = scorePractitioner(client, tc);
      matrix.push({ client, tc, result });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Confirm "Not ready for" always excludes (exact name match)
  // ─────────────────────────────────────────────────────────────
  const pairAlexSarah = matrix.find(
    (p) => p.client.id === 'cl-001' && p.tc.id === 'tc-001'
  );
  assert.equal(
    pairAlexSarah.result.isExcluded,
    true,
    'Sarah Johnson must be excluded for Alex because Sarah is Not Ready For Domestic Violence'
  );
  assert.equal(
    pairAlexSarah.result.matchScore,
    0,
    'Excluded counsellor must receive a match score of 0'
  );

  // Suggested TCs for Alex must NOT include Sarah Johnson
  const suggestedForAlex = computeSuggestedTCs(CLIENT1_ALEX, counsellors, { limit: 10 });
  assert.equal(
    suggestedForAlex.some((tc) => tc.id === 'tc-001'),
    false,
    'Suggested TCs list for Alex must exclude Sarah Johnson'
  );

  // Check exclusion helper directly
  const exclusionCheck = checkNotReadyExclusion(CLIENT1_ALEX, TC1_SARAH);
  assert.equal(exclusionCheck.isExcluded, true);
  assert.equal(exclusionCheck.matchedIssue, 'Domestic Violence');

  // Substring/partial match must NOT exclude
  const clientChildhoodTrauma = { primaryIssues: ['Childhood Trauma'] };
  const tcTraumaOnly = { topics_not_ready_for: ['Trauma'] };
  assert.equal(
    checkNotReadyExclusion(clientChildhoodTrauma, tcTraumaOnly).isExcluded,
    false,
    'Childhood Trauma must NOT be excluded by Trauma'
  );

  const clientEating = { primaryIssues: ['Eating'] };
  const tcEatingDisorders = { topics_not_ready_for: ['Eating Disorders'] };
  assert.equal(
    checkNotReadyExclusion(clientEating, tcEatingDisorders).isExcluded,
    false,
    'Eating must NOT be excluded by Eating Disorders'
  );

  // ─────────────────────────────────────────────────────────────
  // 2. Confirm "No preference" never lowers a score across VQT weights
  // ─────────────────────────────────────────────────────────────
  for (const tc of counsellors) {
    const pair = matrix.find(
      (p) => p.client.id === 'cl-002' && p.tc.id === tc.id
    );
    const b = pair.result.matchBreakdown;

    // Modality: "No preference" gives maximum 20 points
    assert.equal(
      b.modalityMatch.score,
      20,
      `Modality score for Jordan + ${tc.name} must be 20 (max) because Jordan has No preference`
    );

    // Demographic categories: all "No preference" gives maximum points
    assert.equal(
      b.genderPreference.score,
      20,
      `Gender score for Jordan + ${tc.name} must be 20 (max)`
    );
    assert.equal(
      b.ethnicityPreference.score,
      10,
      `Ethnicity score for Jordan + ${tc.name} must be 10 (max)`
    );
    assert.equal(
      b.sexualOrientationPreference.score,
      5,
      `Sexual orientation score for Jordan + ${tc.name} must be 5 (max)`
    );
    assert.equal(
      b.agePreference.score,
      5,
      `Age score for Jordan + ${tc.name} must be 5 (max)`
    );
  }

  // Client with empty availability / no slot restrictions gets full 40 availability score
  const clientNoAvailPref = {
    ...CLIENT2_JORDAN,
    availability: {},
  };
  const scoreNoAvail = scorePractitioner(clientNoAvailPref, TC2_DAVID);
  assert.equal(
    scoreNoAvail.matchBreakdown.availability.score,
    40,
    'Empty availability preference must award full 40 points without penalty'
  );

  // ─────────────────────────────────────────────────────────────
  // 3. Confirm Availability Overlap is scored proportionally
  // ─────────────────────────────────────────────────────────────
  // Alex wants Monday 10am, 11am (2 slots).
  // David Chen has Monday 1pm, 2pm, Thursday 5pm -> 0 overlap -> 0 / 40
  const pairAlexDavid = matrix.find(
    (p) => p.client.id === 'cl-001' && p.tc.id === 'tc-002'
  );
  assert.equal(
    pairAlexDavid.result.matchBreakdown.availability.score,
    0,
    'David Chen has 0 overlap with Alex -> 0 points'
  );

  // Priya Patel has Monday 10am -> 1 overlap out of 2 requested -> 50% -> 20 / 40
  const pairAlexPriya = matrix.find(
    (p) => p.client.id === 'cl-001' && p.tc.id === 'tc-003'
  );
  assert.equal(
    pairAlexPriya.result.matchBreakdown.availability.score,
    20,
    'Priya Patel has 1 of 2 overlapping slots with Alex -> 20 points'
  );

  // Jordan wants Monday 1pm (1 slot).
  // David Chen has Monday 1pm -> 1 overlap out of 1 requested -> 100% -> 40 / 40
  const pairJordanDavid = matrix.find(
    (p) => p.client.id === 'cl-002' && p.tc.id === 'tc-002'
  );
  assert.equal(
    pairJordanDavid.result.matchBreakdown.availability.score,
    40,
    'David Chen has 1 of 1 overlapping slots with Jordan -> 40 points'
  );

  // Sarah Johnson has Monday 10am, 11am, Wednesday 1pm -> 0 overlap with Monday 1pm -> 0 / 40
  const pairJordanSarah = matrix.find(
    (p) => p.client.id === 'cl-002' && p.tc.id === 'tc-001'
  );
  assert.equal(
    pairJordanSarah.result.matchBreakdown.availability.score,
    0,
    'Sarah Johnson has 0 overlap with Jordan -> 0 points'
  );

  // Priya Patel has Monday 10am, Tuesday 10am -> 0 overlap with Monday 1pm -> 0 / 40
  const pairJordanPriya = matrix.find(
    (p) => p.client.id === 'cl-002' && p.tc.id === 'tc-003'
  );
  assert.equal(
    pairJordanPriya.result.matchBreakdown.availability.score,
    0,
    'Priya Patel has 0 overlap with Jordan -> 0 points'
  );

  // ─────────────────────────────────────────────────────────────
  // 4. Verify Total Ranking Order using VQT's six weights
  // ─────────────────────────────────────────────────────────────
  // For Alex:
  // Priya Patel: 20 (avail) + 20 (mod) + 20 (gender) + 10 (eth) + 5 (ori) + 5 (age) = 80 points
  // David Chen: 0 (avail) + 0 (mod) + 0 (gender) + 10 (eth) + 5 (ori) + 0 (age) = 15 points
  // Sarah Johnson is excluded (0 points)
  assert.equal(suggestedForAlex[0].id, 'tc-003');
  assert.equal(suggestedForAlex[0].matchScore, 80);
  assert.equal(suggestedForAlex[1].id, 'tc-002');
  assert.equal(suggestedForAlex[1].matchScore, 15);

  // For Jordan:
  // David Chen: 40 + 20 + 20 + 10 + 5 + 5 = 100 points
  // Priya Patel: 0 + 20 + 20 + 10 + 5 + 5 = 60 points
  // Sarah Johnson: 0 + 20 + 20 + 10 + 5 + 5 = 60 points
  const suggestedForJordan = computeSuggestedTCs(CLIENT2_JORDAN, counsellors, { limit: 10 });
  assert.equal(suggestedForJordan[0].id, 'tc-002');
  assert.equal(suggestedForJordan[0].matchScore, 100);

  // ─────────────────────────────────────────────────────────────
  // 5. Changing weight changes score dynamically
  // ─────────────────────────────────────────────────────────────
  const customWeights = {
    weights: {
      availability_weight: 20,
      modality_weight: 20,
      gender_weight: 40,
      ethnicity_weight: 10,
      sexual_orientation_weight: 5,
      age_weight: 5,
    },
  };
  const scoreAlexPriyaUpdated = scorePractitioner(CLIENT1_ALEX, TC3_PRIYA, customWeights);
  // Avail: 50% * 20 = 10; Mod: 20; Gender: 40; Eth: 10; Ori: 5; Age: 5 = 90
  assert.equal(scoreAlexPriyaUpdated.matchScore, 90);
  assert.notEqual(scoreAlexPriyaUpdated.matchScore, suggestedForAlex[0].matchScore);
});
