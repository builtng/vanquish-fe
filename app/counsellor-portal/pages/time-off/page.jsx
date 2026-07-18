"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Calendar, Plus, X, Save } from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TimeOffPageContent() {
  const { success, error: showError } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ start_date: "", end_date: "", reason: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unreadRes, holidaysRes] = await Promise.all([
        apiService.getUnreadMessageCount(),
        apiService.getMyHolidays(),
      ]);
      setUnreadCount(unreadRes?.count || 0);
      setHolidays(Array.isArray(holidaysRes) ? holidaysRes : []);
    } catch (err) {
      console.error("Error loading time-off requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      showError("End date must be on or after the start date");
      return;
    }
    setSubmitting(true);
    try {
      await apiService.requestHoliday(formData);
      success("Time-off request submitted");
      setShowModal(false);
      setFormData({ start_date: "", end_date: "", reason: "" });
      loadData();
    } catch (err) {
      showError(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#6f1d56] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Request Time Off
          </button>
        }
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            Time Off
          </h1>
          <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">
            Request days off and track approval status
          </p>
        </div>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6f1d56]"></div>
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)]">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">
                No time-off requests yet
              </h3>
              <p className="text-gray-500 dark:text-[var(--text-secondary)] text-sm mt-1">
                Use "Request Time Off" to submit dates for admin approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6f1d56]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#6f1d56]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-[var(--text-primary)]">
                        {formatDate(holiday.start_date)} — {formatDate(holiday.end_date)}
                      </p>
                      {holiday.reason && (
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                          {holiday.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border flex-shrink-0 ${
                      STATUS_STYLES[holiday.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {holiday.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-xl w-full max-w-md overflow-hidden text-gray-900 dark:text-[var(--text-primary)]">
            <div className="flex items-center justify-between p-4 border-b dark:border-[var(--card-border)] bg-gray-50 dark:bg-[var(--bg-secondary)]">
              <h3 className="font-bold text-lg">Request Time Off</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] rounded-lg focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  min={formData.start_date || new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] rounded-lg focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                  Reason
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Let the admin team know why you're requesting this time off..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] rounded-lg focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent outline-none transition-shadow resize-none"
                />
              </div>
              <div className="pt-4 mt-2 border-t dark:border-[var(--card-border)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-gray-700 dark:text-[var(--text-primary)] border border-gray-300 dark:border-[var(--card-border)] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  <Save className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CounsellorLayout>
  );
}

export default function TimeOffPage() {
  return (
    <SidebarProvider>
      <TimeOffPageContent />
    </SidebarProvider>
  );
}
