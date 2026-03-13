"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Heart,
  ExternalLink,
  Info,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";

function PSGFormPageContent() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unreadRes, settingsRes] = await Promise.all([
        apiService.getUnreadMessageCount(),
        apiService.getCompanySettings(),
      ]);
      setUnreadCount(unreadRes.count || 0);
      setSettings(settingsRes);
    } catch (err) {
      console.error("Error loading PSG data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          PSG Form
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Practitioner Support Group feedback and attendance
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-4xl space-y-6">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] p-8 shadow-sm text-center">
            <div className="w-20 h-20 rounded-2xl bg-pink-50 dark:bg-pink-900/10 flex items-center justify-center text-pink-600 mx-auto mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-[var(--text-primary)] mb-4">
              Monthly PSG Reflection
            </h2>
            <p className="text-gray-600 dark:text-[var(--text-secondary)] max-w-lg mx-auto mb-8 leading-relaxed">
              As part of our commitment to your clinical wellbeing, we require
              all practitioners to attend at least one PSG meeting per month and
              submit a brief reflection form.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <Users className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Peer Support
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <Sparkles className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Skill Building
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Monthly Requirment
                </p>
              </div>
            </div>

            <a
              href={settings?.jotform_psg_form_url || "https://jotform.com/vanquish/psg-reflection"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#6f1d56] text-white rounded-xl font-black text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl shadow-purple-500/20 active:scale-95"
            >
              Submit PSG Form <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm mb-1">
                Upcoming PSG Dates
              </h4>
              <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed">
                Check the main Discord channel or your calendar for the next
                meeting links. If you cannot attend any sessions in a given
                month, please contact your clinical supervisor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CounsellorLayout>
  );
}

export default function PSGFormPage() {
  return (
    <SidebarProvider>
      <PSGFormPageContent />
    </SidebarProvider>
  );
}
