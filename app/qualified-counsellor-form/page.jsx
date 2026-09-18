"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
  Mail,
  Phone,
  Calendar,
  Sparkles,
  FileCheck,
  Check,
  Trash2,
  PenTool,
  Type,
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import apiService from "@/lib/api";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import { useBranding } from "@/contexts/BrandingContext";
import SearchableSelect from "@/components/SearchableSelect";
import { THERAPY_TOPICS } from "@/lib/constants";

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Non-binary",
  "Transgender",
  "Prefer not to say",
  "Other (not listed above)",
];

const ETHNICITY_OPTIONS = [
  "Caucasian/White",
  "African/Caribbean/Black",
  "North African",
  "Hispanic/Latino",
  "South Asian",
  "Southeast Asian",
  "East Asian",
  "Central Asian",
  "West Asian (Middle Eastern)",
  "North Asian",
  "Mixed/Multiracial",
  "Prefer not to say",
  "Other (not listed above)",
];

const SEXUAL_ORIENTATION_OPTIONS = [
  "Heterosexual",
  "Gay",
  "Lesbian",
  "Bisexual",
  "Pansexual",
  "Asexual",
  "Queer",
  "Prefer not to say",
  "Other (not listed above)",
];

const BELIEFS_OPTIONS = [
  "Atheism",
  "Agnosticism",
  "Buddhism",
  "Christianity",
  "Hinduism",
  "Islam",
  "Judaism",
  "Sikhism",
  "Spiritual",
  "Taoism",
  "Prefer not to say",
  "Other (not listed above)",
];

const YES_NO_OPTIONS = [
  "Yes",
  "No",
];

const DBS_OPTIONS = [
  "Yes - Adult workforce (on Update Service)",
  "Yes - Both workforces (on Update Service)",
  "Yes - (not on Update Service)",
  "No",
];

const QUALIFIED_WORK_WITH_OPTIONS = [
  "Individuals",
  "Couples",
  "Families",
  "Children & Young people",
];

const MODALITY_OPTIONS = [
  "Integrative",
  "Person Centred",
  "Psychodynamic Therapy",
  "Integrative Therapy",
  "Gestalt Therapy",
  "Existential Therapy",
  "Acceptance and Commitment Therapy (ACT)",
  "Compassion-Focused Therapy (CFT)",
  "Systemic / Family Therapy",
  "Emotion-Focused Therapy (EFT)",
  "Trauma-Informed Therapy",
  "Mindfulness-Based Approaches",
  "Creative / Arts-Based Therapy",
  "Counselling & Coaching",
  "Pluralistic",
  "Psychoanalytic Therapy",
  "Humanistic Therapy",
  "Transactional Analysis (TA)",
  "Solution-Focused Brief Therapy (SFBT)",
  "Dialectical Behaviour Therapy (DBT)",
  "Schema Therapy",
  "Narrative Therapy",
  "Attachment-Based Therapy",
  "Eye Movement Desensitisation and Reprocessing (EMDR)",
  "Couples / Relationship Therapy",
  "Other (not listed above)",
];

const EXPERIENCE_AREAS_OPTIONS = [
  "Abuse (Physical, Emotional, Sexual)",
  "Addiction & Substance Misuse",
  "Anger Management",
  "Anxiety & Panic Attacks",
  "Bereavement & Grief",
  "Body Image Issues",
  "Childhood Trauma",
  "Depression",
  "Domestic Violence",
  "Eating Disorders",
  "Family Conflicts",
  "Gender Identity Issues",
  "Health Anxiety",
  "Infidelity",
  "LGBTQ+ Issues",
  "Low Self-Esteem",
  "OCD (Obsessive Compulsive Disorder)",
  "Parenting Issues",
  "Phobias",
  "PTSD (Post-Traumatic Stress Disorder)",
  "Racial & Cultural Identity",
  "Relationship Issues",
  "Self-Harm",
  "Sexual Abuse/Assault",
  "Social Anxiety",
  "Stress Management",
  "Suicidal Ideation",
  "Work-Related Stress",
  "Other (not listed above)",
];

const TIME_SLOTS = [
  { value: "10am-11am", label: "10:00 AM - 11:00 AM", category: "Morning" },
  { value: "11am-12pm", label: "11:00 AM - 12:00 PM", category: "Morning" },
  { value: "12pm-1pm", label: "12:00 PM - 1:00 PM", category: "Afternoon" },
  { value: "1pm-2pm", label: "1:00 PM - 2:00 PM", category: "Afternoon" },
  { value: "2pm-3pm", label: "2:00 PM - 3:00 PM", category: "Afternoon" },
  { value: "3pm-4pm", label: "3:00 PM - 4:00 PM", category: "Afternoon" },
  { value: "4pm-5pm", label: "4:00 PM - 5:00 PM", category: "Afternoon" },
  { value: "5pm-6pm", label: "5:00 PM - 6:00 PM", category: "Evening" },
  { value: "6pm-7pm", label: "6:00 PM - 7:00 PM", category: "Evening" },
];

const FRIDAY_TIME_SLOTS = [
  { value: "10am-11am", label: "10:00 AM - 11:00 AM", category: "Morning" },
  { value: "11am-12pm", label: "11:00 AM - 12:00 PM", category: "Morning" },
  { value: "12pm-1pm", label: "12:00 PM - 1:00 PM", category: "Afternoon" },
  { value: "1pm-2pm", label: "1:00 PM - 2:00 PM", category: "Afternoon" },
  { value: "2pm-3pm", label: "2:00 PM - 3:00 PM", category: "Afternoon" },
  { value: "3pm-4pm", label: "3:00 PM - 4:00 PM", category: "Afternoon" },
  { value: "4pm-5pm", label: "4:00 PM - 5:00 PM", category: "Afternoon" },
  { value: "5pm-6pm", label: "5:00 PM - 6:00 PM", category: "Evening" },
];

