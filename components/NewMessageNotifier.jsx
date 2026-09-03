"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { getEcho } from "@/lib/echo";
import { showBrowserNotification, requestNotificationPermission } from "@/lib/notifications";
import { playNotificationChime, unlockAudio } from "@/lib/audio";
import apiService from "@/lib/api";
import { MessageSquare, X, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";

/**
 * NewMessageNotifier
 * ──────────────────
 * Dual-mode real-time & polling notification system for new messages:
 * 1. Plays an audio chime on new incoming messages.
 * 2. Renders an interactive in-system visual nudge banner/toast card.
 * 3. Sends a desktop browser notification when tab is in background/permission granted.
 * 4. Includes a 20s polling fallback in case WebSocket/Echo is unavailable.
 */
export default function NewMessageNotifier() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [toasts, setToasts] = useState([]);
  const shownMessageIdsRef = useRef(new Set());
  const timeoutsRef = useRef({});
  const lastUnreadCountRef = useRef(null);
  const isPollingRef = useRef(false);

  // Determine target chat route based on user role
  const chatRoute = user?.role === "counsellor" ? "/counsellor-portal/messages" : "/dashboard/messages";
  const isOnChatPage = pathname === chatRoute || pathname === "/dashboard/messages" || pathname === "/counsellor-portal/messages";

  // Request browser notification permission and unlock audio context on mount
  useEffect(() => {
    requestNotificationPermission();

    const handleFirstInteraction = () => {
      unlockAudio();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const dismissToast = useCallback((toastId) => {
    if (timeoutsRef.current[toastId]) {
      clearTimeout(timeoutsRef.current[toastId]);
      delete timeoutsRef.current[toastId];
    }
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const triggerMessageNudge = useCallback((msg) => {
    if (!msg || !msg.id) return;

    // Avoid showing the same message multiple times
    if (shownMessageIdsRef.current.has(msg.id)) return;
    shownMessageIdsRef.current.add(msg.id);

    // Play pleasant audio chime
    playNotificationChime();

    // Determine sender name
    const senderName = msg.from_user?.name || msg.fromUser?.name || (msg.type === "counsellor_to_staff" ? "Counsellor" : "Admin Team");
    const toastId = `msg-${msg.id}-${Date.now()}`;

    const newToast = {
      toastId,
      messageId: msg.id,
      title: `New message from ${senderName}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      url: chatRoute,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    // Auto-dismiss toast after 7 seconds
    timeoutsRef.current[toastId] = setTimeout(() => {
      dismissToast(toastId);
    }, 7000);

    // Also trigger browser desktop notification if not actively looking at chat
    if (!isOnChatPage) {
      showBrowserNotification(`New message from ${senderName}`, {
        body: "A new message is waiting in your portal.",
        url: chatRoute,
      });
    }
  }, [chatRoute, dismissToast, isOnChatPage]);

  // ── 1. Real-Time WebSocket / Echo Listeners ──────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    // User's private message channel
    const userChannel = echo.private(`messages.${user.id}`);
    userChannel.listen(".message.sent", (e) => {
      const msg = e.message;
      if (!msg) return;
      // Don't notify if current user is the sender
      if (String(msg.from_user_id) === String(user.id)) return;

      triggerMessageNudge(msg);
    });

    // Staff group channel
    let staffChannel = null;
    const staffRoles = ["super_admin", "admin", "staff", "consultation_staff", "compliance_officer"];
    if (staffRoles.includes(user.role)) {
      staffChannel = echo.private(`messages.staff_group`);
      staffChannel.listen(".message.sent", (e) => {
        const msg = e.message;
        if (!msg) return;
        if (String(msg.from_user_id) === String(user.id)) return;

        triggerMessageNudge(msg);
      });
    }

    return () => {
      try {
        echo.leave(`messages.${user.id}`);
        if (staffChannel) echo.leave(`messages.staff_group`);
      } catch (err) {}
    };
  }, [user?.id, user?.role, triggerMessageNudge]);

  // ── 2. Periodic Polling Fallback (every 20s) ───────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const checkNewMessages = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        const res = await apiService.getUnreadMessageCount();
        const currentCount = res?.count ?? 0;

        // If unread count has increased, fetch recent conversations to locate the newest message
        if (lastUnreadCountRef.current !== null && currentCount > lastUnreadCountRef.current) {
          const convs = await apiService.request("/messages/conversations");
          if (Array.isArray(convs)) {
            for (const conv of convs) {
              const lastMsg = conv.last_message;
              if (lastMsg && lastMsg.id && String(lastMsg.from_user_id) !== String(user.id) && !lastMsg.is_read) {
                triggerMessageNudge(lastMsg);
              }
            }
          }
        }
        lastUnreadCountRef.current = currentCount;
      } catch (err) {
        // silent fallback
      } finally {
        isPollingRef.current = false;
      }
    };

    // Initial check to set baseline count
    checkNewMessages();

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        checkNewMessages();
      }
    };

    const interval = setInterval(checkNewMessages, 30000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id, triggerMessageNudge]);

  if (!toasts.length) return null;

  return (
    <>
      {/* ── Floating In-System Nudge Notifications ──────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-[99999] flex flex-col-reverse gap-3 items-end pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.toastId}
            onClick={() => {
              dismissToast(toast.toastId);
              router.push(toast.url);
            }}
            className="pointer-events-auto cursor-pointer w-84 sm:w-96 bg-white dark:bg-[#1e1e2e] border border-purple-100 dark:border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden hover:shadow-purple-500/10 transition-all duration-200 transform hover:-translate-y-0.5"
            style={{ animation: "msg-nudgeIn 0.38s cubic-bezier(0.22,1,0.36,1)" }}
          >
            {/* Top brand gradient accent stripe */}
            <div
              className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg, #6f1d56, #a33d80, #c05899)" }}
            />

            <div className="p-4 flex gap-3.5 items-start">
              {/* Message icon with pulse badge */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white"
                  style={{ background: "linear-gradient(135deg, #6f1d56, #a33d80)" }}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                </span>
              </div>

              {/* Toast Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {toast.title}
                  </p>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {toast.time}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  A new secure message is waiting in your portal.
                </p>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-900 transition-colors">
                  <span>View Message</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(toast.toastId);
                }}
                className="p-1 -mt-1 -mr-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                aria-label="Dismiss message notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-in & pulse keyframes */}
      <style jsx global>{`
        @keyframes msg-nudgeIn {
          from {
            opacity: 0;
            transform: translateX(120%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
