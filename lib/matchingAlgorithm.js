import { computeOverlapSchedule } from './availabilityMatcher.js';

export const BREAKDOWN_LABELS = {
  availability: 'Availability',
  modalityMatch: 'Modality Match',
  genderPreference: 'Gender Preference',
  ethnicityPreference: 'Ethnicity Preference',
  sexualOrientationPreference: 'Sexual Orientation Preference',
  agePreference: 'Age Preference',
  // Legacy aliases
  clinicalIssues: 'Clinical Issues',
  counsellorPreferences: 'Demographic Preferences',
  caseloadBalance: 'Caseload Balance',
};

const cleanStr = (s) => String(s || '').trim().toLowerCase();

/**
 * Checks if a counsellor has any topic in topics_not_ready_for matching
 * any of the client's primary issues.
 * Hard exclusion: matches on exact area names only (trimmed, case-insensitive).
 * Substring / partial word matching is NOT used.
 */
export function checkNotReadyExclusion(client, tc) {
  const clientIssuesList = Array.isArray(client?.primaryIssues)
    ? client.primaryIssues
    : Array.isArray(client?.primary_issues)
      ? client.primary_issues
      : Array.isArray(client?.support_areas)
        ? client.support_areas
        : [];

  const notReadyList = Array.isArray(tc?.topics_not_ready_for)
    ? tc.topics_not_ready_for
    : Array.isArray(tc?.topicsNotReadyFor)
      ? tc.topicsNotReadyFor
      : typeof tc?.topics_not_ready_for === 'string'
        ? (() => {
            try {
              return JSON.parse(tc.topics_not_ready_for);
            } catch {
              return [tc.topics_not_ready_for];
            }
          })()
        : [];

  for (const issue of clientIssuesList) {
    const cleanIssue = cleanStr(issue);
    if (!cleanIssue) continue;
    for (const notReady of notReadyList) {
      const cleanNotReady = cleanStr(notReady);
      if (!cleanNotReady) continue;
      // Exact area name match only (trimmed, case-insensitive)
      if (cleanIssue === cleanNotReady) {
        return {
          isExcluded: true,
          matchedIssue: issue,
          counsellorNotReadyFor: notReady,
          reason: `Practitioner is not ready for client issue: "${issue}" (listed under "${notReady}")`,
        };
      }
    }
  }

  return { isExcluded: false };
}

/**
 * Scores a practitioner against a client using VQT's six weights:
 * 1. Availability Overlap (default 40 points)
 * 2. Modality Alignment (default 20 points)
 * 3. Gender Preference (default 20 points)
 * 4. Ethnicity Preference (default 10 points)
 * 5. Sexual Orientation Preference (default 5 points)
 * 6. Age Preference (default 5 points)
 * Sum of weights = 100 points.
 *
 * Rules:
 * 1. "Not ready for" always excludes (exact name match only).
 * 2. "No preference" never lowers a score (awards 100% of the category weight).
 * 3. Availability overlap is scored proportionally.
 */