function QualifiedCounsellorFormContent() {
  const { branding, loading: brandingLoading } = useBranding();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formContentRef = useRef(null);
  const signaturePadRef = useRef(null);
  const tcId = searchParams.get("tc_id") || searchParams.get("id") || searchParams.get("uuid");

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [formData, setFormData] = useState({
    // Section 1: Personal Information
    legalFirstName: "",
    legalLastName: "",
    dateOfBirth: "",
    gender: "",
    ethnicity: "",
    email: "",
    phone: "",
    sexualOrientation: "",
    beliefs: "",
    registeredAddress: "",
    registeredCity: "",
    registeredPostcode: "",
    disabilities: "",
    medicalConditions: "",

    // Section 2: Professional Information & Experience
    hasIndemnityInsurance: "",
    professionalBodyDetails: "",
    hasSupervisor: "",
    dbsRegistered: "",
    familiarWithOnlineCounselling: "",
    previousVanquishWork: "",
    counsellorTrainingDetails: "",
    qualifiedToWorkWith: [],
    modalities: [],
    experienceAreas: [],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
    uniqueTrait: "",
    areasToImprove: "",
    challengingCases: "",

    // Section 3: Document Uploads
    qualificationDocument: null,
    dbsCertificateQualified: null,
    validIdDocument: null,
    professionalMembership: null,
    selfEmploymentProof: null,
    insuranceQualified: null,

    // Section 4: Review, Disclaimer & Signature
    termsAccepted: false,
    signature: "",
    signatureDate: new Date().toISOString().split("T")[0],
  });

  const [signatureMode, setSignatureMode] = useState("draw"); // "draw" | "type"
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCounsellor, setSubmittedCounsellor] = useState(null);

  const isUpgradeMode = Boolean(tcId);

  const steps = [
    { number: 1, title: "Personal Details", shortTitle: "Personal", icon: User },
    { number: 2, title: "Practice & Experience", shortTitle: "Practice", icon: GraduationCap },
    { number: 3, title: "Documents", shortTitle: "Documents", icon: Upload },
    { number: 4, title: "Review & Sign", shortTitle: "Review", icon: FileText },
  ];

  // Prefill if TC/QC uuid is provided in URL
  useEffect(() => {
    if (!tcId) return;

    const fetchAndPrefillData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getQualifiedCounsellorPrefill(tcId);

        if (data) {
          setFormData((prev) => ({
            ...prev,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            legalFirstName: data.legal_first_name || prev.legalFirstName,
            legalLastName: data.legal_last_name || prev.legalLastName,
            dateOfBirth: data.date_of_birth || prev.dateOfBirth,
            gender: data.gender || prev.gender,
            ethnicity: data.ethnicity || prev.ethnicity,
            sexualOrientation: data.sexual_orientation || prev.sexualOrientation,
            registeredAddress: data.registered_address || prev.registeredAddress,
            registeredCity: data.registered_city || prev.registeredCity,
            registeredPostcode: data.registered_postcode || prev.registeredPostcode,
            hasSupervisor: data.has_supervisor || prev.hasSupervisor,
            previousVanquishWork: data.previous_vanquish_work || prev.previousVanquishWork,
            areasToImprove: data.areas_to_improve || prev.areasToImprove,
            uniqueTrait: data.unique_trait || prev.uniqueTrait,
            counsellorTrainingDetails: data.counsellor_training_details || prev.counsellorTrainingDetails,
            qualifiedToWorkWith: Array.isArray(data.qualified_to_work_with)
              ? data.qualified_to_work_with
              : prev.qualifiedToWorkWith,
            availability: (typeof data.availability === "object" && data.availability !== null)
              ? {
                  monday: Array.isArray(data.availability.monday) ? data.availability.monday : [],
                  tuesday: Array.isArray(data.availability.tuesday) ? data.availability.tuesday : [],
                  wednesday: Array.isArray(data.availability.wednesday) ? data.availability.wednesday : [],
                  thursday: Array.isArray(data.availability.thursday) ? data.availability.thursday : [],
                  friday: Array.isArray(data.availability.friday) ? data.availability.friday : [],
                }
              : prev.availability,
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

  const handleAvailabilityToggle = (day, slot) => {
    setFormData((prev) => {
      const currentSlots = prev.availability?.[day] || [];
      const updatedSlots = currentSlots.includes(slot)
        ? currentSlots.filter((s) => s !== slot)
        : [...currentSlots, slot];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: updatedSlots,
        },
      };
    });

    if (errors.availability) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.availability;
        return newErrors;
      });
    }
  };

  const handleArrayToggle = (field, item) => {
    setFormData((prev) => {
      const currentList = prev[field] || [];
      const updatedList = currentList.includes(item)
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];
      return { ...prev, [field]: updatedList };
    });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
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

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setFormData((prev) => ({ ...prev, signature: "" }));
  };

  const validateStep = (stepNumber) => {
    const stepErrors = {};

    switch (stepNumber) {
      case 1:
        if (!formData.legalFirstName.trim())
          stepErrors.legalFirstName = "Legal first name is required";
        if (!formData.legalLastName.trim())
          stepErrors.legalLastName = "Legal last name is required";
        if (!formData.dateOfBirth)
          stepErrors.dateOfBirth = "Date of birth is required";
        if (!formData.gender || formData.gender === "Please Select")
          stepErrors.gender = "Please select your gender";
        if (!formData.ethnicity || formData.ethnicity === "Please Select")
          stepErrors.ethnicity = "Please select your ethnicity";
        if (!formData.email.trim()) {
          stepErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
          stepErrors.email = "Please enter a valid email address";
        }
        if (!formData.phone.trim())
          stepErrors.phone = "Contact number is required";
        if (!formData.sexualOrientation || formData.sexualOrientation === "Please Select")
          stepErrors.sexualOrientation = "Please select your sexual orientation";
        if (!formData.beliefs || formData.beliefs === "Please Select")
          stepErrors.beliefs = "Please select your beliefs";
        if (!formData.registeredAddress.trim())
          stepErrors.registeredAddress = "Registered address is required";
        if (!formData.registeredCity.trim())
          stepErrors.registeredCity = "City / Town is required";
        if (!formData.registeredPostcode.trim())
          stepErrors.registeredPostcode = "Postal code is required";
        if (!formData.disabilities.trim())
          stepErrors.disabilities = "Please specify if you have any disabilities/impairments (or state None)";
        if (!formData.medicalConditions.trim())
          stepErrors.medicalConditions = "Please specify if you have medical conditions (or state None)";
        break;

      case 2:
        if (!formData.hasIndemnityInsurance || formData.hasIndemnityInsurance === "Please Select")
          stepErrors.hasIndemnityInsurance = "Please select your Professional Indemnity Insurance status";
        if (!formData.professionalBodyDetails.trim())
          stepErrors.professionalBodyDetails = "Please provide your professional body membership details (or N/A)";
        if (!formData.hasSupervisor || formData.hasSupervisor === "Please Select")
          stepErrors.hasSupervisor = "Please select your clinical supervisor status";
        if (!formData.dbsRegistered || formData.dbsRegistered === "Please Select")
          stepErrors.dbsRegistered = "Please select your DBS status";
        if (!formData.familiarWithOnlineCounselling || formData.familiarWithOnlineCounselling === "Please Select")
          stepErrors.familiarWithOnlineCounselling = "Please select if you are familiar with online counselling";
        if (!formData.previousVanquishWork || formData.previousVanquishWork === "Please Select")
          stepErrors.previousVanquishWork = "Please select if you have previously worked or been on placement with Vanquish";
        if (!formData.counsellorTrainingDetails.trim())
          stepErrors.counsellorTrainingDetails = "Please provide details of counselling-related education, qualifications, and experience";
        if (formData.qualifiedToWorkWith.length === 0)
          stepErrors.qualifiedToWorkWith = "Please select at least one client group you are qualified to work with";
        if (formData.modalities.length === 0)
          stepErrors.modalities = "Please select at least one therapeutic modality or approach";
        if (formData.experienceAreas.length === 0)
          stepErrors.experienceAreas = "Please select all areas you have experience in and currently support clients with";
        const hasAvailability = Object.values(formData.availability || {}).some(
          (slots) => Array.isArray(slots) && slots.length > 0
        );
        if (!hasAvailability)
          stepErrors.availability = "Please select at least one available day and time slot";
        break;

      case 3:
        if (!formData.qualificationDocument)
          stepErrors.qualificationDocument = "Highest counselling qualification document is required";
        if (!formData.dbsCertificateQualified)
          stepErrors.dbsCertificateQualified = "Enhanced DBS certificate is required";
        if (!formData.validIdDocument)
          stepErrors.validIdDocument = "Valid ID (Passport or UK Driving License) is required";
        if (!formData.professionalMembership)
          stepErrors.professionalMembership = "Professional body membership certificate is required";
        if (!formData.selfEmploymentProof)
          stepErrors.selfEmploymentProof = "Proof of self-employment or HMRC registration is required";
        if (!formData.insuranceQualified)
          stepErrors.insuranceQualified = "Copy of Professional Indemnity Insurance is required";
        break;

      case 4:
        if (!formData.termsAccepted)
          stepErrors.termsAccepted = "You must confirm that the declaration is accurate";
        
        let validSignature = formData.signature;
        if (signatureMode === "draw" && signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
          validSignature = signaturePadRef.current.getCanvas().toDataURL("image/png");
        }
        if (!validSignature || !validSignature.trim()) {
          stepErrors.signature = "Please provide your signature before submitting";
        }
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
          document.querySelector(`[data-field="${firstErrorField}"]`) ||
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
    // Capture signature if drawn on canvas or typed
    let currentSignature = formData.signature;
    if (signatureMode === "draw" && signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      currentSignature = signaturePadRef.current.getCanvas().toDataURL("image/png");
      setFormData((prev) => ({ ...prev, signature: currentSignature }));
    }

    const stepErrors = validateStep(4);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const autoDate = new Date().toISOString().split("T")[0];

    try {
      // 1. Upload verification documents
      const [
        qualificationDoc,
        dbsDoc,
        validIdDoc,
        membershipDoc,
        selfEmploymentDoc,
        insuranceDoc,
      ] = await Promise.all([
        uploadFile(formData.qualificationDocument, "qualification"),
        uploadFile(formData.dbsCertificateQualified, "dbs"),
        uploadFile(formData.validIdDocument, "valid_id"),
        uploadFile(formData.professionalMembership, "membership"),
        uploadFile(formData.selfEmploymentProof, "self_employment"),
        uploadFile(formData.insuranceQualified, "insurance"),
      ]);

      const autoDate = new Date().toISOString().split("T")[0];

      // 2. Submit payload
      const submitData = {
        tc_id: tcId || null,
        email: formData.email,
        phone: formData.phone,
        legal_first_name: formData.legalFirstName,
        legal_last_name: formData.legalLastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        sexual_orientation: formData.sexualOrientation,
        beliefs: formData.beliefs,
        registered_address: formData.registeredAddress,
        registered_city: formData.registeredCity,
        registered_postcode: formData.registeredPostcode,
        disabilities: formData.disabilities,
        medical_conditions: formData.medicalConditions,
        has_indemnity_insurance: formData.hasIndemnityInsurance,
        professional_body_details: formData.professionalBodyDetails,
        has_supervisor: formData.hasSupervisor,
        dbs_status: formData.dbsRegistered,
        familiar_with_online_counselling: formData.familiarWithOnlineCounselling,
        previous_vanquish_work: formData.previousVanquishWork,
        counsellor_training_details: formData.counsellorTrainingDetails,
        qualified_to_work_with: formData.qualifiedToWorkWith,
        modalities: formData.modalities,
        experience_areas: formData.experienceAreas,
        availability: formData.availability,
        availability_schedule: JSON.stringify(formData.availability),
        areas_to_improve: formData.areasToImprove || "N/A",
        unique_trait: formData.uniqueTrait || "N/A",
        challenging_cases: formData.challengingCases || "N/A",
        qualification_document: qualificationDoc,
        dbs_certificate_qualified: dbsDoc,
        valid_id_document: validIdDoc,
        professional_membership: membershipDoc,
        self_employment_proof: selfEmploymentDoc,
        insurance_qualified: insuranceDoc,
        signature: currentSignature || formData.signature,
        signature_date: formData.signatureDate || autoDate,
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
      const msg =
        error?.data?.message ||
        error?.message ||
        "Failed to submit application. Please check all fields and try again.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen (Matching JotForm Thank You Page with Vanquish purple styling)
  if (submitted) {
    return (
      <PublicFormWrapper>
        <div className="min-h-screen py-10 px-4 flex items-center justify-center" style={{ backgroundColor: "#6f1d56" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-xl w-full text-center border border-purple-100 animate-fadeIn">
            {/* Logo */}
            <div className="flex flex-col items-center justify-center mb-8">
              {branding?.platform_logo_url ? (
                <img
                  src={apiService.getStorageUrl(branding.platform_logo_url)}
                  alt={branding.company_name || "Vanquish Therapies"}
                  className="max-h-16 md:max-h-20 w-auto object-contain mb-2"
                />
              ) : (
                <div className="flex flex-col items-center justify-center mb-2">
                  <div className="flex items-center justify-center">
                    <svg
                      className="h-14 md:h-16 w-auto"
                      viewBox="0 0 240 85"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* V in rich plum/burgundy */}
                      <path
                        d="M20 12 L50 78 L80 12 H64 L50 48 L36 12 Z"
                        fill="#6f1d56"
                      />
                      {/* Q in dark slate */}
                      <path
                        d="M85 36 C85 20 98 10 116 10 C134 10 147 20 147 36 C147 44 143 51 136 56 L146 72 H131 L123 60 C120.5 61 118 62 116 62 C98 62 85 52 85 36 Z M116 22 C104 22 98 28 98 36 C98 44 104 50 116 50 C128 50 134 44 134 36 C134 28 128 22 116 22 Z"
                        fill="#374151"
                      />
                      {/* T in dark slate */}
                      <path
                        d="M148 10 H192 V22 H177 V78 H163 V22 H148 Z"
                        fill="#374151"
                      />
                      {/* ® registered symbol */}
                      <circle
                        cx="200"
                        cy="16"
                        r="6"
                        stroke="#374151"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <text
                        x="200"
                        y="19"
                        fontSize="7"
                        textAnchor="middle"
                        fill="#374151"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        R
                      </text>
                    </svg>
                  </div>
                  <div className="text-xs md:text-sm font-bold tracking-widest uppercase mt-1">
                    <span className="font-extrabold text-[#6f1d56]">VANQUISH</span>{" "}
                    <span className="text-gray-700">THERAPIES</span>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#6f1d56" }}>
              Thank You!
            </h1>

            {/* Subtitles */}
            <div className="space-y-1 text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
              <p>Your submission has been received.</p>
              <p>We will be in touch soon.</p>
            </div>

            {/* Submission Info Box */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-left text-xs sm:text-sm space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                <span className="text-gray-500 font-medium">Applicant:</span>
                <span className="font-semibold text-gray-900">
                  {formData.legalFirstName} {formData.legalLastName}
                </span>
              </div>
              {submittedCounsellor?.tc_id && (
                <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                  <span className="text-gray-500 font-medium">Reference ID:</span>
                  <span className="font-mono font-bold text-[#6f1d56]">
                    {submittedCounsellor.tc_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> Received & Under Review
                </span>
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
          <div className="card rounded-2xl shadow-sm p-5 md:p-8 mb-4 md:mb-6 border bg-white">
            <div className="flex flex-col items-center justify-center text-center mb-6">
              {brandingLoading ? (
                <div className="flex flex-col items-center animate-pulse w-full mb-3">
                  <div className="h-16 w-48 bg-gray-200 rounded-lg mb-2"></div>
                </div>
              ) : branding?.platform_logo_url ? (
                <img
                  src={apiService.getStorageUrl(branding.platform_logo_url)}
                  alt={branding.company_name || "Vanquish Therapies"}
                  className="max-h-20 md:max-h-24 w-auto object-contain mb-3"
                />
              ) : (
                <div className="flex flex-col items-center justify-center mb-3">
                  <div className="flex items-center justify-center">
                    <svg
                      className="h-14 md:h-18 w-auto"
                      viewBox="0 0 240 85"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* V in rich plum/burgundy */}
                      <path
                        d="M20 12 L50 78 L80 12 H64 L50 48 L36 12 Z"
                        fill="#6f1d56"
                      />
                      {/* Q in dark slate */}
                      <path
                        d="M85 36 C85 20 98 10 116 10 C134 10 147 20 147 36 C147 44 143 51 136 56 L146 72 H131 L123 60 C120.5 61 118 62 116 62 C98 62 85 52 85 36 Z M116 22 C104 22 98 28 98 36 C98 44 104 50 116 50 C128 50 134 44 134 36 C134 28 128 22 116 22 Z"
                        fill="#374151"
                      />
                      {/* T in dark slate */}
                      <path
                        d="M148 10 H192 V22 H177 V78 H163 V22 H148 Z"
                        fill="#374151"
                      />
                      {/* ® registered symbol */}
                      <circle
                        cx="200"
                        cy="16"
                        r="6"
                        stroke="#374151"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <text
                        x="200"
                        y="19"
                        fontSize="7"
                        textAnchor="middle"
                        fill="#374151"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        R
                      </text>
                    </svg>
                  </div>
                  <div className="text-sm md:text-base font-bold tracking-widest uppercase mt-1">
                    <span className="font-extrabold text-[#6f1d56]">VANQUISH</span>{" "}
                    <span className="text-gray-700">THERAPIES</span>
                  </div>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                Qualified Counsellor Application
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
                (Confidential)
              </p>
            </div>

            {/* Advisory Notice Box (Matching JotForm writeup with increased font size) */}
            <div className="border-t border-b border-gray-200 py-4 md:py-6 mb-6">
              <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-snug md:leading-relaxed">
                Please be advised: All required fields on the form must be completed. Failure to do so will result in an &apos;error&apos; message. Therefore, it is crucial that you carefully review the form and provide accurate and complete information to avoid any submission issues.
              </p>
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
            {/* ── STEP 1: Personal Information ── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="bg-purple-100/60 text-gray-900 px-4 py-3 rounded-lg font-bold text-base md:text-lg flex items-center justify-between">
                  <span>Personal Information</span>
                  <span className="text-xs font-normal text-gray-600">Step 1 of 4</span>
                </div>

                {/* Full Legal Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Full Legal Name (As per your ID): <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="legalFirstName"
                        id="legalFirstName"
                        value={formData.legalFirstName}
                        onChange={(e) => handleInputChange("legalFirstName", e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                          errors.legalFirstName ? "border-red-500 bg-red-50/20" : "border-gray-300"
                        }`}
                        placeholder=""
                      />
                      <span className="text-xs text-gray-500 mt-1 block">First Name</span>
                      {errors.legalFirstName && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.legalFirstName}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="legalLastName"
                        id="legalLastName"
                        value={formData.legalLastName}
                        onChange={(e) => handleInputChange("legalLastName", e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                          errors.legalLastName ? "border-red-500 bg-red-50/20" : "border-gray-300"
                        }`}
                        placeholder=""
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Last Name</span>
                      {errors.legalLastName && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.legalLastName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-xs">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.dateOfBirth ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                    />
                    <span className="text-xs text-gray-500 mt-1 block">Date</span>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>

                {/* Gender & Ethnicity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      options={GENDER_OPTIONS}
                      placeholder="Please Select"
                      className={errors.gender ? "border-red-500" : ""}
                    />
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                      Ethnicity <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      value={formData.ethnicity}
                      onChange={(e) => handleInputChange("ethnicity", e.target.value)}
                      options={ETHNICITY_OPTIONS}
                      placeholder="Please Select"
                      className={errors.ethnicity ? "border-red-500" : ""}
                    />
                    {errors.ethnicity && (
                      <p className="text-red-500 text-xs mt-1">{errors.ethnicity}</p>
                    )}
                  </div>
                </div>

                {/* Email address & Contact number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                          errors.email ? "border-red-500 bg-red-50/20" : "border-gray-300"
                        }`}
                        placeholder="youremail@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                      Contact number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                          errors.phone ? "border-red-500 bg-red-50/20" : "border-gray-300"
                        }`}
                        placeholder="07123 456789"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Sexual Orientation */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Sexual Orientation: (This helps us match counsellors with clients who may feel more comfortable with certain perspectives, expertise, or understanding). <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-md">
                    <SearchableSelect
                      value={formData.sexualOrientation}
                      onChange={(e) => handleInputChange("sexualOrientation", e.target.value)}
                      options={SEXUAL_ORIENTATION_OPTIONS}
                      placeholder="Please Select"
                      className={errors.sexualOrientation ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.sexualOrientation && (
                    <p className="text-red-500 text-xs mt-1">{errors.sexualOrientation}</p>
                  )}
                </div>

                {/* Please select your beliefs */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Please select your beliefs <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-md">
                    <SearchableSelect
                      value={formData.beliefs}
                      onChange={(e) => handleInputChange("beliefs", e.target.value)}
                      options={BELIEFS_OPTIONS}
                      placeholder="Please Select"
                      className={errors.beliefs ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.beliefs && (
                    <p className="text-red-500 text-xs mt-1">{errors.beliefs}</p>
                  )}
                </div>

                {/* Current Registered Address */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#6f1d56]">
                    Current Registered Address where you reside (As per your ID): <span className="text-red-500">*</span>
                  </label>

                  <div>
                    <input
                      type="text"
                      name="registeredAddress"
                      id="registeredAddress"
                      value={formData.registeredAddress}
                      onChange={(e) => handleInputChange("registeredAddress", e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                        errors.registeredAddress ? "border-red-500 bg-red-50/20" : "border-gray-300"
                      }`}
                      placeholder=""
                    />
                    <span className="text-xs text-gray-500 mt-1 block">Address</span>
                    {errors.registeredAddress && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.registeredAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="registeredCity"
                        id="registeredCity"
                        value={formData.registeredCity}
                        onChange={(e) => handleInputChange("registeredCity", e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                          errors.registeredCity ? "border-red-500 bg-red-50/20" : "border-gray-300"
                        }`}
                        placeholder=""
                      />
                      <span className="text-xs text-gray-500 mt-1 block">City/Town</span>
                      {errors.registeredCity && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.registeredCity}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        name="registeredPostcode"
                        id="registeredPostcode"
                        value={formData.registeredPostcode}
                        onChange={(e) => handleInputChange("registeredPostcode", e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                          errors.registeredPostcode ? "border-red-500 bg-red-50/20" : "border-gray-300"
                        }`}
                        placeholder=""
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Postal Code</span>
                      {errors.registeredPostcode && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.registeredPostcode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Disabilities / Impairments */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Do you have any disabilities/impairments? - If so, please specify: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="disabilities"
                    id="disabilities"
                    rows={3}
                    value={formData.disabilities}
                    onChange={(e) => handleInputChange("disabilities", e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                      errors.disabilities ? "border-red-500 bg-red-50/20" : "border-gray-300"
                    }`}
                    placeholder="Please specify or write 'None'..."
                  />
                  {errors.disabilities && (
                    <p className="text-red-500 text-xs mt-1">{errors.disabilities}</p>
                  )}
                </div>

                {/* Medical conditions */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Do you have any medical conditions, illnesses, or diagnoses that you do not consider a disability? If so, please specify: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="medicalConditions"
                    id="medicalConditions"
                    rows={3}
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                      errors.medicalConditions ? "border-red-500 bg-red-50/20" : "border-gray-300"
                    }`}
                    placeholder="Please specify or write 'None'..."
                  />
                  {errors.medicalConditions && (
                    <p className="text-red-500 text-xs mt-1">{errors.medicalConditions}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2: Professional Information & Experience ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="bg-purple-100/60 text-gray-900 px-4 py-3 rounded-lg font-bold text-base md:text-lg flex items-center justify-between">
                  <span>Professional Information & Experience</span>
                  <span className="text-xs font-normal text-gray-600">Step 2 of 4</span>
                </div>

                {/* Professional Indemnity Insurance */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Do you currently hold valid Professional Indemnity Insurance that covers your counselling or therapeutic practice? <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-md">
                    <SearchableSelect
                      value={formData.hasIndemnityInsurance}
                      onChange={(e) => handleInputChange("hasIndemnityInsurance", e.target.value)}
                      options={YES_NO_OPTIONS}
                      placeholder="Please Select"
                      className={errors.hasIndemnityInsurance ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.hasIndemnityInsurance && (
                    <p className="text-red-500 text-xs mt-1">{errors.hasIndemnityInsurance}</p>
                  )}
                </div>

                {/* PSA Accredited Body */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Are you a member of a recognised and Professional Standards Authority (PSA) Accredited Counselling/Psychotherapy professional body? (e.g NCPS/BACP/Other) If yes, Please provide and upload your membership details <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="professionalBodyDetails"
                    id="professionalBodyDetails"
                    value={formData.professionalBodyDetails}
                    onChange={(e) => handleInputChange("professionalBodyDetails", e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                      errors.professionalBodyDetails ? "border-red-500 bg-red-50/20" : "border-gray-300"
                    }`}
                    placeholder="e.g. BACP Registered Member (Membership No: 123456) / NCPS Accredited"
                  />
                  {errors.professionalBodyDetails && (
                    <p className="text-red-500 text-xs mt-1">{errors.professionalBodyDetails}</p>
                  )}
                </div>

                {/* Qualified Clinical Supervisor */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Do you currently have a Qualified Clinical Supervisor? <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-md">
                    <SearchableSelect
                      value={formData.hasSupervisor}
                      onChange={(e) => handleInputChange("hasSupervisor", e.target.value)}
                      options={YES_NO_OPTIONS}
                      placeholder="Please Select"
                      className={errors.hasSupervisor ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.hasSupervisor && (
                    <p className="text-red-500 text-xs mt-1">{errors.hasSupervisor}</p>
                  )}
                </div>

                {/* Enhanced DBS */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Do you have an enhanced DBS covering the Adult workforce or both workforce? If so, are you registered on the DBS update service? We will be carrying out a status check <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-md">
                    <SearchableSelect
                      value={formData.dbsRegistered}
                      onChange={(e) => handleInputChange("dbsRegistered", e.target.value)}
                      options={DBS_OPTIONS}
                      placeholder="Please Select"
                      className={errors.dbsRegistered ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.dbsRegistered && (
                    <p className="text-red-500 text-xs mt-1">{errors.dbsRegistered}</p>
                  )}
                </div>

                {/* Familiar with Online Counselling */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Are you familiar with Online Counselling? <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-md">
                    <SearchableSelect
                      value={formData.familiarWithOnlineCounselling}
                      onChange={(e) => handleInputChange("familiarWithOnlineCounselling", e.target.value)}
                      options={YES_NO_OPTIONS}
                      placeholder="Please Select"
                      className={errors.familiarWithOnlineCounselling ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.familiarWithOnlineCounselling && (
                    <p className="text-red-500 text-xs mt-1">{errors.familiarWithOnlineCounselling}</p>
                  )}
                </div>

                {/* Previously worked with Vanquish */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Have you previously worked or been on placement with Vanquish Therapies? <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-md">
                    <SearchableSelect
                      value={formData.previousVanquishWork}
                      onChange={(e) => handleInputChange("previousVanquishWork", e.target.value)}
                      options={YES_NO_OPTIONS}
                      placeholder="Please Select"
                      className={errors.previousVanquishWork ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.previousVanquishWork && (
                    <p className="text-red-500 text-xs mt-1">{errors.previousVanquishWork}</p>
                  )}
                </div>

                {/* Counselling-related education & experience */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-1.5">
                    Please provide details of all counselling-related education, qualifications, training, and professional experience. <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="counsellorTrainingDetails"
                    id="counsellorTrainingDetails"
                    rows={4}
                    value={formData.counsellorTrainingDetails}
                    onChange={(e) => handleInputChange("counsellorTrainingDetails", e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
                      errors.counsellorTrainingDetails ? "border-red-500 bg-red-50/20" : "border-gray-300"
                    }`}
                    placeholder="e.g. Level 4 Diploma in Therapeutic Counselling, BSc Psychology, CPD trainings..."
                  />
                  {errors.counsellorTrainingDetails && (
                    <p className="text-red-500 text-xs mt-1">{errors.counsellorTrainingDetails}</p>
                  )}
                </div>

                {/* Which are you qualified to work with */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-2">
                    Which of the following are you qualified to work with? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {QUALIFIED_WORK_WITH_OPTIONS.map((option) => {
                      const isChecked = formData.qualifiedToWorkWith.includes(option);
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? "bg-purple-50/60 border-[#6f1d56] text-[#6f1d56] font-medium"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleArrayToggle("qualifiedToWorkWith", option)}
                            className="rounded text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.qualifiedToWorkWith && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.qualifiedToWorkWith}</p>
                  )}
                </div>

                {/* Modalities */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-2">
                    What therapeutic modality or approach do you primarily work with? (Please select all that apply) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MODALITY_OPTIONS.map((modality) => {
                      const isChecked = formData.modalities.includes(modality);
                      return (
                        <label
                          key={modality}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                            isChecked
                              ? "bg-purple-50/60 border-[#6f1d56] text-[#6f1d56] font-medium"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleArrayToggle("modalities", modality)}
                            className="rounded text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4 flex-shrink-0"
                          />
                          <span className="leading-snug">{modality}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.modalities && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.modalities}</p>
                  )}
                </div>

                {/* Experience Areas */}
                <div>
                  <label className="block text-sm font-semibold text-[#6f1d56] mb-2">
                    Please select all areas you have experience in and currently support clients with. <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXPERIENCE_AREAS_OPTIONS.map((area) => {
                      const isChecked = formData.experienceAreas.includes(area);
                      return (
                        <label
                          key={area}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                            isChecked
                              ? "bg-purple-50/60 border-[#6f1d56] text-[#6f1d56] font-medium"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleArrayToggle("experienceAreas", area)}
                            className="rounded text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4 flex-shrink-0"
                          />
                          <span className="leading-snug">{area}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.experienceAreas && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.experienceAreas}</p>
                  )}
                </div>

                {/* Availability / Schedule */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-[#6f1d56] mb-1">
                      Your Availability <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600">
                      Select all time slots and days when you are available to attend online counselling sessions with clients.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-0.5">Important:</p>
                      <p>
                        Be realistic with your schedule. Once you begin working with clients, consistency is vital. Counsellors are expected to be online 10–15 minutes prior to scheduled session start times.
                      </p>
                    </div>
                  </div>

                  {errors.availability && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                      <p className="text-red-600 text-xs font-medium">{errors.availability}</p>
                    </div>
                  )}

                  <div data-field="availability" className="space-y-3">
                    {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => {
                      const slotsToShow = day === "friday" ? FRIDAY_TIME_SLOTS : TIME_SLOTS;
                      const selectedInDay = formData.availability?.[day] || [];

                      return (
                        <div
                          key={day}
                          className={`border rounded-xl overflow-hidden bg-white ${
                            errors.availability ? "border-red-300" : "border-gray-200"
                          }`}
                        >
                          <div className="px-4 py-2.5 font-semibold text-xs sm:text-sm capitalize bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-[#6f1d56] font-bold">
                              {day}
                              {day === "friday" && (
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                  (Last session at 5:00 PM - 6:00 PM)
                                </span>
                              )}
                            </span>
                            {selectedInDay.length > 0 && (
                              <span className="text-xs font-medium text-[#6f1d56] bg-purple-100 px-2 py-0.5 rounded-full">
                                {selectedInDay.length} {selectedInDay.length === 1 ? "slot" : "slots"} selected
                              </span>
                            )}
                          </div>

                          <div className="p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {slotsToShow.map((slot) => {
                                const isChecked = selectedInDay.includes(slot.value);
                                return (
                                  <label
                                    key={slot.value}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer border text-xs transition-all ${
                                      isChecked
                                        ? "bg-purple-50/60 border-[#6f1d56] font-medium shadow-xs"
                                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleAvailabilityToggle(day, slot.value)}
                                      className="w-4 h-4 rounded border-gray-300 text-[#6f1d56] focus:ring-[#6f1d56]"
                                      style={{ accentColor: "#6f1d56" }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs text-gray-900 block truncate">
                                        {slot.label}
                                      </span>
                                    </div>
                                    <span
                                      className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                                      style={{
                                        backgroundColor:
                                          slot.category === "Morning"
                                            ? "#fef3c7"
                                            : slot.category === "Afternoon"
                                            ? "#dbeafe"
                                            : "#fce7f3",
                                        color:
                                          slot.category === "Morning"
                                            ? "#92400e"
                                            : slot.category === "Afternoon"
                                            ? "#1e40af"
                                            : "#9f1239",
                                      }}
                                    >
                                      {slot.category}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Availability Summary */}
                  {Object.values(formData.availability || {}).some((slots) => slots.length > 0) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 sm:p-4 space-y-1.5">
                      <p className="text-xs sm:text-sm text-emerald-900 font-bold mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Selected Availability Schedule:
                      </p>
                      {Object.entries(formData.availability || {}).map(([day, slots]) => {
                        const slotsToUse = day === "friday" ? FRIDAY_TIME_SLOTS : TIME_SLOTS;
                        return (
                          slots.length > 0 && (
                            <p key={day} className="text-xs text-emerald-800 capitalize leading-relaxed">
                              <strong className="font-semibold text-emerald-950">{day}:</strong>{" "}
                              {slots
                                .map((s) => slotsToUse.find((t) => t.value === s)?.label || s)
                                .join(", ")}
                            </p>
                          )
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 3: Compliance & Document Uploads ── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Section Header Notice Banner (Matching JotForm writeup) */}
                <div className="bg-purple-100/60 text-gray-900 px-4 py-3 rounded-lg font-bold text-sm md:text-base leading-relaxed">
                  Please ensure you upload below: Your Qualification, Recent DBS Certificate, Copy of Insurance as a qualified counsellor, Proof of Self Employment, Copy of your professional membership.
                </div>

                {/* Nickname / Aliases Warning Banner */}
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg">
                  <p className="font-bold text-sm text-gray-900">
                    Please Note: Qualification certificates or documents addressed to nicknames or aliases will not be accepted.
                  </p>
                </div>

                {/* Upload Fields List */}
                <div className="space-y-4">
                  {[
                    {
                      name: "qualificationDocument",
                      label: "Your Highest Counselling Qualifications",
                    },
                    {
                      name: "dbsCertificateQualified",
                      label: "Recent Enhanced DBS Certificate (Both workforces or Adult workforce)",
                    },
                    {
                      name: "validIdDocument",
                      label: "Valid ID (Passport or UK Driving License)",
                    },
                    {
                      name: "professionalMembership",
                      label: "Professional Body Membership",
                    },
                    {
                      name: "selfEmploymentProof",
                      label: "Proof of Self Employment (Self-assessment tax return/A letter from HMRC stating you are self-employed/HMRC Tax letter).",
                    },
                    {
                      name: "insuranceQualified",
                      label: "Copy of Insurance as a Qualified Practitioner",
                    },
                  ].map((doc) => {
                    const fileObj = formData[doc.name];
                    const hasFile = Boolean(fileObj);
                    const progress = uploadProgress[doc.name];
                    const error = errors[doc.name];

                    return (
                      <div
                        key={doc.name}
                        className={`p-4 sm:p-5 rounded-xl border transition-all ${
                          error
                            ? "border-red-400 bg-red-50/20"
                            : hasFile
                            ? "border-emerald-300 bg-emerald-50/10"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <label className="text-sm font-semibold text-[#6f1d56] flex items-center gap-1">
                            {doc.label} <span className="text-red-500">*</span>
                          </label>

                          {hasFile && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Selected
                            </span>
                          )}
                        </div>

                        {/* Drag & Drop File Zone */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50/60 transition-colors">
                          <input
                            type="file"
                            id={doc.name}
                            name={doc.name}
                            onChange={(e) => handleFileUpload(doc.name, e.target.files)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="hidden"
                          />
                          <label
                            htmlFor={doc.name}
                            className="cursor-pointer flex flex-col items-center justify-center gap-1"
                          >
                            <Upload className="w-7 h-7 text-gray-400 mb-1" />
                            <span className="text-sm font-semibold text-[#6f1d56] hover:underline">
                              Browse Files
                            </span>
                            <span className="text-xs text-gray-500">
                              Drag and drop files here
                            </span>
                          </label>
                        </div>

                        {fileObj && typeof fileObj === "object" && fileObj.name && (
                          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 truncate">
                              <FileCheck className="w-4 h-4 text-[#6f1d56] flex-shrink-0" />
                              <span className="font-medium truncate">{fileObj.name}</span>
                              <span className="text-gray-400">
                                ({(fileObj.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInputChange(doc.name, null)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

            {/* ── STEP 4: Review, Disclaimer & Signature ── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Disclaimer Header Notice */}
                <div className="bg-purple-100/60 text-gray-900 px-4 py-3 rounded-lg font-bold text-sm md:text-base leading-relaxed">
                  Disclaimer: I certify that the information provided above is true and of accurate record.
                </div>

                {/* Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 text-xs sm:text-sm">
                    <p className="font-bold text-gray-900 border-b pb-1.5 flex items-center justify-between">
                      <span>Personal Information</span>
                      <button
                        type="button"
                        onClick={() => handleStepChange(1)}
                        className="text-[#6f1d56] font-semibold text-xs hover:underline"
                      >
                        Edit
                      </button>
                    </p>
                    <p><span className="text-gray-500">Name:</span> <strong>{formData.legalFirstName} {formData.legalLastName}</strong></p>
                    <p><span className="text-gray-500">Date of Birth:</span> {formData.dateOfBirth}</p>
                    <p><span className="text-gray-500">Gender / Ethnicity:</span> {formData.gender} / {formData.ethnicity}</p>
                    <p><span className="text-gray-500">Email:</span> {formData.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {formData.phone}</p>
                    <p><span className="text-gray-500">Beliefs:</span> {formData.beliefs}</p>
                    <p><span className="text-gray-500">Address:</span> {formData.registeredAddress}, {formData.registeredCity} {formData.registeredPostcode}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 text-xs sm:text-sm">
                    <p className="font-bold text-gray-900 border-b pb-1.5 flex items-center justify-between">
                      <span>Professional & Practice</span>
                      <button
                        type="button"
                        onClick={() => handleStepChange(2)}
                        className="text-[#6f1d56] font-semibold text-xs hover:underline"
                      >
                        Edit
                      </button>
                    </p>
                    <p><span className="text-gray-500">Insurance Held:</span> <strong>{formData.hasIndemnityInsurance}</strong></p>
                    <p><span className="text-gray-500">Supervisor Status:</span> <strong>{formData.hasSupervisor}</strong></p>
                    <p><span className="text-gray-500">DBS Status:</span> {formData.dbsRegistered}</p>
                    <p><span className="text-gray-500">Qualified to Work With:</span> {formData.qualifiedToWorkWith.join(", ") || "None"}</p>
                    <p><span className="text-gray-500">Modalities Selected:</span> {formData.modalities.length} selected</p>
                    <p><span className="text-gray-500">Support Areas:</span> {formData.experienceAreas.length} selected</p>
                    <p>
                      <span className="text-gray-500">Availability Slots:</span>{" "}
                      <strong>
                        {Object.values(formData.availability || {}).flat().length} slots selected across{" "}
                        {Object.entries(formData.availability || {}).filter(([_, s]) => s.length > 0).length} days
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Electronic Signature Legal Agreement Preview Notice */}
                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs sm:text-sm text-gray-800 leading-relaxed space-y-1">
                  <p className="font-semibold text-[#6f1d56]">Electronic Signature Agreement</p>
                  <p>
                    I understand and accept that my electronic signature will be as valid as a handwritten signature and considered original to the extent allowed by applicable law.
                  </p>
                </div>

                {/* Declaration Agreement Checkbox */}
                <div className="bg-purple-50/40 border border-purple-200 rounded-xl p-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                      className="mt-0.5 rounded text-[#6f1d56] focus:ring-[#6f1d56] h-4 w-4"
                    />
                    <span className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                      I confirm and certify that all details, statements, and documentation submitted in this application are accurate, valid, and representative of my professional practice. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-red-500 text-xs">{errors.termsAccepted}</p>
                  )}
                </div>

                {/* Signature & Auto Date Section */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <label className="block text-sm font-semibold text-[#6f1d56]">
                        Signature <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setSignatureMode("draw")}
                          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                            signatureMode === "draw"
                              ? "bg-white text-[#6f1d56] shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <PenTool className="w-3.5 h-3.5" /> Draw Signature
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode("type")}
                          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                            signatureMode === "type"
                              ? "bg-white text-[#6f1d56] shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Type className="w-3.5 h-3.5" /> Type Name
                        </button>
                      </div>
                    </div>

                    {signatureMode === "draw" ? (
                      <div className="space-y-2">
                        <div
                          className={`border-2 rounded-xl overflow-hidden bg-white relative ${
                            errors.signature ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <SignatureCanvas
                            ref={signaturePadRef}
                            onEnd={() => {
                              if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                                const sig = signaturePadRef.current.getCanvas().toDataURL("image/png");
                                handleInputChange("signature", sig);
                              }
                            }}
                            canvasProps={{
                              className: "w-full h-40 bg-white cursor-crosshair",
                            }}
                          />
                          <div className="absolute bottom-2 left-3 pointer-events-none text-[11px] text-gray-400 font-sans">
                            Sign above with your mouse, touchpad, or finger
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Clear Signature
                          </button>
                          <span className="text-xs text-gray-400">
                            Powered by Vanquish Therapies
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <input
                            type="text"
                            name="signature"
                            id="signature"
                            value={formData.signature && !formData.signature.startsWith("data:") ? formData.signature : ""}
                            onChange={(e) => handleInputChange("signature", e.target.value)}
                            placeholder="Type your full legal name here"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none"
                          />
                        </div>

                        {formData.signature && !formData.signature.startsWith("data:") && (
                          <div className="p-4 rounded-xl border border-dashed border-purple-300 bg-purple-50/40 text-center">
                            <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">
                              Signature Preview:
                            </span>
                            <span className="text-2xl sm:text-3xl font-serif italic text-[#6f1d56]">
                              {formData.signature}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {errors.signature && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.signature}</p>
                    )}
                  </div>

                  {/* Auto-set Date Signed Field */}
                  <div className="max-w-md bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Signed
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {new Date().toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" /> Auto-recorded
                    </span>
                  </div>
                </div>

                {/* Footer message from JotForm */}
                <div className="pt-6 pb-2 text-center border-t border-gray-200">
                  <p className="text-base md:text-lg font-bold text-gray-900">
                    Thank you for completing the application form. We will be in touch soon.
                  </p>
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

            {/* Navigation & Submit Buttons */}
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
                  className={`flex items-center gap-2 px-8 md:px-10 py-3 md:py-3.5 text-white rounded-lg font-bold text-base md:text-lg transition-all shadow-md ${
                    !formData.termsAccepted || isSubmitting
                      ? "opacity-50 cursor-not-allowed bg-emerald-600"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                      <span>Submit</span>
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
