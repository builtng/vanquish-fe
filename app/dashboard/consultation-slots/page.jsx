"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  Save,
  X,
  Repeat,
  Sparkles,
  Filter,
  CalendarDays,
} from "lucide-react";
import PageGuard from "@/components/PageGuard";
import { useModal } from "@/contexts/ModalContext";

const DAYS_OF_WEEK = [
  { id: "mon", label: "Mon", full: "Monday" },
  { id: "tue", label: "Tue", full: "Tuesday" },
  { id: "wed", label: "Wed", full: "Wednesday" },
  { id: "thu", label: "Thu", full: "Thursday" },
  { id: "fri", label: "Fri", full: "Friday" },
  { id: "sat", label: "Sat", full: "Saturday" },
  { id: "sun", label: "Sun", full: "Sunday" },
];

export default function ConsultationSlotsAdminPage() {
  const { success, error: showError } = useToast();
  const { confirm } = useModal();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [filterTimeframe, setFilterTimeframe] = useState("upcoming"); // 'upcoming' | 'past' | 'all'
  const [filterDay, setFilterDay] = useState("all");
  const [searchDate, setSearchDate] = useState("");

  const [formData, setFormData] = useState({
    mode: "recurring", // 'recurring' | 'single' | 'range'
    // Single / Range date
    date: new Date().toLocaleDateString("en-CA"),
    time: "18:00",
    endTime: "19:00",
    interval: 15,
    maxSlots: 1,

    // Recurring specific
    selectedDays: ["mon"],
    intervals: [
      { start_time: "18:00", end_time: "18:15" },
      { start_time: "18:25", end_time: "18:40" },
      { start_time: "18:50", end_time: "19:05" },
    ],
    startDate: new Date().toLocaleDateString("en-CA"),
    repeatType: "weeks", // 'weeks' | 'until_date'
    weeksCount: 8,
    endDate: "",
  });

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConsultationSlots();
      const loadedSlots = Array.isArray(data) ? data : data.data || [];
      // Sort ascending by default for upcoming schedule clarity
      loadedSlots.sort(
        (a, b) =>
          new Date(a.consultation_datetime) - new Date(b.consultation_datetime)
      );
      setSlots(loadedSlots);
    } catch (err) {
      console.error(err);
      showError("Failed to fetch consultation slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const resetForm = () => {
    setFormData({
      mode: "recurring",
      date: new Date().toLocaleDateString("en-CA"),
      time: "18:00",
      endTime: "19:00",
      interval: 15,
      maxSlots: 1,
      selectedDays: ["mon"],
      intervals: [
        { start_time: "18:00", end_time: "18:15" },
        { start_time: "18:25", end_time: "18:40" },
        { start_time: "18:50", end_time: "19:05" },
      ],
      startDate: new Date().toLocaleDateString("en-CA"),
      repeatType: "weeks",
      weeksCount: 8,
      endDate: "",
    });
  };

  // Interval Helpers
  const handleAddInterval = () => {
    const lastInterval = formData.intervals[formData.intervals.length - 1];
    let nextStart = "18:00";
    let nextEnd = "18:15";

    if (lastInterval && lastInterval.end_time) {
      const [hours, minutes] = lastInterval.end_time.split(":").map(Number);
      // Add 10-minute buffer after previous end time
      const totalMinutes = hours * 60 + minutes + 10;
      const nextStartH = Math.floor(totalMinutes / 60) % 24;
      const nextStartM = totalMinutes % 60;
      const nextEndTotal = totalMinutes + 15;
      const nextEndH = Math.floor(nextEndTotal / 60) % 24;
      const nextEndM = nextEndTotal % 60;

      nextStart = `${String(nextStartH).padStart(2, "0")}:${String(nextStartM).padStart(2, "0")}`;
      nextEnd = `${String(nextEndH).padStart(2, "0")}:${String(nextEndM).padStart(2, "0")}`;
    }

    setFormData({
      ...formData,
      intervals: [
        ...formData.intervals,
        { start_time: nextStart, end_time: nextEnd },
      ],
    });
  };

  const handleUpdateInterval = (index, field, value) => {
    const updated = [...formData.intervals];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, intervals: updated });
  };

  const handleRemoveInterval = (index) => {
    if (formData.intervals.length <= 1) return;
    const updated = formData.intervals.filter((_, i) => i !== index);
    setFormData({ ...formData, intervals: updated });
  };

  const toggleDay = (dayId) => {
    const current = [...formData.selectedDays];
    const index = current.indexOf(dayId);
    if (index > -1) {
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(dayId);
    }
    setFormData({ ...formData, selectedDays: current });
  };

  // Summary calculation for Recurring mode
  const calculatedEstimate = useMemo(() => {
    if (formData.mode !== "recurring") return null;

    const daysCount = formData.selectedDays.length;
    const slotsPerDay = formData.intervals.filter((i) => i.start_time).length;
    let weeks = parseInt(formData.weeksCount, 10) || 1;

    if (formData.repeatType === "until_date" && formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.max(0, end - start);
      weeks = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)));
    }

    const totalSlots = daysCount * slotsPerDay * weeks;
    return {
      daysCount,
      slotsPerDay,
      weeks,
      totalSlots,
    };
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.mode === "recurring") {
        if (!formData.selectedDays || formData.selectedDays.length === 0) {
          showError("Please select at least one day of the week");
          setSubmitting(false);
          return;
        }

        const validIntervals = formData.intervals.filter(
          (i) => i.start_time && i.start_time.trim() !== ""
        );
        if (validIntervals.length === 0) {
          showError("Please specify at least one time interval");
          setSubmitting(false);
          return;
        }

        const payload = {
          days_of_week: formData.selectedDays,
          intervals: validIntervals,
          start_date: formData.startDate,
          max_slots: parseInt(formData.maxSlots, 10) || null,
          type: "consultation",
        };

        if (formData.repeatType === "until_date" && formData.endDate) {
          payload.end_date = formData.endDate;
        } else {
          payload.weeks_count = parseInt(formData.weeksCount, 10) || 8;
        }

        const result = await apiService.createRecurringConsultationSlots(payload);
        success(result?.message || "Weekly recurring consultation slots created successfully");
        setShowModal(false);
        resetForm();
        fetchSlots();
        return;
      }

      if (formData.mode === "range") {
        if (formData.endTime <= formData.time) {
          showError("End time must be after start time");
          setSubmitting(false);
          return;
        }

        const result = await apiService.createConsultationSlotRange({
          date: formData.date,
          start_time: formData.time,
          end_time: formData.endTime,
          interval_minutes: parseInt(formData.interval, 10) || 15,
          max_slots: parseInt(formData.maxSlots, 10) || null,
          type: "consultation",
        });
        success(result?.message || "Slots created successfully");
        setShowModal(false);
        resetForm();
        fetchSlots();
        return;
      }

      // Single mode
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();

      if (selectedDateTime <= now) {
        showError("Please select a date and time in the future");
        setSubmitting(false);
        return;
      }

      await apiService.createConsultationSlot({
        consultation_datetime: selectedDateTime.toISOString(),
        max_slots: parseInt(formData.maxSlots, 10) || null,
        type: "consultation",
      });
      success("Slot created successfully");
      setShowModal(false);
      resetForm();
      fetchSlots();
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to create consultation slot(s)");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Slot",
      message: "Are you sure you want to delete this consultation slot?",
      confirmText: "Delete",
      type: "danger",
    });
    if (!ok) return;
    try {
      await apiService.deleteConsultationSlot(id);
      success("Slot deleted");
      fetchSlots();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to delete slot");
    }
  };

  // Filtered slots
  const filteredSlots = useMemo(() => {
    const now = new Date();
    return slots.filter((slot) => {
      const slotDate = new Date(slot.consultation_datetime);

      // Timeframe filter
      if (filterTimeframe === "upcoming" && slotDate < now) return false;
      if (filterTimeframe === "past" && slotDate >= now) return false;

      // Day of week filter
      if (filterDay !== "all") {
        const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const slotDay = dayNames[slotDate.getUTCDay()];
        if (slotDay !== filterDay) return false;
      }

      // Search date filter
      if (searchDate) {
        const formattedDate = slotDate.toISOString().slice(0, 10);
        if (!formattedDate.includes(searchDate)) return false;
      }

      return true;
    });
  }, [slots, filterTimeframe, filterDay, searchDate]);

  // Statistics
  const now = new Date();
  const upcomingCount = slots.filter(
    (s) => new Date(s.consultation_datetime) >= now
  ).length;
  const bookedUpcomingCount = slots.filter(
    (s) => new Date(s.consultation_datetime) >= now && s.booked_slots > 0
  ).length;

  return (
    <PageGuard menuId="consultation-slots">
      <DashboardLayout>
        <div className="flex flex-col flex-1 h-screen bg-gray-50 dark:bg-[var(--bg-primary)] overflow-hidden">
          <DashboardHeader
            actions={
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:opacity-90 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Slots
              </button>
            }
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Consultation Slots
              </h1>
              <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                Manage available dates and times for intake consultations
              </p>
            </div>
          </DashboardHeader>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[var(--card-bg)] p-4 rounded-xl border dark:border-[var(--card-border)] shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {upcomingCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                    Upcoming Available Slots
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[var(--card-bg)] p-4 rounded-xl border dark:border-[var(--card-border)] shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {bookedUpcomingCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                    Booked Upcoming Slots
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[var(--card-bg)] p-4 rounded-xl border dark:border-[var(--card-border)] shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {slots.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                    Total Slots In System
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-[var(--card-bg)] p-4 rounded-xl border dark:border-[var(--card-border)] shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">
                  <Filter className="w-4 h-4" /> Filter:
                </div>
                {/* Timeframe pill tabs */}
                <div className="flex bg-gray-100 dark:bg-[var(--bg-secondary)] p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setFilterTimeframe("upcoming")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      filterTimeframe === "upcoming"
                        ? "bg-white dark:bg-[var(--card-bg)] text-purple-700 dark:text-purple-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900"
                    }`}
                  >
                    Upcoming ({upcomingCount})
                  </button>
                  <button
                    onClick={() => setFilterTimeframe("all")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      filterTimeframe === "all"
                        ? "bg-white dark:bg-[var(--card-bg)] text-purple-700 dark:text-purple-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900"
                    }`}
                  >
                    All ({slots.length})
                  </button>
                  <button
                    onClick={() => setFilterTimeframe("past")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      filterTimeframe === "past"
                        ? "bg-white dark:bg-[var(--card-bg)] text-purple-700 dark:text-purple-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900"
                    }`}
                  >
                    Past
                  </button>
                </div>

                {/* Day selector */}
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-50 dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--card-border)] rounded-lg text-gray-700 dark:text-[var(--text-primary)] outline-none"
                >
                  <option value="all">All Days of Week</option>
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full}s
                    </option>
                  ))}
                </select>

                {/* Date search */}
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="px-3 py-1 text-xs bg-gray-50 dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--card-border)] rounded-lg text-gray-700 dark:text-[var(--text-primary)] outline-none"
                  placeholder="Filter by date"
                />
                {searchDate && (
                  <button
                    onClick={() => setSearchDate("")}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Clear date
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                Showing {filteredSlots.length} slot(s)
              </div>
            </div>

            {/* Slots Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[var(--card-bg)] rounded-xl border dark:border-[var(--card-border)] p-8">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text-primary)]">
                  No consultation slots found
                </h3>
                <p className="text-gray-500 dark:text-[var(--text-secondary)] text-sm mt-1 max-w-md mx-auto">
                  {slots.length === 0
                    ? "Add recurring weekly consultation slots or single slots for clients to book."
                    : "No slots matched the current filters."}
                </p>
                {slots.length === 0 && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Weekly Slots
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border dark:border-[var(--card-border)] shadow-sm overflow-hidden text-gray-900 dark:text-[var(--text-primary)]">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80 dark:bg-[var(--bg-secondary)] border-b dark:border-[var(--card-border)]">
                    <tr>
                      <th className="p-4 font-medium text-gray-600 dark:text-[var(--text-secondary)] text-sm">
                        Date & Day
                      </th>
                      <th className="p-4 font-medium text-gray-600 dark:text-[var(--text-secondary)] text-sm">
                        Time (UK / GMT)
                      </th>
                      <th className="p-4 font-medium text-gray-600 dark:text-[var(--text-secondary)] text-sm">
                        Status
                      </th>
                      <th className="p-4 font-medium text-gray-600 dark:text-[var(--text-secondary)] text-sm">
                        Bookings
                      </th>
                      <th className="p-4 font-medium text-gray-600 dark:text-[var(--text-secondary)] text-sm text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-[var(--card-border)]">
                    {filteredSlots.map((slot) => {
                      const slotDate = new Date(slot.consultation_datetime);
                      const isPast = slotDate < now;

                      return (
                        <tr
                          key={slot.id}
                          className={`hover:bg-gray-50/50 dark:hover:bg-[var(--hover-bg)] ${
                            isPast ? "opacity-60 bg-gray-50/30" : ""
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                                {slotDate.toLocaleDateString(undefined, {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              {isPast && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                  Past slot
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-600" />
                              {slotDate.toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "UTC",
                              })}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                slot.status === "available"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : slot.status === "full"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {slot.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                              <Users className="w-4 h-4 text-gray-400" />{" "}
                              {slot.booked_slots} / {slot.max_slots || "∞"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDelete(slot.id)}
                              disabled={slot.booked_slots > 0}
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title={
                                slot.booked_slots > 0
                                  ? "Cannot delete slot with existing bookings"
                                  : "Delete slot"
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Slots Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-gray-900 dark:text-[var(--text-primary)] my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b dark:border-[var(--card-border)] bg-gray-50/70 dark:bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-[var(--text-primary)]">
                      Add Consultation Slots
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                      Set up multiple consultation times repeating weekly
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Mode Selector Tabs */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] mb-2">
                    Creation Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-[var(--bg-secondary)] p-1.5 rounded-xl text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: "recurring" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        formData.mode === "recurring"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-white/50"
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      Weekly Recurring
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: "single" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        formData.mode === "single"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-white/50"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Single Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: "range" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        formData.mode === "range"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-white/50"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Single Day Range
                    </button>
                  </div>
                </div>

                {/* WEEKLY RECURRING MODE */}
                {formData.mode === "recurring" && (
                  <div className="space-y-5">
                    {/* Days Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
                          Day(s) of Week <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                selectedDays: ["mon"],
                              })
                            }
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Monday only
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                selectedDays: ["mon", "tue", "wed", "thu", "fri"],
                              })
                            }
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Weekdays
                          </button>
                        </div>
                      </div>

                      {/* Dropdown & Quick day buttons */}
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = formData.selectedDays.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => toggleDay(day.id)}
                              className={`flex-1 min-w-[50px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                                isSelected
                                  ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                                  : "bg-white dark:bg-[var(--card-bg)] border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-secondary)] hover:border-purple-300"
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Intervals Builder (Matching User's Screenshot) */}
                    <div className="border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-4 bg-gray-50/50 dark:bg-[var(--bg-secondary)]/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-purple-600" />
                          Time Intervals (Per Day)
                        </span>
                        <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                          {formData.intervals.length} slot(s) configured
                        </span>
                      </div>

                      {/* Header Row */}
                      <div className="grid grid-cols-12 gap-3 px-1 mb-2 text-xs font-semibold text-gray-600 dark:text-[var(--text-secondary)]">
                        <div className="col-span-5">From</div>
                        <div className="col-span-5">To</div>
                        <div className="col-span-2 text-right"></div>
                      </div>

                      {/* Interval Rows */}
                      <div className="space-y-2.5">
                        {formData.intervals.map((interval, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-3 items-center"
                          >
                            <div className="col-span-5">
                              <input
                                type="time"
                                required
                                value={interval.start_time}
                                onChange={(e) =>
                                  handleUpdateInterval(
                                    index,
                                    "start_time",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 text-sm font-medium border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow"
                              />
                            </div>
                            <div className="col-span-5">
                              <input
                                type="time"
                                value={interval.end_time || ""}
                                onChange={(e) =>
                                  handleUpdateInterval(
                                    index,
                                    "end_time",
                                    e.target.value
                                  )
                                }
                                placeholder="Optional"
                                className="w-full px-3 py-2 text-sm font-medium border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow"
                              />
                            </div>
                            <div className="col-span-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveInterval(index)}
                                disabled={formData.intervals.length <= 1}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                                title="Remove interval"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Interval Button (Matching Screenshot Style) */}
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[var(--card-border)]">
                        <button
                          type="button"
                          onClick={handleAddInterval}
                          className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Interval
                        </button>
                      </div>
                    </div>

                    {/* Recurrence Range Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          min={new Date().toLocaleDateString("en-CA")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                          Repeat Duration
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={
                              formData.repeatType === "weeks"
                                ? formData.weeksCount
                                : "custom"
                            }
                            onChange={(e) => {
                              if (e.target.value === "custom") {
                                setFormData({
                                  ...formData,
                                  repeatType: "until_date",
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  repeatType: "weeks",
                                  weeksCount: parseInt(e.target.value, 10),
                                });
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                          >
                            <option value={4}>For 4 weeks (1 month)</option>
                            <option value={8}>For 8 weeks (2 months)</option>
                            <option value={12}>For 12 weeks (3 months)</option>
                            <option value={24}>For 24 weeks (6 months)</option>
                            <option value={52}>For 52 weeks (1 year)</option>
                            <option value="custom">Until specific date...</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {formData.repeatType === "until_date" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                          Repeat Until Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.endDate}
                          min={formData.startDate}
                          onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                        />
                      </div>
                    )}

                    {/* Summary Card */}
                    {calculatedEstimate && (
                      <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                        <div className="text-xs text-purple-900 dark:text-purple-200">
                          <span className="font-bold">Summary:</span> This will
                          create{" "}
                          <span className="font-bold underline text-purple-700 dark:text-purple-300">
                            {calculatedEstimate.totalSlots} consultation slot(s)
                          </span>{" "}
                          across {calculatedEstimate.weeks} week(s) (
                          {calculatedEstimate.slotsPerDay} slot(s) on{" "}
                          {formData.selectedDays
                            .map((d) => d.toUpperCase())
                            .join(", ")}
                          ). Existing or past slots will automatically be skipped.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SINGLE SLOT MODE */}
                {formData.mode === "single" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        min={new Date().toLocaleDateString("en-CA")}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* SINGLE DAY RANGE MODE */}
                {formData.mode === "range" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        min={new Date().toLocaleDateString("en-CA")}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endTime: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                        Interval Between Slots
                      </label>
                      <select
                        value={formData.interval}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            interval: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow text-sm"
                      >
                        <option value={15}>Every 15 minutes</option>
                        <option value={30}>Every 30 minutes</option>
                        <option value={45}>Every 45 minutes</option>
                        <option value={60}>Every 60 minutes</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Common setting: Max Bookings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                    Max Bookings Allowed (Per Slot)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxSlots}
                    onChange={(e) =>
                      setFormData({ ...formData, maxSlots: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow placeholder-gray-400 text-sm"
                    placeholder="1 (Leave empty for unlimited)"
                  />
                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                    Typically set to 1 for private 1-on-1 intake consultations.
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t dark:border-[var(--card-border)] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 text-gray-700 dark:text-[var(--text-primary)] border border-gray-300 dark:border-[var(--card-border)] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-md"
                    style={{ backgroundColor: "#6f1d56" }}
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {formData.mode === "recurring"
                      ? "Generate Weekly Slots"
                      : "Save Slot"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}
