"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import { formatTimeSlotDisplay } from "@/lib/timeFormatter";

import SessionNotesModal from "@/components/SessionNotesModal";
import SessionNoteDetailsModal from "@/components/SessionNoteDetailsModal";
import { useToast, showToast } from "@/lib/toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import DashboardLayout from "@/components/DashboardLayout";
import RichTextEditor from "@/components/RichTextEditor";

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
  AlertCircle,
  Check,
  XCircle,
  Building2,
  Star,
  CalendarDays,
  RefreshCw,
  ClipboardList,
  Files
} from "lucide-react";

const core34Questions = [
  "I have felt terribly alone and isolated",
  "I have felt tense, anxious or nervous",
  "I have felt I have someone to turn to for support when needed",
  "I have felt O.K about myself",
  "I have felt totally lacking in energy and enthusiasm",
  "I have been physically violent to others",
  "I have felt able to cope when things go wrong",
  "I have been troubled by aches, pains or other physical problems",
  "I have thought of hurting myself",
  "Talking to people has felt too much for me",
  "Tension and anxiety have prevented me from doing important things",
  "I have been happy with the things I have done",
  "I have been disturbed by unwanted thoughts and feelings",
  "I have felt like crying",
  "I have felt panic or terror",
  "I made plans to end my life",
  "I have felt overwhelmed by my problems",
  "I have had difficulty getting to sleep or staying asleep",
  "I have felt warmth or affection for someone",
  "My problems have been impossible to put to one side",
  "I have been able to do most things I needed to",
  "I have threatened or intimidated another person",
  "I have felt despairing or hopeless",
  "I have thought it would be better if I were dead",
  "I have felt criticised by other people",
  "I have thought I have no friends",
  "I have felt unhappy",
  "Unwanted images or memories have been distressing me",
  "I have been irritable when with other people",
  "I have thought I am to blame for my problems and difficulties",
  "I have felt optimistic about my future",
  "I have achieved the things I wanted to",
  "I have felt humiliated or shamed by other people",
  "I have hurt myself physically or taken dangerous risks with my health",
];

