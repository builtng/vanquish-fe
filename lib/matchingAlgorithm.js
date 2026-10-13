import { computeOverlapSchedule } from './availabilityMatcher.js';

export const BREAKDOWN_LABELS = {
  availability: 'Availability',
  modalityMatch: 'Modality Match',
  clinicalIssues: 'Clinical Issues',
  counsellorPreferences: 'Counsellor Preferences',
  caseloadBalance: 'Caseload Balance',
};

const cleanStr = (s) => String(s || '').trim().toLowerCase();

/**
 * Checks if a counsellor has any topic in topics_not_ready_for matching
 * any of the client's primary issues.
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
      if (
        cleanIssue === cleanNotReady ||
        cleanIssue.includes(cleanNotReady) ||
        cleanNotReady.includes(cleanIssue)
      ) {
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
 * Scores a practitioner against a client across 5 factors:
 * 1. Availability Overlap (40 points max)
 * 2. Modality Alignment (20 points max)
 * 3. Clinical Issues / Specialisation (15 points max)
 * 4. Counsellor Demographic Preferences (15 points max)
 * 5. Caseload Balance (10 points max)
 *
 * Rules:
 * 1. "Not ready for" always excludes: if a practitioner has any topic in
 *    topics_not_ready_for matching the client's issues, isExcluded is true.
 * 2. "No preference" never lowers a score: full points awarded for any
 *    unrestricted / "No preference" criteria.
 * 3. Availability overlap is scored: proportional to overlapping weekly slots.
 */
