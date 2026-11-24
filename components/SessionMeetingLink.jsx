"use client";

import { useState } from "react";
import { Video, Link2, Pencil, X, Check } from "lucide-react";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

/**
 * Video-call link of one booked therapy session.
 * - Link set: a "Join Session" button that opens it in a new tab.
 * - canEdit (admins only): add / change / remove the link inline.
 *   Everyone else just sees Join Session, or "No link yet".
 */
export default function SessionMeetingLink({ session, canEdit = false, onSaved, size = "sm" }) {
  const { success, error: showError } = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(session?.meeting_link || "");
  const [saving, setSaving] = useState(false);
  const link = session?.meeting_link || "";

  const pad = size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";

  const save = async (next) => {
    setSaving(true);
    try {
      const res = await apiService.updateSessionMeetingLink(session.id, next.trim());
      success(res?.message || "Meeting link saved.");
      setEditing(false);
      onSaved?.(res?.session || { ...session, meeting_link: next.trim() || null });
    } catch (err) {
      showError(err?.message || "Could not save the link. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form
        className="flex items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          save(value);
        }}
      >
        <input
          type="url"
          inputMode="url"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://zoom.us/j/…"
          aria-label="Meeting link"
          className="w-56 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1b23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]/40"
        />
        <button
          type="submit"
          disabled={saving}
          title="Save link"
          className="p-1.5 rounded-lg bg-[#6f1d56] text-white disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(link);
            setEditing(false);
          }}
          title="Cancel"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {link && (
          <button
            type="button"
            disabled={saving}
            onClick={() => save("")}
            className="px-2 py-1.5 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${pad} bg-[#6f1d56] text-white rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm inline-flex items-center gap-1.5`}
        >
          <Video className="w-3.5 h-3.5" />
          Join Session
        </a>
      ) : !canEdit ? (
        <span
          className={`${pad} rounded-lg font-semibold text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-white/10`}
          title="No meeting link has been added for this session yet"
        >
          No link yet
        </span>
      ) : null}
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            setValue(link);
            setEditing(true);
          }}
          className={`${pad} rounded-lg font-semibold border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-1.5`}
          title={link ? "Change or remove the meeting link" : "Add a meeting link for this session"}
        >
          {link ? <Pencil className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          {link ? "Edit link" : "Add meeting link"}
        </button>
      )}
    </div>
  );
}
