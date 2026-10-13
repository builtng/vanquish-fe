"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Shield,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Video,
  Check,
  CalendarCheck,
  Send,
  History,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";
import apiService from "@/lib/api";
import { useModal } from "@/contexts/ModalContext";

export function resolveApplicationData(res) {
  if (!res) return null;
  if (res.id || res.uuid || res.name || res.email) {
    return res;
  }
  return res.data ?? res;
}

export default function QualifiedApplicationDetailPage({ initialApp = null } = {}) {
  const params = typeof useParams === "function" ? useParams() : null;
  const router = typeof useRouter === "function" ? useRouter() : null;
  const id = params?.id || initialApp?.id;

  const resolvedInitial = initialApp ? resolveApplicationData(initialApp) : null;
  const [loading, setLoading] = useState(!resolvedInitial);
  const [app, setApp] = useState(resolvedInitial);
  const [error, setError] = useState(null);

  const fetchApp = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiService.get(`/qc-applications/${id}`);
      const appData = resolveApplicationData(res);
      setApp(appData);
    } catch (err) {
      console.error("Failed to load QC application:", err);
      setError("Failed to load qualified counsellor application.");
      toast.error("Could not load application details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialApp) {
      setApp(resolveApplicationData(initialApp));
      setLoading(false);
      return;
    }
    fetchApp();
  }, [id, initialApp]);

  return (
    <PageGuard requirePrivilege="training_counsellors">
      <DashboardLayout>
        <QualifiedApplicationDetailView
          app={app}
          loading={loading}
          error={error}
          onRefresh={fetchApp}
          onBack={() => router?.push?.("/dashboard/qualified-applications")}
        />
      </DashboardLayout>
    </PageGuard>
  );
}

