"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Home,
  MessageSquare,
  Users,
  Calendar,
  LogOut,
  Menu,
  Settings,
  ChevronDown,
  ChevronRight,
  Inbox,
  Send,
  FileText,
  HeartHandshake,
  Layout,
  Files,
  User,
} from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import { useTheme } from "next-themes";

export default function CounsellorSidebar({ unreadCount = 0 }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { branding } = useBranding();
  const { theme } = useTheme();

  const [expandedItems, setExpandedItems] = useState({
    messages: pathname?.startsWith("/counsellor-portal/messages"),
  });

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const navItems = [
    {
      id: "overview",
      icon: Home,
      label: "Overview",
      href: "/counsellor-portal",
    },
    {
      id: "messages",
      icon: MessageSquare,
      label: "Messages",
      badge: unreadCount,
      href: "/counsellor-portal/messages",
    },
    /* {
      id: "clients",
      icon: Users,
      label: "My Clients",
      href: "/counsellor-portal/clients",
    }, */
    {
      id: "sessions",
      icon: Calendar,
      label: "My Sessions",
      href: "/counsellor-portal/sessions",
    },
    {
      id: "notes",
      label: "Session Notes",
      icon: FileText,
      href: "/counsellor-portal/pages/session-notes",
    },
    {
      id: "psg",
      label: "PSG Form",
      icon: FileText,
      href: "/counsellor-portal/pages/psg-form",
    },
    {
      id: "files",
      label: "Resources",
      icon: Files,
      href: "/counsellor-portal/files",
    },
  ];

  return (
    <div
      className={`${sidebarOpen ? "w-64" : "w-16 md:w-20"} bg-white dark:bg-[var(--sidebar-bg)] border-r border-gray-200 dark:border-[var(--sidebar-border)] transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-30`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-[var(--sidebar-border)]">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden">
              {branding.platform_logo_url ? (
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={
                      theme === "dark" && branding.platform_logo_dark_url
                        ? branding.platform_logo_dark_url
                        : branding.platform_logo_url
                    }
                    alt={branding.company_name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  <HeartHandshake className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] truncate">
                  {branding.company_name || "Vanquish"}
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-[var(--text-secondary)] font-medium leading-none mt-0.5 truncate">
                  Counsellor Portal
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors mx-auto md:mx-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* User Profile Preview (Only when open) */}
      {sidebarOpen && user && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/20 m-3 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6f1d56] flex items-center justify-center text-white font-bold text-sm">
              {user.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-[var(--text-secondary)] truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive =
            item.href &&
            (pathname === item.href ||
              (item.id === "clients" &&
                pathname?.startsWith("/counsellor-portal/clients")) ||
              (item.id === "sessions" &&
                pathname?.startsWith("/counsellor-portal/sessions")) ||
              (item.id === "files" &&
                pathname?.startsWith("/counsellor-portal/files")) ||
              (item.id === "notes" &&
                pathname?.startsWith("/counsellor-portal/pages/session-notes")) ||
              (item.id === "psg" &&
                pathname?.startsWith("/counsellor-portal/pages/psg-form")) ||
              (item.id === "overview" && pathname === "/counsellor-portal"));

          const isAnySubActive =
            item.isExpandable &&
            item.subItems?.some((sub) => pathname === sub.href);

          if (item.isExpandable) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={item.onToggle}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isAnySubActive && !item.expanded
                      ? "text-white font-semibold"
                      : "text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
                  }`}
                  style={
                    isAnySubActive && !item.expanded
                      ? { backgroundColor: "#6f1c56" }
                      : {}
                  }
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${isAnySubActive && !item.expanded ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full font-bold bg-red-500 text-white leading-none">
                          {item.badge}
                        </span>
                      )}
                      {item.expanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </>
                  )}
                </button>

                {item.expanded && sidebarOpen && (
                  <div className="ml-8 space-y-1 pt-1 border-l border-gray-100 dark:border-gray-800 ml-5 pl-3">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.id}
                          href={subItem.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-colors ${
                            isSubActive
                              ? "bg-purple-50 dark:bg-purple-900/10 text-[#6f1c56] dark:text-purple-300 font-bold"
                              : "text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)]"
                          }`}
                        >
                          <span>{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "font-semibold shadow-sm text-white"
                  : "text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
              }`}
              style={isActive ? { backgroundColor: "#6f1c56" } : {}}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
              />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold leading-none ${
                        isActive
                          ? "bg-white/30 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-[var(--sidebar-border)] space-y-1">
        <Link
          href="/counsellor-portal/profile"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            pathname === "/counsellor-portal/profile"
              ? "text-white font-semibold"
              : "text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
          }`}
          style={
            pathname === "/counsellor-portal/profile"
              ? { backgroundColor: "#6f1c56" }
              : {}
          }
        >
          <Settings
            className={`w-5 h-5 flex-shrink-0 ${pathname === "/counsellor-portal/profile" ? "text-white" : "text-gray-400"}`}
          />
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </Link>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors ${
            sidebarOpen ? "" : "justify-center"
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
