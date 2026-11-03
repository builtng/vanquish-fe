"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Printer,
  Home,
} from "lucide-react";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import apiService from "@/lib/api";

/*
 * Every label, heading and answer option below is copied word for word from the
 * JotForm "Confirmation of Personal Therapy" (JotForm form ID 241002800146035).
 * The answer options must stay identical to the THERAPY_FORM_* constants in the
 * backend TraineeApplicationController, which validates them.
 */
const FORM_TITLE = "Confirmation of Personal Therapy";

const FORM_INTRO =
  "Please send this form to your Personal Counsellor/Psychotherapist for completion and signature. This form needs to be submitted before your induction. Regrettably, failure to comply will result in the inability to assign clients to you and/or your placement offer may be withdrawn.";

const SESSIONS_DURING_COURSE_OPTIONS = ["Yes", "No"];

const HOURS_COMPLETED_OPTIONS = [
  "Yes",
  "On-going",
  "Sessions with me have concluded; to my knowledge the trainee counsellor may continue their personal therapy with another therapist.",
];

const SUITABILITY_OPTIONS = [
  "No, to the best of my knowledge, I have no concerns regarding the Trainee Counsellor’s ability to work safely, ethically, and appropriately with clients on placement.",
  "Yes, I have concerns (please provide details below)",
];

const CONCERNS_OPTION = SUITABILITY_OPTIONS[1];

const DISCLAIMER_OPTIONS = [
  "I confirm the Trainee Counsellor on placement, as named above, is attending ongoing counselling/psychotherapy sessions with me, I will notify Vanquish Therapies should the sessions terminate prematurely.",
  "I confirm the Trainee Counsellor has completed all mandatory personal therapy hours required as part of their training course since the commencement date mentioned above.",
  "I confirm that my work with the Trainee Counsellor has concluded. To my knowledge, the Trainee Counsellor may continue to fulfil their personal therapy requirements with an alternative therapist.",
];

const INVALID_LINK_MESSAGE =
  "This link is no longer valid. Please contact help@vanquishtherapies.co.uk.";

