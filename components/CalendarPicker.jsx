"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

/**
 * A Calendly-style Calendar Picker
 * @param {Array} availableSlots - Array of slots { date (YYYY-MM-DD), time, available, ... }
 * @param {Function} onSelect - Callback when a slot is selected
 * @param {Object} selectedSlot - The currently selected slot
 * @param {string} mode - 'single' or 'block'
 */
export default function CalendarPicker({
  availableSlots = [],
  onSelect,
  selectedSlot,
  mode = "single",
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group slots by date for easy lookup
  const slotsByDate = useMemo(() => {
    const grouped = {};
    availableSlots.forEach((slot) => {
      const dateKey = slot.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    return grouped;
  }, [availableSlots]);

  // Calendar logic
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Adjust startDay for Monday-start (0 = Sunday in JS, we want 1-6,0 to be 0-6 where 0 is Monday)
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  // Pad beginning
  for (let i = 0; i < adjustedStartDay; i++) {
    days.push(null);
  }

  // Add days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    days.push({
      day: i,
      date: dateStr,
      hasSlots: !!slotsByDate[dateStr],
      isToday: new Date().toISOString().split("T")[0] === dateStr,
    });
  }

  const [dateSelection, setDateSelection] = useState(
    selectedSlot?.date || null,
  );

  const handleDateClick = (dateStr) => {
    if (slotsByDate[dateStr]) {
      setDateSelection(dateStr);
    }
  };

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  const selectedDaySlots = slotsByDate[dateSelection] || [];

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Section */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthName} {year}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-gray-400 py-2 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((dayObj, idx) => {
            if (!dayObj) return <div key={`empty-${idx}`} />;

            const isSelected = dateSelection === dayObj.date;
            const canSelect = dayObj.hasSlots;

            return (
              <button
                key={dayObj.date}
                onClick={() => handleDateClick(dayObj.date)}
                disabled={!canSelect}
                className={`
                  relative h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-full flex items-center justify-center text-sm transition-all
                  ${canSelect ? "cursor-pointer" : "cursor-default text-gray-300"}
                  ${isSelected ? "bg-[#6f1d56] text-white font-bold scale-110 shadow-lg shadow-[#6f1d56]/20" : ""}
                  ${!isSelected && canSelect ? "hover:bg-[#fcf6fa] text-[#6f1d56] font-medium" : ""}
                  ${dayObj.isToday && !isSelected ? "ring-2 ring-[#6f1d56]/30" : ""}
                `}
              >
                {dayObj.day}
                {canSelect && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 bg-[#6f1d56]/60 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Section */}
      <div className="w-full md:w-64 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col">
        <div className="p-6 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6f1d56]" />
            {dateSelection
              ? new Date(dateSelection).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              : "Select a Date"}
          </h4>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {dateSelection ? (
              selectedDaySlots.length > 0 ? (
                selectedDaySlots.map((slot, idx) => (
                  <button
                    key={idx}
                    disabled={!slot.available}
                    onClick={() => onSelect(slot)}
                    className={`
                      w-full py-3 px-4 rounded-xl text-sm font-medium transition-all border
                      ${
                        selectedSlot === slot
                          ? "bg-[#6f1d56] text-white border-[#6f1d56] shadow-md"
                          : slot.available
                            ? "bg-white text-gray-700 border-gray-200 hover:border-[#6f1d56]/60 hover:text-[#6f1d56]"
                            : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                      }
                    `}
                  >
                    {slot.formatted_time || slot.time}
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-8">
                  No times available
                </p>
              )
            ) : (
              <p className="text-xs text-gray-500 text-center py-8">
                Pick a day to see available times
              </p>
            )}
          </div>
        </div>

        {dateSelection &&
          selectedSlot &&
          selectedSlot.date === dateSelection && (
            <div className="p-4 bg-[#fcf6fa] border-t border-[#6f1d56]/20">
              <p className="text-xs text-[#6f1d56] font-medium text-center">
                Selected: {selectedSlot.formatted_time || selectedSlot.time}
              </p>
            </div>
          )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
