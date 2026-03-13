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
  Send,
  RefreshCw,
  Plus,
  X,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const stripHtml = (html) => {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

/* ── VIEW MESSAGE MODAL (Simplified for Sent Folder) ── */
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
                  <strong>To:</strong> Administrative Staff Team
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

function MessagesSentPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

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
      // Filter for messages SENT by the user
      const sentMessages = (res.data || []).filter(
        (m) => m.from_user_id === authUser.id,
      );
      setMessages(sentMessages);
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

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Sent Messages
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Messages you've sent to the administration
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
              {messages.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-[var(--text-primary)] font-semibold mb-1">
                    No sent messages
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    Messages you send to the admin team will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-[var(--card-border)]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Send className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] truncate">
                              {msg.subject}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] truncate">
                              To: Administrative Staff —{" "}
                              {stripHtml(msg.message)?.slice(0, 100)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs text-gray-400 dark:text-[var(--text-tertiary)]">
                            {new Date(msg.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}
                          </span>
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        </div>
                      </div>
                    </div>
                  ))}
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
    </CounsellorLayout>
  );
}

export default function MessagesSentPageWrapper() {
  return (
    <SidebarProvider>
      <MessagesSentPage />
    </SidebarProvider>
  );
}
