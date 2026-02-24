"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import ConfirmationModal from "@/components/ConfirmationModal";
import SearchableSelect from "@/components/SearchableSelect";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { formatName, getCounsellorPrefixType } from "@/lib/nameFormatter";
import { formatTimeSlot, formatTimeSlotDisplay } from "@/lib/timeFormatter";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  ArrowUpDown,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Video,
  FileText,
  UserCheck,
  Activity,
  Menu,
  Home,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  User,
  Star,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Building2,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

const PendingMatchRow = ({
  client,
  setSelectedClient,
  setShowAssignModal,
  setSelectedTC,
  getUrgencyBadge,
  formatName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <React.Fragment>
      <tr
        className={`hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors cursor-pointer ${isExpanded ? "bg-gray-50 dark:bg-[var(--hover-bg)]" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--purple-bg)] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[var(--purple-primary)]" />
            </div>
            <div>
              <Link
                href={`/dashboard/client-details/${client.uuid || client.id}`}
                className="font-bold text-gray-900 dark:text-[var(--text-primary)] hover:text-[var(--purple-primary)] block line-clamp-1"
                onClick={(e) => e.stopPropagation()}
              >
                {client.name}, {client.age}
              </Link>
              <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] line-clamp-1">
                {client.email}
              </p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 text-xs font-medium rounded-full whitespace-nowrap">
            {client.serviceType}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
              {client.waitingText || `${client.daysWaiting} days`}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(client.urgency)} whitespace-nowrap`}
          >
            {client.urgency.toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClient(client);
                setShowAssignModal(true);
              }}
              className="px-3 py-1.5 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              Assign
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50/30 dark:bg-[var(--card-bg)]/20">
          <td
            colSpan="5"
            className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)]/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2">
                    Client Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      <Phone className="w-3.5 h-3.5 opacity-70" />{" "}
                      {client.phone || (
                        <span className="italic opacity-60">No phone</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      <MapPin className="w-3.5 h-3.5 opacity-70" />{" "}
                      {client.location || (
                        <span className="italic opacity-60">No location</span>
                      )}
                    </div>
                    {client.consultantName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <UserCheck className="w-3.5 h-3.5 opacity-70 text-[var(--purple-primary)]" />{" "}
                        <span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Consulted by:{" "}
                          </span>
                          <span className="font-medium text-[var(--purple-primary)]">
                            {formatName(client.consultantName, "tc")}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2">
                    Preferences & Issues
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-[var(--purple-bg)] text-[var(--purple-primary)] text-[10px] rounded-full font-medium border border-[var(--purple-border)]">
                      Prefers: {client.preferredModality}
                    </span>
                    {client.primaryIssues.map((issue) => (
                      <span
                        key={issue}
                        className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] rounded-full font-medium border border-red-100 dark:border-red-900/30"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2">
                    Availability
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] line-clamp-2">
                    {client.availability.join(", ")}
                  </p>
                </div>
              </div>

              {/* Suggested Practitioners */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    💡 Suggested Practitioners
                  </h4>
                  <span className="text-[10px] text-[var(--purple-primary)] font-medium">
                    Best matches for this client
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {client.suggestedTCs.map((tc) => (
                    <div
                      key={tc.id}
                      className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/dashboard/training-counsellors/details/${tc.uuid || tc.id}`}
                              className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm hover:text-[var(--purple-primary)] transition-colors truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {formatName(tc.name, "tc")}
                            </Link>
                            <span className="flex-shrink-0 px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] rounded-full font-bold border border-green-100 dark:border-green-900/30">
                              {tc.matchScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-[var(--text-tertiary)] truncate">
                            {tc.modality} • {tc.currentClients} clients
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setSelectedTC(tc);
                            setShowAssignModal(true);
                          }}
                          className="flex-shrink-0 px-3 py-1.5 bg-[var(--purple-bg)] text-[var(--purple-primary)] group-hover:bg-[var(--purple-primary)] group-hover:text-white rounded-lg text-[11px] font-bold transition-all"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                  {client.suggestedTCs.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-6 border border-dashed border-gray-200 dark:border-[var(--card-border)] rounded-xl opacity-60">
                      <RefreshCw className="w-5 h-5 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 italic text-center">
                        Calculating ideal matches... <br />
                        Or click Assign to browse all practitioners.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default function PendingMatchesPage() {
  const pathname = usePathname();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTC, setSelectedTC] = useState(null);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainingCounsellors, setTrainingCounsellors] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  // Fetch pending matches from API
  useEffect(() => {
    const fetchPendingMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (filterService !== "all") params.service_type = filterService;
        if (filterUrgency !== "all") params.urgency = filterUrgency;
        if (sortBy) params.sort_by = sortBy;

        const data = await apiService.getPendingMatches(params);

        // Transform API data to match component structure
        const transformedData = data.map((client) => ({
          id: client.uuid || client.id,
          uuid: client.uuid || client.id,
          client_id: client.client_id,
          name: client.name,
          age: client.age || null,
          email: client.email,
          phone: client.phone || null,
          serviceType: client.service_type || null,
          submittedDate: client.submitted_date || null,
          daysWaiting: client.days_waiting || 0,
          waitingText: client.waiting_days_text,
          waitingHours: client.waiting_hours || 0,
          urgency:
            client.urgency ||
            (client.status === "urgent"
              ? "high"
              : client.status === "stuck"
                ? "high"
                : "medium"),
          primaryIssues: client.primary_issues || [],
          preferredModality: client.preferred_modality || null,
          availability: client.availability
            ? Object.entries(client.availability).flatMap(([day, slots]) =>
                slots.map((slot) => `${day} ${formatTimeSlot(slot)}`),
              )
            : [],
          location: client.address
            ? `${client.address}${client.postcode ? ", " + client.postcode : ""}`
            : null,
          matchScore: null,
          suggestedTCs: [], // Will be populated separately
          consultantName: client.consultations?.[0]?.tc?.name || null,
          matchedTcName: client.matched_tc?.name || null,
        }));

        setPendingMatches(transformedData);
      } catch (err) {
        console.error("Error fetching pending matches:", err);
        const errorMessage =
          "Failed to load pending matches. Please try again.";
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingMatches();
  }, [searchTerm, filterService, filterUrgency, sortBy]);

  // Fetch training counsellors for suggestions
  useEffect(() => {
    const fetchTCs = async () => {
      try {
        const data = await apiService.getTrainingCounsellors();
        setTrainingCounsellors(data);

        // Update pending matches with suggested TCs
        setPendingMatches((prev) =>
          prev.map((client) => {
            // Enhanced matching logic - respect counsellor type for service type
            // Real matching algorithm
            const suggested = data
              .filter((tc) => {
                const isActive =
                  tc.status === "Active" &&
                  tc.current_clients < (tc.max_clients || 6);
                const matchesService =
                  (client.serviceType === "Low Cost" &&
                    tc.counsellor_type === "Trainee") ||
                  (client.serviceType === "Mid Range" &&
                    tc.counsellor_type === "Qualified");
                return isActive && matchesService;
              })
              .map((tc) => {
                let score = 0;

                // 1. Availability Overlap (50 points)
                if (client.availability && tc.availability) {
                  let commonSlots = 0;
                  let totalClientSlots = 0;
                  Object.keys(client.availability).forEach((day) => {
                    const slots = client.availability[day];
                    if (Array.isArray(slots)) {
                      totalClientSlots += slots.length;
                      if (tc.availability[day]) {
                        slots.forEach((slot) => {
                          if (tc.availability[day].includes(slot)) {
                            commonSlots++;
                          }
                        });
                      }
                    }
                  });
                  if (totalClientSlots > 0) {
                    score += (commonSlots / totalClientSlots) * 50;
                  }
                }

                // 2. Modality/Specialism Match (25 points)
                // Get recommended modality from latest consultation
                const latestConsultation = client.consultations?.[0];
                const recommendedModality =
                  latestConsultation?.recommended_modality;
                if (
                  recommendedModality &&
                  tc.modality === recommendedModality
                ) {
                  score += 25;
                } else if (!recommendedModality) {
                  score += 15; // Neutral if no recommendation
                }

                // 3. Issue Match (15 points)
                if (client.primaryIssues && tc.topics_with_experience) {
                  const clientIssues = Array.isArray(client.primaryIssues)
                    ? client.primaryIssues
                    : [];
                  const tcIssues = Array.isArray(tc.topics_with_experience)
                    ? tc.topics_with_experience
                    : [];

                  const commonIssues = clientIssues.filter((issue) =>
                    tcIssues.includes(issue),
                  ).length;
                  if (clientIssues.length > 0) {
                    score += (commonIssues / clientIssues.length) * 15;
                  }
                }

                // 4. Caseload Balance (10 points)
                const maxCaseload = tc.max_clients || 6;
                const currentCaseload = tc.current_clients || 0;
                const utilization = currentCaseload / maxCaseload;
                score += (1 - utilization) * 10;

                return {
                  id: tc.uuid || tc.id,
                  uuid: tc.uuid || tc.id,
                  name: tc.name,
                  modality: tc.modality || "N/A",
                  matchScore: Math.round(score),
                  currentClients: currentCaseload,
                  counsellorType: tc.counsellor_type,
                  availability: utilization < 0.8 ? "High" : "Low",
                };
              })
              .sort((a, b) => b.matchScore - a.matchScore)
              .slice(0, 3);

            return { ...client, suggestedTCs: suggested };
          }),
        );
      } catch (err) {
        console.error("Error fetching training counsellors:", err);
      }
    };

    if (pendingMatches.length > 0) {
      fetchTCs();
    }
  }, [pendingMatches.length]);

  // Mock Pending Match Clients (removed)

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/30";
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/30";
      case "low":
        return "bg-[var(--success-bg)] text-[var(--success-primary)] border border-[var(--success-border)]";
      default:
        return "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-600/20 dark:ring-gray-500/30";
    }
  };

  const getAvailabilityBadge = (availability) => {
    switch (availability) {
      case "High":
        return "bg-[var(--success-bg)] text-[var(--success-primary)] border border-[var(--success-border)]";
      case "Medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/30";
      case "Low":
        return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20 dark:ring-orange-500/30";
      default:
        return "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-600/20 dark:ring-gray-500/30";
    }
  };

  const filteredMatches = pendingMatches
    .filter((match) => {
      const matchesSearch =
        match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesService =
        filterService === "all" || match.serviceType === filterService;
      const matchesUrgency =
        filterUrgency === "all" || match.urgency === filterUrgency;
      return matchesSearch && matchesService && matchesUrgency;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return a.waitingHours - b.waitingHours;
      } else if (sortBy === "urgency") {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      } else if (sortBy === "daysWaiting") {
        return b.waitingHours - a.waitingHours;
      } else if (sortBy === "id") {
        return b.client_id?.localeCompare(a.client_id, undefined, {
          numeric: true,
        });
      } else if (sortBy === "name") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  const stats = {
    total: pendingMatches.length,
    highUrgency: pendingMatches.filter((m) => m.urgency === "high").length,
    waitingOver3Days: pendingMatches.filter((m) => m.daysWaiting >= 3).length,
    lowCost: pendingMatches.filter((m) => m.serviceType === "Low Cost").length,
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          actions={
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const params = {};
                  if (searchTerm) params.search = searchTerm;
                  if (filterService !== "all")
                    params.service_type = filterService;
                  if (filterUrgency !== "all") params.urgency = filterUrgency;
                  if (sortBy) params.sort_by = sortBy;

                  const data = await apiService.getPendingMatches(params);

                  const transformedData = data.map((client) => ({
                    id: client.uuid || client.id,
                    uuid: client.uuid || client.id,
                    client_id: client.client_id,
                    name: client.name,
                    age: client.age || null,
                    email: client.email,
                    phone: client.phone || null,
                    serviceType: client.service_type || null,
                    submittedDate: client.submitted_date || null,
                    daysWaiting: client.days_waiting || 0,
                    waitingText: client.waiting_days_text,
                    waitingHours: client.waiting_hours || 0,
                    urgency:
                      client.urgency ||
                      (client.status === "urgent"
                        ? "high"
                        : client.status === "stuck"
                          ? "high"
                          : "medium"),
                    primaryIssues: client.primary_issues || [],
                    preferredModality: client.preferred_modality || null,
                    availability: client.availability
                      ? Object.entries(client.availability).flatMap(
                          ([day, slots]) =>
                            slots.map(
                              (slot) => `${day} ${formatTimeSlot(slot)}`,
                            ),
                        )
                      : [],
                    location: client.address
                      ? `${client.address}${client.postcode ? ", " + client.postcode : ""}`
                      : null,
                    matchScore: null,
                    suggestedTCs: [],
                    consultantName: client.consultations?.[0]?.tc?.name || null,
                    matchedTcName: client.matched_tc?.name || null,
                  }));
                  setPendingMatches(transformedData);
                  success("Data refreshed successfully");
                } catch (err) {
                  console.error("Error refreshing:", err);
                  showError("Failed to refresh data");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          }
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
              Pending Matches
            </h1>
            <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
              Clients waiting to be matched with practitioners
            </p>
          </div>
        </DashboardHeader>

        {/* Stats Cards */}
        <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--purple-bg)] text-[var(--purple-primary)] flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                    Total Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                    High Urgency
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {stats.highUrgency}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                    Waiting 3+ Days
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {stats.waitingOver3Days}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                    Low Cost Service
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {stats.lowCost}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
              />
            </div>
            <div className="min-w-[120px] flex-shrink-0">
              <SearchableSelect
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                options={[
                  { value: "all", label: "All Services" },
                  { value: "Low Cost", label: "Low Cost" },
                  { value: "Mid Range", label: "Mid Range" },
                ]}
                placeholder="All Services"
                className="text-sm"
              />
            </div>
            <div className="min-w-[120px] flex-shrink-0">
              <SearchableSelect
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                options={[
                  { value: "all", label: "All Urgency" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
                placeholder="All Urgency"
                className="text-sm"
              />
            </div>
            <div className="min-w-[120px] flex-shrink-0">
              <SearchableSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: "newest", label: "Sort: Newest" },
                  { value: "id", label: "Sort: Client ID" },
                  { value: "urgency", label: "Sort: Urgency" },
                  { value: "daysWaiting", label: "Sort: Days Waiting" },
                  { value: "name", label: "Sort: Name" },
                ]}
                placeholder="Sort: Urgency"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-auto bg-white dark:bg-[var(--background)] shadow-sm rounded-xl border border-gray-200 dark:border-[var(--card-border)] m-6">
          {loading && pendingMatches.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading pending matches...</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-gray-50 dark:bg-[var(--card-bg)] sticky top-0 z-10">
                <tr>
                  <th className="w-1/3 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                    Client
                  </th>
                  <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                    Service Type
                  </th>
                  <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                    Waiting Days
                  </th>
                  <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                    Urgency
                  </th>
                  <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[var(--card-border)]">
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-lg font-medium">
                        No pending matches found
                      </p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((client) => (
                    <PendingMatchRow
                      key={client.id}
                      client={client}
                      setSelectedClient={setSelectedClient}
                      setShowAssignModal={setShowAssignModal}
                      setSelectedTC={setSelectedTC}
                      getUrgencyBadge={getUrgencyBadge}
                      formatName={formatName}
                    />
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedClient && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowAssignModal(false);
              setSelectedClient(null);
              setSelectedTC(null);
            }}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Assign{" "}
                  {selectedClient.serviceType === "Mid Range"
                    ? "Qualified"
                    : "Trainee"}{" "}
                  Counsellor
                </h2>

                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedClient(null);
                    setSelectedTC(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="p-6">
                <div className="p-4 bg-[var(--purple-bg)] rounded-lg border border-[var(--purple-border)] mb-4">
                  <p className="font-semibold text-[var(--purple-primary)] mb-1">
                    {formatName(selectedClient.name, "client")}
                  </p>
                  <p className="text-sm text-[var(--purple-primary)]">
                    {selectedClient.age} years old •{" "}
                    {selectedClient.serviceType}
                  </p>
                  <p className="text-xs text-[var(--purple-primary)] mt-1">
                    Primary Issues: {selectedClient.primaryIssues.join(", ")}
                  </p>
                </div>

                {selectedTC ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                    <p className="font-semibold text-green-900 dark:text-green-200 mb-1">
                      {formatName(selectedTC.name, "tc")}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {selectedTC.modality} • Match Score:{" "}
                      {selectedTC.matchScore}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Current Clients: {selectedTC.currentClients} •
                      Availability: {selectedTC.availability}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select{" "}
                      {selectedClient.serviceType === "Mid Range"
                        ? "Qualified"
                        : "Trainee"}{" "}
                      Counsellor
                    </label>

                    <SearchableSelect
                      value={selectedTC?.id || ""}
                      onChange={(e) => {
                        const tcId = e.target.value;
                        if (tcId) {
                          // Find the TC from suggestedTCs or trainingCounsellors
                          const tc =
                            selectedClient.suggestedTCs.find(
                              (t) => t.id === tcId || t.uuid === tcId,
                            ) ||
                            trainingCounsellors.find(
                              (t) => t.id === tcId || t.uuid === tcId,
                            );
                          if (tc) {
                            setSelectedTC({
                              id: tc.uuid || tc.id,
                              uuid: tc.uuid || tc.id,
                              name: tc.name,
                              modality: tc.modality || "N/A",
                              matchScore: tc.matchScore || null,
                              currentClients: tc.current_clients || 0,
                              availability: tc.availability || "N/A",
                            });
                          }
                        } else {
                          setSelectedTC(null);
                        }
                      }}
                      options={(selectedClient.suggestedTCs.length > 0
                        ? selectedClient.suggestedTCs
                        : trainingCounsellors.filter(
                            (tc) =>
                              tc.status === "Active" &&
                              tc.current_clients < (tc.max_clients || 6) &&
                              ((selectedClient.serviceType === "Low Cost" &&
                                tc.counsellor_type === "Trainee") ||
                                (selectedClient.serviceType === "Mid Range" &&
                                  tc.counsellor_type === "Qualified")),
                          )
                      ).map((tc) => ({
                        value: tc.uuid || tc.id,
                        label: `${tc.name} (${tc.modality})${tc.matchScore ? ` - ${tc.matchScore}% match` : ""}`,
                      }))}
                      placeholder="Choose a TC..."
                    />
                  </div>
                )}

                {/* Allocated Day/Time section removed - clients now select their own session slots */}

                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">ℹ️ Session Booking: </span>
                    The client will receive an email with a link to choose their
                    own session slot from the counsellor's available times.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Notes (Optional)
                  </label>
                  <textarea
                    id="assignmentNotes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Add any notes about this assignment..."
                  />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    defaultChecked
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="sendNotification"
                    className="text-sm text-gray-700"
                  >
                    Send notifications and agreement link to client and TC
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedTC(null);
                    }}
                    disabled={assignLoading}
                    className="px-6 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedTC) {
                        showError(
                          "Please select a Trainee Counsellor before assigning.",
                        );
                        return;
                      }
                      try {
                        setAssignLoading(true);

                        const assignmentNotes =
                          document.getElementById("assignmentNotes")?.value ||
                          "";

                        await apiService.assignMatch({
                          client_id: selectedClient.uuid || selectedClient.id,
                          tc_id: selectedTC.uuid || selectedTC.id,
                          match_score: selectedTC.matchScore || null,
                          assignment_notes: assignmentNotes,
                          send_notification:
                            document.getElementById("sendNotification")
                              ?.checked ?? true,
                        });
                        success(
                          `Client "${selectedClient.name}" assigned to "${selectedTC.name}" successfully!`,
                        );
                        setShowAssignModal(false);
                        setSelectedClient(null);
                        setSelectedTC(null);
                        // Refresh data
                        const params = {};
                        if (searchTerm) params.search = searchTerm;
                        if (filterService !== "all")
                          params.service_type = filterService;
                        if (filterUrgency !== "all")
                          params.urgency = filterUrgency;
                        if (sortBy) params.sort_by = sortBy;
                        const data = await apiService.getPendingMatches(params);
                        const transformedData = data.map((client) => ({
                          id: client.uuid || client.id,
                          uuid: client.uuid || client.id,
                          client_id: client.client_id,
                          name: client.name,
                          age: client.age || null,
                          email: client.email,
                          phone: client.phone || null,
                          serviceType: client.service_type || null,
                          submittedDate: client.submitted_date || null,
                          daysWaiting: client.days_waiting || 0,
                          waitingText: client.waiting_days_text,
                          waitingHours: client.waiting_hours || 0,
                          urgency:
                            client.urgency ||
                            (client.status === "urgent"
                              ? "high"
                              : client.status === "stuck"
                                ? "high"
                                : "medium"),
                          primaryIssues: client.primary_issues || [],
                          preferredModality: client.preferred_modality || null,
                          availability: client.availability
                            ? Object.entries(client.availability).flatMap(
                                ([day, slots]) =>
                                  slots.map((slot) => {
                                    const slotMap = {
                                      "morning-early": "10-11am",
                                      "morning-late": "11am-1pm",
                                      "afternoon-early": "1-4pm",
                                      "afternoon-late": "4-5pm",
                                      evening: "5-7pm",
                                    };
                                    const formattedSlot =
                                      slotMap[slot] ||
                                      (typeof slot === "string"
                                        ? slot.replace("-", " ")
                                        : slot);
                                    return `${day} ${formattedSlot}`;
                                  }),
                              )
                            : [],
                          location: client.address
                            ? `${client.address}${client.postcode ? ", " + client.postcode : ""}`
                            : null,
                          matchScore: null,
                          suggestedTCs: [],
                          consultantName:
                            client.consultations?.[0]?.tc?.name || null,
                          matchedTcName: client.matched_tc?.name || null,
                        }));
                        setPendingMatches(transformedData);
                      } catch (err) {
                        console.error("Error assigning match:", err);
                        showError(
                          err.message ||
                            "Failed to assign client. Please try again.",
                        );
                      } finally {
                        setAssignLoading(false);
                      }
                    }}
                    disabled={assignLoading || !selectedTC}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: "#6f1d56" }}
                  >
                    {assignLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Client"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
