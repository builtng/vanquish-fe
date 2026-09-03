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

  // Primary 4 Public Links spotlighted
  const primaryLinks = useMemo(() => {
    return [
      {
        title: "Mid-Range Intake",
        path: "/mid-range-intake",
        tag: "Experienced Counsellors",
        description: "12-step guided clinical intake for tailored therapist matching.",
        icon: Brain,
        color: "text-purple-600 dark:text-purple-400",
        border: "hover:border-purple-500/50"
      },
      {
        title: "Low-Cost Intake",
        path: "/low-cost-intake",
        tag: "Subsidized Sessions",
        description: "Accessible therapy delivered by supervised trainee counsellors.",
        icon: HeartHandshake,
        color: "text-emerald-600 dark:text-emerald-400",
        border: "hover:border-emerald-500/50"
      },
      {
        title: "Therapy Form",
        path: "/therapy-form",
        tag: "Standard Triage",
        description: "Structured clinical assessment form for initial evaluation.",
        icon: FileText,
        color: "text-blue-600 dark:text-blue-400",
        border: "hover:border-blue-500/50"
      },
      {
        title: "Staff Login",
        path: user ? "/dashboard" : "/login",
        tag: user ? "Active Session" : "Staff & Admin",
        description: user ? "Access your operational clinic management dashboard." : "Secure login for clinical directors, staff, and supervisors.",
        icon: ShieldCheck,
        color: "text-[#6f1d56] dark:text-pink-400",
        border: "hover:border-[#6f1d56]/50"
      }
    ];
  }, [user]);

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
        
        {/* Hero Section */}
        <section className="text-center pt-6 pb-12 sm:pt-10 sm:pb-16 max-w-4xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            UK Supervised & Regulated Clinical Practice
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
            Direct Access to Professional Therapy &amp; Clinical Portals
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
            Choose your dedicated pathway below. Access confidential low-cost counselling, qualified private psychotherapy, 
            professional coaching, or administrative clinical gateways with verified direct links.
          </p>

          {/* Quick Direct Access Spotlight Bar (The 4 Core Links Requested by User) */}
          <div className="pt-2 pb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6f1d56] dark:text-pink-400" />
              <span>Core Public Service Gateways</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left">
              {primaryLinks.map((item) => {
                const IconComponent = item.icon;
                const isCopied = copiedId === `spotlight-${item.path}`;
                return (
                  <div
                    key={item.title}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm ${item.border} transition-all duration-200 flex flex-col justify-between group hover:shadow-md`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.tag}
                        </span>
                      </div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        {item.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <Link
                        href={item.path}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6f1d56] dark:text-pink-400 hover:text-[#52133e] dark:hover:text-pink-300 transition-colors"
                      >
                        <span>Open Direct Link</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                      
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(item.path, `spotlight-${item.path}`, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy direct URL"
                        aria-label={`Copy link for ${item.title}`}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Directory Section */}
        <section id="primary-services" className="pt-8 pb-16">
          
          {/* Controls Bar: Category Filter Pills + Instant Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All Services", count: services.length },
                { id: "clients", label: "Client Intakes", count: services.filter((s) => s.category === "clients").length },
                { id: "coaching", label: "Coaching", count: services.filter((s) => s.category === "coaching").length },
                { id: "portals", label: "Staff Portal", count: services.filter((s) => s.category === "portals").length },
              ].map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "bg-[#6f1d56] text-white shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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

            {/* Instant Search Bar */}
            <div className="relative min-w-[260px] sm:min-w-[300px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, URLs, or keywords..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6f1d56]/30 focus:border-[#6f1d56] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No matching service found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for “low-cost”, “intake”, “booking”, or clear your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const IconComponent = service.icon;
                const isCopied = copiedId === service.id;

                // Color accent map
                const colorMap = {
                  emerald: {
                    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
                    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
                    borderHighlight: "group-hover:border-emerald-500/40",
                  },
                  purple: {
                    badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
                    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
                    borderHighlight: "group-hover:border-purple-500/40",
                  },
                  blue: {
                    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
                    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
                    borderHighlight: "group-hover:border-blue-500/40",
                  },
                  amber: {
                    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
                    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
                    borderHighlight: "group-hover:border-amber-500/40",
                  },
                  rose: {
                    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
                    iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
                    borderHighlight: "group-hover:border-rose-500/40",
                  },
                  teal: {
                    badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
                    iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
                    borderHighlight: "group-hover:border-teal-500/40",
                  },
                  indigo: {
                    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
                    iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
                    borderHighlight: "group-hover:border-indigo-500/40",
                  },
                  slate: {
                    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
                    iconBg: "bg-slate-100 text-[#6f1d56] dark:bg-slate-800 dark:text-pink-400",
                    borderHighlight: "group-hover:border-[#6f1d56]/40",
                  }
                };

                const currentColors = colorMap[service.badgeColor] || colorMap.slate;

                return (
                  <div
                    key={service.id}
                    className={`bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${currentColors.borderHighlight} hover:-translate-y-1`}
                  >
                    {/* Top Subtle Gradient Border Highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6f1d56]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="p-6">
                      {/* Header Row: Icon + Badge + Copy Link */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className={`p-3 rounded-2xl ${currentColors.iconBg} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentColors.badge}`}
                          >
                            {service.badge}
                          </span>

                          <button
                            onClick={(e) => handleCopyLink(service.directPath, service.id, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Copy direct link"
                            aria-label={`Copy link for ${service.title}`}
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Title & Headline */}
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-[#6f1d56] dark:group-hover:text-pink-400 transition-colors">
                        {service.title}
                      </h3>

                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug mb-2.5">
                        {service.headline}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        {service.description}
                      </p>

                      {/* Key Meta Specifications */}
                      <div className="space-y-1.5 py-3 border-y border-slate-100 dark:border-slate-800/80 mb-5">
                        {service.meta.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">{m.label}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 pb-6 pt-0 bg-transparent flex flex-col gap-3">
                      
                      {/* Direct Canonical Path Pill */}
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-1.5 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            {service.directPath}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          {isCopied ? "Copied" : "Direct Link"}
                        </span>
                      </div>

                      {/* Primary Action Button */}
                      <Link
                        href={service.primaryAction.path}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6f1d56] hover:bg-[#5a1645] text-white text-xs font-bold tracking-wide shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <span>{service.primaryAction.label}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      {/* Secondary Quick Links */}
                      {service.secondaryLinks && service.secondaryLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {service.secondaryLinks.map((sec, sIdx) => {
                            const SecIcon = sec.icon || ArrowUpRight;
                            return (
                              <Link
                                key={sIdx}
                                href={sec.path}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-[#6f1d56] dark:hover:text-pink-400 transition-colors"
                              >
                                <SecIcon className="w-3 h-3" />
                                <span>{sec.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
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