"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import ConfirmationModal from "@/components/ConfirmationModal";
import SearchableSelect from "@/components/SearchableSelect";
import { formatName, getCounsellorPrefixType } from "@/lib/nameFormatter";
import DashboardLayout from "@/components/DashboardLayout";
import { showToast } from "@/lib/toast";

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
  Download,
  Send,
  Archive,
  Plus,
  ChevronLeft,
  CreditCard,
  Package,
  Files,
  AlertCircle,
  Check,
  XCircle,
  Save,
  ChevronUp,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  FileCheck,
  Shield,
  Building2,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import RichTextEditor from "@/components/RichTextEditor";

export default function IndividualTCDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const uuid = params?.uuid;
  const { user } = useAuth();

  // Check if user is admin or staff (internal team)
  const isInternalTeam = user?.role === "admin" || user?.role === "staff";

  const [activeNotesTab, setActiveNotesTab] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tc, setTc] = useState(null);
  const [tcPhoto, setTcPhoto] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pendingClients, setPendingClients] = useState([]);
  const [assignForm, setAssignForm] = useState({
    clientId: "",
    notes: "",
    sendNotification: true,
  });

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: "Active",
    counsellorType: "Trainee",
    reason: "",
  });
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showSendEmailConfirmModal, setShowSendEmailConfirmModal] =
    useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    sendEmailNotification: true,
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showOpenFormConfirmModal, setShowOpenFormConfirmModal] =
    useState(false);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [addingNote, setAddingNote] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [sendingPortalInvite, setSendingPortalInvite] = useState(false);

  // Fetch TC data from API
  useEffect(() => {
    const fetchTcData = async () => {
      if (!uuid) return;

      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getTrainingCounsellorDetails(uuid);

        // Transform API data to match frontend structure
        const transformedData = {
          id: data.uuid || data.id, // Use UUID for routing
          uuid: data.uuid || data.id,
          db_id: data.id, // Database ID for activity logs
          tc_id: data.tc_id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          photo: data.photo || null,
          status: data.status,
          counsellor_type: data.counsellor_type || "Trainee",
          qualified_form_completed: data.qualified_form_completed || false,
          modality: data.modality || "",

          // Overview stats
          currentClients:
            data.current_clients || (data.clients ? data.clients.length : 0),
          totalSessionsCompleted: data.consultations
            ? data.consultations.filter((c) => c.status === "completed").length
            : 0,
          daysInSystem: data.joined_date
            ? Math.floor(
                (new Date() - new Date(data.joined_date)) /
                  (1000 * 60 * 60 * 24),
              )
            : 0,
          averageMatchScore: 85, // TODO: Calculate from matches

          // Personal Information
          age: data.age || null,
          gender: data.gender || null,
          ethnicity: data.ethnicity || null,
          pronouns: data.pronouns || null,

          // Professional Information
          course: data.course || "",
          institution: data.institution || "",
          yearOfStudy: data.year_of_study || null,
          expectedGraduation: data.expected_graduation || null,
          supervisor: data.supervisor || null,

          // Training Provider Information
          trainingOrgName: data.training_org_name || null,
          trainingOrgAddress: data.training_org_address || null,
          courseTitle: data.course_title || null,
          tutorName: data.tutor_name || null,
          tutorEmail: data.tutor_email || null,
          tutorPhone: data.tutor_phone || null,
          placementLeadName: data.placement_lead_name || null,
          placementLeadEmail: data.placement_lead_email || null,
          placementLeadPhone: data.placement_lead_phone || null,

          joinedDate: data.joined_date || null,
          lastActivity: data.last_activity || null,

          // Availability
          availability: data.availability || {},

          // Clinical Expertise
          topicsWithExperience: data.topics_with_experience || [],
          topicsNotReadyFor: data.topics_not_ready_for || [],

          // Current Clients
          currentClientsList: data.clients
            ? data.clients.map((client) => ({
                id: client.uuid || client.id, // Use UUID for routing
                uuid: client.uuid || client.id,
                name: client.name,
                age: client.age || null,
                startDate: client.matched_at || client.start_date || null,
                sessionsCompleted: client.sessions_completed || 0,
                primaryIssues: client.primary_issues || [],
                lastSession: client.last_session || null,
                nextSession: client.next_session || null,
              }))
            : [],

          // Documents - from API response (API formats these from intake form and qualified fields)
          documents: data.documents || [],

          // Admin Notes - from activity logs or empty array
          adminNotes: data.admin_notes || [],

          // Performance
          performance: {
            clientSatisfaction: data.client_satisfaction || 0,
            sessionAttendanceRate: data.session_attendance_rate || 0,
            dnaRate: data.dna_rate || 0,
            responseTime: data.response_time || "N/A",
          },
        };

        setTc(transformedData);
        setTcPhoto(data.photo_url || data.photo || null);
        // Initialize status form with current TC data
        setStatusForm({
          status: transformedData.status,
          counsellorType: transformedData.counsellor_type,
          reason: "",
        });
      } catch (err) {
        console.error("Error fetching TC details:", err);
        setError("Failed to load practitioner details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTcData();
  }, [uuid]);

  // Fetch pending clients for assignment dropdown
  useEffect(() => {
    const fetchPendingClients = async () => {
      try {
        const data = await apiService.getPendingMatches();
        const transformedData = data.map((client) => ({
          id: client.uuid || client.id,
          name: client.name,
          age: client.age || null,
          issues: client.primary_issues || [],
        }));
        setPendingClients(transformedData);
      } catch (err) {
        console.error("Error fetching pending clients:", err);
      }
    };
    fetchPendingClients();
  }, []);

  const timeSlots = [
    { value: "morning-early", label: "10-11am" },
    { value: "morning-late", label: "11am-1pm" },
    { value: "afternoon-early", label: "1-4pm" },
    { value: "afternoon-late", label: "4-5pm" },
    { value: "evening", label: "5-7pm" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-[var(--success-primary)]";
      case "At Capacity":
        return "bg-orange-500";
      case "On Leave":
        return "bg-blue-500";
      case "Away":
        return "bg-yellow-500";
      case "Inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Active:
        "bg-[var(--success-bg)] text-[var(--success-primary)] border border-[var(--success-border)]",
      "At Capacity": "bg-orange-100 text-orange-800",
      "On Leave": "bg-blue-100 text-blue-800",
      Away: "bg-yellow-100 text-yellow-800",
      Inactive: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

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

  const getDocumentStatusBadge = (status) => {
    if (status === "Verified") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Verified
        </span>
      );
    } else if (status === "Pending") {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Expired
      </span>
    );
  };

  const getInitialsColor = () => {
    return "bg-purple-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple-primary)] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading practitioner details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {error || "Practitioner not found"}
          </p>
          <Link
            href="/dashboard/training-counsellors"
            className="mt-4 text-[var(--purple-primary)] hover:text-[var(--purple-primary)]/80"
          >
            Back to Practitioners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageGuard menuId="tcs">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-card border-b border-border">
            {/* Breadcrumb */}
            <div className="px-6 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href="/dashboard/training-counsellors"
                  className="hover:text-[var(--purple-primary)]"
                >
                  All Practitioners
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">
                  {formatName(
                    tc.name,
                    getCounsellorPrefixType(tc.counsellor_type),
                  )}
                </span>
              </div>
            </div>

            {/* TC Header */}
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="shrink-0 pt-1">
                    <PhotoUpload
                      photoUrl={tcPhoto}
                      initials={tc.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                      entityId={tc.uuid || tc.id}
                      entityType="tc"
                      onUpload={async (id, file) => {
                        const response = await apiService.uploadTcPhoto(id, file);
                        setTcPhoto(response.photo_url || response.photo);
                        return response;
                      }}
                      onDelete={async (id) => {
                        await apiService.deleteTcPhoto(id);
                        setTcPhoto(null);
                      }}
                      size="medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-end gap-3 flex-wrap">
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatName(
                          tc.name,
                          getCounsellorPrefixType(tc.counsellor_type),
                        )}
                      </h1>
                      <div className="flex items-center gap-2 mb-1.5 pb-0.5">
                        <span className="text-muted-foreground font-medium px-2 py-0.5 bg-slate-100 rounded text-xs">
                          ID: {tc.tc_id || tc.id}
                        </span>
                        {tc.age && (
                          <span className="text-slate-500 font-bold text-xs uppercase tracking-tighter">
                            • {tc.age} YRS
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(tc.status)} animate-pulse`}></div>
                        <span className="text-sm font-bold text-slate-700 capitalize">
                          {tc.status}
                        </span>
                      </div>

                      <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                        tc.counsellor_type === "Qualified"
                          ? "bg-purple-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}>
                        {tc.counsellor_type || "Trainee"}
                      </div>

                      <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span>Last active: <span className="text-slate-500">{formatLastActivity(tc.lastActivity)}</span></span>
                      </div>
                    </div>

                    {/* Qualified Form Completion Banner */}
                    {tc.counsellor_type === "Qualified" &&
                      !tc.qualified_form_completed && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-900 mb-1">
                                  Qualified Counsellor Form Required
                                </p>
                                <p className="text-sm text-yellow-800">
                                  Send an email to the trainer to complete the
                                  Qualified Counsellor form. The email will
                                  include their UUID and a link to the form.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (!tc.email) {
                                  showToast.error(
                                    "This trainee counsellor does not have an email address.",
                                  );
                                  return;
                                }
                                setShowSendEmailConfirmModal(true);
                              }}
                              disabled={sendingEmail || !tc.email}
                              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {sendingEmail ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail className="w-4 h-4" />
                                  Send Email
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-end max-w-2xl">
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="h-10 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Change Status
                  </button>

                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="h-10 px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign Client
                  </button>
                  <button
                    onClick={() => setShowSendMessageModal(true)}
                    className="h-10 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Send Message
                  </button>
                  <button
                    onClick={async () => {
                      if (sendingPortalInvite) return;
                      try {
                        setSendingPortalInvite(true);
                        await apiService.sendTcPortalInvite(uuid);
                        showToast.success("Portal invitation sent successfully!");
                      } catch (err) {
                        showToast.error(err.message || "Failed to send portal invitation.");
                      } finally {
                        setSendingPortalInvite(false);
                      }
                    }}
                    disabled={sendingPortalInvite}
                    className="h-10 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {sendingPortalInvite ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                    ) : (
                      <Shield className="w-3.5 h-3.5" />
                    )}
                    Invite to Portal
                  </button>
                  <Link
                    href={`/dashboard/training-counsellors/edit?id=${uuid}`}
                    className="h-10 px-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[var(--purple-bg)] rounded-lg p-4 border border-[var(--purple-border)]">
                  <p className="text-sm text-[var(--purple-primary)] mb-1">
                    Current Clients
                  </p>
                  <p className="text-2xl font-bold text-[var(--purple-primary)]">
                    {tc.currentClients}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1">
                    Sessions Completed
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {tc.totalSessionsCompleted}
                  </p>
                </div>
                <div className="bg-[var(--success-bg)] rounded-lg p-4 border border-[var(--success-border)]">
                  <p className="text-sm text-[var(--success-primary)] mb-1">
                    Days in System
                  </p>
                  <p className="text-2xl font-bold text-[var(--success-primary)]">
                    {tc.daysInSystem}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-sm text-orange-600 mb-1">
                    Avg Match Score
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {tc.averageMatchScore}%
                  </p>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {tc.counsellor_type === "Qualified"
                    ? "Counsellor"
                    : "Trainee Counsellor"}{" "}
                  Journey
                </h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
                  <div
                    className="absolute top-6 left-0 h-0.5 bg-[var(--purple-primary)] transition-all duration-500"
                    style={{
                      width: `${(() => {
                        const journey = tc.journey || [];
                        if (journey.length === 0) return 0;
                        const completedCount = journey.filter(
                          (j) => j.completed,
                        ).length;
                        const currentIndex = journey.findIndex(
                          (j) => j.current,
                        );
                        const progress =
                          currentIndex !== -1
                            ? currentIndex + 1
                            : completedCount;
                        return (progress / journey.length) * 100;
                      })()}%`,
                    }}
                  ></div>

                  {/* Timeline Stages */}
                  <div className="relative flex justify-between">
                    {(() => {
                      // Initialize journey if not present
                      let journey = tc.journey || [];
                      if (journey.length === 0) {
                        const stages =
                          tc.counsellor_type === "Qualified"
                            ? [
                                "Application",
                                "Interview",
                                "Accepted",
                                "Induction Confirmed",
                                "Active",
                              ]
                            : [
                                "Application",
                                "Interview",
                                "Accepted",
                                "Induction Confirmed",
                                "First Client",
                                "Active",
                              ];

                        const currentStatus = tc.status || "Active";
                        const currentStageIndex = stages.findIndex(
                          (s) =>
                            (currentStatus === "Active" && s === "Active") ||
                            (currentStatus === "At Capacity" &&
                              s === "Active") ||
                            (currentStatus === "On Leave" && s === "Active") ||
                            (currentStatus === "Inactive" &&
                              s === "Application"),
                        );

                        journey = stages.map((stage, index) => ({
                          stage,
                          date: null,
                          completed:
                            currentStageIndex !== -1 &&
                            index < currentStageIndex,
                          current:
                            index === currentStageIndex ||
                            (currentStageIndex === -1 &&
                              index === stages.length - 1),
                        }));
                      }

                      return journey.map((stage, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center"
                          style={{ flex: 1 }}
                        >
                          {/* Circle */}
                          <div
                            className={`w-12 h-12 rounded-full border-4 flex items-center justify-center relative z-10 ${
                              stage.completed
                                ? "bg-[var(--purple-primary)] border-[var(--purple-primary)]"
                                : stage.current
                                  ? "bg-white border-[var(--purple-primary)]"
                                  : "bg-white border-gray-300"
                            }`}
                          >
                            {stage.completed ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : stage.current ? (
                              <Clock className="w-6 h-6 text-[var(--purple-primary)]" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            )}
                          </div>

                          {/* Label */}
                          <div className="mt-3 text-center">
                            <p
                              className={`text-xs font-medium ${
                                stage.completed || stage.current
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }`}
                            >
                              {stage.stage}
                            </p>
                            {stage.date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {stage.date}
                              </p>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="col-span-2 space-y-6">
                  {/* Personal Information */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        Personal Information
                      </h2>
                      <Link
                        href={`/dashboard/training-counsellors/details/${uuid}`}
                        className="text-[var(--purple-primary)] hover:text-[var(--purple-primary)]/80 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Full Name
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {tc.name}
                        </p>
                      </div>
                      {tc.age && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Age
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {tc.age} years old
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Email
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {tc.email}
                        </p>
                      </div>
                      {tc.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Phone
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {tc.phone}
                          </p>
                        </div>
                      )}
                      {tc.gender && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Gender
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {tc.gender}
                          </p>
                        </div>
                      )}
                      {tc.pronouns && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Pronouns
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {tc.pronouns}
                          </p>
                        </div>
                      )}
                      {tc.ethnicity && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Ethnicity
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {tc.ethnicity}
                          </p>
                        </div>
                      )}
                      {tc.joinedDate && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Joined Date
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(tc.joinedDate).toLocaleDateString(
                              "en-GB",
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Information */}
                  {(tc.course || tc.institution || tc.modality) && (
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">
                        Professional Information
                      </h2>
                      <div className="space-y-4">
                        {tc.modality && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Modality
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {tc.modality}
                            </p>
                          </div>
                        )}
                        {tc.course && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Course
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {tc.course}
                            </p>
                          </div>
                        )}
                        {(tc.institution || tc.expectedGraduation) && (
                          <div className="grid grid-cols-2 gap-4">
                            {tc.institution && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Institution
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {tc.institution}
                                </p>
                              </div>
                            )}
                            {tc.expectedGraduation && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Expected Graduation
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {tc.expectedGraduation}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {(tc.supervisor || tc.tutorName) && (
                          <div className="grid grid-cols-2 gap-4">
                            {tc.supervisor && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Supervisor
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {tc.supervisor}
                                </p>
                              </div>
                            )}
                            {tc.tutorName && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Tutor / Programme Lead
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {tc.tutorName}
                                </p>
                                {tc.tutorEmail && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {tc.tutorEmail}
                                  </p>
                                )}
                                {tc.tutorPhone && (
                                  <p className="text-xs text-muted-foreground">
                                    {tc.tutorPhone}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {tc.placementLeadName && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Placement Lead
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {tc.placementLeadName}
                            </p>
                            {tc.placementLeadEmail && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {tc.placementLeadEmail}
                              </p>
                            )}
                            {tc.placementLeadPhone && (
                              <p className="text-xs text-muted-foreground">
                                {tc.placementLeadPhone}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability Schedule */}
                  {tc.availability &&
                    Object.keys(tc.availability).length > 0 && (
                      <div className="bg-card rounded-lg border border-border p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                          Availability Schedule
                        </h2>
                        <div className="space-y-3">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                          ].map((day) => {
                            const daySlots = tc.availability[day] || tc.availability[day.toLowerCase()] || [];
                            const hasSlots = Array.isArray(daySlots) && daySlots.length > 0;
                            return (
                              <div
                                key={day}
                                className={`flex items-center gap-4 p-3 rounded-lg border ${
                                  hasSlots
                                    ? "bg-[var(--tag-bg-green)] border-green-200 dark:border-green-800"
                                    : "bg-muted border-border"
                                }`}
                              >
                                <div className="w-28">
                                  <p
                                    className={`text-sm font-medium ${hasSlots ? "text-green-900 dark:text-green-200" : "text-muted-foreground"}`}
                                  >
                                    {day}
                                  </p>
                                </div>
                                <div className="flex-1">
                                  {hasSlots ? (
                                    <div className="flex flex-wrap gap-2">
                                      {daySlots.map((slot, idx) => {
                                        const slotLabel =
                                          timeSlots.find(
                                            (ts) => ts.value === slot,
                                          )?.label || slot;
                                        return (
                                          <span
                                            key={idx}
                                            className="px-3 py-1 bg-[var(--tag-bg-green)] text-[var(--tag-text)] text-sm rounded-full"
                                          >
                                            {typeof slotLabel === 'object' ? JSON.stringify(slotLabel) : String(slotLabel)}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground italic">
                                      Not available
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Clinical Expertise */}
                  {((tc.topicsWithExperience &&
                    tc.topicsWithExperience.length > 0) ||
                    (tc.topicsNotReadyFor &&
                      tc.topicsNotReadyFor.length > 0)) && (
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">
                        Clinical Expertise
                      </h2>
                      <div className="space-y-4">
                        {tc.topicsWithExperience &&
                          tc.topicsWithExperience.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">
                                ✅ Topics with Experience
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {tc.topicsWithExperience.map((topic, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-[var(--tag-bg-green)] text-[var(--tag-text)] text-sm rounded-full"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        {tc.topicsNotReadyFor &&
                          tc.topicsNotReadyFor.length > 0 && (
                            <div className="pt-4 border-t border-border">
                              <p className="text-sm font-medium text-foreground mb-2">
                                ⚠️ Topics NOT Ready For
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {tc.topicsNotReadyFor.map((topic, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-[var(--warning-bg)] text-[var(--warning-primary)] text-sm rounded-full font-medium"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                These topics will show as warnings when matching
                                clients, but won't prevent assignment
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Current Clients */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        Current Clients ({tc.currentClients || 0})
                      </h2>
                    </div>
                    {tc.currentClientsList &&
                    tc.currentClientsList.length > 0 ? (
                      <div className="space-y-3">
                        {tc.currentClientsList.map((client) => (
                          <div
                            key={client.id}
                            className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--purple-bg)] flex items-center justify-center">
                                  <User className="w-5 h-5 text-[var(--purple-primary)]" />
                                </div>
                                <div>
                                  <Link
                                    href={`/dashboard/client-details/${client.uuid || client.id}`}
                                    className="font-semibold text-foreground hover:text-[var(--purple-primary)]"
                                  >
                                    {client.name}
                                    {client.age ? `, ${client.age}` : ""}
                                  </Link>
                                  <p className="text-xs text-muted-foreground">
                                    {client.id}
                                  </p>
                                </div>
                              </div>
                              {client.sessionsCompleted > 0 && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  {client.sessionsCompleted} sessions
                                </span>
                              )}
                            </div>
                            {(client.startDate ||
                              client.lastSession ||
                              client.nextSession ||
                              client.primaryIssues?.length > 0) && (
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {client.startDate && (
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      Start Date
                                    </p>
                                    <p className="font-medium text-foreground">
                                      {new Date(
                                        client.startDate,
                                      ).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                )}
                                {client.lastSession && (
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      Last Session
                                    </p>
                                    <p className="font-medium text-foreground">
                                      {new Date(
                                        client.lastSession,
                                      ).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                )}
                                {client.nextSession && (
                                  <div>
                                    <p className="text-muted-foreground text-xs mb-1">
                                      Next Session
                                    </p>
                                    <p className="font-medium text-foreground">
                                      {new Date(
                                        client.nextSession,
                                      ).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                )}
                                {client.primaryIssues &&
                                  client.primaryIssues.length > 0 && (
                                    <div>
                                      <p className="text-muted-foreground text-xs mb-1">
                                        Primary Issues
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {client.primaryIssues.map(
                                          (issue, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-0.5 bg-muted text-foreground text-xs rounded"
                                            >
                                              {issue}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-4">
                        No clients assigned
                      </p>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Documents & Verification
                    </h2>
                    {tc.documents && tc.documents.length > 0 ? (
                      <div className="space-y-3">
                        {tc.documents.map((doc, idx) => (
                          <div
                            key={doc.id || idx}
                            className="border border-border rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {doc.name || doc.type}
                                </p>
                                {doc.uploadDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded:{" "}
                                    {new Date(
                                      doc.uploadDate,
                                    ).toLocaleDateString("en-GB")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {doc.status && getDocumentStatusBadge(doc.status)}
                              {doc.url && (
                                <button
                                  onClick={() => {
                                    // Create download link
                                    const link = document.createElement("a");
                                    link.href = doc.url.startsWith("http")
                                      ? doc.url
                                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${doc.url}`;
                                    link.download = doc.name || "document";
                                    link.target = "_blank";
                                    link.click();
                                  }}
                                  className="p-2 hover:bg-muted rounded-lg"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4 text-muted-foreground" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-4">
                        No documents uploaded
                      </p>
                    )}
                  </div>

                  {/* Admin Notes - Only visible to internal team */}
                  {isInternalTeam && (
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">
                        Admin Notes
                      </h2>
                      <div className="space-y-4">
                        {tc.adminNotes && tc.adminNotes.length > 0 ? (
                          tc.adminNotes.map((note) => (
                            <div
                              key={note.id || note.date}
                              className="border border-border rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground">
                                      {note.author ||
                                        note.user?.name ||
                                        note.user ||
                                        "Unknown User"}
                                    </p>
                                    {note.user?.role && (
                                      <span className="text-xs px-2 py-0.5 bg-[var(--purple-bg)] text-[var(--purple-primary)] rounded-full">
                                        {note.user.role}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {note.date ||
                                      note.created_at ||
                                      "Unknown date"}
                                  </p>
                                  {note.user?.email && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {note.user.email}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditingNoteContent(
                                        note.content ||
                                          note.description ||
                                          note.note,
                                      );
                                    }}
                                    className="p-2 hover:bg-muted rounded-lg"
                                  >
                                    <Edit className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setNoteToDelete(note.id);
                                      setShowDeleteNoteModal(true);
                                    }}
                                    className="p-2 hover:bg-[var(--warning-bg)]/20 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4 text-[var(--warning-primary)]" />
                                  </button>
                                </div>
                              </div>
                              {editingNoteId === note.id ? (
                                <div className="mt-2">
                                  <textarea
                                    value={editingNoteContent}
                                    onChange={(e) =>
                                      setEditingNoteContent(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent resize-none"
                                    rows={3}
                                  />
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        setEditingNoteId(null);
                                        setEditingNoteContent("");
                                      }}
                                      className="px-3 py-1 border border-border text-muted-foreground rounded-lg hover:bg-muted text-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await apiService.updateActivityLog(
                                            note.id,
                                            {
                                              description: editingNoteContent,
                                            },
                                          );
                                          showToast.success(
                                            "Note updated successfully!",
                                          );
                                          setEditingNoteId(null);
                                          setEditingNoteContent("");
                                          window.location.reload();
                                        } catch (error) {
                                          console.error(
                                            "Error updating note:",
                                            error,
                                          );
                                          showToast.error(
                                            "Failed to update note. Please try again.",
                                          );
                                        }
                                      }}
                                      className="px-3 py-1 text-white rounded-lg hover:opacity-90 text-sm"
                                      style={{ backgroundColor: "#6f1d56" }}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-foreground">
                                  {note.content ||
                                    note.description ||
                                    note.note}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic text-center py-4">
                            No admin notes yet
                          </p>
                        )}

                        {/* Add New Note */}
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a new admin note..."
                            className="w-full px-3 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent resize-none"
                            rows={3}
                          />
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                              onClick={() => setNewNote("")}
                              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                if (!newNote.trim()) {
                                  showToast.warning(
                                    "Please enter a note before saving.",
                                  );
                                  return;
                                }
                                try {
                                  setAddingNote(true);
                                  await apiService.createActivityLog({
                                    action: "admin_note_added",
                                    model_type:
                                      "App\\Models\\TrainingCounsellor",
                                    model_id: tc.db_id || tc.id,
                                    description: newNote.trim(),
                                  });
                                  showToast.success("Note added successfully!");
                                  setNewNote("");
                                  window.location.reload();
                                } catch (error) {
                                  console.error("Error adding note:", error);
                                  showToast.error(
                                    "Failed to add note. Please try again.",
                                  );
                                } finally {
                                  setAddingNote(false);
                                }
                              }}
                              disabled={addingNote || !newNote.trim()}
                              className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: "#6f1d56" }}
                            >
                              {addingNote ? "Adding..." : "Add Note"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - 1/3 width - Performance Summary */}
                <div className="col-span-1">
                  <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Performance Summary
                    </h2>
                    <div className="space-y-4">
                      {tc.performance && (
                        <>
                          {tc.performance.clientSatisfaction > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground">
                                  Client Satisfaction
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                  {tc.performance.clientSatisfaction}/5.0
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${(tc.performance.clientSatisfaction / 5) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {tc.performance.sessionAttendanceRate > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground">
                                  Attendance Rate
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                  {tc.performance.sessionAttendanceRate}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${tc.performance.sessionAttendanceRate}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {tc.performance.dnaRate > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground">
                                  DNA Rate
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                  {tc.performance.dnaRate}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-red-600 h-2 rounded-full"
                                  style={{
                                    width: `${tc.performance.dnaRate}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {tc.performance.responseTime && (
                            <div className="pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground mb-1">
                                Avg Response Time
                              </p>
                              <p className="text-xl font-bold text-foreground">
                                {tc.performance.responseTime}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 space-y-2 pt-6 border-t border-border">
                      <button
                        onClick={() => setShowStatusModal(true)}
                        className="w-full py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium text-sm"
                      >
                        Change Status
                      </button>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="w-full py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm"
                        style={{ backgroundColor: "#6f1d56" }}
                      >
                        Assign New Client
                      </button>
                      <button
                        onClick={() => setShowSendMessageModal(true)}
                        className="w-full py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium text-sm"
                      >
                        Send Message
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            setDownloadingReport(true);
                            await apiService.downloadTrainingCounsellorReport(
                              tc.uuid || tc.id,
                            );
                            // Success - file will be downloaded automatically
                          } catch (error) {
                            console.error("Error downloading report:", error);
                            showToast.error(
                              "Failed to download report. Please try again.",
                            );
                          } finally {
                            setDownloadingReport(false);
                          }
                        }}
                        disabled={downloadingReport}
                        className="w-full py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingReport
                          ? "Downloading..."
                          : "Download Report"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Status Modal */}
        {showStatusModal && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowStatusModal(false)}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-lg shadow-2xl max-w-md w-full border border-border">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    Change TC Status
                  </h2>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-sm text-foreground">
                    Update status for <strong>{tc.name}</strong>
                  </p>

                  {/* Counsellor Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Counsellor Type
                    </label>
                    <SearchableSelect
                      value={statusForm.counsellorType}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          counsellorType: e.target.value,
                        })
                      }
                      options={[
                        { value: "Trainee", label: "Trainee" },
                        { value: "Qualified", label: "Qualified" },
                      ]}
                      placeholder="Trainee"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <SearchableSelect
                      value={statusForm.status}
                      onChange={(e) =>
                        setStatusForm({ ...statusForm, status: e.target.value })
                      }
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "At Capacity", label: "At Capacity" },
                        { value: "On Leave", label: "On Leave" },
                        { value: "Away", label: "Away" },
                        { value: "Inactive", label: "Inactive" },
                      ]}
                      placeholder="Active"
                    />
                  </div>

                  {/* Warning if transitioning to Qualified */}
                  {statusForm.counsellorType === "Qualified" &&
                    tc.counsellor_type !== "Qualified" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-900 mb-1">
                              Transitioning to Qualified Counsellor
                            </p>
                            <p className="text-sm text-yellow-800">
                              This counsellor will need to complete the
                              Qualified Counsellor form with additional
                              information and documents.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={statusForm.reason}
                      onChange={(e) =>
                        setStatusForm({ ...statusForm, reason: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Add reason for status change..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        setShowStatusModal(false);
                        setStatusForm({
                          status: tc.status,
                          counsellorType: tc.counsellor_type,
                          reason: "",
                        });
                      }}
                      className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const updateData = {
                            status: statusForm.status,
                            counsellor_type: statusForm.counsellorType,
                          };

                          await apiService.updateTrainingCounsellor(
                            tc.uuid || tc.id,
                            updateData,
                          );

                          if (
                            statusForm.counsellorType === "Qualified" &&
                            tc.counsellor_type !== "Qualified"
                          ) {
                            showToast.success(
                              "Status updated to Qualified Counsellor. The counsellor will need to complete the Qualified Counsellor form.",
                            );
                            setShowOpenFormConfirmModal(true);
                          } else {
                            showToast.success("Status updated successfully!");
                          }

                          setShowStatusModal(false);
                          // Refresh page to get updated data
                          window.location.reload();
                        } catch (error) {
                          console.error("Error updating status:", error);
                          showToast.error(
                            "Error updating status. Please try again.",
                          );
                        }
                      }}
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium"
                      style={{ backgroundColor: "#6f1d56" }}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Assign Client Modal */}
        {showAssignModal && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowAssignModal(false)}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border border-border">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    Assign Client to {tc.name}
                  </h2>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!assignForm.clientId || !tc) {
                      showToast.warning("Please select a client to assign.");
                      return;
                    }

                    try {
                      const client = pendingClients.find(
                        (c) => c.id === assignForm.clientId,
                      );

                      await apiService.assignMatch({
                        client_id: assignForm.clientId,
                        tc_id: tc.uuid || tc.id,
                        assignment_notes: assignForm.notes || null,
                        send_notification: assignForm.sendNotification,
                      });

                      showToast.success(
                        `Client "${client.name}" assigned to "${tc.name}"! Client will now move to "Agreement Pending" stage.`,
                      );

                      setShowAssignModal(false);
                      setAssignForm({
                        clientId: "",
                        notes: "",
                        sendNotification: true,
                      });

                      // Refresh page to get updated data
                      window.location.reload();
                    } catch (err) {
                      console.error("Error assigning client:", err);
                      showToast.error(
                        `Failed to assign client: ${err.message || "Please try again."}`,
                      );
                    }
                  }}
                  className="p-6 space-y-4"
                >
                  <div className="p-4 bg-[var(--tag-bg-green)] border border-green-200 dark:border-green-800 rounded-lg mb-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Select a client from the pending matches list to assign to
                      this trainee counsellor.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Client <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      value={assignForm.clientId}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          clientId: e.target.value,
                        })
                      }
                      options={pendingClients.map((client) => ({
                        value: client.id,
                        label: `${client.name} ${client.age ? `(${client.age})` : ""} - ${client.issues.join(", ")}`,
                      }))}
                      placeholder="Select a client..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Assignment Notes (Optional)
                    </label>
                    <textarea
                      value={assignForm.notes}
                      onChange={(e) =>
                        setAssignForm({ ...assignForm, notes: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                      rows={3}
                      placeholder="Add any notes about this assignment..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendNotification"
                      checked={assignForm.sendNotification}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          sendNotification: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[var(--purple-primary)] border-gray-300 rounded focus:ring-[var(--purple-primary)]"
                    />
                    <label
                      htmlFor="sendNotification"
                      className="text-sm text-foreground"
                    >
                      Send notification email to trainee counsellor
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium"
                      style={{ backgroundColor: "#6f1d56" }}
                    >
                      Assign Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Send Email Confirmation Modal */}
        <ConfirmationModal
          isOpen={showSendEmailConfirmModal}
          onClose={() => setShowSendEmailConfirmModal(false)}
          onConfirm={async () => {
            try {
              setSendingEmail(true);
              const response = await apiService.sendQualifiedFormEmail(
                tc.uuid || tc.id,
              );
              showToast.success(
                `Email sent successfully to ${tc.email}! UUID: ${response.tc_uuid || tc.uuid}`,
              );
              setShowSendEmailConfirmModal(false);
              // Optionally refresh the page to update any status
              window.location.reload();
            } catch (error) {
              console.error("Error sending email:", error);
              showToast.error("Failed to send email. Please try again.");
              setShowSendEmailConfirmModal(false);
            } finally {
              setSendingEmail(false);
            }
          }}
          title="Send Qualified Counsellor Form Email"
          message={`Send Qualified Counsellor Form email to ${tc?.email}?`}
          confirmText="Send Email"
          cancelText="Cancel"
          type="info"
          loading={sendingEmail}
          confirmButtonColor="#eab308"
        />

        {/* Open Form Confirmation Modal */}
        <ConfirmationModal
          isOpen={showOpenFormConfirmModal}
          onClose={() => setShowOpenFormConfirmModal(false)}
          onConfirm={() => {
            const formUrl = `/qualified-counsellor-form?tc_id=${tc.id}`;
            window.open(formUrl, "_blank");
            setShowOpenFormConfirmModal(false);
          }}
          title="Open Qualified Counsellor Form"
          message="Would you like to open the Qualified Counsellor form now?"
          confirmText="Open Form"
          cancelText="Cancel"
          type="info"
          confirmButtonColor="#6f1d56"
        />

        {/* Send Message Modal */}
        {showSendMessageModal && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowSendMessageModal(false)}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border border-border">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    Send Message to {tc?.name}
                  </h2>
                  <button
                    onClick={() => setShowSendMessageModal(false)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!messageForm.subject || !messageForm.message) {
                      showToast.warning(
                        "Please fill in both subject and message",
                      );
                      return;
                    }

                    try {
                      setSendingMessage(true);
                      await apiService.sendMessageToCounsellor({
                        tc_id: tc.db_id || tc.id,
                        subject: messageForm.subject,
                        message: messageForm.message,
                        send_email_notification:
                          messageForm.sendEmailNotification,
                      });
                      showToast.success("Message sent successfully!");
                      setShowSendMessageModal(false);
                      setMessageForm({
                        subject: "",
                        message: "",
                        sendEmailNotification: true,
                      });
                    } catch (err) {
                      console.error("Error sending message:", err);
                      showToast.error(
                        `Failed to send message: ${err.message || "Please try again."}`,
                      );
                    } finally {
                      setSendingMessage(false);
                    }
                  }}
                  className="p-6 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                      placeholder="Enter message subject"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <RichTextEditor
                      content={messageForm.message}
                      onChange={(html) =>
                        setMessageForm({
                          ...messageForm,
                          message: html,
                        })
                      }
                      placeholder="Enter your message"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendEmailNotification"
                      checked={messageForm.sendEmailNotification}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          sendEmailNotification: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[var(--purple-primary)] border-gray-300 rounded focus:ring-[var(--purple-primary)]"
                    />
                    <label
                      htmlFor="sendEmailNotification"
                      className="text-sm text-foreground"
                    >
                      Also send email notification (if counsellor has email)
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSendMessageModal(false)}
                      className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="flex-1 px-4 py-2 bg-[var(--purple-primary)] text-white rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {sendingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
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
