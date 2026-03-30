"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "vanquish_push_enabled";

/**
 * Custom hook that wraps the browser Notification API.
 *
 * Returns:
 *  - pushEnabled   : boolean – whether the user has push turned on AND permission granted
 *  - permission    : NotificationPermission | "unsupported"
 *  - enablePush()  : async function – request permission then persist preference
 *  - disablePush() : function – turn off (does NOT revoke browser permission)
 *  - notify(title, options) : show a push notification (no-op when disabled / denied)
 */
export function usePushNotifications() {
  const supported = typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] = useState(() => {
    if (!supported) return "unsupported";
    return Notification.permission;
  });

  const [pushEnabled, setPushEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true" && Notification.permission === "granted";
  });

  // Keep permission state in sync if user changes it externally
  useEffect(() => {
    if (!supported) return;
    // Permissions are not observable via a standard event; we re-read on focus
    const onFocus = () => {
      const current = Notification.permission;
      setPermission(current);
      if (current !== "granted") {
        setPushEnabled(false);
        localStorage.setItem(STORAGE_KEY, "false");
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [supported]);

  const enablePush = useCallback(async () => {
    if (!supported) return "unsupported";

    let perm = Notification.permission;

    if (perm === "denied") {
      return "denied"; // browser blocked – caller should inform user
    }

    if (perm !== "granted") {
      perm = await Notification.requestPermission();
    }

    setPermission(perm);

    if (perm === "granted") {
      setPushEnabled(true);
      localStorage.setItem(STORAGE_KEY, "true");
      return "granted";
    }

    // User dismissed / denied
    setPushEnabled(false);
    localStorage.setItem(STORAGE_KEY, "false");
    return perm;
  }, [supported]);

  const disablePush = useCallback(() => {
    setPushEnabled(false);
    localStorage.setItem(STORAGE_KEY, "false");
  }, []);

  const notify = useCallback(
    (title, options = {}) => {
      if (!pushEnabled || !supported || Notification.permission !== "granted") {
        return;
      }
      try {
        const n = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
        // Auto-close after 8 seconds
        setTimeout(() => n.close(), 8000);
      } catch (_) {
        // Silently ignore – e.g. in sandboxed iframes
      }
    },
    [pushEnabled, supported],
  );

  return { pushEnabled, permission, enablePush, disablePush, notify };
}
