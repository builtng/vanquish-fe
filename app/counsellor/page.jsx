"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  GraduationCap,
  Heart,
  Calendar,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertTriangle,
  Plus,
} from "lucide-react";
import apiService from "@/lib/api";
import SearchableSelect from "@/components/SearchableSelect";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import { useBranding } from "@/contexts/BrandingContext";

export default function VanquishTCApplication() {
  const { branding, loading: brandingLoading } = useBranding();
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    ethnicity: "",
    ethnicityOther: "",
    email: "",
    phone: "",
    sexualOrientation: "",
    sexualOrientationOther: "",
    address: "",
    city: "",
    postcode: "",
    beliefs: [],
    otherBeliefs: "",
    otherBeliefsSpecify: "",
    showSpecificBeliefs: false,
    disabilities: "",
    medicalConditions: "",

    // Professional Status
    hasIndemnityInsurance: "",
    professionalBodyMember: "",
    professionalBodyDetails: "",
    dbsRegistered: "",
    inPersonalTherapy: "",
    personalTherapyReason: "",
    hasClinicalSupervisor: "",
    supervisorReason: "",
    previousOnlineCounselling: "",

    // Availability
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },

    // Course Information
    trainingOrgName: "",
    trainingOrgAddress: "",
    tutorName: "",
    tutorEmail: "",
    tutorPhone: "",
    placementLeadName: "",
    placementLeadPhone: "",
    placementLeadEmail: "",
    courseTitle: "",
    expectedQualification: "",
    courseFocus: "",
    faceToFaceRequired: "",
    faceToFaceHours: "",
    currentClients: "",
    clientCount: "",
    completedHours: "",
    skillsPractice: "",

    // Experience & Journey
    familyDifficulties: "",
    personalJourney: "",
    selfAwareness: "",
    counsellorTraining: "",
    experienceAreas: "",
    developmentAreas: "",
    theoreticalApproach: [],
    theoreticalApproachOther: "",

    // Topics & Areas - NEW SECTIONS
    topicsExperienceWith: [],
    topicsExperienceOther: "",
    topicsNotReady: [],
    topicsNotReadyOther: "",

    psgDay: "",
    psgDayOther: "",

    // Documents
    fitnessTopractice: null,
    qualifications: null,
    dbs: null,
    cv: null,
    validId: null,
    insurance: null,
    docsConfirmed: false,

    // Terms
    criminalConviction: "",
    faceToFaceBeforeOnline: "",
    termsAccepted: false,
  });

  const [showDocModal, setShowDocModal] = useState(false);
  const [hasConfirmedDocs, setHasConfirmedDocs] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const formContentRef = useRef(null);

  const beliefsList = [
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
    "Other",
  ];

  // Comprehensive list of therapy topics/issues
  const therapyTopics = [
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
  ];

  // Hourly time slots - Mon-Thu last slot 6pm-7pm, Fri last slot 5pm-6pm
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

  // Friday time slots (last slot at 5pm-6pm)
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

  const theoreticalApproaches = [
    "Person-Centred",
    "Cognitive Behavioural Therapy (CBT)",
    "Psychodynamic",
    "Integrative",
    "Humanistic",
    "Gestalt",
    "Solution-Focused Brief Therapy",
    "Acceptance and Commitment Therapy (ACT)",
    "Dialectical Behaviour Therapy (DBT)",
    "Transactional Analysis (TA)",
    "Existential",
    "Systemic/Family Therapy",
    "Other",
  ];

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

  const handleBeliefsToggle = (belief) => {
    setFormData((prev) => ({
      ...prev,
      beliefs: prev.beliefs.includes(belief)
        ? prev.beliefs.filter((b) => b !== belief)
        : [...prev.beliefs, belief],
    }));
    // Clear error when user makes a selection
    if (errors.beliefs) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.beliefs;
        return newErrors;
      });
    }
  };

  const handleTopicToggle = (field, topic) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(topic)
        ? prev[field].filter((t) => t !== topic)
        : [...prev[field], topic],
    }));
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTheoreticalApproachToggle = (approach) => {
    setFormData((prev) => ({
      ...prev,
      theoreticalApproach: prev.theoreticalApproach.includes(approach)
        ? prev.theoreticalApproach.filter((a) => a !== approach)
        : [...prev.theoreticalApproach, approach],
    }));
    // Clear error when user makes a selection
    if (errors.theoreticalApproach) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.theoreticalApproach;
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

  const handleFileUpload = (field, files) => {
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [field]: files[0] }));
      // Clear error when user uploads a file
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  // Validation functions for each step
  const validateStep = (step) => {
    const stepErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim())
          stepErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          stepErrors.lastName = "Last name is required";
        if (!formData.dateOfBirth)
          stepErrors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) stepErrors.gender = "Gender is required";
        if (!formData.ethnicity) stepErrors.ethnicity = "Ethnicity is required";
        if (formData.ethnicity === "Other" && !formData.ethnicityOther.trim())
          stepErrors.ethnicityOther = "Please specify your ethnicity";
        if (!formData.sexualOrientation)
          stepErrors.sexualOrientation = "Sexual orientation is required";
        if (
          formData.sexualOrientation === "Other" &&
          !formData.sexualOrientationOther.trim()
        )
          stepErrors.sexualOrientationOther =
            "Please specify your sexual orientation";
        if (
          !formData.email.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          stepErrors.email = "Valid email is required";
        }
        if (!formData.phone.trim()) stepErrors.phone = "Phone is required";
        if (!formData.address.trim())
          stepErrors.address = "Address is required";
        if (!formData.city.trim()) stepErrors.city = "City is required";
        if (!formData.postcode.trim())
          stepErrors.postcode = "Postcode is required";
        if (formData.beliefs.length === 0)
          stepErrors.beliefs = "Please select at least one belief";
        if (!formData.disabilities.trim())
          stepErrors.disabilities =
            "This field is required (enter 'None' if applicable)";
        if (!formData.medicalConditions.trim())
          stepErrors.medicalConditions =
            "This field is required (enter 'None' if applicable)";
        break;

      case 2: // Professional Status
        if (!formData.hasIndemnityInsurance)
          stepErrors.hasIndemnityInsurance = "This field is required";
        if (!formData.professionalBodyMember)
          stepErrors.professionalBodyMember = "This field is required";
        if (
          formData.professionalBodyMember === "Yes" &&
          !formData.professionalBodyDetails.trim()
        ) {
          stepErrors.professionalBodyDetails =
            "Please provide membership details";
        }
        if (!formData.dbsRegistered)
          stepErrors.dbsRegistered = "This field is required";
        if (!formData.inPersonalTherapy)
          stepErrors.inPersonalTherapy = "This field is required";
        if (
          formData.inPersonalTherapy === "No" &&
          !formData.personalTherapyReason.trim()
        ) {
          stepErrors.personalTherapyReason = "Please explain why";
        }
        if (!formData.hasClinicalSupervisor)
          stepErrors.hasClinicalSupervisor = "This field is required";
        if (
          formData.hasClinicalSupervisor === "No" &&
          !formData.supervisorReason.trim()
        ) {
          stepErrors.supervisorReason = "Please explain why";
        }
        if (!formData.previousOnlineCounselling)
          stepErrors.previousOnlineCounselling = "This field is required";
        break;

      case 3: // Course Information
        if (!formData.trainingOrgName.trim())
          stepErrors.trainingOrgName = "Training organisation name is required";
        if (!formData.trainingOrgAddress.trim())
          stepErrors.trainingOrgAddress =
            "Training organisation address is required";
        if (!formData.tutorName.trim())
          stepErrors.tutorName = "Tutor name is required";
        if (
          !formData.tutorEmail.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.tutorEmail)
        ) {
          stepErrors.tutorEmail = "Valid tutor email is required";
        }
        if (!formData.tutorPhone.trim())
          stepErrors.tutorPhone = "Tutor phone is required";
        if (!formData.placementLeadName.trim())
          stepErrors.placementLeadName = "Placement lead name is required";
        if (!formData.placementLeadPhone.trim())
          stepErrors.placementLeadPhone = "Placement lead phone is required";
        if (
          !formData.placementLeadEmail.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.placementLeadEmail)
        ) {
          stepErrors.placementLeadEmail =
            "Valid placement lead email is required";
        }
        if (!formData.courseTitle.trim())
          stepErrors.courseTitle = "Course title is required";
        if (!formData.expectedQualification)
          stepErrors.expectedQualification =
            "Expected qualification date is required";
        if (!formData.courseFocus)
          stepErrors.courseFocus = "Course focus is required";
        if (!formData.faceToFaceRequired.trim())
          stepErrors.faceToFaceRequired = "This field is required";
        if (!formData.currentClients)
          stepErrors.currentClients = "This field is required";
        if (
          formData.currentClients &&
          formData.currentClients !== "None" &&
          !formData.clientCount.trim()
        ) {
          stepErrors.clientCount = "Please specify number of clients";
        }
        if (!formData.completedHours.trim())
          stepErrors.completedHours = "Completed hours is required";
        if (!formData.skillsPractice.trim())
          stepErrors.skillsPractice = "Skills practice information is required";
        if (!formData.faceToFaceBeforeOnline)
          stepErrors.faceToFaceBeforeOnline = "This field is required";
        break;

      case 4: // Your Journey
        if (!formData.familyDifficulties.trim())
          stepErrors.familyDifficulties = "This field is required";
        if (!formData.personalJourney.trim())
          stepErrors.personalJourney = "This field is required";
        if (!formData.selfAwareness.trim())
          stepErrors.selfAwareness = "This field is required";
        if (!formData.counsellorTraining.trim())
          stepErrors.counsellorTraining = "This field is required";
        if (formData.topicsExperienceWith.length === 0)
          stepErrors.topicsExperienceWith =
            "Please select at least one topic you have experience with";
        if (formData.topicsNotReady.length === 0)
          stepErrors.topicsNotReady =
            "Please select topics you're not ready for (select 'None' if applicable)";
        if (!formData.developmentAreas.trim())
          stepErrors.developmentAreas = "This field is required";
        if (formData.theoreticalApproach.length === 0)
          stepErrors.theoreticalApproach =
            "Please select at least one theoretical approach";
        if (
          formData.theoreticalApproach.includes("Other") &&
          !formData.theoreticalApproachOther.trim()
        ) {
          stepErrors.theoreticalApproachOther =
            "Please describe your theoretical approach";
        }
        break;

      case 5: // Availability
        const hasAvailability = Object.values(formData.availability).some(
          (day) => day.length > 0
        );
        if (!hasAvailability)
          stepErrors.availability = "Please select at least one time slot";
        if (!formData.psgDay) stepErrors.psgDay = "Please select a PSG day";
        break;

      case 6: // Documents
        if (!formData.docsConfirmed)
          stepErrors.docsConfirmed =
            "Please confirm you have read the document requirements";
        if (!formData.fitnessTopractice)
          stepErrors.fitnessTopractice =
            "Fitness to Practise document is required";
        if (!formData.qualifications)
          stepErrors.qualifications = "Qualifications document is required";
        if (!formData.dbs) stepErrors.dbs = "DBS certificate is required";
        if (!formData.cv) stepErrors.cv = "CV is required";
        if (!formData.validId) stepErrors.validId = "Valid ID is required";
        if (!formData.insurance)
          stepErrors.insurance = "Insurance document is required";
        break;

      case 7: // Review
        if (!formData.criminalConviction)
          stepErrors.criminalConviction = "This field is required";
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

  // Check if a step is completed
  const isStepCompleted = (step) => {
    const stepErrors = validateStep(step);
    return Object.keys(stepErrors).length === 0;
  };

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
      // Scroll to first error after a brief delay to ensure DOM is updated
      setTimeout(() => {
        const firstErrorField = Object.keys(stepErrors)[0];
        // Try multiple selectors to find the error field
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
    if (currentStep === 5 && !hasConfirmedDocs) {
      setShowDocModal(true);
    }
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

  const handleSubmit = async () => {
    // Validate final step
    const stepErrors = validateStep(7);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // ── Core identity ──────────────────────────────────────────────
      formDataToSubmit.append('name', `${formData.firstName} ${formData.lastName}`);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('phone', formData.phone || '');

      // ── Personal information ────────────────────────────────────────
      formDataToSubmit.append('date_of_birth', formData.dateOfBirth || '');
      formDataToSubmit.append('gender', formData.gender || '');
      formDataToSubmit.append('ethnicity', formData.ethnicity || '');
      formDataToSubmit.append('ethnicity_other', formData.ethnicityOther || '');
      formDataToSubmit.append('sexual_orientation', formData.sexualOrientation || '');
      formDataToSubmit.append('sexual_orientation_other', formData.sexualOrientationOther || '');
      const fullAddress = [formData.address, formData.city, formData.postcode].filter(Boolean).join(', ');
      formDataToSubmit.append('address', fullAddress);
      if (formData.beliefs && formData.beliefs.length > 0) {
        formDataToSubmit.append('beliefs', JSON.stringify(formData.beliefs));
      }
      
      const combinedOtherBeliefs = [
        formData.otherBeliefsSpecify ? `Other: ${formData.otherBeliefsSpecify}` : '',
        formData.otherBeliefs ? `Specific: ${formData.otherBeliefs}` : ''
      ].filter(Boolean).join(' | ');
      
      formDataToSubmit.append('beliefs_other', combinedOtherBeliefs);
      formDataToSubmit.append('disabilities', formData.disabilities || '');
      formDataToSubmit.append('medical_conditions', formData.medicalConditions || '');

      // ── Fitness to Practise ─────────────────────────────────────────
      formDataToSubmit.append('has_insurance', formData.hasIndemnityInsurance || '');
      formDataToSubmit.append('professional_body_member', formData.professionalBodyMember || '');
      formDataToSubmit.append('professional_body_details', formData.professionalBodyDetails || '');
      formDataToSubmit.append('dbs_update_service', formData.dbsRegistered || '');
      formDataToSubmit.append('in_personal_therapy', formData.inPersonalTherapy || '');
      formDataToSubmit.append('personal_therapy_reason', formData.personalTherapyReason || '');
      formDataToSubmit.append('has_clinical_supervisor', formData.hasClinicalSupervisor || '');
      formDataToSubmit.append('supervisor_reason', formData.supervisorReason || '');
      formDataToSubmit.append('previous_online_counselling', formData.previousOnlineCounselling || '');
      formDataToSubmit.append('criminal_convictions', formData.criminalConviction || '');

      // ── Training Organisation / course info ────────────────────────────
      formDataToSubmit.append('modality', formData.modality || '');
      formDataToSubmit.append('course', formData.courseTitle || '');
      formDataToSubmit.append('institution', formData.trainingOrgName || '');
      formDataToSubmit.append('training_org_name', formData.trainingOrgName || '');
      formDataToSubmit.append('training_org_address', formData.trainingOrgAddress || '');
      formDataToSubmit.append('college_address', formData.trainingOrgAddress || '');
      formDataToSubmit.append('course_title', formData.courseTitle || '');
      formDataToSubmit.append('expected_qualification_date', formData.expectedQualification || '');
      formDataToSubmit.append('counselling_type', formData.courseFocus || '');
      formDataToSubmit.append('face_to_face_requirement', formData.faceToFaceRequired || '');
      formDataToSubmit.append('face_to_face_before_online', formData.faceToFaceBeforeOnline || '');
      formDataToSubmit.append('has_face_to_face_clients', formData.currentClients || '');
      formDataToSubmit.append('face_to_face_client_count', formData.clientCount || '');
      formDataToSubmit.append('face_to_face_hours_completed', formData.completedHours || '');
      formDataToSubmit.append('skills_practice_details', formData.skillsPractice || '');
      formDataToSubmit.append('tutor_name', formData.tutorName || '');
      formDataToSubmit.append('tutor_email', formData.tutorEmail || '');
      formDataToSubmit.append('tutor_phone', formData.tutorPhone || '');
      formDataToSubmit.append('placement_lead_name', formData.placementLeadName || '');
      formDataToSubmit.append('placement_lead_email', formData.placementLeadEmail || '');
      formDataToSubmit.append('placement_lead_phone', formData.placementLeadPhone || '');

      // ── Experience & Journey ────────────────────────────────────────
      formDataToSubmit.append('family_impact', formData.familyDifficulties || '');
      formDataToSubmit.append('personal_journey', formData.personalJourney || '');
      formDataToSubmit.append('self_awareness', formData.selfAwareness || '');
      formDataToSubmit.append('training_history', formData.counsellorTraining || '');
      formDataToSubmit.append('areas_of_experience', formData.experienceAreas || '');
      formDataToSubmit.append('personal_development_areas', formData.developmentAreas || '');
      if (formData.theoreticalApproach && formData.theoreticalApproach.length > 0) {
        const approachStr = formData.theoreticalApproach.join(', ') +
          (formData.theoreticalApproachOther ? ` (${formData.theoreticalApproachOther})` : '');
        formDataToSubmit.append('theoretical_approach', approachStr);
      }

      // ── PSG Preference ──────────────────────────────────────────────
      formDataToSubmit.append('psg_day_preference', formData.psgDay || '');
      formDataToSubmit.append('psg_reason', formData.psgDayOther || '');

      // ── Array / JSON fields ─────────────────────────────────────────
      if (formData.topicsExperienceWith && formData.topicsExperienceWith.length > 0) {
        formDataToSubmit.append('topics_with_experience', JSON.stringify(formData.topicsExperienceWith));
      }
      formDataToSubmit.append('topics_experience_other', formData.topicsExperienceOther || '');
      
      if (formData.topicsNotReady && formData.topicsNotReady.length > 0) {
        formDataToSubmit.append('topics_not_ready_for', JSON.stringify(formData.topicsNotReady));
      }
      formDataToSubmit.append('topics_not_ready_other', formData.topicsNotReadyOther || '');

      if (formData.availability) {
        formDataToSubmit.append('availability', JSON.stringify(formData.availability));
        formDataToSubmit.append('availability_schedule', JSON.stringify(formData.availability));
      }
      
      // ── Document files ──────────────────────────────────────────────
      if (formData.fitnessTopractice) {
        formDataToSubmit.append('fitnessTopractice', formData.fitnessTopractice);
      }
      if (formData.qualifications) {
        formDataToSubmit.append('qualifications', formData.qualifications);
      }
      if (formData.dbs) {
        formDataToSubmit.append('dbs', formData.dbs);
      }
      if (formData.cv) {
        formDataToSubmit.append('cv', formData.cv);
      }
      if (formData.validId) {
        formDataToSubmit.append('validId', formData.validId);
      }
      if (formData.insurance) {
        formDataToSubmit.append('insurance', formData.insurance);
      }

      // Submit the form
      await apiService.submitTcIntake(formDataToSubmit);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Check if error has validation errors from backend
      if (error.data?.errors) {
        const validationErrors = error.data.errors;
        const fieldLabels = {
          validId: "Valid ID",
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone",
          fitnessTopractice: "Fitness to Practise",
          qualifications: "Qualifications",
          dbs: "DBS Certificate",
          cv: "CV",
          insurance: "Insurance",
        };
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => {
            const label = fieldLabels[field] || field;
            const message = Array.isArray(messages) ? messages.join(', ') : messages;
            if (field === 'validId') return "Please upload a valid ID document";
            return `${label}: ${message}`;
          })
          .join('\n');
        setSubmitError(`Validation failed:\n${errorMessages}`);
      } else {
        setSubmitError(error.message || 'Failed to submit form. Please try again.');
      }
      
      // Scroll to top to show error
      if (formContentRef.current) {
        formContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal", icon: User },
    { number: 2, title: "Professional", icon: Shield },
    { number: 3, title: "Course Info", icon: GraduationCap },
    { number: 4, title: "Your Journey", icon: Heart },
    { number: 5, title: "Availability", icon: Calendar },
    { number: 6, title: "Documents", icon: Upload },
    { number: 7, title: "Review", icon: FileText },
  ];

  if (submitted) {
    return (
      <PublicFormWrapper>
      <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-center p-4 min-h-screen">
          <div className="card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border">
            <div className="flex flex-col items-center justify-center mb-6 text-center">
               {brandingLoading ? (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 animate-pulse rounded-full mb-4"></div>
               ) : (
                  branding.platform_logo_url ? (
                    <img
                      src={apiService.getStorageUrl(branding.platform_logo_url)}
                      alt={branding.company_name}
                      className="max-h-20 md:max-h-24 object-contain mb-4"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-4"
                      style={{ backgroundColor: "#6f1d56" }}
                    >
                      {branding.company_name?.[0] || 'V'}
                    </div>
                  )
               )}
            </div>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--success-bg)', border: '2px solid var(--success-border)' }}>
              <CheckCircle className="w-12 h-12" style={{ color: 'var(--success-primary)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center" style={{ color: 'var(--text-primary)' }}>
              Application Submitted!
            </h2>
            <p className="mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
              Thank you for applying to join Vanquish Therapies as a Trainee
              Counsellor. We'll review your application and be in touch soon.
            </p>
            <div className="rounded-lg p-4 mb-6 border text-center" style={{ backgroundColor: 'var(--purple-bg)', borderColor: 'var(--purple-border)' }}>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Next Step:
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                • Stage 2: Short virtual video interview (Few questions)
              </p>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              A confirmation email has been sent to {formData.email}
            </p>
          </div>
        </div>
      </div>
      </PublicFormWrapper>
    );
  }

  return (
    <PublicFormWrapper>
    <div className="min-h-screen py-4 md:py-8 px-4" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border">
          <div className="flex flex-col items-center justify-center mb-4 md:mb-6 text-center">
            {brandingLoading ? (
               <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 animate-pulse rounded-full mb-4"></div>
            ) : (
               branding.platform_logo_url ? (
                 <img
                   src={apiService.getStorageUrl(branding.platform_logo_url)}
                   alt={branding.company_name}
                   className="max-h-20 md:max-h-24 object-contain mb-4"
                 />
               ) : (
                 <div
                   className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-4"
                   style={{ backgroundColor: "#6f1d56" }}
                 >
                   {branding.company_name?.[0] || 'V'}
                 </div>
               )
            )}
            <div>
              <h1 className="text-lg md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {branding.company_name || 'Vanquish Therapies'}
              </h1>
              <p className="text-sm md:text-base mt-0.5 md:mt-1" style={{ color: 'var(--text-secondary)' }}>
                Trainee Counsellor Application (Stage 1)
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
            <p className="text-sm md:text-base text-red-900 font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Before proceeding:
            </p>
            <p className="text-sm text-red-800 font-medium mb-2">
              You may only submit your placement application once you:
            </p>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside ml-2">
              <li>
                Commenced your counselling/therapeutic course (Level 4 or above)
              </li>
              <li>
                Successfully completed & received your current up-to-date
                Fitness to Practise signed by your course tutor and/or training
                provider.
              </li>
            </ul>
            <p className="text-sm text-red-900 font-bold mt-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Applications with pending Fitness to Practise assessments will not
              be processed.
            </p>
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: "#6f1d56" }}
              >
                Step {currentStep} of 7
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
                  width: `${(currentStep / 7) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Desktop Progress */}
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
                        className={`h-1 flex-1 mx-2 rounded ${
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

        {/* Form Content */}
        <div
          ref={formContentRef}
          className="bg-white rounded-2xl shadow-sm p-4 md:p-8"
        >
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Candidate Information
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Please provide your personal details as they appear on your
                  ID.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name (As per ID){" "}
                    <span className="text-red-500">*</span>
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
                    Last Name (As per ID){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Non-binary', label: 'Non-binary' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    placeholder="Please select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.ethnicity}
                    onChange={(e) =>
                      handleInputChange("ethnicity", e.target.value)
                    }
                    options={[
                      { value: "Caucasian/White", label: "Caucasian/White" },
                      { value: "African/Caribbean/Black", label: "African/Caribbean/Black" },
                      { value: "North African", label: "North African" },
                      { value: "Hispanic/Latino", label: "Hispanic/Latino" },
                      { value: "South Asian", label: "South Asian" },
                      { value: "Southeast Asian", label: "Southeast Asian" },
                      { value: "East Asian", label: "East Asian" },
                      { value: "Central Asian", label: "Central Asian" },
                      { value: "West Asian (Middle Eastern)", label: "West Asian (Middle Eastern)" },
                      { value: "North Asian", label: "North Asian" },
                      { value: "Mixed/Multiracial", label: "Mixed/Multiracial" },
                      { value: "Other", label: "Other (Please use the box below to specify)" },
                    ]}
                    placeholder="Please select"
                  />
                  {formData.ethnicity === "Other" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Please specify ethnicity{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.ethnicityOther}
                        onChange={(e) =>
                          handleInputChange("ethnicityOther", e.target.value)
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                          errors.ethnicityOther
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Please specify"
                      />
                      {errors.ethnicityOther && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.ethnicityOther}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Orientation <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.sexualOrientation}
                    onChange={(e) =>
                      handleInputChange("sexualOrientation", e.target.value)
                    }
                    options={[
                      { value: "Heterosexual", label: "Heterosexual" },
                      { value: "Gay", label: "Gay" },
                      { value: "Lesbian", label: "Lesbian" },
                      { value: "Bisexual", label: "Bisexual" },
                      { value: "Other", label: "Other" },
                    ]}
                    placeholder="Please select"
                  />
                  {formData.sexualOrientation === "Other" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Please specify sexual orientation{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.sexualOrientationOther}
                        onChange={(e) =>
                          handleInputChange(
                            "sexualOrientationOther",
                            e.target.value,
                          )
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                          errors.sexualOrientationOther
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Please specify"
                      />
                      {errors.sexualOrientationOther && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.sexualOrientationOther}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    This helps us match counsellors with clients who may feel
                    more comfortable with certain perspectives
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Registered Address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="London"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) =>
                      handleInputChange("postcode", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Please select your beliefs (If your religion is not listed,
                    select 'Other' and specify below. If your religion is listed
                    but you have specific beliefs, please list them in the 'list
                    if not mentioned' box below) <span className="text-red-500">*</span>
                  </label>
                  <div
                    data-field="beliefs"
                    className={`border rounded-lg p-4 ${
                      errors.beliefs ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {beliefsList.map((belief) => (
                        <label
                          key={belief}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.beliefs.includes(belief)}
                            onChange={() => handleBeliefsToggle(belief)}
                            className="w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: "#6f1d56" }}
                          />
                          <span className="text-sm text-gray-700">
                            {belief}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.beliefs && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.beliefs}
                    </p>
                  )}
                </div>

                  {formData.beliefs.includes("Other") && (
                    <div className="md:col-span-2 mt-4 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please specify 'Other' belief <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.otherBeliefsSpecify || ""}
                        onChange={(e) =>
                          handleInputChange("otherBeliefsSpecify", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        placeholder="Please specify your belief"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 mt-4">
                    {!formData.showSpecificBeliefs ? (
                      <button
                        type="button"
                        onClick={() => handleInputChange("showSpecificBeliefs", true)}
                        className="text-sm font-medium text-[var(--bg-primary)] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        List if not mentioned above / Specific beliefs
                      </button>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          List if not mentioned above / Specific beliefs
                        </label>
                        <textarea
                          value={formData.otherBeliefs}
                          onChange={(e) =>
                            handleInputChange("otherBeliefs", e.target.value)
                          }
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="Specify other beliefs or additional details"
                        />
                      </div>
                    )}
                  </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have any disabilities/impairments? If so, please
                    specify <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.disabilities}
                    onChange={(e) =>
                      handleInputChange("disabilities", e.target.value)
                    }
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please specify or enter 'None'"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have any medical conditions, illnesses or diagnoses
                    that you do not consider a disability?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.medicalConditions}
                    onChange={(e) =>
                      handleInputChange("medicalConditions", e.target.value)
                    }
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please specify or enter 'None'"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Status */}
          {currentStep === 2 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Professional Status
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Please provide your professional credentials and requirements.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you currently hold Professional Indemnity Insurance?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.hasIndemnityInsurance}
                    onChange={(e) =>
                      handleInputChange("hasIndemnityInsurance", e.target.value)
                    }
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]}
                    placeholder="Please select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Indemnity Insurance <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Accepted formats: PDF, DOC, DOCX, JPG, PNG</p>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange("insurance", e.target.files[0])}
                      className="hidden"
                      id="insurance"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you a member of a recognised Counselling/Psychotherapy
                    body? (e.g., NCPS/BACP/Other){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.professionalBodyMember}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalBodyMember",
                        e.target.value
                      )
                    }
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]}
                    placeholder="Please select"
                  />
                </div>

                {formData.professionalBodyMember === "Yes" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please provide your membership details{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.professionalBodyDetails}
                      onChange={(e) =>
                        handleInputChange(
                          "professionalBodyDetails",
                          e.target.value
                        )
                      }
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., BACP Member Number: 123456, Expiry: 12/2025"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you registered with the DBS update service?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.dbsRegistered}
                    onChange={(e) =>
                      handleInputChange("dbsRegistered", e.target.value)
                    }
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]}
                    placeholder="Please select"
                  />
                  <p className="text-xs text-gray-900 mt-1 font-bold bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                    We will be carrying out a status check
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you currently in Personal Therapy with a Qualified
                    Counsellor? <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.inPersonalTherapy}
                    onChange={(e) =>
                      handleInputChange("inPersonalTherapy", e.target.value)
                    }
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]}
                    placeholder="Please select"
                  />
                  <p className="text-xs text-gray-900 mt-1 font-bold bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                    This is a requirement for our placement
                  </p>
                </div>

                {formData.inPersonalTherapy === "No" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please briefly explain why{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.personalTherapyReason}
                      onChange={(e) =>
                        handleInputChange(
                          "personalTherapyReason",
                          e.target.value
                        )
                      }
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., Completed required hours, still searching for a qualified counsellor, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you currently have a Clinical Supervisor?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hasClinicalSupervisor}
                    onChange={(e) =>
                      handleInputChange("hasClinicalSupervisor", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {formData.hasClinicalSupervisor === "No" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please briefly explain why{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.supervisorReason}
                      onChange={(e) =>
                        handleInputChange("supervisorReason", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., I will start when I have clients, cannot find a supervisor, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you previously attended or are you currently attending
                    online counselling? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.previousOnlineCounselling}
                    onChange={(e) =>
                      handleInputChange(
                        "previousOnlineCounselling",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes (Individual)">
                      Yes (Individual counselling)
                    </option>
                    <option value="Yes (Couples)">
                      Yes (Couples counselling)
                    </option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does your Training Organisation require you to complete
                    face-to-face hours before commencing online counselling?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.faceToFaceBeforeOnline}
                    onChange={(e) =>
                      handleInputChange("faceToFaceBeforeOnline", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.faceToFaceBeforeOnline ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.faceToFaceBeforeOnline && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.faceToFaceBeforeOnline}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Course Information - keeping original */}
          {currentStep === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Current Course Information
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Details about your course and Training Organisation.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Organisation Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.trainingOrgName}
                    onChange={(e) =>
                      handleInputChange("trainingOrgName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., London College of Counselling"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Organisation Address & Postcode{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.trainingOrgAddress}
                    onChange={(e) =>
                      handleInputChange("trainingOrgAddress", e.target.value)
                    }
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Full address including postcode"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tutor's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tutorName}
                      onChange={(e) =>
                        handleInputChange("tutorName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Tutor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tutor's Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.tutorEmail}
                      onChange={(e) =>
                        handleInputChange("tutorEmail", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="tutor@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tutor's Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.tutorPhone}
                      onChange={(e) =>
                        handleInputChange("tutorPhone", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="+44 7700 900000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placement Lead Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.placementLeadName}
                      onChange={(e) =>
                        handleInputChange("placementLeadName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Placement lead name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placement Lead Phone{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.placementLeadPhone}
                      onChange={(e) =>
                        handleInputChange("placementLeadPhone", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="+44 7700 900000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placement Lead Email{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.placementLeadEmail}
                      onChange={(e) =>
                        handleInputChange("placementLeadEmail", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="placement@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title / Title of Qualification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) =>
                      handleInputChange("courseTitle", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., Diploma in Person-Centred Counselling"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Expected to Qualify{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expectedQualification}
                    onChange={(e) =>
                      handleInputChange("expectedQualification", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is your counselling course focused on individual
                    counselling, couples counselling, or both?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.courseFocus}
                    onChange={(e) =>
                      handleInputChange("courseFocus", e.target.value)
                    }
                    options={[
                      { value: 'Individual', label: 'Individual counselling' },
                      { value: 'Couples', label: 'Couples counselling' },
                      { value: 'Both', label: 'Both' }
                    ]}
                    placeholder="Please select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does your Training Organisation require you to complete
                    face-to-face hours before commencing online counselling?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.faceToFaceRequired}
                    onChange={(e) =>
                      handleInputChange("faceToFaceRequired", e.target.value)
                    }
                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.faceToFaceRequired
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you currently have face-to-face (individual or couples)
                    clients? <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.currentClients}
                    onChange={(e) =>
                      handleInputChange("currentClients", e.target.value)
                    }
                    options={[
                      { value: 'Yes (Individual)', label: 'Yes (Individual)' },
                      { value: 'Yes (Couples)', label: 'Yes (Couples)' },
                      { value: 'Yes (Both)', label: 'Yes (Both)' },
                      { value: 'None', label: 'None' }
                    ]}
                    placeholder="Please select"
                  />
                </div>

                {formData.currentClients &&
                  formData.currentClients !== "None" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How many clients are you seeing at present?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.clientCount}
                        onChange={(e) =>
                          handleInputChange("clientCount", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        placeholder="e.g., 3"
                      />
                    </div>
                  )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many face-to-face hours have you completed to date?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.completedHours}
                    onChange={(e) =>
                      handleInputChange("completedHours", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does your course cover skills practice? Please specify the
                    method and duration <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.skillsPractice}
                    onChange={(e) =>
                      handleInputChange("skillsPractice", e.target.value)
                    }
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., Using the Fishbowl method or taking turns being the Counsellor, Observer, and Client..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Your Journey & Experience - NOW WITH NEW TOPIC SECTIONS */}
          {currentStep === 4 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Your Journey & Experience
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Share your story and professional development.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What difficulties have you encountered within your family
                    structure, and how has this impacted and influenced your
                    journey? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3 italic">
                   Our Upbringing, Family, and Foundation are the fundamental elements of our struggles and our growth. What difficulties have you encountered within your Family structure, how has this impacted and influenced your journey?
                  </p>
                  <textarea
                    value={formData.familyDifficulties}
                    onChange={(e) =>
                      handleInputChange("familyDifficulties", e.target.value)
                    }
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please share your reflections..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please tell us a little about the personal journey which led you to pursue a career in counselling:
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.personalJourney}
                    onChange={(e) =>
                      handleInputChange("personalJourney", e.target.value)
                    }
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Share your story..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                   Self-awareness is an essential element of the emotional intelligence crucial to Counselling. Please use this space to give us an example of your own self-awareness and negative patterns of behaviour: <span className="text-red-500">*</span>
                  </label>
                 
                  <textarea
                    value={formData.selfAwareness}
                    onChange={(e) =>
                      handleInputChange("selfAwareness", e.target.value)
                    }
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Reflect on your self-awareness..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please mention all Counsellor-related training, education
                    and voluntary/paid experiences (including number of hours){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.counsellorTraining}
                    onChange={(e) =>
                      handleInputChange("counsellorTraining", e.target.value)
                    }
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="List all relevant training and experience..."
                  />
                </div>

                {/* NEW SECTION: Topics with Experience */}
                <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Topics You HAVE Experience Working With{" "}
                        <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Select all topics/issues you have professional
                        experience with, either through training, placement, or
                        practice. This helps us match you with suitable clients.
                      </p>
                    </div>
                  </div>

                  <div
                    data-field="topicsExperienceWith"
                    className={`border rounded-lg p-4 bg-white ${
                      errors.topicsExperienceWith
                        ? "border-red-500"
                        : "border-green-200"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {therapyTopics.map((topic) => (
                        <label
                          key={topic}
                          className="flex items-start gap-3 cursor-pointer p-2 hover:bg-green-50 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.topicsExperienceWith.includes(
                              topic
                            )}
                            onChange={() =>
                              handleTopicToggle("topicsExperienceWith", topic)
                            }
                            className="mt-0.5 w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: "#10b981" }}
                          />
                          <span className="text-sm text-gray-700">{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.topicsExperienceWith && (
                    <p className="text-red-500 text-xs mt-2">
                      {errors.topicsExperienceWith}
                    </p>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other topics with experience (not listed above)
                    </label>
                    <textarea
                      value={formData.topicsExperienceOther}
                      onChange={(e) =>
                        handleInputChange(
                          "topicsExperienceOther",
                          e.target.value
                        )
                      }
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., Workplace bullying, Chronic illness adjustment, etc."
                    />
                  </div>

                  {formData.topicsExperienceWith.length > 0 && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        ✓ You selected {formData.topicsExperienceWith.length}{" "}
                        topic(s) with experience
                      </p>
                    </div>
                  )}
                </div>

                {/* NEW SECTION: Topics Not Ready For */}
                <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Topics You Are NOT YET READY to Work With{" "}
                        <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Please be honest about topics/issues you're not yet
                        ready to handle. This is essential for ethical practice,
                        your wellbeing, and client safety. There is no judgment
                        - it shows good self-awareness.
                      </p>
                    </div>
                  </div>

                  <div
                    data-field="topicsNotReady"
                    className={`border rounded-lg p-4 bg-white ${
                      errors.topicsNotReady
                        ? "border-red-500"
                        : "border-orange-200"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {therapyTopics.map((topic) => (
                        <label
                          key={topic}
                          className="flex items-start gap-3 cursor-pointer p-2 hover:bg-orange-50 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.topicsNotReady.includes(topic)}
                            onChange={() =>
                              handleTopicToggle("topicsNotReady", topic)
                            }
                            className="mt-0.5 w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: "#f59e0b" }}
                          />
                          <span className="text-sm text-gray-700">{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.topicsNotReady && (
                    <p className="text-red-500 text-xs mt-2">
                      {errors.topicsNotReady}
                    </p>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other topics not ready for (not listed above)
                    </label>
                    <textarea
                      value={formData.topicsNotReadyOther}
                      onChange={(e) =>
                        handleInputChange("topicsNotReadyOther", e.target.value)
                      }
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., Complex PTSD, Severe personality disorders, etc."
                    />
                  </div>

                  {formData.topicsNotReady.length > 0 && (
                    <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                      <p className="text-sm font-medium text-orange-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        You selected {formData.topicsNotReady.length} topic(s)
                        you're not ready for
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What areas of personal development do you need to improve on
                    to assist your therapeutic work?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.developmentAreas}
                    onChange={(e) =>
                      handleInputChange("developmentAreas", e.target.value)
                    }
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Reflect on areas for growth..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you describe your theoretical approach?{" "}
                    <span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Select all that apply)
                    </span>
                  </label>
                  <div
                    data-field="theoreticalApproach"
                    className={`border rounded-lg p-4 ${
                      errors.theoreticalApproach
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {theoreticalApproaches.map((approach) => (
                        <label
                          key={approach}
                          className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.theoreticalApproach.includes(
                              approach
                            )}
                            onChange={() =>
                              handleTheoreticalApproachToggle(approach)
                            }
                            className="mt-1 w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: "#6f1d56" }}
                          />
                          <span className="text-sm text-gray-700">
                            {approach}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.theoreticalApproach && (
                    <p className="text-red-500 text-xs mt-2">
                      {errors.theoreticalApproach}
                    </p>
                  )}
                  {formData.theoreticalApproach.includes("Other") && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please describe your theoretical approach if not listed
                        above <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.theoreticalApproachOther}
                        onChange={(e) =>
                          handleInputChange(
                            "theoreticalApproachOther",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        placeholder="Describe your therapeutic approach..."
                      />
                    </div>
                  )}
                  {formData.theoreticalApproach.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected:{" "}
                      {
                        formData.theoreticalApproach.filter(
                          (a) => a !== "Other"
                        ).length
                      }{" "}
                      approach(es)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Steps 5, 6, 7 remain the same - continuing from previous code... */}
          {/* Step 5: Availability */}
          {currentStep === 5 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Your Availability
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Select all time slots when you're available to attend online
                  counselling sessions with clients.
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-sm md:text-base text-red-900 font-bold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Important:
                </p>
                <p className="text-sm text-red-800 font-medium">
                  Be realistic with your schedule. Once you begin working with
                  clients, it's difficult to modify your availability, as we
                  require consistency. Trainee Counsellors are required to be
                  online 15 minutes prior to the scheduled start time.
                </p>
              </div>

              {errors.availability && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm font-medium">
                    {errors.availability}
                  </p>
                </div>
              )}
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
                              (Last session at 5:00 PM - 6:00 PM)
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select the day you would be able to attend the Monthly
                  Mandatory Peer Support Group (PSG){" "}
                  <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  name="psgDay"
                  id="psgDay"
                  value={formData.psgDay}
                  onChange={(e) => handleInputChange("psgDay", e.target.value)}
                  options={[
                    { value: 'Monday 7pm-8:30pm', label: 'Monday 7:00 PM - 8:30 PM' },
                    { value: 'Wednesday 7pm-8:30pm', label: 'Wednesday 7:00 PM - 8:30 PM' },
                    { value: 'Thursday 7pm-8:30pm', label: 'Thursday 7:00 PM - 8:30 PM' }
                  ]}
                  placeholder="Please select"
                  className={errors.psgDay ? "border-red-500" : ""}
                />
                {errors.psgDay && (
                  <p className="text-red-500 text-xs mt-1">{errors.psgDay}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Documents */}
          {currentStep === 6 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Required Documents
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Please upload all mandatory documents. Incomplete applications
                  will need to be re-submitted.
                </p>
              </div>

              {showDocModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-600 p-6 text-white text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                      <h2 className="text-2xl font-bold">Important Document Requirements</h2>
                    </div>
                    <div className="p-8">
                      <div className="space-y-4 mb-8">
                        <p className="text-gray-700 font-medium">Please review these mandatory requirements before proceeding with your document uploads:</p>
                        <ul className="space-y-3">
                          {[
                            "All mandatory documents must be uploaded with your application",
                            "We cannot accept documents submitted via email separately",
                            "Qualification certificates or documents addressed to nicknames/aliases will not be accepted",
                            "DBS certificate must be Enhanced (Adult Workforce) and no more than 2 years old",
                            "Fitness to Practise must be signed by your course tutor and/or Training Organisation"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => {
                            setHasConfirmedDocs(true);
                            setShowDocModal(false);
                            handleInputChange("docsConfirmed", true);
                          }}
                          className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg text-lg"
                        >
                          I Understand and Confirm
                        </button>
                        <button
                          onClick={() => setCurrentStep(currentStep - 1)}
                          className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-lg"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!hasConfirmedDocs && (
                <div className="bg-red-50 border-2 border-red-400 p-5 mb-6 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-red-900 font-bold mb-4 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    You must confirm document requirements before uploading
                  </p>
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md"
                  >
                    View & Confirm Requirements
                  </button>
                </div>
              )}

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness to Practise Document{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("fitnessTopractice", e.target.files)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.doc,.docx"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: PDF, Word (.doc, .docx). ONLY APPLY IF YOU
                    HAVE RECEIVED THIS
                  </p>
                  {formData.fitnessTopractice && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {formData.fitnessTopractice.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prior Counselling Qualifications{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("qualifications", e.target.files)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <p className="text-xs text-black mt-1 font-bold">
                    Accepted formats: PDF, Image (JPG, PNG), Word (.doc, .docx)
                  </p>
                  {formData.qualifications && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {formData.qualifications.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enhanced DBS (Adult Workforce) - Max 2 years old{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload("dbs", e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <p className="text-xs text-black mt-1 font-bold">
                    Accepted formats: PDF, Image (JPG, PNG), Word (.doc, .docx)
                  </p>
                  {formData.dbs && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {formData.dbs.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload("cv", e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.doc,.docx"
                  />
                  <p className="text-xs text-black mt-1 font-bold">
                    Accepted formats: PDF, Word (.doc, .docx)
                  </p>
                  {formData.cv && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {formData.cv.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid ID (Passport or Driving Licence){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("validId", e.target.files)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-black mt-1 font-bold">
                    Accepted formats: PDF, Image (JPG, PNG)
                  </p>
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mt-3">
                    <p className="text-sm text-red-900 font-bold">
                      For insurance purposes, we may need to verify your Right
                      to Work in the UK
                    </p>
                  </div>
                  {formData.validId && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {formData.validId.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copy of Indemnity Insurance{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("insurance", e.target.files)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <p className="text-xs text-black mt-1 font-bold">
                    Accepted formats: PDF, Image (JPG, PNG), Word (.doc, .docx)
                  </p>
                  {formData.insurance && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {formData.insurance.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Review & Submit */}
          {currentStep === 7 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Review & Submit
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Final information and declaration.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have you been convicted of a criminal offence within the last
                  6 months? <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={formData.criminalConviction}
                  onChange={(e) =>
                    handleInputChange("criminalConviction", e.target.value)
                  }
                  options={[
                    { value: 'No', label: 'No' },
                    { value: 'Yes', label: 'Yes' }
                  ]}
                  placeholder="Please select"
                  className="mb-2"
                />
                {formData.criminalConviction === "Yes" && (
                  <textarea
                    placeholder="Please give details of date(s), offence(s), and sentence(s) passed"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent mt-2"
                  />
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Summary
                </h3>
                <div className="space-y-3 text-base text-gray-900">
                  <p className="font-medium">
                    <strong className="font-semibold">Name:</strong>{" "}
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="font-medium">
                    <strong className="font-semibold">Email:</strong>{" "}
                    {formData.email}
                  </p>
                  <p className="font-medium">
                    <strong className="font-semibold">Course:</strong>{" "}
                    {formData.courseTitle || "Not specified"}
                  </p>
                  <p className="font-medium">
                    <strong className="font-semibold">
                      Expected Qualification:
                    </strong>{" "}
                    {formData.expectedQualification || "Not specified"}
                  </p>
                  <p className="font-medium">
                    <strong className="font-semibold">
                      Availability Slots:
                    </strong>{" "}
                    {Object.values(formData.availability).flat().length || 0}{" "}
                    time slots selected
                  </p>
                  <p className="font-medium">
                    <strong className="font-semibold">
                      Topics with Experience:
                    </strong>{" "}
                    {formData.topicsExperienceWith.length} selected
                  </p>
                  <p className="font-medium">
                    <strong className="font-semibold">
                      Topics Not Ready For:
                    </strong>{" "}
                    {formData.topicsNotReady.length} selected
                  </p>
                  <p className="font-medium">
                    <strong className="font-semibold">
                      Documents Uploaded:
                    </strong>{" "}
                    {
                      [
                        formData.fitnessTopractice,
                        formData.qualifications,
                        formData.dbs,
                        formData.cv,
                        formData.validId,
                        formData.insurance,
                      ].filter(Boolean).length
                    }{" "}
                    of 6
                  </p>
                </div>
              </div>

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
                    I certify that the information provided above is true and of
                    accurate record. I understand that providing false
                    information may result in the termination of my application
                    or placement. <span className="text-red-500">*</span>
                  </span>
                </label>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Thank you for completing the application. We will be in
                    touch soon. Please note: a copy of this application will not
                    be provided. Once accepted on placement, we may collect
                    anonymised information for educational and training
                    purposes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 whitespace-pre-line">
                    {submitError}
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

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 md:mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-sm md:text-base transition-colors ${
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
              {currentStep}/7
            </div>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium text-sm md:text-base hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#6f1d56" }}
              >
                Next
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.termsAccepted || isSubmitting}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium text-sm md:text-base transition-opacity ${
                  !formData.termsAccepted || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90"
                }`}
                style={{ backgroundColor: "#6f1d56" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 md:w-5 md:h-5" />
                    Submit Application
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