export function scorePractitioner(client, tc) {
  const breakdown = {};
  const flags = [];

  // Check Rule 1: "Not ready for" always excludes
  const exclusion = checkNotReadyExclusion(client, tc);
  const isExcluded = exclusion.isExcluded;
  const exclusionReason = exclusion.reason || null;
  if (isExcluded) {
    flags.push(exclusionReason);
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Availability Overlap (40 points max)
  // ─────────────────────────────────────────────────────────────
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

  // If client specifies no availability ("No preference" / empty), full 40 points
  const availPercentage = hasClientSlots ? overlap.overlapPercentage : 100;
  const availabilityScore = (availPercentage / 100) * 40;
  const availMatched = !hasClientSlots || overlap.hasOverlap;
  const availDetail = hasClientSlots
    ? `${overlap.totalOverlapCount} overlapping weekly slot(s) found (${availPercentage}% match)`
    : 'No client availability on record to compare (full score)';

  breakdown.availability = {
    score: Math.round(availabilityScore),
    max: 40,
    percentage: Math.round(availPercentage),
    matched: availMatched,
    detail: availDetail,
  };

  if (hasClientSlots && !overlap.hasOverlap) {
    flags.push('No overlapping availability with this client');
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Modality Alignment (20 points max)
  // "No preference" never lowers a score
  // ─────────────────────────────────────────────────────────────
  const clientModality =
    client?.recommendedModality ||
    client?.preferredModality ||
    client?.modalityPreference ||
    client?.modality_preference ||
    client?.modality;

  const isNoModalityPref =
    !clientModality ||
    ['no preference', 'no_preference', 'unsure', 'any', 'all', 'n/a'].includes(
      cleanStr(clientModality)
    );

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

  // "No preference" never lowers a score: full 20 points
  const modalityScore = (isNoModalityPref || modalityMatched) ? 20 : 0;
  breakdown.modalityMatch = {
    score: Math.round(modalityScore),
    max: 20,
    percentage: Math.round((modalityScore / 20) * 100),
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

  // ─────────────────────────────────────────────────────────────
  // 3. Clinical Issue Match (15 points max)
  // ─────────────────────────────────────────────────────────────
  const clientIssuesList = Array.isArray(client?.primaryIssues)
    ? client.primaryIssues
    : Array.isArray(client?.primary_issues)
      ? client.primary_issues
      : Array.isArray(client?.support_areas)
        ? client.support_areas
        : [];

  const tcIssues = Array.isArray(tc?.topics_with_experience)
    ? tc.topics_with_experience
    : Array.isArray(tc?.topicsWithExperience)
      ? tc.topicsWithExperience
      : typeof tc?.topics_with_experience === 'string'
        ? (() => {
            try {
              return JSON.parse(tc.topics_with_experience);
            } catch {
              return [];
            }
          })()
        : [];

  const commonIssues = clientIssuesList.filter((cIssue) => {
    const cClean = cleanStr(cIssue);
    return tcIssues.some((tIssue) => {
      const tClean = cleanStr(tIssue);
      return cClean === tClean || cClean.includes(tClean) || tClean.includes(cClean);
    });
  });

  // "No preference" / no issues specified -> full 15 points
  const issueScore =
    clientIssuesList.length > 0
      ? (commonIssues.length / clientIssuesList.length) * 15
      : 15;

  breakdown.clinicalIssues = {
    score: Math.round(issueScore),
    max: 15,
    percentage:
      clientIssuesList.length > 0
        ? Math.round((issueScore / 15) * 100)
        : 100,
    matched: clientIssuesList.length === 0 || commonIssues.length > 0,
    detail:
      clientIssuesList.length > 0
        ? `Experienced with ${commonIssues.length}/${clientIssuesList.length} of the client's primary issues`
        : 'No primary issues specified by client (full score)',
  };
  if (clientIssuesList.length > 0 && commonIssues.length === 0) {
    flags.push(
      `No listed experience with the client's primary issues: ${clientIssuesList.join(', ')}`
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Counsellor Preferences Match (15 points max)
  // Gender: 4 pts, Age: 4 pts, Ethnicity: 4 pts, Orientation: 3 pts (Total: 15 pts)
  // "No preference" never lowers a score
  // ─────────────────────────────────────────────────────────────
  const isNoPref = (val) =>
    !val ||
    ['no preference', 'no_preference', 'any', 'none', 'unsure', 'n/a'].includes(
      cleanStr(val)
    );

  const genderPref = !isNoPref(client?.genderPreference || client?.gender_preference)
    ? (client?.genderPreference || client?.gender_preference)
    : null;
  const agePref = !isNoPref(client?.agePreference || client?.age_preference)
    ? (client?.agePreference || client?.age_preference)
    : null;
  const ethnicityPref = !isNoPref(client?.ethnicityPreference || client?.ethnicity_preference)
    ? (client?.ethnicityPreference || client?.ethnicity_preference)
    : null;
  const orientationPref = !isNoPref(client?.orientationPreference || client?.orientation_preference)
    ? (client?.orientationPreference || client?.orientation_preference)
    : null;

  let prefScore = 0;
  const prefDetails = [];

  // Gender (4 pts)
  if (genderPref) {
    if (tc?.gender && cleanStr(tc.gender) === cleanStr(genderPref)) {
      prefScore += 4;
      prefDetails.push(`Gender: Matched (${genderPref})`);
    } else {
      prefDetails.push(`Gender: Mismatched (wanted ${genderPref}, is ${tc?.gender || 'unspecified'})`);
      flags.push(`Client requested gender "${genderPref}" (practitioner is ${tc?.gender || 'unspecified'})`);
    }
  } else {
    prefScore += 4; // "No preference" never lowers a score
  }

  // Age (4 pts)
  if (agePref) {
    let ageMatches = false;
    const a = parseInt(tc?.age, 10);
    if (!isNaN(a)) {
      if (agePref === '20-30' && a >= 20 && a <= 30) ageMatches = true;
      else if (agePref === '30-40' && a >= 30 && a <= 40) ageMatches = true;
      else if (agePref === '40-50' && a >= 40 && a <= 50) ageMatches = true;
      else if (agePref === '50+' && a >= 50) ageMatches = true;
    }
    if (ageMatches) {
      prefScore += 4;
      prefDetails.push(`Age: Matched (${agePref})`);
    } else {
      prefDetails.push(`Age: Mismatched (wanted ${agePref}, is ${tc?.age || 'unspecified'})`);
      flags.push(`Client requested age "${agePref}" (practitioner is ${tc?.age || 'unspecified'})`);
    }
  } else {
    prefScore += 4; // "No preference" never lowers a score
  }

  // Ethnicity (4 pts)
  if (ethnicityPref) {
    let ethMatches = false;
    if (tc?.ethnicity) {
      const tcEth = cleanStr(tc.ethnicity);
      const clEth = cleanStr(ethnicityPref);
      ethMatches = tcEth.includes(clEth) || clEth.includes(tcEth);
    }
    if (ethMatches) {
      prefScore += 4;
      prefDetails.push(`Ethnicity: Matched (${ethnicityPref})`);
    } else {
      prefDetails.push(`Ethnicity: Mismatched (wanted ${ethnicityPref}, is ${tc?.ethnicity || 'unspecified'})`);
      flags.push(`Client requested ethnicity "${ethnicityPref}" (practitioner is ${tc?.ethnicity || 'unspecified'})`);
    }
  } else {
    prefScore += 4; // "No preference" never lowers a score
  }

  // Orientation (3 pts)
  if (orientationPref) {
    let oriMatches = false;
    const tcOriVal = tc?.sexual_orientation || tc?.sexualOrientation || tc?.sexuality;
    if (tcOriVal) {
      const tcOri = cleanStr(tcOriVal);
      const clOri = cleanStr(orientationPref);
      oriMatches = tcOri.includes(clOri) || clOri.includes(tcOri);
    }
    if (oriMatches) {
      prefScore += 3;
      prefDetails.push(`Orientation: Matched (${orientationPref})`);
    } else {
      prefDetails.push(`Orientation: Mismatched (wanted ${orientationPref}, is ${tcOriVal || 'unspecified'})`);
      flags.push(`Client requested orientation "${orientationPref}" (practitioner is ${tcOriVal || 'unspecified'})`);
    }
  } else {
    prefScore += 3; // "No preference" never lowers a score
  }

  breakdown.counsellorPreferences = {
    score: Math.round(prefScore),
    max: 15,
    percentage: Math.round((prefScore / 15) * 100),
    matched: prefScore >= 11,
    detail:
      prefDetails.length > 0
        ? prefDetails.join(' • ')
        : 'No specific demographic preferences specified by client (full score)',
  };

  // ─────────────────────────────────────────────────────────────
  // 5. Caseload Balance (10 points max)
  // ─────────────────────────────────────────────────────────────
  const maxCaseload = tc?.max_clients || 6;
  const currentCaseload = tc?.current_clients || 0;
  const utilization = maxCaseload > 0 ? currentCaseload / maxCaseload : 1;
  const caseloadScore = (1 - utilization) * 10;
  breakdown.caseloadBalance = {
    score: Math.round(caseloadScore),
    max: 10,
    percentage: Math.round((caseloadScore / 10) * 100),
    matched: utilization < 0.9,
    detail: `${currentCaseload}/${maxCaseload} active clients`,
  };
  if (utilization >= 0.9) {
    flags.push('Practitioner is near full caseload capacity');
  }

  // Total score across the 5 factors (sum of max points = 40+20+15+15+10 = 100)
  const score = isExcluded
    ? 0
    : breakdown.availability.score +
      breakdown.modalityMatch.score +
      breakdown.clinicalIssues.score +
      breakdown.counsellorPreferences.score +
      breakdown.caseloadBalance.score;

  return {
    id: tc?.uuid || tc?.id,
    uuid: tc?.uuid || tc?.id,
    name: tc?.name,
    modality: tc?.modality || 'N/A',
    matchScore: Math.round(score),
    matchBreakdown: breakdown,
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
    .map((tc) => scorePractitioner(client, tc))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
