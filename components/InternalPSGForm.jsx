"use client";

import React, { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import { Send, CheckCircle } from "lucide-react";

export default function InternalPSGForm({ onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    reflection: "",
    attendance_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.submitPSGReflection(formData);
      setSubmitted(true);
      showToast("PSG Reflection submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error submitting PSG reflection:", err);
      showToast(err.message || "Failed to submit reflection", "error");
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
          Thank you for your reflection. It has been recorded for your monthly requirement.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
        >
          Submit another reflection
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
          Meeting Date
        </label>
        <input
          type="date"
          required
          value={formData.attendance_date}
          onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-[var(--text-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">
          Your Reflection
        </label>
        <textarea
          required
          rows={6}
          placeholder="Share your key takeaways and reflections from the PSG meeting..."
          value={formData.reflection}
          onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-[var(--text-primary)] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#6f1d56] text-white rounded-xl font-black text-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
      >
        {loading ? "Submitting..." : (
          <>
            Submit Reflection <Send className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
