"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  Heart,
  User,
  Layers,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  Award,
  BookOpen,
  X,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  MapPin,
  Globe,
  ShieldCheck,
  Info,
  Shield,
  Video,
} from "lucide-react";
import apiService from "@/lib/api";

const FEMALE_PORTRAITS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
];


export const NO_MATCH_MESSAGE =
  "No counsellors match all your preferences right now. Please widen your availability or preferences, or contact help@vanquishtherapies.co.uk.";

export function resolveCounsellorPhoto(counsellor, index = 0) {
  if (
    counsellor?.photo_url &&
    typeof counsellor.photo_url === "string" &&
    counsellor.photo_url.trim() !== "" &&
    !counsellor.photo_url.includes("null")
  ) {
    return apiService.getStorageUrl(counsellor.photo_url);
  }
  if (
    counsellor?.photo &&
    typeof counsellor.photo === "string" &&
    counsellor.photo.trim() !== ""
  ) {
    return apiService.getStorageUrl(counsellor.photo);
  }
  if (counsellor?.photo_url && typeof counsellor.photo_url === "string") {
    return counsellor.photo_url;
  }
  return null;
}

function CounsellorAvatar({
  src,
  alt,
  className = "",
  iconClassName = "w-12 h-12",
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`${className} bg-[#f2f4f2] flex flex-col items-center justify-center text-gray-400 border border-gray-200/70 select-none`}
      >
        <div className="w-16 h-16 rounded-full bg-white/80 border border-gray-200/60 flex items-center justify-center shadow-2xs">
          <User className={`${iconClassName} text-gray-400 stroke-[1.5]`} />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Counsellor"}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default function FilteredCounsellors({
  formData = {},
  onSelectCounsellor = () => {},
  selectedCounsellorUuid,
  selectedSlotId,
  selectedDatetime,
  onSelectSlot = () => {},
  availableSlots = [],
  isSlotsLoading = false,
  errors = {},
}) {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("best_fit");
  const [favorites, setFavorites] = useState({});
  const [activeProfileModal, setActiveProfileModal] = useState(null);

  // View state: 'directory' (counsellor cards list) or 'booking' (focused consultation booking page)
  const [viewMode, setViewMode] = useState("directory");

  // Counsellor consultation slot state
  const [counsellorSlots, setCounsellorSlots] = useState([]);
  const [loadingCounsellorSlots, setLoadingCounsellorSlots] = useState(false);
  const [slotSource, setSlotSource] = useState("counsellor");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
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
      saturday: "Sat",
      sunday: "Sun",
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

  // Format client support areas text
  const clientSupportAreasText = useMemo(() => {
    if (
      !formData.supportAreas ||
      !Array.isArray(formData.supportAreas) ||
      formData.supportAreas.length === 0
    ) {
      return "Trauma, Domestic Violence, Anxiety, Abuse";
    }
    return formData.supportAreas.join(", ");
  }, [formData.supportAreas]);

  // Format client gender preference text
  const clientPreferenceSummary = useMemo(() => {
    if (
      !formData.genderPreference ||
      formData.genderPreference === "No preference"
    ) {
      return "No preference";
    }
    return formData.genderPreference.includes("Counsellor")
      ? formData.genderPreference
      : `${formData.genderPreference} Counsellor`;
  }, [formData.genderPreference]);

  // Specialty label shown in the filter criteria sidebar
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
          if (
            res &&
            Array.isArray(res.counsellors) &&
            res.counsellors.length > 0
          ) {
            const enhanced = res.counsellors.map((c, index) => {
              const photo = resolveCounsellorPhoto(c, index);
              return {
                ...c,
                first_name:
                  c.first_name ||
                  (c.name ? c.name.split(" ")[0] : "Counsellor"),
                photo_url: photo,
                bio: c.bio || "",
                topics_with_experience:
                  Array.isArray(c.topics_with_experience) && c.topics_with_experience.length > 0
                    ? c.topics_with_experience
                    : [],
                availability_summary: c.availability_summary || "",
                match_score: c.match_score || 0,
                fit_label: c.fit_label || "Matched",
                modality: c.modality || "Integrative Therapy",
                specialty: c.specialty || clientSpecialtyLabel,
                show_own_consultation_availability:
                  c.show_own_consultation_availability,
              };
            });
            setCounsellors(enhanced);
            // Do not auto-select counsellor on load
          } else {
            setCounsellors([]);
          }
        }
      } catch (err) {
        console.error("Failed to load filtered counsellors:", err);
        if (isMounted) {
          setCounsellors([]);
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
    if (!selectedCounsellorUuid) {
      setCounsellorSlots([]);
      setSelectedCalendarDate(null);
      return;
    }

    let isMounted = true;
    const currentUuid = selectedCounsellorUuid;
    setSelectedCalendarDate(null);

    const fetchCounsellorSlots = async () => {
      setLoadingCounsellorSlots(true);
      try {
        const res = await apiService.getCounsellorConsultationAvailability(
          currentUuid
        );
        if (isMounted && currentUuid === selectedCounsellorUuid && res) {
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
        if (isMounted && currentUuid === selectedCounsellorUuid) {
          setSlotSource("vanquish");
          setCounsellorSlots(availableSlots);
        }
      } finally {
        if (isMounted && currentUuid === selectedCounsellorUuid) {
          setLoadingCounsellorSlots(false);
        }
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
    if (!selectedCounsellorUuid) return null;
    return (
      counsellors.find((c) => c.uuid === selectedCounsellorUuid) || null
    );
  }, [counsellors, selectedCounsellorUuid]);

  // Effective slots to display in calendar
  const activeSlots = useMemo(() => {
    return counsellorSlots.length > 0 ? counsellorSlots : availableSlots;
  }, [counsellorSlots, availableSlots]);

  // Auto-align calendar date with active slots
  useEffect(() => {
    if (activeSlots.length > 0) {
      const firstSlot = activeSlots[0];
      const dtStr = firstSlot.consultation_datetime || firstSlot.datetime;
      if (dtStr) {
        const cleanDt = dtStr.replace(" ", "T");
        const sd = new Date(cleanDt);
        const y = sd.getFullYear();
        const m = sd.getMonth();
        const d = sd.getDate();
        const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        if (!selectedCalendarDate) {
          setSelectedCalendarDate(dateStr);
          setCurrentMonth(new Date(y, m, 1));
        }
      }
    }
  }, [activeSlots, selectedCalendarDate]);

  const isDelegatedToVanquish = useMemo(() => {
    if (selectedCounsellorObj?.show_own_consultation_availability === false) {
      return true;
    }
    if (selectedCounsellorObj?.show_own_consultation_availability === true) {
      return false;
    }
    return slotSource === "vanquish";
  }, [slotSource, selectedCounsellorObj]);

  const firstName =
    selectedCounsellorObj?.first_name ||
    selectedCounsellorObj?.name?.split(" ")[0] ||
    "Counsellor";

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return dateStr;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW MODE 1: FILTERED COUNSELLORS DIRECTORY VIEW                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "directory" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-semibold tracking-tight text-[#1b3b2b] leading-tight">
                Your Filtered Counsellors
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Based on your preferences, we've{" "}
                <span className="font-semibold text-emerald-800 uppercase tracking-wide">
                  FILTERED
                </span>{" "}
                these counsellors for you. Choose a counsellor to see consultation times.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 self-start md:self-auto">
              {/* Found Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-700 shadow-2xs">
                <Users className="w-4 h-4 text-gray-500" />
                <span>
                  {loading
                    ? "Searching..."
                    : `${sortedCounsellors.length} Counsellors Found`}
                </span>
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                <span>Sort by:</span>
                <div className="relative inline-flex items-center">
                  <select
                    id="counsellor-sort"
                    aria-label="Sort counsellors by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200/90 rounded-lg px-3 py-1.5 pr-7 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#2d5a3f] cursor-pointer"
                  >
                    <option value="best_fit">Best Fit</option>
                    <option value="score_desc">Highest Match</option>
                    <option value="experience_desc">Most Experience</option>
                    <option value="name_asc">Name (A-Z)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ────────────────── LEFT SIDEBAR ────────────────── */}
            <div className="lg:col-span-4 space-y-6">
              {/* Box 1: Your Filter Criteria */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      Your Filter Criteria
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Here's how we used your preferences to filter these counsellors.
                  </p>
                </div>

                {/* 5 Criteria Items with Progress Bars */}
                <div className="space-y-4 pt-1">
                  {/* 1. Availability Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-800">
                        Availability Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pl-5.5 font-medium">
                      {clientAvailabilitySummary}
                    </p>
                    <div className="flex items-center gap-3 pl-5.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#3d654c] rounded-full w-full" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">100%</span>
                    </div>
                  </div>

                  {/* 2. Areas of Support Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-800">
                        Areas of Support Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pl-5.5 font-medium">
                      {clientSupportAreasText}
                    </p>
                    <div className="flex items-center gap-3 pl-5.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#3d654c] rounded-full w-full" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">100%</span>
                    </div>
                  </div>

                  {/* 3. Modality Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-800">
                        Modality Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pl-5.5 font-medium">
                      Integrative Counsellor
                    </p>
                    <div className="flex items-center gap-3 pl-5.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#3d654c] rounded-full w-full" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">100%</span>
                    </div>
                  </div>

                  {/* 4. Specialty Match */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-800">
                        Specialty Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pl-5.5 font-medium">
                      {clientSpecialtyLabel}
                    </p>
                    <div className="flex items-center gap-3 pl-5.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#3d654c] rounded-full w-full" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">100%</span>
                    </div>
                  </div>

                  {/* 5. Counsellor Preference */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-800">
                        Counsellor Preference
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pl-5.5 font-medium">
                      {clientPreferenceSummary}
                    </p>
                    <div className="flex items-center gap-3 pl-5.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#3d654c] rounded-full w-full" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">100%</span>
                    </div>
                  </div>
                </div>

                {/* About These Results Callout */}
                <div className="bg-[#eef4ee] rounded-xl p-3.5 border border-[#d9e6dc] flex items-start gap-3 mt-4">
                  <div className="w-5 h-5 rounded-full bg-[#3d654c] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      About These Results
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      These counsellors meet or closely align with your selected
                      preferences and availability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 2: Your Selected Preferences */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Your Selected Preferences
                </h3>

                <div className="space-y-3.5">
                  {/* Areas of Support */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#3d654c]">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        Areas of Support
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {clientSupportAreasText}
                      </p>
                    </div>
                  </div>

                  {/* Modality */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#3d654c]">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        Modality
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Integrative Counsellor
                      </p>
                    </div>
                  </div>

                  {/* Specialty */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#3d654c]">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        Specialty
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {clientSpecialtyLabel}
                      </p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#3d654c]">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        Availability
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {clientAvailabilitySummary}
                      </p>
                    </div>
                  </div>

                  {/* Counsellor Preference */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#3d654c]">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        Counsellor Preference
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {clientPreferenceSummary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────── RIGHT MAIN AREA: COUNSELLOR CARDS ────────────────── */}
            <div className="lg:col-span-8 space-y-6">
              {loading ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-2xs flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-9 h-9 animate-spin text-[#2d5a3f]" />
                  <p className="text-gray-700 font-semibold text-base">
                    Matching and filtering counsellors...
                  </p>
                </div>
              ) : sortedCounsellors.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-2xs space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2d5a3f] flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    No Matching Counsellors
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    No counsellors match all your preferences right now. Please widen your availability or preferences, or contact{" "}
                    <a
                      href="mailto:help@vanquishtherapies.co.uk"
                      className="text-[#2d5a3f] font-semibold underline"
                    >
                      help@vanquishtherapies.co.uk
                    </a>
                    .
                  </p>
                </div>
              ) : (
                sortedCounsellors.map((counsellor, cIdx) => {
                  const isFav = !!favorites[counsellor.uuid];
                  const photoSrc =
                    counsellor.photo_url ||
                    resolveCounsellorPhoto(counsellor, cIdx);

                  return (
                    <div
                      key={counsellor.uuid || cIdx}
                      className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden"
                    >
                      {/* Top Right Heart Favorite Button */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(counsellor.uuid)}
                        className="absolute top-6 right-6 p-1 text-gray-400 hover:text-red-500 transition cursor-pointer z-10"
                        title="Save counsellor"
                      >
                        <Heart
                          className={`w-5 h-5 transition ${
                            isFav
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400 hover:text-red-400"
                          }`}
                        />
                      </button>

                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Left: Portrait Photo */}
                        <div className="flex-shrink-0 self-center md:self-start">
                          <CounsellorAvatar
                            src={photoSrc}
                            alt={counsellor.name}
                            className="w-44 md:w-48 h-56 md:h-64 rounded-2xl object-cover shadow-2xs bg-gray-100"
                            iconClassName="w-12 h-12"
                          />
                        </div>

                        {/* Middle & Right Content */}
                        <div className="flex-1 flex flex-col justify-between min-h-[256px] space-y-3 w-full pr-0 md:pr-2">
                          <div>
                            {/* Top Info & Score Box */}
                            <div className="flex items-start justify-between gap-4 pr-8">
                              <div>
                                <h2 className="font-serif text-2xl md:text-[26px] font-semibold text-gray-900 leading-tight">
                                  {counsellor.name}
                                </h2>
                              </div>

                              {/* Fit Score Badge Box */}
                              <div className="bg-[#f7f9f7] border border-gray-200/70 rounded-xl px-4 py-2.5 text-center min-w-[110px] shadow-2xs">
                                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-[#2d5a3f]">
                                  <Star className="w-3.5 h-3.5 fill-[#2d5a3f]" />
                                  <span>{counsellor.fit_label || "Best Fit"}</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-0.5">
                                  {counsellor.match_score || 100}%
                                </div>
                                <div className="text-[11px] text-gray-500 font-medium">
                                  Overall Fit
                                </div>
                              </div>
                            </div>

                            {/* Modality & Specialty Badges */}
                            <div className="flex flex-wrap gap-2 mt-2.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f2f6f3] text-gray-800 border border-[#dce7df]">
                                <span className="text-[#2d5a3f]">⬡</span>
                                {counsellor.modality || "Integrative Therapy"}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f2f6f3] text-gray-800 border border-[#dce7df]">
                                <Users className="w-3.5 h-3.5 text-[#2d5a3f]" />
                                {counsellor.specialty || clientSpecialtyLabel}
                              </span>
                            </div>

                            {/* Bio */}
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2.5">
                              {counsellor.bio}
                            </p>

                            {/* Areas of Support */}
                            <div className="mt-3">
                              <span className="text-xs font-semibold text-gray-900 block mb-1.5">
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
                                  .slice(0, 4)
                                  .map((topic, i) => (
                                    <span
                                      key={i}
                                      className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#f4f5f2] text-gray-700 border border-gray-200/60"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row: Availability + View Profile Button */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-medium">
                              <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                              <span>
                                {counsellor.availability_summary ||
                                  clientAvailabilitySummary}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                onSelectCounsellor(counsellor);
                                setViewMode("booking");
                              }}
                              className="py-2 px-6 rounded-lg bg-[#2d4a3e] hover:bg-[#223930] text-white text-xs sm:text-sm font-semibold shadow-xs transition text-center cursor-pointer shrink-0"
                            >
                              View Profile
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

      {viewMode === "booking" && (
        !selectedCounsellorObj ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2d5a3f] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-gray-700 font-semibold text-base">
              Choose a counsellor to see consultation times.
            </p>
            <button
              type="button"
              onClick={() => setViewMode("directory")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2d4a3e] hover:bg-[#223930] text-white text-sm font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Choose a Counsellor</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode("directory")}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#1b3b2b] transition py-1 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to filtered counsellors</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Detailed Counsellor Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                {/* Photo */}
                <div className="p-4 pb-0">
                  <CounsellorAvatar
                    src={
                      selectedCounsellorObj.photo_url ||
                      resolveCounsellorPhoto(selectedCounsellorObj, 0)
                    }
                    alt={selectedCounsellorObj.name}
                    className="w-full h-64 sm:h-72 rounded-2xl object-cover shadow-2xs bg-gray-100"
                    iconClassName="w-16 h-16"
                  />
                </div>

                <div className="p-6 space-y-4">
                  {/* Name, Verified Shield Badge, Title, Experience */}
                  <div>
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap truncate">
                        {selectedCounsellorObj.name}
                      </h2>
                      <span className="inline-flex items-center text-[#2d5a3f] shrink-0" title="Verified Counsellor">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                            fill="#2d5a3f"
                          />
                          <path
                            d="m9 12 2 2 4-4"
                            stroke="#ffffff"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Modality & Specialty Pills */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f2f6f3] text-gray-800 border border-[#dce7df]">
                      <span className="text-[#2d5a3f]">⬡</span>
                      {selectedCounsellorObj.modality || "Integrative Therapy"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f2f6f3] text-gray-800 border border-[#dce7df]">
                      <Users className="w-3.5 h-3.5 text-[#2d5a3f]" />
                      {selectedCounsellorObj.specialty || clientSpecialtyLabel}
                    </span>
                  </div>

                  {/* Areas of Support */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-gray-900 block">
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
                      ).map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#f4f5f2] text-gray-700 border border-gray-200/60"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                    {selectedCounsellorObj.bio}
                  </p>

                  {/* Quick Icon Details */}
                  <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-700">
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
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column: Consultation Booking Calendar */}
            <div className="lg:col-span-8 space-y-6">
              {/* Notice Banner */}
              <div className="bg-[#fffdf5] rounded-2xl border border-[#fef3c7] p-4 md:p-5 shadow-2xs flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-amber-500 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-serif font-bold text-sm">
                  i
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    This counsellor does not have availability for a consultation in the next few weeks.
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    However, choose any of these slots to book a consultation with Vanquish Therapies.
                    After the consultation, you can begin sessions with {firstName}.
                  </p>
                </div>
              </div>

              {/* Book a Consultation Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f4f7f4] text-[#2d5a3f] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-gray-900">
                      Book a Consultation
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 leading-relaxed">
                      A 15-minute consultation with a Vanquish Therapies counsellor
                      helps us understand your needs and ensure the right fit.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                    <Check className="w-4 h-4 text-gray-700 stroke-[2]" />
                    <span>15-minute call</span>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                    <Check className="w-4 h-4 text-gray-700 stroke-[2]" />
                    <span>Understand your needs</span>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800">
                    <User className="w-4 h-4 text-gray-700 stroke-[2]" />
                    <span>Find your best match</span>
                  </div>
                </div>
              </div>

              {/* Date & Time Selection Box */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    Select a Date & Time
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-600 self-start sm:self-auto font-medium">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>All times are UK time.</span>
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
                ) : (
                  /* Calendar & Slots Split View */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Left: Month Calendar */}
                    <div className="md:col-span-6 space-y-4">
                      <div className="border border-gray-200/80 rounded-2xl p-4 bg-white shadow-2xs">
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
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition cursor-pointer"
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
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition cursor-pointer"
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
                              const slotDate = new Date(dtStr.replace(" ", "T"));
                              const dateStr = `${slotDate.getFullYear()}-${String(
                                slotDate.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                slotDate.getDate()
                              ).padStart(2, "0")}`;
                              if (!groupedSlots[dateStr])
                                groupedSlots[dateStr] = [];
                              groupedSlots[dateStr].push(slot);
                            });

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
                                !!(groupedSlots[dateStr] &&
                                groupedSlots[dateStr].length > 0);
                              const isSelected = selectedCalendarDate === dateStr;

                              cells.push(
                                <button
                                  key={`day-${d}`}
                                  type="button"
                                  disabled={!hasSlots}
                                  onClick={() => {
                                    if (hasSlots) {
                                      setSelectedCalendarDate(dateStr);
                                    }
                                  }}
                                  className={`p-2 w-full aspect-square rounded-full flex items-center justify-center text-xs transition-all ${
                                    isSelected
                                      ? "bg-[#2d4a3e] text-white shadow-xs font-bold cursor-pointer"
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

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#3d654c]"></div>
                          <span>Available dates</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Slot Buttons for Selected Day */}
                    <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <h4 className="text-sm md:text-base font-bold text-gray-900">
                          {selectedCalendarDate
                            ? formatDisplayDate(selectedCalendarDate)
                            : "Choose a Date"}
                        </h4>

                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {(() => {
                            if (!selectedCalendarDate) {
                              return (
                                <p className="text-xs sm:text-sm text-gray-500 py-4">
                                  Please select an available date from the calendar.
                                </p>
                              );
                            }

                            const dateSlots = activeSlots.filter((slot) => {
                              const dtStr =
                                slot.consultation_datetime || slot.datetime;
                              if (!dtStr) return false;
                              const sd = new Date(dtStr.replace(" ", "T"));
                              const dateStr = `${sd.getFullYear()}-${String(
                                sd.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                sd.getDate()
                              ).padStart(2, "0")}`;
                              return dateStr === selectedCalendarDate;
                            });

                            if (dateSlots.length === 0) {
                              return (
                                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs sm:text-sm">
                                  No times available on this date. Please choose another date.
                                </div>
                              );
                            }

                            return dateSlots.map((slot, index) => {
                              const slotLabel =
                                slot.timeString ||
                                slot.time_slot ||
                                (slot.consultation_datetime || slot.datetime
                                  ? new Date(
                                      (slot.consultation_datetime || slot.datetime).replace(" ", "T")
                                    ).toLocaleTimeString("en-GB", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                  : "Available Slot");
                              const isSlotChosen = selectedSlotId === slot.id;

                              return (
                                <button
                                  key={slot.id || index}
                                  type="button"
                                  onClick={() =>
                                    onSelectSlot({
                                      id: slot.id,
                                      consultation_datetime:
                                        slot.consultation_datetime ||
                                        slot.datetime ||
                                        null,
                                      datetime:
                                        slot.datetime ||
                                        slot.consultation_datetime ||
                                        null,
                                      timeString: slotLabel,
                                      counsellorId:
                                        selectedCounsellorObj?.id ||
                                        slot.training_counsellor_id ||
                                        null,
                                      counsellorUuid:
                                        selectedCounsellorObj?.uuid || null,
                                      counsellorName:
                                        selectedCounsellorObj?.name || null,
                                    })
                                  }
                                  className={`w-full py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition text-center cursor-pointer ${
                                    isSlotChosen
                                      ? "bg-[#2d4a3e] text-white border-[#2d4a3e] shadow-xs"
                                      : "bg-white border-gray-200 text-gray-800 hover:border-[#2d4a3e] hover:bg-emerald-50/40"
                                  }`}
                                >
                                  {slotLabel}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {selectedDatetime && (
                        <div className="mt-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                              Confirmed Consultation Time
                            </span>
                            <span className="text-xs md:text-sm font-bold text-emerald-950">
                              {new Date(
                                selectedDatetime.replace(" ", "T")
                              ).toLocaleString("en-GB", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
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

                {/* Bottom Assurance Card */}
                <div className="bg-[#f7f9f7] rounded-xl p-4 border border-[#e2ece4] flex items-start gap-3 mt-6">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#2d5a3f] border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
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
              </div>
            </div>
            </div>
          )
        )
      )}

      {/* ───────────────── PROFILE MODAL ───────────────── */}
      {activeProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 md:p-8 space-y-6 relative">
            <button
              type="button"
              onClick={() => setActiveProfileModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
              <CounsellorAvatar
                src={
                  activeProfileModal.photo_url ||
                  resolveCounsellorPhoto(activeProfileModal, 0)
                }
                alt={activeProfileModal.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover shadow-md bg-gray-100 flex-shrink-0"
                iconClassName="w-10 h-10"
              />
              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f7f4] text-[#2d5a3f] text-xs font-bold mb-1 border border-[#d9e6dc]">
                  <Star className="w-3.5 h-3.5 fill-[#2d5a3f]" />
                  <span>
                    {activeProfileModal.match_score || 100}% Overall Fit (
                    {activeProfileModal.fit_label || "Best Fit"})
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start min-w-0 overflow-hidden">
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap truncate">
                    {activeProfileModal.name}
                  </h3>
                  <span className="inline-flex items-center text-[#2d5a3f] shrink-0" title="Verified Counsellor">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        fill="#2d5a3f"
                      />
                      <path
                        d="m9 12 2 2 4-4"
                        stroke="#ffffff"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                About & Clinical Approach
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-4">
                {activeProfileModal.bio}
              </p>
            </div>

            {/* Areas of Support */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Areas of Support
              </h4>
              <div className="flex flex-wrap gap-2">
                {(
                  activeProfileModal.topics_with_experience || [
                    "Trauma",
                    "Domestic Violence",
                    "Anxiety",
                    "Abuse",
                  ]
                ).map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualifications & Specialties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-[#2d5a3f]" />
                  <span>Modality</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {activeProfileModal.modality || "Integrative Therapy"}
                </p>
              </div>

              <div className="border border-gray-100 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-[#2d5a3f]" />
                  <span>Specialty</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {activeProfileModal.specialty || clientSpecialtyLabel}
                </p>
              </div>
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
                className="flex-1 bg-[#243f32] hover:bg-[#1a2f25] text-white text-sm font-bold py-3 px-6 rounded-xl shadow-xs transition cursor-pointer"
              >
                Select {activeProfileModal.name} & Book Consultation
              </button>
              <button
                type="button"
                onClick={() => setActiveProfileModal(null)}
                className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
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
