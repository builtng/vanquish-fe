"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import { Send, CheckCircle, RefreshCw, User, FileText, AlertTriangle, Calendar, Hash, Check } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import { getInitials } from "@/lib/utils";

export default function InternalSessionNoteForm({ type, title, onClose, onSuccess }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [fetchingClients, setFetchingClients] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [fetchingStats, setFetchingStats] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: "",
    session_date: new Date().toISOString().split("T")[0],
    session_number: "",
    attended: "1", // Default to attended
    tc_initials: "",
    summary: "",
    risk_assessment: "",
    next_steps: "",
    confirmed: false
  });

  // Derived attendance record calculation
  const getAttendanceRecord = () => {
    if (!formData.client_id) return "0/0";
    
    // Count past attended
    const pastAttended = pastSessions.filter(s => s.content?.attended === "1" || s.content?.attended === 1).length;
    const currentAttended = formData.attended === "1" ? 1 : 0;
    const totalAttended = pastAttended + currentAttended;
    const totalRecorded = formData.session_number || (pastSessions.length + 1);
    
    return `${totalAttended}/${totalRecorded}`;
  };

  useEffect(() => {
    fetchClients();
    if (user) {
      setFormData(prev => ({ ...prev, tc_initials: getInitials(user.name) }));
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const data = await apiService.getCounsellorOwnData();
      setClients(data.clients || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setFetchingClients(false);
    }
  };

  // Fetch past sessions for the selected client to calculate stats
  useEffect(() => {
    if (formData.client_id) {
      fetchClientStats(formData.client_id);
    }
  }, [formData.client_id]);

  const fetchClientStats = async (clientId) => {
    setFetchingStats(true);
    try {
      const notes = await apiService.request(`/session-notes?client_id=${clientId}`);
      setPastSessions(notes || []);
      
      // Auto-set session number if not already set (default to next sequential)
      if (!formData.session_number) {
        setFormData(prev => ({ ...prev, session_number: String(notes.length + 1) }));
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setFetchingStats(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      showToast("Please select a client", "error");
      return;
    }

    setLoading(true);
    try {
      const attendanceRecord = getAttendanceRecord();
      
      await apiService.submitSessionNote({
        client_id: formData.client_id,
        type: type, // 'weekly', 'block_summary', 'risk_update'
        content: {
          session_date: formData.session_date,
          session_number: formData.session_number,
          attended: formData.attended,
          attendance_record: attendanceRecord,
          tc_initials: formData.tc_initials,
          summary: formData.summary,
          risk_assessment: formData.risk_assessment,
          next_steps: formData.next_steps
        }
      });
      setSubmitted(true);
      showToast(`${title} submitted successfully!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast(err.message || "Failed to submit note", "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-2">
          Submitted Successfully
        </h3>
        <p className="text-gray-600 dark:text-[var(--text-secondary)] mb-6">
          Your {title} has been recorded.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-[#6f1d56] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
        >
          Close
        </button>
      </div>
    );
  }

  // Options for session number selection (1-20)
  const sessionOptions = Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: `Session ${i + 1}`
  }));

  // Options for clients
  const clientOptions = clients.map(c => ({
    value: String(c.id),
    label: `${c.name} (${getInitials(c.name)})`
  }));

  return (
    <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] p-6 shadow-xl max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-[#6f1d56]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Practitioner: <span className="font-bold text-[#6f1d56]">{formData.tc_initials}</span>
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Practitioner Initials - Read Only Auto Fill */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
              TC Initials*
            </label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 readOnly
                 value={formData.tc_initials}
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 focus:outline-none text-sm font-bold text-[#6f1d56]"
               />
            </div>
          </div>

          {/* Session Date */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
              {type === 'risk_update' ? 'Incident Date*' : 'Session Date*'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                type="date"
                required
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-sm"
              />
            </div>
          </div>

          {/* Client Initials - Searchable Select */}
          <div className="col-span-full">
            <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Client initials *
            </label>
            <SearchableSelect
              required
              options={clientOptions}
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value, session_number: "" })}
              placeholder={fetchingClients ? "Loading clients..." : "Search client..."}
            />
          </div>

          {/* Session Number - Searchable Select */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Session Number *
            </label>
            <SearchableSelect
              required
              options={sessionOptions}
              value={formData.session_number}
              onChange={(e) => setFormData({ ...formData, session_number: e.target.value })}
              placeholder="Session #..."
              isDisabled={!formData.client_id || fetchingStats}
            />
          </div>

          {/* Attendance Selection */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Attendance *
            </label>
            <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-[42px]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attended: "1" })}
                className={`flex-1 flex items-center justify-center gap-2 h-full rounded-lg text-xs font-bold transition-all ${
                  formData.attended === "1"
                    ? "bg-[#6f1d56] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Attended
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attended: "0" })}
                className={`flex-1 flex items-center justify-center gap-2 h-full rounded-lg text-xs font-bold transition-all ${
                  formData.attended === "0"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Not Attended
              </button>
            </div>
          </div>
          
          {/* Visual attendance tracker info */}
          {formData.client_id && (
            <div className="col-span-full bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Hash className="w-4 h-4 text-[#6f1d56]" />
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Recorded Attendance Score</span>
               </div>
               <span className="text-sm font-bold text-[#6f1d56]">
                 {getAttendanceRecord()} sessions
               </span>
            </div>
          )}
        </div>

        {/* Brief Summary */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
            Brief Summary *
          </label>
          <textarea
            required
            rows={4}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Summarize the core of the session briefly..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-sm resize-none transition-all"
          />
        </div>

        {/* Keeping original fields if needed, OR user might want only these.
            The user said "and Brief Summary field" at the end of their list.
            I'll keep Risk Assessment and Next Steps as hidden/extra if it was weekly note?
            Actually, let's keep them but make them optional or secondary.
            Wait, user said "Brief Summary field" as if that's the main thing.
            I'll keep them to maintain functionality but maybe group them. */}
        
        <details className="group border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <summary className="flex items-center justify-between p-3 cursor-pointer bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="text-xs font-bold text-gray-500 group-open:text-[#6f1d56]">Additional Clinical Details (Risk & Steps)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-4 space-y-4 bg-white dark:bg-transparent">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-[var(--text-primary)] mb-2 flex items-center gap-2">
                Risk Assessment {type === 'risk_update' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
              </label>
              <textarea
                rows={2}
                value={formData.risk_assessment}
                onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
                placeholder="Assess current risk levels..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-[var(--text-primary)] mb-2">
                Next Steps / Homework
              </label>
              <input
                type="text"
                value={formData.next_steps}
                onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
                placeholder="Plans for next session..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-xs"
              />
            </div>
          </div>
        </details>

        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
           <input
             type="checkbox"
             id="confirm"
             required
             checked={formData.confirmed}
             onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
             className="w-4 h-4 text-[#6f1d56] rounded border-gray-300 focus:ring-[#6f1d56] cursor-pointer"
           />
           <label htmlFor="confirm" className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
             I confirm this clinical documentation is accurate and recorded by {formData.tc_initials}.
           </label>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.confirmed}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#6f1d56] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Submitting Note...
            </>
          ) : (
            <>
              Submit Session Note <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