export default function IndividualClientDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const uuid = params?.uuid;
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  const [activeNotesTab, setActiveNotesTab] = useState("consultation");
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [showSessionNotesModal, setShowSessionNotesModal] = useState(false);
  const [clinicalLogs, setClinicalLogs] = useState([]);
  const [selectedClinicalNoteId, setSelectedClinicalNoteId] = useState(null);
  const [showClinicalNoteModal, setShowClinicalNoteModal] = useState(false);
  const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);
  const [showUnarchiveConfirmModal, setShowUnarchiveConfirmModal] =
    useState(false);
  const [showDeleteNoteConfirmModal, setShowDeleteNoteConfirmModal] =
    useState(false);
  const [showProgressStageConfirmModal, setShowProgressStageConfirmModal] =
    useState(false);
  const [showDeleteSessionConfirmModal, setShowDeleteSessionConfirmModal] =
    useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [nextStage, setNextStage] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  // Show notification and auto-hide
  const showNotification = (message, type = "success") => {
    // Use toast instead
    if (type === "error") {
      showError(message);
    } else {
      success(message);
    }
    // Keep old notification for backward compatibility if needed
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Transform API data to frontend structure
  const transformClientData = (data) => {
    return {
      id: data.uuid || data.id,
      uuid: data.uuid || data.id,
      dbId: data.id,
      client_id: data.client_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      postcode: data.postcode || null,
      age: data.age || null,
      gender: data.gender || data.intake_form?.gender || "Not provided",
      ethnicity: data.ethnicity || data.intake_form?.ethnicity || "Not specified",
      sexualOrientation: data.sexual_orientation || data.intake_form?.sexual_orientation || "Not specified",
      stage: data.stage || "Consultation Booked",
      status: data.status || "active",
      daysInSystem: data.submitted_date
        ? Math.floor(
            (new Date() - new Date(data.submitted_date)) /
              (1000 * 60 * 60 * 24),
          )
        : 0,
      voicemailPermission: data.voicemail_permission || (data.intake_form?.voicemail_ok !== undefined ? (data.intake_form.voicemail_ok ? "Yes" : "No") : "Not specified"),
      howHeardAbout: data.how_heard_about || data.hear_about_us || data.intake_form?.hear_about_us || "Not specified",
      journey: (() => {
        const stages = [
          {
            name: "Consultation Booked",
            date:
              data.consultations && data.consultations.length > 0
                ? data.consultations[0].created_at ||
                  data.consultations[0].scheduled_at
                : null,
            isCompleted: data.consultations && data.consultations.length > 0,
          },
          {
            name: "Consultation Completed",
            date:
              data.consultations &&
              data.consultations.some((c) => c.status === "completed")
                ? data.consultations.find((c) => c.status === "completed")
                    .updated_at
                : null,
            isCompleted:
              data.consultations &&
              data.consultations.some((c) => c.status === "completed"),
          },
          {
            name: "Agreement Sent",
            date: data.agreement_sent_at,
            isCompleted: !!data.agreement_sent_at,
          },
          {
            name: "Agreement Signed",
            date: data.agreement_signed_at,
            isCompleted: !!data.agreement_signed_at,
          },
          {
            name: "Matched With Counsellor",
            date: data.matched_date,
            isCompleted: !!data.matched_date || !!data.matched_tc,
          },
          {
            name: "Sessions Booked",
            date: data.sessions?.[0]?.scheduled_at || data.start_date,
            isCompleted:
              data.stage === "Sessions Booked" ||
              data.stage === "Active Therapy" ||
              (data.sessions && data.sessions.length > 0),
          },
          {
            name: "Active Therapy",
            date: data.start_date,
            isCompleted:
              data.stage === "Active Therapy" ||
              (data.sessions || []).some((s) => s.status === "completed"),
          },
        ];

        // Determine current stage based on the last completed stage or the client.stage if it matches
        const currentStageName = data.stage;

        return stages.map((s, index) => ({
          stage: s.name,
          date: s.date ? new Date(s.date).toLocaleDateString("en-GB") : null,
          completed: s.isCompleted,
          current:
            s.name === currentStageName ||
            (s.isCompleted &&
              index === stages.length - 1 &&
              !stages.slice(index + 1).some((next) => next.isCompleted)),
        }));
      })(),
      primaryIssues: data.primary_issues || [],
      additionalDetails: data.additional_details || null,
      medication: data.medication || null,
      disabilities: data.disabilities || null,
      riskFlags: data.risk_flags || null,
      substanceMisuse: data.substance_misuse || null,
      availability:
        data.availability &&
        typeof data.availability === "object" &&
        !Array.isArray(data.availability)
          ? Object.entries(data.availability).map(([day, timeBlocks]) => ({
              day: day
                ? day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
                : day,
              timeBlocks: Array.isArray(timeBlocks) ? timeBlocks : [],
            }))
          : Array.isArray(data.availability)
            ? data.availability
            : [],
      serviceType: data.service_type || null,
      packageDetails: (() => {
        // Prefer real booked therapy sessions (the Session model, created via
        // the client-booking flow) as the source of truth - they reflect
        // what was actually booked/paid for, unlike the old fixed guesses.
        const therapySessions = (data.sessions || []).filter(
          (s) => s.status !== "cancelled",
        );

        if (therapySessions.length > 0) {
          const sessionsCompleted = therapySessions.filter(
            (s) => s.status === "completed",
          ).length;
          const sessionsDNA = therapySessions.filter(
            (s) => s.status === "no_show",
          ).length;
          const totalSessions = therapySessions.length;
          const sessionsRemaining = Math.max(
            0,
            totalSessions - sessionsCompleted - sessionsDNA,
          );

          const sorted = [...therapySessions].sort(
            (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at),
          );
          const formatDate = (d) =>
            new Date(d).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

          return {
            name: `${data.service_type || "Counselling"} Package`,
            totalSessions,
            sessionsCompleted,
            sessionsDNA,
            sessionsRemaining,
            status: sessionsRemaining === 0 ? "Completed" : "Active",
            startDate: formatDate(sorted[0].scheduled_at),
            expectedEndDate: formatDate(sorted[sorted.length - 1].scheduled_at),
          };
        }

        // No therapy sessions booked yet - fall back to a rough estimate
        // based on service type so pre-booking clients still see a preview.
        const getTotalSessions = (serviceType) => {
          if (serviceType === "Low Cost") return 4;
          if (serviceType === "Mid Range") return 8;
          if (serviceType === "High Range") return 12;
          return 4; // Default
        };
        const totalSessions = getTotalSessions(data.service_type);

        let startDate = null;
        if (data.matched_date) {
          startDate = new Date(data.matched_date).toLocaleDateString(
            "en-GB",
            { year: "numeric", month: "short", day: "numeric" },
          );
        }

        return {
          name: `${data.service_type || "Counselling"} Package`,
          totalSessions,
          sessionsCompleted: 0,
          sessionsDNA: 0,
          sessionsRemaining: totalSessions,
          status: "Not Started",
          startDate: startDate || "Not started",
          expectedEndDate: "Not calculated",
        };
      })(),
      matchedTC: data.matched_tc
        ? (() => {
            const activeMatch = (data.matches || [])
              .filter((m) => m.tc_id === data.matched_tc.id)
              .sort(
                (a, b) =>
                  new Date(b.assigned_date || b.created_at || 0) -
                  new Date(a.assigned_date || a.created_at || 0),
              )[0];
            return {
              id: data.matched_tc.id,
              name: data.matched_tc.name,
              email: data.matched_tc.email,
              phone: data.matched_tc.phone,
              currentClients: data.matched_tc.current_clients || 0,
              maxClients: data.matched_tc.max_clients || 6,
              modality: data.matched_tc.modality || null,
              matchScore: activeMatch?.match_score ?? null,
              matchBreakdown: activeMatch?.match_breakdown || {},
              warningFlags: activeMatch?.flags || [],
              matchedByName: activeMatch?.matched_by_user?.name || null,
              assignmentNotes: activeMatch?.assignment_notes || null,
              assignedDate: activeMatch?.assigned_date || null,
              otherClients: [],
            };
          })()
        : null,
      payments: [],
      sessions: data.consultations
        ? data.consultations.map((consultation, idx) => ({
            id: consultation.id,
            sessionNumber: idx + 1,
            date: consultation.scheduled_at
              ? new Date(consultation.scheduled_at).toISOString().split("T")[0]
              : null,
            time: consultation.scheduled_at
              ? new Date(consultation.scheduled_at).toLocaleTimeString(
                  "en-GB",
                  { hour: "2-digit", minute: "2-digit" },
                )
              : null,
            tcName: consultation.tc
              ? consultation.tc.name
              : consultation.tc_id
                ? "Assigned"
                : null,
            duration: "50 min",
            status: consultation.status || "scheduled",
            notes: consultation.notes || null,
          }))
        : [],
      // Real weekly therapy sessions booked via the client-booking flow -
      // distinct from `sessions` above, which (despite the name) is actually
      // the intake/assessment consultation history.
      therapySessions: data.sessions
        ? data.sessions.map((session) => ({
            id: session.id,
            date: session.scheduled_at,
            status: session.status,
          }))
        : [],
      consultation:
        data.consultations && data.consultations.length > 0
          ? (() => {
              const firstCompleted = data.consultations.find(
                (c) => c.status === "completed",
              );
              const firstConsultation = firstCompleted || data.consultations[0];
              return {
                date: firstConsultation.scheduled_at
                  ? new Date(firstConsultation.scheduled_at)
                      .toISOString()
                      .split("T")[0]
                  : null,
                time: firstConsultation.scheduled_at
                  ? new Date(firstConsultation.scheduled_at).toLocaleTimeString(
                      "en-GB",
                      { hour: "2-digit", minute: "2-digit" },
                    )
                  : null,
                duration: "50 min",
                conductedBy: firstConsultation.tc
                  ? firstConsultation.tc.name
                  : null,
                notes: firstConsultation.notes || null,
                outcome: firstConsultation.outcome || null,
                recommendedService:
                  firstConsultation.recommended_service ||
                  data.service_type ||
                  null,
              };
            })()
          : null,
      satisfactionScore: data.satisfaction_score || null,
      feedbackCount: data.feedback_count || 0,
      lastFeedbackSentAt: data.last_feedback_sent_at || null,
      lastFeedbackDate: data.last_feedback_date || null,
      agreement: (data.agreement_status || data.agreement_signed_at || data.stage === "Agreement Signed")
        ? {
            status:
              data.agreement_status === "signed" || data.agreement_signed_at || data.stage === "Agreement Signed" || data.stage === "Matched with TC"
                ? "Signed"
                : data.agreement_status === "sent" || data.agreement_sent_at
                  ? "Sent"
                  : "Not Sent",
            sentDate: data.agreement_sent_at
              ? new Date(data.agreement_sent_at).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null,
            signedDate: data.agreement_signed_at
              ? new Date(data.agreement_signed_at).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            jotformId: data.agreement_jotform_id || null,
            signatureUrl: data.agreement_signature_url || null,
            downloadUrl: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/client-agreement/download/${data.uuid || data.id}`,
          }
        : null,
      emergencyContact:
        data.emergency_contact_name || data.emergency_contact_phone
          ? {
              name: data.emergency_contact_name || null,
              phone: data.emergency_contact_phone || null,
              relationship: data.emergency_contact_relationship || null,
            }
          : null,
      core34Answers: (() => {
        // Try direct field first
        if (data.core34_answers && typeof data.core34_answers === "object") {
          return data.core34_answers;
        }
        // Fallback to JotForm data if available
        if (data.jotform_intake_data && data.jotform_intake_data.all_data) {
          const extracted = {};
          const allData = data.jotform_intake_data.all_data;

          // JotForm fields often follow q1, q2... q34 pattern
          // or question1, question2... or they might be more complex
          for (let i = 1; i <= 34; i++) {
            // Try common JotForm field naming patterns
            const val =
              allData[`q${i}`] ||
              allData[`q${i}_q${i}`] ||
              allData[`question${i}`] ||
              allData[`q${i}_input`] ||
              // Check for any key starting with q{i}_
              Object.keys(allData).find((key) => key.startsWith(`q${i}_`))
                ? allData[
                    Object.keys(allData).find((key) => key.startsWith(`q${i}_`))
                  ]
                : null;

            if (val !== null && val !== undefined) {
              extracted[i - 1] = val; // Use 0-based index to match core34Questions array
            }
          }

          if (Object.keys(extracted).length > 0) {
            return extracted;
          }
        }
        return {};
      })(),
      updatedAt: data.updated_at || data.created_at,
    };
  };

  // Fetch admin notes
  const fetchAdminNotes = async () => {
    if (!client?.dbId) return;

    try {
      const logs = await apiService.getActivityLogs({
        model_type: "App\\Models\\Client",
        model_id: client.dbId,
        action: "admin_note",
        per_page: 100,
      });

      const clientLogs = logs.data || [];
      setAdminNotes(
        clientLogs.map((log) => ({
          id: log.id,
          date: new Date(log.created_at).toLocaleString("en-GB"),
          updatedDate: log.updated_at
            ? new Date(log.updated_at).toLocaleString("en-GB")
            : null,
          author: log.user?.name || "Unknown User",
          authorEmail: log.user?.email || null,
          authorRole: log.user?.role || null,
          userId: log.user?.id || null,
          content: log.description,
          isEdited: log.updated_at && log.updated_at !== log.created_at,
        })),
      );
    } catch (err) {
      console.error("Error fetching admin notes:", err);
    }
  };

  // Fetch clinical logs (SessionNote model)
  const fetchClinicalLogs = async () => {
    if (!client?.dbId) return;
    try {
      const data = await apiService.getSessionNotes({ client_id: client.dbId });
      setClinicalLogs(data || []);
    } catch (err) {
      console.error("Error fetching clinical logs:", err);
    }
  };

  // Fetch client data from API
  useEffect(() => {
    const fetchClientData = async () => {
      if (!uuid) return;

      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getClientDetails(uuid);
        const transformedData = transformClientData(data);
        setClient(transformedData);
        await fetchAdminNotes();
        // Fetch clinical logs once dbId is available
        const logs = await apiService.getSessionNotes({ client_id: data.id });
        setClinicalLogs(logs || []);
      } catch (err) {
        console.error("Error fetching client details:", err);
        setError("Failed to load client details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [uuid]);

  // Auto-refresh notes when window regains focus (for multi-user collaboration)
  useEffect(() => {
    const handleFocus = () => {
      if (client?.dbId && activeNotesTab === "admin") {
        fetchAdminNotes();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [client?.dbId, activeNotesTab]);

  // Refresh notes when switching to admin tab
  useEffect(() => {
    if (activeNotesTab === "admin" && client?.dbId) {
      fetchAdminNotes();
    }
  }, [activeNotesTab, client?.dbId]);

  // Action Handlers
  const handleSendEmail = async () => {
    if (!client?.email) {
      showNotification("Client email not available", "error");
      return;
    }
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = async (subject, message) => {
    try {
      setActionLoading(true);
      await apiService.sendClientEmail(uuid, subject, message);
      showNotification("Email sent successfully");
      setShowEmailModal(false);
    } catch (err) {
      showNotification(err.message || "Failed to send email", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCall = () => {
    if (!client?.phone) {
      showNotification("Client phone number not available", "error");
      return;
    }
    window.location.href = `tel:${client.phone}`;
  };

  const handleSendFeedbackForm = async () => {
    if (!client?.email) {
      showNotification("Client email not available", "error");
      return;
    }

    // Check if feedback was sent recently
    if (client.lastFeedbackSentAt) {
      const monthsSince = Math.floor(
        (new Date() - new Date(client.lastFeedbackSentAt)) /
          (1000 * 60 * 60 * 24 * 30),
      );
      if (monthsSince < 3) {
        showNotification(
          `Feedback form was sent ${monthsSince} month(s) ago. Please wait until 3 months have passed.`,
          "error",
        );
        return;
      }
    }

    try {
      setActionLoading(true);
      await apiService.sendFeedbackForm(uuid);
      success("Feedback form email sent successfully!");
      // Refresh client data
      const data = await apiService.getClientDetails(uuid);
      const transformedData = transformClientData(data);
      setClient(transformedData);
    } catch (err) {
      showError(err.message || "Failed to send feedback form");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendAgreement = async () => {
    if (!client?.email) {
      showNotification("Client email not available", "error");
      return;
    }

    try {
      setActionLoading(true);
      await apiService.resendAgreement(uuid);
      success("Agreement email sent successfully!");
      // Refresh client data
      const data = await apiService.getClientDetails(uuid);
      const transformedData = transformClientData(data);
      setClient(transformedData);
    } catch (err) {
      showError(err.message || "Failed to send agreement email");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = () => {
    setShowArchiveConfirmModal(true);
  };

  const confirmArchive = async () => {
    try {
      setActionLoading(true);
      await apiService.archiveClient(uuid);
      success("Client archived successfully");
      // Refresh client data
      const data = await apiService.getClientDetails(uuid);
      setClient((prev) => ({ ...prev, status: "archived" }));
      setShowArchiveConfirmModal(false);
    } catch (err) {
      showError(err.message || "Failed to archive client");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnarchive = () => {
    setShowUnarchiveConfirmModal(true);
  };

  const confirmUnarchive = async () => {
    try {
      setActionLoading(true);
      await apiService.unarchiveClient(uuid);
      success("Client unarchived successfully");
      // Refresh client data
      const data = await apiService.getClientDetails(uuid);
      const transformedData = transformClientData(data);
      setClient(transformedData);
      setShowUnarchiveConfirmModal(false);
    } catch (err) {
      showError(err.message || "Failed to unarchive client");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSession = async (sessionData) => {
    try {
      setActionLoading(true);
      const consultation = await apiService.createConsultation({
        client_id: client.dbId,
        tc_id: client.matchedTC?.id || null,
        scheduled_at: sessionData.dateTime,
        notes: sessionData.notes || "",
        send_confirmation: sessionData.sendConfirmation || false,
      });
      showNotification("Session added successfully");
      setShowAddSessionModal(false);

      // Refresh full client data to get updated sessions with TC info
      const data = await apiService.getClientDetails(uuid);
      const transformedData = transformClientData(data);
      setClient(transformedData);
    } catch (err) {
      showNotification(err.message || "Failed to add session", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setShowSessionNotesModal(true);
  };

  const handleDeleteSession = (session) => {
    setSessionToDelete(session);
    setShowDeleteSessionConfirmModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete || !sessionToDelete.id) {
      showError("Session ID not found. Cannot delete session.");
      setShowDeleteSessionConfirmModal(false);
      setSessionToDelete(null);
      return;
    }

    try {
      setActionLoading(true);
      await apiService.deleteConsultation(sessionToDelete.id);
      success("Session deleted successfully!");
      setShowDeleteSessionConfirmModal(false);
      setSessionToDelete(null);

      // Refresh client data
      const data = await apiService.getClientDetails(uuid);
      const transformedData = transformClientData(data);
      setClient(transformedData);
    } catch (err) {
      console.error("Error deleting session:", err);
      showError(err.message || "Failed to delete session. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadAgreement = async () => {
    try {
      setActionLoading(true);
      await apiService.downloadAgreementPdf(client?.uuid || uuid);
      success("Agreement downloaded successfully!");
    } catch (error) {
      console.error("Error downloading agreement:", error);
      showError(error?.message || "Failed to download agreement PDF");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendAgreement = async () => {
    try {
      setActionLoading(true);
      await apiService.resendAgreement(uuid);
      success("Agreement email sent successfully!");
      // Refresh client data
      const data = await apiService.getClientDetails(uuid);
      const transformedData = transformClientData(data);
      setClient(transformedData);
    } catch (err) {
      showError(err.message || "Failed to send agreement email");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAdminNote = async () => {
    if (!newNoteText.trim()) {
      showNotification("Please enter a note", "error");
      return;
    }

    try {
      setActionLoading(true);
      // Create activity log entry
      await apiService.createActivityLog({
        action: "admin_note",
        model_type: "App\\Models\\Client",
        model_id: client.dbId,
        description: newNoteText.trim(),
      });
      showNotification("Note added successfully");
      setNewNoteText("");
      setShowAddNoteModal(false);
      await fetchAdminNotes();
    } catch (err) {
      showNotification(err.message || "Failed to add note", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.content);
  };

  const handleUpdateNote = async () => {
    if (!editingNoteText.trim()) {
      showNotification("Please enter a note", "error");
      return;
    }

    try {
      setActionLoading(true);
      await apiService.updateActivityLog(editingNoteId, {
        description: editingNoteText.trim(),
      });
      showNotification("Note updated successfully");
      setEditingNoteId(null);
      setEditingNoteText("");
      await fetchAdminNotes();
    } catch (err) {
      showNotification(err.message || "Failed to update note", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    setNoteToDelete(noteId);
    setShowDeleteNoteConfirmModal(true);
  };

  const confirmDeleteNote = async () => {
    try {
      setActionLoading(true);
      await apiService.deleteActivityLog(noteToDelete);
      success("Note deleted successfully");
      await fetchAdminNotes();
      setShowDeleteNoteConfirmModal(false);
      setNoteToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete note");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProgressStage = () => {
    const stages = [
      "Consultation Booked",
      "Consultation Completed",
      "Agreement Sent",
      "Agreement Signed",
      "Matched With Counsellor",
      "Sessions Booked",
      "Active Therapy",
    ];
    const currentIndex = stages.indexOf(client.stage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      showError("Cannot progress further");
      return;
    }

    const stage = stages[currentIndex + 1];
    setNextStage(stage);
    setShowProgressStageConfirmModal(true);
  };

  const confirmProgressStage = async () => {
    try {
      setActionLoading(true);
      await apiService.progressClientStage(uuid, nextStage);
      success(`Client progressed to ${nextStage}`);
      setClient((prev) => ({ ...prev, stage: nextStage }));
      setShowProgressStageConfirmModal(false);
      setNextStage(null);
    } catch (err) {
      showError(err.message || "Failed to progress stage");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookNextSession = () => {
    setShowAddSessionModal(true);
  };

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      await apiService.downloadClientReport(client.uuid || client.id);
      // Success is handled by the browser download
    } catch (error) {
      console.error("Error downloading report:", error);
      showToast.error("Failed to download report. Please try again.");
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">
            Loading client details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">
            {error || "Client not found"}
          </p>
          <Link
            href="/dashboard/clients"
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  // Notes data - transform from client data
  // Get consultation notes from all completed consultations
  const consultationNotes = (client.sessions || [])
    .filter((session) => session.status === "completed" && session.notes)
    .map((session, idx) => ({
      id: `consultation-${session.id || idx}`,
      author: session.tcName || "Admin",
      date: session.date
        ? new Date(session.date).toLocaleDateString("en-GB")
        : "N/A",
      content: session.notes,
    }));

  // Transform session notes to match expected structure
  const sessionNotes = (client.sessions || [])
    .filter((session) => session.notes) // Only show sessions with notes
    .map((session, idx) => ({
      id: `session-${session.id || session.sessionNumber || idx}`,
      sessionNumber: session.sessionNumber || idx + 1,
      author: session.tcName || "Admin",
      date: session.date
        ? new Date(session.date).toLocaleDateString("en-GB")
        : "N/A",
      session: `Session #${session.sessionNumber || idx + 1}`,
      content: session.notes,
    }));

  const getStatusColor = (status) => {
    switch (status) {
      case "urgent":
        return "bg-red-500 text-white";

      case "stuck":
        return "bg-yellow-500 text-white";

      case "active":
        return "bg-[var(--success-primary)] text-white";

      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStageBadgeColor = (stage) => {
    switch (stage) {
      case "Consultation Booked":
        return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800";

      case "Consultation Completed":
        return "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800";

      case "Matched With Counsellor":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800";

      case "Agreement Sent":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800";

      case "Agreement Signed":
        return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800";

      case "Sessions Booked":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800";

      case "Active Therapy":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700";

      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700";
    }
  };

  const getSessionStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="px-2 py-1 bg-[var(--success-bg)] text-[var(--success-primary)] border border-[var(--success-border)] text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );

      case "DNA":
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs font-medium rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> DNA
          </span>
        );

      case "Scheduled":
        return (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Scheduled
          </span>
        );

      case "Cancelled":
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Cancelled
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <PageGuard menuId="clients">
      <DashboardLayout>
        <div className="min-h-screen bg-[var(--bg-secondary)] flex">
          {/* Notification Toast */}
          {notification && (
            <div
              className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                notification.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add Session Modal */}
          {showAddSessionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Add New Session</h3>
                <AddSessionFormComponent
                  client={client}
                  onSubmit={handleAddSession}
                  onCancel={() => setShowAddSessionModal(false)}
                  loading={actionLoading}
                />
              </div>
            </div>
          )}

          {/* Send Email Modal */}
          {showEmailModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  Send Email to {client?.name}
                </h3>
                <EmailFormComponent
                  clientEmail={client?.email}
                  onSubmit={handleSendEmailSubmit}
                  onCancel={() => setShowEmailModal(false)}
                  loading={actionLoading}
                />
              </div>
            </div>
          )}

          {/* Session Notes Modal */}
          <SessionNotesModal
            isOpen={showSessionNotesModal}
            onClose={() => {
              setShowSessionNotesModal(false);
              setSelectedSession(null);
            }}
            session={selectedSession}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}

              <div className="bg-[var(--card-bg)] border-b border-[var(--border-color)]">
                {/* Breadcrumb */}
                <div className="px-8 py-4 border-b border-[var(--border-color)] bg-white/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Link
                      href="/dashboard/clients"
                      className="hover:text-[var(--accent-color)] transition-colors"
                    >
                      All Clients
                    </Link>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                    <span className="text-[var(--text-primary)] font-semibold">
                      {client.name}
                    </span>
                  </div>
                </div>

                {/* Client Header Content */}
                <div className="px-8 py-8 lg:py-10 bg-gradient-to-br from-white via-transparent to-transparent">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                      {/* Avatar Section */}
                      <div className="relative group">
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl transition-all duration-300 group-hover:scale-105"
                          style={{
                            background: "linear-gradient(135deg, #6f1d56 0%, #a21b5e 100%)",
                            boxShadow: '0 8px 16px -4px rgba(111, 29, 86, 0.3)'
                          }}
                        >
                          {client.name
                            ? client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "??"}
                        </div>
                      </div>

                      {/* Header Main Info */}
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-end gap-3">
                          <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
                            {client.name}
                          </h1>
                          <div className="flex items-center gap-2 mb-1.5 px-3 py-1 bg-white border border-[var(--border-color)] rounded-full text-sm font-medium text-[var(--text-secondary)] shadow-sm">
                            <span>{client.age} yrs</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-xs font-mono opacity-60">ID: {client.id?.substring(0, 8)}...</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 pr-4 border-r border-[var(--border-color)]">
                            <span className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(client.status)}`}></span>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${getStageBadgeColor(client.stage)} shadow-sm`}>
                              {client.stage}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                            <Clock className="w-4 h-4 opacity-50" />
                            <span>Last active:</span>
                            <span className="text-[var(--text-primary)]">
                              {client.updatedAt
                                ? (() => {
                                    const diff = new Date() - new Date(client.updatedAt);
                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                    const days = Math.floor(hours / 24);
                                    if (days > 0) return `${days}d ago`;
                                    if (hours > 0) return `${hours}h ago`;
                                    return "Just now";
                                  })()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions Restructured */}
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row xl:items-center gap-3">
                      {/* Contact Group */}
                      <div className="flex items-center gap-2 bg-indigo-50/50 p-1.5 rounded-xl border border-indigo-100">
                        <button
                          onClick={handleSendEmail}
                          disabled={actionLoading || client.status === "archived"}
                          className="p-2.5 bg-white text-indigo-600 rounded-lg hover:bg-white/80 shadow-sm border border-indigo-100/50 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                          title="Send Email"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCall}
                          disabled={client.status === "archived"}
                          className="p-2.5 bg-white text-indigo-600 rounded-lg hover:bg-white/80 shadow-sm border border-indigo-100/50 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                          title="Call Client"
                        >
                          <Phone className="w-5 h-5" />
                        </button>
                        <Link
                          href={`/dashboard/contacts/client/${uuid}/inbox`}
                          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all hover:-translate-y-0.5"
                        >
                          <Mail className="w-5 h-5" />
                          <span className="font-semibold text-sm">Inbox</span>
                        </Link>
                      </div>

                      {/* Resources Group */}
                      <div className="flex items-center gap-2 bg-purple-50/50 p-1.5 rounded-xl border border-purple-100">
                        <Link
                          href={`/dashboard/contacts/client/${uuid}/files`}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-700 rounded-lg hover:bg-purple-50 shadow-sm border border-purple-200 transition-all font-semibold text-sm hover:-translate-y-0.5"
                        >
                          <Files className="w-5 h-5" />
                          <span>Files</span>
                        </Link>
                        <Link
                          href={`/dashboard/contacts/client/${uuid}/internal-form`}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white text-amber-700 rounded-lg hover:bg-amber-50 shadow-sm border border-amber-200 transition-all font-semibold text-sm hover:-translate-y-0.5 whitespace-nowrap"
                        >
                          <FileText className="w-5 h-5" />
                          <span>Internal Form</span>
                        </Link>
                      </div>

                      {/* Management Group */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/clients/edit?id=${uuid}`}
                          className={`p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 ${client.status === "archived" ? "opacity-50 pointer-events-none" : ""}`}
                          title="Edit Profile"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={client.status === "archived" ? handleUnarchive : handleArchive}
                          disabled={actionLoading || (client.status === "archived" && user?.role !== "admin")}
                          className={`p-2.5 rounded-xl border shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 ${
                            client.status === "archived"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                          }`}
                          title={client.status === "archived" ? "Unarchive" : "Archive"}
                        >
                          <Archive className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            {/* Content Area - Scrollable */}

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Overview Cards */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Activity className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Service Type
                      </p>
                    </div>
                    <p className="text-lg font-black text-[var(--text-primary)] truncate">
                      {client.serviceType || "Not Set"}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Days in System
                      </p>
                    </div>
                    <p className="text-lg font-black text-[var(--text-primary)]">
                      {client.daysInSystem} <span className="text-sm font-normal text-[var(--text-secondary)]">days</span>
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Sessions
                      </p>
                    </div>
                    <p className="text-lg font-black text-[var(--text-primary)]">
                      {client.packageDetails?.sessionsCompleted || 0}/
                      <span className="text-[var(--text-secondary)]">{client.packageDetails?.totalSessions || 0}</span>
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Star className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Satisfaction
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-lg font-black text-[var(--text-primary)]">
                        {client.satisfactionScore ? Number(client.satisfactionScore).toFixed(1) : "N/A"}
                      </p>
                      {client.feedbackCount > 0 && (
                        <span className="text-xs text-[var(--text-tertiary)] font-medium">({client.feedbackCount})</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Next Session
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {(() => {
                        const upcomingTherapySessions = (
                          client.therapySessions || []
                        ).filter((s) => s.status === "scheduled");
                        if (upcomingTherapySessions.length > 0) {
                          const next = upcomingTherapySessions.sort(
                            (a, b) => new Date(a.date) - new Date(b.date),
                          )[0];
                          return new Date(next.date).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short" },
                          );
                        }

                        const upcomingConsultations = (
                          client.sessions || []
                        ).filter((s) => s.status === "scheduled");
                        if (upcomingConsultations.length > 0) {
                          const next = upcomingConsultations.sort(
                            (a, b) => new Date(a.date) - new Date(b.date),
                          )[0];
                          return new Date(next.date).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short" },
                          );
                        }

                        return "None Scheduled";
                      })()}
                    </p>
                  </div>
                </div>

                {/* Journey Timeline */}

                <div className="bg-white rounded-2xl border border-[var(--border-color)] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                      Client Journey
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                      <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-pulse"></span>
                      Current Phase: {client.stage}
                    </div>
                  </div>

                  <div className="relative pt-4 pb-12">
                    {/* Timeline Line */}
                    <div className="absolute top-12 left-[60px] right-[60px] h-1.5 bg-slate-100 rounded-full"></div>
                    <div
                      className="absolute top-12 left-[60px] h-1.5 bg-[var(--accent-color)] transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(111,29,86,0.3)]"
                      style={{
                        width: client.journey && client.journey.length > 0
                          ? `calc(${
                              (client.journey.findIndex((j) => j.current) !== -1
                                ? client.journey.findIndex((j) => j.current) + 0.5
                                : client.journey.filter((j) => j.completed).length) /
                              (client.journey.length - 1)
                            } * (100% - 120px))`
                          : "0px",
                      }}
                    ></div>

                    {/* Timeline Stages */}
                    <div className="relative flex justify-between">
                      {(client.journey || []).map((stage, index) => (
                        <div key={index} className="flex flex-col items-center" style={{ width: '120px' }}>
                          <div
                            className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center relative z-10 transition-all duration-500 shadow-xl ${
                              stage.completed
                                ? "bg-[var(--accent-color)] border-white text-white rotate-0"
                                : stage.current
                                  ? "bg-white border-[var(--accent-color)] text-[var(--accent-color)] scale-110 -rotate-3"
                                  : "bg-white border-slate-100 text-slate-300"
                            }`}
                          >
                            {stage.completed ? (
                              <Check className="w-8 h-8 font-black" />
                            ) : stage.current ? (
                              <Clock className="w-8 h-8 animate-pulse" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                            )}
                          </div>

                          <div className="mt-6 text-center">
                            <p className={`text-sm font-black leading-tight ${
                                stage.completed || stage.current ? "text-[var(--text-primary)]" : "text-slate-400"
                              }`}
                            >
                              {stage.stage}
                            </p>
                            {stage.date && (
                              <p className="text-xs font-bold text-[var(--accent-color)] mt-1.5 opacity-80 bg-[var(--accent-color)]/5 px-2 py-0.5 rounded-full inline-block">
                                {stage.date}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Two Column Layout */}

                <div className="grid grid-cols-3 gap-6">
                  {/* Left Column - 2/3 width */}

                  <div className="col-span-2 space-y-6">
                    {/* Personal Information */}

                    <div className="bg-white rounded-2xl border border-[var(--border-color)] p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                          Personal Information
                        </h2>

                        <Link
                          href={`/dashboard/clients/edit?id=${uuid}`}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-sm font-bold flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Details
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Full Name
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.name}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Age
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.age} years old
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Email Address
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.email}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Phone Number
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.phone}
                          </p>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Residential Address
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {[client.address, client.postcode].filter(Boolean).join(", ") || "Not provided"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Gender
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.gender}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Ethnicity
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.ethnicity}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Sexual Orientation
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.sexualOrientation}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Voicemail Permission
                          </p>
                          <p className="text-base font-bold text-[var(--text-primary)]">
                            {client.voicemailPermission}
                          </p>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Source
                          </p>
                          <p className="text-base font-bold text-slate-800">
                            {client.howHeardAbout}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Information */}

                    <div className="bg-white rounded-2xl border border-[var(--border-color)] p-8 shadow-sm">
                      <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight mb-8">
                        Clinical Information
                      </h2>

                      <div className="space-y-8">
                        <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-4">
                            Primary Issues / Concerns
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {client.primaryIssues.map((issue) => (
                              <span
                                key={issue}
                                className="px-4 py-1.5 bg-white text-rose-600 text-xs font-black rounded-full border border-rose-200 shadow-sm uppercase tracking-wide"
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3 px-1">
                            Additional Details
                          </p>
                          <p className="text-sm font-medium text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed italic">
                            "{client.additionalDetails || "No additional details provided."}"
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-5 rounded-2xl border border-slate-100 group transition-colors hover:border-indigo-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                              Medication
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {client.medication || "None recorded"}
                            </p>
                          </div>

                          <div className="p-5 rounded-2xl border border-slate-100 group transition-colors hover:border-indigo-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                              Disabilities / Impairments
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {client.disabilities || "None recorded"}
                            </p>
                          </div>

                          <div className="p-5 rounded-2xl border border-rose-100 group transition-colors hover:bg-rose-50/30">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-2">
                              Risk Flags
                            </p>
                            <p className="text-sm font-bold text-rose-700">
                              {client.riskFlags || "No risks identified"}
                            </p>
                          </div>

                          <div className="p-5 rounded-2xl border border-slate-100 group transition-colors hover:border-indigo-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                              Substance Misuse
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {client.substanceMisuse || "None recorded"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CORE-34 Assessment Section */}
                    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] overflow-hidden">
                      <button
                        onClick={() => setShowAssessment(!showAssessment)}
                        className="w-full flex items-center justify-between p-6 hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <ClipboardList className="w-5 h-5 text-[var(--purple-primary)]" />
                          </div>
                          <div className="text-left">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                              CORE-34 Assessment
                            </h2>
                            <p className="text-sm text-[var(--text-tertiary)]">
                              {Object.keys(client.core34Answers || {}).length}{" "}
                              of 34 questions answered
                            </p>
                          </div>
                        </div>
                        {showAssessment ? (
                          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                        )}
                      </button>

                      {showAssessment && (
                        <div className="p-6 pt-0 border-t border-[var(--border-color)]">
                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 mt-6 custom-scrollbar">
                            {core34Questions.map((question, index) => {
                              const answer = client.core34Answers?.[index];
                              const isRiskItem = [5, 8, 15, 23, 33].includes(
                                index,
                              ); // 0-based indices for 6, 9, 16, 24, 34

                              return (
                                <div
                                  key={index}
                                  className={`p-4 rounded-xl border ${
                                    isRiskItem &&
                                    (answer === "Often" ||
                                      answer === "Most or all the time")
                                      ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
                                      : "bg-[var(--bg-secondary)] border-[var(--border-color)]"
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-[var(--text-tertiary)]">
                                          Question {index + 1}
                                        </span>
                                        {isRiskItem && (
                                          <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                            Risk Item
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                                        {question}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span
                                        className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${
                                          !answer
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                                            : answer === "Not at all"
                                              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                              : answer === "Only occasionally"
                                                ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                : answer === "Sometimes"
                                                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                                                  : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                        }`}
                                      >
                                        {answer || "Unanswered"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Availability */}

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Availability Schedule
                      </h2>

                      <div className="space-y-3">
                        {Array.isArray(client.availability) &&
                        client.availability.length > 0 ? (
                          client.availability.map((avail) => (
                            <div
                              key={avail.day}
                              className="flex items-center gap-4 p-3 bg-[var(--purple-bg)] rounded-lg border border-[var(--purple-border)]"
                            >
                              <div className="w-28">
                                <p className="text-sm font-medium text-[var(--purple-primary)]">
                                  {avail.day
                                    ? avail.day.charAt(0).toUpperCase() +
                                      avail.day.slice(1).toLowerCase()
                                    : ""}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {avail.timeBlocks.map((block) => {
                                  const slotMap = {
                                    "morning-early": "10-11am",
                                    "morning-late": "11am-1pm",
                                    "afternoon-early": "1-4pm",
                                    "afternoon-late": "4-5pm",
                                    evening: "5-7pm",
                                  };
                                  const formattedBlock =
                                    slotMap[block] ||
                                    formatTimeSlotDisplay(block);
                                  return (
                                    <span
                                      key={block}
                                      className="px-3 py-1 bg-[var(--purple-primary)] text-white text-sm rounded-full"
                                    >
                                      {formattedBlock}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No availability information available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Matched Trainee Counsellor */}

                    {client.matchedTC && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                          Matched Trainee Counsellor
                        </h2>

                        {/* TC Profile Card */}

                        <div className="border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[var(--purple-bg)] flex items-center justify-center">
                                <User className="w-6 h-6 text-[var(--purple-primary)]" />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {client.matchedTC.name}
                                </p>

                                <p className="text-sm text-gray-600">
                                  {client.matchedTC.modality}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-[var(--purple-primary)]">
                                {client.matchedTC.matchScore !== null &&
                                client.matchedTC.matchScore !== undefined
                                  ? `${client.matchedTC.matchScore}%`
                                  : "N/A"}
                              </p>

                              <p className="text-xs text-gray-600">
                                Match Score
                              </p>
                            </div>
                          </div>

                          {(client.matchedTC.matchedByName ||
                            client.matchedTC.assignedDate) && (
                            <p className="text-xs text-gray-500 mb-2">
                              Matched by{" "}
                              <span className="font-medium text-gray-700">
                                {client.matchedTC.matchedByName || "Unknown"}
                              </span>
                              {client.matchedTC.assignedDate && (
                                <>
                                  {" "}
                                  on{" "}
                                  {new Date(
                                    client.matchedTC.assignedDate,
                                  ).toLocaleDateString("en-GB")}
                                </>
                              )}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">
                                Current Caseload
                              </p>

                              <p className="text-sm font-semibold text-gray-900">
                                {client.matchedTC.currentClients}/
                                {client.matchedTC.maxClients} clients
                              </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">
                                Contact
                              </p>

                              <p className="text-sm font-semibold text-gray-900">
                                {client.matchedTC.email}
                              </p>
                            </div>
                          </div>

                          {/* Other Clients */}

                          <div>
                            <p className="text-xs text-gray-600 mb-2">
                              Other Clients
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {client.matchedTC.otherClients.map((oc, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {oc.name}, {oc.age}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Match Score Breakdown */}

                        {Object.keys(client.matchedTC.matchBreakdown).length >
                        0 ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-3">
                              Why this practitioner was matched
                            </p>

                            <div className="space-y-3">
                              {Object.entries(
                                client.matchedTC.matchBreakdown,
                              ).map(([key, value]) => (
                                <div key={key}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-700 capitalize flex items-center gap-1.5">
                                      {value.matched ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                      ) : (
                                        <X className="w-3.5 h-3.5 text-red-500" />
                                      )}
                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>

                                    <span className="text-sm font-medium text-gray-900">
                                      {value.score}/{value.max} (
                                      {value.percentage}%)
                                    </span>
                                  </div>

                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-500 ${value.matched ? "bg-[var(--purple-primary)]" : "bg-red-400"}`}
                                      style={{
                                        width: `${value.percentage}%`,
                                      }}
                                    ></div>
                                  </div>

                                  {value.detail && (
                                    <p className="text-xs text-gray-500">
                                      {value.detail}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">
                            No automated match breakdown was recorded for
                            this assignment (assigned manually).
                          </p>
                        )}

                        {client.matchedTC.warningFlags.length > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

                              <div>
                                <p className="text-sm font-medium text-yellow-900 mb-1">
                                  Flagged during matching — assigned anyway
                                </p>

                                <ul className="text-sm text-yellow-800 list-disc list-inside space-y-0.5">
                                  {client.matchedTC.warningFlags.map(
                                    (flag) => (
                                      <li key={flag}>{flag}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {client.matchedTC.assignmentNotes && (
                          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Assignment Notes
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {client.matchedTC.assignmentNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment History */}

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Payment History
                      </h2>

                      <div className="space-y-3">
                        {client.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <CreditCard className="w-5 h-5 text-green-600" />
                                </div>

                                <div>
                                  <p className="font-medium text-gray-900">
                                    {payment.type}
                                  </p>

                                  <p className="text-sm text-gray-600">
                                    {payment.description}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">
                                  £{payment.amount}
                                </p>

                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {payment.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                              <span>{payment.date}</span>

                              <span>{payment.method}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">
                            Total Paid
                          </span>

                          <span className="text-2xl font-bold text-gray-900">
                            £
                            {client.payments.reduce(
                              (sum, p) => sum + p.amount,
                              0,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Session History */}

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Session History
                        </h2>

                        <button
                          onClick={() => setShowAddSessionModal(true)}
                          disabled={
                            actionLoading || client.status === "archived"
                          }
                          className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "#6f1d56" }}
                        >
                          <Plus className="w-4 h-4" />
                          Add Session
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Session
                              </th>

                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date & Time
                              </th>

                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                TC Name
                              </th>

                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Duration
                              </th>

                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>

                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-200">
                            {client.sessions.map((session) => (
                              <tr
                                key={session.sessionNumber}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  #{session.sessionNumber}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {session.date}
                                  <br />

                                  <span className="text-gray-500">
                                    {session.time}
                                  </span>
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {session.tcName}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {session.duration}
                                </td>

                                <td className="px-4 py-3">
                                  {getSessionStatusBadge(session.status)}
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleViewSession(session)}
                                      className="p-2 hover:bg-gray-100 rounded-lg"
                                      title="View Session Notes"
                                    >
                                      <Eye className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteSession(session)
                                      }
                                      disabled={
                                        actionLoading ||
                                        client.status === "archived"
                                      }
                                      className="p-2 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Delete Session"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Consultation Record */}

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Initial Consultation Record
                      </h2>

                      {client.consultation ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Date</p>

                              <p className="text-sm font-medium text-gray-900">
                                {client.consultation.date || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-1">Time</p>

                              <p className="text-sm font-medium text-gray-900">
                                {client.consultation.time || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Duration
                              </p>

                              <p className="text-sm font-medium text-gray-900">
                                {client.consultation.duration || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Conducted By
                            </p>

                            <p className="text-sm font-medium text-gray-900">
                              {client.consultation.conductedBy || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Consultation Notes
                            </p>

                            <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                              {client.consultation.notes ||
                                "No notes available"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm text-gray-600 mb-1">
                                Outcome
                              </p>

                              <p className="text-sm font-medium text-green-900">
                                {client.consultation.outcome || "N/A"}
                              </p>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-600 mb-1">
                                Recommended Service
                              </p>

                              <p className="text-sm font-medium text-blue-900">
                                {client.consultation.recommendedService ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500 italic">
                            No consultation record available yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Emergency Contact - Prominently Displayed */}
                    {client.emergencyContact &&
                      (client.emergencyContact.name ||
                        client.emergencyContact.phone) && (
                        <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h2 className="text-lg font-semibold text-red-900 mb-2">
                                Emergency Contact
                              </h2>
                              <p className="text-sm text-red-700 mb-3">
                                For duty of care and safeguarding concerns -
                                contact immediately if needed
                              </p>
                              <div className="space-y-2">
                                {client.emergencyContact.name && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-900">
                                      {client.emergencyContact.name}
                                    </span>
                                    {client.emergencyContact.relationship && (
                                      <span className="text-sm text-red-700">
                                        ({client.emergencyContact.relationship})
                                      </span>
                                    )}
                                  </div>
                                )}
                                {client.emergencyContact.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-red-600" />
                                    <a
                                      href={`tel:${client.emergencyContact.phone}`}
                                      className="text-sm font-medium text-red-900 hover:text-red-700 underline"
                                    >
                                      {client.emergencyContact.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Agreement Status */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Client Agreement
                      </h2>

                      {client.agreement ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            {client.agreement.status === "Signed" ? (
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              </div>
                            ) : client.agreement.status === "Sent" ? (
                              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                Agreement{" "}
                                {client.agreement.status === "Signed"
                                  ? "Signed"
                                  : client.agreement.status === "Sent"
                                    ? "Sent"
                                    : "Not Sent"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {client.agreement.status === "Signed"
                                  ? client.agreement.signedDate
                                    ? `Signed on ${client.agreement.signedDate}`
                                    : "Signed"
                                  : client.agreement.status === "Sent" &&
                                      client.agreement.sentDate
                                    ? `Sent on ${client.agreement.sentDate}`
                                    : "Agreement has not been sent yet"}
                              </p>
                            </div>
                          </div>

                          {client.agreement.status === "Signed" && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm text-green-800 font-medium mb-1">
                                ✓ Signature Verified
                              </p>
                              <p className="text-xs text-green-700">
                                Agreement was signed with signature upload on{" "}
                                {client.agreement.signedDate}
                              </p>
                              {client.agreement.signatureUrl && (
                                <a
                                  href={apiService.getStorageUrl(
                                    client.agreement.signatureUrl,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 underline"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Signature
                                </a>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-4">
                            {client.agreement.status === "Signed" && (
                              <button
                                onClick={handleDownloadAgreement}
                                disabled={actionLoading}
                                className="px-4 py-2 border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 font-medium flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                <Download className="w-4 h-4" />
                                {actionLoading ? "Downloading..." : "Download PDF Copy of Agreement"}
                              </button>
                            )}
                            {client.agreement.status !== "Signed" && (
                              <button
                                onClick={handleResendAgreement}
                                disabled={
                                  actionLoading || client.status === "archived"
                                }
                                className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-4 h-4" />
                                {client.agreement.status === "Not Sent"
                                  ? "Send Agreement"
                                  : "Resend Agreement"}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Agreement Not Sent
                              </p>
                              <p className="text-sm text-gray-600">
                                Send the agreement form to the client to proceed
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleResendAgreement}
                            disabled={
                              actionLoading || client.status === "archived"
                            }
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                            Send Agreement
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Notes Section with Tabs */}

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Notes & Activity
                        </h2>
                        {activeNotesTab === "admin" && (
                          <button
                            onClick={() => fetchAdminNotes()}
                            disabled={
                              actionLoading || client.status === "archived"
                            }
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh notes to see latest changes"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${actionLoading ? "animate-spin" : ""}`}
                            />
                            <span>Refresh</span>
                          </button>
                        )}
                      </div>

                      {/* Tabs */}

                      <div className="flex items-center gap-2 border-b border-gray-200 mb-4">
                        <button
                          onClick={() => setActiveNotesTab("consultation")}
                          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeNotesTab === "consultation"
                              ? "border-purple-600 text-purple-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Consultation Notes
                        </button>

                        <button
                          onClick={() => setActiveNotesTab("session")}
                          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeNotesTab === "session"
                              ? "border-purple-600 text-purple-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Session Notes
                        </button>

                        <button
                          onClick={() => setActiveNotesTab("admin")}
                          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeNotesTab === "admin"
                              ? "border-purple-600 text-purple-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Admin Notes
                        </button>

                        <button
                          onClick={() => setActiveNotesTab("clinical")}
                          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeNotesTab === "clinical"
                              ? "border-purple-600 text-purple-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Clinical Logs
                          {clinicalLogs.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] rounded-full">
                              {clinicalLogs.length}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Notes Content */}

                      <div className="space-y-4">
                        {activeNotesTab === "clinical" && (
                          <div className="space-y-4">
                            {clinicalLogs.length > 0 ? (
                              clinicalLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="border border-gray-200 rounded-lg p-5 bg-card hover:bg-hover-bg transition-colors group cursor-pointer"
                                  onClick={() => {
                                    setSelectedClinicalNoteId(log.id);
                                    setShowClinicalNoteModal(true);
                                  }}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-[#6f1d56] dark:text-purple-400">
                                        {log.type === 'risk_update' ? (
                                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        ) : log.type === 'block_summary' ? (
                                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                          <FileText className="w-5 h-5" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900 dark:text-gray-100">
                                          {log.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Submitted by {log.counsellor?.name || "Practitioner"} on {new Date(log.created_at).toLocaleDateString("en-GB")}
                                        </p>
                                      </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 group-hover:text-purple-600 transition-colors">
                                      <Eye className="w-5 h-5" />
                                    </button>
                                  </div>
                                  {log.content?.summary && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                                      "{log.content.summary}"
                                    </p>
                                  )}
                                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider">
                                    <span className={`px-2 py-0.5 rounded ${
                                      log.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                      {log.status}
                                    </span>
                                    <span className="text-gray-400">
                                      Session Date: {log.content?.session_date || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 italic">
                                  No clinical logs submitted for this client yet.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {activeNotesTab === "consultation" &&
                          (consultationNotes.length > 0 ? (
                            consultationNotes.map((note) => (
                              <div
                                key={note.id}
                                className="border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {note.author}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                      {note.date}
                                    </p>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-700">
                                  {note.content}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500 italic">
                                No consultation notes available yet
                              </p>
                            </div>
                          ))}

                        {activeNotesTab === "session" &&
                          (sessionNotes.length > 0 ? (
                            sessionNotes.map((note) => (
                              <div
                                key={note.id}
                                className="border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {note.author}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                      {note.session} • {note.date}
                                    </p>
                                  </div>

                                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <Eye className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>

                                <p className="text-sm text-gray-700">
                                  {note.content}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500 italic">
                                No session notes available yet
                              </p>
                            </div>
                          ))}

                        {activeNotesTab === "admin" && (
                          <>
                            {adminNotes.length > 0 ? (
                              adminNotes.map((note) => (
                                <div
                                  key={note.id}
                                  className="border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">
                                          {note.author}
                                        </p>
                                        {note.authorRole && (
                                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                            {note.authorRole}
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-sm text-gray-600">
                                        {note.isEdited
                                          ? `Edited: ${note.updatedDate}`
                                          : `Created: ${note.date}`}
                                        {note.isEdited && (
                                          <span className="text-gray-400 ml-1">
                                            (Created: {note.date})
                                          </span>
                                        )}
                                      </p>
                                      {note.authorEmail && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {note.authorEmail}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleEditNote(note)}
                                        disabled={client.status === "archived"}
                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDeleteNote(note.id)
                                        }
                                        disabled={
                                          actionLoading ||
                                          client.status === "archived"
                                        }
                                        className="p-2 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-sm text-gray-700">
                                    {note.content}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-sm text-gray-500 italic">
                                  No admin notes yet. Add your first note below.
                                </p>
                              </div>
                            )}

                            {/* Add New Admin Note */}
                            {editingNoteId ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <textarea
                                  value={editingNoteText}
                                  onChange={(e) =>
                                    setEditingNoteText(e.target.value)
                                  }
                                  placeholder="Edit admin note..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                                  rows={3}
                                ></textarea>
                                <div className="flex items-center justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(null);
                                      setEditingNoteText("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleUpdateNote}
                                    disabled={
                                      actionLoading ||
                                      client.status === "archived"
                                    }
                                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: "#6f1d56" }}
                                  >
                                    Update Note
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <textarea
                                  value={newNoteText}
                                  onChange={(e) =>
                                    setNewNoteText(e.target.value)
                                  }
                                  placeholder="Add a new admin note..."
                                  disabled={client.status === "archived"}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  rows={3}
                                ></textarea>
                                <div className="flex items-center justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      setNewNoteText("");
                                      setShowAddNoteModal(false);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleAddAdminNote}
                                    disabled={
                                      actionLoading ||
                                      client.status === "archived"
                                    }
                                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: "#6f1d56" }}
                                  >
                                    Add Note
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - 1/3 width - Package Summary */}

                  <div className="col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Package Summary
                      </h2>

                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-purple-600" />

                            <p className="font-medium text-purple-900">
                              {client.packageDetails.name}
                            </p>
                          </div>

                          <p className="text-sm text-purple-700">
                            {client.packageDetails.totalSessions} Sessions
                            Package
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Total Sessions
                            </span>

                            <span className="text-sm font-semibold text-gray-900">
                              {client.packageDetails.totalSessions}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Completed
                            </span>

                            <span className="text-sm font-semibold text-green-600">
                              {client.packageDetails.sessionsCompleted}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              DNA (Did Not Attend)
                            </span>

                            <span className="text-sm font-semibold text-red-600">
                              {client.packageDetails.sessionsDNA}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Remaining
                            </span>

                            <span className="text-sm font-semibold text-blue-600">
                              {client.packageDetails.sessionsRemaining}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">
                              Progress
                            </span>

                            <span className="text-sm font-semibold text-gray-900">
                              {client.packageDetails &&
                              client.packageDetails.totalSessions > 0
                                ? Math.round(
                                    (client.packageDetails.sessionsCompleted /
                                      client.packageDetails.totalSessions) *
                                      100,
                                  )
                                : 0}
                              %
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${client.packageDetails && client.packageDetails.totalSessions > 0 ? (client.packageDetails.sessionsCompleted / client.packageDetails.totalSessions) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Start Date
                            </span>

                            <span className="text-sm font-medium text-gray-900">
                              {client.packageDetails.startDate}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Expected End
                            </span>

                            <span className="text-sm font-medium text-gray-900">
                              {client.packageDetails.expectedEndDate}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Status
                            </span>

                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                client.packageDetails.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : client.packageDetails.status === "Completed"
                                    ? "bg-gray-100 text-gray-800"
                                    : client.packageDetails.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {client.packageDetails.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}

                      <div className="mt-6 space-y-2">
                        <button
                          onClick={handleProgressStage}
                          disabled={
                            actionLoading ||
                            client.stage === "Active Therapy" ||
                            client.status === "archived"
                          }
                          className="w-full py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "#6f1d56" }}
                        >
                          Progress to Next Stage
                        </button>

                        <button
                          onClick={handleBookNextSession}
                          disabled={
                            actionLoading || client.status === "archived"
                          }
                          className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Book Next Session
                        </button>

                        <button
                          onClick={handleDownloadReport}
                          disabled={
                            downloadingReport || client.status === "archived"
                          }
                          className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Archive Confirmation Modal */}
          <ConfirmationModal
            isOpen={showArchiveConfirmModal}
            onClose={() => setShowArchiveConfirmModal(false)}
            onConfirm={confirmArchive}
            title="Archive Client"
            message={`Are you sure you want to archive ${client?.name}? This will mark the client as archived.`}
            confirmText="Archive Client"
            cancelText="Cancel"
            type="warning"
            loading={actionLoading}
            confirmButtonColor="#f59e0b"
          />

          {/* Unarchive Confirmation Modal */}
          <ConfirmationModal
            isOpen={showUnarchiveConfirmModal}
            onClose={() => setShowUnarchiveConfirmModal(false)}
            onConfirm={confirmUnarchive}
            title="Unarchive Client"
            message={`Are you sure you want to unarchive ${client?.name}? This will mark the client as active.`}
            confirmText="Unarchive Client"
            cancelText="Cancel"
            type="info"
            loading={actionLoading}
            confirmButtonColor="#10b981"
          />

          {/* Delete Note Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={showDeleteNoteConfirmModal}
            onClose={() => {
              setShowDeleteNoteConfirmModal(false);
              setNoteToDelete(null);
            }}
            onConfirm={confirmDeleteNote}
            title="Delete Note"
            message="Are you sure you want to delete this note? This action cannot be undone."
            itemName="this note"
            confirmText="Delete Note"
            cancelText="Cancel"
            loading={actionLoading}
          />

          {/* Progress Stage Confirmation Modal */}
          <ConfirmationModal
            isOpen={showProgressStageConfirmModal}
            onClose={() => {
              setShowProgressStageConfirmModal(false);
              setNextStage(null);
            }}
            onConfirm={confirmProgressStage}
            title="Progress Client Stage"
            message={`Are you sure you want to progress ${client?.name} to "${nextStage}" stage?`}
            confirmText={`Progress to ${nextStage}`}
            cancelText="Cancel"
            type="info"
            loading={actionLoading}
            confirmButtonColor="#6f1d56"
          />

          {/* Delete Session Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={showDeleteSessionConfirmModal}
            onClose={() => {
              setShowDeleteSessionConfirmModal(false);
              setSessionToDelete(null);
            }}
            onConfirm={confirmDeleteSession}
            title="Delete Session"
            message={`Are you sure you want to delete Session #${sessionToDelete?.sessionNumber || "N/A"} scheduled for ${sessionToDelete?.date || "N/A"}? This action cannot be undone.`}
            itemName={`Session #${sessionToDelete?.sessionNumber || "N/A"}`}
            confirmText="Delete Session"
            cancelText="Cancel"
            loading={actionLoading}
          />
          <SessionNoteDetailsModal 
            noteId={selectedClinicalNoteId} 
            isOpen={showClinicalNoteModal}
            onClose={() => {
              setShowClinicalNoteModal(false);
              setSelectedClinicalNoteId(null);
            }} 
          />
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}

// Add Session Form Component
function AddSessionFormComponent({ client, onSubmit, onCancel, loading }) {
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [sendConfirmation, setSendConfirmation] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dateTime) {
      toast.error("Please select a date and time");
      return;
    }
    onSubmit({ dateTime, notes, sendConfirmation });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time
        </label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
          rows={3}
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="sendConfirmation"
          checked={sendConfirmation}
          onChange={(e) => setSendConfirmation(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="sendConfirmation" className="text-sm text-gray-700">
          Send confirmation email
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#6f1d56" }}
        >
          {loading ? "Adding..." : "Add Session"}
        </button>
      </div>
    </form>
  );
}

// Email Form Component
function EmailFormComponent({ clientEmail, onSubmit, onCancel, loading }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }
    onSubmit(subject, message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To
        </label>
        <input
          type="email"
          value={clientEmail || ""}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <RichTextEditor
          content={message}
          onChange={(html) => setMessage(html)}
          placeholder="Type your message here..."
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#6f1d56" }}
        >
          {loading ? "Sending..." : "Send Email"}
        </button>
      </div>
    </form>
  );
}
