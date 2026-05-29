"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/lib/toast";
import apiService from "@/lib/api";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle2,
  Plus,
  MessageSquarePlus,
  ArrowRight,
  Filter,
  Search,
  Bell,
} from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

export default function StaffNotesPage() {
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  // New note form state
  const [formData, setFormData] = useState({
    staff_id: "",
    note: "",
  });

  const [filter, setFilter] = useState("received"); // received, sent

  useEffect(() => {
    loadNotes();
    loadUsers();
  }, [filter]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStaffNotes(filter);
      setNotes(response.data || []);
    } catch (err) {
      showError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log("Fetching user list for notes...");
      const response = await apiService.getUserList();
      console.log("User list response:", response);

      // Some API calls return wrapped data { data: [...] }
      const userArray = Array.isArray(response)
        ? response
        : response.data || [];

      // Filter out self if authUser is available
      const otherUsers = authUser
        ? userArray.filter((u) => u.id !== authUser.id)
        : userArray;

      console.log("Filtered users count:", otherUsers.length);
      setUsers(otherUsers);
    } catch (err) {
      console.error("Failed to load users for notes:", err);
    }
  };

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!formData.staff_id || !formData.note.trim()) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setSendingNote(true);
      await apiService.storeStaffNote({
        staff_id: formData.staff_id,
        note: formData.note.trim(),
      });
      success("Note sent successfully!");
      setShowSendModal(false);
      setFormData({ staff_id: "", note: "" });
      loadNotes();
    } catch (err) {
      showError(err.message || "Failed to send note");
    } finally {
      setSendingNote(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiService.markStaffNoteAsRead(id);
      setNotes(notes.filter((n) => n.id !== id));
      success("Note cleared");
    } catch (err) {
      showError("Failed to mark as read");
    }
  };

  return (
    <PageGuard menuId="staff-notes">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-[var(--background)]">
          <DashboardHeader
            actions={
              <button
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2 bg-[#6f1d56] text-white rounded-lg hover:bg-[#8b2d6a] transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/20"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            }
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Staff Notes
              </h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                Communication and notifications between staff members
              </p>
            </div>
          </DashboardHeader>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Stats / Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[var(--card-bg)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                      Unread Notes
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {notes.length}
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[var(--card-bg)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                      Activity
                    </h3>
                    <p className="text-sm dark:text-gray-400">
                      Manage internal feedback
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-gray-200 dark:border-[var(--card-border)] mb-6">
                <button
                  onClick={() => setFilter("received")}
                  className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                    filter === "received"
                      ? "border-[#6f1d56] text-[#6f1d56] dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Notes Received
                </button>
                <button
                  onClick={() => setFilter("sent")}
                  className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                    filter === "sent"
                      ? "border-[#6f1d56] text-[#6f1d56] dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Notes Sent
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    {filter === "received"
                      ? "Recent Incoming Notes"
                      : "Your Sent Notes History"}
                  </h2>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">Loading notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border-2 border-dashed border-gray-200 dark:border-[var(--card-border)] p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {filter === "received"
                        ? "No new notes"
                        : "You haven't sent any notes yet"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {filter === "received"
                        ? "You're all caught up! When a colleague drops you a note, it will appear here."
                        : "Start a conversation by dropping a note for a colleague!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                      >
                        <div
                          className={`absolute top-0 left-0 w-1 h-full ${filter === "received" ? "bg-purple-500" : "bg-blue-500"}`}
                        ></div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {filter === "received"
                                  ? note.admin?.name || "Colleague"
                                  : `To: ${note.staff?.name || "Colleague"}`}
                              </h4>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {note.note}
                            </p>
                            <div className="mt-4 flex justify-between items-center">
                              {filter === "received" && (
                                <span
                                  className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${note.is_read ? "bg-gray-100 text-gray-500" : "bg-purple-100 text-purple-600"}`}
                                >
                                  {note.is_read ? "Read" : "Unread"}
                                </span>
                              )}
                              {filter === "sent" && (
                                <span
                                  className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${note.is_read ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
                                >
                                  {note.is_read ? "Viewed" : "Delivered"}
                                </span>
                              )}

                              {filter === "received" && !note.is_read && (
                                <button
                                  onClick={() => markAsRead(note.id)}
                                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark as Read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Send Note Modal */}
        {showSendModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSendModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                    <MessageSquarePlus className="w-5 h-5" />
                  </div>
                  New Staff Note
                </h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors font-bold text-xl"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSendNote} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                    Recipient
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <SearchableSelect
                      value={formData.staff_id}
                      onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                      options={users.map((u) => ({
                        value: u.id,
                        label: `${u.name} (${u.role})`,
                      }))}
                      placeholder="Select a colleague..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                    Message Content
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    rows={5}
                    placeholder="Type your message here. They will receive a notification."
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white resize-none"
                    disabled={sendingNote}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={
                      sendingNote || !formData.staff_id || !formData.note.trim()
                    }
                    className="flex-1 py-3 px-4 bg-[#6f1d56] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8b2d6a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                  >
                    {sendingNote ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Note
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}
