"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  User,
  Shield,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Check,
  Sparkles,
  ExternalLink,
  FileCheck,
} from "lucide-react";
import apiService from "@/lib/api";
import PublicFormWrapper from "@/components/PublicFormWrapper";

function QualifiedCounsellorFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formContentRef = useRef(null);
  const tcId = searchParams.get("tc_id") || searchParams.get("id") || searchParams.get("uuid");

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [formData, setFormData] = useState({
    // Contact & Identity
    email: "",
    phone: "",
    legalFirstName: "",
    legalLastName: "",
    registeredAddress: "",
    registeredCity: "",
    registeredPostcode: "",
    hasSupervisor: "",

    // Experience & Practice
    previousVanquishWork: "",
    areasToImprove: "",
    uniqueTrait: "",
    counsellorTrainingDetails: "",
    qualifiedToWorkWith: [],
    challengingCases: "",

    // Documents
    qualificationDocument: null,
    dbsCertificateQualified: null,
    insuranceQualified: null,
    selfEmploymentProof: null,
    professionalMembership: null,

    // Terms & Signature
    termsAccepted: false,
    signature: "",
    signatureDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCounsellor, setSubmittedCounsellor] = useState(null);

  const isUpgradeMode = Boolean(tcId);
  const qualifiedToWorkWithOptions = ["Individuals", "Couples", "Families"];

  const steps = [
    { number: 1, title: "Personal Details", shortTitle: "Personal", icon: User },
    { number: 2, title: "Practice & Experience", shortTitle: "Practice", icon: GraduationCap },
    { number: 3, title: "Documents", shortTitle: "Documents", icon: Upload },
    { number: 4, title: "Review & Sign", shortTitle: "Review", icon: FileText },
  ];

  // If tcId is provided in URL, prefill existing counsellor info
  useEffect(() => {
    if (!tcId) return;

    const fetchAndPrefillData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getTrainingCounsellorDetails(tcId);

        if (data) {
          const nameParts = (data.name || "").trim().split(" ");
          const fallbackFirst = nameParts[0] || "";
          const fallbackLast = nameParts.slice(1).join(" ") || "";

          setFormData((prev) => ({
            ...prev,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            legalFirstName: data.legal_first_name || fallbackFirst || prev.legalFirstName,
            legalLastName: data.legal_last_name || fallbackLast || prev.legalLastName,
            registeredAddress: data.registered_address || data.address || prev.registeredAddress,
            registeredCity: data.registered_city || prev.registeredCity,
            registeredPostcode: data.registered_postcode || prev.registeredPostcode,
            hasSupervisor: data.has_supervisor || prev.hasSupervisor,
            previousVanquishWork: data.previous_vanquish_work || prev.previousVanquishWork,
            areasToImprove: data.areas_to_improve || prev.areasToImprove,
            uniqueTrait: data.unique_trait || prev.uniqueTrait,
            counsellorTrainingDetails: data.counsellor_training_details || data.qualifications || prev.counsellorTrainingDetails,
            qualifiedToWorkWith: Array.isArray(data.qualified_to_work_with)
              ? data.qualified_to_work_with
              : prev.qualifiedToWorkWith,
            challengingCases: data.challenging_cases || prev.challengingCases,
            signature: data.signature || (data.name ? data.name : prev.signature),
            signatureDate: data.signature_date
              ? new Date(data.signature_date).toISOString().split("T")[0]
              : prev.signatureDate,
          }));
        }
      } catch (error) {
        console.warn("Could not prefill counsellor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndPrefillData();
  }, [tcId]);

  // Scroll to top of form content when step changes
  useEffect(() => {
    if (formContentRef.current) {
      formContentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentStep]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleGroupToggle = (option) => {
    setFormData((prev) => {
      const current = prev.qualifiedToWorkWith || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, qualifiedToWorkWith: updated };
    });

    if (errors.qualifiedToWorkWith) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.qualifiedToWorkWith;
        return newErrors;
      });
    }
  };

  const handleFileUpload = (field, files) => {
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [field]: files[0] }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const validateStep = (stepNumber) => {
    const stepErrors = {};

    switch (stepNumber) {
      case 1:
        if (!formData.legalFirstName.trim())
          stepErrors.legalFirstName = "Legal first name is required";
        if (!formData.legalLastName.trim())
          stepErrors.legalLastName = "Legal last name is required";
        if (!formData.email.trim()) {
          stepErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
          stepErrors.email = "Please enter a valid email address";
        }
        if (!formData.registeredAddress.trim())
          stepErrors.registeredAddress = "Registered address is required";
        if (!formData.registeredCity.trim())
          stepErrors.registeredCity = "City / Town is required";
        if (!formData.registeredPostcode.trim())
          stepErrors.registeredPostcode = "Postal code is required";
        if (!formData.hasSupervisor)
          stepErrors.hasSupervisor = "Please select your supervision status";
        break;

      case 2:
        if (!formData.counsellorTrainingDetails.trim())
          stepErrors.counsellorTrainingDetails = "Please specify your counselling qualifications & modalities";
        if (formData.qualifiedToWorkWith.length === 0)
          stepErrors.qualifiedToWorkWith = "Please select at least one client group";
        if (!formData.uniqueTrait.trim())
          stepErrors.uniqueTrait = "Please describe the unique traits or specialisms you offer";
        if (!formData.areasToImprove.trim())
          stepErrors.areasToImprove = "Please outline areas for professional development";
        if (!formData.challengingCases.trim())
          stepErrors.challengingCases = "Please specify cases you find challenging or prefer not to take";
        break;

      case 3:
        if (!formData.qualificationDocument)
          stepErrors.qualificationDocument = "Qualification document certificate is required";
        if (!formData.dbsCertificateQualified)
          stepErrors.dbsCertificateQualified = "Enhanced DBS certificate is required";
        if (!formData.insuranceQualified)
          stepErrors.insuranceQualified = "Professional indemnity insurance document is required";
        if (!formData.selfEmploymentProof)
          stepErrors.selfEmploymentProof = "Proof of self-employment or HMRC registration is required";
        if (!formData.professionalMembership)
          stepErrors.professionalMembership = "Proof of professional body membership is required";
        break;

      case 4:
        if (!formData.termsAccepted)
          stepErrors.termsAccepted = "You must confirm that the declaration is accurate";
        if (!formData.signature.trim())
          stepErrors.signature = "Please enter your full legal name as your signature";
        if (!formData.signatureDate)
          stepErrors.signatureDate = "Signature date is required";
        break;

      default:
        break;
    }

    return stepErrors;
  };

  const handleStepChange = (newStep) => {
    if (newStep < currentStep) {
      setCurrentStep(newStep);
      setErrors({});
      return;
    }

    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setTimeout(() => {
        const firstErrorField = Object.keys(stepErrors)[0];
        const errorElement =
          document.querySelector(`[name="${firstErrorField}"]`) ||
          document.querySelector(`#${firstErrorField}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          if (errorElement.focus) errorElement.focus();
        } else if (formContentRef.current) {
          formContentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return;
    }

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setErrors({});
    setCurrentStep(newStep);
  };

  const handleNext = () => handleStepChange(currentStep + 1);
  const handlePrevious = () => handleStepChange(currentStep - 1);

  const uploadFile = async (file, fieldName) => {
    if (!file) return null;
    if (typeof file === "string") return file;

    const formDataToUpload = new FormData();
    formDataToUpload.append("file", file);
    formDataToUpload.append("field", fieldName);
    if (tcId) {
      formDataToUpload.append("tc_id", tcId);
    }

    try {
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 50 }));
      const response = await apiService.request("/qualified-counsellor/upload-document", {
        method: "POST",
        body: formDataToUpload,
      });
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 100 }));
      return response.file_path || response.data?.file_path;
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 0 }));
      throw error;
    }
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(4);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upload verification documents
      const [
        qualificationDoc,
        dbsDoc,
        insuranceDoc,
        selfEmploymentDoc,
        membershipDoc,
      ] = await Promise.all([
        uploadFile(formData.qualificationDocument, "qualification"),
        uploadFile(formData.dbsCertificateQualified, "dbs"),
        uploadFile(formData.insuranceQualified, "insurance"),
        uploadFile(formData.selfEmploymentProof, "self_employment"),
        uploadFile(formData.professionalMembership, "membership"),
      ]);

      // 2. Submit payload
      const submitData = {
        tc_id: tcId || null,
        email: formData.email,
        phone: formData.phone,
        legal_first_name: formData.legalFirstName,
        legal_last_name: formData.legalLastName,
        registered_address: formData.registeredAddress,
        registered_city: formData.registeredCity,
        registered_postcode: formData.registeredPostcode,
        has_supervisor: formData.hasSupervisor,
        previous_vanquish_work: formData.previousVanquishWork,
        areas_to_improve: formData.areasToImprove,
        unique_trait: formData.uniqueTrait,
        counsellor_training_details: formData.counsellorTrainingDetails,
        qualified_to_work_with: formData.qualifiedToWorkWith,
        challenging_cases: formData.challengingCases,
        qualification_document: qualificationDoc,
        dbs_certificate_qualified: dbsDoc,
        insurance_qualified: insuranceDoc,
        self_employment_proof: selfEmploymentDoc,
        professional_membership: membershipDoc,
        signature: formData.signature,
        signature_date: formData.signatureDate,
      };

      const response = await apiService.request("/qualified-counsellor/submit", {
        method: "POST",
        body: JSON.stringify(submitData),
      });

      setSubmittedCounsellor(response?.tc || null);
      setSubmitted(true);
      toast.success("Qualified Counsellor application submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      const msg = error?.data?.message || error?.message || "Failed to submit application. Please check all fields and try again.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submitted) {
    return (
      <PublicFormWrapper>
        <div className="min-h-screen py-12 px-4" style={{ background: "var(--bg-secondary)" }}>
          <div className="flex items-center justify-center min-h-[75vh]">
            <div className="card rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                style={{ backgroundColor: "var(--success-bg)", border: "2px solid var(--success-border)" }}
              >
                <CheckCircle className="w-12 h-12" style={{ color: "var(--success-primary)" }} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#6f1d56] border border-purple-200 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Qualified Application Received
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                Application Submitted!
              </h2>

              <p className="mb-6 text-sm md:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Thank you for applying to join Vanquish Therapies as a Qualified Counsellor.
                Your profile information and credentials have been securely recorded.
              </p>

              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs uppercase font-medium text-gray-500">Applicant</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {formData.legalFirstName} {formData.legalLastName}
                  </span>
                </div>
                {submittedCounsellor?.tc_id && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs uppercase font-medium text-gray-500">Reference ID</span>
                    <span className="font-mono font-bold text-[#6f1d56]">
                      {submittedCounsellor.tc_id}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-medium text-gray-500">Clinical Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3" /> Credentials Under Verification
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-left text-xs sm:text-sm text-amber-900 mb-8">
                <p className="font-bold mb-1">What Happens Next?</p>
                <p>
                  Our clinical team will verify your qualification diploma, indemnity insurance, and DBS certificate.
                  You will receive an email confirmation once verified.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6f1d56] text-white rounded-lg hover:bg-[#5a1746] font-medium transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Home
                </Link>
                <Link
                  href="/counsellor-login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Counsellor Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PublicFormWrapper>
    );
  }

  // Loading Indicator
  if (isLoading) {
    return (
      <PublicFormWrapper>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#6f1d56] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading form details...</p>
          </div>
        </div>
      </PublicFormWrapper>
    );
  }

  return (
    <PublicFormWrapper>
      <div className="min-h-screen py-4 md:py-8 px-4" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-4xl mx-auto">
          {/* Header Card with Branding and Stepper */}
          <div className="card rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-sm"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  VT
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Vanquish Therapies
                  </h1>
                  <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {isUpgradeMode
                      ? "Qualified Counsellor Transition Form"
                      : "Qualified Counsellor Registration & Compliance"}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#6f1d56] border border-purple-200">
                  <Shield className="w-3.5 h-3.5" />
                  {isUpgradeMode ? "Upgrade Profile" : "Professional Application"}
                </span>
              </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#6f1d56" }}>
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {steps[currentStep - 1].title}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: "#6f1d56",
                    width: `${(currentStep / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Desktop Progress Stepper */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.has(step.number);
                  const isCurrent = currentStep === step.number;
                  const isAccessible = isCompleted || step.number <= currentStep;

                  return (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center flex-1">
                        <button
                          type="button"
                          onClick={() => handleStepChange(step.number)}
                          disabled={!isAccessible}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? "text-white ring-2 ring-offset-2 ring-[#6f1d56]"
                              : isCompleted
                              ? "text-white bg-green-600 hover:bg-green-700 shadow-sm"
                              : isAccessible
                              ? "text-white hover:opacity-90 cursor-pointer"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          style={
                            isCurrent || (isAccessible && !isCompleted)
                              ? { backgroundColor: "#6f1d56" }
                              : {}
                          }
                          title={isAccessible ? `Go to ${step.title}` : "Complete previous steps"}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <step.icon className="w-5 h-5" />
                          )}
                        </button>
                        <span
                          className={`text-xs mt-2 text-center ${
                            isCurrent || isCompleted ? "font-semibold" : "text-gray-500"
                          }`}
                          style={isCurrent || isCompleted ? { color: "#6f1d56" } : {}}
                        >
                          {step.shortTitle}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-1 flex-1 mx-2 rounded transition-all ${
                            currentStep > step.number ? "" : "bg-gray-200"
                          }`}
                          style={
                            currentStep > step.number
                              ? { backgroundColor: "#6f1d56" }
                              : {}
                          }
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content Card */}
          <div
            ref={formContentRef}
            className="card rounded-2xl shadow-sm p-4 md:p-8 border bg-white"
          >
            {/* ── STEP 1: Personal & Contact Information ── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Personal & Contact Information
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Please ensure your full legal name matches your photographic ID and professional registration.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* First Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Legal First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="legalFirstName"
                      id="legalFirstName"
                      value={formData.legalFirstName}
                      onChange={(e) => handleInputChange("legalFirstName", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.legalFirstName ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Sarah"
                    />
                    {errors.legalFirstName && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.legalFirstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Legal Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="legalLastName"
                      id="legalLastName"
                      value={formData.legalLastName}
                      onChange={(e) => handleInputChange("legalLastName", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.legalLastName ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Jenkins"
                    />
                    {errors.legalLastName && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.legalLastName}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                          errors.email ? "border-red-500 bg-red-50/20" : "border-gray-300"
                        }`}
                        placeholder="sarah.jenkins@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all"
                        placeholder="07123 456789"
                      />
                    </div>
                  </div>

                  {/* Registered Address */}
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Registered Practice or Residential Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registeredAddress"
                      id="registeredAddress"
                      value={formData.registeredAddress}
                      onChange={(e) => handleInputChange("registeredAddress", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.registeredAddress ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="Street address or consulting room"
                    />
                    {errors.registeredAddress && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.registeredAddress}</p>
                    )}
                  </div>

                  {/* City / Town */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registeredCity"
                      id="registeredCity"
                      value={formData.registeredCity}
                      onChange={(e) => handleInputChange("registeredCity", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.registeredCity ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Manchester"
                    />
                    {errors.registeredCity && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.registeredCity}</p>
                    )}
                  </div>

                  {/* Postcode */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registeredPostcode"
                      id="registeredPostcode"
                      value={formData.registeredPostcode}
                      onChange={(e) => handleInputChange("registeredPostcode", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.registeredPostcode ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. M1 4BT"
                    />
                    {errors.registeredPostcode && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.registeredPostcode}</p>
                    )}
                  </div>

                  {/* Clinical Supervision */}
                  <div className="md:col-span-2 pt-2">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Are you currently receiving regular Clinical Supervision? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                      {["Yes", "No"].map((option) => (
                        <label
                          key={option}
                          className={`flex items-center justify-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                            formData.hasSupervisor === option
                              ? "border-[#6f1d56] bg-purple-50/40 text-[#6f1d56] font-semibold ring-1 ring-[#6f1d56]"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name="hasSupervisor"
                            value={option}
                            checked={formData.hasSupervisor === option}
                            onChange={(e) => handleInputChange("hasSupervisor", e.target.value)}
                            className="text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.hasSupervisor && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.hasSupervisor}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Professional Practice & Experience ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Practice, Modalities & Specialisms
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Detail your counselling background, therapeutic modalities, and client group qualifications.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Previous Work */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Have you previously worked or completed hours with Vanquish Therapies? (Optional)
                    </label>
                    <textarea
                      name="previousVanquishWork"
                      id="previousVanquishWork"
                      value={formData.previousVanquishWork}
                      onChange={(e) => handleInputChange("previousVanquishWork", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all"
                      placeholder="e.g. Completed trainee placement hours with Vanquish between 2024-2025..."
                    />
                  </div>

                  {/* Qualifications & Modalities */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Counselling Qualifications & Core Therapeutic Modalities <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="counsellorTrainingDetails"
                      id="counsellorTrainingDetails"
                      value={formData.counsellorTrainingDetails}
                      onChange={(e) => handleInputChange("counsellorTrainingDetails", e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.counsellorTrainingDetails ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Level 4 Diploma in Therapeutic Counselling (Integrative: Person-Centred & CBT) from University of Leeds..."
                    />
                    {errors.counsellorTrainingDetails && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.counsellorTrainingDetails}</p>
                    )}
                  </div>

                  {/* Qualified To Work With */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Client Groups Qualified to Work With <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {qualifiedToWorkWithOptions.map((option) => {
                        const isSelected = formData.qualifiedToWorkWith.includes(option);
                        return (
                          <div
                            key={option}
                            onClick={() => handleGroupToggle(option)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-[#6f1d56] bg-purple-50/40 text-[#6f1d56] ring-1 ring-[#6f1d56]"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                          >
                            <span className="font-semibold text-sm">{option}</span>
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                isSelected ? "bg-[#6f1d56] border-[#6f1d56] text-white" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.qualifiedToWorkWith && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.qualifiedToWorkWith}</p>
                    )}
                  </div>

                  {/* Unique Traits */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      What unique traits, specialisms, or perspectives do you bring as a practitioner? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="uniqueTrait"
                      id="uniqueTrait"
                      value={formData.uniqueTrait}
                      onChange={(e) => handleInputChange("uniqueTrait", e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.uniqueTrait ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Extensive experience with neurodivergence, grief & bereavement, trauma-informed approaches..."
                    />
                    {errors.uniqueTrait && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.uniqueTrait}</p>
                    )}
                  </div>

                  {/* Areas to Develop */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Areas of practice or CPD you are currently developing <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="areasToImprove"
                      id="areasToImprove"
                      value={formData.areasToImprove}
                      onChange={(e) => handleInputChange("areasToImprove", e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.areasToImprove ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Currently undertaking training in EMDR, working towards BACP accreditation..."
                    />
                    {errors.areasToImprove && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.areasToImprove}</p>
                    )}
                  </div>

                  {/* Challenging Cases */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Client presentations or clinical complexities you find challenging or prefer not to take <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="challengingCases"
                      id="challengingCases"
                      value={formData.challengingCases}
                      onChange={(e) => handleInputChange("challengingCases", e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.challengingCases ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Severe active addictions, active psychosis, clients under 18..."
                    />
                    {errors.challengingCases && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.challengingCases}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Verification & Compliance Documents ── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Compliance & Credential Documents
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Please upload valid credentials. Supported files: PDF, DOC, DOCX, JPG, PNG (maximum 10MB per file).
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "qualificationDocument",
                      label: "Counselling Qualification Diploma / Degree",
                      desc: "Official copy of your qualifying diploma or postgraduate degree certificate",
                    },
                    {
                      name: "dbsCertificateQualified",
                      label: "Enhanced DBS Certificate",
                      desc: "Enhanced Disclosure certificate issued within the last 3 years or update service",
                    },
                    {
                      name: "insuranceQualified",
                      label: "Professional Indemnity & Public Liability Insurance",
                      desc: "Current policy certificate covering independent qualified practice",
                    },
                    {
                      name: "selfEmploymentProof",
                      label: "Proof of Self-Employment / HMRC Registration",
                      desc: "HMRC tax correspondence, UTR confirmation, or accountant letter",
                    },
                    {
                      name: "professionalMembership",
                      label: "Professional Body Membership Certificate",
                      desc: "Current certificate of registered/accredited membership (BACP, NCPS, UKCP, etc.)",
                    },
                  ].map((doc) => {
                    const fileObj = formData[doc.name];
                    const hasFile = Boolean(fileObj);
                    const progress = uploadProgress[doc.name];
                    const error = errors[doc.name];

                    return (
                      <div
                        key={doc.name}
                        className={`p-5 rounded-xl border transition-all ${
                          error
                            ? "border-red-300 bg-red-50/10"
                            : hasFile
                            ? "border-emerald-300 bg-emerald-50/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              {doc.label} <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">{doc.desc}</p>
                          </div>

                          {hasFile && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Document Selected
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            name={doc.name}
                            id={doc.name}
                            onChange={(e) => handleFileUpload(doc.name, e.target.files)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="text-xs sm:text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-[#6f1d56] hover:file:bg-purple-100 cursor-pointer"
                          />
                        </div>

                        {fileObj && typeof fileObj === "object" && fileObj.name && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <FileCheck className="w-4 h-4 text-[#6f1d56]" />
                            <span className="font-medium truncate">{fileObj.name}</span>
                            <span className="text-gray-400">({(fileObj.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </div>
                        )}

                        {progress !== undefined && progress > 0 && progress < 100 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2.5">
                            <div
                              className="bg-[#6f1d56] h-1.5 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        )}

                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Declaration ── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Review Application & Declaration
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Please review your details, sign the electronic declaration, and submit your registration.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identity Summary */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2 text-xs sm:text-sm">
                    <p className="font-bold text-gray-800 text-sm border-b pb-1.5 flex items-center justify-between">
                      <span>Personal Details</span>
                      <button
                        type="button"
                        onClick={() => handleStepChange(1)}
                        className="text-[#6f1d56] font-semibold text-xs hover:underline"
                      >
                        Edit
                      </button>
                    </p>
                    <p><span className="text-gray-500">Name:</span> <strong>{formData.legalFirstName} {formData.legalLastName}</strong></p>
                    <p><span className="text-gray-500">Email:</span> {formData.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {formData.phone || "Not provided"}</p>
                    <p><span className="text-gray-500">Address:</span> {formData.registeredAddress}, {formData.registeredCity}, {formData.registeredPostcode}</p>
                    <p><span className="text-gray-500">In Supervision:</span> <strong>{formData.hasSupervisor}</strong></p>
                  </div>

                  {/* Practice Summary */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2 text-xs sm:text-sm">
                    <p className="font-bold text-gray-800 text-sm border-b pb-1.5 flex items-center justify-between">
                      <span>Practice & Groups</span>
                      <button
                        type="button"
                        onClick={() => handleStepChange(2)}
                        className="text-[#6f1d56] font-semibold text-xs hover:underline"
                      >
                        Edit
                      </button>
                    </p>
                    <p><span className="text-gray-500">Client Groups:</span> <strong>{formData.qualifiedToWorkWith.join(", ") || "None"}</strong></p>
                    <p className="truncate"><span className="text-gray-500">Modalities:</span> {formData.counsellorTrainingDetails}</p>
                    <p className="truncate"><span className="text-gray-500">Specialisms:</span> {formData.uniqueTrait}</p>
                  </div>
                </div>

                {/* Documents Checklist */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 text-xs sm:text-sm space-y-2">
                  <p className="font-bold text-gray-800 text-sm border-b pb-1.5 flex items-center justify-between">
                    <span>Uploaded Documents</span>
                    <button
                      type="button"
                      onClick={() => handleStepChange(3)}
                      className="text-[#6f1d56] font-semibold text-xs hover:underline"
                    >
                      Edit
                    </button>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { label: "Qualification Certificate", ok: Boolean(formData.qualificationDocument) },
                      { label: "Enhanced DBS Certificate", ok: Boolean(formData.dbsCertificateQualified) },
                      { label: "Indemnity Insurance", ok: Boolean(formData.insuranceQualified) },
                      { label: "Self-Employment Proof", ok: Boolean(formData.selfEmploymentProof) },
                      { label: "Professional Membership", ok: Boolean(formData.professionalMembership) },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {item.ok ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className={item.ok ? "text-gray-800" : "text-red-600 font-medium"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Declaration & Terms Checkbox */}
                <div className="bg-purple-50/40 border border-purple-200 rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#6f1d56]" />
                    Professional Declaration
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    I confirm that all statements provided in this application are accurate, truthful, and representative of my qualifications. I certify that I am qualified to practise in the UK, maintain active clinical supervision, and have valid professional indemnity cover.
                  </p>

                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                      className="mt-0.5 rounded text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4"
                    />
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                      I agree to the declaration and certify that all details and documents submitted are accurate. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-red-500 text-xs">{errors.termsAccepted}</p>
                  )}
                </div>

                {/* Electronic Signature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Electronic Signature (Full Legal Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="signature"
                      id="signature"
                      value={formData.signature}
                      onChange={(e) => handleInputChange("signature", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg font-serif italic focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.signature ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder="e.g. Sarah Elizabeth Jenkins"
                    />
                    {errors.signature && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.signature}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="signatureDate"
                      id="signatureDate"
                      value={formData.signatureDate}
                      onChange={(e) => handleInputChange("signatureDate", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.signatureDate ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                    />
                    {errors.signatureDate && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.signatureDate}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error Banner */}
            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-900 whitespace-pre-line">
                    {submitError}
                  </p>
                </div>
              </div>
            )}

            {/* Error Summary Banner */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Please complete all required fields before proceeding:
                    </p>
                    <ul className="text-xs sm:text-sm text-red-800 list-disc list-inside space-y-0.5">
                      {Object.values(errors).slice(0, 4).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons (Identical to /counsellor) */}
            <div className="flex items-center justify-between mt-8 md:mt-10 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-colors ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Previous</span>
                <span className="md:hidden">Back</span>
              </button>

              <div className="text-xs text-gray-500 font-medium md:hidden">
                {currentStep} / {steps.length}
              </div>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 text-white rounded-lg font-semibold text-sm md:text-base hover:opacity-95 transition-opacity shadow-sm"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.termsAccepted || isSubmitting}
                  className={`flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 text-white rounded-lg font-semibold text-sm md:text-base transition-all shadow-sm ${
                    !formData.termsAccepted || isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-95"
                  }`}
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicFormWrapper>
  );
}

export default function QualifiedCounsellorForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#6f1d56] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <QualifiedCounsellorFormContent />
    </Suspense>
  );
}
