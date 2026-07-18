"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useModal } from "@/contexts/ModalContext";
import {
  Calendar,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  Loader2,
} from "lucide-react";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TimeOffRequestsPage() {
  const { success, error: showError } = useToast();
  const { confirm } = useModal();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [caseload, setCaseload] = useState(null);
  const [caseloadLoading, setCaseloadLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPendingHolidays();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showError("Failed to load time-off requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleExpand = async (holiday) => {
    if (expandedId === holiday.id) {
      setExpandedId(null);
      setCaseload(null);
      return;
    }
    setExpandedId(holiday.id);
    setCaseload(null);
    const tc = holiday.training_counsellor;
    if (!tc) return;
    try {
      setCaseloadLoading(true);
      const data = await apiService.getTcCaseload(tc.uuid || tc.tc_id);
      setCaseload(data);
    } catch (err) {
      console.error(err);
      showError("Failed to load caseload");
    } finally {
      setCaseloadLoading(false);
    }
  };

  const handleApprove = async (holiday) => {
    setActioningId(holiday.id);
    try {
      await apiService.approveHoliday(holiday.id);
      success("Time-off request approved");
      setRequests((prev) => prev.filter((r) => r.id !== holiday.id));
    } catch (err) {
      showError(err.message || "Failed to approve request");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (holiday) => {
    const ok = await confirm({
      title: "Reject Time-Off Request",
      message: `Reject ${holiday.training_counsellor?.name || "this counsellor"}'s request for ${formatDate(holiday.start_date)} — ${formatDate(holiday.end_date)}?`,
      confirmText: "Reject",
      type: "danger",
    });
    if (!ok) return;
    setActioningId(holiday.id);
    try {
      await apiService.rejectHoliday(holiday.id);
      success("Time-off request rejected");
      setRequests((prev) => prev.filter((r) => r.id !== holiday.id));
    } catch (err) {
      showError(err.message || "Failed to reject request");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <PageGuard menuId="time-off-requests">
      <DashboardLayout>
        <div className="flex flex-col flex-1 h-screen bg-gray-50 dark:bg-[var(--bg-primary)] overflow-hidden">
          <DashboardHeader>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Time Off Requests
              </h1>
              <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                Review and approve counsellor time-off requests
              </p>
            </div>
          </DashboardHeader>

          <div className="p-6 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[var(--card-bg)] rounded-lg border dark:border-[var(--card-border)]">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-3" />
                <h3 className="text-lg font-medium dark:text-[var(--text-primary)]">
                  No pending requests
                </h3>
                <p className="text-gray-500 dark:text-[var(--text-secondary)]">
                  All caught up — new time-off requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {requests.map((holiday) => {
                  const isExpanded = expandedId === holiday.id;
                  const isActioning = actioningId === holiday.id;
                  return (
                    <div
                      key={holiday.id}
                      className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden"
                    >
                      <div className="p-5 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-700 dark:text-purple-300 font-bold">
                            {holiday.training_counsellor?.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-[var(--text-primary)]">
                              {holiday.training_counsellor?.name || "Unknown Counsellor"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                              {holiday.training_counsellor?.email}
                            </p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(holiday.start_date)} — {formatDate(holiday.end_date)}
                            </p>
                            {holiday.reason && (
                              <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1 italic">
                                "{holiday.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpand(holiday)}
                            className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)] border border-gray-200 dark:border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors flex items-center gap-1.5"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Caseload
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleReject(holiday)}
                            disabled={isActioning}
                            className="px-3 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => handleApprove(holiday)}
                            disabled={isActioning}
                            className="px-3 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/20 p-5">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                            Clients &amp; Upcoming Sessions
                          </h4>
                          {caseloadLoading ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            </div>
                          ) : !caseload?.upcoming_consultations?.length ? (
                            <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                              No upcoming sessions booked with this counsellor's clients during the requested window.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {caseload.upcoming_consultations.map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between bg-white dark:bg-[var(--card-bg)] border border-gray-100 dark:border-[var(--card-border)] rounded-lg px-4 py-2.5"
                                >
                                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {c.client?.name || "Client"}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)] flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(c.scheduled_at).toLocaleDateString("en-GB", {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                    })}{" "}
                                    at{" "}
                                    {new Date(c.scheduled_at).toLocaleTimeString("en-GB", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