const REQUIRED_MESSAGE = "This field is required.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border ${
    hasError ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 dark:border-gray-700"
  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]`;

// <input type="date"> gives YYYY-MM-DD; the JotForm records DD-MM-YYYY.
const toJotformDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

function Required() {
  return <span className="text-red-500"> *</span>;
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5"
    >
      {children}
      <Required />
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function SectionHeading({ children }) {
  return (
    <h2 className="text-base font-bold text-[#6f1d56] dark:text-pink-400 border-b border-gray-100 dark:border-gray-800 pb-3">
      {children}
    </h2>
  );
}

function RadioGroup({ name, label, options, value, onChange, error }) {
  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {label}
        <Required />
      </legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="mt-1 w-4 h-4 shrink-0 text-[#6f1d56] border-gray-300 focus:ring-[#6f1d56]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {option}
            </span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

function TherapyFormContent() {
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  // "loading" | "valid" | "open" | "invalid"
  // "open" = the plain /therapy-form link with no token. The trainee's email is then
  // also asked for, so the submission can be matched to their application.
  const [tokenStatus, setTokenStatus] = useState("loading");
  const [tokenErrorMessage, setTokenErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    trainee_name: "",
    trainee_email: "",
    therapist_name: "",
    practice_name_website: "",
    therapist_email: "",
    therapist_phone: "",
    professional_membership: "",
    qualifications_modality: "",
    first_session_date: "",
    sessions_to_date: "",
    sessions_during_course: "",
    therapy_hours_completed: "",
    suitability_concerns: "",
    concerns_details: "",
    disclaimer: "",
    signature: "",
    signing_date: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (!tokenParam || !tokenParam.trim()) {
      setToken("");
      setTokenStatus("open");
      return;
    }

    const cleanToken = tokenParam.trim();
    setToken(cleanToken);
    setTokenStatus("loading");

    apiService
      .getTherapyFormData(cleanToken)
      .then((res) => {
        if (res && res.first_name) {
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          setTokenErrorMessage(INVALID_LINK_MESSAGE);
        }
      })
      .catch((err) => {
        setTokenStatus("invalid");
        const msg = err?.response?.data?.message || err?.message || INVALID_LINK_MESSAGE;
        setTokenErrorMessage(
          msg.includes("valid") || msg.includes("contact") ? msg : INVALID_LINK_MESSAGE
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
    const requiredFields = [
      "trainee_name",
      "therapist_name",
      "practice_name_website",
      "therapist_email",
      "therapist_phone",
      "professional_membership",
      "qualifications_modality",
      "first_session_date",
      "sessions_to_date",
      "sessions_during_course",
      "therapy_hours_completed",
      "suitability_concerns",
      "disclaimer",
      "signature",
      "signing_date",
    ];

    if (tokenStatus === "open") requiredFields.push("trainee_email");
    if (formData.suitability_concerns === CONCERNS_OPTION) requiredFields.push("concerns_details");

    requiredFields.forEach((field) => {
      if (!formData[field] || !String(formData[field]).trim()) {
        newErrors[field] = REQUIRED_MESSAGE;
      }
    });

    const emailFields = tokenStatus === "open" ? ["therapist_email", "trainee_email"] : ["therapist_email"];
    emailFields.forEach((field) => {
      if (!newErrors[field] && !EMAIL_PATTERN.test(formData[field].trim())) {
        newErrors[field] = "Please enter a valid email address.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        token: token || undefined,
        trainee_name: formData.trainee_name.trim(),
        trainee_email: tokenStatus === "open" ? formData.trainee_email.trim() : undefined,
        therapist_name: formData.therapist_name.trim(),
        practice_name_website: formData.practice_name_website.trim(),
        therapist_email: formData.therapist_email.trim(),
        therapist_phone: formData.therapist_phone.trim(),
        professional_membership: formData.professional_membership.trim(),
        qualifications_modality: formData.qualifications_modality.trim(),
        first_session_date: toJotformDate(formData.first_session_date),
        sessions_to_date: formData.sessions_to_date.trim(),
        sessions_during_course: formData.sessions_during_course,
        therapy_hours_completed: formData.therapy_hours_completed,
        suitability_concerns: formData.suitability_concerns,
        concerns_details:
          formData.suitability_concerns === CONCERNS_OPTION
            ? formData.concerns_details.trim()
            : undefined,
        disclaimer: formData.disclaimer,
        signature: formData.signature.trim(),
        signing_date: toJotformDate(formData.signing_date),
      };

      const result = await apiService.submitPersonalTherapyConfirmation(payload);
      if (result && result.success) {
        setSubmissionResult(payload);
        setSubmitSuccess(true);
      } else {
        setErrors({ submit: result?.message || INVALID_LINK_MESSAGE });
      }
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors || {};
      const mappedErrors = {};
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        mappedErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
      });
      setErrors({
        ...mappedErrors,
        submit: err?.response?.data?.message || err?.message || INVALID_LINK_MESSAGE,
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
              <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white leading-none">
                Vanquish Therapies
              </span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-700"
              title="Copy link"
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
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
          {/* Title and introduction (JotForm wording) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6f1d56] via-[#852367] to-[#421033] text-white p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{FORM_TITLE}</h1>
              <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed">{FORM_INTRO}</p>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {tokenStatus === "loading" ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center space-y-4 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#6f1d56] animate-spin mx-auto" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          ) : tokenStatus === "invalid" ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 sm:p-10 text-center space-y-4 shadow-sm animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Verification Link Invalid
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 max-w-md mx-auto leading-relaxed">
                {tokenErrorMessage || INVALID_LINK_MESSAGE}
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
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-gray-900 shadow-xl p-8 sm:p-10 space-y-6 animate-fadeIn">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thank You!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
                  Your submission has been received.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 mb-0.5">
                      Trainee Counsellor's Full First &amp; Last Name
                    </dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">
                      {submissionResult?.trainee_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 mb-0.5">Name</dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">
                      {submissionResult?.therapist_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 mb-0.5">
                      Professional Membership Name and Number
                    </dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">
                      {submissionResult?.professional_membership}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 mb-0.5">Date of signing</dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">
                      {submissionResult?.signing_date}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
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
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {errors.submit && (
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{errors.submit}</p>
                </div>
              )}

              {/* Trainee */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-sm space-y-5">
                <div>
                  <FieldLabel htmlFor="trainee_name">
                    Trainee Counsellor's Full First &amp; Last Name (Aliases/Nick names will not be
                    accepted):
                  </FieldLabel>
                  <input
                    id="trainee_name"
                    type="text"
                    value={formData.trainee_name}
                    onChange={(e) => handleInputChange("trainee_name", e.target.value)}
                    className={inputClass(errors.trainee_name)}
                  />
                  <FieldError message={errors.trainee_name} />
                </div>

                {tokenStatus === "open" && (
                  <div>
                    {/* Not on the JotForm: needed to match this form to the trainee's application. */}
                    <FieldLabel htmlFor="trainee_email">
                      Trainee Counsellor's Email Address
                    </FieldLabel>
                    <input
                      id="trainee_email"
                      type="email"
                      value={formData.trainee_email}
                      onChange={(e) => handleInputChange("trainee_email", e.target.value)}
                      className={inputClass(errors.trainee_email)}
                    />
                    {errors.trainee_email ? (
                      <FieldError message={errors.trainee_email} />
                    ) : (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        The email address the trainee applied to Vanquish Therapies with.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Personal Counsellor's/Psychotherapist's Information */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-sm space-y-5">
                <SectionHeading>Personal Counsellor's/Psychotherapist's Information</SectionHeading>

                <div>
                  <FieldLabel htmlFor="therapist_name">Name</FieldLabel>
                  <input
                    id="therapist_name"
                    type="text"
                    value={formData.therapist_name}
                    onChange={(e) => handleInputChange("therapist_name", e.target.value)}
                    className={inputClass(errors.therapist_name)}
                  />
                  <FieldError message={errors.therapist_name} />
                </div>

                <div>
                  <FieldLabel htmlFor="practice_name_website">Practice Name &amp; Website</FieldLabel>
                  <input
                    id="practice_name_website"
                    type="text"
                    value={formData.practice_name_website}
                    onChange={(e) => handleInputChange("practice_name_website", e.target.value)}
                    className={inputClass(errors.practice_name_website)}
                  />
                  <FieldError message={errors.practice_name_website} />
                </div>

                {/* The JotForm has two fields both labelled "Email and Contact Number". */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel htmlFor="therapist_email">Email and Contact Number</FieldLabel>
                    <input
                      id="therapist_email"
                      type="email"
                      value={formData.therapist_email}
                      onChange={(e) => handleInputChange("therapist_email", e.target.value)}
                      className={inputClass(errors.therapist_email)}
                    />
                    <FieldError message={errors.therapist_email} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="therapist_phone">Email and Contact Number</FieldLabel>
                    <input
                      id="therapist_phone"
                      type="tel"
                      value={formData.therapist_phone}
                      onChange={(e) => handleInputChange("therapist_phone", e.target.value)}
                      className={inputClass(errors.therapist_phone)}
                    />
                    <FieldError message={errors.therapist_phone} />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="professional_membership">
                    Professional Membership Name and Number
                  </FieldLabel>
                  <input
                    id="professional_membership"
                    type="text"
                    value={formData.professional_membership}
                    onChange={(e) => handleInputChange("professional_membership", e.target.value)}
                    className={inputClass(errors.professional_membership)}
                  />
                  <FieldError message={errors.professional_membership} />
                </div>

                <div>
                  <FieldLabel htmlFor="qualifications_modality">
                    Highest Qualifications and Modality
                  </FieldLabel>
                  <input
                    id="qualifications_modality"
                    type="text"
                    value={formData.qualifications_modality}
                    onChange={(e) => handleInputChange("qualifications_modality", e.target.value)}
                    className={inputClass(errors.qualifications_modality)}
                  />
                  <FieldError message={errors.qualifications_modality} />
                </div>
              </div>

              {/* Sessions */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-sm space-y-6">
                <SectionHeading>Sessions</SectionHeading>

                <div className="sm:max-w-xs">
                  <FieldLabel htmlFor="first_session_date">Date of first session</FieldLabel>
                  <input
                    id="first_session_date"
                    type="date"
                    value={formData.first_session_date}
                    onChange={(e) => handleInputChange("first_session_date", e.target.value)}
                    className={inputClass(errors.first_session_date)}
                  />
                  <FieldError message={errors.first_session_date} />
                </div>

                <div>
                  <FieldLabel htmlFor="sessions_to_date">
                    Please mention how many personal therapy sessions has the Trainee Counsellor had
                    with you to date?
                  </FieldLabel>
                  <input
                    id="sessions_to_date"
                    type="text"
                    value={formData.sessions_to_date}
                    onChange={(e) => handleInputChange("sessions_to_date", e.target.value)}
                    className={inputClass(errors.sessions_to_date)}
                  />
                  <FieldError message={errors.sessions_to_date} />
                </div>

                <RadioGroup
                  name="sessions_during_course"
                  label="Have the sessions with you taken place during the time the Trainee Counsellor has been actively participating in their counselling course?"
                  options={SESSIONS_DURING_COURSE_OPTIONS}
                  value={formData.sessions_during_course}
                  onChange={(v) => handleInputChange("sessions_during_course", v)}
                  error={errors.sessions_during_course}
                />

                <RadioGroup
                  name="therapy_hours_completed"
                  label="Has the Trainee Counsellor completed all of their required personal therapy hours?"
                  options={HOURS_COMPLETED_OPTIONS}
                  value={formData.therapy_hours_completed}
                  onChange={(v) => handleInputChange("therapy_hours_completed", v)}
                  error={errors.therapy_hours_completed}
                />

                <RadioGroup
                  name="suitability_concerns"
                  label="Do you have any concerns regarding the Trainee Counsellor’s suitability to work with clients?"
                  options={SUITABILITY_OPTIONS}
                  value={formData.suitability_concerns}
                  onChange={(v) => handleInputChange("suitability_concerns", v)}
                  error={errors.suitability_concerns}
                />

                {formData.suitability_concerns === CONCERNS_OPTION && (
                  <div>
                    <FieldLabel htmlFor="concerns_details">
                      Please provide further information or specify any concerns:
                    </FieldLabel>
                    <textarea
                      id="concerns_details"
                      rows={5}
                      value={formData.concerns_details}
                      onChange={(e) => handleInputChange("concerns_details", e.target.value)}
                      className={inputClass(errors.concerns_details)}
                    />
                    <FieldError message={errors.concerns_details} />
                  </div>
                )}

                <RadioGroup
                  name="disclaimer"
                  label="Disclaimer"
                  options={DISCLAIMER_OPTIONS}
                  value={formData.disclaimer}
                  onChange={(v) => handleInputChange("disclaimer", v)}
                  error={errors.disclaimer}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <FieldLabel htmlFor="signature">
                      Counsellor's/Psychotherapist's Signature:
                    </FieldLabel>
                    <input
                      id="signature"
                      type="text"
                      value={formData.signature}
                      onChange={(e) => handleInputChange("signature", e.target.value)}
                      className={`${inputClass(errors.signature)} font-medium italic`}
                    />
                    <FieldError message={errors.signature} />
                  </div>

                  <div>
                    <FieldLabel htmlFor="signing_date">Date of signing</FieldLabel>
                    <input
                      id="signing_date"
                      type="date"
                      value={formData.signing_date}
                      onChange={(e) => handleInputChange("signing_date", e.target.value)}
                      className={inputClass(errors.signing_date)}
                    />
                    <FieldError message={errors.signing_date} />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#6f1d56] hover:bg-[#852367] text-white font-bold text-sm shadow-lg shadow-[#6f1d56]/25 hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>

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
          <Loader2 className="w-8 h-8 text-[#6f1d56] animate-spin" />
        </div>
      }
    >
      <TherapyFormContent />
    </Suspense>
  );
}
