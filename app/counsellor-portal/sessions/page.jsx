"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Calendar,
  Clock,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Video,
  User,
  ArrowUpRight,
} from "lucide-react";

function SessionsPageContent() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { error: showError } = useToast();

  const [counsellorData, setCounsellorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!authUser) return;
    loadData();
  }, [authUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dataRes, countRes] = await Promise.allSettled([
        apiService.getCounsellorOwnData(),
        apiService.getUnreadMessageCount(),
      ]);

      if (dataRes.status === "fulfilled") {
        setCounsellorData(dataRes.value);
      }
      if (countRes.status === "fulfilled") {
        setUnreadCount(countRes.value?.count || 0);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
      showError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const upcomingSessions = counsellorData?.upcoming_consultations || [];

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          My Sessions
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Your schedule and upcoming consultations
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Upcoming Sessions Section */}
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#6f1d56]" />
                    <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
                      Upcoming Consultations
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#6f1d56]/10 text-[#6f1d56] text-xs font-bold">
                    {upcomingSessions.length} Total
                  </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-[var(--card-border)]">
                  {upcomingSessions.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 dark:text-[var(--text-secondary)] text-sm">
                        No upcoming sessions scheduled.
                      </p>
                    </div>
                  ) : (
                    upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex flex-col items-center justify-center text-[#6f1d56] flex-shrink-0 border border-purple-100 dark:border-purple-800/30">
                            <span className="text-[10px] font-bold uppercase tracking-tighter leading-none mb-0.5">
                              {new Date(
                                session.scheduled_at,
                              ).toLocaleDateString("en-GB", { month: "short" })}
                            </span>
                            <span className="text-lg font-black leading-none">
                              {new Date(session.scheduled_at).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
                                {session.client?.name || "Private Client"}
                              </h3>
                              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(
                                  session.scheduled_at,
                                ).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 ">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-100 dark:border-blue-800/30">
                                <Video className="w-3 h-3" />
                                {session.medium || "Zoom Call"}
                              </div>
                              {session.is_returning && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-100 dark:border-indigo-800/30">
                                  Returning
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {session.google_calendar_link && (
                            <a
                              href={session.google_calendar_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Calendar
                            </a>
                          )}
                          <button className="px-4 py-1.5 bg-[#6f1d56] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">
                            Join Session
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Note about session notes */}
              <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm mb-1">
                    Session Notes & Documentation
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                    Remember to complete your session notes immediately after
                    each consultation. You can find the required forms under "My
                    Pages" in the sidebar. Timely documentation ensures accurate
                    client history and professional compliance.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </CounsellorLayout>
  );
}

export default function SessionsPage() {
  return (
    <SidebarProvider>
      <SessionsPageContent />
    </SidebarProvider>
  );
}
