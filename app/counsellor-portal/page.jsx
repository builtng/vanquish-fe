"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  ChevronRight,
  Clock,
  Send,
  AlertCircle,
  Bell,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, href }) {
  const content = (
    <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--card-border)] p-5 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function OverviewContent({ counsellorData, unreadCount }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
        ? "Good afternoon"
        : "Good evening";

  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Counsellor";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Assigned Clients"
          value={counsellorData?.total_clients ?? 0}
          color="#6f1d56"
          href="/counsellor-portal/clients"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Sessions"
          value={counsellorData?.upcoming_consultations?.length ?? 0}
          color="#6366f1"
          href="/counsellor-portal/sessions"
        />
        <StatCard
          icon={MessageSquare}
          label="Unread Messages"
          value={unreadCount}
          color="#f59e0b"
          href="/counsellor-portal/messages/inbox"
        />
      </div>

      {/* Upcoming sessions preview */}
      <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--card-border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Upcoming Sessions
              </h2>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                Your next scheduled sessions
              </p>
            </div>
          </div>
          <Link
            href="/counsellor-portal/sessions"
            className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: "#6f1d56" }}
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {!counsellorData?.upcoming_consultations?.length ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-[var(--text-secondary)] text-sm">
              No upcoming sessions scheduled
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {counsellorData.upcoming_consultations.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[var(--hover-bg)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: "#6366f1" }}
                  >
                    {c.client?.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-[var(--text-primary)] text-sm">
                      {c.client?.name || "Client"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                      <Clock className="w-3 h-3" />
                      {new Date(c.scheduled_at).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      at{" "}
                      {new Date(c.scheduled_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send message CTA */}
      <div
        className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, #6f1d56 0%, #9b2777 100%)",
        }}
      >
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">
            Need to reach the admin team?
          </h3>
          <p className="text-white/70 text-sm">
            Send them a message directly from your portal.
          </p>
        </div>
        <Link
          href="/counsellor-portal/messages/inbox"
          className="flex-shrink-0 px-5 py-2.5 bg-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 flex items-center gap-2"
          style={{ color: "#6f1d56" }}
        >
          <Send className="w-4 h-4" />
          Go to Messages
        </Link>
      </div>
    </div>
  );
}

function PortalOverviewPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { error: showError } = useToast();

  const [counsellorData, setCounsellorData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
    if (authUser.role !== "counsellor") {
      showError("Unauthorized. Counsellor access required.");
      router.push("/counsellor-login");
      return;
    }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [authUser]);

  const loadData = async () => {
    try {
      const [dataRes, countRes] = await Promise.allSettled([
        apiService.getCounsellorOwnData(),
        apiService.getUnreadMessageCount(),
      ]);
      if (dataRes.status === "fulfilled") setCounsellorData(dataRes.value);
      if (countRes.status === "fulfilled")
        setUnreadCount(countRes.value?.count || 0);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Overview
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Welcome back, {authUser?.name?.split(" ")[0] || "Counsellor"}
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">
                  Loading your portal...
                </p>
              </div>
            </div>
          ) : (
            <OverviewContent
              counsellorData={counsellorData}
              unreadCount={unreadCount}
            />
          )}
        </div>
      </div>
    </CounsellorLayout>
  );
}

export default function CounsellorPortalPage() {
  return (
    <SidebarProvider>
      <PortalOverviewPage />
    </SidebarProvider>
  );
}
