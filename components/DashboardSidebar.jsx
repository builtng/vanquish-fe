"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { useBranding } from "@/contexts/BrandingContext";
import { useTheme } from "next-themes";
import {
  Home,
  Video,
  UserCheck,
  Users,
  Building2,
  CheckCheck,
  ClipboardList,
  Activity,
  Settings,
  LogOut,
  Menu,
  UserCog,
  GitMerge,
  Tag,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
  Calendar,
  CalendarDays,
  CalendarCheck,
  MessageSquare,
  Palette,
  BarChart2,
  GitBranch,
  Shuffle,
  Info,
} from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { branding } = useBranding();
  const { theme } = useTheme();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  
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
      const canFetchStaffData = userRole === "admin" || userRole === "super_admin" || userRole === "staff" || userRole === "consultation_staff" || userRole === "compliance_officer";

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

  useEffect(() => {
    fetchSidebarData();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchSidebarData, 30000);

    return () => clearInterval(interval);
  }, [isAdmin, user?.role]);

  const [appsExpanded, setAppsExpanded] = useState(pathname?.startsWith("/dashboard/trainee-applications"));
  const [consultExpanded, setConsultExpanded] = useState(
    pathname?.startsWith("/dashboard/consultations") ||
    pathname?.startsWith("/dashboard/pending-matches") ||
    pathname?.startsWith("/dashboard/completed-matches")
  );
  const [tcExpanded, setTcExpanded] = useState(pathname?.startsWith("/dashboard/training-counsellors") || pathname?.startsWith("/dashboard/inductions") || pathname?.startsWith("/dashboard/training-providers"));
  const [commExpanded, setCommExpanded] = useState(pathname?.startsWith("/dashboard/staff-notes") || pathname?.startsWith("/dashboard/messages"));
  const [settingsExpanded, setSettingsExpanded] = useState(
    pathname?.startsWith("/dashboard/email-management") || 
    pathname?.startsWith("/dashboard/matching-algorithm") || 
    pathname?.startsWith("/dashboard/consultation-slots") || 
    pathname?.startsWith("/dashboard/users") ||
    pathname?.startsWith("/dashboard/coupons") ||
    pathname?.startsWith("/dashboard/color-guide") ||
    pathname === "/dashboard/settings"
  );

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview", href: "/dashboard" },
    
    // Applications Group
    {
      id: "applications-group",
      icon: ClipboardList,
      label: "Applications",
      isExpandable: true,
      expanded: appsExpanded,
      onToggle: () => setAppsExpanded(!appsExpanded),
      subItems: [
        {
          id: "trainee-applications",
          label: "Trainee Applications",
          icon: ClipboardList,
          href: "/dashboard/trainee-applications",
        },
        {
          id: "video-reviews",
          label: "Video Reviews",
          icon: Video,
          href: "/dashboard/trainee-applications?filter=video",
        },
      ],
    },

    // Consultations Group
    {
      id: "consultations-group",
      icon: Video,
      label: "Consultations",
      isExpandable: true,
      expanded: consultExpanded,
      onToggle: () => setConsultExpanded(!consultExpanded),
      subItems: [
        {
          id: "pending-matches",
          label: "Pending Matches",
          icon: Clock,
          badge: pendingMatchesCount,
          href: "/dashboard/pending-matches",
        },
        {
          id: "consultations",
          label: "Consultations",
          icon: CheckCheck,
          badge: consultationCounts.upcoming,
          href: "/dashboard/consultations",
        },
        {
          id: "completed-matches",
          label: "All Matches",
          icon: Shuffle,
          href: "/dashboard/completed-matches",
        },
      ],
    },

    // TC Management Group
    {
      id: "tc-management-group",
      icon: Users,
      label: "TC Management",
      isExpandable: true,
      expanded: tcExpanded,
      onToggle: () => setTcExpanded(!tcExpanded),
      subItems: [
        {
          id: "tcs",
          label: "Practitioners",
          icon: Users,
          href: "/dashboard/training-counsellors",
        },
        {
          id: "inductions",
          label: "Inductions",
          icon: CalendarDays,
          href: "/dashboard/inductions",
        },
        {
          id: "providers",
          label: "Training Providers",
          icon: Building2,
          href: "/dashboard/training-providers",
        },
      ],
    },

    // Reports Group
    {
      id: "reports-group",
      icon: BarChart2,
      label: "Reports",
      href: "/dashboard/reports",
    },

    // Activity Log
    {
      id: "activity",
      icon: Activity,
      label: "Activity Log",
      href: "/dashboard/activity-log",
    },

    // Communications Group
    {
      id: "communications-group",
      icon: MessageSquare,
      label: "Communications",
      isExpandable: true,
      expanded: commExpanded,
      onToggle: () => setCommExpanded(!commExpanded),
      subItems: [
        {
          id: "staff-notes",
          label: "Staff Notes",
          icon: MessageSquare,
          href: "/dashboard/staff-notes",
        },
      ],
    },

    // Settings Group
    {
      id: "settings-group",
      icon: Settings,
      label: "Settings",
      isExpandable: true,
      expanded: settingsExpanded,
      onToggle: () => setSettingsExpanded(!settingsExpanded),
      subItems: [
        {
          id: "email-management",
          label: "Email Management",
          icon: Mail,
          href: "/dashboard/email-management",
        },
        {
          id: "matching-algo",
          label: "Matching Logic",
          icon: GitMerge,
          href: "/dashboard/matching-algorithm",
        },
        {
          id: "consultation-slots",
          label: "Consultation Slots",
          icon: CalendarCheck,
          href: "/dashboard/consultation-slots",
        },
        {
          id: "users",
          label: "User Management",
          icon: UserCog,
          href: "/dashboard/users",
        },
        {
          id: "coupons",
          label: "Coupons",
          icon: Tag,
          href: "/dashboard/coupons",
        },
        {
          id: "color-guide",
          label: "Color Guide",
          icon: Info,
          href: "/dashboard/color-guide",
        },
        {
          id: "account-settings",
          label: "Account Settings",
          icon: Settings,
          href: "/dashboard/settings",
        },
      ],
    },

    {
      id: "clients",
      icon: ClipboardList,
      label: "All Clients",
      href: "/dashboard/clients",
    },
  ];

  // Role-based filtering logic
  const filteredMenuItems = menuItems.filter((item) => {
    const userRole = user?.role;

    // Admin/Super Admin: check against fetched privileges (if loaded), otherwise see everything
    if (userRole === "admin" || userRole === "super_admin") {
      if (menuPrivileges && menuPrivileges.length > 0) {
        const privilege = menuPrivileges.find((p) => p.menu_id === item.id);
        // Admins always see items in DB; only hide if explicitly set to empty roles
        if (privilege) {
          return privilege.roles.includes("admin") || privilege.roles.includes("super_admin");
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
      "color-guide",
    ];

    if (userRole === "staff") {
      return !adminOnly.includes(item.id);
    }

    if (userRole === "consultation_staff") {
      const consultationStaffAllowed = [
        "overview",
        "consultations",
        "consultation-slots",
        "clients",
        "trainee-applications",
        "staff-notes"
      ];
      return consultationStaffAllowed.includes(item.id);
    }

    if (userRole === "compliance_officer") {
      const complianceDenied = ["coupons", "matching-algo", "users"];
      return !complianceDenied.includes(item.id);
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
            <div className="flex items-center gap-3 overflow-hidden">
              {branding.platform_logo_url ? (
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                   <img 
                    src={(theme === 'dark' && branding.platform_logo_dark_url) ? branding.platform_logo_dark_url : branding.platform_logo_url} 
                    alt={branding.company_name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  {branding.company_name?.substring(0, 2).toUpperCase() || "VT"}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] truncate">
                  {branding.company_name || "Vanquish"}
                </h1>
                <p className="text-[10px] text-gray-600 dark:text-[var(--text-secondary)] truncate">
                  {branding.company_tagline || (isAdmin ? "Admin Portal" : "Practitioner")}
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
