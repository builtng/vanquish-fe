"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Save, Loader2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";

export default function ClientFeedbackSettings() {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    feedback_form_enabled: "1",
    feedback_form_session_number: 4,
    feedback_form_url: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanySettings();
      setSettings({
        feedback_form_enabled: data.feedback_form_enabled !== undefined ? String(data.feedback_form_enabled) : "1",
        feedback_form_session_number: data.feedback_form_session_number ? parseInt(data.feedback_form_session_number, 10) : 4,
        feedback_form_url: data.feedback_form_url || "",
      });
    } catch (err) {
      showError("Failed to load feedback form settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setSettings((prev) => ({
      ...prev,
      feedback_form_enabled: prev.feedback_form_enabled === "1" ? "0" : "1",
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateCompanySettings({
        feedback_form_enabled: settings.feedback_form_enabled,
        feedback_form_session_number: parseInt(settings.feedback_form_session_number, 10) || 4,
        feedback_form_url: settings.feedback_form_url ? settings.feedback_form_url.trim() : "",
      });
      success("Feedback form settings updated successfully");
    } catch (err) {
      showError(err.message || "Failed to save feedback form settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  const isEnabled = settings.feedback_form_enabled === "1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-[var(--card-border)]">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">
            Milestone Feedback Email
          </h3>
          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">
            Automatically sends the feedback form email once per client when completed sessions reach milestone N.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 self-start sm:self-auto cursor-pointer focus:outline-none"
        >
          {isEnabled ? (
            <ToggleRight className="w-8 h-8 text-purple-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          )}
          <span className="text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)]">
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">
            Session Milestone (N)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.feedback_form_session_number}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                feedback_form_session_number: Math.max(1, parseInt(e.target.value, 10) || 1),
              }))
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[var(--card-border)] rounded-lg bg-white dark:bg-[var(--card-bg)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <p className="text-[11px] text-gray-500 dark:text-[var(--text-secondary)] mt-1">
            Default is 4. An email is triggered once when a client reaches {settings.feedback_form_session_number} completed sessions (and recurring multiples).
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[var(--text-secondary)] mb-1">
            Feedback Form URL
          </label>
          <input
            type="url"
            placeholder="https://form.jotform.com/..."
            value={settings.feedback_form_url}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                feedback_form_url: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[var(--card-border)] rounded-lg bg-white dark:bg-[var(--card-bg)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <p className="text-[11px] text-gray-500 dark:text-[var(--text-secondary)] mt-1">
            Paste the external form link. This link will be embedded in the feedback email button.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <Link
          href="/dashboard/email-management"
          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Edit &apos;feedback_form&apos; template in Email Management
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-xs transition-colors disabled:opacity-50 self-end sm:self-auto cursor-pointer"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Feedback Settings
        </button>
      </div>
    </div>
  );
}
