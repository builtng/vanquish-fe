"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import apiService from "@/lib/api";
import { formatName, getCounsellorPrefixType } from "@/lib/nameFormatter";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";

import {
  Users,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Eye,
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
  ChevronRight,
  MapPin,
  User,
  Download,
  Send,
  Archive,
  Plus,
  ChevronLeft,
  CreditCard,
  Package,
  AlertCircle,
  Check,
  XCircle,
  Save,
  ChevronUp,
  List,
  CalendarDays,
  RefreshCw,
  Ban,
  Award,
  BookOpen,
  Briefcase,
  Building2,
} from "lucide-react";

export default function ViewAllTrainingCounsellorsPage() {
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  const [filterService, setFilterService] = useState("all");

  const [filterModality, setFilterModality] = useState("all");

  const [filterAvailability, setFilterAvailability] = useState("all");

  const [sortBy, setSortBy] = useState("tc_id");

  // Data states
  const [trainingCounsellors, setTrainingCounsellors] = useState([]);
  const [pendingClients, setPendingClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Modal states
  const [selectedTC, setSelectedTC] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [topicsModalData, setTopicsModalData] = useState(null);

  // Match client form
  const [matchForm, setMatchForm] = useState({
    clientId: "",
    notes: "",
    sendNotification: true,
  });

  // Bulk Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkInviting, setIsBulkInviting] = useState(false);

  // Fetch training counsellors from API
  const fetchTrainingCounsellors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterModality !== "all") params.modality = filterModality;

      const data = await apiService.getTrainingCounsellors(params);

      // Transform API data to match frontend structure
      const transformedData = data.map((tc) => ({
        id: tc.uuid || tc.id, // Use UUID for routing, fallback to id for backward compatibility
        uuid: tc.uuid || tc.id,
        tc_id: tc.tc_id,
        name: tc.name,
        email: tc.email,
        phone: tc.phone,
        modality: tc.modality,
        status: tc.status,
        counsellor_type: tc.counsellor_type || "Trainee",
        currentClients: tc.current_clients || 0,
        currentClientsList: tc.clients
          ? tc.clients.map((c) => ({
              name: c.name,
              age: c.age || null,
              id: c.uuid || c.id, // Use UUID for routing
            }))
          : [],
        availability: tc.availability || {},
        topicsWithExperience: tc.topics_with_experience || [],
        topicsNotReadyFor: tc.topics_not_ready_for || [],
        course: tc.course,
        institution: tc.institution,
        joinedDate: tc.joined_date,
        lastActivity: tc.last_activity ? new Date(tc.last_activity) : null,
        qualified_form_completed: tc.qualified_form_completed || false,
        createdAt: tc.created_at || null,
      }));

      setTrainingCounsellors(transformedData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error fetching practitioners:", err);
      setError("Failed to load practitioners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPortalInvite = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to send portal invitations to ${selectedIds.length} practitioners?`)) {
        return;
    }

    try {
      setIsBulkInviting(true);
      const response = await apiService.bulkPortalInvite(selectedIds);
      
      if (response.success) {
        toast.success(response.message || `Successfully sent ${response.invited_count} invitations`);
        setSelectedIds([]);
        fetchTrainingCounsellors();
      } else {
        toast.warning(response.message || "Some invitations may have failed");
      }
    } catch (err) {
      console.error("Bulk invite error:", err);
      toast.error(err.message || "Failed to send bulk invitations");
    } finally {
      setIsBulkInviting(false);
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTCs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTCs.map(tc => tc.id));
    }
  };

  // Fetch pending clients for matchment dropdown
  const fetchPendingClients = async () => {
    try {
      const data = await apiService.getPendingMatches();
      // Transform API data for dropdown
      const transformedData = data.map((client) => ({
        id: client.uuid || client.id,
        name: client.name,
        age: client.age || null,
        issues: client.primary_issues || [],
      }));
      setPendingClients(transformedData);
    } catch (err) {
      console.error("Error fetching pending clients:", err);
      // Don't set error state here as it's not critical for the main page
    }
  };

  // Initial fetch and refresh on filter changes
  useEffect(() => {
    fetchTrainingCounsellors();
    fetchPendingClients();
  }, [searchTerm, filterStatus, filterService, filterModality]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrainingCounsellors();
      fetchPendingClients();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [searchTerm, filterStatus, filterService, filterModality]);

  // Filter and sort TCs
  // Filter and sort TCs
  const getFilteredTCs = () => {
    let filtered = trainingCounsellors;

    // Search

    if (searchTerm) {
      filtered = filtered.filter(
        (tc) =>
          tc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tc.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter

    if (filterStatus !== "all") {
      filtered = filtered.filter((tc) => tc.status === filterStatus);
    }

    // Service filter
    if (filterService !== "all") {
      filtered = filtered.filter((tc) => {
        if (filterService === "Qualified Counsellor") {
          return tc.counsellor_type === "Qualified";
        } else if (filterService === "Coach") {
          return tc.counsellor_type === "Coach";
        } else if (filterService === "Trainee Counsellor") {
          return tc.counsellor_type === "Trainee";
        } else if (filterService === "Trainee Coach") {
          return tc.counsellor_type === "Trainee Coach";
        }
        return true;
      });
    }

    // Modality filter

    if (filterModality !== "all") {
      filtered = filtered.filter((tc) => tc.modality === filterModality);
    }

    // Availability filter

    if (filterAvailability === "has-capacity") {
      filtered = filtered.filter(
        (tc) => tc.status === "Active" && tc.currentClients < 6,
      );
    } else if (filterAvailability === "full") {
      filtered = filtered.filter((tc) => tc.status === "At Capacity");
    }

    // Sort

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);

        case "tc_id":
          return b.tc_id?.localeCompare(a.tc_id, undefined, { numeric: true });

        case "availability":
          if (a.status === "Active" && b.status !== "Active") return -1;
          if (a.status !== "Active" && b.status === "Active") return 1;
          return b.currentClients - a.currentClients;
        case "name":
          return b.name.localeCompare(a.name);

        case "clients":
          return b.currentClients - a.currentClients;

        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredTCs = getFilteredTCs();

  // Stats
  const totalTCs = trainingCounsellors.length;
  const availableNow = trainingCounsellors.filter(
    (tc) => tc.status === "Active" && tc.currentClients < 6,
  ).length;
  const atCapacity = trainingCounsellors.filter(
    (tc) => tc.status === "At Capacity",
  ).length;
  const onLeave = trainingCounsellors.filter(
    (tc) => tc.status === "On Leave",
  ).length;

  // Format last activity
  const formatLastActivity = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getStatusBadge = (status, clientCount) => {
    if (status === "Active") {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-medium rounded-full flex items-center gap-1 w-fit">
          <CheckCircle className="w-3 h-3" /> Active ({clientCount} clients)
        </span>
      );
    } else if (status === "At Capacity") {
      return (
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20 dark:ring-orange-500/30 text-xs font-medium rounded-full flex items-center gap-1 w-fit">
          <AlertTriangle className="w-3 h-3" /> At Capacity ({clientCount}{" "}
          clients)
        </span>
      );
    } else if (status === "On Leave") {
      return (
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/30 text-xs font-medium rounded-full flex items-center gap-1 w-fit">
          <Clock className="w-3 h-3" /> On Leave
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-slate-100 dark:bg-gray-800/50 text-slate-800 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/20 text-xs font-medium rounded-full">
        Inactive
      </span>
    );
  };

  const getInitialsColor = (name) => {
    const colors = [
      "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30",
      "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/30",
      "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30",
      "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/30",
      "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20 dark:ring-orange-500/30",
      "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-500/30",
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-500/30",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatAvailability = (availability) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const available = days.filter(
      (day) => {
        const slots = availability[day] || availability[day.toLowerCase()];
        return Array.isArray(slots) && slots.length > 0;
      }
    );

    if (available.length === 0) return "No availability set";

    if (available.length === 5) return "Mon-Fri";

    return available.map((d) => d.substring(0, 3)).join(", ");
  };

  const handleOpenTopics = (topics, type) => {
    setTopicsModalData({ topics, type });

    setShowTopicsModal(true);
  };

  const handleMatchClient = async (e) => {
    e.preventDefault();

    if (!matchForm.clientId || !selectedTC) {
      toast.error("Please select a client to match.");
      return;
    }

    try {
      const client = pendingClients.find((c) => c.id === matchForm.clientId);

      await apiService.matchMatch({
        client_id: matchForm.clientId,
        tc_id: selectedTC.uuid || selectedTC.id,
        matchment_notes: matchForm.notes || null,
        send_notification: matchForm.sendNotification,
      });

      toast.success(
        `Client "${formatName(client.name, "client")}" matched to "${formatName(selectedTC.name, getCounsellorPrefixType(selectedTC.counsellor_type))}"!\n\nClient will now move to "Agreement Pending" stage.`,
      );

      setShowMatchModal(false);
      setMatchForm({ clientId: "", notes: "", sendNotification: true });

      // Refresh data
      fetchTrainingCounsellors();
      fetchPendingClients();
    } catch (err) {
      console.error("Error matching client:", err);
      toast.error(
        `Failed to match client: ${err.message || "Please try again."}`,
      );
    }
  };

  return (
    <PageGuard menuId="tcs">
    <DashboardLayout>
      <div
        className="flex flex-col"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        {/* Header */}
        <DashboardHeader
          actions={
            <>
              <button
                onClick={fetchTrainingCounsellors}
                disabled={loading}
                className="px-4 py-2 border border-border text-foreground bg-card rounded-lg hover:bg-muted font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                href="/dashboard/training-counsellors"
                className="px-4 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New TC</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </>
          }
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Practitioners
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Managing practitioners and their caseloads
            </p>
          </div>
        </DashboardHeader>

        {/* Stats Cards */}
        <div className="bg-sidebar border-b border-sidebar-border px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total TCs
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalTCs}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Available Now
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {availableNow}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    At Capacity
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {atCapacity}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    On Leave
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {onLeave}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-sidebar border-b border-sidebar-border px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 overflow-x-hidden">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] min-w-[120px] flex-shrink-0"
            >
              <option value="all">All Status</option>

              <option value="Active">Active</option>

              <option value="At Capacity">At Capacity</option>

              <option value="On Leave">On Leave</option>

              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] min-w-[160px]"
            >
              <option value="all">All Services</option>

              <option value="Qualified Counsellor">Qualified Counsellor</option>

              <option value="Coach">Coach</option>

              <option value="Trainee Counsellor">Trainee Counsellor</option>

              <option value="Trainee Coach">Trainee Coach</option>
            </select>

            <select
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
              className="px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] min-w-[180px]"
            >
              <option value="all">All Modalities</option>

              <option value="CBT">CBT - Cognitive Behavioral Therapy</option>

              <option value="Person-Centred">Person-Centred</option>

              <option value="Integrative">Integrative</option>

              <option value="Psychodynamic">Psychodynamic</option>

              <option value="Humanistic">Humanistic</option>

              <option value="Gestalt">Gestalt</option>

              <option value="Solution-Focused">Solution-Focused</option>

              <option value="Transactional Analysis">
                Transactional Analysis
              </option>

              <option value="EMDR">EMDR</option>

              <option value="Mindfulness-Based">Mindfulness-Based</option>

              <option value="Narrative Therapy">Narrative Therapy</option>

              <option value="Systemic">Systemic</option>

              <option value="Existential">Existential</option>
            </select>

            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] min-w-[140px]"
            >
              <option value="all">All Availability</option>

              <option value="has-capacity">Has Capacity</option>

              <option value="full">Full</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] min-w-[150px]"
            >
              <option value="newest">Sort: Newest</option>

              <option value="tc_id">Sort: Practitioner ID</option>

              <option value="availability">Sort: Availability</option>

              <option value="name">Sort: Name</option>

              <option value="clients">Sort: Client Count</option>
            </select>
          </div>

          {filteredTCs.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-card/50 p-2 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredTCs.length && filteredTCs.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-input text-[var(--purple-primary)] focus:ring-[var(--purple-primary)]"
                />
                <span className="text-sm font-medium text-foreground">
                  {selectedIds.length} selected of {filteredTCs.length} practitioners
                </span>
              </div>
              
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkPortalInvite}
                  disabled={isBulkInviting}
                  className="px-4 py-1.5 bg-[var(--purple-primary)] hover:opacity-90 text-white rounded-md text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isBulkInviting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Bulk Portal Invite
                </button>
              )}
            </div>
          )}
        </div>

        {/* TC Cards Grid */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background"
          style={{ minHeight: 0 }}
        >
          {loading && trainingCounsellors.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 dark:text-[var(--text-tertiary)] animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Loading practitioners...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">
                    {error}
                  </p>
                  <button
                    onClick={fetchTrainingCounsellors}
                    className="text-sm text-red-700 dark:text-red-300 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {!loading && filteredTCs.length === 0 && !error && (
              <div className="col-span-2 text-center py-12">
                <Users className="w-16 h-16 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Practitioners Found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or add a new trainee counsellor
                </p>
              </div>
            )}

            {filteredTCs.map((tc) => (
              <div
                key={tc.id}
                 className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => {
                  setSelectedTC(tc);
                  setShowDetailPanel(true);
                }}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 right-4 z-10">
                   <input
                    type="checkbox"
                    checked={selectedIds.includes(tc.id)}
                    onChange={(e) => handleToggleSelect(tc.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-input text-[var(--purple-primary)] focus:ring-[var(--purple-primary)] cursor-pointer"
                  />
                </div>

                {/* Header */}

                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-16 h-16 rounded-full ${getInitialsColor(tc.name)} flex items-center justify-center text-xl font-bold flex-shrink-0`}
                  >
                    {tc.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/training-counsellors/details/${tc.uuid || tc.id}`}
                      className="text-lg font-bold text-foreground mb-1 hover:text-purple-600 dark:hover:text-purple-400 block"
                    >
                      {formatName(
                        tc.name,
                        getCounsellorPrefixType(tc.counsellor_type),
                      )}
                    </Link>
                    {tc.counsellor_type === "Qualified" && (
                      <span className="inline-block px-2 py-0.5 bg-[var(--purple-bg)] text-[var(--purple-primary)] border border-[var(--purple-border)] text-xs font-medium rounded-full mt-1">
                        Qualified
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground mb-2">
                      {tc.modality} Specialist
                    </p>

                    {getStatusBadge(tc.status, tc.currentClients)}

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Last active: {formatLastActivity(tc.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Available:</span>
                    <span>{formatAvailability(tc.availability)}</span>
                  </div>
                </div>

                {/* Topics With Experience */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    ✅ Experience with:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tc.topicsWithExperience.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 bg-[var(--tag-bg-green)] text-[var(--tag-text)] text-xs font-medium rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                    {tc.topicsWithExperience.length > 4 && (
                      <span className="px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-medium rounded-full shadow-sm">
                        +{tc.topicsWithExperience.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Topics NOT Ready For */}
                <div className="mb-4 pb-4 border-b border-border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTopics(tc.topicsNotReadyFor, "NOT Ready For");
                    }}
                    className="flex items-center gap-2 text-sm bg-[var(--warning-bg)] text-[var(--warning-primary)] hover:opacity-80 px-2 py-1 rounded transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-[var(--warning-primary)]" />
                    <span className="font-medium text-[var(--warning-primary)]">
                      ⚠️ {tc.topicsNotReadyFor.length} topics NOT ready for
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--warning-primary)]" />
                  </button>
                </div>

                {/* Current Clients */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    👥 Current Clients:
                  </p>
                  {tc.currentClients === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-[var(--text-tertiary)] italic">
                      No clients matched
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tc.currentClientsList.map((client) => (
                        <span
                          key={client.id}
                          className="px-2.5 py-1 bg-[var(--purple-bg)] text-[var(--purple-primary)] border border-[var(--purple-border)] text-xs font-medium rounded-full"
                        >
                          {formatName(client.name, "client")}, {client.age}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Link
                    href={`/dashboard/training-counsellors/details/${tc.uuid || tc.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex-1 px-4 py-2 border border-[var(--border-color)] text-[var(--button-secondary-text)] rounded-lg bg-[var(--button-secondary-bg)] hover:opacity-90 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </Link>

                  {tc.status === "Active" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setSelectedTC(tc);

                        setShowMatchModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      Match Client
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTCs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Trainee Counsellors Found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Topics Modal */}

      {showTopicsModal && topicsModalData && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowTopicsModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  Topics {topicsModalData.type}
                </h2>
                <button
                  onClick={() => setShowTopicsModal(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {topicsModalData.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setShowTopicsModal(false)}
                  className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium bg-card"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Match Client Modal */}

      {showMatchModal && selectedTC && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMatchModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Match Client
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Match a client to{" "}
                    {formatName(
                      selectedTC.name,
                      getCounsellorPrefixType(selectedTC.counsellor_type),
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleMatchClient} className="p-6 space-y-4">
                {/* TC Info */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full ${getInitialsColor(selectedTC.name)} flex items-center justify-center text-white text-lg font-bold`}
                    >
                      {selectedTC.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-200">
                        {formatName(
                          selectedTC.name,
                          getCounsellorPrefixType(selectedTC.counsellor_type),
                        )}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {selectedTC.modality} • {selectedTC.currentClients}{" "}
                        current clients
                      </p>
                    </div>
                  </div>
                </div>

                {/* Select Client */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Client from Pending Matches{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={matchForm.clientId}
                    onChange={(e) =>
                      setMatchForm({ ...matchForm, clientId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  >
                    <option value="">Select a client...</option>

                    {pendingClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {formatName(client.name, "client")} ({client.age}) -{" "}
                        {client.issues.join(", ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Matchment Notes (Optional)
                  </label>
                  <textarea
                    value={matchForm.notes}
                    onChange={(e) =>
                      setMatchForm({ ...matchForm, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Add any notes about this matchment..."
                  />
                </div>

                {/* Send Notification */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={matchForm.sendNotification}
                    onChange={(e) =>
                      setMatchForm({
                        ...matchForm,
                        sendNotification: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-600 border-input rounded"
                  />
                  <label
                    htmlFor="sendNotification"
                    className="text-sm text-foreground"
                  >
                    Send notification emails to client and TC
                  </label>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
                        After Matchment
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Client will move to "Agreement Pending" stage and
                        receive an agreement form to sign before starting
                        therapy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowMatchModal(false)}
                    className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium bg-card"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"
                    style={{ backgroundColor: "#6f1d56" }}
                  >
                    <UserCheck className="w-5 h-5" />
                    Match Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
    </PageGuard>
  );
}
