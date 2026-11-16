"use client";
import { useEffect, useState } from "react";
import {
  IMPERSONATION_PAYLOAD,
  IMPERSONATION_READY,
  setImpersonation,
} from "@/lib/impersonation";

/**
 * Opened by an admin's "View portal" button. Receives the read-only token
 * from the admin's tab (postMessage), keeps it in this tab's sessionStorage
 * only, then loads the counsellor portal.
 */
export default function ViewAsPage() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const opener = window.opener;
    if (!opener) {
      setError("Open this from the counsellor's profile using \"View portal\".");
      return undefined;
    }

    const origin = window.location.origin;
    let done = false;

    const onMessage = (event) => {
      if (event.origin !== origin || event.source !== opener) return;
      if (event.data?.type !== IMPERSONATION_PAYLOAD || !event.data.payload?.token) return;
      done = true;
      setImpersonation(event.data.payload);
      // Full load so the app signs in with the token from sessionStorage.
      window.location.replace("/counsellor-portal");
    };
    window.addEventListener("message", onMessage);

    const ask = () => {
      if (!done) opener.postMessage({ type: IMPERSONATION_READY }, origin);
    };
    ask();
    const interval = setInterval(ask, 500);
    const timeout = setTimeout(() => {
      if (!done) setError("The portal could not be opened. Close this tab and try again.");
      clearInterval(interval);
    }, 30000);

    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p className="text-sm text-gray-600">{error || "Opening the counsellor's portal (read-only)…"}</p>
    </div>
  );
}
