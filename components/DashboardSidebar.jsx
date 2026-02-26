"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import { usePushNotifications } from "@/lib/usePushNotifications";
import {
  Home,
  Video,
  UserCheck,
  Users,
  CalendarDays,
  Building2,
  CheckCheck,
  ClipboardList,
  Activity,
  Settings,
  LogOut,
  Menu,
  Info,
  UserCog,
  GitMerge,
  Tag,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
  Calendar,
} from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const isAdmin = user?.role === "admin";
  const [consultationCounts, setConsultationCounts] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
  });
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0);
  const [menuPrivileges, setMenuPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = React.useRef(false);
  const lastFetchRef = React.useRef(0);
  // Track previous counts to detect increases
  const prevPendingRef = React.useRef(null);
  const prevUpcomingRef = React.useRef(null);
  const { notify } = usePushNotifications();

  // Transform API consultation data to match component structure
  const transformConsultationData = (consultations) => {
    if (!Array.isArray(consultations)) {
      return [];
    }

    return consultations.map((consultation) => ({
      id: consultation.id,
      date: consultation.scheduled_at
        ? consultation.scheduled_at.split("T")[0]
        : null,
      status:
        consultation.status === "scheduled"
          ? "Booked"
          : consultation.status === "completed"
            ? "Completed"
            : consultation.status === "no_show"
              ? "No Show"
              : consultation.status === "cancelled"
                ? "Cancelled"
                : consultation.status,
    }));
  };

  // Fetch sidebar counts and privileges from backend with throttling
  useEffect(() => {
    const fetchSidebarData = async () => {
      // Prevent multiple simultaneous requests
      if (isFetchingRef.current) {
        return;
      }

      // Throttle: minimum 5 seconds between requests
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchRef.current;
      if (timeSinceLastFetch < 5000 && lastFetchRef.current > 0) {
        return;
      }

      try {
        isFetchingRef.current = true;
        lastFetchRef.current = now;

        // Fetch consultations and pending count (staff/admin only; counsellors get empty)
        const userRole = user?.role;
        const canFetchStaffData = userRole === "admin" || userRole === "staff";

        const [consultationsData, pendingCount, privilegesData] =
          await Promise.all([
            canFetchStaffData
              ? apiService.getConsultations()
              : Promise.resolve([]),
            canFetchStaffData
              ? apiService.getPendingMatchesCount()
              : Promise.resolve(0),
            // Admins get full list; staff/counsellors fetch their role-specific allowed menu IDs
            isAdmin
              ? apiService.getMenuPrivileges()
              : apiService.getMenuPrivilegesForRole(userRole),
          ]);

        // Transform consultations data
        const consultationsArray = Array.isArray(consultationsData)
          ? consultationsData
          : consultationsData?.data || [];
        const transformedConsultations =
          transformConsultationData(consultationsArray);

        // Calculate counts exactly like the consultations page
        const today = new Date().toISOString().split("T")[0];
        const todayCount = transformedConsultations.filter(
          (c) => c.date === today && c.status === "Booked",
        ).length;
        const upcomingCount = transformedConsultations.filter(
          (c) => c.status === "Booked",
        ).length;
        const completedCount = transformedConsultations.filter(
          (c) => c.status === "Completed",
        ).length;

        setConsultationCounts({
          today: todayCount,
          upcoming: upcomingCount,
          completed: completedCount,
        });
        setPendingMatchesCount(pendingCount || 0);
        setMenuPrivileges(privilegesData || []);

        // ── Push notifications for new items ──────────────────────────
        const newPending = pendingCount || 0;
        const newUpcoming = upcomingCount;

        if (
          prevPendingRef.current !== null &&
          newPending > prevPendingRef.current
        ) {
          const diff = newPending - prevPendingRef.current;
          notify(`${diff} new pending match${diff > 1 ? "es" : ""}`, {
            body: "A client is ready to be matched with a practitioner.",
          });
        }

        if (
          prevUpcomingRef.current !== null &&
          newUpcoming > prevUpcomingRef.current
        ) {
          const diff = newUpcoming - prevUpcomingRef.current;
          notify(`${diff} new upcoming consultation${diff > 1 ? "s" : ""}`, {
            body: "A new consultation has been booked.",
          });
        }

        prevPendingRef.current = newPending;
        prevUpcomingRef.current = newUpcoming;
      } catch (err) {
        // Silently handle rate limit errors - don't spam console
        if (err.message && !err.message.includes("Too Many Attempts")) {
          console.error("Error fetching sidebar data:", err);
        }
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    };

    fetchSidebarData();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchSidebarData, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const [matchesExpanded, setMatchesExpanded] = useState(
    pathname?.startsWith("/dashboard/pending-matches") ||
      pathname?.startsWith("/dashboard/completed-matches"),
  );

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview", href: "/dashboard" },
    {
      id: "consultations",
      icon: Video,
      label: "Consultations",
      badge: consultationCounts.upcoming,
      href: "/dashboard/consultations",
    },
    {
      id: "all-matches",
      icon: UserCheck,
      label: "All Matches",
      isExpandable: true,
      expanded: matchesExpanded,
      onToggle: () => setMatchesExpanded(!matchesExpanded),
      subItems: [
        {
          id: "pending-matches",
          label: "Pending Matches",
          icon: Clock,
          badge: pendingMatchesCount,
          href: "/dashboard/pending-matches",
        },
        {
          id: "completed-matches",
          label: "Completed Matches",
          icon: CheckCheck,
          href: "/dashboard/completed-matches",
        },
      ],
    },
    {
      id: "tcs",
      icon: Users,
      label: "Practitioners",
      href: "/dashboard/training-counsellors",
    },
    {
      id: "inductions",
      icon: CalendarDays,
      label: "Inductions",
      href: "/dashboard/inductions",
    },
    {
      id: "providers",
      icon: Building2,
      label: "Training Providers",
      href: "/dashboard/training-providers",
    },
    {
      id: "clients",
      icon: ClipboardList,
      label: "All Clients",
      href: "/dashboard/clients",
    },
    {
      id: "activity",
      icon: Activity,
      label: "Activity Log",
      href: "/dashboard/activity-log",
    },
    { id: "coupons", icon: Tag, label: "Coupons", href: "/dashboard/coupons" },
    {
      id: "consultation-slots",
      icon: Calendar,
      label: "Consultation Slots",
      href: "/dashboard/consultation-slots",
    },
    {
      id: "color-guide",
      icon: Info,
      label: "Color Guide",
      href: "/dashboard/color-guide",
    },
    {
      id: "matching-algo",
      icon: GitMerge,
      label: "Matching Logic",
      href: "/dashboard/matching-algorithm",
    },
    {
      id: "email-management",
      icon: Mail,
      label: "Email Management",
      href: "/dashboard/email-management",
    },
    {
      id: "users",
      icon: UserCog,
      label: "User Management",
      href: "/dashboard/users",
    },
  ];

  // Role-based filtering logic
  const filteredMenuItems = menuItems.filter((item) => {
    const userRole = user?.role;

    // Admin: check against fetched privileges (if loaded), otherwise see everything
    if (userRole === "admin") {
      if (menuPrivileges && menuPrivileges.length > 0) {
        const privilege = menuPrivileges.find((p) => p.menu_id === item.id);
        // Admins always see items in DB; only hide if explicitly set to empty roles
        if (privilege) {
          return privilege.roles.includes("admin");
        }
      }
      return true; // Default: admin sees everything not in DB
    }

    // For non-admins: privileges is an array of allowed menu_id strings (from getForRole)
    if (menuPrivileges && menuPrivileges.length > 0) {
      // getForRole returns an array of menu_id strings the role can access
      return menuPrivileges.includes(item.id);
    }

    // Static fallback while privileges are loading
    const adminOnly = [
      "coupons",
      "email-management",
      "users",
      "consultation-slots",
      "matching-algo",
    ];

    if (userRole === "staff") {
      return !adminOnly.includes(item.id);
    }

    if (userRole === "counsellor") {
      return item.id === "overview" || item.id === "activity";
    }

    return false;
  });

  return (
    <div
      className={`${sidebarOpen ? "w-64" : "w-20"} bg-white dark:bg-[var(--sidebar-bg)] border-r border-gray-200 dark:border-[var(--sidebar-border)] transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-30`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-[var(--sidebar-border)]">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: "#6f1d56" }}
              >
                VT
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Vanquish
                </h1>
                <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                  Admin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.id === "pending-matches" &&
              pathname?.startsWith("/dashboard/pending-matches")) ||
            (item.id === "clients" &&
              pathname?.startsWith("/dashboard/client-details")) ||
            (item.id === "tcs" &&
              pathname?.startsWith("/dashboard/training-counsellors/details"));

          if (item.isExpandable) {
            const isAnySubItemActive = item.subItems.some(
              (sub) => pathname === sub.href,
            );

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={item.onToggle}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isAnySubItemActive && !item.expanded
                      ? "bg-[#6f1c56] text-white font-semibold"
                      : "text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      {item.expanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>

                {item.expanded && sidebarOpen && (
                  <div className="ml-9 space-y-1">
                    {item.subItems
                      .filter((sub) => {
                        const userRole = user?.role;
                        if (userRole === "admin") {
                          // Check admin privilege for sub-items too
                          if (menuPrivileges && menuPrivileges.length > 0) {
                            const privilege = menuPrivileges.find(
                              (p) => p.menu_id === sub.id,
                            );
                            if (privilege)
                              return privilege.roles.includes("admin");
                          }
                          return true;
                        }
                        // Non-admins: menuPrivileges is array of accessible menu_id strings
                        if (menuPrivileges && menuPrivileges.length > 0) {
                          return menuPrivileges.includes(sub.id);
                        }
                        return userRole === "staff"; // Default fallback for subitems
                      })
                      .map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.id}
                            href={subItem.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                              isSubActive
                                ? "bg-purple-50 dark:bg-purple-900/20 text-[#6f1c56] dark:text-purple-300 font-semibold"
                                : "text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)]"
                            }`}
                          >
                            <div className="flex-1 flex items-center gap-2">
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4" />
                              )}
                              <span>{subItem.label}</span>
                            </div>
                            {subItem.badge !== undefined &&
                              subItem.badge > 0 && (
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                                    isSubActive
                                      ? "bg-[#6f1c56] text-white"
                                      : "bg-red-500 text-white"
                                  }`}
                                >
                                  {subItem.badge}
                                </span>
                              )}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "dark:bg-purple-900/30 font-semibold shadow-sm text-white"
                  : "text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
              }`}
              style={isActive ? { backgroundColor: "#6f1c56" } : {}}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                        isActive
                          ? item.badge > 0
                            ? "bg-white/30 text-white"
                            : "bg-white/20 text-white/80"
                          : item.badge > 0
                            ? "bg-red-500 dark:bg-red-600 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
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
      <div className="p-4 border-t border-gray-200 dark:border-[var(--sidebar-border)] space-y-2 flex-shrink-0">
        <Link
          href="/dashboard/settings"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === "/dashboard/settings"
              ? "dark:bg-purple-900/30 font-semibold shadow-sm"
              : "text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
          } ${sidebarOpen ? "" : "justify-center"}`}
          style={
            pathname === "/dashboard/settings"
              ? { backgroundColor: "#6f1c56", color: "#ffffff" }
              : {}
          }
        >
          <Settings
            className={`w-5 h-5 flex-shrink-0 ${pathname === "/dashboard/settings" ? "dark:text-purple-300" : ""}`}
            style={
              pathname === "/dashboard/settings" ? { color: "#ffffff" } : {}
            }
          />
          {sidebarOpen && (
            <span
              className={`text-sm font-medium ${pathname === "/dashboard/settings" ? "dark:text-purple-300" : ""}`}
              style={
                pathname === "/dashboard/settings" ? { color: "#ffffff" } : {}
              }
            >
              Settings
            </span>
          )}
        </Link>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${sidebarOpen ? "" : "justify-center"}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
