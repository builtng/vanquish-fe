/**
 * UK Date & Time Formatting Helper
 * Enforces "en-GB" locale and "Europe/London" timezone across the application.
 */

export const UK_LOCALE = "en-GB";
export const UK_TIMEZONE = "Europe/London";

/**
 * Safely parse a date value into a valid Date object or null
 * @param {string|number|Date} val
 * @returns {Date|null}
 */
export function toValidDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date in UK English ("en-GB") with timeZone "Europe/London"
 * Default output: "3 Sep 2026" (e.g., day: "numeric", month: "short", year: "numeric")
 * @param {string|number|Date} val
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(val, options = {}) {
  const d = toValidDate(val);
  if (!d) return "";
  const opts = {
    timeZone: UK_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  };
  return d.toLocaleDateString(UK_LOCALE, opts);
}

/**
 * Format a date and time in UK English ("en-GB") with timeZone "Europe/London"
 * Default output: "3 Sep 2026, 14:05"
 * @param {string|number|Date} val
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDateTime(val, options = {}) {
  const d = toValidDate(val);
  if (!d) return "";
  const opts = {
    timeZone: UK_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  };
  return d.toLocaleString(UK_LOCALE, opts);
}

/**
 * Format a time in UK English ("en-GB") with timeZone "Europe/London"
 * Default output: "14:05" (or hour12: true if desired)
 * @param {string|number|Date} val
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatTime(val, options = {}) {
  const d = toValidDate(val);
  if (!d) return "";
  const opts = {
    timeZone: UK_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  };
  return d.toLocaleTimeString(UK_LOCALE, opts);
}

/**
 * Format numerical UK date (e.g. "03/09/2026")
 * @param {string|number|Date} val
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDateNumeric(val, options = {}) {
  const d = toValidDate(val);
  if (!d) return "";
  const opts = {
    timeZone: UK_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  };
  return d.toLocaleDateString(UK_LOCALE, opts);
}

const dateHelpers = {
  UK_LOCALE,
  UK_TIMEZONE,
  toValidDate,
  formatDate,
  formatDateTime,
  formatTime,
  formatDateNumeric,
};

export default dateHelpers;
