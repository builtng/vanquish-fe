"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PageGuard from "@/components/PageGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/lib/toast";
import apiService from "@/lib/api";
import { ArrowLeft, Send, RefreshCw, MessageCircle } from "lucide-react";

export default function PsgGroupDiscussionsPage() {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const { error: showError } = useToast();
  const [group, setGroup] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [groupData, discussionData] = await Promise.all([
        apiService.request(`/attendance-groups/${id}`),
        apiService.getGroupDiscussions(id),
      ]);
      setGroup(groupData);
      setDiscussions(Array.isArray(discussionData) ? discussionData : []);
    } catch (err) {
      showError("Failed to load group discussions.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [discussions, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const newDiscussion = await apiService.postGroupDiscussion(id, trimmed);
      setDiscussions((prev) => [...prev, newDiscussion]);
      setMessage("");
    } catch (err) {
      showError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageGuard menuId="psg-groups">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3 max-w-4xl">
              <Link
                href="/dashboard/psg-groups"
                className="p-2 hover:bg-accent/10 rounded-xl text-muted-foreground transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-black text-foreground flex items-center gap-2 truncate">
                  <MessageCircle className="w-5 h-5 text-[#6f1c56] flex-shrink-0" />
                  {group ? `${group.name} — Discussions` : "Group Discussions"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Messages posted in this group's discussion thread
                </p>
              </div>
            </div>
          </div>

          {/* Discussion feed */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-[var(--background)]">
            <div className="max-w-4xl mx-auto space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#6f1c56]/50" />
                </div>
              ) : discussions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#6f1c56]/10 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-[#6f1c56]" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">No discussions yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      Start the conversation for this group below.
                    </p>
                  </div>
                </div>
              ) : (
                discussions.map((d) => {
                  const isMine = d.user_id === authUser?.id;
                  return (
                    <div
                      key={d.id}
                      className={`flex items-start gap-3 ${isMine ? "flex-row-reverse" : ""}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#6f1c56]/10 flex items-center justify-center text-[#6f1c56] text-sm font-bold flex-shrink-0">
                        {d.user?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isMine
                          ? "bg-[#6f1c56] text-white rounded-tr-sm"
                          : "bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-tl-sm"
                      }`}>
                        <div className={`flex items-center gap-2 text-[10px] font-bold mb-1 ${
                          isMine ? "text-white/70" : "text-gray-400"
                        }`}>
                          <span>{d.user?.name || "Unknown"}</span>
                          <span>&middot;</span>
                          <span>{formatTime(d.created_at)}</span>
                        </div>
                        <p className={`text-sm whitespace-pre-wrap break-words ${
                          isMine ? "text-white" : "text-gray-700 dark:text-gray-200"
                        }`}>
                          {d.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSend}
            className="border-t border-border bg-background px-6 py-4"
          >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message to the group..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#6f1c56] outline-none transition-all"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="p-2.5 bg-[#6f1c56] text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
                title="Send"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
