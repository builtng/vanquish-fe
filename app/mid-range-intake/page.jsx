"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Calendar,
  Heart,
  Settings,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  ArrowLeft,
} from "lucide-react";
import { StripePaymentWrapper } from "@/components/StripePayment";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import CalendarPicker from "@/components/CalendarPicker";
import { toast } from "react-toastify";
import { useBranding } from "@/contexts/BrandingContext";
import apiService from "@/lib/api";
import { SUPPORT_AREAS } from "@/lib/constants";

/* ─── CORE-10 wellbeing items ─── */
const CORE_QUESTIONS = [
  "I have felt tense, anxious or nervous",
  "I have felt I have someone to turn to for support when needed",
  "I have felt able to cope when things go wrong",
  "Talking to people has felt too much for me",
  "I have felt panic or terror",
  "I made plans to end my life or harm myself",
  "I have had difficulty getting to sleep or staying asleep",
  "I have felt despairing or hopeless",
  "I have felt unhappy",
  "Unwanted images or memories have been distressing me",
];
const CORE_SCALE = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Only occasionally" },
  { value: "2", label: "Sometimes" },
  { value: "3", label: "Often" },
  { value: "4", label: "Most or all of the time" },
];

/* ─── Schedule grid (same slots as ISH) ─── */
const ALL_SLOTS = [
  { value: "10am-11am", label: "10:00 AM – 11:00 AM" },
  { value: "11am-12pm", label: "11:00 AM – 12:00 PM" },
  { value: "12pm-1pm",  label: "12:00 PM – 1:00 PM" },
  { value: "1pm-2pm",   label: "1:00 PM – 2:00 PM" },
  { value: "2pm-3pm",   label: "2:00 PM – 3:00 PM" },
  { value: "3pm-4pm",   label: "3:00 PM – 4:00 PM" },
  { value: "4pm-5pm",   label: "4:00 PM – 5:00 PM" },
  { value: "5pm-6pm",   label: "5:00 PM – 6:00 PM" },
  { value: "6pm-7pm",   label: "6:00 PM – 7:00 PM" },
];
const FRIDAY_SLOTS = ALL_SLOTS.filter((s) => s.value !== "6pm-7pm");
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

/* ─── Step definitions ─── */
const STEPS = [
  { n: 1,  title: "Service",       icon: Star },
  { n: 2,  title: "Personal",      icon: User },
  { n: 3,  title: "About You",     icon: Heart },
  { n: 4,  title: "Support",       icon: AlertTriangle },
  { n: 5,  title: "Preferences",   icon: Settings },
  { n: 6,  title: "Referral",      icon: User },
  { n: 7,  title: "Assessment",    icon: CheckCircle },
  { n: 8,  title: "Availability",  icon: Calendar },
  { n: 9,  title: "Counsellors",   icon: Search },
  { n: 10, title: "Consultation",  icon: Calendar },
  { n: 11, title: "Emergency",     icon: AlertTriangle },
  { n: 12, title: "Payment",       icon: CreditCard },
];

const EMPTY_AVAILABILITY = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };

/* ─── Helper: field input classes ─── */
const fieldCls = (err) =>
  `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f1d56] ${
    err ? "border-red-500" : "border-gray-300"
  }`;

