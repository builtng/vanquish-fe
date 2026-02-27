"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import { toast } from "react-toastify";
import { Bell } from "lucide-react";

export default function StaffNoteNotifier() {
  const { user } = useAuth();
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const checkNotes = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const response = await apiService.getUnreadStaffNotes();
        const notes = response.data || [];

        for (const note of notes) {
          // Display the note using toastify
          toast.info(
            <div
              onClick={() => (window.location.href = "/dashboard/staff-notes")}
              className="cursor-pointer"
            >
              <div className="font-bold flex items-center gap-2 text-purple-700">
                <Bell className="w-4 h-4" />
                New Note from {note.admin?.name || "Colleague"}
              </div>
              <p className="mt-1 text-sm text-gray-800 line-clamp-2">
                {note.note}
              </p>
              <div className="mt-2 text-[10px] text-purple-400 font-bold uppercase tracking-wider underline">
                View All Notes
              </div>
            </div>,
            {
              position: "top-right",
              autoClose: 15000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light",
            },
          );

          // Mark as read immediately
          await apiService.markStaffNoteAsRead(note.id);
        }
      } catch (err) {
        console.error("Failed to check staff notes:", err);
      } finally {
        checkingRef.current = false;
      }
    };

    // Check immediately on mount
    checkNotes();

    // Check every 30 seconds
    const interval = setInterval(checkNotes, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return null;
}