export function QualifiedApplicationDetailView({
  app,
  loading = false,
  error = null,
  onRefresh = null,
  onBack = null,
}) {
  const router = typeof useRouter === "function" ? useRouter() : null;
  const { confirm, prompt } = useModal ? (useModal() || {}) : {};
  const [actionLoading, setActionLoading] = useState(false);

  const renderStatusBadge = (status) => {
    const s = status || "New Application";
    let colorClass = "bg-blue-100 text-blue-800 border-blue-200";
    if (s === "Accepted") colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s === "Rejected") colorClass = "bg-rose-100 text-rose-800 border-rose-200";
    if (s === "Archived") colorClass = "bg-amber-100 text-amber-800 border-amber-200";
    if (s === "Stage 3 Interview Booked") colorClass = "bg-purple-100 text-purple-800 border-purple-200";
    if (s === "Interview Attended") colorClass = "bg-teal-100 text-teal-800 border-teal-200";
    if (s === "Interview No Show") colorClass = "bg-rose-100 text-rose-800 border-rose-200";
    if (s === "Induction Attended") colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s === "Induction No-Show") colorClass = "bg-amber-100 text-amber-800 border-amber-200";
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {s}
      </span>
    );
  };

  // Pipeline actions
  const handleSendInterviewLink = async () => {
    if (!app?.id) return;
    try {
      setActionLoading(true);
      await apiService.sendQcInterviewLink(app.id);
      toast.success("Stage 3 interview invitation link sent!");
      onRefresh?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to send interview link.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAttendance = async (attended) => {
    if (!app?.id) return;
    let notes = null;
    if (prompt) {
      notes = await prompt({
        title: attended ? "Interview Attendance Notes" : "Interview No-Show Notes",
        message: `Enter optional notes for the ${attended ? "attendance" : "no-show"}:`,
        required: false,
      });
    }

    try {
      setActionLoading(true);
      await apiService.recordQcAttendance(app.id, attended, notes);
      toast.success(
        attended
          ? "Interview attendance recorded!"
          : "Interview marked as no-show. Notification email sent."
      );
      onRefresh?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to record interview attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!app?.id) return;
    let inductionDate = null;
    if (decision === "Accepted") {
      if (prompt) {
        inductionDate = await prompt({
          title: "Confirm Induction",
          message: "Confirm Induction Date:",
          defaultValue: app.induction_date || "Monday, 19th January, 10:00am",
        });
        if (!inductionDate) return;
      } else {
        inductionDate = app.induction_date || "Monday, 19th January, 10:00am";
      }
    }

    let notes = null;
    if (prompt) {
      notes = await prompt({
        title: "Decision Review Notes",
        message: "Enter internal review notes:",
        required: false,
      });
    }

    try {
      setActionLoading(true);
      await apiService.makeQcDecision(app.id, decision, inductionDate, notes);
      toast.success(`Candidate ${decision}! Induction invite sent.`);
      onRefresh?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to record decision.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInductionInvite = async () => {
    if (!app?.id) return;
    let inductionDate = app.induction_date;
    if (prompt) {
      inductionDate = await prompt({
        title: "Send Induction Invite",
        message: "Confirm Induction Date:",
        defaultValue: app.induction_date || "Monday, 19th January, 10:00am",
      });
      if (!inductionDate) return;
    }

    try {
      setActionLoading(true);
      await apiService.sendQcInductionInvite(app.id, inductionDate);
      toast.success("Induction invitation email sent!");
      onRefresh?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to send induction invite.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInductionAttendance = async (attended) => {
    if (!app?.id) return;
    let notes = null;
    if (prompt) {
      notes = await prompt({
        title: attended ? "Induction Attended" : "Induction No-Show",
        message: "Enter induction notes:",
        required: false,
      });
    }

    try {
      setActionLoading(true);
      await apiService.recordQcInductionAttendance(app.id, attended, notes);
      toast.success(
        attended ? "Induction attendance recorded!" : "Marked as induction no-show. Email sent."
      );
      onRefresh?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to record induction attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === app?.status) return;

    if (newStatus === "Stage 3 Interview Booked") {
      return handleSendInterviewLink();
    }
    if (newStatus === "Interview Attended") {
      return handleAttendance(true);
    }
    if (newStatus === "Interview No Show") {
      return handleAttendance(false);
    }
    if (newStatus === "Accepted") {
      return handleDecision("Accepted");
    }
    if (newStatus === "Rejected") {
      return handleDecision("Rejected");
    }
    if (newStatus === "Induction Attended") {
      return handleInductionAttendance(true);
    }
    if (newStatus === "Induction No-Show") {
      return handleInductionAttendance(false);
    }

    try {
      setActionLoading(true);
      await apiService.updateQcApplicationStatus(app.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      onRefresh?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const prevWork = app?.previous_vanquish_work || app?.answers?.previous_vanquish_work;
  const areasToImprove = app?.areas_to_improve || app?.answers?.areas_to_improve;
  const previousSubmissions = app?.previous_submissions || [];

  return (
    <>
      <DashboardHeader
        title={app ? `QC-APP-${String(app.id).padStart(4, "0")} — ${app.name}` : "Application Details"}
        subtitle="Qualified Counsellor Application"
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Link
          href="/dashboard/qualified-applications"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-sm">Loading application details...</p>
          </div>
        ) : error || !app ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-semibold">{error || "Application not found"}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {/* Top Summary */}
            <div className="p-6 bg-gradient-to-r from-purple-50/60 to-transparent">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{app.name}</h2>
                    {renderStatusBadge(app.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    QC-APP-{String(app.id).padStart(4, "0")} • Submitted{" "}
                    {app.created_at ? new Date(app.created_at).toLocaleString("en-GB") : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600">Stage:</label>
                    <select
                      value={app.status || "Submitted"}
                      onChange={handleStatusChange}
                      disabled={actionLoading}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Submitted">Submitted / New</option>
                      <option value="Stage 3 Interview Booked">Stage 3 Interview Booked</option>
                      <option value="Interview Attended">Interview Attended</option>
                      <option value="Interview No Show">Interview No Show</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Induction Attended">Induction Attended</option>
                      <option value="Induction No-Show">Induction No-Show</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <button
                    onClick={() => router?.push?.("/dashboard/qualified-applications")}
                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    All Applications
                  </button>
                </div>
              </div>

              {/* ───────────────── PIPELINE ACTION BUTTONS ───────────────── */}
              <div className="mt-6 pt-4 border-t border-purple-100 flex flex-wrap gap-2.5 items-center">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider mr-1">
                  Pipeline Actions:
                </span>

                <button
                  onClick={handleSendInterviewLink}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {app.status === "Stage 3 Interview Booked" ? "Re-send Interview Link" : "Send Interview Link"}
                </button>

                <button
                  onClick={() => handleAttendance(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100 transition disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Mark Interview Attended
                </button>

                <button
                  onClick={() => handleAttendance(false)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" /> Interview Not Attended
                </button>

                <button
                  onClick={() => handleDecision("Accepted")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Accept & Invite to Induction
                </button>

                <button
                  onClick={handleSendInductionInvite}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 transition disabled:opacity-50"
                >
                  <CalendarCheck className="w-3.5 h-3.5" /> Induction Invite
                </button>

                <button
                  onClick={() => handleInductionAttendance(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-800 border border-green-300 hover:bg-green-100 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Induction Attended
                </button>

                <button
                  onClick={() => handleInductionAttendance(false)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" /> Induction Not Attended
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-purple-100/60 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span>{app.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>{app.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>
                    {[
                      app.answers?.registered_address || app.registered_address,
                      app.answers?.registered_city || app.registered_city,
                      app.answers?.registered_postcode || app.registered_postcode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* ───────────────── INTERVIEW & INDUCTION PIPELINE DETAILS ───────────────── */}
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-purple-600" />
                Interview & Induction Pipeline Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interview Stage Card */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Stage 3: Interview
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {app.interview_data?.attendance
                        ? (app.interview_data.attendance.attended ? "Attended" : "No-Show")
                        : (app.status === "Stage 3 Interview Booked" ? "Booked" : "Not Booked")}
                    </span>
                  </div>

                  {app.interview_data?.trafft && (
                    <div className="text-xs text-gray-600 space-y-1 bg-white p-3 rounded-lg border border-gray-100">
                      <p><span className="font-semibold text-gray-700">Appointment ID:</span> {app.interview_data.trafft.appointment_id}</p>
                      {app.interview_data.trafft.zoom_link && (
                        <p>
                          <span className="font-semibold text-gray-700">Zoom Link:</span>{" "}
                          <a
                            href={app.interview_data.trafft.zoom_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 underline"
                          >
                            {app.interview_data.trafft.zoom_link}
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  {app.interview_data?.attendance && (
                    <div className={`text-xs p-3 rounded-lg border ${app.interview_data.attendance.attended ? "bg-teal-50 border-teal-200 text-teal-900" : "bg-rose-50 border-rose-200 text-rose-900"}`}>
                      <p className="font-semibold">
                        Interview {app.interview_data.attendance.attended ? "Attended" : "Not Attended (No-Show)"}
                      </p>
                      {app.interview_data.attendance.attended_at && (
                        <p className="text-[11px] opacity-80 mt-0.5">Recorded: {new Date(app.interview_data.attendance.attended_at).toLocaleString("en-GB")}</p>
                      )}
                      {app.interview_data.attendance.notes && (
                        <p className="mt-1 text-xs">Notes: {app.interview_data.attendance.notes}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Induction Stage Card */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Stage 4: Induction & Acceptance
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {app.onboarding_data?.checklist?.induction_attended
                        ? "Attended"
                        : (app.status === "Induction No-Show" ? "No-Show" : (app.status === "Accepted" ? "Invited" : "Pending"))}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 space-y-1.5 bg-white p-3 rounded-lg border border-gray-100">
                    <p>
                      <span className="font-semibold text-gray-800">Induction Date:</span>{" "}
                      {app.induction_date || app.onboarding_data?.induction_date || "To be confirmed"}
                    </p>
                    {app.interview_data?.decision && (
                      <p>
                        <span className="font-semibold text-gray-800">Decision Outcome:</span>{" "}
                        {app.interview_data.decision.outcome || "Pending"}
                      </p>
                    )}
                    {app.placement_response_token && (
                      <p className="text-[11px] text-gray-500">
                        <span className="font-medium text-gray-700">Response Token:</span> Active
                      </p>
                    )}
                  </div>

                  {app.onboarding_data?.checklist?.induction_attended !== undefined && (
                    <div className={`text-xs p-3 rounded-lg border ${app.onboarding_data.checklist.induction_attended ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
                      <p className="font-semibold">
                        Induction {app.onboarding_data.checklist.induction_attended ? "Attended" : "Not Attended (No-Show)"}
                      </p>
                      {app.onboarding_data.induction_notes && (
                        <p className="mt-1 text-xs">Notes: {app.onboarding_data.induction_notes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ───────────────── PREVIOUS APPLICATIONS (INDEPENDENT) ───────────────── */}
            {previousSubmissions.length > 0 && (
              <div className="p-6 space-y-3 bg-purple-50/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-600" />
                    Other Applications for this Applicant ({previousSubmissions.length})
                  </h3>
                  <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                    Move through stages independently
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {previousSubmissions.map((prev) => (
                    <div
                      key={prev.id}
                      className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs">
                            QC-APP-{String(prev.id).padStart(4, "0")}
                          </span>
                          {renderStatusBadge(prev.status)}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Submitted {prev.created_at ? new Date(prev.created_at).toLocaleDateString("en-GB") : "-"}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/qualified-applications/${prev.id}`}
                        className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition"
                      >
                        View & Manage
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ───────────────── PREVIOUSLY WORKED WITH VANQUISH ───────────────── */}
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Previously Worked With Vanquish
              </h3>
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/80">
                <div className="text-sm font-semibold text-gray-900">
                  {prevWork || "N/A"}
                </div>
                {areasToImprove && (
                  <div className="mt-3 pt-3 border-t border-purple-100">
                    <span className="text-xs font-semibold text-purple-900 block mb-1">
                      Areas to Improve / Development Details:
                    </span>
                    <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {areasToImprove}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modalities & Experience */}
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                Modalities & Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Modalities</span>
                  <p className="text-gray-800 font-medium">
                    {Array.isArray(app.answers?.modalities)
                      ? app.answers.modalities.join(", ")
                      : app.answers?.modalities || "N/A"}
                  </p>
                  {(app.other_modalities || app.answers?.other_modalities) && (
                    <p className="text-xs text-gray-600 mt-2">
                      <span className="font-semibold text-gray-700">Other:</span>{" "}
                      {app.other_modalities || app.answers?.other_modalities}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Experience Topics</span>
                  <p className="text-gray-800 font-medium">
                    {Array.isArray(app.answers?.experience_areas)
                      ? app.answers.experience_areas.join(", ")
                      : app.answers?.experience_areas || "N/A"}
                  </p>
                  {(app.other_experience_areas || app.answers?.other_experience_areas) && (
                    <p className="text-xs text-gray-600 mt-2">
                      <span className="font-semibold text-gray-700">Other:</span>{" "}
                      {app.other_experience_areas || app.answers?.other_experience_areas}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Attached Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Qualification", path: app.qualification_document },
                  { label: "DBS Certificate", path: app.dbs_certificate_qualified },
                  { label: "Valid ID", path: app.valid_id_document },
                  { label: "Professional Membership", path: app.professional_membership },
                  { label: "Self-Employment Proof", path: app.self_employment_proof },
                  { label: "Indemnity Insurance", path: app.insurance_qualified },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="p-3 border border-gray-100 rounded-xl flex items-center justify-between text-xs bg-gray-50/50"
                  >
                    <span className="font-medium text-gray-700">{doc.label}</span>
                    {doc.path ? (
                      <a
                        href={apiService.getStorageUrl(doc.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-purple-700 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Not attached</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Signature */}
            {app.signature && (
              <div className="p-6 space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                  Signature
                </h3>
                <img
                  src={app.signature}
                  alt="Applicant Signature"
                  className="max-h-24 border border-gray-200 rounded-lg p-2 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Signed Date: {app.signature_date || "N/A"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