/* ═══════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════ */
export default function MidRangeIntakeForm() {
  const { branding, loading: brandingLoading } = useBranding();
  const formContentRef = useRef(null);

  /* ─── Form state ─── */
  const [fd, setFd] = useState({
    // Step 1
    serviceType: "",        // "Mid Range" | "Counselling & Coaching"
    isCouples: false,

    // Step 2 – Personal
    firstName: "", lastName: "", email: "", phone: "",
    voicemailOk: "", whatsappAgreement: "",
    fullAddress: "", locationOfResidence: "",
    // Couples extras
    partnerFirstName: "", partnerLastName: "",
    age: "", partnerAge: "",

    // Step 3 – About You
    gender: "", ethnicity: "", sexualOrientation: "",
    onMedication: "", medicationDetails: "",
    hasDisability: "", disabilityDetails: "",
    currentlyInTherapy: "", workingWithAnotherReason: "",
    // Partner
    partnerGender: "", partnerEthnicity: "", partnerSexualOrientation: "",
    partnerOnMedication: "", partnerMedicationDetails: "",
    partnerHasDisability: "", partnerDisabilityDetails: "",

    // Step 4 – Support areas
    supportAreas: [], concernsDetails: "",
    substanceUse: "", riskDetails: "",

    // Step 5 – Counsellor Preferences
    genderPreference: "No preference",
    agePreference: "No preference",
    ageRangeMin: "", ageRangeMax: "",
    ethnicityPreference: "No preference",
    orientationPreference: "No preference",
    specificOrientation: "",
    specialtyPreference: "", // e.g. Couples Counsellor

    // Step 6 – Referral
    hearAboutUs: "", referralType: "",

    // Step 7 – Assessment (CORE-10)
    coreAnswers: {}, // { 0: "2", 1: "1", ... }

    // Step 8 – Availability
    availability: { ...EMPTY_AVAILABILITY },

    // Step 11 – Emergency
    emergencyContactName: "", emergencyContactPhone: "",
    emergencyContactEmail: "", emergencyContactRelationship: "",

    // Step 12 – Payment
    discountCode: "", termsAccepted: false,
  });

  const [currentStep, setCurrentStep]       = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [errors, setErrors]                 = useState({});

  // Step 9 – Filtered counsellors
  const [filteredTcs, setFilteredTcs]               = useState([]);
  const [loadingFiltered, setLoadingFiltered]        = useState(false);
  const [filteredSortBy, setFilteredSortBy]          = useState("score");
  const [selectedTc, setSelectedTc]                  = useState(null); // full TC object

  // Step 10 – Consultation booking
  const [consultAvailability, setConsultAvailability] = useState(null); // { source, slots }
  const [loadingAvail, setLoadingAvail]               = useState(false);
  const [selectedConsultSlot, setSelectedConsultSlot] = useState(null);

  // Step 12 – Payment
  const [discountAmount, setDiscountAmount]     = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProps, setPaymentProps]         = useState(null);
  const [clientId, setClientId]                 = useState(null);

  const totalSteps = STEPS.length;

  /* ─── Consultation fee ─── */
  const getBaseFee = () => fd.serviceType === "Counselling & Coaching" ? 20 : 15;
  const getConsultFee = () => Math.max(0, getBaseFee() - discountAmount);

  /* ─── Scroll to top on step change ─── */
  useEffect(() => {
    if (formContentRef.current) {
      formContentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentStep]);

  /* ─── Fetch filtered counsellors when arriving at step 9 ─── */
  useEffect(() => {
    if (currentStep !== 9 || filteredTcs.length > 0 || loadingFiltered) return;
    const fetchFiltered = async () => {
      try {
        setLoadingFiltered(true);
        const payload = {
          service_type: fd.serviceType,
          is_couples: fd.isCouples,
          support_areas: fd.supportAreas,
          availability: fd.availability,
          gender_preference: fd.genderPreference,
          age_preference: fd.agePreference,
          ethnicity_preference: fd.ethnicityPreference,
          orientation_preference: fd.orientationPreference,
          specialty_preference: fd.specialtyPreference || null,
          modality_preference: null,
        };
        const data = await apiService.getFilteredCounsellors(payload);
        setFilteredTcs(data?.counsellors || data || []);
      } catch (err) {
        toast.error("Failed to load filtered counsellors. Please try again.");
      } finally {
        setLoadingFiltered(false);
      }
    };
    fetchFiltered();
  }, [currentStep]);

  /* ─── Fetch consultation availability when arriving at step 10 ─── */
  useEffect(() => {
    if (currentStep !== 10 || !selectedTc?.uuid || loadingAvail) return;
    const fetchAvail = async () => {
      try {
        setLoadingAvail(true);
        const data = await apiService.getCounsellorConsultationAvailability(selectedTc.uuid);
        const mapped = (data?.slots || []).map((slot) => {
          const date = new Date(slot.consultation_datetime);
          return {
            ...slot,
            date: date.toISOString().split("T")[0],
            formatted_time: date.toLocaleTimeString("en-GB", {
              hour: "2-digit", minute: "2-digit", timeZone: "UTC",
            }),
            available: !(slot.max_slots && slot.booked_slots >= slot.max_slots),
          };
        });
        setConsultAvailability({ source: data?.source || "vanquish", slots: mapped });
      } catch {
        toast.error("Failed to load consultation slots.");
      } finally {
        setLoadingAvail(false);
      }
    };
    fetchAvail();
  }, [currentStep, selectedTc]);

  /* ─── Helpers ─── */
  const update = (field, value) => {
    setFd((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const toggleSupportArea = (area) => {
    setFd((prev) => ({
      ...prev,
      supportAreas: prev.supportAreas.includes(area)
        ? prev.supportAreas.filter((a) => a !== area)
        : [...prev.supportAreas, area],
    }));
    if (errors.supportAreas) setErrors((p) => { const n = { ...p }; delete n.supportAreas; return n; });
  };

  const toggleAvailability = (day, slot) => {
    setFd((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].includes(slot)
          ? prev.availability[day].filter((s) => s !== slot)
          : [...prev.availability[day], slot],
      },
    }));
    if (errors.availability) setErrors((p) => { const n = { ...p }; delete n.availability; return n; });
  };

  const setCoreAnswer = (idx, val) => {
    setFd((prev) => ({ ...prev, coreAnswers: { ...prev.coreAnswers, [idx]: val } }));
  };

  /* ─── Validation ─── */
  const validateStep = (step) => {
    const e = {};
    const email_re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    switch (step) {
      case 1:
        if (!fd.serviceType) e.serviceType = "Please select a service";
        break;
      case 2:
        if (!fd.firstName.trim()) e.firstName = "First name is required";
        if (!fd.lastName.trim())  e.lastName  = "Last name is required";
        if (!fd.email.trim() || !email_re.test(fd.email)) e.email = "Valid email is required";
        if (!fd.phone.trim()) e.phone = "Phone number is required";
        if (!fd.voicemailOk) e.voicemailOk = "This field is required";
        if (!fd.whatsappAgreement) e.whatsappAgreement = "This field is required";
        if (!fd.fullAddress.trim()) e.fullAddress = "Address is required";
        if (!fd.locationOfResidence.trim()) e.locationOfResidence = "Location is required";
        if (!fd.age) e.age = "Your age is required";
        if (fd.isCouples) {
          if (!fd.partnerFirstName.trim()) e.partnerFirstName = "Partner's first name is required";
          if (!fd.partnerLastName.trim())  e.partnerLastName  = "Partner's last name is required";
          if (!fd.partnerAge) e.partnerAge = "Partner's age is required";
        }
        break;
      case 3:
        if (!fd.gender) e.gender = "Gender is required";
        if (!fd.ethnicity) e.ethnicity = "Ethnicity is required";
        if (!fd.sexualOrientation) e.sexualOrientation = "Sexual orientation is required";
        if (!fd.onMedication) e.onMedication = "This field is required";
        if (!fd.hasDisability) e.hasDisability = "This field is required";
        if (!fd.currentlyInTherapy) e.currentlyInTherapy = "This field is required";
        if (fd.currentlyInTherapy === "Yes" && !fd.workingWithAnotherReason.trim())
          e.workingWithAnotherReason = "Please explain your reasons";
        if (fd.isCouples) {
          if (!fd.partnerGender) e.partnerGender = "Partner's gender is required";
          if (!fd.partnerEthnicity) e.partnerEthnicity = "Partner's ethnicity is required";
          if (!fd.partnerSexualOrientation) e.partnerSexualOrientation = "Partner's sexual orientation is required";
          if (!fd.partnerOnMedication) e.partnerOnMedication = "This field is required";
          if (!fd.partnerHasDisability) e.partnerHasDisability = "This field is required";
        }
        break;
      case 4:
        if (fd.supportAreas.length === 0) e.supportAreas = "Please select at least one area";
        break;
      case 6:
        if (!fd.hearAboutUs)  e.hearAboutUs  = "This field is required";
        if (!fd.referralType) e.referralType = "This field is required";
        break;
      case 8:
        if (!Object.values(fd.availability).some((d) => d.length > 0))
          e.availability = "Please select at least one time slot";
        break;
      case 9:
        if (!selectedTc) e.selectedTc = "Please select a counsellor";
        break;
      case 10:
        if (!selectedConsultSlot) e.selectedConsultSlot = "Please choose a consultation slot";
        break;
      case 11:
        if (!fd.emergencyContactName.trim())         e.emergencyContactName         = "Name is required";
        if (!fd.emergencyContactPhone.trim())        e.emergencyContactPhone        = "Phone is required";
        if (!fd.emergencyContactRelationship.trim()) e.emergencyContactRelationship = "Relationship is required";
        if (fd.emergencyContactEmail.trim() && !email_re.test(fd.emergencyContactEmail))
          e.emergencyContactEmail = "Valid email required";
        break;
      case 12:
        if (!fd.termsAccepted) e.termsAccepted = "You must accept the terms";
        break;
    }
    return e;
  };

  /* ─── Step navigation ─── */
  const goToStep = (n) => {
    if (n < currentStep) { setCurrentStep(n); setErrors({}); return; }
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTimeout(() => {
        const firstKey = Object.keys(errs)[0];
        const el = document.querySelector(`[name="${firstKey}"]`) ||
                   document.querySelector(`#${firstKey}`) ||
                   document.querySelector(`[data-field="${firstKey}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        else if (formContentRef.current)
          formContentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setErrors({});
    setCurrentStep(n);
  };

  const handleNext = () => goToStep(currentStep + 1);
  const handlePrev = () => goToStep(currentStep - 1);

  /* ─── Discount ─── */
  const applyDiscount = async () => {
    const code = fd.discountCode?.trim().toUpperCase();
    if (!code) { setDiscountAmount(0); setIsDiscountApplied(false); return; }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/coupons/verify`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }
      );
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Invalid code"); }
      const coupon = await res.json();
      const base = getBaseFee();
      const amt = coupon.type === "fixed" ? parseFloat(coupon.value) : (base * parseFloat(coupon.value)) / 100;
      setDiscountAmount(amt);
      setIsDiscountApplied(true);
      toast.success(`Discount applied! You saved £${amt.toFixed(2)}`);
    } catch (err) {
      toast.error(err.message || "Invalid discount code");
      setDiscountAmount(0); setIsDiscountApplied(false);
    }
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    const errs = validateStep(12);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/client-intake`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name:  fd.firstName,
            last_name:   fd.lastName,
            email:       fd.email,
            phone:       fd.phone || null,
            whatsapp_agreement:      fd.whatsappAgreement,
            voicemail_ok:            fd.voicemailOk === "Yes",
            full_address:            fd.fullAddress,
            street:                  fd.fullAddress,
            city:                    "N/A",
            postcode:                "N/A",
            country:                 "N/A",
            location_of_residence:   fd.locationOfResidence,
            age:                     fd.age,
            gender:                  fd.gender,
            ethnicity:               fd.ethnicity,
            sexual_orientation:      fd.sexualOrientation,
            on_medication:           fd.onMedication === "Yes",
            medication_details:      fd.medicationDetails || null,
            has_disability:          fd.hasDisability === "Yes",
            disability_details:      fd.disabilityDetails || null,
            currently_in_therapy:    fd.currentlyInTherapy === "Yes",
            working_with_another_reason: fd.workingWithAnotherReason || null,
            // Couples
            is_couples:              fd.isCouples,
            partner_first_name:      fd.isCouples ? fd.partnerFirstName : null,
            partner_last_name:       fd.isCouples ? fd.partnerLastName  : null,
            partner_age:             fd.isCouples ? fd.partnerAge       : null,
            partner_gender:          fd.isCouples ? fd.partnerGender    : null,
            partner_ethnicity:       fd.isCouples ? fd.partnerEthnicity : null,
            partner_sexual_orientation: fd.isCouples ? fd.partnerSexualOrientation : null,
            partner_on_medication:   fd.isCouples ? fd.partnerOnMedication === "Yes" : null,
            partner_medication_details: fd.isCouples ? fd.partnerMedicationDetails  : null,
            partner_has_disability:  fd.isCouples ? fd.partnerHasDisability === "Yes" : null,
            partner_disability_details: fd.isCouples ? fd.partnerDisabilityDetails   : null,
            // Support & assessment
            support_areas:           fd.supportAreas,
            concerns_details:        fd.concernsDetails || null,
            substance_use:           fd.substanceUse || null,
            risk_details:            fd.riskDetails   || null,
            core_answers:            fd.coreAnswers   || {},
            // Preferences
            gender_preference:       fd.genderPreference,
            age_preference:          fd.agePreference,
            ethnicity_preference:    fd.ethnicityPreference,
            orientation_preference:  fd.orientationPreference,
            specialty_preference:    fd.specialtyPreference || null,
            // Referral
            hear_about_us:           fd.hearAboutUs  || null,
            referral_type:           fd.referralType || null,
            // Availability
            availability:            fd.availability,
            // Counsellor selection
            preferred_tc_uuid:       selectedTc?.uuid || null,
            // Emergency
            emergency_contact_name:           fd.emergencyContactName,
            emergency_contact_phone:          fd.emergencyContactPhone,
            emergency_contact_email:          fd.emergencyContactEmail  || null,
            emergency_contact_relationship:   fd.emergencyContactRelationship,
            // Booking
            consultation_slot_id:             selectedConsultSlot?.id || null,
            consultation_with_tc_uuid:        selectedTc?.uuid || null,
            consultation_datetime:            selectedConsultSlot?.consultation_datetime || null,
            // Payment
            service_type:    fd.serviceType,
            consultation_fee: getConsultFee(),
            discount_code:   isDiscountApplied ? fd.discountCode : null,
            terms_accepted:  fd.termsAccepted,
            create_client:   true,
          }),
        }
      );

      if (!res.ok) {
        const ct = res.headers.get("content-type");
        let msg = `Submission failed (${res.status})`;
        if (ct?.includes("application/json")) {
          const d = await res.json();
          if (d.errors) msg = Object.entries(d.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n");
          else msg = d.message || d.error || msg;
        }
        throw new Error(msg);
      }

      const data = await res.json();
      const clientIdFromRes = data.client_id || data.form?.client_id;
      setClientId(clientIdFromRes);

      const successParams = new URLSearchParams();
      successParams.append("uuid", data.client_uuid || data.form?.uuid || "");
      if (selectedConsultSlot?.id) successParams.append("slot", selectedConsultSlot.id);
      const successUrl = `${window.location.origin}/mid-range-intake/success?${successParams}`;

      const fee = getConsultFee();
      if (fee > 0 && clientIdFromRes) {
        setPaymentProps({
          clientId: clientIdFromRes,
          amount: fee,
          paymentType: "consultation",
          couponCode: isDiscountApplied ? fd.discountCode : null,
          consultationSlotId: selectedConsultSlot?.id || null,
          consultationWithTcUuid: selectedTc?.uuid || null,
          consultationDatetime: selectedConsultSlot?.consultation_datetime || null,
          returnUrl: successUrl,
          onSuccess: () => { window.location.href = successUrl; },
          onError: (err) => toast.error(err.message || "Payment failed"),
        });
        setShowPaymentModal(true);
      } else {
        window.location.href = successUrl;
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit form.");
    }
  };

  /* ─── Sorted filtered counsellors ─── */
  const sortedTcs = [...filteredTcs].sort((a, b) =>
    filteredSortBy === "score"
      ? (b.score ?? 0) - (a.score ?? 0)
      : (a.name || "").localeCompare(b.name || "")
  );

  const getFitLabel = (score) => {
    if (score >= 90) return { label: "Best Fit",  bg: "bg-green-100",  text: "text-green-800"  };
    if (score >= 75) return { label: "Great Fit", bg: "bg-blue-100",   text: "text-blue-800"   };
    return                    { label: "Good Fit",  bg: "bg-yellow-100", text: "text-yellow-800" };
  };

  /* ════════════════════════════════════════════
     DEMOGRAPHICS sub-form (reused for couples)
  ════════════════════════════════════════════ */
  const DemographicsFields = ({ prefix = "", label = "Your" }) => {
    const pf = (f) => (prefix ? `${prefix}${f.charAt(0).toUpperCase()}${f.slice(1)}` : f);
    return (
      <div className="space-y-4">
        {label && (
          <h4 className="font-semibold text-[#6f1d56] text-base border-b border-purple-100 pb-2">
            {label} Information
          </h4>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {label} Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={fd[pf("gender")]}
              onChange={(e) => update(pf("gender"), e.target.value)}
              className={fieldCls(errors[pf("gender")])}
            >
              <option value="">Please Select</option>
              {["Male","Female","Non-binary","Other","Prefer not to say"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors[pf("gender")] && <p className="text-red-500 text-xs mt-1">{errors[pf("gender")]}</p>}
          </div>
          {/* Ethnicity */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {label} Ethnicity <span className="text-red-500">*</span>
            </label>
            <select
              value={fd[pf("ethnicity")]}
              onChange={(e) => update(pf("ethnicity"), e.target.value)}
              className={fieldCls(errors[pf("ethnicity")])}
            >
              <option value="">Please Select</option>
              {["Caucasian/White","African/Caribbean/Black","North African","Hispanic/Latino","South Asian","Southeast Asian","East Asian","Central Asian","West Asian (Middle Eastern)","North Asian","Mixed/Multiracial","Other"].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            {errors[pf("ethnicity")] && <p className="text-red-500 text-xs mt-1">{errors[pf("ethnicity")]}</p>}
          </div>
          {/* Sexual Orientation */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {label} Sexual Orientation <span className="text-red-500">*</span>
            </label>
            <select
              value={fd[pf("sexualOrientation")]}
              onChange={(e) => update(pf("sexualOrientation"), e.target.value)}
              className={fieldCls(errors[pf("sexualOrientation")])}
            >
              <option value="">Please Select</option>
              {["Heterosexual","Gay","Lesbian","Bisexual","Pansexual","Asexual","Queer","Other","Prefer not to say"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {errors[pf("sexualOrientation")] && <p className="text-red-500 text-xs mt-1">{errors[pf("sexualOrientation")]}</p>}
          </div>
        </div>
      </div>
    );
  };

  const MedicationDisabilityFields = ({ prefix = "", label = "Your" }) => {
    const pf = (f) => (prefix ? `${prefix}${f.charAt(0).toUpperCase()}${f.slice(1)}` : f);
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-[#6f1d56] text-base border-b border-purple-100 pb-2">
          {label} Medication & Disability
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {fd.isCouples ? `Is ${label.toLowerCase()} currently on any medication?` : "Are you currently on any medication?"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={fd[pf("onMedication")]}
              onChange={(e) => update(pf("onMedication"), e.target.value)}
              className={fieldCls(errors[pf("onMedication")])}
            >
              <option value="">Please Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors[pf("onMedication")] && <p className="text-red-500 text-xs mt-1">{errors[pf("onMedication")]}</p>}
          </div>
          {fd[pf("onMedication")] === "Yes" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Please provide medication details
              </label>
              <input
                type="text"
                value={fd[pf("medicationDetails")]}
                onChange={(e) => update(pf("medicationDetails"), e.target.value)}
                className={fieldCls(false)}
                placeholder="Medication name(s)..."
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {fd.isCouples ? `Does ${label.toLowerCase()} have any disability?` : "Do you have any disability or accessibility requirements?"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={fd[pf("hasDisability")]}
              onChange={(e) => update(pf("hasDisability"), e.target.value)}
              className={fieldCls(errors[pf("hasDisability")])}
            >
              <option value="">Please Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors[pf("hasDisability")] && <p className="text-red-500 text-xs mt-1">{errors[pf("hasDisability")]}</p>}
          </div>
          {fd[pf("hasDisability")] === "Yes" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Please describe the disability / accessibility needs
              </label>
              <input
                type="text"
                value={fd[pf("disabilityDetails")]}
                onChange={(e) => update(pf("disabilityDetails"), e.target.value)}
                className={fieldCls(false)}
                placeholder="Details..."
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════
     PROGRESS BAR
  ════════════════════════════════════════════ */
  const ProgressBar = () => (
    <div className="hidden md:flex items-center gap-0 overflow-x-auto">
      {STEPS.map((s, idx) => {
        const done    = completedSteps.has(s.n);
        const current = currentStep === s.n;
        const Icon    = s.icon;
        return (
          <React.Fragment key={s.n}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <button
                type="button"
                onClick={() => goToStep(s.n)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-xs font-bold shrink-0 ${
                  done    ? "bg-green-500 text-white"
                  : current ? "text-white ring-2 ring-offset-2 ring-[#6f1d56]"
                  :          "bg-gray-200 text-gray-400"
                }`}
                style={(current && !done) ? { backgroundColor: "#6f1d56" } : {}}
              >
                {done && !current ? <CheckCircle className="w-4 h-4" /> : s.n}
              </button>
              <span className={`text-[10px] mt-1 text-center truncate w-full px-1 ${current || done ? "text-[#6f1d56] font-semibold" : "text-gray-400"}`}>
                {s.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1 rounded shrink-0 min-w-[8px] transition-colors"
                style={{ backgroundColor: currentStep > s.n ? "#6f1d56" : "#e5e7eb" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <PublicFormWrapper>
      <div className="min-h-screen py-4 md:py-8 px-4" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-4xl mx-auto">

          {/* Header card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border">
            <div className="flex flex-col items-center gap-3 mb-6">
              {brandingLoading ? (
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
              ) : branding.platform_logo_url ? (
                <img src={apiService.getStorageUrl(branding.platform_logo_url)} alt={branding.company_name} className="max-h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: "#6f1d56" }}>
                  {branding.company_name?.substring(0, 2).toUpperCase() || "VT"}
                </div>
              )}
              <div className="text-center">
                <h1 className="text-xl md:text-3xl font-bold text-primary">
                  {fd.serviceType || "Mid Range & Coaching"} — Client Intake Form
                </h1>
                <p className="text-sm text-secondary mt-1">
                  By completing this form you give permission for your information to be shared within{" "}
                  {branding.company_name || "Vanquish Therapies"} for appointment scheduling.
                </p>
              </div>
              <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
            </div>
            <ProgressBar />
          </div>

          {/* Form card */}
          <div ref={formContentRef} className="bg-white rounded-2xl shadow-sm p-4 md:p-8 border">

            {/* ══════════ STEP 1 — Service Information ══════════ */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Service Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Please select the service you are applying for</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Please select the service you require <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-field="serviceType">
                    {[
                      { val: "Mid Range", label: "Mid Range Counselling", price: "Starting from £40", desc: "One-to-one counselling with a qualified counsellor." },
                      { val: "Counselling & Coaching", label: "Coaching & Counselling", price: "Starting from £60", desc: "An integrated coaching and counselling approach." },
                    ].map((s) => (
                      <label
                        key={s.val}
                        className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          fd.serviceType === s.val ? "border-[#6f1d56] bg-purple-50" : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <input type="radio" name="serviceType" value={s.val} checked={fd.serviceType === s.val} onChange={() => update("serviceType", s.val)} className="sr-only" />
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${fd.serviceType === s.val ? "border-[#6f1d56] bg-[#6f1d56]" : "border-gray-300"}`}>
                            {fd.serviceType === s.val && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{s.label}</p>
                            <p className="text-[#6f1d56] font-semibold text-sm">{s.price}</p>
                            <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.serviceType && <p className="text-red-500 text-sm mt-2">{errors.serviceType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Please select if you are applying for individuals or couples/family counselling <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { val: false, label: "Individual Counselling", icon: User, desc: "For a single person." },
                      { val: true,  label: "Couples / Family Counselling", icon: Users, desc: "For two or more people attending together." },
                    ].map((o) => (
                      <label
                        key={String(o.val)}
                        className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          fd.isCouples === o.val ? "border-[#6f1d56] bg-purple-50" : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <input type="radio" name="isCouples" checked={fd.isCouples === o.val} onChange={() => update("isCouples", o.val)} className="sr-only" />
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${fd.isCouples === o.val ? "border-[#6f1d56] bg-[#6f1d56]" : "border-gray-300"}`}>
                            {fd.isCouples === o.val && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <o.icon className="w-5 h-5 text-[#6f1d56] mb-1" />
                            <p className="font-bold text-gray-900">{o.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{o.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ STEP 2 — Personal Information ══════════ */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Personal Information</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  Please be advised that all required fields must be completed. For any fields that do not apply, please enter "N/A".
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">First Name <span className="text-red-500">*</span></label>
                    <input type="text" value={fd.firstName} onChange={(e) => update("firstName", e.target.value)} className={fieldCls(errors.firstName)} placeholder="First Name" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Last Name <span className="text-red-500">*</span></label>
                    <input type="text" value={fd.lastName} onChange={(e) => update("lastName", e.target.value)} className={fieldCls(errors.lastName)} placeholder="Last Name" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" value={fd.email} onChange={(e) => update("email", e.target.value)} className={fieldCls(errors.email)} placeholder="email@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Tel <span className="text-red-500">*</span></label>
                    <input type="tel" value={fd.phone} onChange={(e) => update("phone", e.target.value)} className={fieldCls(errors.phone)} placeholder="+44 7700 900000" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Your Age <span className="text-red-500">*</span></label>
                    <input type="number" min="16" max="100" value={fd.age} onChange={(e) => update("age", e.target.value)} className={fieldCls(errors.age)} placeholder="e.g. 30" />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Is it okay for us to leave you a voicemail? <span className="text-red-500">*</span>
                    </label>
                    <select value={fd.voicemailOk} onChange={(e) => update("voicemailOk", e.target.value)} className={fieldCls(errors.voicemailOk)}>
                      <option value="">Please Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.voicemailOk && <p className="text-red-500 text-xs mt-1">{errors.voicemailOk}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Do you agree to our primary method of communication (Emails and WhatsApp)? <span className="text-red-500">*</span>
                    </label>
                    <select value={fd.whatsappAgreement} onChange={(e) => update("whatsappAgreement", e.target.value)} className={fieldCls(errors.whatsappAgreement)}>
                      <option value="">Please Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No WhatsApp">I prefer emails but not WhatsApp</option>
                    </select>
                    {errors.whatsappAgreement && <p className="text-red-500 text-xs mt-1">{errors.whatsappAgreement}</p>}
                  </div>
                </div>

                {/* Couples partner basics */}
                {fd.isCouples && (
                  <div className="border-t border-purple-100 pt-6">
                    <h3 className="font-bold text-[#6f1d56] mb-4">Partner / Co-Client Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Partner's First Name <span className="text-red-500">*</span></label>
                        <input type="text" value={fd.partnerFirstName} onChange={(e) => update("partnerFirstName", e.target.value)} className={fieldCls(errors.partnerFirstName)} />
                        {errors.partnerFirstName && <p className="text-red-500 text-xs mt-1">{errors.partnerFirstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Partner's Last Name <span className="text-red-500">*</span></label>
                        <input type="text" value={fd.partnerLastName} onChange={(e) => update("partnerLastName", e.target.value)} className={fieldCls(errors.partnerLastName)} />
                        {errors.partnerLastName && <p className="text-red-500 text-xs mt-1">{errors.partnerLastName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Partner's Age <span className="text-red-500">*</span></label>
                        <input type="number" min="16" max="100" value={fd.partnerAge} onChange={(e) => update("partnerAge", e.target.value)} className={fieldCls(errors.partnerAge)} />
                        {errors.partnerAge && <p className="text-red-500 text-xs mt-1">{errors.partnerAge}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Address */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Your Complete Current Address of Residence Including Postcode & City (required for safeguarding and insurance purposes){fd.isCouples ? " — shared address or primary address" : ""} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={fd.fullAddress}
                      onChange={(e) => update("fullAddress", e.target.value)}
                      rows={3}
                      className={fieldCls(errors.fullAddress)}
                      placeholder="Please enter your full address here..."
                    />
                    {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress}</p>}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Please state where you reside in the world (our practice is UK-based; sessions are in UK time) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fd.locationOfResidence}
                      onChange={(e) => update("locationOfResidence", e.target.value)}
                      className={fieldCls(errors.locationOfResidence)}
                      placeholder="e.g. London, UK"
                    />
                    {errors.locationOfResidence && <p className="text-red-500 text-xs mt-1">{errors.locationOfResidence}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ STEP 3 — About You ══════════ */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">About You</h2>
                  <p className="text-sm text-gray-500 mt-1 italic">
                    Your answers help us narrow down the counsellors who best match your preferences and needs
                  </p>
                </div>

                <DemographicsFields prefix="" label="Your" />

                {fd.isCouples && (
                  <div className="border-t border-purple-100 pt-4">
                    <DemographicsFields prefix="partner" label="Partner's" />
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <MedicationDisabilityFields prefix="" label="Your" />
                </div>

                {fd.isCouples && (
                  <div className="border-t border-purple-100 pt-4">
                    <MedicationDisabilityFields prefix="partner" label="Partner's" />
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      {fd.isCouples
                        ? "Are you or your partner/co-client currently in Therapy/Counselling or Coaching anywhere else?"
                        : "Are you currently in Therapy/Counselling or Coaching anywhere else?"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={fd.currentlyInTherapy}
                      onChange={(e) => update("currentlyInTherapy", e.target.value)}
                      className={fieldCls(errors.currentlyInTherapy)}
                    >
                      <option value="">Please Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.currentlyInTherapy && <p className="text-red-500 text-xs mt-1">{errors.currentlyInTherapy}</p>}
                  </div>
                  {fd.currentlyInTherapy === "Yes" && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        If you have selected 'Yes' above — Please explain reasons for working with another Therapist/Counsellor or Coach <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={fd.workingWithAnotherReason}
                        onChange={(e) => update("workingWithAnotherReason", e.target.value)}
                        className={fieldCls(errors.workingWithAnotherReason)}
                        rows={3}
                        placeholder="Reasons..."
                      />
                      {errors.workingWithAnotherReason && <p className="text-red-500 text-xs mt-1">{errors.workingWithAnotherReason}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════ STEP 4 — Support ══════════ */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Areas of Support</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    We have listed areas below you may require support with.{" "}
                    {fd.isCouples && "Select all that apply for either or both of you."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2" data-field="supportAreas">
                  {SUPPORT_AREAS.map((area) => (
                    <label key={area} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={fd.supportAreas.includes(area)}
                        onChange={() => toggleSupportArea(area)}
                        className="mt-0.5 w-4 h-4 accent-[#6f1d56]"
                      />
                      <span className="text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
                {errors.supportAreas && <p className="text-red-500 text-sm">{errors.supportAreas}</p>}

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Please use this box to specify and describe details related to the selected areas, or mention anything else not listed{fd.isCouples ? " (for either or both of you)" : ""}. <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={fd.concernsDetails}
                    onChange={(e) => update("concernsDetails", e.target.value)}
                    className={fieldCls(false)}
                    rows={4}
                    placeholder="Details about your concerns..."
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">Risk & Substance Use</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      {fd.isCouples
                        ? "Do you or your partner/co-client currently use any substances (alcohol, drugs, etc.)?"
                        : "Do you currently use any substances (alcohol, drugs, etc.)?"}
                    </label>
                    <select value={fd.substanceUse} onChange={(e) => update("substanceUse", e.target.value)} className={fieldCls(false)}>
                      <option value="">Please Select</option>
                      <option value="No">No</option>
                      <option value="Yes - Alcohol">Yes — Alcohol</option>
                      <option value="Yes - Drugs">Yes — Drugs (recreational)</option>
                      <option value="Yes - Prescription medication misuse">Yes — Prescription medication misuse</option>
                      <option value="Yes - Other">Yes — Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      {fd.isCouples
                        ? "Have you or your partner/co-client ever had thoughts of self-harm or suicide? If yes, please briefly describe."
                        : "Have you ever had thoughts of self-harm or suicide? If yes, please briefly describe."}
                    </label>
                    <textarea
                      value={fd.riskDetails}
                      onChange={(e) => update("riskDetails", e.target.value)}
                      className={fieldCls(false)}
                      rows={3}
                      placeholder="If yes, please describe (if no, write 'No')..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ STEP 5 — Counsellor Preferences ══════════ */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Counsellor Preferences</h2>
                  <p className="text-sm text-gray-500 italic mt-1">
                    These preferences are optional and help us filter the counsellors that match your preferences and needs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Gender Preference</label>
                    <select value={fd.genderPreference} onChange={(e) => update("genderPreference", e.target.value)} className={fieldCls(false)}>
                      <option value="No preference">No preference</option>
                      <option value="Male">Prefer Male counsellor</option>
                      <option value="Female">Prefer Female counsellor</option>
                      <option value="Non-binary">Prefer Non-binary counsellor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Age Preference</label>
                    <select value={fd.agePreference} onChange={(e) => update("agePreference", e.target.value)} className={fieldCls(false)}>
                      <option value="No preference">No preference</option>
                      <option value="Younger">Prefer younger counsellor (close to my age)</option>
                      <option value="Older">Prefer older counsellor</option>
                      <option value="Custom range">Custom age range</option>
                    </select>
                  </div>
                  {fd.agePreference === "Custom range" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Minimum Age</label>
                        <input type="number" min="18" max="100" value={fd.ageRangeMin} onChange={(e) => update("ageRangeMin", e.target.value)} className={fieldCls(false)} placeholder="e.g. 25" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Maximum Age</label>
                        <input type="number" min="18" max="100" value={fd.ageRangeMax} onChange={(e) => update("ageRangeMax", e.target.value)} className={fieldCls(false)} placeholder="e.g. 50" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Ethnicity Preference</label>
                    <select value={fd.ethnicityPreference} onChange={(e) => update("ethnicityPreference", e.target.value)} className={fieldCls(false)}>
                      <option value="No preference">No preference</option>
                      <option value="Prefer same">Prefer same ethnicity as me</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Sexual Orientation Preference</label>
                    <select value={fd.orientationPreference} onChange={(e) => update("orientationPreference", e.target.value)} className={fieldCls(false)}>
                      <option value="No preference">No preference</option>
                      <option value="LGBTQ+ specialist">Prefer LGBTQ+ specialist</option>
                      <option value="Same orientation">Prefer same orientation as me</option>
                      <option value="Specific">Prefer specific orientation</option>
                    </select>
                  </div>
                  {fd.orientationPreference === "Specific" && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Specify Orientation</label>
                      <select value={fd.specificOrientation} onChange={(e) => update("specificOrientation", e.target.value)} className={fieldCls(false)}>
                        <option value="">Select orientation</option>
                        <option value="Gay">Gay counsellor</option>
                        <option value="Lesbian">Lesbian counsellor</option>
                        <option value="Bisexual">Bisexual counsellor</option>
                        <option value="Heterosexual">Heterosexual counsellor</option>
                      </select>
                    </div>
                  )}
                  {fd.isCouples && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Counsellor Specialty Preference</label>
                      <select value={fd.specialtyPreference} onChange={(e) => update("specialtyPreference", e.target.value)} className={fieldCls(false)}>
                        <option value="">No preference</option>
                        <option value="Couples Counsellor">Couples Counsellor</option>
                        <option value="Family Therapist">Family Therapist</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> These preferences help us find the best match, but availability is also taken into account. We will do our best to match all your preferences while ensuring you get an appointment as soon as possible.
                  </p>
                </div>
              </div>
            )}

            {/* ══════════ STEP 6 — Referral ══════════ */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Referral Information</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    How did you become aware of our services? <span className="text-red-500">*</span>
                  </label>
                  <select value={fd.hearAboutUs} onChange={(e) => update("hearAboutUs", e.target.value)} className={fieldCls(errors.hearAboutUs)}>
                    <option value="">Please Select</option>
                    <option value="Online (Google, Bing etc)">Online (Google, Bing etc)</option>
                    <option value="Social Media (Facebook, Instagram)">Social Media (Facebook, Instagram)</option>
                    <option value="Referral">Referral</option>
                    <option value="Word of mouth">Word of mouth</option>
                    <option value="Billboard">Billboard</option>
                  </select>
                  {errors.hearAboutUs && <p className="text-red-500 text-xs mt-1">{errors.hearAboutUs}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Please select the referral type: <span className="text-red-500">*</span>
                  </label>
                  <select value={fd.referralType} onChange={(e) => update("referralType", e.target.value)} className={fieldCls(errors.referralType)}>
                    <option value="">Please Select</option>
                    <option value="Self-Referral">Self-Referral</option>
                    <option value="Referred Through an Organisation">Referred Through an Organisation</option>
                    <option value="Referred Through an Individual">Referred Through an Individual</option>
                  </select>
                  {errors.referralType && <p className="text-red-500 text-xs mt-1">{errors.referralType}</p>}
                </div>
              </div>
            )}

            {/* ══════════ STEP 7 — Assessment (CORE-10) ══════════ */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Wellbeing Assessment</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Please indicate how often you have experienced each of the following over the <strong>last week</strong>.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>Why we ask:</strong> This helps your counsellor understand your current wellbeing and tailor their support accordingly. There are no right or wrong answers.
                </div>
                <div className="space-y-4">
                  {CORE_QUESTIONS.map((q, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-800 mb-3">
                        <span className="text-[#6f1d56] font-bold mr-2">{idx + 1}.</span> {q}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {CORE_SCALE.map((s) => (
                          <label
                            key={s.value}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer text-center transition-all ${
                              fd.coreAnswers[idx] === s.value
                                ? "border-[#6f1d56] bg-purple-50"
                                : "border-gray-200 hover:border-purple-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`core_${idx}`}
                              value={s.value}
                              checked={fd.coreAnswers[idx] === s.value}
                              onChange={() => setCoreAnswer(idx, s.value)}
                              className="sr-only"
                            />
                            <span className={`text-xl font-bold ${fd.coreAnswers[idx] === s.value ? "text-[#6f1d56]" : "text-gray-500"}`}>{s.value}</span>
                            <span className="text-[10px] text-gray-500 leading-tight">{s.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════ STEP 8 — Availability ══════════ */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Your Availability To Attend Weekly Sessions</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Select 1 day and time slot for your recurring weekly counselling sessions — the more slots you select, the more counsellors or coaches to choose from.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> To avoid any delays, please select the accurate day and time you are available to attend weekly counselling sessions in UK time, as the practice is based in the UK. Please note — the last session is at 6pm from Monday to Thursday, and at 5pm on Friday.
                  </p>
                </div>

                {DAYS.map((day) => {
                  const slots = day === "friday" ? FRIDAY_SLOTS : ALL_SLOTS;
                  return (
                    <div key={day} className="border rounded-xl p-4">
                      <h3 className="font-bold capitalize text-[#6f1d56] mb-3">{day}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <label
                            key={slot.value}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                              fd.availability[day].includes(slot.value)
                                ? "border-[#6f1d56] bg-purple-50"
                                : "border-gray-200 bg-gray-50 hover:border-purple-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={fd.availability[day].includes(slot.value)}
                              onChange={() => toggleAvailability(day, slot.value)}
                              className="accent-[#6f1d56]"
                            />
                            <span className="text-sm">{slot.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {errors.availability && <p className="text-red-500 text-sm">{errors.availability}</p>}
              </div>
            )}

            {/* ══════════ STEP 9 — Filtered Counsellors ══════════ */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Your Filtered Counsellors</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on your preferences, we've <span className="text-[#6f1d56] font-semibold uppercase tracking-wide">filtered</span> these counsellors for you.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700">
                      <Users className="w-4 h-4" /> {sortedTcs.length} Counsellor{sortedTcs.length !== 1 ? "s" : ""} Found
                    </span>
                    <select
                      value={filteredSortBy}
                      onChange={(e) => setFilteredSortBy(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                    >
                      <option value="score">Sort: Best Fit</option>
                      <option value="name">Sort: Name A–Z</option>
                    </select>
                  </div>
                </div>

                {/* Filter criteria summary */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-[#6f1d56]" />
                    <span className="text-sm font-semibold text-gray-700">Your Filter Criteria</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
                    {fd.supportAreas.length > 0 && (
                      <div><span className="font-semibold">Areas:</span> {fd.supportAreas.slice(0, 3).join(", ")}{fd.supportAreas.length > 3 && ` +${fd.supportAreas.length - 3} more`}</div>
                    )}
                    {fd.genderPreference !== "No preference" && (
                      <div><span className="font-semibold">Counsellor Gender:</span> {fd.genderPreference}</div>
                    )}
                    {fd.ethnicityPreference !== "No preference" && (
                      <div><span className="font-semibold">Ethnicity:</span> {fd.ethnicityPreference}</div>
                    )}
                    {fd.orientationPreference !== "No preference" && (
                      <div><span className="font-semibold">Orientation:</span> {fd.orientationPreference}</div>
                    )}
                    {Object.entries(fd.availability).some(([,v]) => v.length > 0) && (
                      <div><span className="font-semibold">Availability:</span> {
                        Object.entries(fd.availability).filter(([,v]) => v.length > 0).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(", ")
                      }</div>
                    )}
                    {fd.isCouples && <div><span className="font-semibold">Type:</span> Couples</div>}
                  </div>
                </div>

                {errors.selectedTc && <p className="text-red-500 text-sm">{errors.selectedTc}</p>}

                {loadingFiltered ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6f1d56]" />
                    <p className="text-sm text-gray-500">Finding your matched counsellors…</p>
                  </div>
                ) : sortedTcs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No counsellors matched your criteria right now.</p>
                    <p className="text-sm text-gray-400 mt-1">Try widening your availability or adjusting preferences.</p>
                    <button
                      onClick={() => { setFilteredTcs([]); goToStep(8); }}
                      className="mt-4 text-sm text-[#6f1d56] underline"
                    >
                      Go back and update availability
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedTcs.map((tc) => {
                      const fit = getFitLabel(tc.score ?? 0);
                      const isSelected = selectedTc?.uuid === tc.uuid;
                      return (
                        <div
                          key={tc.uuid}
                          className={`border-2 rounded-xl p-5 transition-all ${
                            isSelected ? "border-[#6f1d56] bg-purple-50" : "border-gray-200 hover:border-purple-300 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-gray-100 bg-purple-100 flex items-center justify-center text-2xl font-bold text-[#6f1d56]">
                              {tc.photo_url || tc.photo ? (
                                <img src={apiService.getStorageUrl(tc.photo_url || tc.photo)} alt={tc.name} className="w-full h-full object-cover" />
                              ) : (
                                tc.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                  <h3 className="font-bold text-gray-900 text-lg">{tc.name}</h3>
                                  {tc.qualification && <p className="text-xs text-gray-500">{tc.qualification}</p>}
                                  {tc.years_experience && <p className="text-xs text-gray-500">{tc.years_experience}+ years experience</p>}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {tc.modality && <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">{tc.modality}</span>}
                                    {tc.specialty && <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">{tc.specialty}</span>}
                                  </div>
                                </div>
                                {/* Match score */}
                                <div className="text-right shrink-0">
                                  <div className={`inline-flex flex-col items-center rounded-xl px-3 py-2 ${fit.bg}`}>
                                    <Star className={`w-4 h-4 ${fit.text} mb-0.5`} />
                                    <span className={`text-xs font-semibold ${fit.text}`}>{fit.label}</span>
                                  </div>
                                  {tc.score != null && (
                                    <p className="text-2xl font-black text-gray-900 mt-1">{Math.round(tc.score)}%</p>
                                  )}
                                  <p className="text-[10px] text-gray-400">Overall Fit</p>
                                </div>
                              </div>
                              {tc.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{tc.bio}</p>}
                              {tc.support_areas?.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Areas of Support</p>
                                  <div className="flex flex-wrap gap-1">
                                    {tc.support_areas.slice(0, 5).map((a) => (
                                      <span key={a} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{a}</span>
                                    ))}
                                    {tc.support_areas.length > 5 && <span className="text-xs text-gray-400">+{tc.support_areas.length - 5}</span>}
                                  </div>
                                </div>
                              )}
                              {tc.availability_summary && (
                                <p className="text-xs text-gray-500 mt-2">
                                  📅 Available: {tc.availability_summary}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedTc(tc);
                                setConsultAvailability(null);
                                setSelectedConsultSlot(null);
                                setErrors((p) => { const n = { ...p }; delete n.selectedTc; return n; });
                              }}
                              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                                isSelected
                                  ? "bg-[#6f1d56] text-white"
                                  : "border-2 border-[#6f1d56] text-[#6f1d56] hover:bg-purple-50"
                              }`}
                            >
                              {isSelected ? "✓ Selected" : "Select"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedTc && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      You have selected <strong>{selectedTc.name}</strong>. Click "Next" to book your consultation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ══════════ STEP 10 — Consultation Booking ══════════ */}
            {currentStep === 10 && selectedTc && (
              <div className="space-y-6">
                {loadingAvail ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6f1d56]" />
                    <p className="text-sm text-gray-500">Loading consultation slots…</p>
                  </div>
                ) : (
                  <>
                    {/* Source-dependent banner */}
                    {consultAvailability?.source === "vanquish" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          This counsellor does not have availability for a consultation in the next few weeks. However, choose any of these slots to book a consultation with <strong>Vanquish Therapies</strong>. After the consultation, you can begin sessions with {selectedTc.name}.
                        </p>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* TC photo */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 border-gray-100 bg-purple-100 flex items-center justify-center text-3xl font-bold text-[#6f1d56]">
                        {selectedTc.photo_url || selectedTc.photo ? (
                          <img src={apiService.getStorageUrl(selectedTc.photo_url || selectedTc.photo)} alt={selectedTc.name} className="w-full h-full object-cover" />
                        ) : (
                          selectedTc.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-primary">
                          Book a Consultation {consultAvailability?.source === "counsellor" ? `with ${selectedTc.name}` : ""}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedTc.name} · {selectedTc.qualification || "Registered Counsellor"}
                        </p>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">✓ 15-minute call</span>
                          <span className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">✓ {consultAvailability?.source === "counsellor" ? `Get to know ${selectedTc.name.split(" ")[0]}` : "Understand your needs"}</span>
                          <span className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">✓ {consultAvailability?.source === "counsellor" ? "No obligation" : "Find your best match"}</span>
                        </div>
                        {consultAvailability?.source === "counsellor" && (
                          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-amber-800">
                              ⭐ Choose any of the available slots below to book your consultation with {selectedTc.name}. After the consultation, you can begin sessions with {selectedTc.name.split(" ")[0]}.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div data-field="selectedConsultSlot">
                      <h3 className="font-bold text-gray-800 mb-3">Select a Date &amp; Time</h3>
                      {(consultAvailability?.slots || []).length === 0 ? (
                        <p className="text-sm text-gray-500 py-6 text-center">
                          No consultation slots are currently available. Please contact us for assistance.
                        </p>
                      ) : (
                        <CalendarPicker
                          availableSlots={consultAvailability.slots}
                          selectedSlot={selectedConsultSlot}
                          onSelect={(slot) => {
                            setSelectedConsultSlot(slot);
                            setErrors((p) => { const n = { ...p }; delete n.selectedConsultSlot; return n; });
                          }}
                        />
                      )}
                      {errors.selectedConsultSlot && <p className="text-red-500 text-sm mt-2">{errors.selectedConsultSlot}</p>}
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          {consultAvailability?.source === "counsellor"
                            ? `Consultation with ${selectedTc.name} directly via a secure video call.`
                            : "Secure & Confidential — Your information is safe with us. This consultation is confidential and commitment-free."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setCurrentStep(9); setSelectedConsultSlot(null); }}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6f1d56] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to filtered counsellors
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ══════════ STEP 11 — Emergency Contact ══════════ */}
            {currentStep === 11 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-500" /> Emergency Contact Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">As the sessions are online, this is required for safeguarding and insurance purposes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Emergency Contact Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={fd.emergencyContactName} onChange={(e) => update("emergencyContactName", e.target.value)} className={fieldCls(errors.emergencyContactName)} placeholder="Full Name" />
                    {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Telephone Number <span className="text-red-500">*</span></label>
                    <input type="tel" value={fd.emergencyContactPhone} onChange={(e) => update("emergencyContactPhone", e.target.value)} className={fieldCls(errors.emergencyContactPhone)} placeholder="+44..." />
                    {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
                    <input type="email" value={fd.emergencyContactEmail} onChange={(e) => update("emergencyContactEmail", e.target.value)} className={fieldCls(errors.emergencyContactEmail)} placeholder="email@example.com" />
                    {errors.emergencyContactEmail && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Relationship to You <span className="text-red-500">*</span></label>
                    <input type="text" value={fd.emergencyContactRelationship} onChange={(e) => update("emergencyContactRelationship", e.target.value)} className={fieldCls(errors.emergencyContactRelationship)} placeholder="e.g. Spouse, Parent, Friend" />
                    {errors.emergencyContactRelationship && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRelationship}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ STEP 12 — Payment & Terms ══════════ */}
            {currentStep === 12 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">Payment &amp; Terms</h2>
                </div>

                {/* Consultation slot summary */}
                {selectedConsultSlot && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-1">Your Consultation Booking</p>
                    <p className="text-sm text-purple-700">
                      {selectedConsultSlot.date} at {selectedConsultSlot.formatted_time}
                      {selectedTc && ` with ${consultAvailability?.source === "counsellor" ? selectedTc.name : "Vanquish Therapies"}`}
                    </p>
                  </div>
                )}

                {/* Fee display */}
                <div className="border-2 border-[#6f1d56] bg-purple-50 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#6f1d56]">
                      {fd.serviceType} — Initial Consultation
                    </p>
                    <p className="text-sm text-purple-700">Non-refundable</p>
                  </div>
                  <p className="text-4xl font-black text-[#6f1d56]">£{getConsultFee().toFixed(2)}</p>
                </div>

                {/* Discount code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fd.discountCode}
                    onChange={(e) => update("discountCode", e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f1d56]"
                    placeholder="Discount / coupon code"
                  />
                  <button onClick={applyDiscount} className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                    Apply
                  </button>
                </div>
                {isDiscountApplied && (
                  <p className="text-green-600 text-sm">✓ Discount applied — saving £{discountAmount.toFixed(2)}</p>
                )}

                {/* Terms */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-800 mb-2">Terms &amp; Conditions</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Please note: our consultation slots are limited; therefore, payment is required to secure another consultation. We appreciate your understanding. The consultation payment is non-refundable.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fd.termsAccepted}
                      onChange={(e) => update("termsAccepted", e.target.checked)}
                      className="mt-0.5 accent-[#6f1d56]"
                    />
                    <span className="text-sm font-medium text-gray-700">I accept the terms and conditions.</span>
                  </label>
                  {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>}
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-xl">
                  Thank you for completing this form and for taking the first step towards healing. Please note — this is not a crisis or emergency service. If you need to speak to someone immediately, please contact your GP, NHS (111), or the Samaritans (116 123).
                </div>
              </div>
            )}

            {/* ══════════ Navigation ══════════ */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-40 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-sm text-gray-400">Step {currentStep} / {totalSteps}</span>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                !clientId && (
                  <button
                    onClick={handleSubmit}
                    disabled={!fd.termsAccepted}
                    className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: "#6f1d56" }}
                  >
                    <CreditCard className="w-4 h-4" /> Save &amp; Proceed to Payment
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showPaymentModal && paymentProps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold">Secure Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 flex justify-between items-center mb-5">
              <span className="font-medium text-purple-800">Consultation Fee</span>
              <span className="text-2xl font-black text-purple-900">£{paymentProps.amount.toFixed(2)}</span>
            </div>
            <StripePaymentWrapper
              clientId={paymentProps.clientId}
              amount={paymentProps.amount}
              paymentType="consultation"
              couponCode={paymentProps.couponCode}
              consultationSlotId={paymentProps.consultationSlotId}
              consultationWithTcUuid={paymentProps.consultationWithTcUuid}
              consultationDatetime={paymentProps.consultationDatetime}
              returnUrl={paymentProps.returnUrl}
              onSuccess={paymentProps.onSuccess}
              onError={paymentProps.onError}
            />
          </div>
        </div>
      )}
    </PublicFormWrapper>
  );
}