export function scorePractitioner(client, tc, options = {}) {
  const weights = {
    availability: Number(options.weights?.availability_weight ?? 40),
    modality: Number(options.weights?.modality_weight ?? 20),
    gender: Number(options.weights?.gender_weight ?? 20),
    ethnicity: Number(options.weights?.ethnicity_weight ?? 10),
    sexual_orientation: Number(options.weights?.sexual_orientation_weight ?? 5),
    age: Number(options.weights?.age_weight ?? 5),
  };

  const totalWeight =
    weights.availability +
      weights.modality +
      weights.gender +
      weights.ethnicity +
      weights.sexual_orientation +
      weights.age || 100;

  const breakdown = {};
  const flags = [];

  // Rule 1: "Not ready for" always excludes
  const exclusion = checkNotReadyExclusion(client, tc);
  const isExcluded = exclusion.isExcluded;
  const exclusionReason = exclusion.reason || null;
  if (isExcluded) {
    flags.push(exclusionReason);
  }

  // Helper to check for "No preference"
  const isNoPref = (val) =>
    !val ||
    ['no preference', 'no_preference', 'any', 'all', 'none', 'unsure', 'n/a'].includes(
      cleanStr(val)
    );

  // 1. Availability Overlap
  const clientAvail =
    client?.rawAvailability && !Array.isArray(client.rawAvailability)
      ? client.rawAvailability
      : !Array.isArray(client?.availability)
        ? client?.availability || {}
        : {};
  const tcAvail = tc?.availability || tc?.rawAvailability || {};

  const parsedClientAvail =
    typeof clientAvail === 'string'
      ? (() => {
          try {
            return JSON.parse(clientAvail);
          } catch {
            return {};
          }
        })()
      : clientAvail && typeof clientAvail === 'object'
        ? clientAvail
        : {};

  const parsedTcAvail =
    typeof tcAvail === 'string'
      ? (() => {
          try {
            return JSON.parse(tcAvail);
          } catch {
            return {};
          }
        })()
      : tcAvail && typeof tcAvail === 'object'
        ? tcAvail
        : {};

  const overlap = computeOverlapSchedule(parsedClientAvail, parsedTcAvail);
  const hasClientSlots = overlap.totalClientSlots > 0;

  const availPercentage = hasClientSlots ? overlap.overlapPercentage : 100;
  const availPoints = (availPercentage / 100) * weights.availability;
  const availMatched = !hasClientSlots || overlap.hasOverlap;
  const availDetail = hasClientSlots
    ? `${overlap.totalOverlapCount} overlapping weekly slot(s) found (${availPercentage}% match)`
    : 'No client availability on record to compare (full score)';

  breakdown.availability = {
    score: Math.round(availPoints),
    max: Math.round(weights.availability),
    percentage: Math.round(availPercentage),
    matched: availMatched,
    detail: availDetail,
  };

  if (hasClientSlots && !overlap.hasOverlap) {
    flags.push('No overlapping availability with this client');
  }

  // 2. Modality Match
  const clientModality =
    client?.recommendedModality ||
    client?.preferredModality ||
    client?.modalityPreference ||
    client?.modality_preference ||
    client?.modality;

  const isNoModalityPref = isNoPref(clientModality);
  let modalityMatched = false;
  if (!isNoModalityPref && tc?.modality) {
    const cleanPref = cleanStr(clientModality);
    const cleanTc = cleanStr(tc.modality);
    modalityMatched =
      cleanTc.includes(cleanPref) ||
      cleanPref.includes(cleanTc) ||
      ((cleanPref === 'integrative therapy' || cleanPref === 'integrative') &&
        cleanTc.includes('integrative'));
  }

  const modalityPercentage = (isNoModalityPref || modalityMatched) ? 100 : 0;
  const modalityPoints = (modalityPercentage / 100) * weights.modality;
  breakdown.modalityMatch = {
    score: Math.round(modalityPoints),
    max: Math.round(weights.modality),
    percentage: modalityPercentage,
    matched: isNoModalityPref || modalityMatched,
    detail: isNoModalityPref
      ? 'No specific modality preference specified (full score)'
      : modalityMatched
        ? `Offers the requested modality (${clientModality})`
        : `Does not offer requested modality (${clientModality}); offers ${tc?.modality || 'N/A'}`,
  };

  if (!isNoModalityPref && !modalityMatched) {
    flags.push(
      `Requested modality "${clientModality}" not offered (practitioner offers ${tc?.modality || 'N/A'})`
    );
  }

  // 3. Gender Preference
  const clientGender = client?.genderPreference || client?.gender_preference;
  const isNoGenderPref = isNoPref(clientGender);
  const genderMatched =
    isNoGenderPref ||
    (tc?.gender && cleanStr(tc.gender) === cleanStr(clientGender));
  const genderPercentage = genderMatched ? 100 : 0;
  const genderPoints = (genderPercentage / 100) * weights.gender;
  breakdown.genderPreference = {
    score: Math.round(genderPoints),
    max: Math.round(weights.gender),
    percentage: genderPercentage,
    matched: genderMatched,
    detail: isNoGenderPref
      ? 'No gender preference specified (full score)'
      : genderMatched
        ? `Gender matched: ${tc?.gender}`
        : `Wanted ${clientGender}, practitioner is ${tc?.gender || 'unspecified'}`,
  };

  // 4. Ethnicity Preference
  const clientEthnicity = client?.ethnicityPreference || client?.ethnicity_preference;
  const isNoEthnicityPref = isNoPref(clientEthnicity);
  let ethnicityMatched = isNoEthnicityPref;
  if (!isNoEthnicityPref && tc?.ethnicity) {
    const tcEth = cleanStr(tc.ethnicity);
    const clEth = cleanStr(clientEthnicity);
    ethnicityMatched = tcEth === clEth || tcEth.includes(clEth) || clEth.includes(tcEth);
  }
  const ethnicityPercentage = ethnicityMatched ? 100 : 0;
  const ethnicityPoints = (ethnicityPercentage / 100) * weights.ethnicity;
  breakdown.ethnicityPreference = {
    score: Math.round(ethnicityPoints),
    max: Math.round(weights.ethnicity),
    percentage: ethnicityPercentage,
    matched: ethnicityMatched,
    detail: isNoEthnicityPref
      ? 'No ethnicity preference specified (full score)'
      : ethnicityMatched
        ? `Ethnicity matched: ${tc?.ethnicity}`
        : `Wanted ${clientEthnicity}, practitioner is ${tc?.ethnicity || 'unspecified'}`,
  };

  // 5. Sexual Orientation Preference
  const clientOrientation = client?.orientationPreference || client?.orientation_preference;
  const isNoOrientationPref = isNoPref(clientOrientation);
  let orientationMatched = isNoOrientationPref;
  const tcOriVal = tc?.sexual_orientation || tc?.sexualOrientation || tc?.sexuality;
  if (!isNoOrientationPref && tcOriVal) {
    const tcOri = cleanStr(tcOriVal);
    const clOri = cleanStr(clientOrientation);
    orientationMatched = tcOri === clOri || tcOri.includes(clOri) || clOri.includes(tcOri);
  }
  const orientationPercentage = orientationMatched ? 100 : 0;
  const orientationPoints = (orientationPercentage / 100) * weights.sexual_orientation;
  breakdown.sexualOrientationPreference = {
    score: Math.round(orientationPoints),
    max: Math.round(weights.sexual_orientation),
    percentage: orientationPercentage,
    matched: orientationMatched,
    detail: isNoOrientationPref
      ? 'No sexual orientation preference specified (full score)'
      : orientationMatched
        ? `Orientation matched: ${tcOriVal}`
        : `Wanted ${clientOrientation}, practitioner is ${tcOriVal || 'unspecified'}`,
  };

  // 6. Age Preference
  const clientAge = client?.agePreference || client?.age_preference;
  const isNoAgePref = isNoPref(clientAge);
  let ageMatched = isNoAgePref;
  if (!isNoAgePref && tc?.age !== undefined && tc?.age !== null) {
    const a = parseInt(tc.age, 10);
    if (!isNaN(a)) {
      const pref = String(clientAge).trim();
      const matchRange = pref.match(/^(\d+)\s*-\s*(\d+)$/);
      const matchPlus = pref.match(/^(\d+)\s*\+$/);
      if (matchRange) {
        ageMatched = a >= parseInt(matchRange[1], 10) && a <= parseInt(matchRange[2], 10);
      } else if (matchPlus) {
        ageMatched = a >= parseInt(matchPlus[1], 10);
      } else {
        ageMatched = true;
      }
    } else {
      ageMatched = true;
    }
  }
  const agePercentage = ageMatched ? 100 : 0;
  const agePoints = (agePercentage / 100) * weights.age;
  breakdown.agePreference = {
    score: Math.round(agePoints),
    max: Math.round(weights.age),
    percentage: agePercentage,
    matched: ageMatched,
    detail: isNoAgePref
      ? 'No age preference specified (full score)'
      : ageMatched
        ? `Age matched: ${tc?.age}`
        : `Wanted age range ${clientAge}, practitioner is ${tc?.age || 'unspecified'}`,
  };

  // Legacy convenience fields so older callers don't fail
  breakdown.clinicalIssues = {
    score: 0,
    max: 0,
    percentage: 100,
    matched: true,
    detail: 'Clinical issues are evaluated via "Not ready for" hard exclusions',
  };
  breakdown.counsellorPreferences = {
    score: Math.round(genderPoints + ethnicityPoints + orientationPoints + agePoints),
    max: Math.round(weights.gender + weights.ethnicity + weights.sexual_orientation + weights.age),
    percentage: Math.round(
      ((genderPoints + ethnicityPoints + orientationPoints + agePoints) /
        (weights.gender + weights.ethnicity + weights.sexual_orientation + weights.age || 1)) *
        100
    ),
    matched: genderMatched && ethnicityMatched && orientationMatched && ageMatched,
    detail: 'Combined demographic preferences',
  };

  // Caseload flag check (does NOT affect score)
  const maxCaseload = tc?.max_clients || 6;
  const currentCaseload = tc?.current_clients || 0;
  const utilization = maxCaseload > 0 ? currentCaseload / maxCaseload : 1;
  if (utilization >= 0.9) {
    flags.push('Practitioner is near full caseload capacity');
  }

  const rawSum =
    availPoints +
    modalityPoints +
    genderPoints +
    ethnicityPoints +
    orientationPoints +
    agePoints;

  const score = isExcluded
    ? 0
    : Math.round((rawSum / totalWeight) * 100);

  return {
    id: tc?.uuid || tc?.id,
    uuid: tc?.uuid || tc?.id,
    name: tc?.name,
    modality: tc?.modality || 'N/A',
    matchScore: score,
    match_score: score,
    matchBreakdown: breakdown,
    match_breakdown: [
      { label: 'Availability Match', weight: weights.availability, score: availPercentage },
      { label: 'Modality Match', weight: weights.modality, score: modalityPercentage },
      { label: 'Gender Preference', weight: weights.gender, score: genderPercentage },
      { label: 'Ethnicity Preference', weight: weights.ethnicity, score: ethnicityPercentage },
      { label: 'Sexual Orientation Preference', weight: weights.sexual_orientation, score: orientationPercentage },
      { label: 'Age Preference', weight: weights.age, score: agePercentage },
    ],
    flags,
    isExcluded,
    exclusionReason,
    currentClients: currentCaseload,
    counsellor_type:
      tc?.counsellor_type || (client?.serviceType !== 'Low Cost' ? 'Qualified' : 'Trainee'),
    counsellorType:
      tc?.counsellor_type || (client?.serviceType !== 'Low Cost' ? 'Qualified' : 'Trainee'),
    availability: utilization < 0.8 ? 'High' : 'Low',
    rawAvailability: tc?.availability || {},
  };
}

