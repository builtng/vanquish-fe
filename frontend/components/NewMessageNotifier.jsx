"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getEcho } from "@/lib/echo";
import { showBrowserNotification, requestNotificationPermission } from "@/lib/notifications";
import { usePathname } from "next/navigation";

/**
 * NewMessageNotifier
 * ──────────────────
 * Listens for new messages globally and shows browser notifications.
 */
export default function NewMessageNotifier() {
  const { user } = useAuth();
  const pathname = usePathname();
  const lastNotifiedId = useRef(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`messages.${user.id}`);
    
    channel.listen(".message.sent", (e) => {
      const message = e.message;
      
      // Don't notify if we are the sender
      if (String(message.from_user_id) === String(user.id)) return;
      
      // Avoid duplicate notifications
      if (lastNotifiedId.current === message.id) return;
      lastNotifiedId.current = message.id;

      // Don't show browser notification if we are already on the messages page
      // (The message page has its own real-time UI)
      if (pathname === "/dashboard/messages") return;

      const senderName = message.from_user?.name || message.fromUser?.name || "Someone";
      const snippet = message.message?.replace(/<[^>]+>/g, '').substring(0, 100);

      showBrowserNotification(`New message from ${senderName}`, {
        body: snippet,
        url: "/dashboard/messages"
      });
    });

    // Also listen for staff group messages if staff
    let staffChannel = null;
    if (user.role !== 'counsellor') {
      staffChannel = echo.private(`messages.staff_group`);
      staffChannel.listen(".message.sent", (e) => {
        const message = e.message;
        if (String(message.from_user_id) === String(user.id)) return;
        if (lastNotifiedId.current === message.id) return;
        lastNotifiedId.current = message.id;
        if (pathname === "/dashboard/messages") return;

        const senderName = message.from_user?.name || message.fromUser?.name || "Someone";
        const snippet = message.message?.replace(/<[^>]+>/g, '').substring(0, 100);

        showBrowserNotification(`New message from ${senderName}`, {
          body: snippet,
          url: "/dashboard/messages"
        });
      });
    }

    return () => {
      try {
        echo.leave(`messages.${user.id}`);
        if (staffChannel) echo.leave(`messages.staff_group`);
      } catch (err) {}
    };
  }, [user?.id, pathname]);

  return null;
}
