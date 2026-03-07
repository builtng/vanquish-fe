"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getEcho } from "@/lib/echo";
import apiService from "@/lib/api";

export default function RealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const timeoutsRef = useRef({});

  const addNotification = (note) => {
    const id = Date.now();
    const newNote = { ...note, id, dismissed: false };

    setNotifications((prev) => [newNote, ...prev].slice(0, 20));
    setUnreadCount((c) => c + 1);

    // Auto-dismiss after 6 seconds
    timeoutsRef.current[id] = setTimeout(() => {
      dismissNotification(id);
    }, 6000);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
    clearTimeout(timeoutsRef.current[id]);
    // Remove fully after animation
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 400);
  };

  // Poll + Echo listener
  useEffect(() => {
    if (!user?.id) return;

    // Initial load of unread notes
    const loadUnread = async () => {
      try {
        const res = await apiService.getUnreadStaffNotes();
        const notes = res?.data || [];
        setUnreadCount(notes.length);
      } catch {}
    };
    loadUnread();

    // Echo real-time listener
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`staff.${user.id}`);
    channel.listen(".staff.note.sent", (e) => {
      const note = e.note;
      addNotification({
        type: "staff_note",
        title: `Note from ${note.admin?.name || "Admin"}`,
        body: note.note,
        href: "/dashboard/staff-notes",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });

    return () => {
      echo.leave(`staff.${user.id}`);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [user?.id]);

  // Active toast notifications (bottom-right popups)
  const toastNotifications = notifications.filter((n) => !n.dismissed).slice(0, 4);

  return (
    <>
      {/* ─── Toast Popups (WhatsApp / Facebook style) ─── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 items-end pointer-events-none">
        {toastNotifications.map((note) => (
          <div
            key={note.id}
            className="pointer-events-auto w-80 bg-white dark:bg-[#1e1e2e] border border-gray-100 dark:border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden"
            style={{
              animation: "slideInRight 0.35s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Purple accent bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#6f1d56,#9b3d7e)" }} />

            <div className="p-4 flex gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
                style={{ background: "linear-gradient(135deg,#6f1d56,#9b3d7e)" }}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {note.title}
                  </p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">{note.time}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {note.body}
                </p>
                <Link
                  href={note.href || "/dashboard/staff-notes"}
                  className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View Note <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismissNotification(note.id)}
                className="p-1 -mt-1 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </>
  );
}
