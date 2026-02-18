"use client";
import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { StripePaymentWrapper } from "@/components/StripePayment";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import { toast } from "react-toastify";

export default function IshClientIntake() {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    voicemailOk: "",
    currentlyInTherapy: "",

    // Demographics
    gender: "",
    ethnicity: "",
    sexualOrientation: "",

    // Medical & Service
    serviceType: "Ish",
    onMedication: "",
    medicationDetails: "",
    disabilities: "",

    // Concerns
    supportAreas: [],
    concernsDetails: "",
    riskIssues: "",

    // Availability - Detailed time slots
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },

    // Preferences
    genderPreference: "No preference",
    agePreference: "No preference",
    ethnicityPreference: "No preference",
    orientationPreference: "No preference",

    // Referral
    hearAboutUs: "",
    referralReason: "",
    referrerName: "",
    referrerPhone: "",
    referrerOrg: "",
    referrerEmail: "",

    // Payment
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    discountCode: "",
    termsAccepted: false,

    // Core 34 Assessment
    core34: {},
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [ishCapacityFull, setIshCapacityFull] = useState(false);
  const [ishCapacityData, setIshCapacityData] = useState({
    message: null,
    alternative_url: null,
  });
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [errors, setErrors] = useState({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProps, setPaymentProps] = useState(null);
  const formContentRef = useRef(null);

  // Calculate consultation fee based on service type - Always Ish for this page
  const getConsultationFee = () => {
    let baseFee = 25.0;
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
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/coupons/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Invalid discount code");
      }

      const coupon = await response.json();

      // Calculate discount
      let newDiscountAmount = 0;
      const baseFee = getConsultationFee() + discountAmount; // Get original fee (add back current discount)

      if (coupon.type === "fixed") {
        newDiscountAmount = parseFloat(coupon.value);
      } else {
        newDiscountAmount = (baseFee * parseFloat(coupon.value)) / 100;
      }

      setDiscountAmount(newDiscountAmount);
      setIsDiscountApplied(true);

      toast.success(
        `Discount code applied! You saved £${newDiscountAmount.toFixed(2)}`,
      );
    } catch (error) {
      toast.error(error.message || "Invalid discount code");
      setDiscountAmount(0);
      setIsDiscountApplied(false);
    }
  };

  // Check capacity status for Ish
  useEffect(() => {
    fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      }/services/ish-capacity`,
    )
      .then((res) => res.json())
      .then((data) => {
        setIshCapacityFull(data.capacity_full || false);
        setIshCapacityData({
          message:
            data.message ||
            "This service is at capacity at this time. If you would like to work with Ish, you can click here to proceed with our Partner service VQT COACHING & THERAPY",
          alternative_url:
            data.alternative_url ||
            "https://pci.jotform.com/form/243161740962456",
        });
      })
      .catch(() => {
        // Default to available if check fails
        setIshCapacityFull(false);
        setIshCapacityData({
          message:
            "This service is at capacity at this time. If you would like to work with Ish, you can click here to proceed with our Partner service VQT COACHING & THERAPY",
          alternative_url: "https://pci.jotform.com/form/243161740962456",
        });
      });
  }, []);

  const supportAreasList = [
    "Communication problems",
    "People pleasing",
    "Loneliness",
    "Discrimination & Racism",
    "Low mood",
    "Stress",
    "Low confidence",
    "Family issues",
    "Fear of intimacy",
    "Personal development",
    "Self-defeating behaviour",
    "Low self-esteem",
    "Relationship problems",
    "High sensitivity",
  ];

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

  // Time slots - 50 minute intervals
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

  // Friday time slots (last slot at 5pm-5:50pm)
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

  // Validation functions for each step
  const validateStep = (step) => {
    const stepErrors = {};

    switch (step) {
      case 1: // Personal Information
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
        if (!formData.age || parseInt(formData.age) < 18)
          stepErrors.age = "Age (18+) is required";
        if (!formData.voicemailOk)
          stepErrors.voicemailOk = "This field is required";
        if (!formData.currentlyInTherapy)
          stepErrors.currentlyInTherapy = "This field is required";
        break;

      case 2: // About You (Demographics)
        if (!formData.gender) stepErrors.gender = "Gender is required";
        if (!formData.ethnicity) stepErrors.ethnicity = "Ethnicity is required";
        if (!formData.sexualOrientation)
          stepErrors.sexualOrientation = "Sexual orientation is required";
        break;

      case 3: // Medical & Service
        if (!formData.serviceType)
          stepErrors.serviceType = "Service type is required";
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
        break;

      case 4: // Concerns
        if (formData.supportAreas.length === 0)
          stepErrors.supportAreas = "Please select at least one support area";
        if (!formData.concernsDetails.trim())
          stepErrors.concernsDetails =
            "Please provide details about your concerns";
        break;

      case 5: // Availability
        const hasAvailability = Object.values(formData.availability).some(
          (day) => day.length > 0,
        );
        if (!hasAvailability)
          stepErrors.availability = "Please select at least one time slot";
        break;

      case 6: // Preferences (optional - no validation needed)
        break;

      case 7: // Referral
        if (!formData.hearAboutUs)
          stepErrors.hearAboutUs = "This field is required";
        break;

      case 8: // Assessment (CORE 34)
        if (Object.keys(formData.core34).length < 34) {
          stepErrors.core34 =
            "Please answer all 34 questions before proceeding.";
        }
        break;

      case 9: // Payment
        if (!formData.termsAccepted)
          stepErrors.termsAccepted = "You must accept the terms";
        break;

      default:
        break;
    }

    return stepErrors;
  };

  // Scroll to top of form content when step changes
  useEffect(() => {
    if (formContentRef.current) {
      formContentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentStep]);

  // Handle step navigation
  const handleStepChange = (newStep) => {
    // Allow going back without validation
    if (newStep < currentStep) {
      setCurrentStep(newStep);
      setErrors({});
      return;
    }

    // Validate current step before moving forward
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Scroll to first error after a brief delay
      setTimeout(() => {
        const firstErrorField = Object.keys(stepErrors)[0];
        let errorElement =
          document.querySelector(`[name="${firstErrorField}"]`) ||
          document.querySelector(`#${firstErrorField}`);

        // For checkbox groups and special fields, find the container using data-field
        if (!errorElement) {
          errorElement = document.querySelector(
            `[data-field="${firstErrorField}"]`,
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
          // Fallback: scroll to form content
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

    // Mark current step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setErrors({});
    setCurrentStep(newStep);
  };

  // Handle next button click
  const handleNext = () => {
    handleStepChange(currentStep + 1);
  };

  // Handle previous button click
  const handlePrevious = () => {
    handleStepChange(currentStep - 1);
  };

  // Handle step indicator click
  const handleStepClick = (stepNumber) => {
    // Allow clicking on completed steps or previous steps
    if (completedSteps.has(stepNumber) || stepNumber < currentStep) {
      handleStepChange(stepNumber);
    } else if (stepNumber === currentStep) {
      // Already on this step
      return;
    } else {
      // Try to validate and move forward step by step
      handleStepChange(stepNumber);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
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
    // Clear error when user makes a selection
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
    // Clear error when user makes a selection
    if (errors.availability) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.availability;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    // Validate step 9 before submitting
    const stepErrors = validateStep(9);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (!formData.termsAccepted) {
      return;
    }

    try {
      // First, submit the intake form to create client
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/client-intake`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone || null,
            age: formData.age ? parseInt(formData.age) : null,
            voicemail_ok: formData.voicemailOk === "Yes",
            currently_in_therapy: formData.currentlyInTherapy === "Yes",
            gender: formData.gender || null,
            ethnicity: formData.ethnicity || null,
            sexual_orientation: formData.sexualOrientation || null,
            service_type: formData.serviceType || "Ish",
            on_medication: formData.onMedication === "Yes",
            medication_details: formData.medicationDetails || null,
            disabilities: formData.disabilities || null,
            support_areas: formData.supportAreas || [],
            concerns_details: formData.concernsDetails || null,
            risk_issues: formData.riskIssues || null,
            core34_answers: formData.core34 || {},
            availability: formData.availability || {},
            gender_preference: formData.genderPreference || "No preference",
            age_preference: formData.agePreference || "No preference",
            ethnicity_preference:
              formData.ethnicityPreference || "No preference",
            orientation_preference:
              formData.orientationPreference || "No preference",
            hear_about_us: formData.hearAboutUs || null,
            referral_reason: formData.referralReason || null,
            referrer_name: formData.referrerName || null,
            referrer_phone: formData.referrerPhone || null,
            referrer_org: formData.referrerOrg || null,
            referrer_email: formData.referrerEmail || null,
            terms_accepted: formData.termsAccepted,
            discount_code: isDiscountApplied ? formData.discountCode : null,
            consultation_fee: getConsultationFee(),
            create_client: true,
          }),
        },
      );

      if (!response.ok) {
        let errorMessage = `Failed to submit intake form (Status: ${response.status})`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            if (errorData.errors) {
              const validationErrors = Object.entries(errorData.errors)
                .map(
                  ([field, messages]) =>
                    `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`,
                )
                .join("\n");
              errorMessage = `Validation errors:\n${validationErrors}`;
            } else {
              errorMessage =
                errorData.message || errorData.error || errorMessage;
            }
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      let clientUuid = data.client_uuid;
      let currentClientId =
        data.client_id || (data.form && data.form.client_id);

      const proceedToRedirect = () => {
        const params = new URLSearchParams();
        params.append("email", formData.email);
        params.append("client_uuid", clientUuid);
        if (formData.firstName) {
          params.append("q1", formData.firstName);
          params.append("first_name", formData.firstName);
        }
        if (formData.lastName) {
          params.append("q2", formData.lastName);
          params.append("last_name", formData.lastName);
        }
        params.append("service_type", "Ish");
        params.append("uuid", clientUuid);
        params.append("client_id", clientUuid);

        const jotformUrl = `https://pci.jotform.com/form/253505449240454?${params.toString()}`;
        window.location.href = jotformUrl;
      };

      const fee = getConsultationFee();
      if (fee > 0 && clientUuid && currentClientId) {
        setPaymentProps({
          clientId: currentClientId,
          amount: fee,
          couponCode: isDiscountApplied ? formData.discountCode : null,
          onSuccess: proceedToRedirect,
          onError: (err) =>
            toast.error(`Payment failed: ${err.message || "Please try again"}`),
        });
        setShowPaymentModal(true);
      } else if (clientUuid) {
        proceedToRedirect();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit form.");
    }
  };

  const steps = [
    { number: 1, title: "Personal", icon: User },
    { number: 2, title: "About You", icon: Heart },
    { number: 3, title: "Medical", icon: Briefcase },
    { number: 4, title: "Concerns", icon: MessageCircle },
    { number: 5, title: "Availability", icon: Calendar },
    { number: 6, title: "Preferences", icon: Heart },
    { number: 7, title: "Referral", icon: User },
    { number: 8, title: "Assessment", icon: CheckCircle },
    { number: 9, title: "Payment", icon: CreditCard },
  ];

  if (submitted) {
    return (
      <PublicFormWrapper>
        <div
          className="min-h-screen"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="flex items-center justify-center p-4 min-h-screen">
            <div className="card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border text-primary">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 border-2 border-green-200">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                THANK YOU FOR BOOKING YOUR CONSULTATION.
              </h2>
              <div className="mb-6 text-center text-secondary">
                <p className="mb-4 font-medium">
                  PLEASE REMEMBER TO CHECK YOUR SPAM/JUNK FOLDER.
                </p>
                <p className="mb-4 font-medium">
                  <strong>
                    IF YOU HAVE NOT RECEIVED A CONFIRMATION EMAIL, CONTACT US AT
                    LEAST 48 HOURS BEFORE YOUR CONSULTATION.
                  </strong>
                </p>
              </div>
              <div className="rounded-lg p-4 mb-6 border bg-purple-50 border-purple-100">
                <p className="text-base font-medium">
                  Consultation Fee: £{getConsultationFee().toFixed(2)} Paid
                </p>
                <p className="text-sm mt-1">
                  A confirmation email has been sent to {formData.email}
                </p>
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
          <div className="card rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border bg-white">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  VT
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-primary">
                    Ish's Intake Form
                  </h1>
                  <p className="text-base md:text-lg mt-0.5 md:mt-1 text-secondary">
                    Coaching & Counselling Intake
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Progress */}
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
                          style={{ width: "11.11%" }}
                        >
                          <button
                            type="button"
                            onClick={() => handleStepClick(step.number)}
                            disabled={!isAccessible}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? "text-white ring-2 ring-offset-2"
                                : isCompleted
                                  ? "text-white bg-green-600"
                                  : isAccessible
                                    ? "text-white"
                                    : "bg-gray-200 text-gray-400"
                            }`}
                            style={
                              isCurrent || (isAccessible && !isCompleted)
                                ? { backgroundColor: "#6f1d56" }
                                : {}
                            }
                          >
                            {isCompleted && !isCurrent ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </button>
                          <span
                            className={`text-sm mt-2 text-center ${isCurrent || isCompleted ? "font-medium" : "text-gray-500"}`}
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
                            className={`h-1 flex-1 mx-2 rounded transition-colors ${currentStep > step.number ? "" : "bg-gray-200"}`}
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

          <div
            ref={formContentRef}
            className="bg-white rounded-2xl shadow-sm p-4 md:p-8"
          >
            {currentStep === 1 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="18"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.age ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.age && (
                      <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Voicemail OK? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.voicemailOk}
                      onChange={(e) =>
                        handleInputChange("voicemailOk", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.voicemailOk ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium mb-2 text-primary">
                      Currently in therapy elsewhere?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.currentlyInTherapy}
                      onChange={(e) =>
                        handleInputChange("currentlyInTherapy", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.currentlyInTherapy ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  About You
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.gender ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Ethnicity <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.ethnicity}
                      onChange={(e) =>
                        handleInputChange("ethnicity", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.ethnicity ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select</option>
                      <option value="Asian">Asian</option>
                      <option value="Black">Black</option>
                      <option value="White">White</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-primary">
                      Sexual Orientation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.sexualOrientation}
                      onChange={(e) =>
                        handleInputChange("sexualOrientation", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg ${errors.sexualOrientation ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select</option>
                      <option value="Heterosexual">Heterosexual</option>
                      <option value="Gay">Gay</option>
                      <option value="Lesbian">Lesbian</option>
                      <option value="Bisexual">Bisexual</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Medical & Service
                </h2>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-6">
                  <p className="text-purple-900 font-medium">
                    Selected Service: Ish's Services (Coaching/Counselling)
                  </p>
                </div>

                {ishCapacityFull && (
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-5 mb-6">
                    <p className="text-orange-900 font-bold mb-3">
                      Service at Capacity
                    </p>
                    <p className="text-orange-800 mb-4">
                      {ishCapacityData.message}
                    </p>
                    <a
                      href={ishCapacityData.alternative_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-medium"
                    >
                      Continue with VQT COACHING & THERAPY
                    </a>
                  </div>
                )}

                {!ishCapacityFull && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-medium mb-2 text-primary">
                        On Medication? <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.onMedication}
                        onChange={(e) =>
                          handleInputChange("onMedication", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg ${errors.onMedication ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    {formData.onMedication === "Yes" && (
                      <textarea
                        value={formData.medicationDetails}
                        onChange={(e) =>
                          handleInputChange("medicationDetails", e.target.value)
                        }
                        className="w-full px-4 py-3 border rounded-lg"
                        placeholder="Details..."
                      />
                    )}
                    <div>
                      <label className="block text-base font-medium mb-2 text-primary">
                        Disabilities? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.disabilities}
                        onChange={(e) =>
                          handleInputChange("disabilities", e.target.value)
                        }
                        className="w-full px-4 py-3 border rounded-lg"
                        placeholder="N/A if none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Your Concerns
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {supportAreasList.map((area) => (
                    <label
                      key={area}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.supportAreas.includes(area)}
                        onChange={() => handleSupportAreaToggle(area)}
                        className="w-5 h-5 accent-[#6f1d56]"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  value={formData.concernsDetails}
                  onChange={(e) =>
                    handleInputChange("concernsDetails", e.target.value)
                  }
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Details about concerns..."
                  rows="4"
                />
                <textarea
                  value={formData.riskIssues}
                  onChange={(e) =>
                    handleInputChange("riskIssues", e.target.value)
                  }
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Risk issues / substance misuse..."
                  rows="2"
                />
              </div>
            )}

            {/* Step 8: Assessment (CORE 34) - moved to be last before payment */}
            {currentStep === 8 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Assessment (CORE 34)
                </h2>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left">Statement</th>
                        {core34Options.map((opt) => (
                          <th key={opt} className="p-3 text-center">
                            {opt}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {core34Questions.map((q, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3">
                            {i + 1}. {q}
                          </td>
                          {core34Options.map((opt) => (
                            <td key={opt} className="p-3 text-center">
                              <input
                                type="radio"
                                checked={formData.core34[i] === opt}
                                onChange={() => handleCore34Change(i, opt)}
                                className="accent-[#6f1d56]"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 5: Availability - moved up from step 6 */}
            {currentStep === 5 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Availability
                </h2>
                {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
                  (day) => (
                    <div key={day} className="border rounded-lg p-4 mb-4">
                      <h3 className="font-bold capitalize mb-3 text-purple-900">
                        {day}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(day === "friday" ? fridayTimeSlots : timeSlots).map(
                          (slot) => (
                            <label
                              key={slot.value}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.availability[day].includes(
                                  slot.value,
                                )}
                                onChange={() =>
                                  handleAvailabilityToggle(day, slot.value)
                                }
                                className="accent-[#6f1d56]"
                              />
                              <span>{slot.label}</span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Step 6: Preferences - moved up from step 7 */}
            {currentStep === 6 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Preferences (Optional)
                </h2>
                <div className="space-y-4">
                  <select
                    value={formData.genderPreference}
                    onChange={(e) =>
                      handleInputChange("genderPreference", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                  >
                    <option value="No preference">No gender preference</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <select
                    value={formData.agePreference}
                    onChange={(e) =>
                      handleInputChange("agePreference", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                  >
                    <option value="No preference">No age preference</option>
                    <option value="Younger">Younger</option>
                    <option value="Older">Older</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 7: Referral - moved up from step 8 */}
            {currentStep === 7 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Referral
                </h2>
                <select
                  value={formData.hearAboutUs}
                  onChange={(e) =>
                    handleInputChange("hearAboutUs", e.target.value)
                  }
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  <option value="">How did you find us?</option>
                  <option value="Online">Online</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Word of Mouth">Word of Mouth</option>
                </select>
                <textarea
                  value={formData.referralReason}
                  onChange={(e) =>
                    handleInputChange("referralReason", e.target.value)
                  }
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Reason for referral..."
                />
              </div>
            )}

            {currentStep === 9 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                  Payment
                </h2>
                <div className="p-6 border-2 border-purple-200 rounded-xl bg-purple-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-purple-900">
                      Ish's Consultation Fee
                    </h3>
                    <p className="text-sm text-purple-700">
                      Non-refundable admin fee
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    £{getConsultationFee().toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.discountCode}
                    onChange={(e) =>
                      handleInputChange("discountCode", e.target.value)
                    }
                    className="flex-1 px-4 py-2 border rounded-lg"
                    placeholder="Discount code"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg"
                  >
                    Apply
                  </button>
                </div>

                {!clientId ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.termsAccepted}
                    className="w-full py-4 bg-[#6f1d56] text-white rounded-lg font-bold text-lg disabled:opacity-50"
                  >
                    Save & Proceed to Payment
                  </button>
                ) : (
                  <StripePaymentWrapper
                    clientId={clientId}
                    amount={getConsultationFee()}
                    onSuccess={() => setSubmitted(true)}
                  />
                )}

                <label className="flex items-start gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) =>
                      handleInputChange("termsAccepted", e.target.checked)
                    }
                    className="mt-1 accent-[#6f1d56]"
                  />
                  <span className="text-sm">
                    I accept the terms and conditions. Note that the admin fee
                    is non-refundable.
                  </span>
                </label>
              </div>
            )}

            {/* Nav Buttons */}
            {!(formData.serviceType === "Ish" && ishCapacityFull) &&
              currentStep < 9 && (
                <div className="flex justify-between mt-10 pt-6 border-t">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-2 bg-[#6f1d56] text-white rounded-lg"
                  >
                    Next
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentProps && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Secure Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center mb-6">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-bold">
                  £{paymentProps.amount.toFixed(2)}
                </span>
              </div>
              <StripePaymentWrapper
                clientId={paymentProps.clientId}
                amount={paymentProps.amount}
                onSuccess={paymentProps.onSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </PublicFormWrapper>
  );
}
