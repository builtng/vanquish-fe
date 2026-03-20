"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";

/**
 * PageGuard - Protects a page based on menu_privileges DB records.
 *
 * Usage:
 *   <PageGuard menuId="consultation-slots">
 *     <YourPageContent />
 *   </PageGuard>
 *
 * The `menuId` must match the menu_id field in the menu_privileges table.
 * Users whose role is not in that row's `roles` array are redirected to /dashboard.
 *
 * Admins always have access (their role must be in the DB roles array,
 * or we fall back to allowing access if the row doesn't exist).
 */
export default function PageGuard({ menuId, children }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking"); // "checking" | "allowed" | "denied"

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve

    if (!user) {
      // AuthContext will already redirect to /login, just show loading
      return;
    }

    const checkAccess = async () => {
      const isAdminRole = user.role === "admin" || user.role === "super_admin";
      
      const denyAccess = () => {
        setStatus("denied");
        // Only redirect if NOT already on the dashboard to avoid loops
        if (pathname !== "/dashboard" && pathname !== "/dashboard/") {
          router.replace("/dashboard");
        }
      };

      try {
        if (isAdminRole) {
          // Admins / Super-admins: fetch full list and check if role is allowed
          const privileges = await apiService.getMenuPrivileges();
          const priv = privileges.find((p) => p.menu_id === menuId);
          if (
            priv &&
            !priv.roles.includes("admin") &&
            !priv.roles.includes("super_admin")
          ) {
            denyAccess();
          } else {
            setStatus("allowed");
          }
        } else {
          // Staff / Counsellor: fetch allowed menu IDs for their role
          const allowedIds = await apiService.getMenuPrivilegesForRole(
            user.role,
          );
          if (Array.isArray(allowedIds) && allowedIds.includes(menuId)) {
            setStatus("allowed");
          } else {
            denyAccess();
          }
        }
      } catch (error) {
        console.error("Access check error:", error);
        // On error (network, auth) fall back to denying if not admin
        if (isAdminRole) {
          setStatus("allowed"); // admins get benefit of the doubt on error
        } else {
          denyAccess();
        }
      }
    };

    checkAccess();
  }, [user, authLoading, menuId, router, pathname]);

  if (authLoading || status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
          <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
            Checking access…
          </p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    // If we're already on /dashboard, don't show blank, show a message
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[var(--background)]">
          <div className="bg-white dark:bg-[var(--card-bg)] p-8 rounded-xl shadow-lg border border-red-100 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-[var(--text-secondary)] mb-6 text-sm">
              You do not have permission to view the dashboard overview. 
              Please contact your administrator if you believe this is an error.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={() => apiService.clearToken() || (window.location.href = "/login")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-[var(--text-secondary)] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null; // router.replace already fired for other pages
  }

  return children;
}
