"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import apiService from "@/lib/api";
import { CLINICAL_PROGRESS_FORMS } from "@/lib/counsellorForms";
import { ChevronRight, ExternalLink, RefreshCw } from "lucide-react";

function FormCard({ form }) {
  return (
    <Link
      href={form.href}
      className="group bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${form.accent}15` }}
        >
          <form.icon className="w-5 h-5" style={{ color: form.accent }} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm leading-tight group-hover:text-[#6f1d56] transition-colors">
            {form.title}
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mt-0.5">
            {form.subtitle}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] flex-1 mb-4 leading-relaxed">
        {form.description}
      </p>

      <div className="flex items-center justify-between text-xs font-bold text-[#6f1d56]">
        <span>Open page</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function CounsellorFormsPage() {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            Forms
          </h1>
          <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">
            Attendance and progress forms for counsellor activity records
          </p>
        </div>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-6xl space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-[#6f1d56]/50" />
            </div>
          ) : (
            <>
              <section className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Clinical Progress Forms
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CLINICAL_PROGRESS_FORMS.map((form) => (
                    <FormCard key={form.slug} form={form} />
                  ))}
                </div>
              </section>

              <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Each page embeds the matching Jotform and includes an external fallback link. Jotform submissions need webhook mapping before they can appear as internal records automatically.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </CounsellorLayout>
  );
}
