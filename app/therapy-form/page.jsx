"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import apiService from "@/lib/api";

const DEFAULT_JOTFORM_URL = "https://form.jotform.com/241002800146035";

export default function TherapyFormPage() {
  const [jotformUrl, setJotformUrl] = useState(DEFAULT_JOTFORM_URL);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await apiService.getCompanySettings();
        if (settings?.jotform_therapy_form_url && settings.jotform_therapy_form_url.trim()) {
          setJotformUrl(settings.jotform_therapy_form_url.trim());
        }
      } catch (err) {
        // Fallback to default form
        console.warn("Using default therapy form URL:", err);
      } finally {
        setSettingsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <PublicFormWrapper>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
        {/* Header Navigation */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 group transition-transform active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-[#6f1d56] flex items-center justify-center text-white shadow-md shadow-[#6f1d56]/20 font-bold text-lg">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white leading-none">
                  Vanquish Therapies
                </span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  Practitioner Onboarding
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-700"
                title="Copy shareable link for your therapist"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={jotformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#6f1d56] hover:bg-[#852367] rounded-lg shadow-sm shadow-[#6f1d56]/20 transition-all active:scale-95"
              >
                <span>Open in JotForm</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6f1d56] via-[#852367] to-[#421033] text-white p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-200" />
                <span>Clinical Compliance Requirement</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Confirmation of Personal Therapy
              </h1>
              <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed">
                As part of your trainee placement onboarding with Vanquish Therapies,
                your qualified Personal Counsellor/Therapist is required to complete this
                verification form confirming your ongoing personal therapy hours.
              </p>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Guidance and Related Downloads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Instruction Card */}
            <div className="md:col-span-2 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-[#6f1d56] dark:text-pink-400 font-bold text-sm">
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>Instructions for Trainee &amp; Therapist</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                You can have your therapist complete the embedded form below directly on
                this page, or share the link with them using the{" "}
                <strong className="text-gray-900 dark:text-white">Copy Link</strong>{" "}
                button above. Once submitted, records are automatically logged for clinical compliance.
              </p>
            </div>

            {/* 4-Way Agreement Quick Download */}
            <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>4-Way Agreement (.docx)</span>
                </div>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-normal">
                  Need to download your placement agreement template?
                </p>
              </div>

              <a
                href="/templates/4-way-agreement-trainee.docx"
                download="4-way-agreement-trainee.docx"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-200/80 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 rounded-lg transition-colors w-full"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Download Agreement</span>
              </a>
            </div>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-900/75 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Official Personal Therapy Verification Form
              </span>
              <button
                onClick={() => {
                  setIframeLoading(true);
                  const iframe = document.getElementById("jotform-therapy-iframe");
                  if (iframe) iframe.src = jotformUrl;
                }}
                className="inline-flex items-center gap-1 hover:text-[#6f1d56] transition-colors"
                title="Reload Form"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="relative min-h-[850px] w-full bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 z-10 space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#6f1d56] animate-spin" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Loading Therapy Confirmation Form...
                  </p>
                </div>
              )}

              <iframe
                id="jotform-therapy-iframe"
                title="Confirmation of Personal Therapy"
                src={jotformUrl}
                onLoad={() => setIframeLoading(false)}
                className="w-full h-[900px] border-0"
                allow="geolocation; microphone; camera"
              />
            </div>
          </div>

          {/* Assistance & Notice */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
            <p>
              Having trouble viewing or submitting the form above?{" "}
              <a
                href={jotformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#6f1d56] dark:text-pink-400 underline hover:opacity-80"
              >
                Click here to open directly on JotForm
              </a>
              .
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              For onboarding queries, contact our Compliance Team at{" "}
              <a
                href="mailto:compliance@vanquishtherapies.co.uk"
                className="underline hover:text-gray-600 dark:hover:text-gray-300"
              >
                compliance@vanquishtherapies.co.uk
              </a>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Vanquish Therapies Ltd. All rights reserved.</p>
        </footer>
      </div>
    </PublicFormWrapper>
  );
}
