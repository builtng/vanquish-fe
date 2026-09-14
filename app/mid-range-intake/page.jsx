"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  Heart,
  Briefcase,
  Calendar,
  MessageCircle,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Lock,
  Users,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { StripePaymentWrapper } from "@/components/StripePayment";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import { toast } from "react-toastify";
import apiService from "@/lib/api";
import { useBranding } from "@/contexts/BrandingContext";
import { SUPPORT_AREAS } from "@/lib/constants";

function MidRangeClientIntakeContent() {
  const { branding, loading: brandingLoading } = useBranding();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    // Step 1: Service
    serviceType: "Mid Range",
    isCouples: false,

    // Step 2: Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    street: "",
    city: "",
    postcode: "",
    country: "",
    locationOfResidence: "",
    age: "",
    voicemailOk: "",
    currentlyInTherapy: "",
    workingWithAnotherReason: "",

    // Couples extras
    partnerFirstName: "",
    partnerLastName: "",
    partnerAge: "",

    // Step 3: Demographics (About)
    gender: "",
    ethnicity: "",
    otherEthnicity: "",
    sexualOrientation: "",
    otherSexualOrientation: "",
    // Partner Demographics
    partnerGender: "",
    partnerEthnicity: "",
    partnerOtherEthnicity: "",
    partnerSexualOrientation: "",
    partnerOtherSexualOrientation: "",

    // Step 4: Medical & Service
    onMedication: "",
    medicationDetails: "",
    disabilities: "",
    // Partner Medical
    partnerOnMedication: "",
    partnerMedicationDetails: "",
    partnerDisabilities: "",

    // Step 5: Concerns / Support
    supportAreas: [],
    concernsDetails: "",
    riskIssues: "",

    // Step 6: Availability - Detailed time slots
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },

    // Step 7: Preferences
    genderPreference: "No preference",
    agePreference: "No preference",
    ethnicityPreference: "No preference",
    orientationPreference: "No preference",

    // Step 8: Referral
    hearAboutUs: "",
    referralReason: "",
    referrerName: "",
    referrerPhone: "",
    referrerOrg: "",
    referrerEmail: "",

    // Step 9: Core34 Assessment
    core34: {},

    // Step 10: Consultation Slot
    consultationSlotId: "",

    // Step 11: Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    emergencyContactRelationship: "",

    // Step 12: Payment
    discountCode: "",
    termsAccepted: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [errors, setErrors] = useState({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [paymentProps, setPaymentProps] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [baseFee, setBaseFee] = useState(15.0);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const formContentRef = useRef(null);

  const [servicePricing, setServicePricing] = useState({
    "Mid Range": 15.0,
    "Counselling & Coaching": 20.0,
  });

  // Sync state from query parameters on mount or URL changes
  useEffect(() => {
    if (!searchParams) return;
    const ctParam = searchParams.get("ct")?.toLowerCase()?.trim();
    const actionParam = searchParams.get("action")?.toLowerCase()?.trim();
    const serviceParam = searchParams.get("service")?.toLowerCase()?.trim();

    let targetIsCouples = null;
    let targetServiceType = null;

    // Special direct link mapping: ct=md&action=cc -> Couples/Family and Mid Range
    if (ctParam === "md" && actionParam === "cc") {
      targetIsCouples = true;
      targetServiceType = "Mid Range";
    } else {
      // Client type mapping
      if (ctParam === "single" || ctParam === "individual") {
        targetIsCouples = false;
      } else if (
        ctParam === "group" ||
        ctParam === "couples" ||
        ctParam === "family"
      ) {
        targetIsCouples = true;
      }

      // Action / Service mapping
      if (
        actionParam === "md" ||
        actionParam === "mid-range" ||
        actionParam === "midrange" ||
        serviceParam === "mid-range" ||
        serviceParam === "md"
      ) {
        targetServiceType = "Mid Range";
      } else if (
        actionParam === "cc" ||
        actionParam === "coaching" ||
        actionParam === "coaching-counselling" ||
        serviceParam === "coaching" ||
        serviceParam === "cc"
      ) {
        targetServiceType = "Counselling & Coaching";
      }
    }

    setFormData((prev) => {
      let updated = { ...prev };
      let changed = false;

      if (targetIsCouples !== null && updated.isCouples !== targetIsCouples) {
        updated.isCouples = targetIsCouples;
        changed = true;
      }
      if (
        targetServiceType !== null &&
        updated.serviceType !== targetServiceType
      ) {
        updated.serviceType = targetServiceType;
        changed = true;
      }

      return changed ? updated : prev;
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const services = await apiService.getAllServices();
        if (Array.isArray(services)) {
          const pricingMap = {
            "Mid Range": 15.0,
            "Counselling & Coaching": 20.0,
          };
          services.forEach((s) => {
            if (
              s.service_name === "Mid Range" ||
              s.service_name === "Mid Range Counselling"
            ) {
              const p = parseFloat(s.consultation_price);
              if (!isNaN(p) && p > 0) pricingMap["Mid Range"] = p;
            }
            if (
              s.service_name === "Counselling & Coaching" ||
              s.service_name === "Coaching & Counselling"
            ) {
              const p = parseFloat(s.consultation_price);
              if (!isNaN(p) && p > 0) pricingMap["Counselling & Coaching"] = p;
            }
          });
          setServicePricing(pricingMap);
          setBaseFee(
            pricingMap[formData.serviceType] ||
            (formData.serviceType === "Counselling & Coaching" ? 20.0 : 15.0)
          );
        }
      } catch (err) {
        console.error("Failed to load dynamic pricing:", err);
      }
    };
    fetchPricing();
  }, []);

  // Update base fee when service type switches
  useEffect(() => {
    const price =
      servicePricing[formData.serviceType] ||
      (formData.serviceType === "Counselling & Coaching" ? 20.0 : 15.0);
    setBaseFee(price);
  }, [formData.serviceType, servicePricing]);

  useEffect(() => {
    if (currentStep === 10) {
      const fetchSlots = async () => {
        setIsSlotsLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/consultation-slots/available`
          );
          if (res.ok) {
            const data = await res.json();
            setAvailableSlots(data);
          }
        } catch (err) {
          console.error("Failed to load slots:", err);
        } finally {
          setIsSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [currentStep]);

  const getConsultationFee = () => {
    return Math.max(0, baseFee - discountAmount);
  };

  const handleApplyDiscount = async () => {
    const code = formData.discountCode?.trim().toUpperCase();

    if (!code) {
      setDiscountAmount(0);
      setIsDiscountApplied(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/coupons/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Invalid discount code");
      }

      const coupon = await response.json();

      let newDiscountAmount = 0;
      const originalFee = getConsultationFee() + discountAmount;

      if (coupon.type === "fixed") {
        newDiscountAmount = parseFloat(coupon.value);
      } else {
        newDiscountAmount = (originalFee * parseFloat(coupon.value)) / 100;
      }

      setDiscountAmount(newDiscountAmount);
      setIsDiscountApplied(true);

      toast.success(
        `Discount code applied! You saved £${Number(newDiscountAmount).toFixed(2)}`
      );
    } catch (error) {
      toast.error(error.message || "Invalid discount code");
      setDiscountAmount(0);
      setIsDiscountApplied(false);
    }
  };

  const supportAreasList = SUPPORT_AREAS;

  const core34Questions = [
    "I have felt terribly alone and isolated",
    "I have felt tense, anxious or nervous",
    "I have felt I have someone to turn to for support when needed",
    "I have felt O.K about myself",
    "I have felt totally lacking in energy and enthusiasm",
    "I have been physically violent to others",
    "I have felt able to cope when things go wrong",
    "I have been troubled by aches, pains or other physical problems",
    "I have thought of hurting myself",
    "Talking to people has felt too much for me",
    "Tension and anxiety have prevented me from doing important things",
    "I have been happy with the things I have done",
    "I have been disturbed by unwanted thoughts and feelings",
    "I have felt like crying",
    "I have felt panic or terror",
    "I made plans to end my life",
    "I have felt overwhelmed by my problems",
    "I have had difficulty getting to sleep or staying asleep",
    "I have felt warmth or affection for someone",
    "My problems have been impossible to put to one side",
    "I have been able to do most things I needed to",
    "I have threatened or intimidated another person",
    "I have felt despairing or hopeless",
    "I have thought it would be better if I were dead",
    "I have felt criticised by other people",
    "I have thought I have no friends",
    "I have felt unhappy",
    "Unwanted images or memories have been distressing me",
    "I have been irritable when with other people",
    "I have thought I am to blame for my problems and difficulties",
    "I have felt optimistic about my future",
    "I have achieved the things I wanted to",
    "I have felt humiliated or shamed by other people",
    "I have hurt myself physically or taken dangerous risks with my health",
  ];

  const core34Options = [
    "Not at all",
    "Only occasionally",
    "Sometimes",
    "Often",
    "Most or all the time",
  ];

  const timeSlots = [
    { value: "10am-1050am", label: "10:00 AM - 10:50 AM", category: "Morning" },
    { value: "11am-1150am", label: "11:00 AM - 11:50 AM", category: "Morning" },
    {
      value: "12pm-1250pm",
      label: "12:00 PM - 12:50 PM",
      category: "Afternoon",
    },
    { value: "1pm-150pm", label: "1:00 PM - 1:50 PM", category: "Afternoon" },
    { value: "2pm-250pm", label: "2:00 PM - 2:50 PM", category: "Afternoon" },
    { value: "3pm-350pm", label: "3:00 PM - 3:50 PM", category: "Afternoon" },
    { value: "4pm-450pm", label: "4:00 PM - 4:50 PM", category: "Afternoon" },
    { value: "5pm-550pm", label: "5:00 PM - 5:50 PM", category: "Evening" },
    { value: "6pm-650pm", label: "6:00 PM - 6:50 PM", category: "Evening" },
  ];

  const fridayTimeSlots = [
    { value: "10am-1050am", label: "10:00 AM - 10:50 AM", category: "Morning" },
    { value: "11am-1150am", label: "11:00 AM - 11:50 AM", category: "Morning" },
    {
      value: "12pm-1250pm",
      label: "12:00 PM - 12:50 PM",
      category: "Afternoon",
    },
    { value: "1pm-150pm", label: "1:00 PM - 1:50 PM", category: "Afternoon" },
    { value: "2pm-250pm", label: "2:00 PM - 2:50 PM", category: "Afternoon" },
    { value: "3pm-350pm", label: "3:00 PM - 3:50 PM", category: "Afternoon" },
    { value: "4pm-450pm", label: "4:00 PM - 4:50 PM", category: "Afternoon" },
    { value: "5pm-550pm", label: "5:00 PM - 5:50 PM", category: "Evening" },
  ];

  const validateStep = (step) => {
    const stepErrors = {};

    switch (step) {
      case 1: // Service Selection
        if (!formData.serviceType)
          stepErrors.serviceType = "Please select a service";
        break;

      case 2: // Personal Information
        if (!formData.firstName.trim())
          stepErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          stepErrors.lastName = "Last name is required";
        if (
          !formData.email.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          stepErrors.email = "Valid email is required";
        }
        if (!formData.phone.trim())
          stepErrors.phone = "Phone number is required";

        if (!formData.street.trim()) stepErrors.street = "Address is required";

        if (
          !formData.age ||
          parseInt(formData.age) < 18 ||
          formData.age.length > 2
        )
          stepErrors.age = "Valid age (18-99) is required";

        if (!formData.voicemailOk)
          stepErrors.voicemailOk = "This field is required";
        if (!formData.currentlyInTherapy)
          stepErrors.currentlyInTherapy = "This field is required";

        if (formData.isCouples) {
          if (!formData.partnerFirstName.trim())
            stepErrors.partnerFirstName = "Partner's first name is required";
          if (!formData.partnerLastName.trim())
            stepErrors.partnerLastName = "Partner's last name is required";
          if (
            !formData.partnerAge ||
            parseInt(formData.partnerAge) < 18 ||
            formData.partnerAge.length > 2
          )
            stepErrors.partnerAge = "Partner's valid age (18-99) is required";
        }
        break;

      case 3: // Demographics (About You)
        if (!formData.gender) stepErrors.gender = "Gender is required";
        if (!formData.ethnicity) stepErrors.ethnicity = "Ethnicity is required";
        if (!formData.sexualOrientation)
          stepErrors.sexualOrientation = "Sexual orientation is required";

        if (formData.isCouples) {
          if (!formData.partnerGender)
            stepErrors.partnerGender = "Partner's gender is required";
          if (!formData.partnerEthnicity)
            stepErrors.partnerEthnicity = "Partner's ethnicity is required";
          if (!formData.partnerSexualOrientation)
            stepErrors.partnerSexualOrientation =
              "Partner's sexual orientation is required";
        }
        break;

      case 4: // Medical & Disabilities
        if (!formData.onMedication)
          stepErrors.onMedication = "This field is required";
        if (
          formData.onMedication === "Yes" &&
          !formData.medicationDetails.trim()
        ) {
          stepErrors.medicationDetails = "Please provide medication details";
        }
        if (!formData.disabilities.trim())
          stepErrors.disabilities =
            "This field is required (enter 'N/A' if none)";

        if (formData.isCouples) {
          if (!formData.partnerOnMedication)
            stepErrors.partnerOnMedication = "This field is required";
          if (
            formData.partnerOnMedication === "Yes" &&
            !formData.partnerMedicationDetails.trim()
          ) {
            stepErrors.partnerMedicationDetails =
              "Please provide partner's medication details";
          }
          if (!formData.partnerDisabilities.trim())
            stepErrors.partnerDisabilities =
              "This field is required (enter 'N/A' if none)";
        }
        break;

      case 5: // Concerns (Support Areas)
        if (formData.supportAreas.length === 0)
          stepErrors.supportAreas = "Please select at least one support area";
        if (!formData.concernsDetails.trim())
          stepErrors.concernsDetails =
            "Please provide details about your concerns";
        break;

      case 6: // Availability
        const hasAvailability = Object.values(formData.availability).some(
          (day) => day.length > 0
        );
        if (!hasAvailability)
          stepErrors.availability = "Please select at least one time slot";
        break;

      case 7: // Preferences
        break;

      case 8: // Referral
        if (!formData.hearAboutUs) {
          stepErrors.hearAboutUs = "This field is required";
        } else if (formData.hearAboutUs === "Referral") {
          if (!formData.referrerName.trim())
            stepErrors.referrerName = "Referrer's name is required";
          if (!formData.referrerPhone.trim())
            stepErrors.referrerPhone = "Referrer's phone is required";
          if (!formData.referrerEmail.trim())
            stepErrors.referrerEmail = "Referrer's email is required";
          if (!formData.referralReason.trim())
            stepErrors.referralReason = "Reasons for referral is required";
        }
        break;

      case 9: // Assessment (CORE-34)
        if (Object.keys(formData.core34).length < 34) {
          stepErrors.core34 =
            "Please answer all 34 questions before proceeding.";
        }
        break;

      case 10: // Consultation Slot
        if (!formData.consultationSlotId)
          stepErrors.consultationSlotId =
            "Please select an available consultation slot";
        break;

      case 11: // Emergency Contact
        if (!formData.emergencyContactName.trim())
          stepErrors.emergencyContactName =
            "Emergency contact name is required";
        if (!formData.emergencyContactPhone.trim())
          stepErrors.emergencyContactPhone =
            "Emergency contact phone is required";
        if (
          formData.emergencyContactEmail.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emergencyContactEmail)
        )
          stepErrors.emergencyContactEmail =
            "Valid emergency contact email is required";
        if (!formData.emergencyContactRelationship.trim())
          stepErrors.emergencyContactRelationship = "Relationship is required";
        break;

      case 12: // Payment
        if (!formData.termsAccepted)
          stepErrors.termsAccepted = "You must accept the terms";
        break;

      default:
        break;
    }

    return stepErrors;
  };

  useEffect(() => {
    if (formContentRef.current) {
      formContentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentStep]);

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
        let errorElement =
          document.querySelector(`[name="${firstErrorField}"]`) ||
          document.querySelector(`#${firstErrorField}`);

        if (!errorElement) {
          errorElement = document.querySelector(
            `[data-field="${firstErrorField}"]`
          );
        }

        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          if (
            errorElement.tagName === "INPUT" ||
            errorElement.tagName === "SELECT" ||
            errorElement.tagName === "TEXTAREA"
          ) {
            errorElement.focus();
          }
        } else {
          if (formContentRef.current) {
            formContentRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }, 100);
      return;
    }

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setErrors({});
    setCurrentStep(newStep);
  };

  const handleNext = () => {
    handleStepChange(currentStep + 1);
  };

  const handlePrevious = () => {
    handleStepChange(currentStep - 1);
  };

  const handleStepClick = (stepNumber) => {
    if (completedSteps.has(stepNumber) || stepNumber < currentStep) {
      handleStepChange(stepNumber);
    } else if (stepNumber === currentStep) {
      return;
    } else {
      handleStepChange(stepNumber);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "serviceType" || field === "isCouples") {
        if (typeof window !== "undefined") {
          const isCouplesVal = field === "isCouples" ? value : next.isCouples;
          const serviceTypeVal =
            field === "serviceType" ? value : next.serviceType;
          const ctParam = isCouplesVal ? "group" : "single";
          const actionParam =
            serviceTypeVal === "Counselling & Coaching" ? "cc" : "md";
          const url = new URL(window.location.href);
          url.searchParams.set("ct", ctParam);
          url.searchParams.set("action", actionParam);
          url.searchParams.delete("service");
          window.history.replaceState({}, "", url.toString());
        }
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSupportAreaToggle = (area) => {
    setFormData((prev) => ({
      ...prev,
      supportAreas: prev.supportAreas.includes(area)
        ? prev.supportAreas.filter((a) => a !== area)
        : [...prev.supportAreas, area],
    }));
    if (errors.supportAreas) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.supportAreas;
        return newErrors;
      });
    }
  };

  const handleCore34Change = (questionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      core34: {
        ...prev.core34,
        [questionIndex]: value,
      },
    }));
    if (errors.core34) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.core34;
        return newErrors;
      });
    }
  };

  const handleAvailabilityToggle = (day, slot) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].includes(slot)
          ? prev.availability[day].filter((s) => s !== slot)
          : [...prev.availability[day], slot],
      },
    }));
    if (errors.availability) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.availability;
        return newErrors;
      });
    }
  };

  const sanitizeText = (val) => {
    if (typeof val !== "string") return val;
    return val.trim().replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF]/g, "");
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const stepErrors = validateStep(12);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (!formData.termsAccepted) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/client-intake`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: sanitizeText(formData.firstName),
            last_name: sanitizeText(formData.lastName),
            email: sanitizeText(formData.email).toLowerCase(),
            phone: sanitizeText(formData.phone) || null,
            street: sanitizeText(formData.street) || null,
            city: sanitizeText(formData.city) || null,
            postcode: sanitizeText(formData.postcode) || null,
            country: sanitizeText(formData.country) || null,
            location_of_residence:
              sanitizeText(formData.locationOfResidence) || [sanitizeText(formData.city), sanitizeText(formData.country)].filter(Boolean).join(", ") || sanitizeText(formData.street) || null,
            address: [sanitizeText(formData.street), sanitizeText(formData.city), sanitizeText(formData.postcode), sanitizeText(formData.country)].filter(Boolean).join(", ") || sanitizeText(formData.street) || null,
            age: formData.age ? parseInt(formData.age, 10) : null,
            emergency_contact_name: sanitizeText(formData.emergencyContactName) || null,
            emergency_contact_phone: sanitizeText(formData.emergencyContactPhone) || null,
            emergency_contact_email: sanitizeText(formData.emergencyContactEmail) || null,
            emergency_contact_relationship:
              sanitizeText(formData.emergencyContactRelationship) || null,
            voicemail_ok: formData.voicemailOk === "Yes",
            currently_in_therapy: formData.currentlyInTherapy === "Yes",
            gender: sanitizeText(formData.gender) || null,
            ethnicity:
              formData.ethnicity === "Other" && formData.otherEthnicity
                ? sanitizeText(formData.otherEthnicity)
                : sanitizeText(formData.ethnicity) || null,
            sexual_orientation:
              formData.sexualOrientation === "Other" &&
                formData.otherSexualOrientation
                ? sanitizeText(formData.otherSexualOrientation)
                : sanitizeText(formData.sexualOrientation) || null,
            service_type: formData.serviceType || "Mid Range",
            is_couples: !!formData.isCouples,
            partner_first_name: formData.isCouples ? sanitizeText(formData.partnerFirstName) : null,
            partner_last_name: formData.isCouples ? sanitizeText(formData.partnerLastName) : null,
            partner_age:
              formData.isCouples && formData.partnerAge
                ? parseInt(formData.partnerAge, 10)
                : null,
            partner_gender: formData.isCouples ? sanitizeText(formData.partnerGender) : null,
            partner_ethnicity:
              formData.isCouples
                ? formData.partnerEthnicity === "Other" && formData.partnerOtherEthnicity
                  ? sanitizeText(formData.partnerOtherEthnicity)
                  : sanitizeText(formData.partnerEthnicity) || null
                : null,
            partner_sexual_orientation:
              formData.isCouples
                ? formData.partnerSexualOrientation === "Other" && formData.partnerOtherSexualOrientation
                  ? sanitizeText(formData.partnerOtherSexualOrientation)
                  : sanitizeText(formData.partnerSexualOrientation) || null
                : null,
            partner_on_medication: formData.isCouples
              ? formData.partnerOnMedication === "Yes"
              : null,
            partner_medication_details: formData.isCouples
              ? sanitizeText(formData.partnerMedicationDetails) || null
              : null,
            partner_has_disability: formData.isCouples
              ? formData.partnerDisabilities && formData.partnerDisabilities !== "N/A"
              : null,
            partner_disability_details: formData.isCouples
              ? sanitizeText(formData.partnerDisabilities) || null
              : null,
            on_medication: formData.onMedication === "Yes",
            medication_details: sanitizeText(formData.medicationDetails) || null,
            disabilities: sanitizeText(formData.disabilities) || null,
            support_areas: formData.supportAreas || [],
            concerns_details: sanitizeText(formData.concernsDetails) || null,
            risk_issues: sanitizeText(formData.riskIssues) || null,
            core34_answers: formData.core34 || {},
            availability: formData.availability || {},
            gender_preference: sanitizeText(formData.genderPreference) || "No preference",
            age_preference: sanitizeText(formData.agePreference) || "No preference",
            ethnicity_preference:
              sanitizeText(formData.ethnicityPreference) || "No preference",
            orientation_preference:
              sanitizeText(formData.orientationPreference) || "No preference",
            hear_about_us: sanitizeText(formData.hearAboutUs) || null,
            referral_reason: sanitizeText(formData.referralReason) || null,
            referrer_name: sanitizeText(formData.referrerName) || null,
            referrer_phone: sanitizeText(formData.referrerPhone) || null,
            referrer_org: sanitizeText(formData.referrerOrg) || null,
            referrer_email: sanitizeText(formData.referrerEmail) || null,
            terms_accepted: !!formData.termsAccepted,
            consultation_slot_id: formData.consultationSlotId || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit intake form");
      }

      const result = await response.json();
      const newClientId = result.client_id || result.id;
      setClientId(newClientId);

      if (formData.consultationSlotId && newClientId) {
        try {
          const bookingResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
            }/consultation-slots/book`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                slot_id: formData.consultationSlotId,
                client_id: newClientId,
              }),
            }
          );

          if (!bookingResponse.ok) {
            const bookingError = await bookingResponse.json();
            console.error("Booking error:", bookingError);
            toast.warning(
              "Form submitted, but failed to book consultation slot. Our team will contact you."
            );
          }
        } catch (bookingErr) {
          console.error("Failed to book consultation slot:", bookingErr);
          toast.warning(
            "Form submitted, but failed to book consultation slot. Our team will contact you."
          );
        }
      }

      const finalFee = getConsultationFee();

      if (finalFee > 0) {
        setPaymentProps({
          clientId: newClientId,
          amount: finalFee,
          couponCode: isDiscountApplied ? formData.discountCode : null,
          returnUrl: `${window.location.origin}/payment-success?client_id=${newClientId}`,
          onSuccess: () => {
            setSubmitted(true);
            setShowPaymentModal(false);
          },
          onError: (errMsg) => {
            toast.error(errMsg || "Payment failed");
          },
        });
        setShowPaymentModal(true);
      } else {
        setSubmitted(true);
        toast.success("Intake form submitted successfully!");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.message || "Failed to submit intake form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Service", icon: Briefcase },
    { number: 2, title: "Personal", icon: User },
    { number: 3, title: "About", icon: Heart },
    { number: 4, title: "Service", icon: Briefcase },
    { number: 5, title: "Support", icon: MessageCircle },
    { number: 6, title: "Availability", icon: Calendar },
    { number: 7, title: "Preferences", icon: Heart },
    { number: 8, title: "Referral", icon: User },
    { number: 9, title: "Assessment", icon: CheckCircle },
    { number: 10, title: "Slot", icon: Calendar },
    { number: 11, title: "Emergency", icon: AlertTriangle },
    { number: 12, title: "Payment", icon: CreditCard },
  ];

  if (submitted) {
    return (
      <PublicFormWrapper>
        <div
          className="min-h-screen"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="flex items-center justify-center p-4 min-h-screen">
            <div className="card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  backgroundColor: "var(--success-bg)",
                  border: "2px solid var(--success-border)",
                }}
              >
                <CheckCircle
                  className="w-10 h-10"
                  style={{ color: "var(--success)" }}
                />
              </div>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Registration Successful!
              </h2>

              <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                Thank you for completing your registration. We have received your
                details and consultation booking.
              </p>

              <div
                className="rounded-lg p-4 mb-6 text-left"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Next Steps:
                </h3>
                <ul
                  className="text-sm space-y-1 list-disc list-inside"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <li>Check your email for confirmation and session details</li>
                  <li>We will contact you regarding your consultation slot</li>
                  <li>Review our client guidelines before your first session</li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PublicFormWrapper>
    );
  }

  return (
    <PublicFormWrapper>
      <div
        className="min-h-screen py-4 md:py-8 px-4"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header with Logo */}
          <div className="card rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border">
            <div className="flex flex-col items-center justify-center mb-4 md:mb-6 text-center">
              {brandingLoading ? (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-8 w-48 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center mb-4">
                    {branding.platform_logo_url ? (
                      <img
                        src={apiService.getStorageUrl(
                          branding.platform_logo_url
                        )}
                        alt={branding.company_name}
                        className="max-h-20 md:max-h-24 object-contain"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl"
                        style={{ backgroundColor: "#6f1d56" }}
                      >
                        {branding.company_name
                          ? branding.company_name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                          : "VT"}
                      </div>
                    )}
                  </div>
                  <h1
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {branding.company_name ||
                      process.env.NEXT_PUBLIC_APP_NAME ||
                      "Vanquish Therapies"}
                  </h1>
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 mt-3 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-Bit SSL Encrypted &bull; Confidential &bull; GDPR Compliant</span>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Progress - Simple */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-lg font-medium"
                  style={{ color: "#6f1d56" }}
                >
                  Step {currentStep} of {steps.length}
                </span>
                <span
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {steps[currentStep - 1].title}
                </span>
              </div>
              <div
                className="w-full rounded-full h-2"
                style={{ backgroundColor: "var(--border-color)" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: "#6f1d56",
                    width: `${(currentStep / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Desktop Progress - Full Steps */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.number);
                    const isCurrent = currentStep === step.number;
                    const isAccessible =
                      isCompleted || step.number <= currentStep;

                    return (
                      <React.Fragment key={step.number}>
                        <div
                          className="flex flex-col items-center"
                          style={{ width: `${100 / steps.length}%` }}
                        >
                          <button
                            type="button"
                            onClick={() => handleStepClick(step.number)}
                            disabled={!isAccessible}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCurrent
                                ? "text-white ring-2 ring-offset-2"
                                : isCompleted
                                  ? "text-white bg-green-600 hover:bg-green-700"
                                  : isAccessible
                                    ? "text-white hover:opacity-80"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              } ${isAccessible ? "cursor-pointer" : ""}`}
                            style={
                              isCurrent || (isAccessible && !isCompleted)
                                ? { backgroundColor: "#6f1d56" }
                                : {}
                            }
                            title={
                              isAccessible
                                ? `Go to ${step.title}`
                                : "Complete previous steps first"
                            }
                          >
                            {isCompleted && !isCurrent ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </button>
                          <span
                            className={`text-sm mt-2 text-center ${isCurrent || isCompleted
                                ? "font-medium"
                                : "text-gray-500"
                              }`}
                            style={
                              isCurrent || isCompleted
                                ? { color: "#6f1d56" }
                                : {}
                            }
                          >
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`h-1 flex-1 mx-2 rounded transition-colors ${currentStep > step.number ? "" : "bg-gray-200"
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
          </div>

          {/* Form Content */}
          <div
            ref={formContentRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200 dark:border-gray-700"
          >
            {/* ═══════════════ STEP 1: Service Selection ═══════════════ */}
            {currentStep === 1 && (
              <div className="space-y-6 md:space-y-8">
                <div>
                  <label
                    className="block text-lg font-medium mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Please select the service you require{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        val: "Mid Range",
                        label: "Mid Range Counselling",
                        price: "Starting from £40",
                        desc: "One-to-one counselling with a qualified counsellor.",
                      },
                      {
                        val: "Counselling & Coaching",
                        label: "Coaching & Counselling",
                        price: "Starting from £60",
                        desc: "An integrated coaching and counselling approach.",
                      },
                    ].map((s) => (
                      <label
                        key={s.val}
                        className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${formData.serviceType === s.val
                            ? "border-[#6f1d56] bg-purple-50/60"
                            : "border-gray-200 hover:border-purple-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="serviceType"
                          value={s.val}
                          checked={formData.serviceType === s.val}
                          onChange={() => handleInputChange("serviceType", s.val)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${formData.serviceType === s.val
                                ? "border-[#6f1d56] bg-[#6f1d56]"
                                : "border-gray-300"
                              }`}
                          >
                            {formData.serviceType === s.val && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">{s.label}</p>
                            <p className="text-[#6f1d56] font-semibold text-sm mt-0.5">
                              {s.price}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.serviceType && (
                    <p className="text-red-500 text-sm mt-2">{errors.serviceType}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-lg font-medium mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Please select if you are applying for individuals or couples/family counselling{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        val: false,
                        label: "Individual Counselling",
                        icon: User,
                        desc: "For a single person.",
                      },
                      {
                        val: true,
                        label: "Couples / Family Counselling",
                        icon: Users,
                        desc: "For two or more people attending together.",
                      },
                    ].map((o) => (
                      <label
                        key={String(o.val)}
                        className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${formData.isCouples === o.val
                            ? "border-[#6f1d56] bg-purple-50/60"
                            : "border-gray-200 hover:border-purple-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="isCouples"
                          checked={formData.isCouples === o.val}
                          onChange={() => handleInputChange("isCouples", o.val)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${formData.isCouples === o.val
                                ? "border-[#6f1d56] bg-[#6f1d56]"
                                : "border-gray-300"
                              }`}
                          >
                            {formData.isCouples === o.val && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <o.icon className="w-4 h-4 text-[#6f1d56]" />
                              <p className="font-bold text-gray-900 text-base">{o.label}</p>
                            </div>
                            <p className="text-xs text-gray-500">{o.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 2: Personal Information ═══════════════ */}
            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-6">
                <div className="text-center mb-6">
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Client Information Sheet
                  </h2>
                  <p
                    className="text-lg md:text-xl"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    By completing this form, you (client) are giving permission
                    for your information to be shared within{" "}
                    {branding.company_name ||
                      process.env.NEXT_PUBLIC_APP_NAME ||
                      "Vanquish Therapies"}{" "}
                    for the purpose of matching you with the appropriate
                    Counsellor, for appointment scheduling, and in the event of
                    an emergency. If you are submitting this form on behalf of
                    another person, please provide your own contact details so
                    we can reach you; this can be done in the referral section
                    below. By signing this form, you are verifying that you have
                    obtained the client's consent to disclose their personal
                    information to us.
                  </p>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 md:p-5">
                  <p className="text-lg md:text-xl text-red-900 font-bold mb-3">
                    Consent for Information Sharing
                  </p>
                  <p className="text-lg md:text-xl text-red-800 leading-relaxed">
                    Please be advised that all required fields must be completed
                    in the form. Failure to do so may result in an error.
                    Therefore, it is crucial that you carefully review the form
                    and provide accurate and complete information to avoid any
                    issues. For any fields that do not apply to you, please
                    enter "N/A."
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Smith"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="john.smith@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Tel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="+44 7700 900000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Your Complete Current Address of Residence Including
                      Postcode &amp; City (required for safeguarding and insurance
                      purposes){formData.isCouples ? " — shared address or primary address" : ""} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="street"
                      id="street"
                      value={formData.street}
                      onChange={(e) =>
                        handleInputChange("street", e.target.value)
                      }
                      rows="3"
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.street ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Please enter your full address here..."
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.street}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label
                        className="block text-lg font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Your Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        id="age"
                        min="18"
                        max="99"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.age ? "border-red-500" : "border-gray-300"
                          }`}
                        placeholder="e.g., 25"
                      />
                      {errors.age && (
                        <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-lg font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Is it okay for us to leave you a voicemail?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="voicemailOk"
                        id="voicemailOk"
                        value={formData.voicemailOk}
                        onChange={(e) =>
                          handleInputChange("voicemailOk", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.voicemailOk
                            ? "border-red-500"
                            : "border-gray-300"
                          }`}
                      >
                        <option value="">Please Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errors.voicemailOk && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.voicemailOk}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Are you currently receiving counselling or therapy anywhere
                      else? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currentlyInTherapy"
                      id="currentlyInTherapy"
                      value={formData.currentlyInTherapy}
                      onChange={(e) =>
                        handleInputChange("currentlyInTherapy", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.currentlyInTherapy
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    >
                      <option value="">Please Select</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    {errors.currentlyInTherapy && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.currentlyInTherapy}
                      </p>
                    )}
                  </div>

                  {/* Couples Partner Details */}
                  {formData.isCouples && (
                    <div className="border-t border-purple-200 pt-6 mt-6">
                      <h4 className="text-xl font-bold text-[#6f1d56] mb-4">
                        Partner / Co-Client Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Partner's First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.partnerFirstName}
                            onChange={(e) => handleInputChange("partnerFirstName", e.target.value)}
                            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerFirstName ? "border-red-500" : "border-gray-300"
                              }`}
                            placeholder="Jane"
                          />
                          {errors.partnerFirstName && <p className="text-red-500 text-sm mt-1">{errors.partnerFirstName}</p>}
                        </div>
                        <div>
                          <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Partner's Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.partnerLastName}
                            onChange={(e) => handleInputChange("partnerLastName", e.target.value)}
                            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerLastName ? "border-red-500" : "border-gray-300"
                              }`}
                            placeholder="Smith"
                          />
                          {errors.partnerLastName && <p className="text-red-500 text-sm mt-1">{errors.partnerLastName}</p>}
                        </div>
                        <div>
                          <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Partner's Age <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="18"
                            max="99"
                            value={formData.partnerAge}
                            onChange={(e) => handleInputChange("partnerAge", e.target.value)}
                            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerAge ? "border-red-500" : "border-gray-300"
                              }`}
                            placeholder="e.g. 28"
                          />
                          {errors.partnerAge && <p className="text-red-500 text-sm mt-1">{errors.partnerAge}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 3: Demographics (About You) ═══════════════ */}
            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    About You
                  </h2>
                  <p
                    className="text-base md:text-lg text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    This information helps us match you with the right counsellor.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      id="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.gender ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Please Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Ethnicity <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ethnicity"
                      id="ethnicity"
                      value={formData.ethnicity}
                      onChange={(e) =>
                        handleInputChange("ethnicity", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.ethnicity ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Please Select</option>
                      <option value="Asian / Asian British">
                        Asian / Asian British
                      </option>
                      <option value="Black / African / Caribbean / Black British">
                        Black / African / Caribbean / Black British
                      </option>
                      <option value="Mixed / Multiple ethnic groups">
                        Mixed / Multiple ethnic groups
                      </option>
                      <option value="White">White</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.ethnicity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.ethnicity}
                      </p>
                    )}
                  </div>

                  {formData.ethnicity === "Other" && (
                    <div>
                      <label
                        className="block text-lg font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Please specify ethnicity
                      </label>
                      <input
                        type="text"
                        name="otherEthnicity"
                        id="otherEthnicity"
                        value={formData.otherEthnicity}
                        onChange={(e) =>
                          handleInputChange("otherEthnicity", e.target.value)
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        placeholder="Please specify"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Sexual Orientation <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sexualOrientation"
                      id="sexualOrientation"
                      value={formData.sexualOrientation}
                      onChange={(e) =>
                        handleInputChange("sexualOrientation", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.sexualOrientation
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    >
                      <option value="">Please Select</option>
                      <option value="Heterosexual / Straight">
                        Heterosexual / Straight
                      </option>
                      <option value="Gay">Gay</option>
                      <option value="Lesbian">Lesbian</option>
                      <option value="Bisexual">Bisexual</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                    {errors.sexualOrientation && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.sexualOrientation}
                      </p>
                    )}
                  </div>

                  {formData.sexualOrientation === "Other" && (
                    <div>
                      <label
                        className="block text-lg font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Please specify sexual orientation
                      </label>
                      <input
                        type="text"
                        name="otherSexualOrientation"
                        id="otherSexualOrientation"
                        value={formData.otherSexualOrientation}
                        onChange={(e) =>
                          handleInputChange(
                            "otherSexualOrientation",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        placeholder="Please specify"
                      />
                    </div>
                  )}

                  {/* Partner Demographics for Couples */}
                  {formData.isCouples && (
                    <div className="border-t border-purple-200 pt-6 mt-6 space-y-4 md:space-y-6">
                      <h4 className="text-xl font-bold text-[#6f1d56]">
                        Partner's Demographics
                      </h4>
                      <div>
                        <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                          Partner's Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.partnerGender}
                          onChange={(e) => handleInputChange("partnerGender", e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerGender ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          <option value="">Please Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.partnerGender && <p className="text-red-500 text-sm mt-1">{errors.partnerGender}</p>}
                      </div>

                      <div>
                        <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                          Partner's Ethnicity <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.partnerEthnicity}
                          onChange={(e) => handleInputChange("partnerEthnicity", e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerEthnicity ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          <option value="">Please Select</option>
                          <option value="Asian / Asian British">Asian / Asian British</option>
                          <option value="Black / African / Caribbean / Black British">Black / African / Caribbean / Black British</option>
                          <option value="Mixed / Multiple ethnic groups">Mixed / Multiple ethnic groups</option>
                          <option value="White">White</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.partnerEthnicity && <p className="text-red-500 text-sm mt-1">{errors.partnerEthnicity}</p>}
                      </div>

                      <div>
                        <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                          Partner's Sexual Orientation <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.partnerSexualOrientation}
                          onChange={(e) => handleInputChange("partnerSexualOrientation", e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerSexualOrientation ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          <option value="">Please Select</option>
                          <option value="Heterosexual / Straight">Heterosexual / Straight</option>
                          <option value="Gay">Gay</option>
                          <option value="Lesbian">Lesbian</option>
                          <option value="Bisexual">Bisexual</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        {errors.partnerSexualOrientation && <p className="text-red-500 text-sm mt-1">{errors.partnerSexualOrientation}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-base text-purple-900">
                    <strong>Why we ask:</strong> This information helps us match
                    you with a counsellor who understands your background and
                    experiences.
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 4: Medical & Service ═══════════════ */}
            {currentStep === 4 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Service Information
                  </h2>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Are you currently on any medication?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="onMedication"
                      id="onMedication"
                      value={formData.onMedication}
                      onChange={(e) =>
                        handleInputChange("onMedication", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.onMedication
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    >
                      <option value="">Please select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.onMedication && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.onMedication}
                      </p>
                    )}
                  </div>

                  {formData.onMedication === "Yes" && (
                    <div>
                      <label
                        className="block text-lg font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Please mention your medication and what it is
                        prescribed for <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="medicationDetails"
                        id="medicationDetails"
                        value={formData.medicationDetails}
                        onChange={(e) =>
                          handleInputChange(
                            "medicationDetails",
                            e.target.value
                          )
                        }
                        rows="3"
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.medicationDetails
                            ? "border-red-500"
                            : "border-gray-300"
                          }`}
                        placeholder="Please list your medications and conditions..."
                      />
                      {errors.medicationDetails && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.medicationDetails}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Do you have any disabilities/impairments? If so, please
                      specify <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="disabilities"
                      id="disabilities"
                      value={formData.disabilities}
                      onChange={(e) =>
                        handleInputChange("disabilities", e.target.value)
                      }
                      rows="3"
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.disabilities
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="Please describe any disabilities or impairments, or enter 'N/A' if none"
                    />
                    {errors.disabilities && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.disabilities}
                      </p>
                    )}
                  </div>

                  {/* Partner Medical for Couples */}
                  {formData.isCouples && (
                    <div className="border-t border-purple-200 pt-6 mt-6 space-y-4 md:space-y-6">
                      <h4 className="text-xl font-bold text-[#6f1d56]">
                        Partner's Medical &amp; Accessibility Details
                      </h4>
                      <div>
                        <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                          Is your partner currently on any medication? <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.partnerOnMedication}
                          onChange={(e) => handleInputChange("partnerOnMedication", e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerOnMedication ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          <option value="">Please select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {errors.partnerOnMedication && <p className="text-red-500 text-sm mt-1">{errors.partnerOnMedication}</p>}
                      </div>

                      {formData.partnerOnMedication === "Yes" && (
                        <div>
                          <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Partner's Medication Details <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={formData.partnerMedicationDetails}
                            onChange={(e) => handleInputChange("partnerMedicationDetails", e.target.value)}
                            rows="3"
                            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerMedicationDetails ? "border-red-500" : "border-gray-300"
                              }`}
                            placeholder="Please list partner's medications..."
                          />
                          {errors.partnerMedicationDetails && <p className="text-red-500 text-sm mt-1">{errors.partnerMedicationDetails}</p>}
                        </div>
                      )}

                      <div>
                        <label className="block text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                          Does your partner have any physical disabilities or accessibility requirements? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.partnerDisabilities}
                          onChange={(e) => handleInputChange("partnerDisabilities", e.target.value)}
                          rows="3"
                          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.partnerDisabilities ? "border-red-500" : "border-gray-300"
                            }`}
                          placeholder="Enter 'N/A' if none..."
                        />
                        {errors.partnerDisabilities && <p className="text-red-500 text-sm mt-1">{errors.partnerDisabilities}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 5: Support Areas (Concerns) ═══════════════ */}
            {currentStep === 5 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Areas You Require Support With
                  </h2>
                </div>

                <div>
                  <label
                    className="block text-lg font-medium mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    We have listed a few areas below you may require support
                    with. <span className="text-red-500">*</span>
                    <span
                      className="text-sm font-normal ml-2"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      (Select all that apply)
                    </span>
                  </label>
                </div>

                <div data-field="supportAreas">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {supportAreasList.map((area) => (
                      <label
                        key={area}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.supportAreas.includes(area)
                            ? "bg-purple-50 border-[#6f1d56]"
                            : "border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.supportAreas.includes(area)}
                          onChange={() => handleSupportAreaToggle(area)}
                          className="w-4 h-4 text-[#6f1d56] rounded focus:ring-[#6f1d56]"
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {area}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.supportAreas && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.supportAreas}
                    </p>
                  )}
                </div>

                <div className="space-y-4 md:space-y-6 mt-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Please use this box to specify and describe details
                      related to the selected areas, or mention anything else
                      not listed. <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="concernsDetails"
                      id="concernsDetails"
                      value={formData.concernsDetails}
                      onChange={(e) =>
                        handleInputChange("concernsDetails", e.target.value)
                      }
                      rows="4"
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.concernsDetails
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="Please describe what brings you to therapy and what you hope to achieve..."
                    />
                    <p
                      className="text-sm font-medium mt-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      For example - Family &amp; Relationship Issues: A &amp; I have
                      been arguing frequently over how to manage our finances.
                      The disagreement is causing tension in our relationship
                      and affecting our family's overall well-being.
                    </p>
                    {errors.concernsDetails && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.concernsDetails}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Please provide details of any identified risk issues or
                      substance misuse
                    </label>
                    <textarea
                      name="riskIssues"
                      id="riskIssues"
                      value={formData.riskIssues}
                      onChange={(e) =>
                        handleInputChange("riskIssues", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Please describe any risk factors we should be aware of, or enter 'N/A' if none"
                    />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-base text-red-900 font-medium mb-1">
                    Crisis Support
                  </p>
                  <p className="text-base text-red-800">
                    {branding.company_name ||
                      process.env.NEXT_PUBLIC_APP_NAME ||
                      "Vanquish Therapies"}{" "}
                    is not a crisis or emergency service. If you need immediate
                    help, please contact your GP, NHS (111), or the Samaritans
                    (116 123).
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 6: Availability ═══════════════ */}
            {currentStep === 6 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Your Availability To Attend Weekly Sessions
                  </h2>
                  <p
                    className="text-base md:text-lg text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Select all day and time slots when you're available to
                    attend weekly counselling sessions.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-base text-blue-900">
                    <strong>Important:</strong> To avoid any delays - Please
                    select the accurate day and time you are available to
                    attend weekly counselling sessions in UK time, as the
                    practice is based in the UK. Please note - If this
                    information is not provided there can be a delay in matching
                    you with a counsellor. Please note that the last session is at 6pm
                    from Monday to Thursday, and at 5pm on Friday.
                  </p>
                </div>

                <div className="space-y-6">
                  {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
                    (day) => {
                      const slots = day === "friday" ? fridayTimeSlots : timeSlots;
                      return (
                        <div
                          key={day}
                          className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                        >
                          <h3 className="font-bold text-lg text-gray-800 capitalize mb-3">
                            {day}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {slots.map((slot) => {
                              const isChecked =
                                formData.availability[day]?.includes(slot.value);
                              return (
                                <label
                                  key={slot.value}
                                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-colors ${isChecked
                                      ? "bg-[#6f1d56] text-white border-[#6f1d56] font-medium"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      handleAvailabilityToggle(day, slot.value)
                                    }
                                    className="sr-only"
                                  />
                                  <span>{slot.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                  {errors.availability && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.availability}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 7: Preferences ═══════════════ */}
            {currentStep === 7 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Counsellor Preferences
                  </h2>
                  <p
                    className="text-base md:text-lg text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    These preferences are optional and help us find the best
                    match for you.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-base text-purple-900">
                    <strong>Note:</strong> All preferences are optional. Select
                    "No preference" if you don't have specific requirements.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Gender Preference
                    </label>
                    <select
                      name="genderPreference"
                      id="genderPreference"
                      value={formData.genderPreference}
                      onChange={(e) =>
                        handleInputChange("genderPreference", e.target.value)
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Age Preference
                    </label>
                    <select
                      name="agePreference"
                      id="agePreference"
                      value={formData.agePreference}
                      onChange={(e) =>
                        handleInputChange("agePreference", e.target.value)
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="20-30">20 - 30</option>
                      <option value="30-40">30 - 40</option>
                      <option value="40-50">40 - 50</option>
                      <option value="50+">50+</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Ethnicity Preference
                    </label>
                    <select
                      name="ethnicityPreference"
                      id="ethnicityPreference"
                      value={formData.ethnicityPreference}
                      onChange={(e) =>
                        handleInputChange(
                          "ethnicityPreference",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="Asian / Asian British">
                        Asian / Asian British
                      </option>
                      <option value="Black / African / Caribbean / Black British">
                        Black / African / Caribbean / Black British
                      </option>
                      <option value="Mixed / Multiple ethnic groups">
                        Mixed / Multiple ethnic groups
                      </option>
                      <option value="White">White</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Sexual Orientation Preference
                    </label>
                    <select
                      name="orientationPreference"
                      id="orientationPreference"
                      value={formData.orientationPreference}
                      onChange={(e) =>
                        handleInputChange(
                          "orientationPreference",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="Heterosexual / Straight">
                        Heterosexual / Straight
                      </option>
                      <option value="LGBTQ+">LGBTQ+</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 8: Referral ═══════════════ */}
            {currentStep === 8 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Referral Information - (For any fields that do not apply to
                    you, please enter "N/A.")
                  </h2>
                  <p
                    className="text-base md:text-lg text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Help us understand how you found us.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      How did you hear about us?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="hearAboutUs"
                      id="hearAboutUs"
                      value={formData.hearAboutUs}
                      onChange={(e) =>
                        handleInputChange("hearAboutUs", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.hearAboutUs
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    >
                      <option value="">Please Select</option>
                      <option value="Google">Google / Web Search</option>
                      <option value="Social Media">Social Media (Instagram, Facebook, etc.)</option>
                      <option value="Friend/Family">Friend or Family Recommendation</option>
                      <option value="Referral">Professional / Agency Referral</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.hearAboutUs && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.hearAboutUs}
                      </p>
                    )}
                  </div>

                  {formData.hearAboutUs === "Referral" && (
                    <div className="border border-purple-200 rounded-xl p-4 bg-purple-50 space-y-4">
                      <h3 className="font-bold text-[#6f1d56]">
                        Referrer Details
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Referrer's Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.referrerName}
                          onChange={(e) =>
                            handleInputChange("referrerName", e.target.value)
                          }
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-white"
                          placeholder="Dr. Jane Doe"
                        />
                        {errors.referrerName && (
                          <p className="text-red-500 text-xs mt-1">{errors.referrerName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Referrer's Organisation / Practice
                        </label>
                        <input
                          type="text"
                          value={formData.referrerOrg}
                          onChange={(e) =>
                            handleInputChange("referrerOrg", e.target.value)
                          }
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-white"
                          placeholder="NHS / Clinic Name"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Referrer's Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.referrerPhone}
                            onChange={(e) =>
                              handleInputChange("referrerPhone", e.target.value)
                            }
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-white"
                            placeholder="+44 7700 900000"
                          />
                          {errors.referrerPhone && (
                            <p className="text-red-500 text-xs mt-1">{errors.referrerPhone}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Referrer's Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.referrerEmail}
                            onChange={(e) =>
                              handleInputChange("referrerEmail", e.target.value)
                            }
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-white"
                            placeholder="referrer@example.com"
                          />
                          {errors.referrerEmail && (
                            <p className="text-red-500 text-xs mt-1">{errors.referrerEmail}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Reasons for Referral <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.referralReason}
                          onChange={(e) =>
                            handleInputChange("referralReason", e.target.value)
                          }
                          rows="3"
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-white"
                          placeholder="Please explain reason for referral..."
                        />
                        {errors.referralReason && (
                          <p className="text-red-500 text-xs mt-1">{errors.referralReason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 9: Assessment (CORE-34) ═══════════════ */}
            {currentStep === 9 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Assessment (CORE 34)
                  </h2>
                  <div className="text-base md:text-lg mb-4 p-6 bg-red-50 border-2 border-red-300 rounded-xl space-y-3">
                    <p className="font-bold text-red-900 text-lg uppercase tracking-wide">
                      Important - Please read this information before you start
                      completing the below section:
                    </p>
                    <p className="text-red-800 font-medium">
                      This section has 34 statements about how you have been
                      over the last week.
                    </p>
                    <p className="text-red-800">
                      Please ensure you read each statement and think about how
                      often you have felt that way over the last week. Then tick
                      the box that relates closest to how you have felt.
                    </p>
                    <p className="text-red-600 text-xs italic mt-2 border-t border-red-300 pt-2">
                      This core 34 has been taken from The CORE System
                      Trust:http://www.coresystemtrust.org.uk/copyright.pdf
                    </p>
                  </div>
                  <p
                    className="font-bold text-lg mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    How you have been or felt over the last week?*
                  </p>
                </div>

                {errors.core34 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600 font-medium">{errors.core34}</p>
                  </div>
                )}

                {/* Desktop Table View */}
                <div
                  className="hidden md:block overflow-x-auto rounded-lg border border-gray-200"
                  id="core34"
                >
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-left font-semibold text-gray-700 w-1/3 sticky left-0 bg-gray-50 z-10">
                          Question
                        </th>
                        {core34Options.map((option) => (
                          <th
                            key={option}
                            className="p-4 text-center font-semibold text-gray-700 text-base w-[13%]"
                          >
                            {option}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {core34Questions.map((question, index) => (
                        <tr
                          key={index}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            } ${errors.core34 &&
                            !formData.core34[index] &&
                            "bg-red-50"
                            }`}
                        >
                          <td className="p-4 text-gray-800 font-medium sticky left-0 bg-inherit z-10 border-r border-gray-100">
                            {index + 1}. {question}
                            {errors.core34 && !formData.core34[index] && (
                              <span className="text-red-500 ml-2 text-sm">
                                *Required
                              </span>
                            )}
                          </td>
                          {core34Options.map((option, optIndex) => (
                            <td key={optIndex} className="p-4 text-center">
                              <label className="flex items-center justify-center w-full h-full cursor-pointer">
                                <input
                                  type="radio"
                                  name={`core34_q${index}`}
                                  value={option}
                                  checked={formData.core34[index] === option}
                                  onChange={() =>
                                    handleCore34Change(index, option)
                                  }
                                  className="w-5 h-5 cursor-pointer accent-[#6f1d56]"
                                />
                                <span className="sr-only">{option}</span>
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View - Cards for small screens */}
                <div className="md:hidden space-y-6 mt-6">
                  {core34Questions.map((question, index) => (
                    <div
                      key={`mobile-${index}`}
                      className={`border rounded-lg p-4 ${errors.core34 && !formData.core34[index]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                        }`}
                    >
                      <p className="font-medium mb-3 text-gray-900">
                        {index + 1}. {question}
                      </p>
                      <div className="space-y-2">
                        {core34Options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50/50 cursor-pointer border border-gray-200"
                          >
                            <input
                              type="radio"
                              name={`mobile_core34_q${index}`}
                              value={option}
                              checked={formData.core34[index] === option}
                              onChange={() => handleCore34Change(index, option)}
                              className="w-5 h-5 accent-[#6f1d56]"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-purple-50 border-2 border-purple-200 rounded-xl text-center">
                  <p className="text-lg font-bold text-purple-900">
                    Thank you for answering all of the above statements, please proceed with booking your consultation on the next page.
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 10: Consultation Slot ═══════════════ */}
            {currentStep === 10 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Select a Consultation Slot (UK time)
                  </h2>
                  <p
                    className="text-base md:text-lg text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Please choose an available slot for your initial
                    consultation.
                  </p>
                </div>

                {isSlotsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6f1d56]"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-base text-yellow-800">
                      There are currently no available consultation slots.
                      Please check back later or contact us directly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {errors.consultationSlotId && (
                      <p className="text-red-500 text-sm font-medium">
                        {errors.consultationSlotId}
                      </p>
                    )}

                    {/* Calendar & Slots Split View */}
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left Side: Calendar */}
                      <div className="w-full lg:w-1/2 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800">
                            {currentMonth.toLocaleString("default", {
                              month: "long",
                              year: "numeric",
                            })}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth() - 1,
                                    1
                                  )
                                )
                              }
                              className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth() + 1,
                                    1
                                  )
                                )
                              }
                              className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                          <div>MON</div>
                          <div>TUE</div>
                          <div>WED</div>
                          <div>THU</div>
                          <div>FRI</div>
                          <div>SAT</div>
                          <div>SUN</div>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const year = currentMonth.getFullYear();
                            const month = currentMonth.getMonth();
                            const firstDayOfMonth = new Date(
                              year,
                              month,
                              1
                            ).getDay();
                            const daysInMonth = new Date(
                              year,
                              month + 1,
                              0
                            ).getDate();
                            const startingDay =
                              firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

                            const uniqueSlots = [];
                            const slotTimes = new Set();

                            availableSlots.forEach((slot) => {
                              if (!slotTimes.has(slot.consultation_datetime)) {
                                slotTimes.add(slot.consultation_datetime);
                                uniqueSlots.push(slot);
                              }
                            });

                            const groupedSlots = {};
                            uniqueSlots.forEach((slot) => {
                              const slotDate = new Date(
                                slot.consultation_datetime
                              );
                              const dateStr = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, "0")}-${String(slotDate.getDate()).padStart(2, "0")}`;
                              if (!groupedSlots[dateStr])
                                groupedSlots[dateStr] = [];
                              groupedSlots[dateStr].push(slot);
                            });

                            const cells = [];
                            for (let i = 0; i < startingDay; i++) {
                              cells.push(
                                <div key={`empty-${i}`} className="p-2"></div>
                              );
                            }
                            for (let d = 1; d <= daysInMonth; d++) {
                              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                              const hasSlots =
                                groupedSlots[dateStr] &&
                                groupedSlots[dateStr].length > 0;
                              const isSelected =
                                selectedCalendarDate === dateStr;

                              cells.push(
                                <button
                                  key={`day-${d}`}
                                  type="button"
                                  onClick={() =>
                                    hasSlots && setSelectedCalendarDate(dateStr)
                                  }
                                  disabled={!hasSlots}
                                  className={`p-2 w-full aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${isSelected
                                      ? "bg-[#4052f5] text-white font-bold shadow-md"
                                      : hasSlots
                                        ? "bg-blue-50 text-blue-900 border border-blue-100 hover:bg-blue-100 font-semibold cursor-pointer"
                                        : "text-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                  {d}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                          <Lock className="w-4 h-4" />
                          Timezone: Europe/London (
                          {new Date().toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Europe/London",
                          })}
                          )
                        </div>
                      </div>

                      {/* Right Side: Available Slots */}
                      <div className="w-full lg:w-1/2">
                        {selectedCalendarDate ? (
                          <div>
                            <h3 className="text-lg font-bold text-[#6f1d56] mb-4">
                              {new Date(
                                selectedCalendarDate
                              ).toLocaleDateString("en-GB", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </h3>

                            {(() => {
                              const seenTimes = new Set();
                              const dateSlots = availableSlots.filter((s) => {
                                const sd = new Date(s.consultation_datetime);
                                const dateStr = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, "0")}-${String(sd.getDate()).padStart(2, "0")}`;
                                if (dateStr !== selectedCalendarDate)
                                  return false;

                                const timeKey = sd.getTime();
                                if (seenTimes.has(timeKey)) return false;
                                seenTimes.add(timeKey);
                                return true;
                              });

                              return (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                  {dateSlots.map((slot) => {
                                    const d = new Date(
                                      slot.consultation_datetime
                                    );
                                    const endD = new Date(
                                      d.getTime() + 15 * 60 * 1000
                                    );
                                    const timeFormat = {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    };
                                    const timeStr = `${d.toLocaleTimeString("en-GB", timeFormat)} - ${endD.toLocaleTimeString("en-GB", timeFormat)}`;
                                    return (
                                      <label
                                        key={slot.id}
                                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors w-full text-center ${formData.consultationSlotId === slot.id
                                            ? "border-[#4052f5] bg-[#4052f5] text-white font-bold"
                                            : "border-[#4052f5] text-[#4052f5] hover:bg-blue-50"
                                          }`}
                                      >
                                        <input
                                          type="radio"
                                          name="consultationSlotId"
                                          value={slot.id}
                                          checked={
                                            formData.consultationSlotId ===
                                            slot.id
                                          }
                                          onChange={() =>
                                            handleInputChange(
                                              "consultationSlotId",
                                              slot.id
                                            )
                                          }
                                          className="hidden"
                                        />
                                        {timeStr} (UK time)
                                      </label>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 border border-dashed rounded-lg text-gray-500">
                            <Calendar className="w-12 h-12 mb-2 opacity-50 text-[#6f1d56]" />
                            <p>
                              Please select an available date from the calendar
                              to view time slots.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════ STEP 11: Emergency Contact ═══════════════ */}
            {currentStep === 11 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Emergency Contact Details
                  </h2>
                  <p
                    className="text-base md:text-lg text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    As the sessions are online, this information is required
                    for safeguarding and insurance purposes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Emergency Contact Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.emergencyContactName
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="Jane Doe"
                    />
                    {errors.emergencyContactName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.emergencyContactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Phone Number of Emergency Contact{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.emergencyContactPhone
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="+44 7700 900000"
                    />
                    {errors.emergencyContactPhone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.emergencyContactPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Emergency Contact Email
                    </label>
                    <input
                      type="email"
                      name="emergencyContactEmail"
                      id="emergencyContactEmail"
                      value={formData.emergencyContactEmail}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactEmail",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.emergencyContactEmail
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="jane.doe@example.com"
                    />
                    {errors.emergencyContactEmail && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.emergencyContactEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Relationship to You{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      id="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactRelationship",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${errors.emergencyContactRelationship
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="e.g. Partner, Parent, Friend"
                    />
                    {errors.emergencyContactRelationship && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.emergencyContactRelationship}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 12: Payment & Terms ═══════════════ */}
            {currentStep === 12 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4 text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Consultation Payment &amp; Acknowledgement
                  </h2>
                  <p
                    className="text-base md:text-lg text-center mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Our consultation/assessment and admin fee is £{baseFee.toFixed(2)}. This small
                    fee helps us ensure that those embarking on their
                    therapeutic journey are truly committed to their well-being.
                    Please Note: This consultation/admin fee is non-refundable
                    as it covers the processing of your consultation regardless
                    of attendance. Additionally, our consultation slots are
                    limited, and once you book a slot, it is reserved just for
                    you, making it unavailable to others. We appreciate your
                    understanding and we are here to support you every step of
                    the way.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-700">
                      Initial Consultation Fee ({formData.serviceType}):
                    </span>
                    <span className="text-2xl font-bold text-[#6f1d56]">
                      £{getConsultationFee().toFixed(2)}
                    </span>
                  </div>

                  {/* Coupon Code Input */}
                  <div className="mt-4 pt-4 border-t border-purple-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Have a coupon or discount code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.discountCode}
                        onChange={(e) =>
                          handleInputChange("discountCode", e.target.value)
                        }
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="px-4 py-2 bg-[#6f1d56] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions Agreement */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) =>
                        handleInputChange("termsAccepted", e.target.checked)
                      }
                      className="w-5 h-5 mt-0.5 text-[#6f1d56] rounded focus:ring-[#6f1d56]"
                    />
                    <span className="text-sm text-gray-700">
                      I confirm that the information provided is accurate, and I agree to the{" "}
                      <Link
                        href="/agreement/mid-range"
                        target="_blank"
                        className="text-[#6f1d56] underline font-medium"
                      >
                        Client Agreement &amp; Privacy Terms
                      </Link>
                      . <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.termsAccepted}
                    </p>
                  )}

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <p className="text-base font-bold mb-4" style={{ color: "#6f1d56" }}>
                      Thank you for completing this form and for taking the first step towards healing.
                    </p>
                    <p className="text-sm mb-4" style={{ color: "var(--text-primary)" }}>
                      We understand that starting counselling can feel daunting but please know, Vanquish Therapies is here to support you on your journey, and we are committed to providing a supportive environment for you.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <p className="text-sm font-bold text-red-600 mb-2">
                        IMPORTANT NOTICE:
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                        Please note – Vanquish Therapies and our online counselling are not a crisis or emergency service. If you need to speak to someone immediately, please contact your GP, NHS (111), or the Samaritans (116 123).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded mt-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lg font-medium text-red-900 mb-1">
                      Please complete all required fields before proceeding:
                    </p>
                    <ul className="text-base text-red-800 list-disc list-inside space-y-1">
                      {Object.values(errors)
                        .slice(0, 5)
                        .map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      {Object.keys(errors).length > 5 && (
                        <li>...and {Object.keys(errors).length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div>
              <div
                className="flex items-center justify-between mt-8 md:mt-10 pt-6 border-t"
                style={{ borderColor: "var(--border-color)" }}
              >
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-base md:text-lg ${currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">Previous</span>
                  <span className="md:hidden">Back</span>
                </button>

                <div
                  className="text-sm font-medium md:hidden"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {currentStep}/{steps.length}
                </div>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium transition-opacity text-base md:text-lg hover:opacity-90"
                    style={{ backgroundColor: "#6f1d56" }}
                  >
                    <span className="hidden md:inline">Next</span>
                    <span className="md:hidden">Next</span>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                ) : !clientId ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!formData.termsAccepted || isSubmitting}
                    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium transition-opacity text-base md:text-lg ${!formData.termsAccepted || isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:opacity-90"
                      }`}
                    style={{ backgroundColor: "#6f1d56" }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                    <span className="hidden md:inline">
                      {isSubmitting ? "Processing..." : "Save & Continue to Payment"}
                    </span>
                    <span className="md:hidden">
                      {isSubmitting ? "Processing..." : "Save"}
                    </span>
                  </button>
                ) : null}
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Protected by 256-bit SSL encryption &bull; Confidentiality guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentProps && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
              <div
                className="p-6 border-b border-gray-100 flex justify-between items-center"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Secure Payment
                  </h3>
                  <p
                    className="text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Consultation Fee
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setClientId(null);
                  }}
                  className="hover:transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  title="Cancel payment"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--border-color)" }}
                  >
                    <span className="text-xl font-bold">&times;</span>
                  </div>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 bg-purple-50 rounded-xl p-4 border border-purple-100 flex justify-between items-center">
                  <span className="text-purple-900 font-medium">
                    Total to Pay
                  </span>
                  <span className="text-2xl font-bold text-purple-900">
                    £{paymentProps.amount.toFixed(2)}
                  </span>
                </div>

                {paymentProps.couponCode && (
                  <div className="mb-6 bg-green-50 rounded-lg p-3 border border-green-100 text-green-800 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Coupon <strong>{paymentProps.couponCode}</strong> applied
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  <StripePaymentWrapper
                    clientId={paymentProps.clientId}
                    amount={paymentProps.amount}
                    paymentType="consultation"
                    couponCode={paymentProps.couponCode}
                    returnUrl={paymentProps.returnUrl}
                    onSuccess={() => {
                      paymentProps.onSuccess();
                      setShowPaymentModal(false);
                    }}
                    onError={paymentProps.onError}
                    onCancel={() => setShowPaymentModal(false)}
                  />
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors text-center"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicFormWrapper>
  );
}

export default function MidRangeClientIntake() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-[#6f1d56] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MidRangeClientIntakeContent />
    </Suspense>
  );
}