/**
 * Computes suggested Training/Qualified Counsellors for a client.
 * Returns only eligible, non-excluded practitioners sorted by matchScore descending.
 */
export function computeSuggestedTCs(client, trainingCounsellors, options = {}) {
  const limit = options.limit !== undefined ? options.limit : 3;

  if (!client || !Array.isArray(trainingCounsellors)) {
    return [];
  }

  const clientService = cleanStr(client.serviceType || client.service_type);
  const isLowCost = clientService === 'low cost' || clientService === 'low-cost';
  const isQualifiedService = [
    'mid range',
    'mid-range',
    'coaching',
    'counselling & coaching',
    'counselling and coaching',
  ].includes(clientService);

  return trainingCounsellors
    .filter((tc) => {
      // Must be Active and have capacity
      const isActive =
        tc.status === 'Active' &&
        (tc.current_clients || 0) < (tc.max_clients || 6);

      const tcType =
        tc.counsellor_type ||
        tc.counsellorType ||
        (tc.offers_mid_range || tc.offers_coaching ? 'Qualified' : 'Trainee');

      const matchesService =
        !clientService ||
        (isLowCost && tcType === 'Trainee') ||
        (isQualifiedService && tcType === 'Qualified') ||
        (!isLowCost && !isQualifiedService);

      if (!isActive || !matchesService) {
        return false;
      }

      // Rule 1: "Not ready for" always excludes
      const exclusion = checkNotReadyExclusion(client, tc);
      if (exclusion.isExcluded) {
        return false;
      }

      return true;
    })
    .map((tc) => scorePractitioner(client, tc, options))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
