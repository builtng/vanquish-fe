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

/**
 * Parse any date of birth format (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY)
 * into numeric day, month, year components.
 * @param {string|object} val
 * @returns {{ day: string, month: string, year: string, dayNum: number|null, monthNum: number|null, yearNum: number|null } | null}
 */
export function parseDateOfBirth(val) {
  if (!val) return null;
  let d = "", m = "", y = "";
  if (typeof val === "object" && val !== null) {
    d = String(val.day || "");
    m = String(val.month || "");
    y = String(val.year || "");
  } else if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      d = parts[0] || "";
      m = parts[1] || "";
      y = parts[2] || "";
    } else if (trimmed.includes("-")) {
      const parts = trimmed.split("-");
      if (parts[0] && parts[0].length === 4) {
        // YYYY-MM-DD
        y = parts[0] || "";
        m = parts[1] || "";
        d = parts[2] || "";
      } else {
        // DD-MM-YYYY
        d = parts[0] || "";
        m = parts[1] || "";
        y = parts[2] || "";
      }
    }
  }

  const dayNum = parseInt(d, 10);
  const monthNum = parseInt(m, 10);
  const yearNum = parseInt(y, 10);

  return {
    day: d,
    month: m,
    year: y,
    dayNum: isNaN(dayNum) ? null : dayNum,
    monthNum: isNaN(monthNum) ? null : monthNum,
    yearNum: isNaN(yearNum) ? null : yearNum,
  };
}

/**
 * Validate a date of birth:
 *  - Must be a valid date
 *  - Day 1-31, Month 1-12, Year 1900-current
 *  - Must be a real calendar date (accounting for month length and leap years)
 *  - Cannot be in the future
 *  - Must be at least 18 years old
 * @param {string|object} val
 * @returns {string|null} Error message or null if valid
 */
export function validateDateOfBirth(val) {
  if (!val || (typeof val === "string" && !val.trim())) {
    return "Date of birth is required";
  }

  const parsed = parseDateOfBirth(val);
  if (!parsed || !parsed.day || !parsed.month || !parsed.year) {
    return "Please enter a valid date of birth (DD/MM/YYYY)";
  }

  const { dayNum, monthNum, yearNum, year } = parsed;

  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) || year.length < 4) {
    return "Please enter a valid date of birth (DD/MM/YYYY)";
  }

  if (monthNum < 1 || monthNum > 12) {
    return "Month must be between 1 and 12";
  }

  if (dayNum < 1 || dayNum > 31) {
    return "Day must be between 1 and 31";
  }

  const currentYear = new Date().getFullYear();
  if (yearNum < 1900 || yearNum > currentYear) {
    if (yearNum > currentYear) {
      return "Date of birth cannot be in the future";
    }
    return "Please enter a valid 4-digit year";
  }

  // Check valid days in month (including leap years)
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  if (dayNum > daysInMonth) {
    return "Please enter a valid day for the selected month";
  }

  const birthDate = new Date(yearNum, monthNum - 1, dayNum);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    return "Date of birth cannot be in the future";
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return "You must be at least 18 years old to apply";
  }

  return null;
}

const dateHelpers = {
  UK_LOCALE,
  UK_TIMEZONE,
  toValidDate,
  formatDate,
  formatDateTime,
  formatTime,
  formatDateNumeric,
  parseDateOfBirth,
  validateDateOfBirth,
};

export default dateHelpers;

