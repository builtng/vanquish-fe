"use client";
import { useState, useEffect } from "react";

export default function MaintenancePage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceMessage = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiUrl}/maintenance`);
        if (res.ok) {
          const data = await res.json();
          setMessage(data.message || "");
        }
      } catch {
        // Silently fallback to default
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceMessage();
  }, []);

  const displayMessage =
    message ||
    "We're currently performing scheduled maintenance to improve your experience. Our services will be back online shortly.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0a14] via-[#2d1127] to-[#1a0a14] text-white px-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#6f1d56] opacity-10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#9b2d7a] opacity-10 blur-3xl animate-pulse [animation-delay:1.5s]" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg"
            style={{ background: "linear-gradient(135deg,#6f1d56,#9b2d7a)" }}
          >
            VT
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Vanquish Therapies
          </span>
        </div>

        {/* Gear icon */}
        <div className="flex items-center justify-center">
          <svg
            className="w-24 h-24 text-[#9b2d7a] animate-spin [animation-duration:8s]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Heading + Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            System Maintenance
          </h1>
          {loading ? (
            <div className="h-6 w-3/4 mx-auto rounded bg-white/10 animate-pulse" />
          ) : (
            <p className="text-lg text-white/70 leading-relaxed">
              {displayMessage}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 w-3/4 mx-auto" />

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            { icon: "🔧", label: "Maintenance in progress" },
            { icon: "🔒", label: "Your data is safe" },
            { icon: "⏱️", label: "Back online soon" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl py-4 px-3 flex flex-col items-center gap-2 backdrop-blur"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-white/70 text-center leading-snug">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Staff login link */}
        <p className="text-white/40 text-sm">
          Are you staff?{" "}
          <a
            href="/login"
            className="text-[#c45fa0] hover:text-[#e07abd] underline underline-offset-2 transition-colors"
          >
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
