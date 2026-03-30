"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, ToggleLeft, ToggleRight, Layout, FileText, ClipboardList, PenTool, UserPlus } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";

export default function SystemModuleToggleSettings() {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    use_internal_session_notes: "0",
    use_internal_psg_form: "0",
    use_internal_agreement_form: "0",
    use_internal_intake_form: "0",
    use_internal_trainee_application: "0",
    jotform_session_notes_url: "",
    jotform_psg_form_url: "",
    jotform_agreement_url: "",
    jotform_intake_form_url: "",
    jotform_trainee_application_url: "",
    jotform_therapy_form_url: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanySettings();
      setSettings({
        use_internal_session_notes: data.use_internal_session_notes || "0",
        use_internal_psg_form: data.use_internal_psg_form || "0",
        use_internal_agreement_form: data.use_internal_agreement_form || "0",
        use_internal_intake_form: data.use_internal_intake_form || "0",
        use_internal_trainee_application: data.use_internal_trainee_application || "0",
        jotform_session_notes_url: data.jotform_session_notes_url || "",
        jotform_psg_form_url: data.jotform_psg_form_url || "",
        jotform_agreement_url: data.jotform_agreement_url || "",
        jotform_intake_form_url: data.jotform_intake_form_url || "",
        jotform_trainee_application_url: data.jotform_trainee_application_url || "",
        jotform_therapy_form_url: data.jotform_therapy_form_url || "",
      });
    } catch (err) {
      showError("Failed to load module settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "1" ? "0" : "1",
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await apiService.updateCompanySettings(settings);
      success("Module settings updated successfully");
    } catch (err) {
      showError(err.message || "Failed to update module settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const modules = [
    {
      key: "use_internal_intake_form",
      urlKey: "jotform_intake_form_url",
      label: "Client Intake Form",
      description: "Toggle between JotForm and the Internal Multi-step Intake Form",
      icon: UserPlus,
    },
    {
      key: "use_internal_agreement_form",
      urlKey: "jotform_agreement_url",
      label: "Client Agreement Signing",
      description: "Toggle between JotForm and Internal Digital Signature Agreement",
      icon: PenTool,
    },
    {
      key: "use_internal_session_notes",
      urlKey: "jotform_session_notes_url",
      label: "Session Notes Submission",
      description: "Toggle between JotForm and Internal Session Notes Module",
      icon: FileText,
    },
    {
      key: "use_internal_psg_form",
      urlKey: "jotform_psg_form_url",
      label: "Monthly PSG Reflection",
      description: "Toggle between JotForm and Internal PSG Submission Form",
      icon: ClipboardList,
    },
    {
      key: "use_internal_trainee_application",
      urlKey: "jotform_trainee_application_url",
      label: "Trainee Counsellor Application",
      description: "Toggle between JotForm and Internal Trainee Recruitment Module",
      icon: Layout,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <div
            key={module.key}
            className="flex flex-col p-4 bg-gray-50 dark:bg-[var(--hover-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="mt-1 w-8 h-8 rounded-lg bg-white dark:bg-[var(--card-bg)] flex items-center justify-center shadow-sm">
                  <module.icon className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {module.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1 max-w-[200px]">
                    {module.description}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle(module.key)}
                className="mt-1 transition-transform active:scale-95"
              >
                {settings[module.key] === "1" ? (
                  <ToggleRight className="w-10 h-10 text-purple-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings[module.key] === "1" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-purple-100 text-purple-700"
                }`}>
                  {settings[module.key] === "1" ? "INTERNAL ACTIVE" : "JOTFORM ACTIVE"}
                </span>
              </div>

              {settings[module.key] === "0" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    JotForm URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://form.jotform.com/..."
                    value={settings[module.urlKey] || ""}
                    onChange={(e) => handleInputChange(module.urlKey, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-[var(--text-primary)]"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Special case: Therapy Form URL (usually tied to trainee application or agreement) */}
        <div className="flex flex-col p-4 bg-gray-50 dark:bg-[var(--hover-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
          <div className="flex gap-3">
            <div className="mt-1 w-8 h-8 rounded-lg bg-white dark:bg-[var(--card-bg)] flex items-center justify-center shadow-sm">
              <PenTool className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Trainee Therapy Form
              </h3>
              <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                Configure the JotForm URL for trainee personal therapy confirmation.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              JotForm URL
            </label>
            <input
              type="url"
              placeholder="https://form.jotform.com/..."
              value={settings.jotform_therapy_form_url || ""}
              onChange={(e) => handleInputChange("jotform_therapy_form_url", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-[var(--card-border)]">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-bold text-sm shadow-md"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Module Configuration"}
        </button>
      </div>
    </div>
  );
}
