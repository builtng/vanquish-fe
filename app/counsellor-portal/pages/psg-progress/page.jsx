"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import apiService from "@/lib/api";
import { CLINICAL_PROGRESS_FORMS } from "@/lib/counsellorForms";
import {
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";

const DAY_COLORS = {
  Monday: "from-purple-500 to-indigo-500",
  Tuesday: "from-pink-500 to-rose-500",
  Wednesday: "from-emerald-500 to-teal-500",
  Thursday: "from-orange-500 to-amber-500",
  Friday: "from-blue-500 to-cyan-500",
  Saturday: "from-violet-500 to-purple-500",
  Sunday: "from-red-500 to-pink-500",
};

function formatDate(dateValue) {
  if (!dateValue) return "Not submitted";

  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AttendanceProgressPage() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendanceGroup, setAttendanceGroup] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [psgSessions, setPsgSessions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [unreadRes, profileRes, reflectionsRes, sessionsRes] = await Promise.all([
        apiService.getUnreadMessageCount(),
        apiService.getCounsellorOwnData(),
        apiService.getPsgReflections(),
        apiService.getPsgSessions(),
      ]);
      setUnreadCount(unreadRes?.count || 0);
      setAttendanceGroup(profileRes?.attendance_group || null);
      setReflections(Array.isArray(reflectionsRes) ? reflectionsRes : []);
      setPsgSessions(Array.isArray(sessionsRes) ? sessionsRes : []);
    } catch (err) {
      console.error("Error loading PSG data:", err);
      setError("Unable to load your PSG details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dayGradient = attendanceGroup?.day_of_week
    ? DAY_COLORS[attendanceGroup.day_of_week] || "from-[#6f1d56] to-purple-600"
    : "from-[#6f1d56] to-purple-600";

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const submittedThisMonth = reflections.some((reflection) => {
    const attendanceDate = new Date(reflection.attendance_date);
    return `${attendanceDate.getFullYear()}-${attendanceDate.getMonth()}` === currentMonthKey;
  });

  const sessionsThisMonth = psgSessions.filter((session) => {
    const sDate = new Date(session.session_date);
    return `${sDate.getFullYear()}-${sDate.getMonth()}` === currentMonthKey;
  });
  const attendedCount = sessionsThisMonth.filter(s => s.attended).length;
  const totalSessionsThisMonth = sessionsThisMonth.length;

  const latestReflection = reflections[0] || null;
  const lastAttendedSession = psgSessions.find(s => s.attended);
  const lastAttendedDate = lastAttendedSession ? lastAttendedSession.session_date : null;


  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            Attendance &amp; Progress
          </h1>
          <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">
            Access your Peer Support Group attendance links and clinical progress forms
          </p>
        </div>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-4xl space-y-8">
          {/* Overview Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Overview
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-28 bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : error ? null : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#6f1d56]/10 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-[#6f1d56]" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] font-bold uppercase tracking-wide">
                    Assigned Groups
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-[var(--text-primary)] mt-1">
                    {attendanceGroup ? 1 : 0}
                  </p>
                </div>

                <div className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] font-bold uppercase tracking-wide">
                    This Month (Attended)
                  </p>
                  <p className="text-sm font-black text-gray-900 dark:text-[var(--text-primary)] mt-2">
                    {totalSessionsThisMonth > 0 ? `${attendedCount} / ${totalSessionsThisMonth} Sessions` : "No sessions logged"}
                  </p>
                </div>

                <div className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] font-bold uppercase tracking-wide">
                    Last Attendance
                  </p>
                  <p className="text-sm font-black text-gray-900 dark:text-[var(--text-primary)] mt-2">
                    {formatDate(lastAttendedDate || latestReflection?.attendance_date)}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Assigned Group Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Your Assigned Peer Support Group
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12 bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl">
                <RefreshCw className="w-6 h-6 animate-spin text-[#6f1d56]/50" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            ) : attendanceGroup ? (
              <div className="relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl border border-gray-100 dark:border-gray-800">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${dayGradient} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-0.5">
                          My Assigned PSG Group
                        </p>
                        <h3 className="text-2xl font-black">{attendanceGroup.name}</h3>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/25 rounded-full px-3 py-1 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                      Active Allocation
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 bg-white/15 rounded-xl px-4 py-2.5 w-fit">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold text-sm">{attendanceGroup.day_of_week}s</span>
                  </div>
                </div>

                {/* PSG Reflection Form CTA */}
                <div className="bg-white dark:bg-[var(--card-bg)] border border-t-0 border-gray-200 dark:border-[var(--card-border)] rounded-b-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-3 font-medium">
                    Submit your monthly PSG reflection for this group session.
                  </p>
                  <Link
                    href="/counsellor-portal/pages/psg-form"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6f1c56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#6f1c56]/20 active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    PSG Reflection Form
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-700 dark:text-[var(--text-primary)]">
                    No Peer Support Group Assigned
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1 max-w-xs">
                    You aren't allocated to a group in the system yet. Please contact the clinical admin team before logging attendance.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Supervisor Attendance Logs */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Supervisor Attendance Logs
            </h2>
            <div className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#6f1d56]/50" />
                </div>
              ) : psgSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">
                    No supervisor logs recorded yet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                    When a supervisor logs group session attendance, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {psgSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="p-5 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            session.attended 
                              ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950/20" 
                              : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/20"
                          }`}>
                            {session.attended ? "Present" : "Absent"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Supervisor: {session.supervisor_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatDate(session.session_date)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                        Activities Covered:
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                        {session.activities}
                      </p>
                      {session.notes && (
                        <div className="mt-2 text-[11px] text-gray-500 italic bg-gray-50 dark:bg-gray-800/40 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                          Note: {session.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  {psgSessions.length > 5 && (
                    <div className="px-5 py-3 text-xs text-gray-500 dark:text-[var(--text-secondary)] bg-gray-50/50 dark:bg-gray-800/20">
                      Showing 5 of {psgSessions.length} supervisor logs.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Submission History */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Attendance Reflection History
            </h2>
            <div className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#6f1d56]/50" />
                </div>
              ) : reflections.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">
                    No attendance reflections yet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                    Your submitted PSG reflections will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {reflections.slice(0, 5).map((reflection) => (
                    <div key={reflection.id} className="p-5 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase text-[#6f1d56] px-2 py-0.5 bg-[#6f1d56]/10 rounded">
                          {reflection.status || "Submitted"}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatDate(reflection.attendance_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {reflection.reflection}
                      </p>
                    </div>
                  ))}
                  {reflections.length > 5 && (
                    <div className="px-5 py-3 text-xs text-gray-500 dark:text-[var(--text-secondary)] bg-gray-50/50 dark:bg-gray-800/20">
                      Showing 5 of {reflections.length} submissions.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Progress Forms Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Clinical Progress Forms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLINICAL_PROGRESS_FORMS.map((form) => (
                <div
                  key={form.slug}
                  className="group bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${form.accent}15` }}
                    >
                      <form.icon className="w-5 h-5" style={{ color: form.accent }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm leading-tight group-hover:text-[#6f1d56] transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mt-0.5">
                        {form.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] flex-1 mb-4 leading-relaxed">
                    {form.description}
                  </p>

                  <Link
                    href={form.href}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6f1d56] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-[#6f1d56]/20 active:scale-95 w-full"
                  >
                    Open Form
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Guidelines / Info Section */}
          <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
            <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Attendance &amp; Form Submission Policy
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 leading-relaxed">
                Log your attendance for your Peer Support Group immediately after each weekly session. Progress reviews should be completed as required in the client path. Concluding files like the End of Therapy form must be submitted within 24 hours of concluding client work.
              </p>
            </div>
          </div>

        </div>
      </div>
    </CounsellorLayout>
  );
}
