"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [status, setStatus] = useState("checking"); // "checking" | "allowed" | "denied"

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve

    if (!user) {
      // AuthContext will already redirect to /login, just show loading
      return;
    }

    const checkAccess = async () => {
      try {
        if (user.role === "admin") {
          // Admins: fetch full list and check if admin is in the roles array
          const privileges = await apiService.getMenuPrivileges();
          const priv = privileges.find((p) => p.menu_id === menuId);
          if (priv && !priv.roles.includes("admin")) {
            setStatus("denied");
            router.replace("/dashboard");
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
            setStatus("denied");
            router.replace("/dashboard");
          }
        }
      } catch {
        // On error (network, auth) fall back to denying if not admin
        if (user.role === "admin") {
          setStatus("allowed"); // admins get benefit of the doubt on error
        } else {
          setStatus("denied");
          router.replace("/dashboard");
        }
      }
    };

    checkAccess();
  }, [user, authLoading, menuId, router]);

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
    return null; // router.replace already fired
  }

  return children;
}
