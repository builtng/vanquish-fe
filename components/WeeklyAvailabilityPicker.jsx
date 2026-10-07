"use client";

import React, { useMemo } from "react";
import { Check, Calendar, Clock, AlertCircle } from "lucide-react";
import {
  INTAKE_DAYS,
  INTAKE_TIME_SLOTS,
  INTAKE_FRIDAY_TIME_SLOTS,
} from "@/lib/constants";

/**
 * Shared Weekly Availability Component for all client intake forms:
 * - Low Cost Intake (/low-cost-intake)
 * - Mid Range Intake (/mid-range-intake)
 * - Coaching & Counselling (/coaching)
 * - Client Intake Form (/clform)
 *
 * Allows clients to select ANY number of day and time slots with
 * responsive design for desktop and phone widths.
 */
export default function WeeklyAvailabilityPicker({
  value = {},
  onChange,
  error,
  title = "Your Availability To Attend Weekly Sessions",
  description = "Select all day and time slots when you're available to attend weekly sessions. Vanquish assigns your regular therapist and session time based on overlapping availability.",
  showQuickSelect = true,
}) {
  const safeValue = useMemo(() => {
    const res = {};
    for (const d of INTAKE_DAYS) {
      res[d] = Array.isArray(value?.[d]) ? value[d] : [];
    }
    return res;
  }, [value]);

  const totalSelectedCount = useMemo(() => {
    return Object.values(safeValue).reduce(
      (acc, slots) => acc + (Array.isArray(slots) ? slots.length : 0),
      0
    );
  }, [safeValue]);

  const activeDaysCount = useMemo(() => {
    return Object.values(safeValue).filter(
      (slots) => Array.isArray(slots) && slots.length > 0
    ).length;
  }, [safeValue]);

  const toggleSlot = (day, slotValue) => {
    const currentDaySlots = safeValue[day] || [];
    const exists = currentDaySlots.includes(slotValue);
    const newDaySlots = exists
      ? currentDaySlots.filter((s) => s !== slotValue)
      : [...currentDaySlots, slotValue];

    if (typeof onChange === "function") {
      onChange({
        ...safeValue,
        [day]: newDaySlots,
      });
    }
  };

  const selectAllForDay = (day) => {
    const availableSlots =
      day === "friday" ? INTAKE_FRIDAY_TIME_SLOTS : INTAKE_TIME_SLOTS;
    const allSlotValues = availableSlots.map((s) => s.value);

    if (typeof onChange === "function") {
      onChange({
        ...safeValue,
        [day]: allSlotValues,
      });
    }
  };

  const clearDay = (day) => {
    if (typeof onChange === "function") {
      onChange({
        ...safeValue,
        [day]: [],
      });
    }
  };

  const selectByCategory = (category) => {
    const updated = { ...safeValue };
    for (const day of INTAKE_DAYS) {
      const slots =
        day === "friday" ? INTAKE_FRIDAY_TIME_SLOTS : INTAKE_TIME_SLOTS;
      const targetValues = slots
        .filter((s) => s.category.toLowerCase() === category.toLowerCase())
        .map((s) => s.value);

      const combined = Array.from(
        new Set([...(updated[day] || []), ...targetValues])
      );
      updated[day] = combined;
    }

    if (typeof onChange === "function") {
      onChange(updated);
    }
  };

  const clearAll = () => {
    const cleared = {};
    for (const d of INTAKE_DAYS) {
      cleared[d] = [];
    }
    if (typeof onChange === "function") {
      onChange(cleared);
    }
  };

  return (
    <div data-field="availability" className="space-y-5">
      <div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-2 text-center"
          style={{ color: "var(--text-primary, #1e293b)" }}
        >
          {title}
        </h2>
        <p
          className="text-base md:text-lg text-center max-w-2xl mx-auto"
          style={{ color: "var(--text-secondary, #64748b)" }}
        >
          {description}
        </p>
      </div>

      {/* Validation Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm md:text-base font-medium">
            {error}
          </p>
        </div>
      )}

      {/* Important UK Time notice */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <strong>Important:</strong> All times are in <strong>UK Time</strong>.
          {" "}The more availability you provide, the more options you will have.
          {" "}Sessions run weekly at the same scheduled time. Monday to Thursday
          sessions run up to 6:50 PM; Friday sessions conclude by 5:50 PM.
        </div>
      </div>

      {/* Quick Select Actions */}
      {showQuickSelect && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <span>Quick Select:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => selectByCategory("Morning")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              + All Mornings
            </button>
            <button
              type="button"
              onClick={() => selectByCategory("Afternoon")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors"
            >
              + All Afternoons
            </button>
            <button
              type="button"
              onClick={() => selectByCategory("Evening")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 transition-colors"
            >
              + All Evenings
            </button>
            {totalSelectedCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Slots Summary Pill Bar */}
      {totalSelectedCount > 0 && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-purple-600" />
            <p className="text-sm font-semibold text-[#6f1d56]">
              {totalSelectedCount} time slot{totalSelectedCount !== 1 ? "s" : ""}{" "}
              selected across {activeDaysCount} day{activeDaysCount !== 1 ? "s" : ""}
            </p>
          </div>
          <span className="text-xs text-purple-700 font-medium hidden sm:inline">
            You can select as many slots as you want
          </span>
        </div>
      )}

      {/* Day by Day Slots Grid */}
      <div className="space-y-4">
        {INTAKE_DAYS.map((day) => {
          const slotsToShow =
            day === "friday" ? INTAKE_FRIDAY_TIME_SLOTS : INTAKE_TIME_SLOTS;
          const daySelectedSlots = safeValue[day] || [];
          const isAllDaySelected =
            daySelectedSlots.length > 0 &&
            daySelectedSlots.length === slotsToShow.length;

          return (
            <div
              key={day}
              className={`border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-150 ${
                daySelectedSlots.length > 0
                  ? "border-[#6f1d56]/40 ring-1 ring-[#6f1d56]/10"
                  : "border-gray-200"
              }`}
            >
              {/* Day Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base capitalize text-gray-900">
                    {day}
                  </h3>
                  {day === "friday" && (
                    <span className="text-xs text-gray-500 hidden sm:inline font-normal">
                      (Concludes at 5:50 PM)
                    </span>
                  )}
                  {daySelectedSlots.length > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-[#6f1d56]">
                      {daySelectedSlots.length} selected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      isAllDaySelected ? clearDay(day) : selectAllForDay(day)
                    }
                    className="text-xs font-medium text-[#6f1d56] hover:text-[#531540] underline hover:no-underline transition-colors"
                  >
                    {isAllDaySelected ? "Clear Day" : "Select All"}
                  </button>
                </div>
              </div>

              {/* Slot Choices Grid */}
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {slotsToShow.map((slot) => {
                    const isChecked = daySelectedSlots.includes(slot.value);

                    return (
                      <label
                        key={slot.value}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-150 select-none ${
                          isChecked
                            ? "bg-purple-50/70 border-[#6f1d56] text-[#6f1d56] shadow-sm"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSlot(day, slot.value)}
                          className="w-4 h-4 rounded text-[#6f1d56] focus:ring-[#6f1d56] border-gray-300"
                          style={{ accentColor: "#6f1d56" }}
                        />

                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm block truncate ${
                              isChecked ? "font-bold text-[#6f1d56]" : "font-medium text-gray-900"
                            }`}
                          >
                            {slot.label}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            slot.category === "Morning"
                              ? "bg-amber-100 text-amber-800"
                              : slot.category === "Afternoon"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {slot.category}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
