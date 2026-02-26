"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

function SessionNotesPageContent() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await apiService.getUnreadMessageCount();
      setUnreadCount(res.count || 0);
    } catch (err) {}
  };

  const forms = [
    {
      title: "Weekly Session Note Form",
      description: "Standard form for documenting individual therapy sessions.",
      url: "https://jotform.com/vanquish/session-note",
      time: "5-10 mins",
    },
    {
      title: "End of Block Summary",
      description: "Required summary after completion of a 6-session block.",
      url: "https://jotform.com/vanquish/block-summary",
      time: "15 mins",
    },
    {
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
        <div className="px-6 py-6 max-w-4xl">
          <div className="grid grid-cols-1 gap-4">
            {forms.map((form, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-[#6f1d56] flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] group-hover:text-[#6f1d56] transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {form.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        <span>Est. Time: {form.time}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#6f1d56] hover:text-white transition-all border border-gray-200 dark:border-gray-700"
                  >
                    Open Form <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-6 flex flex-col md:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">
                Important Note on Compliance
              </h4>
              <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed mb-3">
                Incomplete session notes are the primary cause of insurance and
                payroll delays. Please ensure all notes are submitted within 24
                hours of the session completion.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  HIPAA Compliant
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  End-to-End Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
