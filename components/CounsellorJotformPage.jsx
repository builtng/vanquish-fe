"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import apiService from "@/lib/api";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";

export default function CounsellorJotformPage({ form }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const unreadRes = await apiService.getUnreadMessageCount();
        setUnreadCount(unreadRes?.count || 0);
      } catch (err) {
        console.error("Error loading unread count:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUnreadCount();
  }, []);

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
          <div>
            <Link
              href="/counsellor-portal/pages/psg-progress"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[var(--text-secondary)] hover:text-[#6f1d56] mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Attendance & Progress
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
              {form.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">
              {form.subtitle}
            </p>
          </div>

          <a
            href={form.jotformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6f1d56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#6f1d56]/20"
          >
            Open in Jotform
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-6xl space-y-4">
          <div className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${form.accent}15` }}
              >
                <form.icon className="w-5 h-5" style={{ color: form.accent }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  {form.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Complete the form below. Submission records are handled by Jotform and can be connected to internal records through the matching Jotform webhook.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-5 h-5 animate-spin text-[#6f1d56]/50" />
              </div>
            )}
            <iframe
              title={form.title}
              src={form.jotformUrl}
              className="w-full h-[78vh] border-0 bg-white"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </CounsellorLayout>
  );
}
