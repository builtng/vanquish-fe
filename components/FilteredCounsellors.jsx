"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  Heart,
  User,
  Layers,
  Sparkles,
  CheckCircle2,
  Check,
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  Award,
  BookOpen,
  X,
  Lock,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Globe,
  ShieldCheck,
  Info,
  Shield,
  HelpCircle,
  Video,
} from "lucide-react";
import apiService from "@/lib/api";

// Fallback high-quality counsellor portraits matching the visual mockups
const FALLBACK_COUNSELLORS = [
  {
    uuid: "counsellor-sarah-mitchell",
    name: "Sarah Mitchell",
    first_name: "Sarah",
    qualification_title: "Registered Counsellor (RPC)",
    years_of_experience: "8+ years experience",
    photo_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    modality: "Integrative",
    qualified_to_work_with: ["Individuals", "Couples"],
    bio: "I help individuals and couples heal from trauma, improve communication and build healthier, more connected relationships.",
    topics_with_experience: [
      "Trauma",
      "Domestic Violence",
      "Anxiety",
      "Abuse",
      "Relationship Issues",
    ],
    availability_summary: "Available: Mon, Tue, Fri (11am – 5pm)",
    match_score: 100,
    fit_label: "Best Fit",
    session_type: "Online (Video) or In-Person",
    languages: "English",
    insurance: "Not accepted",
    education_credentials: [
      "Master of Counselling Psychology - Yorkville University",
      "Registered Professional Counsellor (RPC) - CRPO",
      "Trauma-Informed Therapy Certificate - The Trauma Centre",
    ],
    show_own_consultation_availability: true, // Direct consultation availability
  },
  {
    uuid: "counsellor-jessica-thompson",
    name: "Jessica Thompson",
    first_name: "Jessica",
    qualification_title: "Registered Counsellor (RPC)",
    years_of_experience: "6+ years experience",
    photo_url:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
    modality: "Integrative",
    qualified_to_work_with: ["Individuals", "Couples"],
    bio: "Specializing in trauma recovery and supporting couples to create stronger, healthier connections.",
    topics_with_experience: [
      "Trauma",
      "Domestic Violence",
      "Anxiety",
      "Abuse",
      "Self-Esteem",
    ],
    availability_summary: "Available: Mon, Tue, Fri (11am – 5pm)",
    match_score: 92,
    fit_label: "Great Fit",
    session_type: "Online (Video) or In-Person",
    languages: "English",
    insurance: "Not accepted",
    education_credentials: [
      "MSc in Clinical Counselling - University of Edinburgh",
      "Registered Member MBACP - British Association for Counselling",
      "Couples & Relational Therapy Advanced Diploma",
    ],
    show_own_consultation_availability: false, // Vanquish delegation
  },
  {
    uuid: "counsellor-emily-rose",
    name: "Emily Rose",
    first_name: "Emily",
    qualification_title: "Registered Counsellor (RPC)",
    years_of_experience: "5+ years experience",
    photo_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    modality: "Integrative",
    qualified_to_work_with: ["Individuals", "Couples"],
    bio: "I support clients in healing from past experiences, managing anxiety and building safe, fulfilling relationships.",
    topics_with_experience: [
      "Trauma",
      "Domestic Violence",
      "Anxiety",
      "Abuse",
      "Depression",
    ],
    availability_summary: "Available: Mon, Tue, Fri (11am – 5pm)",
    match_score: 85,
    fit_label: "Good Fit",
    session_type: "Online (Video) or In-Person",
    languages: "English",
    insurance: "Not accepted",
    education_credentials: [
      "Postgraduate Diploma in Integrative Psychotherapy",
      "NCPS Accredited Professional Counsellor",
      "Certificate in Mindfulness-Based Stress Reduction",
    ],
    show_own_consultation_availability: true, // Direct consultation availability
  },
];

