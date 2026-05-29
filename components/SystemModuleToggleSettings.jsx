"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Layout,
  FileText,
  ClipboardList,
  PenTool,
  UserPlus,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  File,
} from "lucide-react";
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

  // 4-Way Agreement state
  const [agreementDoc, setAgreementDoc] = useState(null); // { is_real, size, uploaded_at, filename }
  const [docLoading, setDocLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSettings();
    loadAgreementStatus();
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

  const loadAgreementStatus = async () => {
    try {
      setDocLoading(true);
      const data = await apiService.getFourWayAgreementStatus();
      setAgreementDoc(data);
    } catch (err) {
      // Non-critical — silently fail
      setAgreementDoc(null);
    } finally {
      setDocLoading(false);
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

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/pdf"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(docx|doc|pdf)$/i)) {
      showError("Only .docx, .doc, or .pdf files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError("File must be under 10 MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      await apiService.uploadFourWayAgreement(selectedFile);
      success("4-Way Agreement uploaded — it will be attached to all future placement acceptance emails.");
      setSelectedFile(null);
      await loadAgreementStatus();
    } catch (err) {
      showError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove the 4-Way Agreement document? A placeholder will be used until a new file is uploaded.")) return;
    try {
      setDeleting(true);
      await apiService.deleteFourWayAgreement();
      success("Document removed.");
      setSelectedFile(null);
      await loadAgreementStatus();
    } catch (err) {
      showError(err.message || "Failed to remove document.");
    } finally {
      setDeleting(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
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

  const docIsReal = agreementDoc?.is_real === true;

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
        
        {/* Special case: Therapy Form URL */}
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

      {/* ── 4-Way Agreement Document Upload ──────────────────────────────── */}
      <div className="rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <File className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
              4-Way Agreement Document
            </h3>
            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
              This file is automatically <strong>attached</strong> to every Placement Acceptance email sent to trainees.
            </p>
          </div>
        </div>

        {/* Current status */}
        {docLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking document status...
          </div>
        ) : (
          <div className={`flex items-start justify-between p-3 rounded-lg mb-4 ${
            docIsReal
              ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40"
              : "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40"
          }`}>
            <div className="flex items-center gap-2.5">
              {docIsReal ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div>
                <p className={`text-xs font-bold ${docIsReal ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                  {docIsReal ? "Real document uploaded ✓" : "No document — placeholder in use"}
                </p>
                {docIsReal && (
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {agreementDoc.filename} &nbsp;·&nbsp; {formatBytes(agreementDoc.size)} &nbsp;·&nbsp; Uploaded {agreementDoc.uploaded_at?.slice(0, 10)}
                  </p>
                )}
                {!docIsReal && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">
                    Emails will attach a blank placeholder until you upload the real file below.
                  </p>
                )}
              </div>
            </div>

            {docIsReal && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800/40"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Remove
              </button>
            )}
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 py-7 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30"
              : selectedFile
              ? "border-purple-400 bg-purple-50 dark:bg-purple-950/20"
              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/20 hover:border-purple-400 hover:bg-purple-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <Upload className={`w-6 h-6 ${selectedFile ? "text-purple-600" : "text-gray-400"}`} />
          {selectedFile ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">{selectedFile.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{formatBytes(selectedFile.size)} — click to change</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Drag & drop or <span className="text-purple-600 underline">click to browse</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">.docx, .doc or .pdf — max 10 MB</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-3 flex gap-2 justify-end">
            <button
              onClick={() => setSelectedFile(null)}
              className="px-4 py-1.5 text-xs font-semibold text-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-all shadow-sm"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        )}
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

