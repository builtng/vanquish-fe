"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  User,
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

export default function CoachingIntake() {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsappAgreement: "",
    voicemailOk: "",
    partnerEmail: "",
    partnerPhone: "",
    currentlyInTherapy: "",
    workingWithAnotherReason: "",
    locationOfResidence: "",

    // Availability
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },

    // Referral
    hearAboutUs: "",
    referralType: "",

    // Concerns
    supportAreas: [],
    concernsDetails: "",

    // Payment
    discountCode: "",
    termsAccepted: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [isCapacityFull, setIsCapacityFull] = useState(false);
  const [capacityData, setCapacityData] = useState({
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

      let newDiscountAmount = 0;
      const baseFee = getConsultationFee() + discountAmount;

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

  useEffect(() => {
    fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      }/services/coaching-capacity`,
    )
      .then((res) => res.json())
      .then((data) => {
        setIsCapacityFull(data.capacity_full || false);
        setCapacityData({
          message:
            data.message ||
            "This service is at capacity at this time. If you would like to work with our Counselling & Coaching service, you can click here to proceed with our Partner service VQT COACHING & THERAPY",
          alternative_url:
            data.alternative_url ||
            "https://pci.jotform.com/form/243161740962456",
        });
      })
      .catch(() => {
        setIsCapacityFull(false);
        setCapacityData({
          message:
            "This service is at capacity at this time. If you would like to work with our Counselling & Coaching service, you can click here to proceed with our Partner service VQT COACHING & THERAPY",
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

  const ISH_SCHEDULE = {
    monday: ["12pm-1pm", "5pm-6pm"],
    tuesday: ["11am-12pm"],
    wednesday: ["3pm-4pm", "6pm-7pm"],
    thursday: ["10am-11am", "12pm-1pm", "1pm-2pm", "5pm-6pm", "6pm-7pm"],
    friday: ["2pm-3pm", "4pm-5pm"],
  };

  const timeSlots = [
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

  const fridayTimeSlots = [
    { value: "10am-11am", label: "10:00 AM - 11:00 AM", category: "Morning" },
    { value: "11am-12pm", label: "11:00 AM - 12:00 PM", category: "Morning" },
    { value: "12pm-1pm", label: "12:00 PM - 1:00 PM", category: "Afternoon" },
    { value: "1pm-2pm", label: "1:00 PM - 2:00 PM", category: "Afternoon" },
    { value: "2pm-3pm", label: "2:00 PM - 3:00 PM", category: "Afternoon" },
    { value: "3pm-4pm", label: "3:00 PM - 4:00 PM", category: "Afternoon" },
    { value: "4pm-5pm", label: "4:00 PM - 5:00 PM", category: "Afternoon" },
    { value: "5pm-6pm", label: "5:00 PM - 6:00 PM", category: "Evening" },
  ];

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
        if (!formData.whatsappAgreement)
          stepErrors.whatsappAgreement = "This field is required";
        if (!formData.voicemailOk)
          stepErrors.voicemailOk = "This field is required";
        if (
          !formData.partnerEmail.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.partnerEmail)
        ) {
          stepErrors.partnerEmail = "Partner's valid email is required";
        }
        if (!formData.partnerPhone.trim())
          stepErrors.partnerPhone = "Partner's contact number is required";
        if (!formData.currentlyInTherapy)
          stepErrors.currentlyInTherapy = "This field is required";
        if (
          formData.currentlyInTherapy === "Yes" &&
          !formData.workingWithAnotherReason.trim()
        ) {
          stepErrors.workingWithAnotherReason =
            "Please explain reasons for working with another Therapist/Coach";
        }
        if (!formData.locationOfResidence.trim())
          stepErrors.locationOfResidence = "Location is required";
        break;

      case 2: // Availability
        const hasAvailability = Object.values(formData.availability).some(
          (day) => day.length > 0,
        );
        if (!hasAvailability) {
          stepErrors.availability = "Please select at least one time slot";
        }
        break;

      case 3: // Referral
        if (!formData.hearAboutUs)
          stepErrors.hearAboutUs = "This field is required";
        if (!formData.referralType)
          stepErrors.referralType = "Please select a referral type";
        break;

      case 4: // Concerns
        if (formData.supportAreas.length === 0)
          stepErrors.supportAreas = "Please select at least one support area";
        break;

      case 5: // Payment
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
        } else if (formContentRef.current) {
          formContentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
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
  const handleStepClick = (stepNumber) => {
    if (completedSteps.has(stepNumber) || stepNumber < currentStep) {
      handleStepChange(stepNumber);
    } else if (stepNumber !== currentStep) {
      handleStepChange(stepNumber);
    }
  };

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

  const handleSubmit = async () => {
    const stepErrors = validateStep(5);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (!formData.termsAccepted) return;

    try {
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
            whatsapp_agreement: formData.whatsappAgreement,
            voicemail_ok: formData.voicemailOk === "Yes",
            partner_email: formData.partnerEmail,
            partner_phone: formData.partnerPhone,
            currently_in_therapy: formData.currentlyInTherapy === "Yes",
            working_with_another_reason:
              formData.workingWithAnotherReason || null,
            location_of_residence: formData.locationOfResidence,

            service_type: "Counselling & Coaching",
            support_areas: formData.supportAreas || [],
            concerns_details: formData.concernsDetails || null,
            availability: formData.availability || {},

            hear_about_us: formData.hearAboutUs || null,
            referral_type: formData.referralType || null,

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
      let clientIdFromRes =
        data.client_id || (data.form && data.form.client_id);
      setClientId(clientIdFromRes);

      const proceedToSuccess = () => {
        const params = new URLSearchParams();
        params.append(
          "uuid",
          data.client_uuid || (data.form && data.form.uuid),
        );
        window.location.href = `/intake/success?${params.toString()}`;
      };

      const fee = getConsultationFee();
      if (fee > 0 && clientIdFromRes) {
        setPaymentProps({
          clientId: clientIdFromRes,
          amount: fee,
          couponCode: isDiscountApplied ? formData.discountCode : null,
          onSuccess: proceedToSuccess,
          onError: (err) =>
            toast.error(`Payment failed: ${err.message || "Please try again"}`),
        });
        setShowPaymentModal(true);
      } else {
        proceedToSuccess();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit form.");
    }
  };

  const steps = [
    { number: 1, title: "Personal", icon: User },
    { number: 2, title: "Availability", icon: Calendar },
    { number: 3, title: "Referral", icon: User },
    { number: 4, title: "Concerns", icon: MessageCircle },
    { number: 5, title: "Payment", icon: CreditCard },
  ];

  if (submitted) {
    return (
      <PublicFormWrapper>
        <div
          className="min-h-screen"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="flex items-center justify-center p-4 min-h-screen">
            <div className="card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border text-primary bg-white">
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
          <div className="card rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border bg-white">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  VT
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-lg md:text-2xl font-bold text-primary">
                    Counselling & Coaching Consultation Form
                  </h1>
                  <p className="text-sm mt-0.5 md:mt-1 text-secondary">
                    By completing this form, you (client) are giving permission
                    for your information to be shared within Vanquish Therapies
                    for the purpose of appointment scheduling.
                  </p>
                </div>
              </div>
            </div>

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
                        <div className="flex flex-col items-center flex-1">
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
                            className={`h-1 mx-2 rounded transition-colors w-full ${currentStep > step.number ? "" : "bg-gray-200"}`}
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
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary text-center">
                  Personal Information
                </h2>
                <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  (Please be advised that all required fields must be completed
                  in the form. Failure to do so may result in an error.
                  Therefore, it is crucial that you carefully review the form
                  and provide accurate and complete information to avoid any
                  issues. For any fields that do not apply to you, please enter
                  "N/A.")
                </div>

                {isCapacityFull && (
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-5 mb-6">
                    <p className="text-orange-900 font-bold mb-3">
                      Service at Capacity
                    </p>
                    <p className="text-orange-800 mb-4">
                      {capacityData.message}
                    </p>
                    <a
                      href={capacityData.alternative_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-medium"
                    >
                      Continue with VQT COACHING & THERAPY
                    </a>
                  </div>
                )}

                {!isCapacityFull && (
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
                        Tel: <span className="text-red-500">*</span>
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
                    <div className="md:col-span-2">
                      <label className="block text-base font-medium mb-2 text-primary">
                        We primarily communicate through Emails and WhatsApp. Do
                        you agree to this method of communication?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.whatsappAgreement}
                        onChange={(e) =>
                          handleInputChange("whatsappAgreement", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg ${errors.whatsappAgreement ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Please Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No WhatsApp">
                          I prefer emails but not WhatsApp (This is the only
                          messaging/texting platform we use currently).
                        </option>
                      </select>
                      {errors.whatsappAgreement && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.whatsappAgreement}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-base font-medium mb-2 text-primary">
                        Is it okay for us to leave you a voicemail?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.voicemailOk}
                        onChange={(e) =>
                          handleInputChange("voicemailOk", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg ${errors.voicemailOk ? "border-red-500" : "border-gray-300"}`}
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
                    <div>
                      <label className="block text-base font-medium mb-2 text-primary">
                        Partner's Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.partnerEmail}
                        onChange={(e) =>
                          handleInputChange("partnerEmail", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg ${errors.partnerEmail ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.partnerEmail && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.partnerEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-2 text-primary">
                        Partner's Contact No.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.partnerPhone}
                        onChange={(e) =>
                          handleInputChange("partnerPhone", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg ${errors.partnerPhone ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.partnerPhone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.partnerPhone}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-base font-medium mb-2 text-primary">
                        Are you currently in Therapy/Counselling or Coaching
                        anywhere else? <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.currentlyInTherapy}
                        onChange={(e) =>
                          handleInputChange(
                            "currentlyInTherapy",
                            e.target.value,
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg ${errors.currentlyInTherapy ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Please Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errors.currentlyInTherapy && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.currentlyInTherapy}
                        </p>
                      )}
                    </div>
                    {formData.currentlyInTherapy === "Yes" && (
                      <div className="md:col-span-2">
                        <label className="block text-base font-medium mb-2 text-primary">
                          Please explain reasons for working with another
                          Therapist/Counsellor or Coach{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.workingWithAnotherReason}
                          onChange={(e) =>
                            handleInputChange(
                              "workingWithAnotherReason",
                              e.target.value,
                            )
                          }
                          className={`w-full px-4 py-3 border rounded-lg ${errors.workingWithAnotherReason ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Reasons..."
                        />
                        {errors.workingWithAnotherReason && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.workingWithAnotherReason}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-base font-medium mb-2 text-primary">
                        Please state where you reside in the world. Please note,
                        our Practice is based in the UK. Therefore, the
                        Consultations and Session times are scheduled in UK
                        time. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.locationOfResidence}
                        onChange={(e) =>
                          handleInputChange(
                            "locationOfResidence",
                            e.target.value,
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg ${errors.locationOfResidence ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Your location..."
                      />
                      {errors.locationOfResidence && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.locationOfResidence}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary text-center">
                  Your Availability
                </h2>
                {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
                  (day) => (
                    <div key={day} className="border rounded-lg p-4 mb-4">
                      <h3 className="font-bold capitalize mb-3 text-purple-900">
                        {day}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(day === "friday" ? fridayTimeSlots : timeSlots)
                          .filter((slot) => ISH_SCHEDULE[day].includes(slot.value))
                          .map((slot) => (
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
                {errors.availability && (
                  <p className="text-red-500 text-sm">{errors.availability}</p>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary text-center">
                  Referral Information
                </h2>
                <div>
                  <label className="block text-base font-medium mb-2 text-primary">
                    How did you become aware of my services?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hearAboutUs}
                    onChange={(e) =>
                      handleInputChange("hearAboutUs", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg ${errors.hearAboutUs ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Please Select</option>
                    <option value="Online (Google, Bing etc)">
                      Online (Google, Bing etc)
                    </option>
                    <option value="Social Media (Facebook, Instagram)">
                      Social Media (Facebook, Instagram)
                    </option>
                    <option value="Referral">Referral</option>
                    <option value="Word of mouth">Word of mouth</option>
                    <option value="Billboard">Billboard</option>
                  </select>
                  {errors.hearAboutUs && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.hearAboutUs}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-primary">
                    Please click below to select the referral type:{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.referralType}
                    onChange={(e) =>
                      handleInputChange("referralType", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg ${errors.referralType ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Please Select</option>
                    <option value="Self-Referral">Self-Referral</option>
                    <option value="Referred Through an Organisation">
                      Referred Through an Organisation
                    </option>
                    <option value="Referred Through an Individual">
                      Referred Through an Individual
                    </option>
                  </select>
                  {errors.referralType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.referralType}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary text-center">
                  Areas You Require Support With
                </h2>
                <p className="text-sm text-gray-700">
                  We have listed a few areas below you may require support
                  with.*
                </p>
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
                {errors.supportAreas && (
                  <p className="text-red-500 text-sm -mt-4 mb-4">
                    {errors.supportAreas}
                  </p>
                )}

                <div className="mt-4">
                  <label className="block text-base font-medium mb-2 text-primary">
                    Please use this box to specify and describe details related
                    to the above selected areas or mention anything else not
                    listed above that you would like support with.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.concernsDetails}
                    onChange={(e) =>
                      handleInputChange("concernsDetails", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Details about concerns..."
                    rows="4"
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary text-center">
                  Payment & Terms
                </h2>

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="font-bold mb-2">Terms & Conditions</h3>
                  <p className="text-sm mb-4">
                    Please note: Our consultation slots are limited; therefore,
                    this means payment is required to secure another
                    consultation. We appreciate your understanding. The
                    Consultation payment is non-refundable.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) =>
                        handleInputChange("termsAccepted", e.target.checked)
                      }
                      className="mt-1 accent-[#6f1d56]"
                    />
                    <span className="font-medium text-sm">
                      I accept the terms and conditions.
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>

                <div className="p-6 border-2 border-purple-200 rounded-xl bg-purple-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-purple-900">
                      Counselling & Coaching Initial Consultation
                    </h3>
                    <p className="text-sm text-purple-700">Non-refundable</p>
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

                <div className="text-sm mt-6 text-gray-600 bg-blue-50 p-4 rounded-lg">
                  Thank you for completing this form and for taking the first
                  step towards healing. I understand that starting Counselling
                  or Coaching can feel daunting but please know, Vanquish
                  Therapies is here to support you every step of the way.
                  Please note – this is not a crisis or emergency service. If
                  you need to speak to someone immediately, please contact your
                  GP, NHS (111),or the Samaritans (116 123).
                </div>
              </div>
            )}

            {!(isCapacityFull) && (
              <div className="flex justify-between mt-10 pt-6 border-t">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                {currentStep < steps.length ? (
                  <button
                    onClick={handleNext}
                    className="px-8 py-2 bg-[#6f1d56] text-white rounded-lg"
                  >
                    Next
                  </button>
                ) : (
                  !clientId && (
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.termsAccepted}
                      className="px-8 py-2 bg-[#6f1d56] text-white rounded-lg disabled:opacity-50"
                    >
                      Save & Proceed to Payment
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

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
                paymentType="consultation"
                onSuccess={paymentProps.onSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </PublicFormWrapper>
  );
}
