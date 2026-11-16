"use client";
import { useState } from "react";
import { MonitorSmartphone } from "lucide-react";
import apiService from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { openCounsellorPortalAs } from "@/lib/impersonation";

/**
 * Admin / super admin: open this counsellor's portal, read-only, in a new tab.
 */
export default function ViewPortalButton({ tcUuid, className = "", label = "View portal" }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!tcUuid || !["admin", "super_admin"].includes(user?.role)) return null;

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    try {
      await openCounsellorPortalAs(tcUuid, (uuid) => apiService.startImpersonation(uuid));
    } catch (err) {
      alert(err?.message || "The counsellor's portal could not be opened.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Open this counsellor's portal in a new tab (read-only)"
      className={
        className ||
        "px-4 py-2 border border-[var(--border-color)] text-[var(--button-secondary-text)] rounded-lg bg-[var(--button-secondary-bg)] hover:opacity-90 font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
      }
    >
      <MonitorSmartphone className="w-4 h-4" />
      {busy ? "Opening…" : label}
    </button>
  );
}
