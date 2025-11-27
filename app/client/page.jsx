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
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [ishCapacityFull, setIshCapacityFull] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [errors, setErrors] = useState({});
  const formContentRef = useRef(null);

  // Calculate consultation fee based on service type
  const getConsultationFee = () => {
    if (formData.serviceType === "Ish") {
      return 25.0;
    }
    return 13.0;
  };

  // Check Ish's service capacity
  useEffect(() => {
    if (formData.serviceType === "Ish") {
      // Check capacity status from backend
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/services/ish-capacity`
      )
        .then((res) => res.json())
        .then((data) => {
          setIshCapacityFull(data.capacity_full || false);
        })
        .catch(() => {
          // Default to available if check fails
          setIshCapacityFull(false);
        });
    } else {
      setIshCapacityFull(false);
    }
  }, [formData.serviceType]);

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
          (day) => day.length > 0
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

      case 8: // Payment
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
    // Validate step 8 before submitting
    const stepErrors = validateStep(8);
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
            create_client: true,
          }),
        }
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
                    }`
                )
                .join("\n");
              errorMessage = `Validation errors:\n${validationErrors}`;
            } else {
              errorMessage =
                errorData.message || errorData.error || errorMessage;
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

      // If client was created, get the client ID
      if (data.client_id) {
        setClientId(data.client_id);
      } else if (data.form && data.form.client_id) {
        setClientId(data.form.client_id);
      } else {
        // Try to find client by email
        const clientResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
          }/clients?email=${encodeURIComponent(formData.email)}`
        );
        if (clientResponse.ok) {
          const clients = await clientResponse.json();
          if (clients.length > 0) {
            setClientId(clients[0].id);
          }
        }
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
        alert(errorMessage);
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        alert(
          "Network error: Please check your internet connection and ensure the backend server is running."
        );
      } else {
        alert(errorMessage);
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
    { number: 8, title: "Payment", icon: CreditCard },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your information has been submitted successfully. We'll be in touch
            within 24 hours to confirm your consultation appointment.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-900 font-medium">
              Consultation Fee: £{getConsultationFee().toFixed(2)} Paid
            </p>
            <p className="text-xs text-purple-700 mt-1">
              A confirmation email has been sent to {formData.email}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Taking the first step towards healing takes courage. We're here to
            support you on your journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl"
                style={{ backgroundColor: "#6f1d56" }}
              >
                VT
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  Vanquish Therapies
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-0.5 md:mt-1">
                  Client Intake Form
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Progress - Simple */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: "#6f1d56" }}
              >
                Step {currentStep} of 8
              </span>
              <span className="text-sm text-gray-600">
                {steps[currentStep - 1].title}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#6f1d56",
                  width: `${(currentStep / 8) * 100}%`,
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
                        style={{ width: "12.5%" }}
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
                          className={`text-xs mt-2 text-center ${
                            isCurrent || isCompleted
                              ? "font-medium"
                              : "text-gray-500"
                          }`}
                          style={
                            isCurrent || isCompleted ? { color: "#6f1d56" } : {}
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
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Personal Information
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Please provide your contact details so we can reach you.
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 md:p-5">
                <p className="text-sm md:text-base text-red-900 font-medium mb-2">
                  Consent for Information Sharing
                </p>
                <p className="text-xs md:text-sm text-red-800">
                  By completing this form, you authorise Vanquish Therapies to
                  share your information internally for counsellor matching,
                  appointment scheduling, safeguarding, and emergency purposes.
                  If submitting on behalf of someone else, please include your
                  own contact details in the referral section and confirm that
                  you have obtained the client's consent to disclose their
                  personal information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Smith"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    We primarily communicate via email and WhatsApp
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+44 7700 900000"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min="18"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.age ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="28"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.voicemailOk ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.voicemailOk && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.voicemailOk}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
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
                    <p className="text-red-500 text-xs mt-1">
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
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  About You
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  This information helps us match you with the right counsellor.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Please select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ethnicity"
                    id="ethnicity"
                    value={formData.ethnicity}
                    onChange={(e) =>
                      handleInputChange("ethnicity", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
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
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.ethnicity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.ethnicity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Orientation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sexualOrientation"
                    id="sexualOrientation"
                    value={formData.sexualOrientation}
                    onChange={(e) =>
                      handleInputChange("sexualOrientation", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
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
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.sexualOrientation && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.sexualOrientation}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
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
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Medical & Service Information
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Help us understand your needs and ensure your safety.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.serviceType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Please select</option>
                    <option value="Mid Range">
                      Mid Range Counselling (starting from £40+)
                    </option>
                    <option value="Low Cost">Low Cost Counselling</option>
                    <option value="Ish">
                      Ish's Services (Coaching/Counselling)
                    </option>
                  </select>
                  {errors.serviceType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.serviceType}
                    </p>
                  )}
                </div>

                {/* Ish's Service Capacity Warning */}
                {formData.serviceType === "Ish" && ishCapacityFull && (
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-5 md:p-6">
                    <p className="text-base md:text-lg text-orange-900 font-bold mb-3">
                      Service at Capacity
                    </p>
                    <p className="text-sm md:text-base text-orange-800 mb-4">
                      This service is at capacity at this time. If you would
                      like to work with Ish, you can proceed with our Partner
                      service VQT COACHING & THERAPY.
                    </p>
                    <a
                      href="https://pci.jotform.com/form/243161740962456"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Continue with VQT COACHING & THERAPY
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.onMedication ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.onMedication && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.onMedication}
                    </p>
                  )}
                </div>

                {formData.onMedication === "Yes" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please mention your medication and what it is prescribed
                      for <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="medicationDetails"
                      id="medicationDetails"
                      value={formData.medicationDetails}
                      onChange={(e) =>
                        handleInputChange("medicationDetails", e.target.value)
                      }
                      rows="3"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.medicationDetails
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="E.g., Sertraline 50mg for anxiety and depression"
                    />
                    {errors.medicationDetails && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.medicationDetails}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.disabilities ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Please describe any disabilities or impairments, or enter 'N/A' if none"
                  />
                  {errors.disabilities && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.disabilities}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Your Concerns */}
          {currentStep === 4 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Your Concerns
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Tell us what areas you would like support with.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Areas you require support with{" "}
                    <span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Select all that apply)
                    </span>
                  </label>
                  <div
                    data-field="supportAreas"
                    className={`border rounded-lg p-4 max-h-96 overflow-y-auto ${
                      errors.supportAreas ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {supportAreasList.map((area) => (
                        <label
                          key={area}
                          className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.supportAreas.includes(area)}
                            onChange={() => handleSupportAreaToggle(area)}
                            className="mt-1 w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: "#6f1d56" }}
                          />
                          <span className="text-sm text-gray-700">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.supportAreas && (
                    <p className="text-red-500 text-xs mt-2">
                      {errors.supportAreas}
                    </p>
                  )}
                  {formData.supportAreas.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {formData.supportAreas.length} area(s)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.concernsDetails
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="For example: My partner and I have been arguing frequently over finances..."
                  />
                  {errors.concernsDetails && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.concernsDetails}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide details of any identified risk issues or
                    substance misuse
                  </label>
                  <textarea
                    value={formData.riskIssues}
                    onChange={(e) =>
                      handleInputChange("riskIssues", e.target.value)
                    }
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please describe any risk factors we should be aware of, or enter 'N/A' if none"
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900 font-medium mb-1">
                  Crisis Support
                </p>
                <p className="text-sm text-red-800">
                  Vanquish Therapies is not a crisis or emergency service. If
                  you need immediate help, please contact your GP, NHS (111), or
                  the Samaritans (116 123).
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Availability - IMPROVED VERSION */}
          {currentStep === 5 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Your Availability
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Select all time slots when you're available for weekly
                  counselling sessions.
                </p>
              </div>

              {errors.availability && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm font-medium">
                    {errors.availability}
                  </p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Important:</strong> To ensure timely scheduling,
                  please provide accurate days and times you are available for
                  weekly counselling sessions, as incorrect information may
                  delay matching you with a counsellor. Times are in UK
                  timezone. Last session on Friday is at 5:00 PM - 5:50 PM.
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
                          className="px-4 py-3 font-semibold text-sm capitalize bg-gray-100 border-b border-gray-300"
                          style={{ color: "#6f1d56" }}
                        >
                          {day}
                          {day === "friday" && (
                            <span className="ml-2 text-xs font-normal text-gray-600">
                              (Last session at 5:00 PM - 5:50 PM)
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            {slotsToShow.map((slot) => (
                              <label
                                key={slot.value}
                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.availability[day].includes(
                                    slot.value
                                  )}
                                  onChange={() =>
                                    handleAvailabilityToggle(day, slot.value)
                                  }
                                  className="w-5 h-5 rounded border-gray-300"
                                  style={{ accentColor: "#6f1d56" }}
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {slot.label}
                                  </span>
                                  <span
                                    className="ml-2 text-xs px-2 py-0.5 rounded"
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
                  }
                )}
              </div>

              {Object.values(formData.availability).some(
                (day) => day.length > 0
              ) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 font-medium mb-2">
                    Your selected availability:
                  </p>
                  {Object.entries(formData.availability).map(([day, slots]) => {
                    const slotsToUse =
                      day === "friday" ? fridayTimeSlots : timeSlots;
                    return (
                      slots.length > 0 && (
                        <p
                          key={day}
                          className="text-sm text-green-800 capitalize"
                        >
                          <strong>{day}:</strong>{" "}
                          {slots
                            .map(
                              (s) =>
                                slotsToUse.find((t) => t.value === s)?.label
                            )
                            .join(", ")}
                        </p>
                      )
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Counsellor Preferences */}
          {currentStep === 6 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Counsellor Preferences
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  These preferences are optional and help us find the best match
                  for you.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  <strong>Note:</strong> All preferences are optional. Select
                  "No preference" if you don't have specific requirements.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender Preference
                  </label>
                  <select
                    value={formData.genderPreference}
                    onChange={(e) =>
                      handleInputChange("genderPreference", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Preference
                  </label>
                  <select
                    value={formData.agePreference}
                    onChange={(e) =>
                      handleInputChange("agePreference", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="No preference">No preference</option>
                    <option value="Younger">
                      Prefer younger counsellor (close to my age)
                    </option>
                    <option value="Older">Prefer older counsellor</option>
                    <option value="Similar">
                      Prefer counsellor of similar age
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity Preference
                  </label>
                  <select
                    value={formData.ethnicityPreference}
                    onChange={(e) =>
                      handleInputChange("ethnicityPreference", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="No preference">No preference</option>
                    <option value="Prefer same">
                      Prefer same ethnicity as me
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Orientation Preference
                  </label>
                  <select
                    value={formData.orientationPreference}
                    onChange={(e) =>
                      handleInputChange("orientationPreference", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="No preference">No preference</option>
                    <option value="LGBTQ+">Prefer LGBTQ+ counsellor </option>
                    <option value="Same orientation">
                      Prefer same orientation as me
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Referral Information */}
          {currentStep === 7 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Referral Information
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Help us understand how you found us.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.hearAboutUs ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Please select</option>
                    <option value="Online">Online (Google, Bing, etc.)</option>
                    <option value="Social Media">
                      Social Media (Facebook, Instagram)
                    </option>
                    <option value="Referral">Referral</option>
                    <option value="Organization">
                      Referred through an organization
                    </option>
                    <option value="Individual">
                      Referred through an individual
                    </option>
                  </select>
                  {errors.hearAboutUs && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.hearAboutUs}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reasons for Referral
                  </label>
                  <textarea
                    value={formData.referralReason}
                    onChange={(e) =>
                      handleInputChange("referralReason", e.target.value)
                    }
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please provide any additional context about your referral"
                  />
                </div>

                {(formData.hearAboutUs === "Referral" ||
                  formData.hearAboutUs === "Organization" ||
                  formData.hearAboutUs === "Individual") && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referrer's Name
                        </label>
                        <input
                          type="text"
                          value={formData.referrerName}
                          onChange={(e) =>
                            handleInputChange("referrerName", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="Full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referrer's Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.referrerPhone}
                          onChange={(e) =>
                            handleInputChange("referrerPhone", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="+44 7700 900000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name (if applicable)
                        </label>
                        <input
                          type="text"
                          value={formData.referrerOrg}
                          onChange={(e) =>
                            handleInputChange("referrerOrg", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="Organization name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referrer's Email
                        </label>
                        <input
                          type="email"
                          value={formData.referrerEmail}
                          onChange={(e) =>
                            handleInputChange("referrerEmail", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 8: Payment */}
          {currentStep === 8 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Consultation Payment
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Secure your consultation appointment with a small admin fee.
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 md:p-5 mb-4 md:mb-6">
                <p className="text-sm md:text-base text-red-900 font-medium">
                  This is a non-refundable administrative fee, which also covers
                  the cost of your consultation time with the consultant.
                </p>
              </div>

              <div
                className="border-2 rounded-lg p-4 md:p-6 mb-4 md:mb-6"
                style={{ borderColor: "#6f1d56", backgroundColor: "#fcf6fa" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#6f1d56" }}
                    >
                      Initial Consultation
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
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
                <p className="text-xs md:text-sm text-gray-700">
                  This consultation fee helps us ensure commitment to your
                  therapeutic journey.
                </p>
              </div>

              {!clientId ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
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
                  <p className="text-sm text-green-700">
                    Your consultation has been confirmed.
                  </p>
                </div>
              ) : (
                <StripePaymentWrapper
                  clientId={clientId}
                  amount={getConsultationFee()}
                  onSuccess={() => {
                    setPaymentCompleted(true);
                    setSubmitted(true);
                  }}
                  onError={(error) => {
                    console.error("Payment error:", error);
                  }}
                />
              )}

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) =>
                      handleInputChange("termsAccepted", e.target.checked)
                    }
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                    style={{ accentColor: "#6f1d56" }}
                  />
                  <span className="text-sm text-gray-700">
                    I understand that missing more than one session or failing
                    to book sessions for a week or more, without communication,
                    may result in my reserved space being released.{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600">
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
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Please complete all required fields before proceeding:
                  </p>
                  <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
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
          <div className="flex items-center justify-between mt-8 md:mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">Previous</span>
              <span className="md:hidden">Back</span>
            </button>

            <div className="text-sm text-gray-600 font-medium md:hidden">
              {currentStep}/8
            </div>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium transition-opacity text-sm md:text-base hover:opacity-90"
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
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium transition-opacity text-sm md:text-base ${
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
  );
}
