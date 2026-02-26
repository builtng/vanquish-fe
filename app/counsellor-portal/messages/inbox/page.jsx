"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  MessageSquare,
  Inbox,
  Send,
  RefreshCw,
  Plus,
  X,
  ChevronRight,
  CheckCircle,
  Mail,
  Clock,
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

/* ── SEND MESSAGE MODAL ── */
function SendMessageModal({ onClose, onSend, sending }) {
  const [form, setForm] = useState({ subject: "", message: "" });

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-2xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">
              New Message to Admin Team
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSend(form);
            }}
            className="p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6f1d56]"
                placeholder="Enter subject"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                Message *
              </label>
              <RichTextEditor
                content={form.message}
                onChange={(html) => setForm({ ...form, message: html })}
                placeholder="Type your message here..."
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#6f1d56" }}
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── VIEW MESSAGE MODAL ── */
function ViewMessageModal({ message, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] pr-4">
              {message.subject}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-[var(--text-secondary)] mb-5 pb-5 border-b border-gray-100 dark:border-[var(--card-border)]">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>
                  <strong>From:</strong>{" "}
                  {message.from_user?.name || "Staff Team"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(message.created_at).toLocaleString("en-GB", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
            {message.related_client && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Related to client:</strong>{" "}
                  {message.related_client.name}
                </p>
              </div>
            )}
            <div
              className="text-sm text-gray-700 dark:text-[var(--text-primary)] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: message.message }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ── MESSAGES INBOX PAGE ── */
function MessagesInboxPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    if (authUser.role !== "counsellor") {
      router.push("/counsellor-login");
      return;
    }
    loadMessages();
    loadUnreadCount();
  }, [authUser]);

  const loadMessages = async () => {
    try {
      const res = await apiService.getMessages({ per_page: 50 });
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await apiService.getUnreadMessageCount();
      setUnreadCount(res.count || 0);
    } catch (err) {}
  };

  const handleSelect = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await apiService.markMessageAsRead(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {}
    }
  };

  const handleSend = async (form) => {
    setSending(true);
    try {
      await apiService.sendMessageToStaff(form);
      success("Message sent to admin team!");
      setShowSendModal(false);
    } catch (err) {
      showError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const unread = messages.filter((m) => !m.is_read);
  const read = messages.filter((m) => m.is_read);

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader
        actions={
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-opacity shadow-sm text-sm"
            style={{ backgroundColor: "#6f1d56" }}
          >
            <Plus className="w-4 h-4" />
            New Message
          </button>
        }
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Messages
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Inbox — messages from the admin team
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--card-border)]">
              {/* Unread count banner */}
              {unreadCount > 0 && (
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 rounded-t-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-[var(--text-primary)] font-semibold mb-1">
                    Your inbox is empty
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    Messages from the admin team will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-[var(--card-border)]">
                  {/* Unread group */}
                  {unread.length > 0 && (
                    <>
                      <div className="px-6 py-2 bg-gray-50 dark:bg-[var(--bg-secondary)]">
                        <span className="text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                          Unread ({unread.length})
                        </span>
                      </div>
                      {unread.map((msg) => (
                        <MessageRow
                          key={msg.id}
                          msg={msg}
                          onSelect={handleSelect}
                        />
                      ))}
                    </>
                  )}

                  {/* Read group */}
                  {read.length > 0 && (
                    <>
                      {unread.length > 0 && (
                        <div className="px-6 py-2 bg-gray-50 dark:bg-[var(--bg-secondary)]">
                          <span className="text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                            Read ({read.length})
                          </span>
                        </div>
                      )}
                      {read.map((msg) => (
                        <MessageRow
                          key={msg.id}
                          msg={msg}
                          onSelect={handleSelect}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedMessage && (
        <ViewMessageModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
      {showSendModal && (
        <SendMessageModal
          onClose={() => setShowSendModal(false)}
          onSend={handleSend}
          sending={sending}
        />
      )}
    </CounsellorLayout>
  );
}

function MessageRow({ msg, onSelect }) {
  return (
    <div
      onClick={() => onSelect(msg)}
      className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] cursor-pointer transition-colors ${
        !msg.is_read ? "bg-blue-50/30 dark:bg-blue-900/5" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#6f1d56" }}
          >
            {msg.from_user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {!msg.is_read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
              <h5
                className={`text-sm truncate ${
                  !msg.is_read
                    ? "font-bold text-gray-900 dark:text-[var(--text-primary)]"
                    : "font-medium text-gray-700 dark:text-[var(--text-secondary)]"
                }`}
              >
                {msg.subject}
              </h5>
            </div>
            <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] truncate">
              {msg.from_user?.name || "Staff Team"} —{" "}
              {msg.message?.slice(0, 80)}
              {msg.message?.length > 80 ? "..." : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-[var(--text-tertiary)]">
            {new Date(msg.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}
          </span>
          {msg.is_read ? (
            <CheckCircle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesInboxPageWrapper() {
  return (
    <SidebarProvider>
      <MessagesInboxPage />
    </SidebarProvider>
  );
}
