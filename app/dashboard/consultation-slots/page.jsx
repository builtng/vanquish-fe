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
  Ban,
  Eye,
  CheckCircle2,
  AlertCircle,
  Coffee,
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

  // Active view tab: 'slots' | 'days_off'
  const [activeTab, setActiveTab] = useState("slots");

  const [slots, setSlots] = useState([]);
  const [daysOff, setDaysOff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysOffLoading, setDaysOffLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Day off modal
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [dayOffForm, setDayOffForm] = useState({
    date: new Date().toLocaleDateString("en-CA"),
    reason: "",
  });

  // Filter states for slots
  const [filterTimeframe, setFilterTimeframe] = useState("upcoming"); // 'upcoming' | 'past' | 'all'
  const [filterDay, setFilterDay] = useState("all");
  const [searchDate, setSearchDate] = useState("");

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [formData, setFormData] = useState({
    mode: "bulk", // 'bulk' | 'recurring' | 'single' | 'range'
    // Single / Range date
    date: new Date().toLocaleDateString("en-CA"),
    time: "18:00",
    endTime: "19:00",
    interval: 15,
    maxSlots: 1,

    // Bulk generator options (Prompt 9: days of week, start/end time, slot length, break)
    selectedDays: ["mon", "wed"],
    bulkStartTime: "18:00",
    bulkEndTime: "21:00",
    slotLength: 30,
    breakMinutes: 10,

    // Custom Intervals option
    intervals: [
      { start_time: "18:00", end_time: "18:30" },
      { start_time: "18:40", end_time: "19:10" },
      { start_time: "19:20", end_time: "19:50" },
    ],

    startDate: new Date().toLocaleDateString("en-CA"),
    repeatType: "weeks", // 'weeks' | 'until_date'
    weeksCount: 4,
    endDate: "",
  });

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConsultationSlots();
      const loadedSlots = Array.isArray(data) ? data : data?.data || [];
      // Sort ascending by default for schedule clarity
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

  const fetchDaysOff = async () => {
    try {
      setDaysOffLoading(true);
      const data = await apiService.getConsultationDaysOff();
      setDaysOff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setDaysOffLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchDaysOff();
  }, []);

  const resetForm = () => {
    setFormData({
      mode: "bulk",
      date: new Date().toLocaleDateString("en-CA"),
      time: "18:00",
      endTime: "19:00",
      interval: 15,
      maxSlots: 1,
      selectedDays: ["mon", "wed"],
      bulkStartTime: "18:00",
      bulkEndTime: "21:00",
      slotLength: 30,
      breakMinutes: 10,
      intervals: [
        { start_time: "18:00", end_time: "18:30" },
        { start_time: "18:40", end_time: "19:10" },
      ],
      startDate: new Date().toLocaleDateString("en-CA"),
      repeatType: "weeks",
      weeksCount: 4,
      endDate: "",
    });
    setPreviewData(null);
    setShowPreviewModal(false);
  };

  // Interval Helpers
  const handleAddInterval = () => {
    const lastInterval = formData.intervals[formData.intervals.length - 1];
    let nextStart = "18:00";
    let nextEnd = "18:30";

    if (lastInterval && lastInterval.end_time) {
      const [hours, minutes] = lastInterval.end_time.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + 10;
      const nextStartH = Math.floor(totalMinutes / 60) % 24;
      const nextStartM = totalMinutes % 60;
      const nextEndTotal = totalMinutes + 30;
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

  // Build API payload for bulk or recurring
  const buildPayload = () => {
    const payload = {
      days_of_week: formData.selectedDays,
      start_date: formData.startDate,
      max_slots: parseInt(formData.maxSlots, 10) || 1,
      type: "consultation",
    };

    if (formData.repeatType === "until_date" && formData.endDate) {
      payload.end_date = formData.endDate;
    } else {
      payload.weeks_count = parseInt(formData.weeksCount, 10) || 4;
    }

    if (formData.mode === "bulk") {
      payload.start_time = formData.bulkStartTime;
      payload.end_time = formData.bulkEndTime;
      payload.slot_length = parseInt(formData.slotLength, 10) || 30;
      payload.break_minutes = parseInt(formData.breakMinutes, 10) || 0;
    } else if (formData.mode === "recurring") {
      payload.intervals = formData.intervals.filter((i) => i.start_time);
    }

    return payload;
  };

  // Request preview from backend API
  const handlePreview = async () => {
    if (!formData.selectedDays || formData.selectedDays.length === 0) {
      showError("Please select at least one day of the week");
      return;
    }

    setLoadingPreview(true);
    try {
      const payload = buildPayload();
      const res = await apiService.previewRecurringConsultationSlots(payload);
      setPreviewData(res);
      setShowPreviewModal(true);
    } catch (err) {
      showError(err.message || err.response?.data?.message || "Failed to generate preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.mode === "bulk" || formData.mode === "recurring") {
        if (!formData.selectedDays || formData.selectedDays.length === 0) {
          showError("Please select at least one day of the week");
          setSubmitting(false);
          return;
        }

        const payload = buildPayload();
        const result = await apiService.createRecurringConsultationSlots(payload);
        success(result?.message || "Consultation slots created successfully");
        setShowModal(false);
        setShowPreviewModal(false);
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
          max_slots: parseInt(formData.maxSlots, 10) || 1,
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
        max_slots: parseInt(formData.maxSlots, 10) || 1,
        type: "consultation",
      });
      success("Consultation slot created successfully");
      setShowModal(false);
      resetForm();
      fetchSlots();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || err.message || "Failed to create consultation slot(s)");
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

  // Day Off handlers
  const handleSaveDayOff = async (e) => {
    e.preventDefault();
    if (!dayOffForm.date) {
      showError("Please select a date");
      return;
    }

    try {
      const res = await apiService.createConsultationDayOff(dayOffForm);
      success(res?.message || "Day off marked successfully");
      setShowDayOffModal(false);
      setDayOffForm({
        date: new Date().toLocaleDateString("en-CA"),
        reason: "",
      });
      fetchDaysOff();
      fetchSlots(); // unbooked slots were removed
    } catch (err) {
      showError(err.response?.data?.message || err.message || "Failed to mark day off");
    }
  };

  const handleDeleteDayOff = async (id, dateStr) => {
    const ok = await confirm({
      title: "Remove Day Off",
      message: `Remove day off for ${dateStr}? (Existing slots were already removed; new slots can now be scheduled on this day).`,
      confirmText: "Remove",
      type: "danger",
    });
    if (!ok) return;

    try {
      await apiService.deleteConsultationDayOff(id);
      success("Day off removed successfully");
      fetchDaysOff();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to remove day off");
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDayOffModal(true)}
                  className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all text-sm"
                >
                  <Ban className="w-4 h-4" />
                  Mark Day Off
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:opacity-90 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Slots (Bulk)
                </button>
              </div>
            }
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Consultation Slots & Availability
              </h1>
              <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                Manage consultation booking slots, bulk weekly generator, and clinic days off
              </p>
            </div>
          </DashboardHeader>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

              <div className="bg-white dark:bg-[var(--card-bg)] p-4 rounded-xl border dark:border-[var(--card-border)] shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {daysOff.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                    Marked Days Off
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-[var(--card-border)]">
              <button
                onClick={() => setActiveTab("slots")}
                className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "slots"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Slots Schedule ({slots.length})
              </button>
              <button
                onClick={() => setActiveTab("days_off")}
                className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "days_off"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Ban className="w-4 h-4" />
                Clinic Days Off ({daysOff.length})
              </button>
            </div>

            {/* TAB 1: SLOTS SCHEDULE */}
            {activeTab === "slots" && (
              <>
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

                    {/* Day of Week Filter */}
                    <select
                      value={filterDay}
                      onChange={(e) => setFilterDay(e.target.value)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-700 dark:text-[var(--text-primary)]"
                    >
                      <option value="all">All Days</option>
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full}s
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Date */}
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      placeholder="Filter by date..."
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-700 dark:text-[var(--text-primary)]"
                    />
                    {searchDate && (
                      <button
                        onClick={() => setSearchDate("")}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Table of Slots */}
                {loading ? (
                  <div className="text-center py-12 text-gray-400">Loading consultation slots...</div>
                ) : filteredSlots.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[var(--card-bg)] rounded-xl border dark:border-[var(--card-border)]">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No consultation slots found matching your criteria</p>
                    <button
                      onClick={() => {
                        resetForm();
                        setShowModal(true);
                      }}
                      className="mt-3 text-sm text-purple-600 font-semibold hover:underline"
                    >
                      + Add New Slots
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b dark:border-[var(--card-border)] bg-gray-50/60 dark:bg-[var(--bg-secondary)] text-xs font-semibold text-gray-600 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                          <th className="p-4">Date</th>
                          <th className="p-4">Time (UTC)</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Bookings</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-[var(--card-border)]">
                        {filteredSlots.map((slot) => {
                          const slotDate = new Date(slot.consultation_datetime);
                          const isPast = slotDate < now;
                          return (
                            <tr
                              key={slot.id}
                              className={`hover:bg-gray-50/50 dark:hover:bg-[var(--hover-bg)] transition-colors ${
                                isPast ? "opacity-60" : ""
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
                                  {slot.status?.toUpperCase() || "AVAILABLE"}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                                  <Users className="w-4 h-4 text-gray-400" />{" "}
                                  {slot.booked_slots} / {slot.max_slots || "1"}
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
              </>
            )}

            {/* TAB 2: DAYS OFF */}
            {activeTab === "days_off" && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900 dark:text-amber-200">
                    <p className="font-semibold mb-1">Clinic Days Off & Holidays</p>
                    <p className="text-xs">
                      Marking a day off automatically removes any unbooked consultation slots on that date, closes booked slots to prevent further bookings, and automatically prevents new slots from being scheduled on that day.
                    </p>
                  </div>
                </div>

                {daysOffLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading days off...</div>
                ) : daysOff.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[var(--card-bg)] rounded-xl border dark:border-[var(--card-border)]">
                    <Ban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No clinic days off currently recorded</p>
                    <button
                      onClick={() => setShowDayOffModal(true)}
                      className="mt-3 text-sm text-red-600 font-semibold hover:underline"
                    >
                      + Mark a Day Off
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b dark:border-[var(--card-border)] bg-gray-50/60 dark:bg-[var(--bg-secondary)] text-xs font-semibold text-gray-600 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                          <th className="p-4">Date</th>
                          <th className="p-4">Day of Week</th>
                          <th className="p-4">Reason / Notes</th>
                          <th className="p-4">Added By</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-[var(--card-border)]">
                        {daysOff.map((day) => {
                          const dateObj = new Date(day.date + "T00:00:00Z");
                          return (
                            <tr key={day.id} className="hover:bg-gray-50/50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                              <td className="p-4 font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                                {day.date}
                              </td>
                              <td className="p-4 text-gray-700 dark:text-[var(--text-secondary)]">
                                {dateObj.toLocaleDateString(undefined, { weekday: "long", timeZone: "UTC" })}
                              </td>
                              <td className="p-4 text-gray-600 dark:text-[var(--text-secondary)]">
                                {day.reason || <span className="italic text-gray-400">Clinic Closed</span>}
                              </td>
                              <td className="p-4 text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                                {day.creator?.name || day.creator?.email || "Admin"}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteDayOff(day.id, day.date)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Remove Day Off"
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
            )}
          </div>
        </div>

        {/* MODAL: ADD CONSULTATION SLOTS */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-900 dark:text-[var(--text-primary)] my-8">
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
                      Create slots in bulk with weekly repeating schedule & live preview
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

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Mode Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] mb-2">
                    Slot Generator Mode
                  </label>
                  <div className="grid grid-cols-4 gap-2 bg-gray-100 dark:bg-[var(--bg-secondary)] p-1.5 rounded-xl text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: "bulk" })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        formData.mode === "bulk"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-white/50"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Bulk Generator
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: "recurring" })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        formData.mode === "recurring"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-white/50"
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      Custom Intervals
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: "range" })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        formData.mode === "range"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-white/50"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Single Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: "single" })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        formData.mode === "single"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-white/50"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      One Slot
                    </button>
                  </div>
                </div>

                {/* BULK GENERATOR (Prompt 9 specification) */}
                {formData.mode === "bulk" && (
                  <div className="space-y-5">
                    {/* Days Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
                          Days of the Week <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                selectedDays: ["mon", "wed"],
                              })
                            }
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Mon & Wed
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
                            Mon - Fri
                          </button>
                        </div>
                      </div>

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

                    {/* Time Window, Slot Length & Break */}
                    <div className="p-4 bg-gray-50/70 dark:bg-[var(--bg-secondary)]/50 rounded-xl border border-gray-200 dark:border-[var(--card-border)] space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                            Start Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            required
                            value={formData.bulkStartTime}
                            onChange={(e) =>
                              setFormData({ ...formData, bulkStartTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                            End Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            required
                            value={formData.bulkEndTime}
                            onChange={(e) =>
                              setFormData({ ...formData, bulkEndTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                            Slot Length
                          </label>
                          <select
                            value={formData.slotLength}
                            onChange={(e) =>
                              setFormData({ ...formData, slotLength: parseInt(e.target.value, 10) })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={20}>20 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={50}>50 minutes</option>
                            <option value={60}>60 minutes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                            <Coffee className="w-3.5 h-3.5 text-gray-500" />
                            Break Between Slots
                          </label>
                          <select
                            value={formData.breakMinutes}
                            onChange={(e) =>
                              setFormData({ ...formData, breakMinutes: parseInt(e.target.value, 10) })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                          >
                            <option value={0}>No break (0 min)</option>
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                          </select>
                        </div>
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
                            setFormData({ ...formData, startDate: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                          Repeat Duration
                        </label>
                        <select
                          value={formData.repeatType === "weeks" ? formData.weeksCount : "until_date"}
                          onChange={(e) => {
                            if (e.target.value === "until_date") {
                              setFormData({ ...formData, repeatType: "until_date" });
                            } else {
                              setFormData({
                                ...formData,
                                repeatType: "weeks",
                                weeksCount: parseInt(e.target.value, 10),
                              });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                        >
                          <option value={4}>4 weeks (1 month)</option>
                          <option value={8}>8 weeks (2 months)</option>
                          <option value={12}>12 weeks (3 months)</option>
                          <option value={24}>24 weeks (6 months)</option>
                          <option value={52}>52 weeks (1 year)</option>
                          <option value="until_date">Repeat weekly until date...</option>
                        </select>
                      </div>
                    </div>

                    {formData.repeatType === "until_date" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                          Repeat Weekly Until <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.endDate}
                          min={formData.startDate}
                          onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* CUSTOM INTERVALS RECURRING */}
                {formData.mode === "recurring" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                        Days of the Week
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`flex-1 min-w-[50px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                              formData.selectedDays.includes(day.id)
                                ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-4 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Custom Intervals (Per Day)</span>
                        <span className="text-xs text-gray-500">{formData.intervals.length} slot(s)</span>
                      </div>
                      <div className="space-y-2">
                        {formData.intervals.map((interval, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-5">
                              <input
                                type="time"
                                required
                                value={interval.start_time}
                                onChange={(e) => handleUpdateInterval(index, "start_time", e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                              />
                            </div>
                            <div className="col-span-5">
                              <input
                                type="time"
                                value={interval.end_time || ""}
                                onChange={(e) => handleUpdateInterval(index, "end_time", e.target.value)}
                                placeholder="End Time"
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                              />
                            </div>
                            <div className="col-span-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveInterval(index)}
                                disabled={formData.intervals.length <= 1}
                                className="p-2 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddInterval}
                        className="mt-3 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Interval
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          min={new Date().toLocaleDateString("en-CA")}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Weeks Count</label>
                        <input
                          type="number"
                          min="1"
                          max="52"
                          value={formData.weeksCount}
                          onChange={(e) => setFormData({ ...formData, weeksCount: parseInt(e.target.value, 10) || 1 })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SINGLE / RANGE MODES */}
                {formData.mode === "single" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        min={new Date().toLocaleDateString("en-CA")}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}

                {formData.mode === "range" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        min={new Date().toLocaleDateString("en-CA")}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          required
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Slot Interval</label>
                        <select
                          value={formData.interval}
                          onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value, 10) })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={45}>45 mins</option>
                          <option value={60}>60 mins</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Common setting: Max Bookings */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                    Max Bookings Allowed (Per Slot)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxSlots}
                    onChange={(e) => setFormData({ ...formData, maxSlots: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm"
                    placeholder="1 (Default for 1-on-1 consultations)"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t dark:border-[var(--card-border)] flex items-center justify-between">
                  <div>
                    {(formData.mode === "bulk" || formData.mode === "recurring") && (
                      <button
                        type="button"
                        onClick={handlePreview}
                        disabled={loadingPreview}
                        className="px-4 py-2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-purple-100 transition-colors"
                      >
                        {loadingPreview ? (
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        Preview Before Saving
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-md"
                      style={{ backgroundColor: "#6f1d56" }}
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save & Create Slots
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PREVIEW SLOTS */}
        {showPreviewModal && previewData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
              <div className="p-5 border-b flex justify-between items-center bg-gray-50 dark:bg-[var(--bg-secondary)]">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Preview Consultation Slots
                  </h3>
                  <p className="text-xs text-gray-500">
                    Review generated slots before creating them in the database
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-100">
                    <div className="text-2xl font-bold text-purple-700">{previewData.total_count}</div>
                    <div className="text-xs text-purple-900">Slots To Create</div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">{previewData.weeks_count}</div>
                    <div className="text-xs text-blue-900">Weeks Span</div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100">
                    <div className="text-2xl font-bold text-amber-700">
                      {previewData.days_off_skipped?.length || 0}
                    </div>
                    <div className="text-xs text-amber-900">Days Off Skipped</div>
                  </div>
                </div>

                {previewData.days_off_skipped?.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <span className="font-bold">Skipped Dates (Marked Days Off):</span>{" "}
                    {previewData.days_off_skipped.join(", ")}
                  </div>
                )}

                <div className="border rounded-xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 dark:bg-[var(--bg-secondary)] sticky top-0 font-semibold text-gray-600">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Day</th>
                          <th className="p-2.5">Start Time</th>
                          <th className="p-2.5">End Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewData.slots.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-2.5 font-medium">{s.date}</td>
                            <td className="p-2.5 text-gray-600">{s.day_name}</td>
                            <td className="p-2.5 font-semibold text-purple-700">{s.start_time}</td>
                            <td className="p-2.5 text-gray-500">{s.end_time || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  Back to Settings
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-md"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirm & Create {previewData.total_count} Slots
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MARK DAY OFF */}
        {showDayOffModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-gray-900 dark:text-[var(--text-primary)]">
              <div className="p-5 border-b flex justify-between items-center bg-red-50 dark:bg-red-950/40">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                  <Ban className="w-5 h-5" />
                  Mark Clinic Day Off
                </div>
                <button
                  onClick={() => setShowDayOffModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDayOff} className="p-6 space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Select a date to close the clinic. Any <strong>unbooked consultation slots</strong> on this date will be automatically removed from the system.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dayOffForm.date}
                    onChange={(e) => setDayOffForm({ ...dayOffForm, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reason / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={dayOffForm.reason}
                    onChange={(e) => setDayOffForm({ ...dayOffForm, reason: e.target.value })}
                    placeholder="e.g. Bank Holiday, Staff Training, Christmas Closure"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDayOffModal(false)}
                    className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <Ban className="w-4 h-4" />
                    Mark Day Off & Remove Slots
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
