"use client";

import React, { useState, useEffect } from "react";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import {
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart2,
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

const PSG_GROUPS = [
  {
    name: "Group 5 - Mondays",
    day: "Monday",
    url: "https://form.jotform.com/252162390922454",
    time: "Mondays",
    gradient: "from-purple-500/10 to-indigo-500/10",
    border: "hover:border-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400 font-bold",
  },
  {
    name: "Group 4 - Thursdays",
    day: "Thursday",
    url: "https://form.jotform.com/250412125203438",
    time: "Thursdays",
    gradient: "from-orange-500/10 to-amber-500/10",
    border: "hover:border-orange-500",
    text: "text-orange-600 dark:text-orange-400 font-bold",
  },
  {
    name: "Group 3 - Wednesdays",
    day: "Wednesday",
    url: "https://form.jotform.com/241365224856459",
    time: "Wednesdays",
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "hover:border-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400 font-bold",
  },
];

const PROGRESS_FORMS = [
  {
    title: "End of Therapy Form",
    subtitle: "Trainee & Qualified Counsellors",
    url: "https://form.jotform.com/242455166711051",
    icon: FileText,
    accent: "#6f1d56",
    description: "Complete this form when a client's therapy journey concludes.",
  },
  {
    title: "Client Progress Review",
    subtitle: "Trainee Counsellors",
    url: "https://form.jotform.com/240292614707051",
    icon: BarChart2,
    accent: "#3b82f6",
    description: "Periodic review to document client progress and therapeutic outcomes.",
  },
];

export default function AttendanceProgressPage() {
  const { user: authUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendanceGroup, setAttendanceGroup] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [unreadRes, profileRes] = await Promise.all([
        apiService.getUnreadMessageCount(),
        apiService.getCounsellorOwnData(),
      ]);
      setUnreadCount(unreadRes?.count || 0);
      setAttendanceGroup(profileRes?.attendance_group || null);
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

          {/* Assigned Group Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Your Assigned peer support group
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

                {/* Attendance Form */}
                {attendanceGroup.supervisor_link && (
                  <div className="bg-white dark:bg-[var(--card-bg)] border border-t-0 border-gray-200 dark:border-[var(--card-border)] rounded-b-2xl p-5">
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-3 font-medium">
                      Access the attendance logging form for your group supervisor.
                    </p>
                    <a
                      href={attendanceGroup.supervisor_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6f1c56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#6f1c56]/20 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Supervisor Link
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  </div>
                )}</div>
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
                    You aren't allocated to a group in the system yet. Please contact the clinical admin team. You can still use the directory below to mark your attendance.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Quick Attendance Directory */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Peer Support Group Directory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PSG_GROUPS.map((group, idx) => {
                const isAssigned = attendanceGroup && attendanceGroup.day_of_week === group.day;
                return (
                  <div
                    key={idx}
                    className={`bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col justify-between hover:shadow-lg ${group.border} relative overflow-hidden`}
                  >
                    {isAssigned && (
                      <div className="absolute top-0 right-0 bg-[#6f1d56] text-white px-2.5 py-1 text-[9px] font-bold rounded-bl-xl flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-300" />
                        My Group
                      </div>
                    )}
                    <div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center mb-4`}>
                        <Calendar className={`w-5 h-5 ${group.text}`} />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm mb-1 leading-snug">
                        {group.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-[var(--text-secondary)] mb-4">
                        Weekly Peer Support Group on {group.time}.
                      </p>
                    </div>

                    <a
                      href={group.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 border w-full ${
                        isAssigned
                          ? "bg-[#6f1d56] hover:bg-[#6f1d56]/90 text-white border-transparent shadow-md"
                          : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <span>Supervisor Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Progress Forms Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Clinical Progress Forms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROGRESS_FORMS.map((form, idx) => (
                <div
                  key={idx}
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

                  <a
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6f1d56] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-[#6f1d56]/20 active:scale-95 w-full"
                  >
                    Open Form
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
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
