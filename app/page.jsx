"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  HeartHandshake,
  Brain,
  Compass,
  FileText,
  GraduationCap,
  Award,
  CalendarCheck,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  Copy,
  Check,
  Search,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  LogIn,
  ExternalLink,
  ChevronRight,
  X,
  Building2,
  HelpCircle,
  FileSignature
} from "lucide-react";

export default function VanquishServicesLanding() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { branding } = useBranding();
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopyLink = async (path, id, e) => {
    if (e) e.preventDefault();
    const fullUrl = `${origin || "https://vqtmanagement.com"}${path}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2200);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Master Services Catalog
  const services = useMemo(() => [
    {
      id: "low-cost-intake",
      title: "Low-Cost Counselling",
      category: "clients",
      badge: "Subsidized Support",
      badgeColor: "emerald",
      isPrimaryPublic: true,
      icon: HeartHandshake,
      headline: "Accessible, weekly 1-to-1 therapy with supervised trainee counsellors",
      description:
        "Structured for clients requiring affordable therapy. Delivered by advanced placement practitioners under strict clinical supervision in line with the BACP Ethical Framework.",
      directPath: "/low-cost-intake",
      meta: [
        { label: "Session Type", value: "Weekly 50-minute slots" },
        { label: "Practitioners", value: "Supervised Trainees" },
        { label: "Cost", value: "Subsidized Tier" }
      ],
      primaryAction: {
        label: "Complete Low-Cost Intake",
        path: "/low-cost-intake"
      },
      secondaryLinks: [
        { label: "Mid-Range Private Therapy", path: "/mid-range-intake", icon: Brain },
        { label: "Coaching Direction", path: "/coaching", icon: Compass }
      ],
      keywords: ["low-cost", "low cost", "subsidized", "trainee", "intake", "therapy", "counselling", "student"]
    },
    {
      id: "mid-range-intake",
      title: "Mid-Range Private Therapy",
      category: "clients",
      badge: "Qualified Therapists",
      badgeColor: "purple",
      isPrimaryPublic: true,
      icon: Brain,
      headline: "Dedicated psychological sessions with registered, experienced counsellors",
      description:
        "Comprehensive clinical care for depression, anxiety, trauma, and relationship support. Matched to an accredited therapist aligned with your availability and modality preferences.",
      directPath: "/mid-range-intake",
      meta: [
        { label: "Session Type", value: "Weekly continuity" },
        { label: "Practitioners", value: "Qualified & Registered" },
        { label: "Starting", value: "From £40/session" }
      ],
      primaryAction: {
        label: "Start Mid-Range Intake",
        path: "/mid-range-intake"
      },
      secondaryLinks: [
        { label: "Low-Cost Counselling", path: "/low-cost-intake", icon: HeartHandshake },
        { label: "Coaching Direction", path: "/coaching", icon: Compass }
      ],
      keywords: ["mid-range", "mid range", "private therapy", "registered", "qualified", "counsellor", "intake"]
    },
    {
      id: "therapy-form",
      title: "General Therapy Form",
      category: "clients",
      badge: "Clinical Gateway",
      badgeColor: "blue",
      isPrimaryPublic: true,
      icon: FileText,
      headline: "Direct clinical assessment questionnaire and triage intake",
      description:
        "A standardized clinical referral form designed for rapid review and appropriate pathway allocation across our clinical specialist teams.",
      directPath: "/therapy-form",
      meta: [
        { label: "Format", value: "Comprehensive Questionnaire" },
        { label: "Triage Time", value: "Within 24–48 Business Hours" },
        { label: "Data Security", value: "256-bit Encrypted" }
      ],
      primaryAction: {
        label: "Open Therapy Form",
        path: "/therapy-form"
      },
      secondaryLinks: [
        { label: "Alternative Low-Cost Intake", path: "/low-cost-intake", icon: HeartHandshake }
      ],
      keywords: ["therapy form", "jotform", "general intake", "questionnaire", "assessment", "referral"]
    },
    {
      id: "login",
      title: "Staff & Clinician Portal",
      category: "portals",
      badge: "Authorized Access",
      badgeColor: "slate",
      isPrimaryPublic: true,
      icon: ShieldCheck,
      headline: "Central operational management, clinical matching, and supervisor dashboard",
      description:
        "Authorized portal access for clinical managers, staff administrators, and placement supervisors to review intake queues, oversee client allocations, and manage caseloads.",
      directPath: "/login",
      meta: [
        { label: "Authentication", value: "Encrypted Credentials" },
        { label: "Capabilities", value: "Clinical Matching & Records" },
        { label: "Access Tier", value: "Staff & Management" }
      ],
      primaryAction: {
        label: user ? "Enter Admin Dashboard" : "Sign In to Staff Portal",
        path: user ? "/dashboard" : "/login"
      },
      secondaryLinks: user
        ? [{ label: "Caseload Matching", path: "/dashboard/pending-matches", icon: CheckCircle2 }]
        : [{ label: "Staff Sign In", path: "/login", icon: LogIn }],
      keywords: ["login", "admin", "dashboard", "staff", "management", "portal", "supervisor"]
    },
    {
      id: "coaching-intake",
      title: "Coaching & Professional Direction",
      category: "coaching",
      badge: "Performance & Growth",
      badgeColor: "amber",
      isPrimaryPublic: false,
      icon: Compass,
      headline: "Focused personal and professional coaching for milestone achievement",
      description:
        "Tailored sessions targeting career transitions, executive mindset, resilience, and personal clarity. Separate from clinical therapy, designed for direct strategic progress.",
      directPath: "/coaching",
      meta: [
        { label: "Focus", value: "Goal & Strategy Alignment" },
        { label: "Structure", value: "Block or Ongoing Engagements" },
        { label: "Format", value: "Online 1-to-1 Video" }
      ],
      primaryAction: {
        label: "Book Coaching Intake",
        path: "/coaching"
      },
      secondaryLinks: [
        { label: "Mid-Range Intake Option", path: "/mid-range-intake?service=coaching", icon: Brain },
        { label: "Low-Cost Counselling", path: "/low-cost-intake", icon: HeartHandshake }
      ],
      keywords: ["coaching", "executive coaching", "career", "personal growth", "direction", "mentoring"]
    }
  ], [user]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Category filter
      if (activeCategory !== "all" && service.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = service.title.toLowerCase().includes(query);
        const matchesHeadline = service.headline.toLowerCase().includes(query);
        const matchesDesc = service.description.toLowerCase().includes(query);
        const matchesPath = service.directPath.toLowerCase().includes(query);
        const matchesKeywords = service.keywords?.some((k) => k.toLowerCase().includes(query));
        return matchesTitle || matchesHeadline || matchesDesc || matchesPath || matchesKeywords;
      }
      return true;
    });
  }, [services, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans selection:bg-[#6f1d56]/20 selection:text-[#6f1d56] dark:selection:bg-[#6f1d56]/40 dark:selection:text-pink-300">
      
      {/* Top Ambient Glow Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#6f1d56]/12 dark:bg-[#6f1d56]/25 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[260px] bg-blue-500/8 dark:bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-[#0b0f17]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            {branding?.platform_logo_url ? (
              <img
                src={branding.platform_logo_url}
                alt={branding?.company_name || "Vanquish Therapies"}
                className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl text-white font-bold text-lg flex items-center justify-center shadow-md shadow-[#6f1d56]/20 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: "#6f1d56" }}
              >
                {branding?.company_name?.substring(0, 2).toUpperCase() || "VT"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-[#6f1d56] dark:group-hover:text-pink-400 transition-colors">
                {branding?.company_name || "Vanquish Therapies"}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                Clinical Services Portal
              </span>
            </div>
          </Link>

          {/* Center Navigation Badges */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#primary-services"
              className="px-3.5 py-2 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            >
              Services
            </a>
            <a
              href="#direct-directory"
              className="px-3.5 py-2 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            >
              Direct URLs
            </a>
            <Link
              href="/mid-range-intake"
              className="px-3.5 py-2 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            >
              Mid-Range
            </Link>
            <Link
              href="/low-cost-intake"
              className="px-3.5 py-2 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            >
              Low-Cost
            </Link>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6f1d56] hover:bg-[#5a1645] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6f1d56] hover:bg-[#591444] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Staff Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Hero Section with Professional Brand Background Drop */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#6f1d56]/[0.08] via-white/80 to-white dark:from-[#6f1d56]/25 dark:via-[#0c1018]/95 dark:to-[#0b0f17] border border-[#6f1d56]/15 dark:border-[#6f1d56]/30 shadow-xl shadow-[#6f1d56]/5 p-6 sm:p-10 mb-8 text-center">
          {/* Ambient Lighting & Pattern Overlay */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-[#6f1d56]/20 dark:bg-[#6f1d56]/35 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[180px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(#6f1d56_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] dark:opacity-[0.12] pointer-events-none" />

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-[#6f1d56]/25 dark:border-[#6f1d56]/40 text-[#6f1d56] dark:text-pink-300 text-xs font-semibold tracking-wide mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#6f1d56] dark:bg-pink-400 animate-pulse" />
            <span>Vanquish Therapies · Clinical Intake &amp; Services Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-3">
            Direct Access to Professional Therapy &amp; Clinical Portals
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-6 max-w-2xl mx-auto">
            Select your dedicated pathway below. Access confidential low-cost counselling, qualified private psychotherapy, 
            professional coaching, or staff gateways with verified direct links.
          </p>

          {/* Prominent Quick Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative flex items-center shadow-md shadow-[#6f1d56]/10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus-within:border-[#6f1d56] focus-within:ring-2 focus-within:ring-[#6f1d56]/20 transition-all">
              <Search className="w-4 h-4 text-[#6f1d56] dark:text-pink-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search: low-cost, mid-range, coaching, triage..."
                className="w-full px-3 py-3 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Quick Filter:</span>
              {[
                { label: "All", category: "all", query: "" },
                { label: "Low-Cost", category: "clients", query: "low-cost" },
                { label: "Mid-Range", category: "clients", query: "mid-range" },
                { label: "Coaching", category: "coaching", query: "coaching" },
                { label: "Therapy Form", category: "clients", query: "therapy" },
                { label: "Staff Sign In", category: "portals", query: "login" }
              ].map((chip) => {
                const isSelected =
                  (chip.query && searchQuery.toLowerCase() === chip.query) ||
                  (!chip.query && !searchQuery && activeCategory === chip.category);
                return (
                  <button
                    key={chip.label}
                    onClick={() => {
                      if (chip.query) {
                        setSearchQuery(searchQuery.toLowerCase() === chip.query ? "" : chip.query);
                        setActiveCategory("all");
                      } else {
                        setSearchQuery("");
                        setActiveCategory(chip.category);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      isSelected
                        ? "bg-[#6f1d56] text-white font-semibold shadow-xs"
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-[#6f1d56]/10 hover:text-[#6f1d56] dark:hover:text-pink-300 border border-slate-200/80 dark:border-slate-700/60"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Directory Section */}
        <section id="primary-services" className="pt-2 pb-12">
          {/* Controls Bar: Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All Gateways", count: services.length },
                { id: "clients", label: "Client Intakes", count: services.filter((s) => s.category === "clients").length },
                { id: "coaching", label: "Coaching", count: services.filter((s) => s.category === "coaching").length },
                { id: "portals", label: "Staff Portal", count: services.filter((s) => s.category === "portals").length },
              ].map((tab) => {
                const isActive = activeCategory === tab.id && !searchQuery;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setSearchQuery("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#6f1d56] text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>
                  Filtering for &ldquo;<span className="font-semibold text-[#6f1d56] dark:text-pink-300">{searchQuery}</span>&rdquo; ({filteredServices.length} found)
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-medium text-[#6f1d56] dark:text-pink-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Compact Streamlined Cards Grid */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No matching service found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for “low-cost”, “mid-range”, or clear your search.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => {
                const IconComponent = service.icon;
                const isCopied = copiedId === service.id;

                const colorMap = {
                  emerald: {
                    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
                    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
                    borderHighlight: "hover:border-emerald-500/40",
                  },
                  purple: {
                    badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
                    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
                    borderHighlight: "hover:border-purple-500/40",
                  },
                  blue: {
                    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
                    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
                    borderHighlight: "hover:border-blue-500/40",
                  },
                  amber: {
                    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
                    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
                    borderHighlight: "hover:border-amber-500/40",
                  },
                  slate: {
                    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
                    iconBg: "bg-slate-100 text-[#6f1d56] dark:bg-slate-800 dark:text-pink-400",
                    borderHighlight: "hover:border-[#6f1d56]/40",
                  }
                };

                const currentColors = colorMap[service.badgeColor] || colorMap.slate;

                return (
                  <div
                    key={service.id}
                    className={`bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group p-4 sm:p-4.5 ${currentColors.borderHighlight} hover:-translate-y-0.5`}
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${currentColors.iconBg}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${currentColors.badge}`}
                          >
                            {service.badge}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleCopyLink(service.directPath, service.id, e)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copy direct link"
                          aria-label={`Copy link for ${service.title}`}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Title & Short Desc */}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-1 group-hover:text-[#6f1d56] dark:group-hover:text-pink-400 transition-colors">
                        {service.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                        {service.headline}
                      </p>

                      {/* Compact Meta Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                        {service.meta.slice(0, 2).map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium"
                          >
                            {m.label}: <strong className="font-semibold text-slate-700 dark:text-slate-300">{m.value}</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#6f1d56] dark:text-pink-400 font-semibold truncate">
                        {service.directPath}
                      </span>

                      <Link
                        href={service.primaryAction.path}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6f1d56] hover:bg-[#5a1645] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-150 shrink-0"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Direct URLs Quick Reference Directory Section */}
        <section
          id="direct-directory"
          className="pt-10 pb-16 border-t border-slate-200/80 dark:border-slate-800/80"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Direct Canonical Service Routes
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Copy or visit direct links across all Vanquish public endpoints and internal clinical forms.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  Domain: {origin || "https://vqtmanagement.com"}
                </span>
              </div>
            </div>

            {/* Structured Route Cards */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
              {[
                {
                  label: "Mid-Range Intake",
                  path: "/mid-range-intake",
                  audience: "General Clients",
                  notes: "12-Step clinical matching intake for experienced therapists."
                },
                {
                  label: "Coaching & Direction",
                  path: "/coaching",
                  audience: "Coaching Clients",
                  notes: "Goal-oriented personal clarity and professional coaching intake."
                },
                {
                  label: "Low-Cost Counselling Intake",
                  path: "/low-cost-intake",
                  audience: "Subsidized Clients",
                  notes: "One-to-one therapy with supervised advanced trainee counsellors."
                },
                {
                  label: "Clinical Therapy Form",
                  path: "/therapy-form",
                  audience: "General Referrals",
                  notes: "Structured clinical intake and triage submission form."
                },
                {
                  label: "Staff & Management Login",
                  path: "/login",
                  audience: "Internal Staff & Admins",
                  notes: "Access clinical records, caseload allocations, and management dashboards."
                }
              ].map((route, idx) => {
                const isCopied = copiedId === `table-${route.path}`;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {route.label}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#6f1d56] dark:text-pink-400 font-semibold">
                          {route.path}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {route.audience}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {route.notes}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleCopyLink(route.path, `table-${route.path}`, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={route.path}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#6f1d56] hover:bg-[#591444] text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <span>Visit</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Clinical Governance & Trust Assurance */}
        <section className="py-12 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 px-6 sm:px-10 mb-12">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Clinical Quality &amp; Governance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Vanquish operates under strict clinical oversight ensuring confidentiality, ethical standards, and data security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                BACP Ethical Framework
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All sessions and supervised placement hours comply with UK professional counselling standards.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <Lock className="w-8 h-8 text-[#6f1d56] dark:text-pink-400 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Confidential &amp; Encrypted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All client intake records and agreements are encrypted in transit and at rest per GDPR guidelines.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Dedicated Clinical Supervision
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trainee counsellors receive regular senior supervisor reviews and clinical development oversight.
              </p>
            </div>
          </div>
        </section>

        {/* Immediate Crisis Assistance Notice */}
        <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                Immediate Crisis &amp; Emergency Support
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                Vanquish is not an emergency crisis response service. If you are experiencing acute distress or thoughts of self-harm:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              NHS: <strong>111</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              Samaritans: <strong>116 123</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              Emergency: <strong>999</strong>
            </span>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} {branding?.company_name || "Vanquish Therapies"}. All rights reserved. Registered in England &amp; Wales.
          </div>

          <div className="flex items-center gap-5">
            <Link href="/low-cost-intake" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Low-Cost Intake
            </Link>
            <Link href="/mid-range-intake" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Mid-Range Intake
            </Link>
            <Link href="/therapy-form" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Therapy Form
            </Link>
            <Link href="/login" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}