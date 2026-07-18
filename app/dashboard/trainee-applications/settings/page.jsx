"use client";
import React, { useState, useEffect } from "react";
import { Save, AlertTriangle, ArrowLeft, RotateCcw, HelpCircle, Video, Key, Lock, Eye, EyeOff, Layout, ExternalLink, Star, Link2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";
import apiService from "@/lib/api";
import { useModal } from "@/contexts/ModalContext";

export default function TraineeAssessmentSettings() {
  const [zoomLink, setZoomLink] = useState("");
  const [inductionDate, setInductionDate] = useState("");
  const [interviewLink, setInterviewLink] = useState("");
  const [zoomSdkKey, setZoomSdkKey] = useState("");
  const [zoomSdkSecret, setZoomSdkSecret] = useState("");
  const [zoomMode, setZoomMode] = useState("embedded");
  const [showSdkSecret, setShowSdkSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { confirm } = useModal();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiService.getTraineeSettings();
      setZoomLink(data.default_zoom_link || "");
      setInductionDate(data.next_induction_date || "");
      setInterviewLink(data.placement_interview_link || "");
      setZoomSdkKey(data.zoom_sdk_key || "");
      setZoomSdkSecret(data.zoom_sdk_secret || "");
      setZoomMode(data.zoom_mode || "embedded");
    } catch (err) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);


  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateTraineeSettings({
        default_zoom_link: zoomLink,
        next_induction_date: inductionDate,
        zoom_mode: zoomMode,
        zoom_sdk_key: zoomSdkKey,
        zoom_sdk_secret: zoomSdkSecret
      });
      toast.success("Settings saved!");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    const ok = await confirm({
      title: "Reset Settings",
      message: "Are you sure you want to reset settings to default? This will clear the Zoom link field.",
      confirmText: "Reset",
      type: "warning"
    });
    if (ok) {
      setZoomLink("");
      setInductionDate("");
    }
  };

  return (
    <PageGuard menuId="trainee-applications">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            actions={
              <div className="flex items-center gap-3">
                <button
                  onClick={resetToDefault}
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 rounded-lg transition-all font-medium text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-bold shadow-lg text-sm ${saving ? 'opacity-70 animate-pulse' : ''}`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            }
          >
            <div className="flex items-center gap-3">
              <Link href="/dashboard/trainee-applications" className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Trainee Application Settings</h1>
                <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Configure interview defaults and Zoom integration</p>
              </div>
            </div>
          </DashboardHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-8 flex gap-4 items-start shadow-sm transition-all hover:shadow-md">
        <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-900 mb-1">How it works</h3>
          <p className="text-blue-800 text-sm leading-relaxed opacity-90 text-justify">
            The <strong>Default Zoom Link</strong> is used for manual and automated interview bookings if no other link is provided.
            The <strong>Next Induction Date</strong> is shared with candidates in their portal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Stage 3 Zoom Meeting</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Default link for face-to-face interviews</p>
          <input 
            type="url"
            value={zoomLink}
            onChange={(e) => setZoomLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Next Induction Cohort</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Displayed to successful applicants</p>
          <input 
            type="text"
            value={inductionDate}
            onChange={(e) => setInductionDate(e.target.value)}
            placeholder="e.g. Monday, 19th January, 10:00am"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Key className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Zoom Meeting SDK Integration</h3>
            <p className="text-xs text-gray-500">Required for embedding live video interviews directly on the website</p>
          </div>
        </div>

        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Layout className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Interview Interface Mode</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setZoomMode("embedded")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${zoomMode === 'embedded' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
            >
              <div className="font-bold text-sm mb-1 flex items-center gap-2">
                <Video className={`w-4 h-4 ${zoomMode === 'embedded' ? 'text-purple-600' : 'text-gray-400'}`} />
                Secure Virtual Room
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">Fully embedded inside the dashboard. Most professional experience.</p>
            </button>
            <button 
              onClick={() => setZoomMode("web_client")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${zoomMode === 'web_client' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
            >
              <div className="font-bold text-sm mb-1 flex items-center gap-2">
                <ExternalLink className={`w-4 h-4 ${zoomMode === 'web_client' ? 'text-blue-600' : 'text-gray-400'}`} />
                Web Client (Tab)
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">Opens Zoom in a new browser tab. No SDK setup required for basic use.</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SDK Key / Client ID</label>
            <div className="relative">
              <input 
                type="text"
                value={zoomSdkKey}
                onChange={(e) => setZoomSdkKey(e.target.value)}
                placeholder="Paste your Zoom SDK Key here..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
              <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SDK Secret / Client Secret</label>
            <div className="relative">
              <input 
                type={showSdkSecret ? "text" : "password"}
                value={zoomSdkSecret}
                onChange={(e) => setZoomSdkSecret(e.target.value)}
                placeholder="Paste your Zoom SDK Secret here..."
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button 
                type="button"
                onClick={() => setShowSdkSecret(!showSdkSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                title={showSdkSecret ? "Hide Secret" : "Show Secret"}
              >
                {showSdkSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">
            These credentials are used to securely sign requests for embedded meetings. 
            You can find these in your <strong>Zoom App Marketplace</strong> under "Develop" &rarr; "Build App" &rarr; "Meeting SDK".
          </p>
        </div>
      </div>


          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
