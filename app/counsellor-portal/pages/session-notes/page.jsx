"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import InternalSessionNoteForm from "@/components/InternalSessionNoteForm";
import SessionNoteDetailsModal from "@/components/SessionNoteDetailsModal";
import {
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
} from "lucide-react";

function SessionNotesPageContent() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null); // { type, title }
  const [recentNotes, setRecentNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unreadRes, settingsRes, notesRes] = await Promise.all([
        apiService.getUnreadMessageCount(),
        apiService.getCompanySettings(),
        apiService.getSessionNotes(),
      ]);
      setUnreadCount(unreadRes.count || 0);
      setSettings(settingsRes);
      setRecentNotes(notesRes || []);
    } catch (err) {
      console.error("Error loading notes data:", err);
    } finally {
      setLoading(false);
    }
  };

  const forms = [
    {
      type: "weekly",
      title: "Weekly Session Note Form",
      description: "Standard form for documenting individual therapy sessions.",
      url: settings?.jotform_session_notes_url || "https://jotform.com/vanquish/session-note",
      time: "5-10 mins",
    },
    {
      type: "block_summary",
      title: "End of Block Summary",
      description: "Required summary after completion of a 6-session block.",
      url: "https://jotform.com/vanquish/block-summary",
      time: "15 mins",
    },
    {
      type: "risk_update",
      title: "Client Risk Management Update",
      description: "Immediate reporting for any changes in client risk status.",
      url: "https://jotform.com/vanquish/risk-update",
      time: "Immediate",
    },
  ];

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Session Notes
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Complete your professional documentation
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-5xl space-y-8">
          {/* Form Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-[#6f1d56] mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] group-hover:text-[#6f1d56] transition-colors leading-tight mb-2">
                    {form.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] leading-relaxed mb-4">
                    {form.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveForm(form)}
                    className="w-full px-4 py-2 bg-[#6f1d56] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    Submit In-Portal <Plus className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                  >
                    Use JotForm <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column: Notes History */}
             <div className="lg:col-span-2">
                <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                   <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                         <Clock className="w-4 h-4 text-gray-400" />
                         Recent Submissions
                      </h3>
                      <button onClick={loadData} className="text-xs text-indigo-600 hover:underline">Refresh</button>
                   </div>
                   
                   <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {loading ? (
                        <div className="p-8 text-center bg-gray-50/10">
                           <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-300" />
                        </div>
                      ) : recentNotes.length === 0 ? (
                        <div className="p-12 text-center">
                           <p className="text-sm text-gray-400 italic">No recent notes found</p>
                        </div>
                      ) : (
                        recentNotes.map((note) => (
                           <div 
                              key={note.id} 
                              onClick={() => setSelectedNoteId(note.id)}
                              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors cursor-pointer group"
                            >
                               <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                                      note.type === 'risk_update' 
                                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                                        : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                    }`}>
                                       {note.type.replace('_', ' ')}
                                    </span>
                                    {note.type === 'risk_update' && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                                  </div>
                                  <span className="text-[10px] text-gray-400">
                                     {new Date(note.created_at).toLocaleDateString()}
                                  </span>
                               </div>
                               <div className="flex items-center justify-between">
                                 <div>
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] group-hover:text-[#6f1d56] transition-colors">
                                      {note.client?.name || "Unspecified Client"}
                                   </h4>
                                   <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                      {note.content?.summary}
                                   </p>
                                 </div>
                                 <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#6f1d56] transition-all transform group-hover:translate-x-1" />
                               </div>
                            </div>
                        ))
                      )}
                   </div>
                </div>
             </div>

             {/* Right Column: Compliance */}
             <div className="lg:col-span-1 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm">
                      Compliance Reminder
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed mb-4">
                    All session notes must be submitted within 24 hours of completion.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-500">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      HIPAA Compliant
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-500">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Secure Encrypted Storage
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveForm(null)} />
          <div className="relative z-10 w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <InternalSessionNoteForm
              type={activeForm.type}
              title={activeForm.title}
              onClose={() => setActiveForm(null)}
              onSuccess={() => {
                loadData();
              }}
            />
          </div>
        </div>
      )}
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

export default function SessionNotesPage() {
  return (
    <SidebarProvider>
      <SessionNotesPageContent />
    </SidebarProvider>
  );
}
