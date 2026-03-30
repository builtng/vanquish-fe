"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Check, ChevronDown } from "lucide-react";

// ── Canonical colour map ───────────────────────────────────────────────────────
export const STATUS_COLORS = {
  "New Application":           "bg-blue-50    text-blue-700   border-blue-200",
  "Stage 1 Complete":          "bg-purple-50  text-purple-700 border-purple-200",
  "Stage 2 Invited":           "bg-amber-50   text-amber-700  border-amber-200",
  "Stage 2 Video Submitted":   "bg-orange-50  text-orange-700 border-orange-200",
  "Stage 2 Approved":          "bg-indigo-50  text-indigo-700 border-indigo-200",
  "Stage 3 Interview Booked":  "bg-green-50   text-green-700  border-green-200",
  "Interview Attended":        "bg-teal-50    text-teal-700   border-teal-200",
  "Interview No Show":         "bg-rose-50    text-rose-700   border-rose-200",
  "Accepted":                  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Induction Attended":        "bg-blue-100   text-blue-800   border-blue-200",
  "Induction No-Show":         "bg-pink-50    text-pink-700   border-pink-200",
  "Onboarding":                "bg-violet-50  text-violet-700 border-violet-200",
  "Active Placement":          "bg-green-600  text-white      border-green-700",
  "Rejected":                  "bg-red-50     text-red-700    border-red-200",
  "Hold":                      "bg-slate-100  text-slate-700  border-slate-300",
};

// ── Badge ──────────────────────────────────────────────────────────────────────
export function StatusBadge({ status, pulse = false, className = "" }) {
  const colours = STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200";
  const shouldPulse = pulse && status === "Stage 2 Video Submitted";
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-[11px] font-bold uppercase tracking-wide border
        ${colours}
        ${shouldPulse ? "animate-pulse" : ""}
        ${className}
      `}
    >
      {status}
    </span>
  );
}

// ── Searchable Status Select ───────────────────────────────────────────────────
export function SearchableStatusSelect({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Select a status…",
  includeAll = false,        // prepend an "All Statuses" option
  size = "md",               // "sm" | "md"
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const allOptions = includeAll
    ? [{ value: "all", label: "All Statuses" }, ...options.map(normalise)]
    : options.map(normalise);

  const filtered = allOptions.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const selected = allOptions.find((o) => o.value === value) || null;

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const pick = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const triggerPy = size === "sm" ? "py-1.5" : "py-2.5";
  const triggerPx = "px-3";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full flex items-center justify-between gap-2
          ${triggerPx} ${triggerPy} rounded-xl border-2 transition-all text-left
          ${open
            ? "border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900/30 bg-white dark:bg-slate-700"
            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-purple-300"}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {selected && selected.value !== "all" ? (
          <StatusBadge status={selected.label} pulse />
        ) : selected?.value === "all" ? (
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">All Statuses</span>
        ) : (
          <span className="text-sm text-gray-400">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`
            absolute z-50 mt-2 w-full min-w-[220px]
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-600
            rounded-2xl shadow-2xl overflow-hidden
            animate-dropdown
          `}
          style={{ transformOrigin: "top" }}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className={`
                  w-full pl-8 pr-3 py-1.5 text-sm
                  bg-gray-50 dark:bg-slate-700
                  border border-gray-200 dark:border-slate-600
                  rounded-lg outline-none
                  focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                  dark:text-gray-100 dark:placeholder-gray-400
                `}
              />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400 text-center italic">No results</li>
            )}
            {filtered.map((opt) => {
              const isActive = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => pick(opt)}
                    className={`
                      w-full flex items-center justify-between gap-3
                      px-3 py-2 text-sm text-left transition-colors
                      ${isActive
                        ? "bg-purple-50 dark:bg-purple-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700/70"}
                    `}
                  >
                    {opt.value === "all" ? (
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">All Statuses</span>
                    ) : (
                      <StatusBadge status={opt.label} />
                    )}
                    {isActive && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <style jsx>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-6px) scaleY(.96); }
          to   { opacity: 1; transform: translateY(0)    scaleY(1);   }
        }
        .animate-dropdown { animation: dropdown 0.15s cubic-bezier(.22,.68,0,1.2); }
      `}</style>
    </div>
  );
}

function normalise(o) {
  return typeof o === "string" ? { value: o, label: o } : o;
}

export default StatusBadge;
