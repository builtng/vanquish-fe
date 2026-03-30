"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import { getEcho } from "@/lib/echo";
import { Bell, MessageSquare, X, ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * StaffNoteNotifier
 * ─────────────────
 * Dual-mode notification system:
 *  1. Real-time: Laravel Echo (Pusher/Reverb) — instant push when admin sends a note.
 *  2. Polling fallback: checks every 30s in case Echo is unavailable.
 *
 * Renders WhatsApp/Facebook-style toast cards in the bottom-right corner.
 */
export default function StaffNoteNotifier() {
  const { user } = useAuth();
  const checkingRef = useRef(false);
  const shownIdsRef = useRef(new Set());
  const timeoutsRef = useRef({});
  const [toasts, setToasts] = useState([]);

  const showNoteToast = (note) => {
    // Avoid showing the same note twice (polling + Echo can race)
    if (shownIdsRef.current.has(note.id)) return;
    shownIdsRef.current.add(note.id);

    const toastId = `${note.id}-${Date.now()}`;
    const item = {
      toastId,
      title: `Note from ${note.admin?.name || "Admin"}`,
      body: note.note,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setToasts((prev) => [item, ...prev].slice(0, 5));

    // Auto-dismiss after 8 s
    timeoutsRef.current[toastId] = setTimeout(() => dismiss(toastId), 8000);

    // Mark as read in background
    apiService.markStaffNoteAsRead(note.id).catch(() => {});
  };

  const dismiss = (toastId) => {
    clearTimeout(timeoutsRef.current[toastId]);
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  };

  // ── Polling fallback ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const checkNotes = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      try {
        const response = await apiService.getUnreadStaffNotes();
        const notes = response?.data || [];
        for (const note of notes) {
          showNoteToast(note);
        }
      } catch {
        // silent
      } finally {
        checkingRef.current = false;
      }
    };

    checkNotes();
    const interval = setInterval(checkNotes, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Real-time Echo listener ───────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`staff.${user.id}`);
    channel.listen(".staff.note.sent", (e) => {
      showNoteToast(e.note);
    });

    return () => {
      try { echo.leave(`staff.${user.id}`); } catch {}
    };
  }, [user?.id]);

  if (!toasts.length) return null;

  return (
    <>
      {/* ── Toast Cards ────────────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 items-end pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.toastId}
            className="pointer-events-auto w-80 bg-white dark:bg-[#1e1e2e] border border-gray-100 dark:border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: "ntf-slideIn 0.35s cubic-bezier(0.22,1,0.36,1)" }}
          >
            {/* Accent stripe */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#6f1d56,#a33d80)" }} />

            <div className="p-4 flex gap-3 items-start">
              {/* Avatar-style icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ background: "linear-gradient(135deg,#6f1d56,#a33d80)" }}
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {t.title}
                  </p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{t.time}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {t.body}
                </p>
                <Link
                  href="/dashboard/staff-notes"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View Note <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(t.toastId)}
                className="p-1 -mt-1 -mr-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Keyframe */}
      <style jsx global>{`
        @keyframes ntf-slideIn {
          from { opacity: 0; transform: translateX(120%) scale(0.92); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </>
  );
}
