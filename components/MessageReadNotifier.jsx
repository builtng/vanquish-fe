"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getEcho } from "@/lib/echo";
import { CheckCheck, X, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";

/**
 * MessageReadNotifier
 * ───────────────────
 * Listens for 'message.read' events via Laravel Echo.
 * When someone reads a message YOU sent, this component shows a toast.
 */
export default function MessageReadNotifier() {
  const { user } = useAuth();
  const shownIdsRef = useRef(new Set());
  const timeoutsRef = useRef({});
  const [toasts, setToasts] = useState([]);

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const showReadToast = (message) => {
    // We only care about messages SENT by the current user
    if (String(message.from_user_id) !== String(user?.id)) return;
    
    // Avoid duplicates
    const key = `${message.id}-read`;
    if (shownIdsRef.current.has(key)) return;
    shownIdsRef.current.add(key);

    const recipientName = message.to_training_counsellor?.name || 
                          message.toTrainingCounsellor?.name || 
                          message.to_user?.name || 
                          message.toUser?.name || 
                          "Recipient";
    const toastId = `read-${message.id}-${Date.now()}`;
    
    const item = {
      toastId,
      title: "Message Read",
      body: `${recipientName} has read your message: "${message.subject}"`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messageId: message.id
    };

    setToasts((prev) => [item, ...prev].slice(0, 3));

    // Browser Push Notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Message Read", {
        body: `${recipientName} read: ${message.subject}`,
        icon: "/favicon.ico",
      });
    }

    // Auto-dismiss after 6s
    timeoutsRef.current[toastId] = setTimeout(() => dismiss(toastId), 6000);
  };

  const dismiss = (toastId) => {
    if (timeoutsRef.current[toastId]) {
      clearTimeout(timeoutsRef.current[toastId]);
      delete timeoutsRef.current[toastId];
    }
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  };

  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    // Listen on the user's private messages channel
    const channel = echo.private(`messages.${user.id}`);
    
    channel.listen(".message.read", (e) => {
      showReadToast(e.message);
    });

    return () => {
      try {
        echo.leave(`messages.${user.id}`);
      } catch (err) {
        // silent
      }
    };
  }, [user?.id]);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-[9999] flex flex-col-reverse gap-3 items-end pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.toastId}
          className="pointer-events-auto w-80 bg-white dark:bg-[#1a1b26] border border-blue-100 dark:border-blue-900/30 rounded-2xl shadow-2xl overflow-hidden"
          style={{ animation: "read-slideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {/* Progress stripe */}
          <div className="h-1 w-full bg-blue-500" />

          <div className="p-4 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <CheckCheck className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {t.title}
                </p>
                <span className="text-[10px] text-gray-400">{t.time}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {t.body}
              </p>
            </div>

            <button
              onClick={() => dismiss(t.toastId)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      ))}

      <style jsx global>{`
        @keyframes read-slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
