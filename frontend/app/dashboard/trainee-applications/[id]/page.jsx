"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft, User, Briefcase, BookOpen, AlertCircle, Clock,
  CheckCircle, XCircle, Trash2, Mail, Phone, MapPin, FileText,
  Heart, Shield, Calendar, Users, Download, ExternalLink, Eye,
  ChevronDown, ChevronUp, GraduationCap, MessageSquare, Video,
  CalendarCheck, ClipboardCheck, History
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";
import apiService from "@/lib/api";
import { useModal } from "@/contexts/ModalContext";
import EmbeddedZoomMeeting from "@/components/EmbeddedZoomMeeting";
import { StatusBadge, SearchableStatusSelect } from "@/components/StatusBadge";

// ── Helpers ────────────────────────────────────────────────────────────────────

function Section({ icon: Icon, title, iconClass = "text-purple-500", children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-sm border border-gray-100 dark:border-[var(--card-border)] overflow-hidden transition-all hover:shadow-md">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconClass}`} />
          <h2 className="text-base font-bold text-gray-900 dark:text-[var(--text-primary)]">{title}</h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

function Field({ label, value, isLong = false, isLink = false }) {
  if (!value) return (
    <div>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm text-gray-300 italic">Not provided</div>
    </div>
  );
  return (
    <div>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      {isLong ? (
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
          {value}
        </div>
      ) : isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View / Download
        </a>
      ) : (
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</div>
      )}
    </div>
  );
}

function Badge({ value, yesClass = "bg-green-50 text-green-700 border-green-100", noClass = "bg-red-50 text-red-700 border-red-100" }) {
  if (!value) return <span className="text-sm text-gray-300 italic">Not provided</span>;
  const isYes = /^yes/i.test(value);
  const isNo = /^no$/i.test(value);
  const cls = isYes ? yesClass : isNo ? noClass : "bg-blue-50 text-blue-700 border-blue-100";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${cls}`}>{value}</span>
  );
}

function DocLink({ label, url, icon: Icon = FileText }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${url ? 'bg-green-50 border-green-100 hover:bg-green-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${url ? 'text-green-600' : 'text-gray-400'}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {url ? (
          <span className="px-1.5 py-0.5 rounded-full bg-green-600 text-white text-[9px] font-bold uppercase">Uploaded</span>
        ) : (
          <span className="px-1.5 py-0.5 rounded-full bg-gray-300 text-white text-[9px] font-bold uppercase">Missing</span>
        )}
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 bg-white border border-green-200 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-50 transition-colors">
          <Download className="w-3 h-3" /> View
        </a>
      )}
    </div>
  );
}

function PaperworkToggle({ label, status, onToggle }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <button 
        onClick={() => onToggle(!status)}
        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${status ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white border border-gray-200 text-gray-400'}`}
      >
        {status ? 'DONE ✓' : 'PENDING'}
      </button>
    </div>
  );
}

