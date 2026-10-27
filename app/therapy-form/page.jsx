"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  HeartHandshake,
  Loader2,
  Printer,
  Home,
  UserCheck,
  Award,
  Calendar,
} from "lucide-react";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import apiService from "@/lib/api";

function TherapyFormContent() {
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState("loading"); // "loading" | "valid" | "invalid"
  const [tokenErrorMessage, setTokenErrorMessage] = useState("");
  const [traineeFirstName, setTraineeFirstName] = useState("");

  const [formData, setFormData] = useState({
    trainee_name: "",
    trainee_email: "",
    therapist_name: "",
    therapist_email: "",
    therapist_phone: "",
    professional_body: "BACP",
    other_professional_body: "",
    membership_number: "",
    therapy_modality: "",
    therapy_frequency: "Weekly",
    start_date: "",
    confirmed: false,
    signature: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (!tokenParam || !tokenParam.trim()) {
      setTokenStatus("invalid");
      setTokenErrorMessage(
        "This link is no longer valid. Please contact help@vanquishtherapies.co.uk."
      );
      return;
    }

    const cleanToken = tokenParam.trim();
    setToken(cleanToken);
    setTokenStatus("loading");

    apiService
      .getTherapyFormData(cleanToken)
      .then((res) => {
        if (res && res.first_name) {
          setTraineeFirstName(res.first_name);
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          setTokenErrorMessage(
            "This link is no longer valid. Please contact help@vanquishtherapies.co.uk."
          );
        }
      })
      .catch((err) => {
        setTokenStatus("invalid");
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "This link is no longer valid. Please contact help@vanquishtherapies.co.uk.";
        setTokenErrorMessage(
          msg.includes("valid") || msg.includes("contact")
            ? msg
            : "This link is no longer valid. Please contact help@vanquishtherapies.co.uk."
        );
      });
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.therapist_name || !formData.therapist_name.trim()) {
      newErrors.therapist_name = "Therapist full name is required.";
    }

    if (!formData.therapist_email || !formData.therapist_email.trim()) {
      newErrors.therapist_email = "Therapist email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.therapist_email.trim())) {
      newErrors.therapist_email = "Please enter a valid email address.";
    }

    if (
      formData.professional_body === "Other" &&
      (!formData.other_professional_body || !formData.other_professional_body.trim())
    ) {
      newErrors.other_professional_body = "Please specify your professional body.";
    }

    if (!formData.membership_number || !formData.membership_number.trim()) {
      newErrors.membership_number = "Membership / registration number is required.";
    }

    if (!formData.confirmed) {
      newErrors.confirmed = "You must confirm the clinical therapy declaration.";
    }

    if (!formData.signature || !formData.signature.trim()) {
      newErrors.signature = "Please provide your typed digital signature.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        token: token,
        trainee_email: formData.trainee_email ? formData.trainee_email.trim() : undefined,
        therapist_name: formData.therapist_name.trim(),
        therapist_email: formData.therapist_email.trim(),
        therapist_phone: formData.therapist_phone.trim() || undefined,
        professional_body:
          formData.professional_body === "Other"
            ? formData.other_professional_body.trim()
            : formData.professional_body,
        membership_number: formData.membership_number.trim(),
        therapy_modality: formData.therapy_modality.trim() || undefined,
        therapy_frequency: formData.therapy_frequency || undefined,
        start_date: formData.start_date || undefined,
        confirmed: true,
        signature: formData.signature.trim(),
      };

      const result = await apiService.submitPersonalTherapyConfirmation(payload);
      if (result && result.success) {
        setSubmissionResult({
          ...payload,
          traineeFirstName,
          submittedAt: new Date().toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        setSubmitSuccess(true);
      } else {
        setErrors({
          submit:
            result?.message ||
            "This link is no longer valid. Please contact help@vanquishtherapies.co.uk.",
        });
      }
    } catch (err) {
      setErrors({
        submit:
          err?.response?.data?.message ||
          err?.message ||
          "This link is no longer valid. Please contact help@vanquishtherapies.co.uk.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicFormWrapper>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
        {/* Header Navigation */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
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
                  Practitioner Onboarding &amp; Compliance
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-700"
                title="Copy shareable link for therapist"
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
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
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
                As part of trainee counsellor placement onboarding with Vanquish Therapies,
                this verification is completed by the qualified personal therapist confirming
                ongoing personal therapy hours in compliance with clinical training standards.
              </p>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {tokenStatus === "loading" ? (
            /* Loading State */
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center space-y-4 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#6f1d56] animate-spin mx-auto" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Verifying personal therapy link...
              </p>
            </div>
          ) : tokenStatus === "invalid" ? (
            /* Invalid / Expired Token State */
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 sm:p-10 text-center space-y-4 shadow-sm animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Verification Link Invalid
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 max-w-md mx-auto leading-relaxed">
                {tokenErrorMessage ||
                  "This link is no longer valid. Please contact help@vanquishtherapies.co.uk."}
              </p>
              <div className="pt-2">
                <a
                  href="mailto:help@vanquishtherapies.co.uk"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6f1d56] text-white text-xs font-bold hover:bg-[#852367] transition-colors shadow-md shadow-[#6f1d56]/20"
                >
                  Contact Help
                </a>
              </div>
            </div>
          ) : submitSuccess ? (
            /* Success State Screen */
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-gray-900 shadow-xl p-8 sm:p-10 space-y-6 animate-fadeIn">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Personal Therapy Confirmed
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
                  Thank you. Personal therapy confirmation for{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {traineeFirstName || "the trainee"}
                  </span>{" "}
                  has been successfully recorded and verified in the Vanquish Therapies
                  compliance system.
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-2">
                  Submission Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Trainee:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {traineeFirstName || "Trainee Counsellor"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Therapist Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{submissionResult?.therapist_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Professional Body:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {submissionResult?.professional_body} (No: {submissionResult?.membership_number})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Digital Signature:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{submissionResult?.signature}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Confirmed At:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{submissionResult?.submittedAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Confirmation</span>
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold transition-colors shadow-sm"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Verification Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Submission Error</p>
                    <p>{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Section 1: Trainee Details (Verified via token) */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#6f1d56] dark:text-pink-400 font-bold text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
                  <UserCheck className="w-4 h-4" />
                  <span>1. Trainee Counsellor Details</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs space-y-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Confirming personal therapy for:{" "}
                    <span className="font-bold text-[#6f1d56] dark:text-pink-400 text-sm">
                      {traineeFirstName || "Trainee"}
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Verified through your unique, single-use placement onboarding security token.
                  </p>
                </div>
              </div>

              {/* Section 2: Qualified Therapist Details */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#6f1d56] dark:text-pink-400 font-bold text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
                  <Award className="w-4 h-4" />
                  <span>2. Qualified Personal Therapist Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Therapist Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.therapist_name}
                      onChange={(e) => handleInputChange("therapist_name", e.target.value)}
                      placeholder="e.g. Dr. Sarah Jenkins"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        errors.therapist_name
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]`}
                    />
                    {errors.therapist_name && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.therapist_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Therapist Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.therapist_email}
                      onChange={(e) => handleInputChange("therapist_email", e.target.value)}
                      placeholder="e.g. sarah.jenkins@therapy.co.uk"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        errors.therapist_email
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]`}
                    />
                    {errors.therapist_email && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.therapist_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Therapist Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.therapist_phone}
                      onChange={(e) => handleInputChange("therapist_phone", e.target.value)}
                      placeholder="e.g. 07123 456789"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Professional Body / Accrediting Organisation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.professional_body}
                      onChange={(e) => handleInputChange("professional_body", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]"
                    >
                      <option value="BACP">BACP (British Association for Counselling and Psychotherapy)</option>
                      <option value="UKCP">UKCP (UK Council for Psychotherapy)</option>
                      <option value="NCPS">NCPS (National Counselling &amp; Psychotherapy Society)</option>
                      <option value="BPS">BPS (British Psychological Society)</option>
                      <option value="HCPC">HCPC (Health and Care Professions Council)</option>
                      <option value="Other">Other / International Body</option>
                    </select>
                  </div>

                  {formData.professional_body === "Other" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Specify Professional Body <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.other_professional_body}
                        onChange={(e) => handleInputChange("other_professional_body", e.target.value)}
                        placeholder="e.g. Irish Association for Counselling and Psychotherapy"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                          errors.other_professional_body
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300 dark:border-gray-700"
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]`}
                      />
                      {errors.other_professional_body && (
                        <p className="mt-1 text-[11px] text-red-500">{errors.other_professional_body}</p>
                      )}
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Professional Membership / Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.membership_number}
                      onChange={(e) => handleInputChange("membership_number", e.target.value)}
                      placeholder="e.g. 123456 / Reg 7890"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                        errors.membership_number
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]`}
                    />
                    {errors.membership_number && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.membership_number}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Therapy Arrangement */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#6f1d56] dark:text-pink-400 font-bold text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
                  <Calendar className="w-4 h-4" />
                  <span>3. Therapy Arrangement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Therapy Modality
                    </label>
                    <input
                      type="text"
                      value={formData.therapy_modality}
                      onChange={(e) => handleInputChange("therapy_modality", e.target.value)}
                      placeholder="e.g. Integrative / Psychodynamic"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Session Frequency
                    </label>
                    <select
                      value={formData.therapy_frequency}
                      onChange={(e) => handleInputChange("therapy_frequency", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Fortnightly">Fortnightly</option>
                      <option value="Twice Weekly">Twice Weekly</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Date Commenced
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange("start_date", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Clinical Declaration & Digital Signature */}
              <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-pink-50/40 via-white to-purple-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20 p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-[#6f1d56] dark:text-pink-400 font-bold text-sm border-b border-purple-100 dark:border-gray-800 pb-3">
                  <HeartHandshake className="w-4 h-4" />
                  <span>4. Clinical Declaration &amp; Sign-off</span>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.confirmed}
                      onChange={(e) => handleInputChange("confirmed", e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#6f1d56] rounded border-gray-300 focus:ring-[#6f1d56]"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      I confirm that the trainee counsellor named above is currently engaged in
                      personal therapy with me, and that I hold appropriate professional registration/accreditation
                      and clinical insurance as required by clinical training standards. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.confirmed && (
                    <p className="text-[11px] text-red-500 pl-7">{errors.confirmed}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-purple-100 dark:border-gray-800">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Therapist Typed Digital Signature <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.signature}
                        onChange={(e) => handleInputChange("signature", e.target.value)}
                        placeholder="Type your full legal name"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                          errors.signature
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300 dark:border-gray-700"
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#6f1d56]`}
                      />
                      {errors.signature && (
                        <p className="mt-1 text-[11px] text-red-500">{errors.signature}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Date of Declaration
                      </label>
                      <input
                        type="text"
                        disabled
                        value={new Date().toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#6f1d56] hover:bg-[#852367] text-white font-bold text-sm shadow-lg shadow-[#6f1d56]/25 hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Verification...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Personal Therapy Confirmation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Assistance Notice */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              This is an official verification form for Vanquish Therapies clinical trainee compliance.
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              For onboarding queries, please contact our Compliance Team at{" "}
              <a
                href="mailto:compliance@vanquishtherapies.co.uk"
                className="underline hover:text-gray-700 dark:hover:text-gray-300"
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

export default function TherapyFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#6f1d56] animate-spin" />
            <p className="text-xs font-semibold text-gray-500">Loading Confirmation Form...</p>
          </div>
        </div>
      }
    >
      <TherapyFormContent />
    </Suspense>
  );
}
