"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, User, FileText, AlertTriangle, ChevronRight, Hash } from "lucide-react";
import { getInitials, abbreviateLastName } from "@/lib/utils";
import apiService from "@/lib/api";

export default function SessionNoteDetailsModal({ noteId, onClose }) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSessionNote(noteId);
      setNote(data);
    } catch (err) {
      console.error("Error fetching note details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!noteId) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[#6f1d56] dark:text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Session Documentation
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {note?.type?.replace("_", " ") || "Note"} Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm">Loading documentation details...</p>
            </div>
          ) : !note ? (
            <div className="py-12 text-center text-gray-400">
               <p>Failed to load note.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{abbreviateLastName(note.client?.name) || "N/A"}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {note.content?.session_date ? new Date(note.content.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not specified"}
                  </p>
                </div>
                {note.content?.session_number && (
                  <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Hash className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Session Number</span>
                    </div>
                    <p className="text-sm font-black text-[#6f1d56] dark:text-purple-400">
                      {note.content.session_number}
                    </p>
                  </div>
                )}
              </div>

              {/* Sections */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />
                    {note.type === 'risk_update' ? 'Incident Details' : 'Session Summary'}
                  </h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 whitespace-pre-wrap">
                    {note.content?.summary || "No summary provided."}
                  </div>
                </div>



                {note.content?.next_steps && (
                  <div>
                    <h4 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Next Steps / Homework
                    </h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      {note.content.next_steps}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400">
                 <span>Submitted on {new Date(note.created_at).toLocaleDateString()}</span>
                 <span className="flex items-center gap-1">
                   <FileText className="w-3 h-3" />
                   Internal Digital Record
                 </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
