"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import apiService from "@/lib/api";
import { 
  Users, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  UserCheck, 
  ChevronRight,
  BookOpen,
  MessageSquare
} from "lucide-react";

export default function PsgPublicAttendancePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [supervisorName, setSupervisorName] = useState("");
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");
  const [attendance, setAttendance] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    if (token) {
      loadGroupData();
    }
  }, [token]);

  const loadGroupData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPublicPsgForm(token);
      setGroup(data.group);
      setCounsellors(data.counsellors || []);
      
      // Initialize all counsellors as present (true)
      const initialAttendance = {};
      const initialComments = {};
      (data.counsellors || []).forEach(tc => {
        initialAttendance[tc.id] = true;
        initialComments[tc.id] = "";
      });
      setAttendance(initialAttendance);
      setComments(initialComments);
    } catch (err) {
      console.error("Error loading group details:", err);
      setError(err?.message || "Invalid or expired attendance link. Please verify the URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCommentChange = (id, val) => {
    setComments(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleMarkAll = (present) => {
    const updated = {};
    counsellors.forEach(tc => {
      updated[tc.id] = present;
    });
    setAttendance(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supervisorName.trim()) {
      alert("Please enter supervisor name.");
      return;
    }
    if (!activities.trim()) {
      alert("Please log session activities.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiService.submitPublicPsgSession(token, {
        session_date: sessionDate,
        supervisor_name: supervisorName,
        activities: activities,
        notes: notes,
        attendance: attendance,
        comments: comments,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting attendance:", err);
      setError(err?.message || "Failed to submit attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#6f1c56]" />
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading Peer Support Group details...</p>
        </div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#1e1e1e] rounded-2xl border border-red-100 dark:border-red-950 p-6 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Access Denied</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#1e1e1e] rounded-2xl border border-green-100 dark:border-green-950 p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Attendance Logged Successfully</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              The Peer Support Group session attendance and activities have been submitted. Counsellor overview dashboards will reflect this update shortly.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setActivities("");
                setNotes("");
                setComments({});
                // keep supervisor name for quick next entry
              }}
              className="w-full py-2.5 bg-[#6f1c56] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-[#6f1c56]/20 active:scale-95"
            >
              Submit Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#6f1c56]/10 flex items-center justify-center mb-3">
            <Users className="w-8 h-8 text-[#6f1c56]" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">PSG Session Attendance</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            Supervisor portal for logging Peer Support Group sessions &amp; counsellor attendance.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-200 dark:border-[#2d2d2d] shadow-xl overflow-hidden">
          {/* Group Header Info */}
          <div className="bg-gradient-to-r from-[#6f1c56] to-purple-800 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
                  Active Group
                </span>
                <h2 className="text-2xl font-black mt-2 leading-none">{group?.name}</h2>
                <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold mt-2.5">
                  <Clock className="w-3.5 h-3.5" />
                  Scheduled: {group?.day_of_week}s
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black bg-white/25 rounded-full px-3 py-1">
                  {counsellors.length} Counsellors
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Session Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#6f1c56] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Supervisor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#6f1c56] outline-none transition-all"
                />
              </div>
            </div>

            {/* Activities field */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Session Activities *
              </label>
              <textarea
                required
                rows={3}
                placeholder="What topics, issues, or cases did the group cover in today's session?"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#6f1c56] outline-none transition-all resize-none"
              />
            </div>

            {/* Notes field */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Supervisor Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Any private comments, individual performance remarks or notes."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#6f1c56] outline-none transition-all resize-none"
              />
            </div>

            {/* Attendance Toggles Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Counsellor Attendance
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleMarkAll(true)}
                    className="text-[10px] font-bold text-[#6f1c56] hover:underline"
                  >
                    Mark All Present
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <button
                    type="button"
                    onClick={() => handleMarkAll(false)}
                    className="text-[10px] font-bold text-gray-500 hover:underline"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {counsellors.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-6">
                  No counsellors currently assigned to this group.
                </p>
              ) : (
                <div className="space-y-3">
                  {counsellors.map((tc) => {
                    const isPresent = !!attendance[tc.id];
                    const commentValue = comments[tc.id] || "";
                    return (
                      <div
                        key={tc.id}
                        className={`border rounded-2xl p-4 transition-all ${
                          isPresent
                            ? "bg-green-50/10 border-green-100 dark:bg-green-950/5 dark:border-green-900/20"
                            : "bg-red-50/5 border-red-100 dark:bg-red-950/5 dark:border-red-900/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div
                            onClick={() => handleToggleAttendance(tc.id)}
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                          >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              isPresent
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            }`}>
                              {tc.name?.[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{tc.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {tc.tc_id ? `${tc.tc_id} | ${tc.email}` : tc.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex items-center gap-2.5">
                            <label className="relative flex items-center justify-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={() => handleToggleAttendance(tc.id)}
                                className="sr-only"
                              />
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                isPresent
                                  ? "bg-[#6f1c56] border-[#6f1c56] shadow-md shadow-[#6f1c56]/20 text-white scale-105"
                                  : "border-gray-300 dark:border-gray-600 bg-transparent text-transparent hover:border-gray-400 dark:hover:border-gray-500"
                              }`}>
                                <svg
                                  className={`w-3.5 h-3.5 stroke-[3] transition-transform duration-200 ${
                                    isPresent ? "scale-100 rotate-0" : "scale-0 rotate-12"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </label>
                            <span
                              onClick={() => handleToggleAttendance(tc.id)}
                              className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                            >
                              Present
                            </span>
                          </div>
                        </div>

                        {/* Optional Comment Section */}
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Optional comment/notes for this counsellor..."
                            value={commentValue}
                            onChange={(e) => handleCommentChange(tc.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#6f1c56] outline-none transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || counsellors.length === 0}
                className="w-full py-3 bg-[#6f1c56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#6f1c56]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                Log Session Attendance
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
