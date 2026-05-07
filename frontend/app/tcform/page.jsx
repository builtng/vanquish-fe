"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Save,
  Settings,
} from "lucide-react";

import apiService from "@/lib/api";
import { toast } from "react-toastify";

export default function TCProfileForm() {
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    phone: "",
    address: "",

    // Demographics
    age: "",
    date_of_birth: "",
    gender: "",
    ethnicity: "",
    sexualOrientation: "",
    lgbtqSpecialist: false,

    // Professional
    modalities: [],
    experienceYears: "",
    qualifications: "",
    course_title: "",
    training_org_name: "",

    // Availability
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },

    // Topics
    topics_with_experience: [],
    topics_not_ready_for: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    active: false,
    message: "",
  });

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const data = await apiService.checkMaintenance();
        setMaintenanceStatus({
          active: data.maintenance_mode,
          message: data.message,
        });
      } catch (error) {
        console.error("Error checking maintenance:", error);
      }
    };

    checkMaintenance();
  }, []);

  const modalities = [
    "Person-Centred Counselling",
    "Cognitive Behavioral Therapy (CBT)",
    "Integrative Counselling and Therapy",
    "Psychodynamic Therapy",
    "Gestalt Therapy",
    "Humanistic Therapy",
    "Solution-Focused Brief Therapy",
    "Acceptance and Commitment Therapy (ACT)",
    "Dialectical Behavior Therapy (DBT)",
    "Art Therapy",
    "Play Therapy",
    "Family Therapy",
  ];

  const sensitiveTopics = [
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
  ];

  const timeBlocks = ["morning", "afternoon", "evening"];
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModalityToggle = (modality) => {
    setFormData((prev) => ({
      ...prev,
      modalities: prev.modalities.includes(modality)
        ? prev.modalities.filter((m) => m !== modality)
        : [...prev.modalities, modality],
    }));
  };

  const handleTopicToggle = (topic) => {
    setFormData((prev) => ({
      ...prev,
      topics_not_ready_for: prev.topics_not_ready_for.includes(topic)
        ? prev.topics_not_ready_for.filter((t) => t !== topic)
        : [...prev.topics_not_ready_for, topic],
    }));
  };

  const handleAvailabilityToggle = (day, timeBlock) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].includes(timeBlock)
          ? prev.availability[day].filter((t) => t !== timeBlock)
          : [...prev.availability[day], timeBlock],
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        sexual_orientation: formData.sexualOrientation,
        date_of_birth: formData.date_of_birth,
        modality: formData.modalities.join(", "),
        course_title: formData.course_title,
        training_org_name: formData.training_org_name,
        topics_not_ready_for: formData.topics_not_ready_for,
        availability: formData.availability,
        create_tc: true,
      };

      const res = await apiService.submitTCIntake(payload);
      
      if (res.message) {
        setSubmitted(true);
        toast.success("Profile submitted successfully!");
      }
    } catch (err) {
      console.error("Error submitting TC profile:", err);
      toast.error(err.message || "Failed to submit profile.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Professional", icon: Briefcase },
    { number: 3, title: "Availability", icon: Calendar },
    { number: 4, title: "Topics", icon: AlertTriangle },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing your profile. Our admin team will review
            your information and get back to you shortly.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                fullName: "",
                email: "",
                phone: "",
                age: "",
                gender: "",
                ethnicity: "",
                sexualOrientation: "",
                lgbtqSpecialist: false,
                modalities: [],
                experienceYears: "",
                qualifications: "",
                availability: {
                  monday: [],
                  tuesday: [],
                  wednesday: [],
                  thursday: [],
                  friday: [],
                  saturday: [],
                  sunday: [],
                },
                notReadyFor: [],
              });
            }}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Submit Another Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Trainee Counsellor Registration
              </h1>
              <p className="text-gray-600 mt-1">
                Join Vanquish Therapies as a counsellor
              </p>
            </div>
            <div className="text-sm text-gray-500">Step {currentStep} of 4</div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
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
                    className={`text-xs mt-2 ${
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
                "The registrations are currently undergoing maintenance. Please check back later."}
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
        {!maintenanceStatus.active && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Dr. Jane Smith"
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
                      placeholder="jane@example.com"
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Street name, City, Postcode"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
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
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.lgbtqSpecialist}
                        onChange={(e) =>
                          handleInputChange("lgbtqSpecialist", e.target.checked)
                        }
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        I am an LGBTQ+ specialist (have training/expertise in
                        LGBTQ+ issues)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Professional Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Institution <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.training_org_name}
                      onChange={(e) =>
                        handleInputChange("training_org_name", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="University of..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.course_title}
                      onChange={(e) =>
                        handleInputChange("course_title", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="MSc Counselling & Psychotherapy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experienceYears}
                      onChange={(e) =>
                        handleInputChange("experienceYears", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications / Certifications
                  </label>
                  <textarea
                    value={formData.qualifications}
                    onChange={(e) =>
                      handleInputChange("qualifications", e.target.value)
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="List your qualifications, certifications, and degrees..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Therapy Modalities <span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Select all that apply)
                    </span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {modalities.map((modality) => (
                        <label
                          key={modality}
                          className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.modalities.includes(modality)}
                            onChange={() => handleModalityToggle(modality)}
                            className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                          />
                          <span className="text-sm text-gray-700">
                            {modality}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.modalities.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {formData.modalities.length} modality(ies)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Your Availability
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Select all days and time blocks when you're available for
                    sessions
                  </p>
                </div>

                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-300">
                    <div className="p-3 font-medium text-sm text-gray-700 border-r border-gray-300">
                      Day
                    </div>
                    <div className="p-3 font-medium text-sm text-gray-700 text-center border-r border-gray-300">
                      Morning
                    </div>
                    <div className="p-3 font-medium text-sm text-gray-700 text-center border-r border-gray-300">
                      Afternoon
                    </div>
                    <div className="p-3 font-medium text-sm text-gray-700 text-center">
                      Evening
                    </div>
                  </div>
                  {days.map((day) => (
                    <div
                      key={day}
                      className="grid grid-cols-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="p-3 font-medium text-sm text-gray-900 capitalize border-r border-gray-200">
                        {day}
                      </div>
                      {timeBlocks.map((timeBlock) => (
                        <div
                          key={timeBlock}
                          className="p-3 flex items-center justify-center border-r border-gray-200 last:border-r-0"
                        >
                          <label className="cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.availability[day].includes(
                                timeBlock,
                              )}
                              onChange={() =>
                                handleAvailabilityToggle(day, timeBlock)
                              }
                              className="w-6 h-6 text-purple-600 border-gray-300 rounded focus:ring-purple-600 cursor-pointer"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Time blocks are defined as:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
                    <li>
                      • <strong>Morning:</strong> 8:00 AM - 12:00 PM
                    </li>
                    <li>
                      • <strong>Afternoon:</strong> 12:00 PM - 5:00 PM
                    </li>
                    <li>
                      • <strong>Evening:</strong> 5:00 PM - 9:00 PM
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Topics Not Ready For */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Topics You're Not Ready to Handle
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Select any topics you currently feel unprepared to work
                    with. This ensures client safety and your comfort.
                  </p>
                </div>

                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sensitiveTopics.map((topic) => (
                      <label
                        key={topic}
                        className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.topics_not_ready_for.includes(topic)}
                          onChange={() => handleTopicToggle(topic)}
                          className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-600"
                        />
                        <span className="text-sm text-gray-700">{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.topics_not_ready_for.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800">
                      You've marked{" "}
                      <strong>{formData.topics_not_ready_for.length} topic(s)</strong> as
                      areas you're not ready to handle. The system will flag any
                      clients with these issues for admin review.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Important:</strong> You can update this list anytime
                    as you gain more experience and training.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1 || loading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1 || loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              <div className="text-sm text-gray-600">
                Step {currentStep} of 4
              </div>

              {currentStep < 4 ? (
                <button
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(4, prev + 1))
                  }
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Submit Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
