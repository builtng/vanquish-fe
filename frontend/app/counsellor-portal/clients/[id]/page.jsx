"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  FileText,
  MessageSquare,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import SessionNoteDetailsModal from "@/components/SessionNoteDetailsModal";

function ClientDetailsContent() {
  const router = useRouter();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();

  const [client, setClient] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clientNotes, setClientNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
    if (!authUser || !id) return;
    loadData();
  }, [authUser, id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientData, unreadRes, notesRes] = await Promise.all([
        apiService.getClientDetails(id),
        apiService.getUnreadMessageCount(),
        apiService.getSessionNotes({ client_id: id }),
      ]);
      setClient(clientData);
      setUnreadCount(unreadRes.count || 0);
      setClientNotes(notesRes || []);
    } catch (err) {
      console.error("Error loading client details:", err);
      showError(err.message || "Failed to load client details");
      if (err.status === 403 || err.status === 404) {
        router.push("/counsellor-portal/clients");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CounsellorLayout unreadCount={unreadCount}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 text-[#6f1d56] animate-spin" />
        </div>
      </CounsellorLayout>
    );
  }

  if (!client) return null;

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader
        actions={
          <Link
            href="/counsellor-portal/messages/inbox"
            className="px-4 py-2 bg-[#6f1d56] text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-all text-sm shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Message Admin Team
          </Link>
        }
      >
        <div className="flex items-center gap-4">
          <Link
            href="/counsellor-portal/clients"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
              {client.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  client.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : client.status === "urgent"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {client.status || "active"}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-medium">
                {client.stage}
              </span>
            </div>
          </div>
        </div>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Essential Info Card */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-[var(--bg-secondary)]">
                <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#6f1d56]" />
                  Client Information
                </h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Contact Details
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {client.phone || "Not provided"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Personal Details
                    </label>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <span className="font-medium">Age:</span> {client.age || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <span className="font-medium">Gender:</span> {client.gender || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <span className="font-medium">Ethnicity:</span> {client.ethnicity || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Service Details
                    </label>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                      <p className="text-sm font-bold text-[#6f1d56] dark:text-purple-400">
                        {client.service_type} Service
                      </p>
                      <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 mt-0.5">
                        Matched on {client.matched_date ? new Date(client.matched_date).toLocaleDateString() : "unmatched"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Primary Issues
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {client.primary_issues?.map((issue, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium"
                        >
                          {issue}
                        </span>
                      )) || <span className="text-xs text-gray-400 italic">No issues recorded</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Background Card */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-[var(--bg-secondary)]">
                <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#6f1d56]" />
                  Clinical Context
                </h3>
              </div>
              <div className="p-8 space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                    Risk Flags
                  </label>
                  {client.risk_flags && client.risk_flags !== "None reported" ? (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed font-medium">
                        {client.risk_flags}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        No immediate risk flags reported at intake.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Medical Context
                    </label>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Medication</p>
                        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-0.5">
                          {client.medication || "None reported"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Disabilities</p>
                        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-0.5">
                          {client.disabilities || "None reported"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Emergency Contact
                    </label>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {client.emergency_contact_name || "Not provided"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {client.emergency_contact_phone || "No phone"}
                      </p>
                      {client.emergency_contact_relationship && (
                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                          Relationship: {client.emergency_contact_relationship}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Notes History Card */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2 text-sm md:text-base">
                    <FileText className="w-4 h-4 text-[#6f1d56]" />
                    Session Notes History
                  </h3>
                  <Link 
                    href="/counsellor-portal/pages/session-notes"
                    className="text-xs font-bold text-[#6f1d56] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {clientNotes.length === 0 ? (
                    <div className="p-12 text-center">
                       <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                       <p className="text-sm text-gray-400 italic">No notes recorded for this client yet.</p>
                    </div>
                  ) : (
                    clientNotes.map((note) => (
                      <div 
                        key={note.id} 
                        onClick={() => setSelectedNoteId(note.id)}
                        className="p-5 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors cursor-pointer group"
                      >
                         <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                               note.type === 'risk_update' 
                                 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                                 : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                            }`}>
                               {note.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-400">
                               {new Date(note.created_at).toLocaleDateString()}
                            </span>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="min-w-0 pr-4">
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {note.content?.summary}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#6f1d56] transition-all transform group-hover:translate-x-1 flex-shrink-0" />
                         </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-[#6f1d56] rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                Documentation
              </h4>
              <div className="space-y-3">
                <Link
                  href="/counsellor-portal/pages/session-notes"
                  className="flex items-center justify-between w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold border border-white/10"
                >
                  Submit Session Note
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/counsellor-portal/pages/session-notes"
                  className="flex items-center justify-between w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold border border-white/10"
                >
                  End of Block Summary
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Upcoming Sessions Card */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-[var(--bg-secondary)]">
                <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6f1d56]" />
                  Upcoming Sessions
                </h3>
              </div>
              <div className="p-5">
                {client.consultations && client.consultations.filter(c => c.status === 'scheduled').length > 0 ? (
                  <div className="space-y-4">
                    {client.consultations.filter(c => c.status === 'scheduled').map((session, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center flex-shrink-0">
                           <span className="text-[8px] font-bold text-gray-400 uppercase">{new Date(session.scheduled_at).toLocaleDateString('en-GB', { month: 'short' })}</span>
                           <span className="text-sm font-black text-gray-700 dark:text-white leading-none">{new Date(session.scheduled_at).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Session #{idx + 1}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] text-gray-500">{new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-400 italic">No upcoming sessions scheduled.</p>
                  </div>
                )}
                
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-medium">Completed</span>
                     <span className="font-bold text-[#6f1d56]">{client.sessions_completed || 0} / 6 Sessions</span>
                   </div>
                   <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                     <div 
                       className="h-full bg-[#6f1d56] transition-all duration-500" 
                       style={{ width: `${Math.min(((client.sessions_completed || 0) / 6) * 100, 100)}%` }}
                     />
                   </div>
                </div>
              </div>
            </div>

            {/* Helpful Links */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Assistance
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed mb-4">
                Need to change the session time or report an issue with this client? 
              </p>
              <Link 
                href="/counsellor-portal/messages/inbox"
                className="text-xs font-bold text-[#6f1d56] dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                Contact Administration <ChevronLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedNoteId && (
        <SessionNoteDetailsModal
          noteId={selectedNoteId}
          onClose={() => setSelectedNoteId(null)}
        />
      )}
    </CounsellorLayout>
  );
}

export default function ClientDetailsPage() {
  return (
    <SidebarProvider>
      <ClientDetailsContent />
    </SidebarProvider>
  );
}
