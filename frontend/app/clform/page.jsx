"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Heart,
  Calendar,
  Settings,
  CreditCard,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import apiService from "@/lib/api";
import { toast } from "react-toastify";
import { useBranding } from "@/contexts/BrandingContext";

export default function ClientInformationSheet() {
  const { branding, loading: brandingLoading } = useBranding();
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postcode: "",
    country: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    emergencyContactRelationship: "",

    // Demographics
    age: "",
    gender: "",
    ethnicity: "",
    sexualOrientation: "",

    // Therapy Details
    issues: [],
    modality: "",

    // Availability
    selectedDay: "",
    selectedTimeBlock: "",

    // Preferences
    genderPreference: "No preference",
    agePreference: "No preference",
    ageRangeMin: "",
    ageRangeMax: "",
    ethnicityPreference: "No preference",
    orientationPreference: "No preference",
    specificOrientation: "",

    // Payment
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    couponCode: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [capacityStatus, setCapacityStatus] = useState({
    full: false,
    message: "",
    alternativeUrl: "",
  });

  const [maintenanceStatus, setMaintenanceStatus] = useState({
    active: false,
    message: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check Maintenance Status
        const maintenanceData = await apiService.checkMaintenance();
        setMaintenanceStatus({
          active: maintenanceData.maintenance_mode,
          message: maintenanceData.message,
        });

        // Check Capacity Status
        const capacityData = await apiService.checkCoachingCapacity();
        setCapacityStatus({
          full: capacityData.capacity_full,
          message: capacityData.message,
          alternativeUrl: capacityData.alternative_url,
        });
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    checkStatus();
  }, []);

  const issues = [
    "Domestic Violence",
    "Sexual Abuse",
    "Child Abuse",
    "Self-Harm",
    "Suicidal Ideation",
    "Eating Disorders",
    "Substance Abuse",
    "Trauma/PTSD",
    "Grief and Bereavement",
    "Relationship Issues",
    "Anxiety Disorders",
    "Depression",
    "Obsessive-Compulsive Disorder (OCD)",
    "Personality Disorders",
    "Psychosis",
    "Stress Management",
    "Work-Life Balance",
    "Identity Issues",
    "Low Self-Esteem",
  ];

  const modalities = [
    "Person-Centred Counselling",
    "Cognitive Behavioral Therapy (CBT)",
    "Integrative Counselling and Therapy",
    "Psychodynamic Therapy",
    "No specific preference",
  ];

  const days = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const timeBlocks = [
    { value: "morning", label: "Morning (8:00 AM - 12:00 PM)" },
    { value: "afternoon", label: "Afternoon (12:00 PM - 5:00 PM)" },
    { value: "evening", label: "Evening (5:00 PM - 9:00 PM)" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIssueToggle = (issue) => {
    setFormData((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        postcode: formData.postcode,
        country: formData.country,
        age: formData.age,
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        sexual_orientation: formData.sexualOrientation,
        service_type: "Partner Service Intake",
        support_areas: formData.issues,
        modality: formData.modality,
        availability: {
          [formData.selectedDay]: [formData.selectedTimeBlock],
        },
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_email: formData.emergencyContactEmail,
        emergency_contact_relationship: formData.emergencyContactRelationship,
        gender_preference: formData.genderPreference,
        age_preference: formData.agePreference,
        ethnicity_preference: formData.ethnicityPreference,
        orientation_preference: formData.orientationPreference,
        discount_code: formData.couponCode,
        create_client: true,
      };

      const res = await apiService.submitClientIntake(payload);
      if (res.message) {
        setSubmitted(true);
        toast.success("Registration submitted successfully!");
      }
    } catch (err) {
      console.error("Error submitting intake:", err);
      toast.error(err.message || "Failed to submit registration.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Your Needs", icon: Heart },
    { number: 3, title: "Availability", icon: Calendar },
    { number: 4, title: "Preferences", icon: Settings },
    { number: 5, title: "Payment", icon: CreditCard },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your booking. Our team is now matching you with the
            perfect counsellor. You'll receive a confirmation email within 24
            hours.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>Your booking:</strong>{" "}
              {formData.selectedDay.charAt(0).toUpperCase() +
                formData.selectedDay.slice(1)}{" "}
              {formData.selectedTimeBlock}
            </p>
            <p className="text-sm text-purple-700 mt-1">
              This is a recurring booking for ongoing therapy sessions.
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
            }}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Return to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
          {brandingLoading ? (
            <div className="flex flex-col items-center animate-pulse w-full">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mb-4 md:mb-6">
              <div className="inline-flex items-center justify-center mb-4">
                {branding.platform_logo_url ? (
                  <img
                    src={apiService.getStorageUrl(branding.platform_logo_url)}
                    alt={branding.company_name}
                    className="max-h-16 md:max-h-20 object-contain"
                  />
                ) : (
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl"
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
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {branding.company_name || "Vanquish Therapies"} - Professional counselling support
              </h1>
              <div className="text-sm text-gray-500 mt-4">Step {currentStep} of 5</div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-between border-t pt-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      currentStep >= step.number
                        ? "text-purple-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded ${
                      currentStep > step.number
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {maintenanceStatus.active && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 mb-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-10 h-10 text-red-600 animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              System Maintenance
            </h2>
            <p className="text-red-700 max-w-lg mx-auto">
              {maintenanceStatus.message ||
                "The registration system is currently undergoing maintenance. Please check back later."}
            </p>
            <div className="mt-6">
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Complete Current Address of Residence Including
                    Postcode & City (As the sessions are online, this
                    information is required for safeguarding and insurance
                    purposes): <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Please enter your full address here..."
                  />
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Emergency Contact Details (As the sessions are online, this
                    information is required for safeguarding and insurance
                    purposes):
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telephone Number of Your Emergency Contact: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="+44..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.emergencyContactEmail}
                    onChange={(e) => handleInputChange("emergencyContactEmail", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship to You <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="e.g. Spouse, Parent, Friend"
                  />
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="28"
                  />
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Demographics</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ethnicity}
                    onChange={(e) =>
                      handleInputChange("ethnicity", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">Select ethnicity</option>
                    <option value="Asian">Asian</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Hispanic/Latino">Hispanic/Latino</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Orientation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sexualOrientation}
                    onChange={(e) =>
                      handleInputChange("sexualOrientation", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">Select orientation</option>
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
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Your Needs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  What brings you to therapy?
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select all the concerns you'd like to address. This helps us
                  match you with the right counsellor.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Concerns <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Select all that apply)
                  </span>
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {issues.map((issue) => (
                      <label
                        key={issue}
                        className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.issues.includes(issue)}
                          onChange={() => handleIssueToggle(issue)}
                          className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                        />
                        <span className="text-sm text-gray-700">{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.issues.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.issues.length} concern(s)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Therapy Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.modality}
                  onChange={(e) =>
                    handleInputChange("modality", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">Select therapy type</option>
                  {modalities.map((modality) => (
                    <option key={modality} value={modality}>
                      {modality}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Not sure? Select "No specific preference" and we'll recommend
                  the best approach for you.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  When would you like your sessions?
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select ONE day and time block for your recurring therapy
                  sessions
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> This will be your regular therapy
                  day and time. Sessions are ongoing (not one-off).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Day <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.selectedDay}
                  onChange={(e) =>
                    handleInputChange("selectedDay", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">Select a day</option>
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time Block <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {timeBlocks.map((block) => (
                    <label
                      key={block.value}
                      className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      <input
                        type="radio"
                        name="timeBlock"
                        value={block.value}
                        checked={formData.selectedTimeBlock === block.value}
                        onChange={(e) =>
                          handleInputChange("selectedTimeBlock", e.target.value)
                        }
                        className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-600"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {block.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.selectedDay && formData.selectedTimeBlock && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Your recurring session time:</strong> Every{" "}
                    {formData.selectedDay.charAt(0).toUpperCase() +
                      formData.selectedDay.slice(1)}{" "}
                    {formData.selectedTimeBlock}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Counsellor Preferences
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  All preferences are optional. Select "No preference" if you
                  don't have specific requirements.
                </p>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Preference
                </label>
                <select
                  value={formData.genderPreference}
                  onChange={(e) =>
                    handleInputChange("genderPreference", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="No preference">No preference</option>
                  <option value="Male">Prefer Male counsellor</option>
                  <option value="Female">Prefer Female counsellor</option>
                  <option value="Non-binary">
                    Prefer Non-binary counsellor
                  </option>
                </select>
              </div>

              {/* Age Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Preference
                </label>
                <select
                  value={formData.agePreference}
                  onChange={(e) =>
                    handleInputChange("agePreference", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="No preference">No preference</option>
                  <option value="Younger">
                    Prefer younger counsellor (close to my age)
                  </option>
                  <option value="Older">Prefer older counsellor</option>
                  <option value="Custom range">Custom age range</option>
                </select>
              </div>

              {formData.agePreference === "Custom range" && (
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Age
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={formData.ageRangeMin}
                      onChange={(e) =>
                        handleInputChange("ageRangeMin", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Age
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={formData.ageRangeMax}
                      onChange={(e) =>
                        handleInputChange("ageRangeMax", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="40"
                    />
                  </div>
                </div>
              )}

              {/* Ethnicity Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ethnicity Preference
                </label>
                <select
                  value={formData.ethnicityPreference}
                  onChange={(e) =>
                    handleInputChange("ethnicityPreference", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="No preference">No preference</option>
                  <option value="Prefer same">
                    Prefer same ethnicity as me
                  </option>
                </select>
              </div>

              {/* Sexual Orientation Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexual Orientation Preference
                </label>
                <select
                  value={formData.orientationPreference}
                  onChange={(e) =>
                    handleInputChange("orientationPreference", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="No preference">No preference</option>
                  <option value="LGBTQ+ specialist">
                    Prefer LGBTQ+ specialist
                  </option>
                  <option value="Same orientation">
                    Prefer same orientation as me
                  </option>
                  <option value="Specific">Prefer specific orientation</option>
                </select>
              </div>

              {formData.orientationPreference === "Specific" && (
                <div className="pl-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Orientation
                  </label>
                  <select
                    value={formData.specificOrientation}
                    onChange={(e) =>
                      handleInputChange("specificOrientation", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">Select orientation</option>
                    <option value="Gay">Gay counsellor</option>
                    <option value="Lesbian">Lesbian counsellor</option>
                    <option value="Bisexual">Bisexual counsellor</option>
                    <option value="Heterosexual">
                      Heterosexual counsellor
                    </option>
                  </select>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> These preferences help us find the best
                  match, but availability is our top priority. We'll do our best
                  to match all your preferences while ensuring you get an
                  appointment.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Payment Details
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Secure your booking with payment
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Booking Summary
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      {formData.selectedDay.charAt(0).toUpperCase() +
                        formData.selectedDay.slice(1)}{" "}
                      •{" "}
                      {formData.selectedTimeBlock.charAt(0).toUpperCase() +
                        formData.selectedTimeBlock.slice(1)}
                    </p>
                    <p className="text-xs text-purple-700">
                      {formData.modality || "Standard therapy session"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-900">£85</p>
                    <p className="text-xs text-purple-700">per session</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cardName}
                  onChange={(e) =>
                    handleInputChange("cardName", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    handleInputChange("cardNumber", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) =>
                    handleInputChange("couponCode", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter discount code"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      handleInputChange("expiryDate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600">
                  🔒 Your payment information is secure and encrypted. By
                  completing this booking, you agree to our terms of service and
                  cancellation policy.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {/* Form Content */}
          {!maintenanceStatus.active && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="+44 7700 900000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="28"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be 18 or older
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ethnicity <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.ethnicity}
                        onChange={(e) =>
                          handleInputChange("ethnicity", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        <option value="">Select ethnicity</option>
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexual Orientation{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.sexualOrientation}
                        onChange={(e) =>
                          handleInputChange("sexualOrientation", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        <option value="">Select orientation</option>
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
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Your Needs */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      What brings you to therapy?
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Select all the concerns you'd like to address. This helps
                      us match you with the right counsellor.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Primary Concerns <span className="text-red-500">*</span>
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Select all that apply)
                      </span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {issues.map((issue) => (
                          <label
                            key={issue}
                            className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.issues.includes(issue)}
                              onChange={() => handleIssueToggle(issue)}
                              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                            />
                            <span className="text-sm text-gray-700">
                              {issue}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {formData.issues.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {formData.issues.length} concern(s)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Therapy Type{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.modality}
                      onChange={(e) =>
                        handleInputChange("modality", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="">Select therapy type</option>
                      {modalities.map((modality) => (
                        <option key={modality} value={modality}>
                          {modality}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Not sure? Select "No specific preference" and we'll
                      recommend the best approach for you.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Availability */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      When would you like your sessions?
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Select ONE day and time block for your recurring therapy
                      sessions
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> This will be your regular
                      therapy day and time. Sessions are ongoing (not one-off).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Day <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.selectedDay}
                      onChange={(e) =>
                        handleInputChange("selectedDay", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="">Select a day</option>
                      {days.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time Block{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {timeBlocks.map((block) => (
                        <label
                          key={block.value}
                          className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        >
                          <input
                            type="radio"
                            name="timeBlock"
                            value={block.value}
                            checked={formData.selectedTimeBlock === block.value}
                            onChange={(e) =>
                              handleInputChange(
                                "selectedTimeBlock",
                                e.target.value,
                              )
                            }
                            className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-600"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {block.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.selectedDay && formData.selectedTimeBlock && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Your recurring session time:</strong> Every{" "}
                        {formData.selectedDay.charAt(0).toUpperCase() +
                          formData.selectedDay.slice(1)}{" "}
                        {formData.selectedTimeBlock}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Preferences */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Counsellor Preferences
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      All preferences are optional. Select "No preference" if
                      you don't have specific requirements.
                    </p>
                  </div>

                  {/* Gender Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender Preference
                    </label>
                    <select
                      value={formData.genderPreference}
                      onChange={(e) =>
                        handleInputChange("genderPreference", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="Male">Prefer Male counsellor</option>
                      <option value="Female">Prefer Female counsellor</option>
                      <option value="Non-binary">
                        Prefer Non-binary counsellor
                      </option>
                    </select>
                  </div>

                  {/* Age Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Preference
                    </label>
                    <select
                      value={formData.agePreference}
                      onChange={(e) =>
                        handleInputChange("agePreference", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="Younger">
                        Prefer younger counsellor (close to my age)
                      </option>
                      <option value="Older">Prefer older counsellor</option>
                      <option value="Custom range">Custom age range</option>
                    </select>
                  </div>

                  {formData.agePreference === "Custom range" && (
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Age
                        </label>
                        <input
                          type="number"
                          min="18"
                          max="100"
                          value={formData.ageRangeMin}
                          onChange={(e) =>
                            handleInputChange("ageRangeMin", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Age
                        </label>
                        <input
                          type="number"
                          min="18"
                          max="100"
                          value={formData.ageRangeMax}
                          onChange={(e) =>
                            handleInputChange("ageRangeMax", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="40"
                        />
                      </div>
                    </div>
                  )}

                  {/* Ethnicity Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ethnicity Preference
                    </label>
                    <select
                      value={formData.ethnicityPreference}
                      onChange={(e) =>
                        handleInputChange("ethnicityPreference", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="Prefer same">
                        Prefer same ethnicity as me
                      </option>
                    </select>
                  </div>

                  {/* Sexual Orientation Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="No preference">No preference</option>
                      <option value="LGBTQ+ specialist">
                        Prefer LGBTQ+ specialist
                      </option>
                      <option value="Same orientation">
                        Prefer same orientation as me
                      </option>
                      <option value="Specific">
                        Prefer specific orientation
                      </option>
                    </select>
                  </div>

                  {formData.orientationPreference === "Specific" && (
                    <div className="pl-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specify Orientation
                      </label>
                      <select
                        value={formData.specificOrientation}
                        onChange={(e) =>
                          handleInputChange(
                            "specificOrientation",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        <option value="">Select orientation</option>
                        <option value="Gay">Gay counsellor</option>
                        <option value="Lesbian">Lesbian counsellor</option>
                        <option value="Bisexual">Bisexual counsellor</option>
                        <option value="Heterosexual">
                          Heterosexual counsellor
                        </option>
                      </select>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> These preferences help us find the
                      best match, but availability is our top priority. We'll do
                      our best to match all your preferences while ensuring you
                      get an appointment.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Payment */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Payment Details
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Secure your booking with payment
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          Booking Summary
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                          {formData.selectedDay.charAt(0).toUpperCase() +
                            formData.selectedDay.slice(1)}{" "}
                          •{" "}
                          {formData.selectedTimeBlock.charAt(0).toUpperCase() +
                            formData.selectedTimeBlock.slice(1)}
                        </p>
                        <p className="text-xs text-purple-700">
                          {formData.modality || "Standard therapy session"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-900">
                          £85
                        </p>
                        <p className="text-xs text-purple-700">per session</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cardName}
                      onChange={(e) =>
                        handleInputChange("cardName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        handleInputChange("cardNumber", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.couponCode}
                      onChange={(e) =>
                        handleInputChange("couponCode", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter discount code"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) =>
                          handleInputChange("cvv", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600">
                      🔒 Your payment information is secure and encrypted. By
                      completing this booking, you agree to our terms of service
                      and cancellation policy.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                {capacityStatus.full ? (
                  <div className="w-full text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-800 font-medium mb-2">
                        {capacityStatus.message ||
                          "This service is currently at capacity."}
                      </p>
                      {capacityStatus.alternativeUrl && (
                        <a
                          href={capacityStatus.alternativeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                        >
                          Proceed to Partner Service
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setCurrentStep((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentStep === 1}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        currentStep === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="text-sm text-gray-600">
                      Step {currentStep} of 5
                    </div>

                    {currentStep < 5 ? (
                      <button
                        onClick={() =>
                          setCurrentStep((prev) => Math.min(5, prev + 1))
                        }
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Complete Booking
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