export default function FilteredCounsellors({
  formData,
  onSelectCounsellor,
  selectedCounsellorUuid,
  selectedSlotId,
  selectedDatetime,
  onSelectSlot,
  availableSlots = [],
  isSlotsLoading = false,
  errors = {},
}) {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("best_fit");
  const [favorites, setFavorites] = useState({});
  const [activeProfileModal, setActiveProfileModal] = useState(null);

  // View state: 'directory' (3 counsellor cards list) or 'booking' (focused consultation booking page)
  const [viewMode, setViewMode] = useState("directory");

  // Counsellor consultation slot state
  const [counsellorSlots, setCounsellorSlots] = useState([]);
  const [loadingCounsellorSlots, setLoadingCounsellorSlots] = useState(false);
  const [slotSource, setSlotSource] = useState("counsellor");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [timezone, setTimezone] = useState("Europe/London");
  const [faqExpanded, setFaqExpanded] = useState(false);

  // Format client availability summary text
  const clientAvailabilitySummary = useMemo(() => {
    if (!formData.availability) return "Mon, Tue, Fri (11am – 5pm)";
    const days = [];
    const dayMap = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
    };
    Object.keys(formData.availability).forEach((d) => {
      if (
        Array.isArray(formData.availability[d]) &&
        formData.availability[d].length > 0
      ) {
        days.push(dayMap[d.toLowerCase()] || d);
      }
    });
    if (days.length === 0) return "Mon, Tue, Fri (11am – 5pm)";
    return `${days.join(", ")} (11am – 5pm)`;
  }, [formData.availability]);

  // Format client support areas summary text
  const clientSupportAreasSummary = useMemo(() => {
    if (
      !formData.supportAreas ||
      !Array.isArray(formData.supportAreas) ||
      formData.supportAreas.length === 0
    ) {
      return "Trauma, Domestic Violence, Anxiety, Abuse";
    }
    return formData.supportAreas.slice(0, 4).join(", ");
  }, [formData.supportAreas]);

  // Format client gender preference text
  const clientPreferenceSummary = useMemo(() => {
    if (
      !formData.genderPreference ||
      formData.genderPreference === "No preference"
    ) {
      return "Female Counsellor";
    }
    return formData.genderPreference.includes("Counsellor")
      ? formData.genderPreference
      : `${formData.genderPreference} Counsellor`;
  }, [formData.genderPreference]);

  // Specialty label
  const clientSpecialtyLabel = formData.isCouples
    ? "Couples Counsellor"
    : "Individual Counsellor";

  // Fetch filtered counsellors from backend
  useEffect(() => {
    let isMounted = true;
    const fetchCounsellors = async () => {
      setLoading(true);
      try {
        const payload = {
          service_type: formData.serviceType || "Mid Range",
          is_couples: !!formData.isCouples,
          support_areas: formData.supportAreas || [],
          availability: formData.availability || {},
          gender_preference: formData.genderPreference || "No preference",
          age_preference: formData.agePreference || "No preference",
          ethnicity_preference: formData.ethnicityPreference || "No preference",
          orientation_preference:
            formData.orientationPreference || "No preference",
        };

        const res = await apiService.getFilteredCounsellors(payload);
        if (isMounted) {
          if (res && Array.isArray(res.counsellors) && res.counsellors.length > 0) {
            const enhanced = res.counsellors.map((c, index) => {
              const fallback =
                FALLBACK_COUNSELLORS[index % FALLBACK_COUNSELLORS.length];
              return {
                ...fallback,
                ...c,
                first_name:
                  c.first_name ||
                  (c.name ? c.name.split(" ")[0] : fallback.first_name),
                photo_url: c.photo_url || fallback.photo_url,
                qualification_title:
                  c.qualification_title || fallback.qualification_title,
                years_of_experience:
                  c.years_of_experience || fallback.years_of_experience,
                bio: c.bio || fallback.bio,
                topics_with_experience:
                  c.topics_with_experience &&
                  c.topics_with_experience.length > 0
                    ? c.topics_with_experience
                    : fallback.topics_with_experience,
                availability_summary:
                  c.availability_summary || fallback.availability_summary,
                match_score: c.match_score || fallback.match_score,
                fit_label: c.fit_label || fallback.fit_label,
                session_type: c.session_type || fallback.session_type,
                languages: c.languages || fallback.languages,
                insurance: c.insurance || fallback.insurance,
                education_credentials:
                  c.education_credentials || fallback.education_credentials,
                show_own_consultation_availability:
                  c.show_own_consultation_availability ??
                  fallback.show_own_consultation_availability,
              };
            });
            setCounsellors(enhanced);

            if (!selectedCounsellorUuid && enhanced.length > 0) {
              onSelectCounsellor(enhanced[0]);
            }
          } else {
            setCounsellors(FALLBACK_COUNSELLORS);
            if (!selectedCounsellorUuid) {
              onSelectCounsellor(FALLBACK_COUNSELLORS[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load filtered counsellors:", err);
        if (isMounted) {
          setCounsellors(FALLBACK_COUNSELLORS);
          if (!selectedCounsellorUuid) {
            onSelectCounsellor(FALLBACK_COUNSELLORS[0]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCounsellors();
    return () => {
      isMounted = false;
    };
  }, [
    formData.serviceType,
    formData.isCouples,
    formData.supportAreas,
    formData.availability,
    formData.genderPreference,
    formData.agePreference,
    formData.ethnicityPreference,
    formData.orientationPreference,
  ]);

  // Fetch slots for selected counsellor
  useEffect(() => {
    if (!selectedCounsellorUuid) return;

    let isMounted = true;
    const fetchCounsellorSlots = async () => {
      setLoadingCounsellorSlots(true);
      try {
        const res = await apiService.getCounsellorConsultationAvailability(
          selectedCounsellorUuid
        );
        if (isMounted && res) {
          setSlotSource(res.source || "counsellor");
          if (Array.isArray(res.slots) && res.slots.length > 0) {
            setCounsellorSlots(res.slots);
          } else {
            setCounsellorSlots(availableSlots);
          }
        }
      } catch (err) {
        console.error(
          "Error fetching counsellor consultation availability:",
          err
        );
        if (isMounted) {
          setSlotSource("vanquish");
          setCounsellorSlots(availableSlots);
        }
      } finally {
        if (isMounted) setLoadingCounsellorSlots(false);
      }
    };

    fetchCounsellorSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedCounsellorUuid, availableSlots]);

  // Sort counsellors based on user selection
  const sortedCounsellors = useMemo(() => {
    const list = [...counsellors];
    switch (sortBy) {
      case "best_fit":
      case "score_desc":
        return list.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      case "experience_desc":
        return list.sort((a, b) => {
          const numA = parseInt(a.years_of_experience || "0", 10) || 0;
          const numB = parseInt(b.years_of_experience || "0", 10) || 0;
          return numB - numA;
        });
      case "name_asc":
        return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      default:
        return list;
    }
  }, [counsellors, sortBy]);

  const toggleFavorite = (uuid) => {
    setFavorites((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  const selectedCounsellorObj = useMemo(() => {
    return (
      counsellors.find((c) => c.uuid === selectedCounsellorUuid) ||
      counsellors[0] ||
      FALLBACK_COUNSELLORS[0]
    );
  }, [counsellors, selectedCounsellorUuid]);

  // Effective slots to display in calendar
  const activeSlots = useMemo(() => {
    return counsellorSlots.length > 0 ? counsellorSlots : availableSlots;
  }, [counsellorSlots, availableSlots]);

  // Determine whether this counsellor delegates to Vanquish Therapies
  // If show_own_consultation_availability is explicitly true, they do consultation on their own.
  const isDelegatedToVanquish = useMemo(() => {
    if (selectedCounsellorObj?.show_own_consultation_availability === false) {
      return true;
    }
    if (selectedCounsellorObj?.show_own_consultation_availability === true) {
      return false;
    }
    return slotSource === "vanquish";
  }, [slotSource, selectedCounsellorObj]);

  // Handle switching to focused consultation booking view
  const handleProceedToBooking = (counsellor) => {
    onSelectCounsellor(counsellor);
    setViewMode("booking");
  };

  const firstName =
    selectedCounsellorObj?.first_name ||
    selectedCounsellorObj?.name?.split(" ")[0] ||
    "Sarah";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW MODE 1: FILTERED COUNSELLORS DIRECTORY VIEW (3 Cards)        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "directory" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-100">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1b3b2b]">
                Your Filtered Counsellors
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-2">
                Based on your preferences, we’ve{" "}
                <span className="font-bold text-[#2d5a3f] tracking-wide">
                  FILTERED
                </span>{" "}
                these counsellors for you.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4 text-[#2d5a3f]" />
                <span>
                  {loading
                    ? "Finding..."
                    : `${sortedCounsellors.length} Counsellors Found`}
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="relative inline-flex items-center">
                <label
                  htmlFor="counsellor-sort"
                  className="text-sm font-medium text-gray-600 mr-2 whitespace-nowrap"
                >
                  Sort by:
                </label>
                <div className="relative">
                  <select
                    id="counsellor-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2 pr-9 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3f] focus:border-transparent cursor-pointer"
                  >
                    <option value="best_fit">Best Fit</option>
                    <option value="score_desc">Match Score: High to Low</option>
                    <option value="experience_desc">
                      Experience: High to Low
                    </option>
                    <option value="name_asc">Alphabetical: A to Z</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Filter Criteria & Preferences */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Your Filter Criteria */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#f4f7f4] text-[#2d5a3f] rounded-2xl">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Your Filter Criteria
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Here’s how we used your preferences to filter these
                      counsellors.
                    </p>
                  </div>
                </div>

                {/* Criteria List */}
                <div className="space-y-5 pt-2">
                  {/* 1. Availability Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span>Availability Match</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-6">
                      {clientAvailabilitySummary}
                    </p>
                    <div className="flex items-center gap-3 pl-6 pt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[#36533c] h-full rounded-full transition-all duration-700"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-800 min-w-[34px] text-right">
                        100%
                      </span>
                    </div>
                  </div>

                  {/* 2. Areas of Support Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Heart className="w-4 h-4 text-gray-600" />
                      <span>Areas of Support Match</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-6 line-clamp-2">
                      {clientSupportAreasSummary}
                    </p>
                    <div className="flex items-center gap-3 pl-6 pt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[#36533c] h-full rounded-full transition-all duration-700"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-800 min-w-[34px] text-right">
                        100%
                      </span>
                    </div>
                  </div>

                  {/* 3. Modality Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Layers className="w-4 h-4 text-gray-600" />
                      <span>Modality Match</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-6">
                      Integrative Counsellor
                    </p>
                    <div className="flex items-center gap-3 pl-6 pt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[#36533c] h-full rounded-full transition-all duration-700"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-800 min-w-[34px] text-right">
                        100%
                      </span>
                    </div>
                  </div>

                  {/* 4. Specialty Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span>Specialty Match</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-6">
                      {clientSpecialtyLabel}
                    </p>
                    <div className="flex items-center gap-3 pl-6 pt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[#36533c] h-full rounded-full transition-all duration-700"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-800 min-w-[34px] text-right">
                        100%
                      </span>
                    </div>
                  </div>

                  {/* 5. Counsellor Preference */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <User className="w-4 h-4 text-gray-600" />
                      <span>Counsellor Preference</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-6">
                      {clientPreferenceSummary}
                    </p>
                    <div className="flex items-center gap-3 pl-6 pt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[#36533c] h-full rounded-full transition-all duration-700"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-800 min-w-[34px] text-right">
                        100%
                      </span>
                    </div>
                  </div>
                </div>

                {/* About These Results Box */}
                <div className="bg-[#f7f9f7] rounded-2xl p-4 border border-[#e2ece4] flex items-start gap-3 mt-4">
                  <div className="w-6 h-6 rounded-full bg-[#2d5a3f] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      About These Results
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      These counsellors meet or closely align with your selected
                      preferences and availability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Your Selected Preferences */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Your Selected Preferences
                </h3>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Areas of Support
                      </span>
                      <span className="text-xs text-gray-600">
                        {clientSupportAreasSummary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Modality
                      </span>
                      <span className="text-xs text-gray-600">
                        Integrative Counsellor
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Specialty
                      </span>
                      <span className="text-xs text-gray-600">
                        {clientSpecialtyLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Availability
                      </span>
                      <span className="text-xs text-gray-600">
                        {clientAvailabilitySummary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Counsellor Preference
                      </span>
                      <span className="text-xs text-gray-600">
                        {clientPreferenceSummary}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Matched Counsellor Cards */}
            <div className="lg:col-span-8 space-y-6">
              {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#2d5a3f]" />
                  <p className="text-gray-600 font-medium">
                    Matching and filtering the best qualified counsellors for you...
                  </p>
                </div>
              ) : (
                sortedCounsellors.map((counsellor) => {
                  const isSelected =
                    selectedCounsellorUuid === counsellor.uuid;
                  const isFav = !!favorites[counsellor.uuid];

                  return (
                    <div
                      key={counsellor.uuid}
                      className={`bg-white rounded-3xl border transition-all duration-300 p-6 shadow-sm relative ${
                        isSelected
                          ? "border-[#2d4a3e] ring-2 ring-[#2d4a3e]/15 shadow-md bg-[#fdfefd]"
                          : "border-gray-200/80 hover:border-gray-300 hover:shadow"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Portrait Photo */}
                        <div className="relative flex-shrink-0 self-center md:self-start">
                          <img
                            src={counsellor.photo_url}
                            alt={counsellor.name}
                            className="w-44 h-52 md:w-48 md:h-56 rounded-2xl object-cover shadow-sm bg-gray-100 border border-gray-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";
                            }}
                          />
                          {isSelected && (
                            <div className="absolute top-2 left-2 bg-[#2d5a3f] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Selected</span>
                            </div>
                          )}
                        </div>

                        {/* Middle Info */}
                        <div className="flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div>
                              <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                {counsellor.name}
                              </h2>
                              <div className="flex flex-wrap items-center gap-x-2 text-xs md:text-sm text-gray-600 mt-0.5">
                                <span>{counsellor.qualification_title}</span>
                                <span>•</span>
                                <span>{counsellor.years_of_experience}</span>
                              </div>
                            </div>

                            {/* Modality & Specialty Pills */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200/60">
                                <Sparkles className="w-3 h-3 text-gray-500" />
                                {counsellor.modality || "Integrative"}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200/60">
                                <Users className="w-3 h-3 text-gray-500" />
                                {formData.isCouples
                                  ? "Couples Counsellor"
                                  : "Couples & Individual Counsellor"}
                              </span>
                            </div>

                            <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3 pt-1">
                              {counsellor.bio}
                            </p>

                            {/* Areas of Support */}
                            <div className="pt-2">
                              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                                Areas of Support
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(
                                  counsellor.topics_with_experience || [
                                    "Trauma",
                                    "Domestic Violence",
                                    "Anxiety",
                                    "Abuse",
                                  ]
                                )
                                  .slice(0, 5)
                                  .map((topic, i) => (
                                    <span
                                      key={i}
                                      className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100/90 text-gray-700 border border-gray-200/50"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Availability summary */}
                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 pt-2 border-t border-gray-100">
                            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span>
                              {counsellor.availability_summary ||
                                clientAvailabilitySummary}
                            </span>
                          </div>
                        </div>

                        {/* Right: Score & Actions */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between gap-4 md:w-36 flex-shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(counsellor.uuid)}
                            className="self-start md:self-end p-2 rounded-full hover:bg-gray-100 text-gray-400 transition"
                            title={
                              isFav ? "Saved to favorites" : "Save counsellor"
                            }
                          >
                            <Heart
                              className={`w-5 h-5 transition ${
                                isFav
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-400 hover:text-red-400"
                              }`}
                            />
                          </button>

                          {/* Match Score Card */}
                          <div className="bg-[#f4f7f4] border border-[#d9e5db] rounded-2xl p-3.5 text-center w-32 shadow-xs">
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2d5a3f] mb-0.5">
                              <Star className="w-3 h-3 fill-[#2d5a3f]" />
                              <span>{counsellor.fit_label || "Best Fit"}</span>
                            </div>
                            <div className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight my-0.5">
                              {counsellor.match_score || 100}%
                            </div>
                            <div className="text-[11px] font-medium text-gray-500">
                              Overall Fit
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleProceedToBooking(counsellor)}
                              className="w-full bg-[#2d4a3e] hover:bg-[#20362c] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                            >
                              <span>View Profile</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCounsellor(counsellor);
                                handleProceedToBooking(counsellor);
                              }}
                              className={`w-full text-xs font-semibold py-1.5 px-3 rounded-lg transition text-center ${
                                isSelected
                                  ? "text-[#2d5a3f] bg-emerald-50 border border-emerald-200"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              {isSelected
                                ? "Selected ✓"
                                : "Choose Counsellor"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW MODE 2: DEDICATED INITIAL CONSULTATION BOOKING VIEW           */}
      {/* (Handles both Direct Counsellor Consultation & Vanquish Delegation)*/}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "booking" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode("directory")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#1b3b2b] transition py-1 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to filtered counsellors</span>
            </button>

            {/* Subtle toggle for testing both modes */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <span>Mode:</span>
              <span className="font-semibold text-[#2d5a3f]">
                {isDelegatedToVanquish
                  ? "Vanquish Delegation"
                  : `Direct with ${firstName}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Detailed Counsellor Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                {/* Photo */}
                <div className="p-4 pb-0">
                  <img
                    src={selectedCounsellorObj.photo_url}
                    alt={selectedCounsellorObj.name}
                    className="w-full h-64 sm:h-72 rounded-2xl object-cover shadow-sm bg-gray-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                </div>

                <div className="p-6 space-y-5">
                  {/* Name, Title, Experience */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
                        {selectedCounsellorObj.name}
                      </h2>
                      <div className="w-5 h-5 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mt-0.5">
                      {selectedCounsellorObj.qualification_title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedCounsellorObj.years_of_experience}
                    </p>
                  </div>

                  {/* Modality & Specialty Pills */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200/60">
                      <Sparkles className="w-3 h-3 text-gray-500" />
                      {selectedCounsellorObj.modality || "Integrative"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200/60">
                      <Users className="w-3 h-3 text-gray-500" />
                      {formData.isCouples
                        ? "Couples Counsellor"
                        : "Couples & Individual Counsellor"}
                    </span>
                  </div>

                  {/* Areas of Support */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                      Areas of Support
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        selectedCounsellorObj.topics_with_experience || [
                          "Trauma",
                          "Domestic Violence",
                          "Anxiety",
                          "Abuse",
                        ]
                      )
                        .slice(0, 5)
                        .map((topic, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100/90 text-gray-700 border border-gray-200/50"
                          >
                            {topic}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Bio quote */}
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-1">
                    {selectedCounsellorObj.bio}
                  </p>

                  {/* Quick Icon Details */}
                  <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs md:text-sm text-gray-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Session Type:</strong>{" "}
                        {selectedCounsellorObj.session_type ||
                          "Online (Video) or In-Person"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Availability:</strong>{" "}
                        {selectedCounsellorObj.availability_summary ||
                          clientAvailabilitySummary}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Works with:</strong> Individuals, Couples
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Globe className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Language:</strong>{" "}
                        {selectedCounsellorObj.languages || "English"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Insurance:</strong>{" "}
                        {selectedCounsellorObj.insurance || "Not accepted"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education & Credentials Card */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                  Education & Credentials
                </h3>
                <ul className="space-y-2.5 text-xs md:text-sm text-gray-600">
                  {(
                    selectedCounsellorObj.education_credentials || [
                      "Master of Counselling Psychology - Yorkville University",
                      "Registered Professional Counsellor (RPC) - CRPO",
                      "Trauma-Informed Therapy Certificate - The Trauma Centre",
                    ]
                  ).map((cred, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{cred}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setActiveProfileModal(selectedCounsellorObj)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition text-center"
                >
                  View Full Profile
                </button>
              </div>
            </div>

            {/* Right Column: Consultation Header, Notice, & Date/Time Selector */}
            <div className="lg:col-span-8 space-y-6">
              {/* ───────────────────────────────────────────────────────────── */}
              {/* STATE 1: COUNSELLOR DOES CONSULTATION ON THEIR OWN (Direct)  */}
              {/* ───────────────────────────────────────────────────────────── */}
              {!isDelegatedToVanquish ? (
                <>
                  {/* Top Card: Book a Consultation with {firstName} */}
                  <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#f4f7f4] text-[#2d5a3f] flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">
                          Book a Consultation with {firstName}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5 leading-relaxed">
                          A 15-minute consultation with {firstName} is the best
                          way to get to know each other and determine if she's
                          the right fit for your needs.
                        </p>
                      </div>
                    </div>

                    {/* 3 Badges Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                        <div className="w-4 h-4 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>15-minute call</span>
                      </div>

                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                        <div className="w-4 h-4 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>Get to know {firstName}</span>
                      </div>

                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                        <User className="w-4 h-4 text-[#2d5a3f] flex-shrink-0" />
                        <span>No obligation</span>
                      </div>
                    </div>
                  </div>

                  {/* Notice Card: Choose any of the available slots */}
                  <div className="bg-[#fffdf5] rounded-2xl border border-[#fef3c7] p-4 md:p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-gray-900">
                        Choose any of the available slots below to book your
                        consultation with {firstName}.
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        After the consultation, you can begin sessions with{" "}
                        {firstName}.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* ───────────────────────────────────────────────────────────── */
                /* STATE 2: VANQUISH THERAPIES DELEGATION (When TC unavailable)   */
                /* ───────────────────────────────────────────────────────────── */
                <>
                  {/* Warning Banner: TC unavailable for consultation in next few weeks */}
                  <div className="bg-[#fffdf5] rounded-3xl border border-[#fef3c7] p-5 md:p-6 shadow-xs flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-bold text-gray-900">
                        This counsellor does not have availability for a
                        consultation in the next few weeks.
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                        However, choose any of these slots to book a consultation
                        with Vanquish Therapies. After the consultation, you can
                        begin sessions with {firstName}.
                      </p>
                    </div>
                  </div>

                  {/* Feature Card: Book a Consultation */}
                  <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#f4f7f4] text-[#2d5a3f] flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">
                          Book a Consultation
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5 leading-relaxed">
                          A 15-minute consultation with a Vanquish Therapies
                          counsellor helps us understand your needs and ensure
                          the right fit.
                        </p>
                      </div>
                    </div>

                    {/* 3 Badges Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                        <div className="w-4 h-4 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>15-minute call</span>
                      </div>

                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                        <div className="w-4 h-4 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>Understand your needs</span>
                      </div>

                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                        <User className="w-4 h-4 text-[#2d5a3f] flex-shrink-0" />
                        <span>Find your best match</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 3. Date & Time Selection Box */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                {/* Header & Timezone Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    Select a Date & Time
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-600 self-start sm:self-auto">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>All times shown in</span>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="Europe/London">(UK / GMT)</option>
                      <option value="AEST">(AEST)</option>
                      <option value="EST">(EST)</option>
                      <option value="PST">(PST)</option>
                    </select>
                  </div>
                </div>

                {errors.consultationSlotId && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    {errors.consultationSlotId}
                  </div>
                )}

                {loadingCounsellorSlots || isSlotsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2d5a3f]" />
                    <p className="text-sm text-gray-500">
                      Loading available consultation slots...
                    </p>
                  </div>
                ) : activeSlots.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                    <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="text-base font-bold text-amber-900">
                      Direct Slots Being Arranged
                    </h4>
                    <p className="text-sm text-amber-800 max-w-md mx-auto">
                      Our clinical team will confirm your exact 15-minute
                      consultation slot within 24 hours of submission.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectSlot({
                          id: `direct-coord-${selectedCounsellorObj.uuid}`,
                          consultation_datetime: new Date(
                            Date.now() + 86400000 * 2
                          ).toISOString(),
                          timeString: "Direct Coordination",
                        })
                      }
                      className={`mt-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                        selectedSlotId
                          ? "bg-[#2d4a3e] text-white"
                          : "bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                      }`}
                    >
                      {selectedSlotId
                        ? "Consultation Request Attached ✓"
                        : `Request Flexible Slot with ${firstName}`}
                    </button>
                  </div>
                ) : (
                  /* Calendar & Slots Split View */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left: Mini Month Calendar */}
                    <div className="md:col-span-6 space-y-4">
                      <div className="border border-gray-200/90 rounded-2xl p-4 bg-white shadow-xs">
                        <div className="flex items-center justify-between mb-4">
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
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <h4 className="text-sm md:text-base font-bold text-gray-900">
                            {currentMonth.toLocaleString("default", {
                              month: "long",
                              year: "numeric",
                            })}
                          </h4>
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
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 mb-2">
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                          <div>Sun</div>
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

                            const groupedSlots = {};
                            activeSlots.forEach((slot) => {
                              const dtStr =
                                slot.consultation_datetime || slot.datetime;
                              if (!dtStr) return;
                              const slotDate = new Date(dtStr);
                              const dateStr = `${slotDate.getFullYear()}-${String(
                                slotDate.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                slotDate.getDate()
                              ).padStart(2, "0")}`;
                              if (!groupedSlots[dateStr])
                                groupedSlots[dateStr] = [];
                              groupedSlots[dateStr].push(slot);
                            });

                            // Auto-select first date with slots if none selected
                            const firstAvailableDate = Object.keys(
                              groupedSlots
                            )[0];
                            if (
                              !selectedCalendarDate &&
                              firstAvailableDate
                            ) {
                              setTimeout(() => {
                                setSelectedCalendarDate(firstAvailableDate);
                              }, 0);
                            }

                            const cells = [];
                            for (let i = 0; i < startingDay; i++) {
                              cells.push(
                                <div
                                  key={`empty-${i}`}
                                  className="p-1.5"
                                ></div>
                              );
                            }
                            for (let d = 1; d <= daysInMonth; d++) {
                              const dateStr = `${year}-${String(
                                month + 1
                              ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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
                                  className={`p-2 w-full aspect-square rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                    isSelected
                                      ? "bg-[#2d4a3e] text-white shadow-sm font-bold"
                                      : hasSlots
                                      ? "border border-gray-300 text-gray-800 hover:bg-emerald-50 hover:border-[#2d4a3e] cursor-pointer"
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

                        {/* Available dates legend */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2d5a3f]"></div>
                          <span>Available dates</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Slot Buttons for Selected Day */}
                    <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                      {selectedCalendarDate ? (
                        <div className="space-y-3">
                          <h4 className="text-sm md:text-base font-bold text-gray-900">
                            {new Date(selectedCalendarDate).toLocaleDateString(
                              "en-GB",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </h4>

                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {activeSlots
                              .filter((slot) => {
                                const dtStr =
                                  slot.consultation_datetime || slot.datetime;
                                if (!dtStr) return false;
                                const sd = new Date(dtStr);
                                const dateStr = `${sd.getFullYear()}-${String(
                                  sd.getMonth() + 1
                                ).padStart(2, "0")}-${String(
                                  sd.getDate()
                                ).padStart(2, "0")}`;
                                return dateStr === selectedCalendarDate;
                              })
                              .map((slot, index) => {
                                const dt = new Date(
                                  slot.consultation_datetime || slot.datetime
                                );
                                const endDt = new Date(
                                  dt.getTime() + 15 * 60 * 1000
                                );
                                const timeFormat = {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                };
                                const startStr = dt.toLocaleTimeString(
                                  "en-US",
                                  timeFormat
                                );
                                const endStr = endDt.toLocaleTimeString(
                                  "en-US",
                                  timeFormat
                                );
                                const slotLabel = `${startStr} – ${endStr}`;
                                const isSlotChosen =
                                  selectedSlotId === slot.id ||
                                  selectedDatetime ===
                                    (slot.consultation_datetime ||
                                      slot.datetime);

                                return (
                                  <button
                                    key={slot.id || index}
                                    type="button"
                                    onClick={() =>
                                      onSelectSlot({
                                        id: slot.id,
                                        consultation_datetime:
                                          slot.consultation_datetime ||
                                          slot.datetime,
                                        timeString: slotLabel,
                                      })
                                    }
                                    className={`w-full py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition text-center ${
                                      isSlotChosen
                                        ? "bg-[#2d4a3e] text-white border-[#2d4a3e] shadow-sm"
                                        : "bg-white border-gray-200 text-gray-800 hover:border-[#2d4a3e] hover:bg-emerald-50/40"
                                    }`}
                                  >
                                    {slotLabel}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/80 rounded-2xl border border-dashed border-gray-200">
                          <Calendar className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs md:text-sm font-medium text-gray-700">
                            Select a date on the calendar to view available
                            consultation times.
                          </p>
                        </div>
                      )}

                      {selectedDatetime && (
                        <div className="mt-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                              Confirmed Consultation Time
                            </span>
                            <span className="text-xs md:text-sm font-bold text-emerald-950">
                              {new Date(selectedDatetime).toLocaleString(
                                "en-GB",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Bottom Card: Changes depending on direct TC vs Vanquish */}
                {!isDelegatedToVanquish ? (
                  /* Direct Consultation with Counsellor Card */
                  <div className="bg-[#f7f9f7] rounded-2xl p-4 border border-[#e2ece4] flex items-start gap-3 mt-6">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#2d5a3f] border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-gray-900">
                        Consultation with {firstName}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        This consultation is with {firstName} directly via a
                        secure video call.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Vanquish Delegation Secure & Confidential Card */
                  <div className="bg-[#f7f9f7] rounded-2xl p-4 border border-[#e2ece4] flex items-start gap-3 mt-6">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#2d5a3f] border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-gray-900">
                        Secure & Confidential
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        Your information is safe with us. This consultation is
                        confidential and commitment-free.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. What happens after the consultation? Accordion */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setFaqExpanded(!faqExpanded)}
                    className="w-full flex items-center justify-between py-2 text-left text-xs md:text-sm font-bold text-gray-800 hover:text-[#1b3b2b] transition"
                  >
                    <span>What happens after the consultation?</span>
                    {faqExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {faqExpanded && (
                    <div className="mt-2 space-y-2 text-xs text-gray-600 bg-gray-50/80 rounded-2xl p-4 border border-gray-100 animate-in fade-in duration-200">
                      <p>
                        <strong>1. Consultation Discussion:</strong> During the
                        15-minute call, you and {firstName} will discuss your
                        therapeutic goals and ensure it's the right fit.
                      </p>
                      <p>
                        <strong>2. Direct Booking:</strong> Following the
                        consultation, you will be invited to schedule your
                        ongoing regular therapy sessions.
                      </p>
                      <p>
                        <strong>3. Ongoing Support:</strong> Our clinical care
                        team remains available at every step of your therapy
                        journey.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── PROFILE MODAL ───────────────── */}
      {activeProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 md:p-8 space-y-6 relative">
            <button
              type="button"
              onClick={() => setActiveProfileModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
              <img
                src={activeProfileModal.photo_url}
                alt={activeProfileModal.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover shadow-md bg-gray-100 border border-gray-100 flex-shrink-0"
              />
              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#2d5a3f] text-xs font-bold mb-1">
                  <Star className="w-3 h-3 fill-[#2d5a3f]" />
                  <span>
                    {activeProfileModal.match_score || 100}% Overall Match
                  </span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
                  {activeProfileModal.name}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  {activeProfileModal.qualification_title}
                </p>
                <p className="text-xs text-gray-500">
                  {activeProfileModal.years_of_experience}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                About & Clinical Approach
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-4">
                {activeProfileModal.bio}
              </p>
            </div>

            {/* Qualifications & Specialties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-[#2d5a3f]" />
                  <span>Modality</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {activeProfileModal.modality || "Integrative Counselling"}
                </p>
              </div>

              <div className="border border-gray-100 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-[#2d5a3f]" />
                  <span>Specialty</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formData.isCouples
                    ? "Couples & Relationship Counselling"
                    : "Individual & Couples Counselling"}
                </p>
              </div>
            </div>

            {/* Education & Credentials */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Education & Credentials
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600 bg-gray-50 rounded-2xl p-4">
                {(
                  activeProfileModal.education_credentials || [
                    "Master of Counselling Psychology - Yorkville University",
                    "Registered Professional Counsellor (RPC) - CRPO",
                    "Trauma-Informed Therapy Certificate - The Trauma Centre",
                  ]
                ).map((cred, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{cred}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onSelectCounsellor(activeProfileModal);
                  setActiveProfileModal(null);
                  setViewMode("booking");
                }}
                className="flex-1 bg-[#2d4a3e] hover:bg-[#20362c] text-white text-sm font-bold py-3 px-6 rounded-xl shadow-sm transition"
              >
                Select {activeProfileModal.name} & Book Consultation
              </button>
              <button
                type="button"
                onClick={() => setActiveProfileModal(null)}
                className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
