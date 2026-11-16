"use client";
import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import apiService from "@/lib/api";
import { clearImpersonation, getImpersonation } from "@/lib/impersonation";

/**
 * Fixed banner in a "View portal" tab: who is being viewed, read-only, Exit.
 */
export default function ImpersonationBanner() {
  const [info, setInfo] = useState(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setInfo(getImpersonation());
  }, []);

  if (!info) return null;

  const exit = async () => {
    setExiting(true);
    try {
      await apiService.stopImpersonation();
    } catch (err) {
      console.error("Stop viewing portal:", err);
    } finally {
      clearImpersonation();
      window.close();
      // If the browser keeps the tab open, go back to the admin dashboard.
      setTimeout(() => window.location.replace("/dashboard/training-counsellors"), 300);
    }
  };

  const name = info.counsellor?.name || "counsellor";

  return (
    <>
      <div
        role="status"
        className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-3 bg-amber-500 text-black text-sm font-medium px-4 py-2 shadow"
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
        <span>Viewing as {name}, read-only</span>
        <button
          type="button"
          onClick={exit}
          disabled={exiting}
          className="inline-flex items-center gap-1 rounded bg-black/80 text-white px-2 py-0.5 hover:bg-black disabled:opacity-60"
        >
          <X className="w-3 h-3" aria-hidden="true" /> {exiting ? "Exiting…" : "Exit"}
        </button>
      </div>
      {/* keeps page content clear of the fixed banner */}
      <div aria-hidden="true" className="h-9" />
    </>
  );
}
