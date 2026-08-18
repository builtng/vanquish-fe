import { formatTimeSlotDisplay } from './timeFormatter';

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const STANDARD_TIME_SLOTS = [
  { value: '10am-1050am', label: '10:00 AM - 10:50 AM', category: 'Morning', startHour: 10 },
  { value: '11am-1150am', label: '11:00 AM - 11:50 AM', category: 'Morning', startHour: 11 },
  { value: '12pm-1250pm', label: '12:00 PM - 12:50 PM', category: 'Afternoon', startHour: 12 },
  { value: '1pm-150pm', label: '1:00 PM - 1:50 PM', category: 'Afternoon', startHour: 13 },
  { value: '2pm-250pm', label: '2:00 PM - 2:50 PM', category: 'Afternoon', startHour: 14 },
  { value: '3pm-350pm', label: '3:00 PM - 3:50 PM', category: 'Afternoon', startHour: 15 },
  { value: '4pm-450pm', label: '4:00 PM - 4:50 PM', category: 'Afternoon', startHour: 16 },
  { value: '5pm-550pm', label: '5:00 PM - 5:50 PM', category: 'Evening', startHour: 17 },
  { value: '6pm-650pm', label: '6:00 PM - 6:50 PM', category: 'Evening', startHour: 18 },
];

export const FRIDAY_TIME_SLOTS = STANDARD_TIME_SLOTS.filter(
  (slot) => slot.value !== '6pm-650pm'
);

const ABSTRACT_SLOT_EXPANSIONS = {
  'morning-early': ['10am-1050am'],
  'morning-late': ['11am-1150am', '12pm-1250pm'],
  'afternoon-early': ['1pm-150pm', '2pm-250pm', '3pm-350pm'],
  'afternoon-late': ['4pm-450pm'],
  'evening': ['5pm-550pm', '6pm-650pm'],
  'morning': ['10am-1050am', '11am-1150am'],
  'afternoon': ['12pm-1250pm', '1pm-150pm', '2pm-250pm', '3pm-350pm', '4pm-450pm'],
};

/**
 * Normalizes any time slot representation to a list of standard slot values.
 */
export function expandToStandardSlots(slotKey) {
  if (!slotKey) return [];
  const clean = String(slotKey).trim().toLowerCase().replace(/\s+/g, '');
  if (ABSTRACT_SLOT_EXPANSIONS[clean]) {
    return ABSTRACT_SLOT_EXPANSIONS[clean];
  }
  return [clean];
}

/**
 * Checks if a given slot is contained in an array of slot keys (handling abstract slots).
 */
export function containsSlot(slotArray, targetSlot) {
  if (!Array.isArray(slotArray) || !targetSlot) return false;
  const targetClean = String(targetSlot).trim().toLowerCase().replace(/\s+/g, '');

  return slotArray.some((s) => {
    const sClean = String(s).trim().toLowerCase().replace(/\s+/g, '');
    if (sClean === targetClean) return true;
    const expanded = expandToStandardSlots(sClean);
    return expanded.includes(targetClean);
  });
}

/**
 * Compute the full overlap analysis between a client's availability and a counsellor's availability.
 */
export function computeOverlapSchedule(clientAvailability = {}, tcAvailability = {}) {
  // Normalize keys to lowercase
  const clientMap = {};
  Object.entries(clientAvailability || {}).forEach(([day, slots]) => {
    clientMap[day.toLowerCase()] = Array.isArray(slots) ? slots : [];
  });

  const tcMap = {};
  Object.entries(tcAvailability || {}).forEach(([day, slots]) => {
    tcMap[day.toLowerCase()] = Array.isArray(slots) ? slots : [];
  });

  const daysResult = [];
  const overlappingSlotsList = [];
  let totalOverlapCount = 0;
  let totalClientSlots = 0;
  let totalTCSlots = 0;

  DAYS_OF_WEEK.forEach(({ key: dayKey, label: dayLabel }) => {
    const clientSlots = clientMap[dayKey] || [];
    const tcSlots = tcMap[dayKey] || [];
    const slotTemplates = dayKey === 'friday' ? FRIDAY_TIME_SLOTS : STANDARD_TIME_SLOTS;

    totalClientSlots += clientSlots.length;
    totalTCSlots += tcSlots.length;

    const daySlots = slotTemplates.map((template) => {
      const isClientAvailable = containsSlot(clientSlots, template.value);
      const isTCAvailable = containsSlot(tcSlots, template.value);
      const isOverlap = isClientAvailable && isTCAvailable;

      if (isOverlap) {
        totalOverlapCount++;
        overlappingSlotsList.push({
          day: dayLabel,
          dayKey,
          slot: template.value,
          label: template.label,
          category: template.category,
        });
      }

      return {
        ...template,
        isClientAvailable,
        isTCAvailable,
        isOverlap,
      };
    });

    const hasAnyAvailability = daySlots.some((s) => s.isClientAvailable || s.isTCAvailable);
    const hasOverlap = daySlots.some((s) => s.isOverlap);

    daysResult.push({
      key: dayKey,
      label: dayLabel,
      slots: daySlots,
      hasAnyAvailability,
      hasOverlap,
      overlapCount: daySlots.filter((s) => s.isOverlap).length,
      clientSlotCount: daySlots.filter((s) => s.isClientAvailable).length,
      tcSlotCount: daySlots.filter((s) => s.isTCAvailable).length,
    });
  });

  const overlapPercentage =
    totalClientSlots > 0
      ? Math.min(100, Math.round((totalOverlapCount / totalClientSlots) * 100))
      : 0;

  return {
    days: daysResult,
    totalOverlapCount,
    totalClientSlots,
    totalTCSlots,
    overlapPercentage,
    overlappingSlotsList,
    hasOverlap: totalOverlapCount > 0,
  };
}
