"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import { Send, CheckCircle, RefreshCw, User, FileText, AlertTriangle } from "lucide-react";

export default function InternalSessionNoteForm({ type, title, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [fetchingClients, setFetchingClients] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: "",
    session_date: new Date().toISOString().split("T")[0],
    summary: "",
    risk_assessment: "",
    next_steps: "",
    confirmed: false
  });

  useEffect(() => {
    fetchClients();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      showToast("Please select a client", "error");
      return;
    }

    setLoading(true);
    try {
      await apiService.submitSessionNote({
        client_id: formData.client_id,
        type: type, // 'weekly', 'block_summary', 'risk_update'
        content: {
          session_date: formData.session_date,
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
          className="px-6 py-2 bg-[#6f1d56] text-white rounded-lg font-bold"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] p-6 shadow-xl max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-[#6f1d56]">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Select Client
            </label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <select
                 required
                 value={formData.client_id}
                 onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-sm"
               >
                 <option value="">Choose a client...</option>
                 {clients.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
              {type === 'risk_update' ? 'Incident Date' : 'Session Date'}
            </label>
            <input
              type="date"
              required
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
            {type === 'risk_update' ? 'Incident Details' : 'Session Summary'}
          </label>
          <textarea
            required
            rows={4}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Key discussion points..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2 flex items-center gap-2">
            Risk Assessment {type === 'risk_update' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          </label>
          <textarea
            required
            rows={3}
            value={formData.risk_assessment}
            onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
            placeholder="Assess current risk levels..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
            Next Steps / Homework
          </label>
          <input
            type="text"
            value={formData.next_steps}
            onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
            placeholder="Plans for next session..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#6f1d56] outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
           <input
             type="checkbox"
             id="confirm"
             required
             checked={formData.confirmed}
             onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
             className="w-4 h-4 text-[#6f1d56] rounded border-gray-300 focus:ring-[#6f1d56]"
           />
           <label htmlFor="confirm" className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
             I confirm this documentation is clinical accurate and complete.
           </label>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.confirmed}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#6f1d56] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Documentation <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
