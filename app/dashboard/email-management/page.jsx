"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import RichTextEditor from "@/components/RichTextEditor";
import apiService from "@/lib/api";
import { toast } from "react-toastify";
import {
  Mail,
  Save,
  RefreshCcw,
  Info,
  ChevronRight,
  Eye,
  Type,
  User,
  Calendar,
  Code,
} from "lucide-react";

export default function EmailManagement() {
  const [templates, setTemplates] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmailTemplates();
      setTemplates(data);
      if (data.length > 0) {
        handleSelectTemplate(data[0]);
      }
    } catch (error) {
      toast.error("Failed to load email templates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedType(template.type);
    setFormData({
      subject: template.subject,
      body: template.body,
    });
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!selectedType) return;

    try {
      setSaving(true);
      await apiService.updateEmailTemplate(selectedType, formData);
      toast.success("Template updated successfully");

      // Update local state
      setTemplates(
        templates.map((t) =>
          t.type === selectedType ? { ...t, ...formData } : t,
        ),
      );
    } catch (error) {
      toast.error("Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedType) return;
    if (
      !window.confirm(
        "Are you sure you want to reset this template to default?",
      )
    )
      return;

    try {
      setSaving(true);
      const data = await apiService.resetEmailTemplate(selectedType);
      setFormData({
        subject: data.template.subject,
        body: data.template.body,
      });
      toast.success("Template reset to default");
    } catch (error) {
      toast.error("Failed to reset template");
    } finally {
      setSaving(false);
    }
  };

  const insertPlaceholder = (placeholder) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + ` {{${placeholder}}}`,
    }));
  };

  const selectedTemplate = templates.find((t) => t.type === selectedType);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardHeader>
          <h1 className="text-2xl font-bold">Email Management</h1>
        </DashboardHeader>
        <div className="p-8 flex justify-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader>
        <div className="flex items-center gap-3">
          <Mail className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure automated emails and notification templates
        </p>
      </DashboardHeader>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Template List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-500" />
                Templates
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {templates.map((template) => (
                <button
                  key={template.type}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group ${
                    selectedType === template.type
                      ? "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600"
                      : ""
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-semibold ${selectedType === template.type ? "text-purple-700 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {template.type
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {template.subject}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1 ${selectedType === template.type ? "text-purple-500" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Pro Tip
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                  Use placeholders like{" "}
                  <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                    {"{{client_name}}"}
                  </code>{" "}
                  to personalize your emails.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedType ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col min-h-[700px]">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-t-xl">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Edit{" "}
                    {selectedType
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Version: {selectedTemplate?.version || 1}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? "Edit Mode" : "Preview"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-sm font-medium border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    {saving ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 flex-grow">
                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4 text-purple-500" />
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all font-medium"
                    placeholder="Enter email subject line"
                  />
                </div>

                {/* Body Editor or Preview */}
                {!showPreview ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Email Body
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500 self-center mr-2">
                          Quick Insert:
                        </span>
                        {selectedTemplate?.placeholders?.map((p) => (
                          <button
                            key={p}
                            onClick={() => insertPlaceholder(p)}
                            className="px-2 py-1 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1"
                          >
                            {p === "client_name" ? (
                              <User className="w-3 h-3" />
                            ) : p === "session_date" ? (
                              <Calendar className="w-3 h-3" />
                            ) : (
                              <Code className="w-3 h-3" />
                            )}
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <RichTextEditor
                      content={formData.body}
                      onChange={(val) =>
                        setFormData({ ...formData, body: val })
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Live Preview (Desktop)
                    </label>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 p-8 flex justify-center">
                      {/* Email Mockup */}
                      <div className="w-full max-w-[600px] bg-white dark:bg-white rounded-lg shadow-xl overflow-hidden text-gray-800">
                        {/* Mock Header */}
                        <div className="bg-gradient-to-br from-[#7c2d6f] via-[#9b3d8a] to-[#6f1d56] p-10 text-center">
                          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
                            Vanquish Therapies
                          </h1>
                        </div>
                        {/* Mock Subject */}
                        <div className="px-10 pt-8 pb-4 border-b border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">
                            Subject
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {formData.subject}
                          </p>
                        </div>
                        {/* Mock Content */}
                        <div className="p-10 min-h-[300px]">
                          <div
                            className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formData.body
                                .replace(
                                  /{{client_name}}/g,
                                  "<strong>John Doe</strong>",
                                )
                                .replace(
                                  /{{email}}/g,
                                  "<strong>john@example.com</strong>",
                                )
                                .replace(
                                  /{{tc_name}}/g,
                                  "<strong>Dr. Sarah Smith</strong>",
                                )
                                .replace(
                                  /{{session_date}}/g,
                                  "<strong>Monday, 15th Jan</strong>",
                                ),
                            }}
                          />
                          <p className="mt-8 text-gray-500">
                            Warm regards,
                            <br />
                            <strong className="text-[#6f1d56]">
                              The Vanquish Therapies Team
                            </strong>
                          </p>
                        </div>
                        {/* Mock Footer */}
                        <div className="bg-gray-50 p-8 text-center border-t border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                            Automated Notification
                          </p>
                          <p className="text-xs text-gray-400">
                            © {new Date().getFullYear()} Vanquish Therapies. All
                            rights reserved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex items-center justify-center p-12 text-center">
              <div>
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Choose an email template from the list on the left to start
                  editing its content and subject line.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
