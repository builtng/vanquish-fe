"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import SearchableSelect from "@/components/SearchableSelect";
import { formatName } from "@/lib/nameFormatter";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
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
  ChevronRight,
  MapPin,
  User,
  Building2,
  RefreshCw,
  Star,
  Send,
  CalendarDays,
} from "lucide-react";

export default function ViewAllClients() {
  const pathname = usePathname();
  const { success, error: showError } = useToast();
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterTC, setFilterTC] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortColumn, setSortColumn] = useState("client_id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Data states
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStage !== "all") params.stage = filterStage;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterService !== "all") params.service_type = filterService;

      const response = await apiService.getClients(params);

      // Handle paginated response - extract data array
      const clientsData = Array.isArray(response)
        ? response
        : response && response.data
          ? response.data
          : [];

      // Ensure we have an array before mapping
      if (!Array.isArray(clientsData)) {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response format from server");
      }

      // Transform API data to match frontend structure
      const transformedData = clientsData.map((client) => ({
        id: client.uuid || client.id, // Use UUID for routing
        uuid: client.uuid || client.id,
        client_id: client.client_id,
        name: client.name || "Unknown",
        age: client.age || null,
        email: client.email || "",
        phone: client.phone || "",
        stage: client.stage || "Consultation Booked",
        matchedTC: client.matched_tc
          ? client.matched_tc.name || client.matched_tc.full_name
          : null,
        matchedTcId: client.matched_tc_id,
        serviceType: client.service_type || null,
        lastActivity: client.last_activity || "Never",
        status: client.status || "active",
        startDate: client.start_date || null,
        sessionsCompleted: client.sessions_completed || 0,
        primaryIssues: client.primary_issues || [],
        address: client.address || null,
        postcode: client.postcode || null,
        submittedDate: client.submitted_date || null,
        matchedDate: client.matched_date || null,
        consultationDate: client.consultation_date || null,
        satisfactionScore: client.satisfaction_score || null,
        feedbackCount: client.feedback_count || 0,
        lastFeedbackSentAt: client.last_feedback_sent_at || null,
        lastFeedbackDate: client.last_feedback_date || null,
        createdAt: client.created_at || null,
      }));

      setAllClients(transformedData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error fetching clients:", err);
      const errorMessage =
        err.message || "Failed to load clients. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refresh on filter changes
  useEffect(() => {
    fetchClients();
  }, [searchTerm, filterStage, filterStatus, filterService]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchClients();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [searchTerm, filterStage, filterStatus, filterService]);

  const getStatusColor = (status) => {
    switch (status) {
      case "urgent":
        return "bg-red-500";
      case "stuck":
        return "bg-yellow-500";
      case "active":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStageBadgeColor = (stage) => {
    switch (stage) {
      case "Consultation Booked":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      case "Consultation Completed":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      case "Matched With Counsellor":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "Agreement Sent":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200";
      case "Agreement Signed":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "Sessions Booked":
        return "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200";
      case "Active Therapy":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  // Get unique TCs for filter dropdown
  const uniqueTCs = [
    ...new Set(allClients.map((c) => c.matchedTC).filter(Boolean)),
  ];

  const filteredClients = allClients
    .filter((client) => {
      const matchesSearch =
        (client.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage =
        filterStage === "all" || client.stage === filterStage;
      const matchesTC = filterTC === "all" || client.matchedTC === filterTC;
      const matchesService =
        filterService === "all" || client.serviceType === filterService;
      const matchesStatus =
        filterStatus === "all" || client.status === filterStatus;

      return (
        matchesSearch &&
        matchesStage &&
        matchesTC &&
        matchesService &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle nulls
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Handle string comparison (names)
      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle Date/Number comparison
      return sortDirection === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
          ? 1
          : -1;
    });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const ClientDetailPanel = ({ client, onClose }) => (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white dark:bg-[var(--card-bg)] shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-[var(--card-bg)] border-b border-gray-200 dark:border-[var(--card-border)] p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            {formatName(client.name, "client")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
            {client.email}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Status & Stage */}
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}
          ></div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColor(client.stage)}`}
          >
            {client.stage}
          </span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
            <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">
              Age
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {client.age}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">
              Service Type
            </p>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
              {client.serviceType}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Contact Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{client.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{client.phone}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p>{client.address}</p>
                <p>{client.postcode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Issues */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Primary Issues
          </h3>
          <div className="flex flex-wrap gap-2">
            {client.primaryIssues.map((issue) => (
              <span
                key={issue}
                className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm rounded-full"
              >
                {issue}
              </span>
            ))}
          </div>
        </div>

        {/* Matched TC */}
        {client.matchedTC && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Counsellor
            </h3>
            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {formatName(client.matchedTC, "tc")}
                </p>
                <p className="text-sm text-gray-600">Counsellor</p>
              </div>
            </div>
          </div>
        )}

        {/* Satisfaction Score */}
        {(client.satisfactionScore !== null || client.feedbackCount > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-3">
              Client Satisfaction
            </h3>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {client.satisfactionScore
                      ? Number(client.satisfactionScore).toFixed(1)
                      : "N/A"}
                    {client.satisfactionScore && (
                      <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        /5.0
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600">
                    {client.feedbackCount} feedback
                    {client.feedbackCount !== 1 ? "s" : ""} received
                  </p>
                </div>
              </div>
              {client.lastFeedbackDate && (
                <p className="text-xs text-gray-600 mt-2">
                  Last feedback:{" "}
                  {new Date(client.lastFeedbackDate).toLocaleDateString(
                    "en-GB",
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Progress Info */}
        {client.sessionsCompleted && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sessions Completed</span>
                <span className="font-semibold text-gray-900">
                  {client.sessionsCompleted}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Start Date</span>
                <span className="font-semibold text-gray-900">
                  {client.startDate}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Activity</span>
                <span className="font-semibold text-gray-900">
                  {client.lastActivity}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date Registered</span>
                <span className="font-semibold text-gray-900">
                  {client.submittedDate
                    ? new Date(client.submittedDate).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Progress to Next Stage
          </button>
          <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Book Consultation
          </button>
          <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Send Email
          </button>
          {(client.stage === "Active Therapy" ||
            client.stage === "Completed") && (
            <button
              onClick={async () => {
                try {
                  await apiService.sendFeedbackForm(client.uuid || client.id);
                  success("Feedback form email sent successfully!");
                  fetchClients();
                } catch (err) {
                  showError(err.message || "Failed to send feedback form");
                }
              }}
              disabled={
                client.lastFeedbackSentAt &&
                new Date(client.lastFeedbackSentAt) >
                  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
              }
              className="w-full py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Send Feedback Form
            </button>
          )}
          <button className="w-full py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium">
            Archive Client
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PageGuard menuId="clients">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader
            actions={
              <>
                <button
                  onClick={fetchClients}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <Link
                  href="/dashboard/clients/edit"
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-opacity"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  <Users className="w-4 h-4" />
                  Add New Client
                </Link>
              </>
            }
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                All Clients
              </h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                {filteredClients.length} clients total
              </p>
            </div>
          </DashboardHeader>

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div className="min-w-[120px] flex-shrink-0">
                <SearchableSelect
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  options={[
                    { value: "all", label: "All Stages" },
                    {
                      value: "Consultation Booked",
                      label: "Consultation Booked",
                    },
                    {
                      value: "Consultation Completed",
                      label: "Consultation Completed",
                    },
                    {
                      value: "Matched With Counsellor",
                      label: "Matched with Counsellor",
                    },
                    { value: "Agreement Sent", label: "Agreement Sent" },
                    { value: "Agreement Signed", label: "Agreement Signed" },
                    { value: "Sessions Booked", label: "Sessions Booked" },
                    { value: "Active Therapy", label: "Active Therapy" },
                  ]}
                  placeholder="All Stages"
                  className="text-sm"
                />
              </div>
              <div className="min-w-[120px] flex-shrink-0">
                <SearchableSelect
                  value={filterTC}
                  onChange={(e) => setFilterTC(e.target.value)}
                  options={[
                    { value: "all", label: "All Counsellors" },
                    ...uniqueTCs.map((tc) => ({ value: tc, label: tc })),
                  ]}
                  placeholder="All Counsellors"
                  className="text-sm"
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "urgent", label: "Urgent" },
                    { value: "stuck", label: "Stuck" },
                    { value: "active", label: "Active" },
                  ]}
                  placeholder="All Status"
                  className="text-sm"
                />
              </div>
              <div className="min-w-[120px] flex-shrink-0">
                <SearchableSelect
                  value={sortColumn}
                  onChange={(e) => {
                    setSortColumn(e.target.value);
                    if (
                      e.target.value === "submittedDate" ||
                      e.target.value === "satisfactionScore" ||
                      e.target.value === "client_id"
                    ) {
                      setSortDirection("desc");
                    } else {
                      setSortDirection("asc");
                    }
                  }}
                  options={[
                    { value: "name", label: "Sort: Name" },
                    { value: "client_id", label: "Sort: Client ID" },
                    { value: "submittedDate", label: "Sort: Newest" },
                    { value: "satisfactionScore", label: "Sort: Satisfaction" },
                  ]}
                  placeholder="Sort By"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[var(--background)]">
            {loading && allClients.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 dark:text-[var(--text-tertiary)] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-[var(--text-secondary)]">
                    Loading clients...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">
                      {error}
                    </p>
                    <button
                      onClick={fetchClients}
                      className="text-sm text-red-700 dark:text-red-300 underline mt-1"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[var(--card-bg)] sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Counsellor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Date Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[var(--background)] divide-y divide-gray-200 dark:divide-[var(--card-border)]">
                  {paginatedClients.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <Users className="w-16 h-16 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-2">
                          No Clients Found
                        </h3>
                        <p className="text-gray-600 dark:text-[var(--text-secondary)]">
                          Try adjusting your filters or add a new client
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedClients.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <Link
                              href={`/dashboard/client-details/${client.uuid || client.id}`}
                              className="font-medium text-gray-900 dark:text-[var(--text-primary)] hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              {client.name}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                              {client.age} years old
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStageBadgeColor(client.stage)}`}
                          >
                            {client.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {client.matchedTC ? (
                            <span className="text-sm text-gray-900 dark:text-[var(--text-primary)]">
                              {formatName(client.matchedTC, "tc")}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-[var(--text-tertiary)] italic">
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-[var(--text-primary)]">
                            {client.serviceType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {client.satisfactionScore !== null ? (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                                {Number(client.satisfactionScore).toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">
                                ({client.feedbackCount})
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-[var(--text-tertiary)] italic">
                              No feedback
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                            {client.lastActivity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-[var(--text-primary)]">
                            {client.submittedDate
                              ? new Date(
                                  client.submittedDate,
                                ).toLocaleDateString("en-GB")
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/client-details/${client.uuid || client.id}`}
                              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-purple-600" />
                            </Link>
                            {/* <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="Send Email">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </button> */}
                            <Link
                              href={`/dashboard/clients/edit?id=${client.uuid || client.id}`}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Client"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </Link>
                            {(client.stage === "Active Therapy" ||
                              client.stage === "Completed") && (
                              <button
                                onClick={async () => {
                                  try {
                                    await apiService.sendFeedbackForm(
                                      client.uuid || client.id,
                                    );
                                    success(
                                      "Feedback form email sent successfully!",
                                    );
                                    fetchClients();
                                  } catch (err) {
                                    showError(
                                      err.message ||
                                        "Failed to send feedback form",
                                    );
                                  }
                                }}
                                disabled={
                                  client.lastFeedbackSentAt &&
                                  new Date(client.lastFeedbackSentAt) >
                                    new Date(
                                      Date.now() - 90 * 24 * 60 * 60 * 1000,
                                    )
                                }
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Send Feedback Form"
                              >
                                <Send className="w-4 h-4 text-green-600" />
                              </button>
                            )}
                            {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="bg-white dark:bg-[var(--sidebar-bg)] border-t border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 dark:text-[var(--text-secondary)]">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredClients.length)}{" "}
                  of {filteredClients.length} clients
                </span>
                <SearchableSelect
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 20, label: "20 per page" },
                    { value: 50, label: "50 per page" },
                    { value: 100, label: "100 per page" },
                  ]}
                  placeholder="20 per page"
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-[var(--text-secondary)]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {selectedClient && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSelectedClient(null)}
            ></div>
            <ClientDetailPanel
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
            />
          </>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}
