import { formatTimeSlotDisplay } from './timeFormatter.js';

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

// Old "abstract" slot names and the session start times they cover.
const ABSTRACT_START_TIMES = {
  'morning-early': ['10:00'],
  'morning-late': ['11:00', '12:00'],
  'afternoon-early': ['13:00', '14:00', '15:00'],
  'afternoon-late': ['16:00'],
  'evening': ['17:00', '18:00'],
  'morning': ['10:00', '11:00'],
  'afternoon': ['12:00', '13:00', '14:00', '15:00', '16:00'],
};

/**
 * The start times ("HH:MM", 24-hour) a saved slot stands for.
 *
 * Forms save the same time in different ways: client forms "10am-1050am",
 * the trainee placement and qualified counsellor forms "10am-11am", older
 * records "morning-early" or "10:00". Two slots are the same when they start
 * at the same time. The server (App\Support\SlotTime) reads them the same way.
 */
export function slotStartTimes(slotKey) {
  if (slotKey == null) return [];
  const clean = String(slotKey).trim().toLowerCase().replace(/\s+/g, '');
  if (!clean) return [];
  if (ABSTRACT_START_TIMES[clean]) return ABSTRACT_START_TIMES[clean];
  const m = clean.split('-')[0].match(/^(\d{1,2})(?::?(\d{2}))?(am|pm)?$/);
  if (!m) return [];
  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  if (m[3] === 'pm' && hour < 12) hour += 12;
  else if (m[3] === 'am' && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return [];
  return [`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`];
}

/**
 * Normalizes any time slot representation to a list of standard slot values.
 */
export function expandToStandardSlots(slotKey) {
  const starts = slotStartTimes(slotKey);
  return STANDARD_TIME_SLOTS.filter((t) => starts.includes(slotStartTimes(t.value)[0])).map((t) => t.value);
}

/**
 * Checks if a given slot is contained in an array of slot keys: same start
 * time, whatever format each was saved in.
 */
export function containsSlot(slotArray, targetSlot) {
  if (!Array.isArray(slotArray) || !targetSlot) return false;
  const wanted = slotStartTimes(targetSlot);
  if (!wanted.length) return false;
  return slotArray.some((s) => slotStartTimes(s).some((t) => wanted.includes(t)));
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
