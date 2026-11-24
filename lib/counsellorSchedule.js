/**
 * Counsellor portal: one upcoming list from the two kinds of booking the
 * server returns on /counsellor/my-data.
 *  - upcoming_consultations: consultations
 *  - upcoming_sessions: therapy sessions a client booked (e.g. a Low Cost block)
 * Times are shown in UK time, whatever the viewer's own time zone.
 */
export const UK_TIME_ZONE = "Europe/London";

export function upcomingSchedule(data) {
  const consultations = (data?.upcoming_consultations || []).map((c) => ({
    ...c,
    kind: "consultation",
    key: `consultation-${c.id}`,
  }));
  const sessions = (data?.upcoming_sessions || []).map((s) => ({
    ...s,
    kind: "session",
    key: `session-${s.id}`,
  }));
  return [...consultations, ...sessions].sort(
    (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at),
  );
}

/** "Session 2 of 4" for a block booking, otherwise "Therapy session" / "Consultation". */
export function scheduleLabel(item) {
  if (item?.kind === "session") {
    if (item.is_block_booking && item.block_number && item.total_sessions_in_block) {
      return `Session ${item.block_number} of ${item.total_sessions_in_block}`;
    }
    return "Therapy session";
  }
  return "Consultation";
}

export function ukDate(value, options = {}) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { timeZone: UK_TIME_ZONE, ...options });
}

export function ukTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", {
    timeZone: UK_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}