function AvailabilitySchedule({ value }) {
  if (!value) return <div className="text-sm text-gray-300 italic">Not provided</div>;
  
  let schedule = null;
  try {
    schedule = typeof value === 'string' ? JSON.parse(value) : value;
  } catch (e) {
    // If not JSON, just show as string
    return <div className="text-sm text-gray-800 dark:text-gray-200">{value}</div>;
  }

  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    return <div className="text-sm text-gray-800 dark:text-gray-200">{String(value)}</div>;
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const hasData = days.some(day => schedule[day] && schedule[day].length > 0);
  if (!hasData) return <div className="text-sm text-gray-800 dark:text-gray-200">{String(value)}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {days.map(day => {
        const slots = schedule[day];
        if (!slots || slots.length === 0) return null;
        
        return (
          <div key={day} className="bg-gray-50 dark:bg-gray-800/20 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 border-b border-purple-100 dark:border-purple-900/30 pb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {day}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {slots.map((slot, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md text-[11px] font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────────

export default function TraineeApplicationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [zoomRoomConfig, setZoomRoomConfig] = useState(null);
  const { prompt, confirm } = useModal();

  const fetchApplication = async () => {
    try {
      const data = await apiService.getTraineeApplication(id);
      setApplication(data);
    } catch {
      toast.error("Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  const enterMeetingRoom = async () => {
    try {
      const resp = await apiService.get(`/api/trainee-applications/${id}/zoom-signature`);
      if (resp.error) {
        toast.error(resp.error);
        return;
      }
      setZoomRoomConfig({
        signature: resp.signature,
        sdkKey: resp.sdk_key,
        meetingNumber: resp.meeting_number,
        password: resp.password,
        userName: "Vanquish Admin",
        userEmail: "admin@vanquish.com"
      });
    } catch (err) {
      toast.error("Failed to initialize secure room. Check SDK credentials.");
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await apiService.getTraineeSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to fetch trainee settings", err);
    }
  };

  useEffect(() => { 
    fetchApplication(); 
    fetchSettings();
  }, [id]);

  const updateStatus = async (newStatus, inductionDate = null) => {
    try {
      await apiService.updateTraineeApplicationStatus(id, newStatus, inductionDate);
      toast.success(`Status updated to ${newStatus}`); 
      fetchApplication();
    } catch { toast.error("Failed to update status."); }
  };

  const handleStatusChange = async (newStatus) => {
    // Dispatch to specialized functions if they exist for the status
    switch (newStatus) {
      case 'Stage 2 Invited':
        return sendInviteManual();
      
      case 'Stage 3 Interview Booked':
        return sendStageThreeInvite();

      case 'Interview Attended':
        return handleAttendance(true);
      
      case 'Interview No Show':
        return handleAttendance(false);

      case 'Accepted':
        return handleDecision('Accepted');

      case 'Rejected':
        // For Rejection, we use handleDecision to capture notes
        return handleDecision('Rejected');

      case 'Hold':
        // Capture notes for hold decision
        return handleDecision('Hold');

      case 'Induction Attended':
        return handleInductionAttendance(true);
      
      case 'Induction No-Show':
        return handleInductionAttendance(false);

      case 'Active Placement':
        return handleFinalizePlacement();

      default:
        // Regular status update for all other stages
        updateStatus(newStatus);
    }
  };

  const handleAttendance = async (attended) => {
    const notes = await prompt({
      title: attended ? "Attendance Notes" : "No-Show Notes",
      message: `Enter optional notes for the ${attended ? 'attendance' : 'no-show'}:`,
      required: false
    });
    try {
      await apiService.recordTraineeAttendance(id, attended, notes);
      toast.success("Attendance recorded!"); 
      fetchApplication();
    } catch { toast.error("Failed to record attendance."); }
  };

  const handleDecision = async (decision) => {
    let induction_date = null;
    if (decision === 'Accepted') {
      induction_date = await prompt({
        title: "Confirm Induction",
        message: "Confirm Induction Date:",
        defaultValue: application.induction_date || "Monday, 19th January, 10:00am"
      });
      if (!induction_date) return;
    }
    const notes = await prompt({
      title: "Review Notes",
      message: `Enter final review notes (internal only):`,
      required: false
    });
    try {
      await apiService.makeTraineeDecision(id, decision, induction_date, notes || "");
      toast.success(`Candidate ${decision}!`); 
      fetchApplication();
    } catch { toast.error("Failed to record decision."); }
  };

  const sendStageThreeInvite = async () => {
    try {
      await apiService.sendTraineeStageThreeInvite(id);
      toast.success("Stage 3 invitation (Trafft) sent!"); 
      fetchApplication();
    } catch { toast.error("An error occurred."); }
  };

  const handlePaperworkUpdate = async (document_key, status) => {
    try {
      await apiService.updateTraineePaperwork(id, document_key, status);
      toast.success("Paperwork updated"); 
      fetchApplication();
    } catch { toast.error("Failed to update status."); }
  };

  const handleInductionAttendance = async (attended) => {
    const notes = await prompt({
      title: "Induction Notes",
      message: "Enter induction notes:",
      required: false
    });
    try {
      await apiService.recordTraineeInductionAttendance(id, attended, notes || "");
      toast.success(`Induction ${attended ? 'Attended' : 'No-Show'} recorded`); 
      fetchApplication();
    } catch { toast.error("An error occurred."); }
  };

  const handlePortalInvite = async () => {
    try {
      await apiService.sendTraineePortalInvite(id);
      toast.success("SuiteDash invitation sent!"); 
      fetchApplication();
    } catch { toast.error("Failed to send invite."); }
  };

  const handleFinalizePlacement = async () => {
    const ok = await confirm({
      title: "Finalize Placement",
      message: "Confirm this trainee has completed all onboarding and is ready for matching?",
      confirmText: "Yes, Finalize",
      type: "warning"
    });
    if (!ok) return;
    try {
      await apiService.finalizeTraineePlacement(id);
      toast.success("PLACEMENT ACTIVE! Congratulations."); 
      fetchApplication();
    } catch { toast.error("An error occurred."); }
  };

  const deleteApplication = async () => {
    const ok = await confirm({
      title: "Delete Application",
      message: "Are you sure you want to delete this application? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger"
    });
    if (!ok) return;
    try {
      await apiService.deleteTraineeApplication(id);
      toast.success("Application deleted."); 
      router.push('/dashboard/trainee-applications');
    } catch { toast.error("Failed to delete application."); }
  };

  const sendInviteManual = async () => {
    try {
      await apiService.sendTraineeInviteManual(id);
      toast.success("Stage 2 invitation sent!"); 
      fetchApplication();
    } catch (err) { 
      toast.error(err.message || "Failed to send invitation."); 
    }
  };


  const statusWorkflow = [
    'New Application', 'Stage 1 Complete', 'Stage 2 Invited', 'Stage 2 Video Submitted',
    'Stage 2 Approved', 'Stage 3 Interview Booked', 'Interview Attended', 'Interview No Show', 'Accepted', 'Induction Attended', 'Induction No-Show', 'Onboarding', 'Active Placement', 'Rejected', 'Hold'
  ];

  const docCount = application ? [
    application.doc_cv, application.doc_valid_id, application.doc_dbs_certificate,
    application.doc_prior_qualifications, application.doc_fitness_to_practise, application.doc_indemnity_insurance
  ].filter(Boolean).length : 0;

  if (loading) return (
    <PageGuard menuId="trainee-applications">
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center text-gray-500">Loading application details...</div>
      </DashboardLayout>
    </PageGuard>
  );
  if (!application) return (
    <PageGuard menuId="trainee-applications">
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center text-gray-500">Application not found.</div>
      </DashboardLayout>
    </PageGuard>
  );

  const getNextStage = (currentStatus) => {
    const sequence = [
      'New Application', 'Stage 1 Complete', 'Stage 2 Invited', 
      'Stage 2 Video Submitted', 'Stage 2 Approved', 'Stage 3 Interview Booked', 
      'Interview Attended', 'Accepted', 'Induction Attended', 
      'Onboarding', 'Active Placement'
    ];
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
      return sequence[currentIndex + 1];
    }
    return null;
  };

  const nextStage = getNextStage(application?.status);

  return (
    <PageGuard menuId="trainee-applications">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            actions={
              <div className="flex items-center gap-3">
                {nextStage && (
                  <button
                    onClick={() => handleStatusChange(nextStage)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" /> Next Stage: {nextStage}
                  </button>
                )}
                <button
                  onClick={async () => {
                    const newStatus = await prompt({
                      title: "Force Override Status",
                      message: "Select new status (use with caution):",
                      inputType: "select",
                      options: typeof statusWorkflow !== 'undefined' ? statusWorkflow : [
                        'New Application', 'Stage 1 Complete', 'Stage 2 Invited', 'Stage 2 Video Submitted',
                        'Stage 2 Approved', 'Stage 3 Interview Booked', 'Interview Attended', 'Interview No Show', 
                        'Accepted', 'Induction Attended', 'Induction No-Show', 'Onboarding', 'Active Placement', 'Rejected', 'Hold'
                      ]
                    });
                    if (newStatus) updateStatus(newStatus);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 transition-all font-medium text-sm"
                >
                  <AlertCircle className="w-4 h-4" /> Force Reset
                </button>
                {(application.status === 'New Application' || application.status === 'Stage 1 Complete') && (
                  <button
                    onClick={sendInviteManual}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm shadow-sm"
                  >
                    <Mail className="w-4 h-4" /> Send S2 Invite
                  </button>
                )}
                {application.status === 'Stage 2 Approved' && (
                  <button
                    onClick={sendStageThreeInvite}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm"
                  >
                    <CalendarCheck className="w-4 h-4" /> Send S3 Invite
                  </button>
                )}
                <button
                  onClick={deleteApplication}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            }
          >
            <div className="flex items-center gap-3">
              <Link href="/dashboard/trainee-applications" className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  {application.first_name} {application.last_name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <StatusBadge status={application.status} pulse />
                  {application.source === 'jotform' && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">JotForm</span>
                  )}
                  {docCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                      {docCount}/6 Docs
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DashboardHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">

            {/* Status Change Row */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-100 dark:border-[var(--card-border)] p-4 mb-6 flex flex-wrap items-center gap-3 shadow-sm">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 shrink-0">Update Status:</span>
              <div className="w-full sm:w-72">
                <SearchableStatusSelect
                  options={statusWorkflow}
                  value={application.status}
                  onChange={handleStatusChange}
                  size="sm"
                />
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                Submitted: {new Date(application.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {application.jotform_submitted_at && (
                  <span className="text-orange-500 ml-1">
                    (JotForm: {new Date(application.jotform_submitted_at).toLocaleDateString('en-GB')})
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">

              {/* ── Stage 2 Video ───────────────────────────────────────────── */}
              {/* ── Stage 2 Video ───────────────────────────────────────────── */}
              {application.video_url && (
                <Section icon={Video} title="Stage 2: Video Interview (HireVire)" iconClass="text-orange-500">
                  <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4 border-2 border-orange-100 shadow-inner">
                    <video src={application.video_url} controls className="w-full h-full object-contain" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleStatusChange('Stage 2 Approved')}
                      disabled={application.status === 'Stage 2 Approved'}
                      className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Approve Video & Invite to S3
                    </button>
                    <button onClick={() => handleStatusChange('Rejected')}
                      className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-all">
                      Reject Candidate
                    </button>
                  </div>
                  {application.interview_data?.hirevire?.review_url && (
                    <div className="mt-4 text-center">
                      <a href={application.interview_data.hirevire.review_url} target="_blank" rel="noreferrer" className="text-xs text-orange-600 hover:underline flex items-center justify-center gap-1">
                        <ExternalLink className="w-3 h-3" /> View Full HireVire Submission
                      </a>
                    </div>
                  )}
                </Section>
              )}

              {/* ── Stage 3 Interview Info ───────────────────────────────────── */}
              {(application.status === 'Stage 3 Interview Booked' || application.interview_data?.trafft) && (
                <Section icon={CalendarCheck} title="Stage 3: Face-to-Face Interview (Trafft)" iconClass="text-green-500">
                  <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Appointment ID</div>
                        <div className="text-sm font-bold text-gray-800 font-mono italic">{application.interview_data?.trafft?.appointment_id || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Scheduled At</div>
                        <div className="text-sm font-bold text-gray-800">
                          {application.interview_data?.trafft?.date} at {application.interview_data?.trafft?.time}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Interview Host</div>
                        <div className="text-sm font-bold text-gray-800">{application.interview_data?.trafft?.host_name || 'Vanquish Admin'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Duration</div>
                        <div className="text-sm font-bold text-gray-800">45 Minutes</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                      {application.interview_data?.trafft?.zoom_link ? (
                        settings?.zoom_mode === 'web_client' ? (
                          <a 
                            href={(() => {
                              const data = application.interview_data.trafft;
                              if (data.meeting_id) return `https://zoom.us/wc/${data.meeting_id}/join`;
                              
                              try {
                                const match = data.zoom_link.match(/\/j\/(\d+)/);
                                if (match) return `https://zoom.us/wc/${match[1]}/join`;
                              } catch (e) {}
                              
                              return data.zoom_link;
                            })()} 
                            target="_blank" rel="noreferrer" 
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 border-b-4 border-blue-800"
                          >
                            <ExternalLink className="w-6 h-6" /> Launch Zoom Web Client
                          </a>
                        ) : (
                          <button 
                            onClick={enterMeetingRoom}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl hover:shadow-purple-500/20 active:scale-95 border-b-4 border-purple-800"
                          >
                            <Video className="w-6 h-6" /> Enter Secure Virtual Room
                          </button>
                        )
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm font-medium italic">
                           <Video className="w-5 h-5 opacity-50" /> Secure Room Offline
                        </div>
                      )}
                    </div>
                  </div>

                  {zoomRoomConfig && (
                    <EmbeddedZoomMeeting 
                      meetingConfig={zoomRoomConfig} 
                      onClose={() => setZoomRoomConfig(null)} 
                    />
                  )}

                  {application.status === 'Stage 3 Interview Booked' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => handleAttendance(true)} 
                        className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <CheckCircle className="w-4 h-4" /> Candidate Attended
                      </button>
                      <button onClick={() => handleAttendance(false)} 
                        className="flex-1 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all">
                        Mark as No-Show
                      </button>
                    </div>
                  )}

                  {application.interview_data?.attendance && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${application.interview_data.attendance.attended ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Attendance Recorded</div>
                        <div className="text-sm text-gray-700 mt-1">
                          {application.interview_data.attendance.attended ? 'Candidate attended' : 'Candidate was a no-show'} on {new Date(application.interview_data.attendance.attended_at).toLocaleString()}
                        </div>
                        {application.interview_data.attendance.notes && (
                          <div className="mt-2 text-xs text-gray-500 italic bg-white p-2 rounded border border-gray-100">
                            Notes: {application.interview_data.attendance.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* ── Final Placement Decision ─────────────────────────────────── */}
              {(application.status === 'Interview Attended' || application.status === 'Interview No Show' || application.status === 'Accepted' || application.status === 'Hold' || application.status === 'Rejected') && (
                <Section icon={ClipboardCheck} title="Placement Decision" iconClass="text-purple-600">
                  {!application.interview_data?.decision ? (
                    <div className="space-y-6">
                      <p className="text-sm text-gray-500">The interview stage is complete. Please record the final placement decision for this candidate.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={() => handleStatusChange('Accepted')}
                          className="py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200">
                          Accept Placement
                        </button>
                        <button onClick={() => handleStatusChange('Hold')}
                          className="py-4 bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
                          Place on Hold
                        </button>
                        <button onClick={() => handleStatusChange('Rejected')}
                          className="py-4 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-all">
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                       <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 rounded-full ${application.status === 'Accepted' || application.status === 'Active Placement' ? 'bg-emerald-500' : 'bg-slate-600'} text-white`}>
                            {application.status === 'Accepted' || application.status === 'Active Placement' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-purple-900">Final Decision: {application.status}</h3>
                            <p className="text-xs text-purple-600 font-medium">Recorded on {new Date(application.interview_data.decision.decided_at).toLocaleDateString()}</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          {application.induction_date && (
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Confirmed Induction</div>
                              <div className="text-sm font-bold text-gray-800">{application.induction_date}</div>
                            </div>
                          )}
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Internal Notes</div>
                            <div className="text-sm text-gray-600 italic whitespace-pre-wrap">{application.interview_data.decision.notes || 'No notes provided.'}</div>
                          </div>
                       </div>

                        {application.status !== 'Accepted' && application.status !== 'Rejected' && application.status !== 'Active Placement' && (
                          <div className="mt-6 pt-6 border-t border-purple-100 flex gap-3">
                             <button onClick={() => handleStatusChange('Accepted')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Rescind & Accept</button>
                             <button onClick={() => handleStatusChange('Rejected')} className="px-6 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold">Rescind & Reject</button>
                          </div>
                        )}
                    </div>
                  )}
                </Section>
              )}

              {/* ── Stage 4 Onboarding ───────────────────────────────────────── */}
              {(application.status === 'Accepted' || application.onboarding_data) && (
                <Section icon={History} title="Stage 4: Placement Onboarding" iconClass="text-violet-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Paperwork Tracking */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Required Paperwork
                      </h4>
                      <div className="space-y-3">
                        <PaperworkToggle 
                          label="4-Way Agreement Signed & Returned" 
                          status={application.onboarding_data?.checklist?.four_way_agreement} 
                          onToggle={(s) => handlePaperworkUpdate('four_way_agreement', s)} 
                        />
                        <PaperworkToggle 
                          label="Personal Therapy Form (JotForm)" 
                          status={application.onboarding_data?.checklist?.therapy_form} 
                          onToggle={(s) => handlePaperworkUpdate('therapy_form', s)} 
                        />
                      </div>
                    </div>

                    {/* Induction Tracking */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Induction Session
                      </h4>
                      <div className="space-y-4">
                        <div className="text-sm font-bold text-gray-800">
                          Scheduled: {application.induction_date || 'TBC'}
                        </div>
                        {application.status !== 'Induction Attended' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleInductionAttendance(true)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Mark Attended</button>
                            <button onClick={() => handleInductionAttendance(false)} className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50">Mark No-Show</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded-lg text-xs font-bold">
                            <CheckCircle className="w-4 h-4" /> Induction Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Portal & Finalization */}
                  <div className="border-t border-dashed border-gray-200 pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      {!application.portal_access_granted ? (
                        <button 
                          onClick={handlePortalInvite}
                          className="w-full md:w-auto px-8 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Mail className="w-5 h-5" /> Grant Portal Access (SuiteDash)
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center gap-3 bg-violet-50 p-4 rounded-xl border border-violet-100">
                          <div className="p-2 bg-violet-100 text-violet-700 rounded-lg"><Shield className="w-5 h-5" /></div>
                          <div>
                            <div className="text-xs font-bold text-violet-900">Portal Access Granted</div>
                            <div className="text-[10px] text-violet-600 font-medium">Invitation sent on {new Date(application.onboarding_data?.portal_invite_sent_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      )}

                      {application.status !== 'Active Placement' ? (
                        <button 
                          onClick={handleFinalizePlacement}
                          disabled={!application.portal_access_granted}
                          className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:bg-gray-200"
                        >
                          Finalize: Make Active Placement
                        </button>
                      ) : (
                        <div className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg animate-bounce">
                          <CheckCircle className="w-5 h-5" /> ACTIVE PLACEMENT
                        </div>
                      )}
                    </div>
                  </div>
                </Section>
              )}

              {/* ── Documents ───────────────────────────────────────────────── */}
              <Section icon={FileText} title="Document Uploads" iconClass="text-blue-500">
                <div className="space-y-2.5">
                  <DocLink label="Fitness to Practise Certificate" url={application.doc_fitness_to_practise} icon={Shield} />
                  <DocLink label="Prior Counselling Qualifications" url={application.doc_prior_qualifications} icon={GraduationCap} />
                  <DocLink label="Enhanced DBS Certificate (Adult Workforce)" url={application.doc_dbs_certificate} icon={CheckCircle} />
                  <DocLink label="Full CV" url={application.doc_cv} icon={FileText} />
                  <DocLink label="Valid ID (Passport or Driving Licence)" url={application.doc_valid_id} icon={User} />
                  <DocLink label="Indemnity Insurance Certificate" url={application.doc_indemnity_insurance} icon={Shield} />
                </div>
              </Section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Personal Information ─────────────────────────────────── */}
                <Section icon={User} title="Personal Information" iconClass="text-purple-500">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First Name" value={application.first_name} />
                      <Field label="Last Name" value={application.last_name} />
                    </div>
                    <Field label="Date of Birth" value={application.date_of_birth} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Gender" value={application.gender} />
                      <Field label="Ethnicity" value={application.ethnicity} />
                    </div>
                    <Field label="Sexual Orientation" value={application.sexual_orientation} />
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</div>
                      <a href={`mailto:${application.email}`} className="text-sm font-medium text-purple-600 hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {application.email}
                      </a>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</div>
                      {application.phone
                        ? <a href={`tel:${application.phone}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> {application.phone}</a>
                        : <span className="text-sm text-gray-300 italic">Not provided</span>}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Address</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span>{application.address || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Beliefs</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">{application.beliefs || '—'}</div>
                      {application.beliefs_other && <div className="text-xs text-gray-500 mt-0.5">Other: {application.beliefs_other}</div>}
                    </div>
                    <Field label="Disabilities / Impairments" value={application.disabilities} isLong />
                    <Field label="Medical Conditions" value={application.medical_conditions} isLong />
                  </div>
                </Section>

                {/* ── Fitness to Practise ──────────────────────────────────── */}
                <Section icon={Shield} title="Fitness to Practise" iconClass="text-green-500">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Professional Indemnity Insurance</div>
                      <Badge value={application.has_insurance} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Professional Body Member (NCPS/BACP/Other)</div>
                      <Badge value={application.professional_body_member} />
                      {application.professional_body_details && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg">{application.professional_body_details}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">DBS Update Service</div>
                      <Badge value={application.dbs_update_service} />
                      {application.dbs_update_details && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg">{application.dbs_update_details}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Currently in Personal Therapy</div>
                      <Badge value={application.in_personal_therapy} />
                      {application.personal_therapy_reason && (
                        <div className="text-xs text-gray-500 mt-1 italic">{application.personal_therapy_reason}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Has Clinical Supervisor</div>
                      <Badge value={application.has_clinical_supervisor} />
                      {application.supervisor_reason && (
                        <div className="text-xs text-gray-500 mt-1 italic">{application.supervisor_reason}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Previous Online Counselling</div>
                      <Badge value={application.previous_online_counselling} yesClass="bg-blue-50 text-blue-700 border-blue-100" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Criminal Convictions (last 6 months)</div>
                      {application.criminal_convictions
                        ? <div className="text-sm text-gray-800 dark:text-gray-200 bg-red-50 p-2 rounded-lg border border-red-100">{application.criminal_convictions}</div>
                        : <span className="text-sm text-gray-300 italic">Not provided</span>}
                    </div>
                    <div className="md:col-span-2">
                       <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weekly Availability Schedule</div>
                       <AvailabilitySchedule value={application.availability_schedule} />
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Course Information ────────────────────────────────────────── */}
              <Section icon={BookOpen} title="Course Information" iconClass="text-indigo-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Training Organisation / College" value={application.institution} />
                  <Field label="College Address" value={application.college_address} />
                  <Field label="Course Title / Qualification" value={application.course_name || application.course_title} />
                  <Field label="Course Duration" value={application.course_duration} />
                  <Field label="Expected Qualification Date" value={application.expected_qualification_date} />
                  <Field label="Counselling Type" value={application.counselling_type} />
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tutor Name</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{application.tutor_name || '—'}</div>
                        {application.tutor_email && <a href={`mailto:${application.tutor_email}`} className="text-xs text-purple-600 hover:underline mt-0.5 block">{application.tutor_email}</a>}
                        {application.tutor_phone && <div className="text-xs text-gray-500 mt-0.5">{application.tutor_phone}</div>}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Placement Lead</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{application.placement_lead_name || '—'}</div>
                        {application.placement_lead_email && <a href={`mailto:${application.placement_lead_email}`} className="text-xs text-purple-600 hover:underline mt-0.5 block">{application.placement_lead_email}</a>}
                        {application.placement_lead_phone && <div className="text-xs text-gray-500 mt-0.5">{application.placement_lead_phone}</div>}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Face-to-Face Status</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {application.has_face_to_face_clients && <Badge value={application.has_face_to_face_clients} />}
                          {application.face_to_face_client_count && <div className="text-xs mt-1 text-gray-500">{application.face_to_face_client_count} clients currently</div>}
                          {application.face_to_face_hours_completed && <div className="text-xs text-gray-500">{application.face_to_face_hours_completed} hours completed</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Face-to-Face Requirement</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-100 dark:border-gray-700">{application.face_to_face_requirement || '—'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Skills Practice Details (Fishbowl / Method / Duration)" value={application.skills_practice_details} isLong />
                  </div>
                </div>
              </Section>

              {/* ── Experience & Journey ──────────────────────────────────────── */}
              <Section icon={Briefcase} title="Experience & Background" iconClass="text-amber-500">
                <div className="space-y-5">
                  <Field label="Family Background & Impact on Journey" value={application.family_impact} isLong />
                  <Field label="Personal Journey to Counselling" value={application.personal_journey || application.experience_background} isLong />
                  <Field label="Self-Awareness & Negative Patterns" value={application.self_awareness} isLong />
                  <Field label="Counsellor-Related Training & Voluntary Experience" value={application.training_history} isLong />
                  <Field label="Areas of Experience (e.g. depression, anxiety, abuse)" value={application.areas_of_experience} isLong />
                  <Field label="Personal Development Areas to Improve" value={application.personal_development_areas} isLong />
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Theoretical Approach</div>
                    {application.theoretical_approach
                      ? <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-sm font-medium">{application.theoretical_approach}</span>
                      : <span className="text-sm text-gray-300 italic">Not provided</span>}
                  </div>
                </div>
              </Section>

              {/* ── Peer Support Group ────────────────────────────────────────── */}
              <Section icon={Users} title="Peer Support Group (PSG) Preference" iconClass="text-teal-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preferred PSG Day</div>
                    {application.psg_day_preference
                      ? <span className="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-sm font-bold">{application.psg_day_preference}</span>
                      : <span className="text-sm text-gray-300 italic">Not provided</span>}
                  </div>
                  <Field label="Reason (if 'None of the above' selected)" value={application.psg_reason} isLong />
                </div>
              </Section>

              {/* ── JotForm Metadata ──────────────────────────────────────────── */}
              {application.source === 'jotform' && (
                <Section icon={MessageSquare} title="JotForm Submission Metadata" iconClass="text-gray-400">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Submission ID</div>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{application.jotform_submission_id || '—'}</code>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Submitted At (JotForm)</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{application.jotform_submitted_at ? new Date(application.jotform_submitted_at).toLocaleString('en-GB') : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Disclaimer Date</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{application.disclaimer_date || '—'}</div>
                    </div>
                  </div>
                </Section>
              )}



            </div>
          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
