"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
import apiService from "@/lib/api";

export default function VanquishClientIntake() {
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
    serviceType: "",
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
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [errors, setErrors] = useState({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [paymentProps, setPaymentProps] = useState(null);
  const [baseFee, setBaseFee] = useState(13.0);
  const formContentRef = useRef(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const services = await apiService.getAllServices();
        const generalSetting = services.find(
          (s) =>
            s.service_name === "General Assessment" ||
            s.service_name === "TrafftBooking",
        );
        if (generalSetting) {
          setBaseFee(parseFloat(generalSetting.consultation_price));
        }
      } catch (err) {
        console.error("Failed to load dynamic pricing:", err);
      }
    };
    fetchPricing();
  }, []);

  // Calculate consultation fee based on service type
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
        // We only clear the global error if all questions are answered, but usually one change isn't enough to clear "not all answered" unless it was the last one.
        // For simplicity, we'll clear it and let re-validation catch if any are still missing on next click.
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
            service_type: formData.serviceType || null,
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
              // Laravel validation errors
              const validationErrors = Object.entries(errorData.errors)
                .map(
                  ([field, messages]) =>
                    `${field}: ${
                      Array.isArray(messages) ? messages.join(", ") : messages
                    }`,
                )
                .join("\n");
              errorMessage = `Validation errors:\n${validationErrors}`;
            } else {
              errorMessage =
                errorData.message && errorData.error
                  ? `${errorData.message}: ${errorData.error}`
                  : errorData.message || errorData.error || errorMessage;
            }
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          errorMessage = `Failed to submit intake form (Status: ${response.status} ${response.statusText})`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // If client was created, get the client ID and UUID
      let clientUuid = data.client_uuid;
      if (data.client_id) {
        setClientId(data.client_id);
      } else if (data.form && data.form.client_id) {
        setClientId(data.form.client_id);
      } else {
        // Try to find client by email
        const clientResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
          }/clients?email=${encodeURIComponent(formData.email)}`,
        );
        if (clientResponse.ok) {
          const clients = await clientResponse.json();
          if (clients.length > 0) {
            setClientId(clients[0].id);
            clientUuid = clients[0].uuid;
          }
        }
      }

      // Redirect to JotForm intake form with prefilled data

      // Handle payment or redirect
      const fee = getConsultationFee();
      let currentClientId =
        data.client_id || (data.form && data.form.client_id);

      if (!currentClientId && !clientUuid) {
        // Should have been found in block above, but just in case
        // Retrieve from state if possible, though state updates are async
        // Best to rely on what we just found
      }

      // If we don't have currentClientId but we logic above found it via email
      if (!currentClientId && formData.email) {
        const clientResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
          }/clients?email=${encodeURIComponent(formData.email)}`,
        );
        if (clientResponse.ok) {
          const clients = await clientResponse.json();
          if (clients.length > 0) {
            currentClientId = clients[0].id;
            // clientUuid = clients[0].uuid; // Already set above
          }
        }
      }

      const proceedToRedirect = () => {
        const params = new URLSearchParams();
        params.append("email", formData.email);
        params.append("uuid", clientUuid);

        // Redirect to internal success page instead of JotForm
        window.location.href = `/intake/success?${params.toString()}`;
      };

      if (fee > 0 && clientUuid && currentClientId) {
        // Show payment modal
        setPaymentProps({
          clientId: currentClientId, // Needs the ID (integer/string ID) for backend, not UUID if backend expects ID
          amount: fee,
          couponCode: isDiscountApplied ? formData.discountCode : null,
          onSuccess: proceedToRedirect,
          onError: (err) =>
            toast.error(`Payment failed: ${err.message || "Please try again"}`),
        });
        setShowPaymentModal(true);
      } else if (clientUuid) {
        // Free or already paid (if logic allowed), redirect immediately
        proceedToRedirect();
        return;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });

      let errorMessage =
        error.message ||
        "Failed to submit form. Please check all required fields are filled and try again.";

      // Show error in a more user-friendly way
      if (errorMessage.includes("Validation errors:")) {
        toast.error(errorMessage);
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        toast.error(
          "Network error: Please check your internet connection and ensure the backend server is running.",
        );
      } else {
        toast.error(errorMessage);
      }
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
            <div className="card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  backgroundColor: "var(--success-bg)",
                  border: "2px solid var(--success-border)",
                }}
              >
                <CheckCircle
                  className="w-12 h-12"
                  style={{ color: "var(--success-primary)" }}
                />
              </div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                THANK YOU FOR BOOKING YOUR CONSULTATION WITH US.
              </h2>
              <div className="mb-6 text-center">
                <p
                  className="mb-4 font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  PLEASE REMEMBER TO CHECK YOUR SPAM/JUNK FOLDER IN CASE THE
                  BOOKING CONFIRMATION EMAIL DOES NOT APPEAR IN YOUR INBOX.
                </p>
                <p
                  className="mb-4 font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <strong>
                    IF YOU HAVE NOT RECEIVED A CONFIRMATION EMAIL, IT IS
                    IMPORTANT THAT YOU CONTACT US AT LEAST 48 HOURS BEFORE YOUR
                    CONSULTATION SO WE CAN ASSIST IN CONFIRMING YOUR BOOKING.
                  </strong>
                </p>
                <p
                  className="text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  We look forward to connecting with you.
                </p>
              </div>
              <div
                className="rounded-lg p-4 mb-6 border"
                style={{
                  backgroundColor: "var(--purple-bg)",
                  borderColor: "var(--purple-border)",
                }}
              >
                <p
                  className="text-lg font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Consultation Fee: £{getConsultationFee().toFixed(2)} Paid
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  A confirmation email has been sent to {formData.email}
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Taking the first step towards healing takes courage. We're here
                to support you on your journey.
              </p>
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
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  VT
                </div>
                <div>
                  <h1
                    className="text-lg md:text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Vanquish Therapies
                  </h1>
                  <p
                    className="text-base md:text-lg mt-0.5 md:mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Client Intake Form
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Progress - Simple */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-lg font-medium"
                  style={{ color: "#6f1d56" }}
                >
                  Step {currentStep} of 9
                </span>
                <span
                  className="text-base "
                  style={{ color: "var(--text-secondary)" }}
                >
                  {steps[currentStep - 1].title}
                </span>
              </div>
              <div
                className="w-full  rounded-full h-2"
                style={{ backgroundColor: "var(--border-color)" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: "#6f1d56",
                    width: `${(currentStep / 9) * 100}%`,
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
                            className={`text-sm mt-2 text-center ${
                              isCurrent || isCompleted
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
                            className={`h-1 flex-1 mx-2 rounded transition-colors ${
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
          </div>

          {/* Form Content */}
          <div
            ref={formContentRef}
            className="bg-white rounded-2xl shadow-sm p-4 md:p-8"
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Personal Information - (Please be advised that all required
                    fields must be completed in the form. Failure to do so may
                    result in an error. Therefore, it is crucial that you
                    carefully review the form and provide accurate and complete
                    information to avoid any issues. For any fields that do not
                    apply to you, please enter "N/A.")
                  </h2>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 md:p-5">
                  <p className="text-lg md:text-xl text-red-900 font-bold mb-3">
                    Consent for Information Sharing
                  </p>
                  <p className="text-lg md:text-xl text-red-800 leading-relaxed">
                    By completing this form, you (client) are giving permission
                    for your information to be shared within Vanquish Therapies
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
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
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
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
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                    <p
                      className="text-sm font-bold mt-1"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      We primarily communicate via email and WhatsApp
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+44 7700 900000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      id="age"
                      min="18"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.age ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="28"
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
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.voicemailOk
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.voicemailOk && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.voicemailOk}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className="block text-lg font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Are you currently in therapy/counselling anywhere else?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currentlyInTherapy"
                      id="currentlyInTherapy"
                      value={formData.currentlyInTherapy}
                      onChange={(e) =>
                        handleInputChange("currentlyInTherapy", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.currentlyInTherapy
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.currentlyInTherapy && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.currentlyInTherapy}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: About You (Demographics) */}
            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    About You
                  </h2>
                  <p
                    className="text-base md:text-lg "
                    style={{ color: "var(--text-secondary)" }}
                  >
                    This information helps us match you with the right
                    counsellor.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
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
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
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
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.ethnicity ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select</option>
                      <option value="Asian">Asian</option>
                      <option value="Black">Black</option>
                      <option value="White">White</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Hispanic/Latino">Hispanic/Latino</option>
                      <option value="Middle Eastern">Middle Eastern</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                    {errors.ethnicity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.ethnicity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
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
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.sexualOrientation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select</option>
                      <option value="Heterosexual">Heterosexual</option>
                      <option value="Gay">Gay</option>
                      <option value="Lesbian">Lesbian</option>
                      <option value="Bisexual">Bisexual</option>
                      <option value="Pansexual">Pansexual</option>
                      <option value="Asexual">Asexual</option>
                      <option value="Queer">Queer</option>
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

            {/* Step 3: Medical & Service Information */}
            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Medical & Service Information
                  </h2>
                  <p
                    className="text-base md:text-lg "
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Help us understand your needs and ensure your safety.
                  </p>

                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-purple-900 font-medium mb-1">
                      Looking for Ish's Coaching or Counselling?
                    </p>
                    <p className="text-sm text-purple-800 mb-2">
                      Ish's services now have a dedicated registration page.
                    </p>
                    <Link
                      href="/ish"
                      className="inline-flex items-center gap-2 text-[#6f1d56] font-bold hover:underline"
                    >
                      Go to Ish's Services Page{" "}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Please select the service you require{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceType"
                      id="serviceType"
                      value={formData.serviceType}
                      onChange={(e) =>
                        handleInputChange("serviceType", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.serviceType
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select</option>
                      <option value="Mid Range">
                        Mid Range Counselling (starting from £40+)
                      </option>
                      <option value="Low Cost">Low Cost Counselling</option>
                    </select>
                    {errors.serviceType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.serviceType}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <>
                    <div>
                      <label
                        className="block text-lg font-medium  mb-2"
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
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                          errors.onMedication
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
                          className="block text-lg font-medium  mb-2"
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
                              e.target.value,
                            )
                          }
                          rows="3"
                          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                            errors.medicationDetails
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="E.g., Sertraline 50mg for anxiety and depression"
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
                        className="block text-lg font-medium  mb-2"
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
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                          errors.disabilities
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
                  </>
                </div>
              </div>
            )}

            {/* Step 4: Your Concerns */}
            {currentStep === 4 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Your Concerns
                  </h2>
                  <p
                    className="text-base md:text-lg "
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Tell us what areas you would like support with.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium  mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Areas you require support with{" "}
                      <span className="text-red-500">*</span>
                      <span
                        className="text-sm font-normal  ml-2"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        (Select all that apply)
                      </span>
                    </label>
                    <div
                      data-field="supportAreas"
                      className={`border rounded-lg p-4 max-h-96 overflow-y-auto ${
                        errors.supportAreas
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {supportAreasList.map((area) => (
                          <label
                            key={area}
                            className="flex items-start gap-3 cursor-pointer hover: p-2 rounded"
                            style={{ backgroundColor: "var(--bg-secondary)" }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.supportAreas.includes(area)}
                              onChange={() => handleSupportAreaToggle(area)}
                              className="mt-1 w-5 h-5 rounded "
                              style={{
                                borderColor: "var(--input-border)",
                                accentColor: "#6f1d56",
                              }}
                            />
                            <span
                              className="text-base "
                              style={{ color: "var(--text-primary)" }}
                            >
                              {area}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {errors.supportAreas && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.supportAreas}
                      </p>
                    )}
                    {formData.supportAreas.length > 0 && (
                      <p
                        className="text-sm  mt-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Selected: {formData.supportAreas.length} area(s)
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Please provide more details about your concerns{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="concernsDetails"
                      id="concernsDetails"
                      value={formData.concernsDetails}
                      onChange={(e) =>
                        handleInputChange("concernsDetails", e.target.value)
                      }
                      rows="4"
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.concernsDetails
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="For example: My partner and I have been arguing frequently over finances..."
                    />
                    {errors.concernsDetails && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.concernsDetails}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Please provide details of any identified risk issues or
                      substance misuse
                    </label>
                    <textarea
                      value={formData.riskIssues}
                      onChange={(e) =>
                        handleInputChange("riskIssues", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ borderColor: "var(--input-border)" }}
                      placeholder="Please describe any risk factors we should be aware of, or enter 'N/A' if none"
                    />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-base text-red-900 font-medium mb-1">
                    Crisis Support
                  </p>
                  <p className="text-base text-red-800">
                    Vanquish Therapies is not a crisis or emergency service. If
                    you need immediate help, please contact your GP, NHS (111),
                    or the Samaritans (116 123).
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Availability - moved up from step 6 */}
            {currentStep === 5 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Your Availability To Attend Weekly Sessions
                  </h2>
                  <p
                    className="text-base md:text-lg "
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Select all time slots when you're available for weekly
                    counselling sessions.
                  </p>
                </div>

                {errors.availability && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
                    <p className="text-red-600 text-lg font-medium">
                      {errors.availability}
                    </p>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-base text-blue-900">
                    <strong>Important:</strong> To avoid any delays - Please
                    select the accurate days and times you are available to
                    attend weekly counselling sessions in UK time, as the
                    practice is based in the UK. Please note - If this
                    information is not provided there can be a delay in matching
                    you with a counsellor. Moreover, the last session is at 6pm
                    from Monday to Thursday, and at 5pm on Friday.*
                  </p>
                </div>

                <div data-field="availability" className="space-y-4">
                  {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
                    (day) => {
                      const slotsToShow =
                        day === "friday" ? fridayTimeSlots : timeSlots;
                      return (
                        <div
                          key={day}
                          className={`border rounded-lg overflow-hidden ${
                            errors.availability
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        >
                          <div
                            className="px-4 py-3 font-semibold text-sm capitalize  border-b "
                            style={{
                              borderColor: "var(--input-border)",
                              backgroundColor: "var(--hover-bg)",
                              color: "#6f1d56",
                            }}
                          >
                            {day}
                            {day === "friday" && (
                              <span
                                className="ml-2 text-sm font-normal "
                                style={{ color: "var(--text-secondary)" }}
                              >
                                (Last session at 5:00 PM - 5:50 PM)
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="space-y-2">
                              {slotsToShow.map((slot) => (
                                <label
                                  key={slot.value}
                                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover: border  transition-colors"
                                  style={{
                                    borderColor: "var(--border-color)",
                                    backgroundColor: "var(--bg-secondary)",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.availability[
                                      day
                                    ].includes(slot.value)}
                                    onChange={() =>
                                      handleAvailabilityToggle(day, slot.value)
                                    }
                                    className="w-5 h-5 rounded "
                                    style={{
                                      borderColor: "var(--input-border)",
                                      accentColor: "#6f1d56",
                                    }}
                                  />
                                  <div className="flex-1">
                                    <span
                                      className="text-lg font-medium "
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {slot.label}
                                    </span>
                                    <span
                                      className="ml-2 text-sm px-2 py-0.5 rounded"
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
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {Object.values(formData.availability).some(
                  (day) => day.length > 0,
                ) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-base text-green-900 font-medium mb-2">
                      Your selected availability:
                    </p>
                    {Object.entries(formData.availability).map(
                      ([day, slots]) => {
                        const slotsToUse =
                          day === "friday" ? fridayTimeSlots : timeSlots;
                        return (
                          slots.length > 0 && (
                            <p
                              key={day}
                              className="text-base text-green-800 capitalize"
                            >
                              <strong>{day}:</strong>{" "}
                              {slots
                                .map(
                                  (s) =>
                                    slotsToUse.find((t) => t.value === s)
                                      ?.label,
                                )
                                .join(", ")}
                            </p>
                          )
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Counsellor Preferences - moved up from step 7 */}
            {currentStep === 6 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Counsellor Preferences
                  </h2>
                  <p
                    className="text-base md:text-lg "
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
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Gender Preference
                    </label>
                    <select
                      value={formData.genderPreference}
                      onChange={(e) =>
                        handleInputChange("genderPreference", e.target.value)
                      }
                      className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ borderColor: "var(--input-border)" }}
                    >
                      <option value="No preference">No preference</option>
                      <option value="Male">
                        Prefer Male counsellor (subject to availability)
                      </option>
                      <option value="Female">
                        Prefer Female counsellor (subject to availability)
                      </option>
                      <option value="Non-binary">
                        Prefer Non-binary counsellor (subject to availability)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Age Preference
                    </label>
                    <select
                      value={formData.agePreference}
                      onChange={(e) =>
                        handleInputChange("agePreference", e.target.value)
                      }
                      className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ borderColor: "var(--input-border)" }}
                    >
                      <option value="No preference">No preference</option>
                      <option value="Younger">
                        Prefer younger counsellor (close to my age) (subject to
                        availability)
                      </option>
                      <option value="Older">
                        Prefer older counsellor (subject to availability)
                      </option>
                      <option value="Similar">
                        Prefer counsellor of similar age (subject to
                        availability)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Ethnicity Preference
                    </label>
                    <select
                      value={formData.ethnicityPreference}
                      onChange={(e) =>
                        handleInputChange("ethnicityPreference", e.target.value)
                      }
                      className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ borderColor: "var(--input-border)" }}
                    >
                      <option value="No preference">No preference</option>
                      <option value="Prefer same">
                        Prefer same ethnicity as me (subject to availability)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Sexual Orientation Preference
                    </label>
                    <select
                      value={formData.orientationPreference}
                      onChange={(e) =>
                        handleInputChange(
                          "orientationPreference",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ borderColor: "var(--input-border)" }}
                    >
                      <option value="No preference">No preference</option>
                      <option value="LGBTQ+">
                        Prefer LGBTQ+ counsellor (subject to availability)
                      </option>
                      <option value="Same orientation">
                        Prefer same orientation as me (subject to availability)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Referral Information - moved up from step 8 */}
            {currentStep === 7 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Referral Information - (For any fields that do not apply to
                    you, please enter "N/A.")
                  </h2>
                  <p
                    className="text-base md:text-lg "
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Help us understand how you found us.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      How did you become aware of our services?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="hearAboutUs"
                      id="hearAboutUs"
                      value={formData.hearAboutUs}
                      onChange={(e) =>
                        handleInputChange("hearAboutUs", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.hearAboutUs
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select</option>
                      <option value="Online">Online (Google, Bing etc)</option>
                      <option value="Social Media">
                        Social Media (Facebook, Instagram)
                      </option>
                      <option value="Referral">Referral</option>
                      <option value="It's just Project">
                        It's just Project
                      </option>
                      <option value="Word of Mouth">Word of Mouth</option>
                      <option value="Billboard">Billboard</option>
                    </select>
                    {errors.hearAboutUs && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.hearAboutUs}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium  mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Reasons for Referral
                    </label>
                    <textarea
                      value={formData.referralReason}
                      onChange={(e) =>
                        handleInputChange("referralReason", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ borderColor: "var(--input-border)" }}
                      placeholder="Please provide any additional context about your referral"
                    />
                  </div>

                  {(formData.hearAboutUs === "Referral" ||
                    formData.hearAboutUs === "Organization" ||
                    formData.hearAboutUs === "Individual") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label
                            className="block text-lg font-medium mb-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Referrer's Name (Provide your details so we can
                            reach you if submitting for someone else)
                          </label>
                          <input
                            type="text"
                            value={formData.referrerName}
                            onChange={(e) =>
                              handleInputChange("referrerName", e.target.value)
                            }
                            className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                            style={{ borderColor: "var(--input-border)" }}
                            placeholder="Full name"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-lg font-medium mb-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Referrer's Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.referrerPhone}
                            onChange={(e) =>
                              handleInputChange("referrerPhone", e.target.value)
                            }
                            className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                            style={{ borderColor: "var(--input-border)" }}
                            placeholder="+44 7700 900000"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-lg font-medium  mb-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Organization Name (if applicable)
                          </label>
                          <input
                            type="text"
                            value={formData.referrerOrg}
                            onChange={(e) =>
                              handleInputChange("referrerOrg", e.target.value)
                            }
                            className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                            style={{ borderColor: "var(--input-border)" }}
                            placeholder="Organization name"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-lg font-medium  mb-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Referrer's Email
                          </label>
                          <input
                            type="email"
                            value={formData.referrerEmail}
                            onChange={(e) =>
                              handleInputChange("referrerEmail", e.target.value)
                            }
                            className="w-full px-4 py-3 text-base border  rounded-lg focus:ring-2 focus:border-transparent"
                            style={{ borderColor: "var(--input-border)" }}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 8: Assessment (CORE 34) - moved to be last before payment */}
            {currentStep === 8 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Assessment (CORE 34)
                  </h2>
                  <div
                    className="text-base md:text-lg mb-4 space-y-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <p className="font-bold">
                      Important - Please read this information before you start
                      completing the below section:
                    </p>
                    <p>
                      This section has 34 statements about how you have been
                      over the last week.
                    </p>
                    <p>
                      Please ensure you read each statement and think about how
                      often you have felt that way over the last week. Then tick
                      the box that relates closest to how you have felt.
                    </p>
                    <p className="text-base italic">
                      This core 34 has been taken from The CORE System Trust:
                      http://www.coresystemtrust.org.uk/copyright.pdf
                    </p>
                  </div>
                </div>

                {errors.core34 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600 font-medium">{errors.core34}</p>
                  </div>
                )}

                <div
                  className="overflow-x-auto rounded-lg border border-gray-200"
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
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          } ${
                            errors.core34 &&
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

                {/* Mobile View - Cards for small screens where table might be hard to read */}
                <div className="md:hidden space-y-6 mt-6">
                  {core34Questions.map((question, index) => (
                    <div
                      key={`mobile-${index}`}
                      className={`border rounded-lg p-4 ${
                        errors.core34 && !formData.core34[index]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <p className="font-medium mb-3">
                        {index + 1}. {question}
                      </p>
                      <div className="space-y-2">
                        {core34Options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                          >
                            <input
                              type="radio"
                              name={`mobile_core34_q${index}`}
                              value={option}
                              checked={formData.core34[index] === option}
                              onChange={() => handleCore34Change(index, option)}
                              className="w-5 h-5 accent-[#6f1d56]"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 9: Payment & Terms */}
            {currentStep === 9 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Consultation Payment
                  </h2>
                  <p
                    className="text-base md:text-lg "
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Secure your consultation appointment with a small admin fee.
                  </p>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 md:p-5 mb-4 md:mb-6">
                  <p className="text-base md:text-lg text-red-900 font-medium">
                    This is a non-refundable administrative fee, which also
                    covers the cost of your consultation time with the
                    consultant.
                  </p>
                </div>

                <div
                  className="border-2 rounded-lg p-4 md:p-6 mb-4 md:mb-6"
                  style={{ borderColor: "#6f1d56", backgroundColor: "#fcf6fa" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p
                        className="text-lg font-medium"
                        style={{ color: "#6f1d56" }}
                      >
                        Initial Consultation
                      </p>
                      <p
                        className="text-sm  mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Assessment and admin fee
                      </p>
                    </div>
                    <p
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: "#6f1d56" }}
                    >
                      £{getConsultationFee().toFixed(2)}
                    </p>
                  </div>
                  <p
                    className="text-base md:text-lg "
                    style={{ color: "var(--text-primary)" }}
                  >
                    This consultation fee helps us ensure commitment to your
                    therapeutic journey.
                  </p>
                </div>

                {/* Discount Code Section */}
                <div className="mb-6">
                  <label
                    className="block text-lg font-medium  mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Have a discount code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.discountCode || ""}
                      onChange={(e) =>
                        handleInputChange("discountCode", e.target.value)
                      }
                      placeholder="Enter code"
                      disabled={isDiscountApplied}
                      className="flex-1 px-4 py-2 border  rounded-lg focus:ring-2 focus:border-transparent disabled: disabled:"
                      style={{
                        borderColor: "var(--input-border)",
                        color: "var(--text-tertiary)",
                        backgroundColor: "var(--hover-bg)",
                      }}
                    />
                    {!isDiscountApplied ? (
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountAmount(0);
                          setIsDiscountApplied(false);
                          handleInputChange("discountCode", "");
                        }}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium transition-colors border border-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {isDiscountApplied && (
                    <p className="text-green-600 text-base mt-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Code applied successfully! You saved £
                      {discountAmount.toFixed(2)}
                    </p>
                  )}
                </div>

                {!clientId ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-base text-yellow-800">
                      Please complete the previous steps first. The payment form
                      will appear once your information is saved.
                    </p>
                  </div>
                ) : paymentCompleted ? (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-base text-green-700">
                      Your consultation has been confirmed.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-base text-blue-800 font-medium">
                      Your information has been saved successfully. Please
                      complete your payment in the secure popup window to
                      confirm your consultation.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="mt-4 px-4 py-2 bg-[#6f1d56] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Open Payment Window
                    </button>
                  </div>
                )}

                <div
                  className="space-y-4 pt-4 border-t "
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) =>
                        handleInputChange("termsAccepted", e.target.checked)
                      }
                      className="mt-1 w-5 h-5 rounded "
                      style={{
                        borderColor: "var(--input-border)",
                        accentColor: "#6f1d56",
                      }}
                    />
                    <span
                      className="text-base "
                      style={{ color: "var(--text-primary)" }}
                    >
                      I understand that missing more than one session or failing
                      to book sessions for a week or more, without
                      communication, may result in my reserved space being
                      released. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <div
                    className=" border  rounded-lg p-4"
                    style={{
                      borderColor: "var(--border-color)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    <p
                      className="text-xs "
                      style={{ color: "var(--text-secondary)" }}
                    >
                      🔒 Your payment information is secure and encrypted. This
                      consultation/admin fee is non-refundable.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
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
                className="flex items-center justify-between mt-8 md:mt-10 pt-6 border-t "
                style={{ borderColor: "var(--border-color)" }}
              >
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-base md:text-lg ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">Previous</span>
                  <span className="md:hidden">Back</span>
                </button>

                <div
                  className="text-sm  font-medium md:hidden"
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
                    disabled={!formData.termsAccepted}
                    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium transition-opacity text-base md:text-lg ${
                      !formData.termsAccepted
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:opacity-90"
                    }`}
                    style={{ backgroundColor: "#6f1d56" }}
                  >
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline">
                      Save & Continue to Payment
                    </span>
                    <span className="md:hidden">Save</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentProps && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
              <div
                className="p-6 border-b border-gray-100 flex justify-between items-center "
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <div>
                  <h3
                    className="text-lg font-bold "
                    style={{ color: "var(--text-primary)" }}
                  >
                    Secure Payment
                  </h3>
                  <p
                    className="text-base "
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
                  className=" hover: transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  title="Cancel payment"
                >
                  <div
                    className="w-8 h-8 rounded-full  flex items-center justify-center"
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

                <StripePaymentWrapper
                  clientId={paymentProps.clientId}
                  amount={paymentProps.amount}
                  paymentType="consultation"
                  couponCode={paymentProps.couponCode}
                  onSuccess={() => {
                    paymentProps.onSuccess();
                    setShowPaymentModal(false);
                  }}
                  onError={paymentProps.onError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicFormWrapper>
  );
}
