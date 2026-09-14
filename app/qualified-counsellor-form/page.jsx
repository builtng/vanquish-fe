"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Save,
  Check,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import apiService from "@/lib/api";

function QualifiedCounsellorFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tcId = searchParams.get("tc_id") || searchParams.get("id") || searchParams.get("uuid");

  const [formData, setFormData] = useState({
    // Contact Information
    email: "",
    phone: "",

    // Personal Information
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

    // Signature
    signature: "",
    signatureDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCounsellor, setSubmittedCounsellor] = useState(null);

  const isUpgradeMode = Boolean(tcId);
  const qualifiedToWorkWithOptions = ["Individuals", "Couples", "Families"];

  // If tcId is provided in URL, fetch existing profile to prefill
  useEffect(() => {
    if (!tcId) return;

    const fetchAndPrefillData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getTrainingCounsellorDetails(tcId);

        if (data) {
          // Parse name if legal names are missing
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

            // Experience
            previousVanquishWork: data.previous_vanquish_work || prev.previousVanquishWork,
            areasToImprove: data.areas_to_improve || prev.areasToImprove,
            uniqueTrait: data.unique_trait || prev.uniqueTrait,
            counsellorTrainingDetails: data.counsellor_training_details || data.qualifications || prev.counsellorTrainingDetails,
            qualifiedToWorkWith: Array.isArray(data.qualified_to_work_with)
              ? data.qualified_to_work_with
              : prev.qualifiedToWorkWith,
            challengingCases: data.challenging_cases || prev.challengingCases,

            // Signature
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else if (name === "qualifiedToWorkWith") {
      const checked = e.target.checked;
      setFormData((prev) => {
        const current = prev.qualifiedToWorkWith || [];
        if (checked) {
          return {
            ...prev,
            qualifiedToWorkWith: [...current, value],
          };
        } else {
          return {
            ...prev,
            qualifiedToWorkWith: current.filter((item) => item !== value),
          };
        }
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // For new onboarding, email is mandatory
    if (!isUpgradeMode || !formData.email) {
      if (!formData.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Personal Information
    if (!formData.legalFirstName.trim())
      newErrors.legalFirstName = "Legal first name is required";
    if (!formData.legalLastName.trim())
      newErrors.legalLastName = "Legal last name is required";
    if (!formData.registeredAddress.trim())
      newErrors.registeredAddress = "Registered address is required";
    if (!formData.registeredCity.trim())
      newErrors.registeredCity = "City / Town is required";
    if (!formData.registeredPostcode.trim())
      newErrors.registeredPostcode = "Postal code is required";
    if (!formData.hasSupervisor)
      newErrors.hasSupervisor = "Please indicate if you are in clinical supervision";

    // Experience
    if (!formData.areasToImprove.trim())
      newErrors.areasToImprove = "Please outline areas for professional development";
    if (!formData.uniqueTrait.trim())
      newErrors.uniqueTrait = "Please describe the unique traits or specialisms you offer";
    if (!formData.counsellorTrainingDetails.trim())
      newErrors.counsellorTrainingDetails = "Please provide details of your counselling qualifications and training";
    if (formData.qualifiedToWorkWith.length === 0)
      newErrors.qualifiedToWorkWith = "Please select at least one client group you are qualified to work with";
    if (!formData.challengingCases.trim())
      newErrors.challengingCases = "Please specify any cases you find challenging or prefer not to take";

    // Documents (required if not already uploaded)
    if (!formData.qualificationDocument)
      newErrors.qualificationDocument = "Qualification document certificate is required";
    if (!formData.dbsCertificateQualified)
      newErrors.dbsCertificateQualified = "Recent DBS certificate is required";
    if (!formData.insuranceQualified)
      newErrors.insuranceQualified = "Proof of professional indemnity insurance is required";
    if (!formData.selfEmploymentProof)
      newErrors.selfEmploymentProof = "Proof of self-employment or HMRC registration is required";
    if (!formData.professionalMembership)
      newErrors.professionalMembership = "Proof of professional membership (e.g. BACP, NCPS) is required";

    // Signature
    if (!formData.signature.trim())
      newErrors.signature = "Please enter your full legal name as your electronic signature";
    if (!formData.signatureDate)
      newErrors.signatureDate = "Signature date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file, fieldName) => {
    if (!file) return null;
    if (typeof file === "string") return file; // Already uploaded path

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete all required fields and upload the necessary documents.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload compliance and verification documents
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

      // 2. Submit form payload
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
      setIsSubmitted(true);
      toast.success("Qualified Counsellor application submitted successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg = error?.data?.message || error?.message || "Error submitting form. Please check all fields and try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation View
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#6f1d56] border border-purple-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Registration Received
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Application Submitted!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
            Thank you for completing the Qualified Counsellor application for Vanquish Therapies.
            Your professional details and documents have been received.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
            <div className="flex justify-between items-center text-gray-600 border-b pb-2">
              <span className="text-xs uppercase font-medium text-gray-500">Applicant</span>
              <span className="font-semibold text-gray-800">
                {formData.legalFirstName} {formData.legalLastName}
              </span>
            </div>
            {submittedCounsellor?.tc_id && (
              <div className="flex justify-between items-center text-gray-600 border-b pb-2">
                <span className="text-xs uppercase font-medium text-gray-500">Counsellor Reference</span>
                <span className="font-mono font-bold text-[#6f1d56]">
                  {submittedCounsellor.tc_id}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-gray-600">
              <span className="text-xs uppercase font-medium text-gray-500">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                <Check className="w-3 h-3" /> Under Review
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-left text-xs sm:text-sm text-amber-800 mb-8">
            <p className="font-semibold mb-1">Next Steps:</p>
            <p>
              Our clinical governance team will review your qualifications, DBS certificate, and insurance.
              You will receive email notification once your profile is approved.
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
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6f1d56] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading form details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#6f1d56] border border-purple-200 mb-3">
                <Shield className="w-3.5 h-3.5" />
                {isUpgradeMode ? "Counsellor Transition" : "Professional Application"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {isUpgradeMode ? "Transition to Qualified Counsellor" : "Qualified Counsellor Application"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
                {isUpgradeMode
                  ? "Please review and complete the form below to finalize your transition to Qualified Counsellor status."
                  : "Join the Vanquish Therapies network. Please complete your registration details and provide required compliance documents."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Contact & Personal Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5 border-b pb-3">
              <User className="w-5 h-5 text-[#6f1d56]" />
              Personal & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Legal First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Legal First Name (as on ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="legalFirstName"
                  value={formData.legalFirstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.legalFirstName ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="e.g. Sarah"
                />
                {errors.legalFirstName && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.legalFirstName}</p>
                )}
              </div>

              {/* Full Legal Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Legal Last Name (as on ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="legalLastName"
                  value={formData.legalLastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all"
                    placeholder="07123 456789"
                  />
                </div>
              </div>

              {/* Registered Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Registered Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.registeredAddress ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="Street address or practice address"
                />
                {errors.registeredAddress && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.registeredAddress}</p>
                )}
              </div>

              {/* Town / City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City / Town <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registeredCity"
                  value={formData.registeredCity}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registeredPostcode"
                  value={formData.registeredPostcode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.registeredPostcode ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="e.g. M1 4BT"
                />
                {errors.registeredPostcode && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.registeredPostcode}</p>
                )}
              </div>

              {/* Supervisor Status */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you currently in Clinical Supervision? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {["Yes", "No"].map((option) => (
                    <label key={option} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSupervisor"
                        value={option}
                        checked={formData.hasSupervisor === option}
                        onChange={handleInputChange}
                        className="text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4"
                      />
                      <span className="text-sm text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.hasSupervisor && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.hasSupervisor}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Experience & Qualifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5 border-b pb-3">
              <GraduationCap className="w-5 h-5 text-[#6f1d56]" />
              Experience & Professional Practice
            </h2>

            <div className="space-y-6">
              {/* Previous Work with Vanquish */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Have you previously worked with or provided services for Vanquish Therapies? (Optional)
                </label>
                <textarea
                  name="previousVanquishWork"
                  value={formData.previousVanquishWork}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all"
                  placeholder="e.g. Completed 100 trainee placement hours between Jan-Oct 2025..."
                />
              </div>

              {/* Training & Qualifications Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Counselling Qualifications & Core Modalities <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="counsellorTrainingDetails"
                  value={formData.counsellorTrainingDetails}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.counsellorTrainingDetails ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="Detail your diploma/degree, awarding institution, and primary therapeutic modalities (e.g. CBT, Person-Centred, Psychodynamic)..."
                />
                {errors.counsellorTrainingDetails && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.counsellorTrainingDetails}</p>
                )}
              </div>

              {/* Qualified To Work With */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Groups Qualified to Work With <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {qualifiedToWorkWithOptions.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                        formData.qualifiedToWorkWith.includes(option)
                          ? "border-[#6f1d56] bg-purple-50/40 text-[#6f1d56] font-medium"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="qualifiedToWorkWith"
                        value={option}
                        checked={formData.qualifiedToWorkWith.includes(option)}
                        onChange={handleInputChange}
                        className="rounded text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.qualifiedToWorkWith && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.qualifiedToWorkWith}</p>
                )}
              </div>

              {/* Unique Traits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What unique traits, specialisms, or perspectives do you bring as a counsellor? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="uniqueTrait"
                  value={formData.uniqueTrait}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.uniqueTrait ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="e.g. Specialism in trauma-informed practice, neurodiversity, grief, etc."
                />
                {errors.uniqueTrait && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.uniqueTrait}</p>
                )}
              </div>

              {/* Areas to Improve */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Are there any areas of practice or continuous professional development (CPD) you are actively developing? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="areasToImprove"
                  value={formData.areasToImprove}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.areasToImprove ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="e.g. Currently undertaking advanced training in ACT or EMDR..."
                />
                {errors.areasToImprove && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.areasToImprove}</p>
                )}
              </div>

              {/* Challenging Cases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Are there any client presentations you find particularly challenging or prefer not to work with at this time? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="challengingCases"
                  value={formData.challengingCases}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.challengingCases ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="e.g. Severe active addiction, active psychosis, eating disorders requiring specialist clinic care..."
                />
                {errors.challengingCases && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.challengingCases}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Verification & Compliance Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#6f1d56]" />
              Compliance & Credential Documents
            </h2>
            <p className="text-sm text-gray-600 mb-6 border-b pb-3">
              Please upload clear copies of all required credentials. Supported formats include PDF, DOC, DOCX, JPG, and PNG (up to 10MB each).
            </p>

            <div className="space-y-5">
              {[
                {
                  name: "qualificationDocument",
                  label: "Qualification Certificate",
                  desc: "Copy of your qualifying diploma or degree in counselling/psychotherapy",
                },
                {
                  name: "dbsCertificateQualified",
                  label: "Recent Enhanced DBS Certificate",
                  desc: "Enhanced Disclosure & Barring Service check issued within the last 3 years",
                },
                {
                  name: "insuranceQualified",
                  label: "Professional Indemnity Insurance",
                  desc: "Valid indemnity certificate covering qualified counselling practice",
                },
                {
                  name: "selfEmploymentProof",
                  label: "Proof of Self-Employment / HMRC",
                  desc: "UTR confirmation, HMRC letter, or evidence of registered self-employment",
                },
                {
                  name: "professionalMembership",
                  label: "Professional Body Membership Certificate",
                  desc: "Current certificate from accredited body (e.g. BACP, NCPS, UKCP)",
                },
              ].map((doc) => {
                const hasFile = Boolean(formData[doc.name]);
                const progress = uploadProgress[doc.name];
                const error = errors[doc.name];

                return (
                  <div
                    key={doc.name}
                    className={`p-4 rounded-xl border transition-all ${
                      error ? "border-red-300 bg-red-50/10" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <label className="text-sm font-semibold text-gray-800">
                          {doc.label} <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500">{doc.desc}</p>
                      </div>

                      {hasFile && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        name={doc.name}
                        onChange={handleInputChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="text-xs sm:text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-[#6f1d56] hover:file:bg-purple-100 cursor-pointer"
                      />
                    </div>

                    {progress !== undefined && progress > 0 && progress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-[#6f1d56] h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}

                    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Disclaimer & Signature */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2.5 border-b pb-3">
              <Shield className="w-5 h-5 text-[#6f1d56]" />
              Declaration & Electronic Signature
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              I certify that all information submitted in this application is accurate and complete to the best of my knowledge. I understand that falsification of credentials or omission of material facts may result in rejection of application or termination of clinical affiliation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Electronic Signature (Type Full Legal Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signature"
                  value={formData.signature}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg font-serif italic text-base focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.signature ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                  placeholder="e.g. Sarah Elizabeth Jenkins"
                />
                {errors.signature && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.signature}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="signatureDate"
                  value={formData.signatureDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                    errors.signatureDate ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  }`}
                />
                {errors.signatureDate && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.signatureDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submission Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Please review all entries before submitting. You will receive an automated confirmation upon receipt.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 text-white rounded-lg font-semibold flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: "#6f1d56" }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
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
