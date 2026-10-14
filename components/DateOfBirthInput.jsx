"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { parseDateOfBirth } from "@/lib/dates";

/**
 * DateOfBirthInput
 * Three typed numeric fields (Day, Month, Year) conforming to UK design system standards.
 * Replaces cumbersome date picker modals for birth dates.
 */
export default function DateOfBirthInput({
  value = "",
  onChange,
  error = "",
  id = "dateOfBirth",
  name = "dateOfBirth",
  label = "Date of Birth",
  required = true,
  helperText = "For example, 27 03 1995",
  labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1",
}) {
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Sync internal state when external value changes
  useEffect(() => {
    if (!value) {
      setDay("");
      setMonth("");
      setYear("");
      return;
    }
    const parsed = parseDateOfBirth(value);
    if (parsed) {
      setDay(parsed.day || "");
      setMonth(parsed.month || "");
      setYear(parsed.year || "");
    }
  }, [value]);

  const emitChange = (newDay, newMonth, newYear) => {
    if (!newDay && !newMonth && !newYear) {
      if (onChange) onChange("");
      return;
    }
    // Pad day and month when they reach 2 digits or on full completion
    const d = newDay;
    const m = newMonth;
    const y = newYear;

    const formatted = `${d}${d || m || y ? "/" : ""}${m}${m || y ? "/" : ""}${y}`;
    if (onChange) onChange(formatted);
  };

  const handleDayChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDay(raw);
    emitChange(raw, month, year);
    if (raw.length === 2 && monthRef.current) {
      monthRef.current.focus();
      monthRef.current.select?.();
    }
  };

  const handleMonthChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMonth(raw);
    emitChange(day, raw, year);
    if (raw.length === 2 && yearRef.current) {
      yearRef.current.focus();
      yearRef.current.select?.();
    }
  };

  const handleYearChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(raw);
    emitChange(day, month, raw);
  };

  const handleMonthKeyDown = (e) => {
    if (e.key === "Backspace" && !month && dayRef.current) {
      dayRef.current.focus();
    }
  };

  const handleYearKeyDown = (e) => {
    if (e.key === "Backspace" && !year && monthRef.current) {
      monthRef.current.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;
    const parsed = parseDateOfBirth(pasted);
    if (parsed && (parsed.day || parsed.month || parsed.year)) {
      e.preventDefault();
      const d = parsed.day.slice(0, 2);
      const m = parsed.month.slice(0, 2);
      const y = parsed.year.slice(0, 4);
      setDay(d);
      setMonth(m);
      setYear(y);
      emitChange(d, m, y);
      if (yearRef.current) {
        yearRef.current.focus();
      }
    }
  };

  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label className={labelClassName}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {helperText}
        </p>
      )}

      {/* Hidden input for standard forms and test selectors */}
      <input type="hidden" id={id} name={name} value={value || ""} />

      <div className="flex items-center gap-2 max-w-xs">
        {/* Day */}
        <div className="flex-1">
          <label
            htmlFor={`${id}-day`}
            className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1 text-center"
          >
            Day
          </label>
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            id={`${id}-day`}
            data-testid="dob-day"
            placeholder="DD"
            maxLength={2}
            value={day}
            onChange={handleDayChange}
            onPaste={handlePaste}
            className={`w-full px-2 py-2.5 text-center text-sm font-semibold rounded-lg border outline-none transition-all ${
              hasError
                ? "border-red-500 bg-red-50/20 text-red-900 focus:ring-2 focus:ring-red-400"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent"
            }`}
          />
        </div>

        <span className="text-gray-400 mt-5 font-light text-base select-none">/</span>

        {/* Month */}
        <div className="flex-1">
          <label
            htmlFor={`${id}-month`}
            className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1 text-center"
          >
            Month
          </label>
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            id={`${id}-month`}
            data-testid="dob-month"
            placeholder="MM"
            maxLength={2}
            value={month}
            onChange={handleMonthChange}
            onKeyDown={handleMonthKeyDown}
            onPaste={handlePaste}
            className={`w-full px-2 py-2.5 text-center text-sm font-semibold rounded-lg border outline-none transition-all ${
              hasError
                ? "border-red-500 bg-red-50/20 text-red-900 focus:ring-2 focus:ring-red-400"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent"
            }`}
          />
        </div>

        <span className="text-gray-400 mt-5 font-light text-base select-none">/</span>

        {/* Year */}
        <div className="flex-[1.4]">
          <label
            htmlFor={`${id}-year`}
            className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1 text-center"
          >
            Year
          </label>
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            id={`${id}-year`}
            data-testid="dob-year"
            placeholder="YYYY"
            maxLength={4}
            value={year}
            onChange={handleYearChange}
            onKeyDown={handleYearKeyDown}
            onPaste={handlePaste}
            className={`w-full px-2 py-2.5 text-center text-sm font-semibold rounded-lg border outline-none transition-all ${
              hasError
                ? "border-red-500 bg-red-50/20 text-red-900 focus:ring-2 focus:ring-red-400"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent"
            }`}
          />
        </div>
      </div>

      {hasError && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
