"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageGuard from "@/components/PageGuard";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import apiService from "@/lib/api";
import { toast } from "react-toastify";
import { useModal } from "@/contexts/ModalContext";
import {
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Send,
  AlertTriangle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  SlidersHorizontal,
  Inbox,
  ExternalLink,
} from "lucide-react";

export default function EmailLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 1,
    from: 0,
    to: 0,
  });
  const [summary, setSummary] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  });

  const { confirm } = useModal();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (templateFilter !== "all") params.template = templateFilter;

      const res = await apiService.getEmailLogs(params);
      if (res?.logs) {
        setLogs(res.logs.data || []);
        setPagination({
          total: res.logs.total || 0,
          lastPage: res.logs.last_page || 1,
          from: res.logs.from || 0,
          to: res.logs.to || 0,
        });
      }
      if (res?.summary) {
        setSummary(res.summary);
      }
    } catch (error) {
      toast.error("Failed to load email delivery logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, statusFilter, templateFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const handleResend = async (log) => {
    const ok = await confirm({
      title: "Resend Email",
      message: `Are you sure you want to resend this "${formatTemplateName(log.template_name)}" email to ${log.email}?`,
      confirmText: "Resend Now",
      type: "info",
    });
    if (!ok) return;

    try {
      setResendingId(log.id);
      const res = await apiService.resendEmailLog(log.id);
      toast.success(res?.message || "Email resent successfully");
      fetchLogs();
    } catch (error) {
      toast.error(error?.message || "Failed to resend email");
    } finally {
      setResendingId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.info("Copied to clipboard");
  };

  const formatTemplateName = (name) => {
    if (!name) return "Unknown Template";
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <PageGuard menuId="email-management">
      <DashboardLayout>
        <DashboardHeader
          title="Email Delivery Logs"
          subtitle="Real-time delivery verification, Resend message tracking, and manual resend controls"
        />

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-6 text-sm font-medium">
            <Link
              href="/dashboard/email-logs"
              className="border-b-2 border-[#6f1d56] text-[#6f1d56] dark:text-[#f472b6] pb-3 flex items-center space-x-2 font-semibold"
            >
              <Inbox className="w-4 h-4" />
              <span>Email Delivery Logs</span>
            </Link>
            <Link
              href="/dashboard/email-management"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pb-3 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Email Templates</span>
            </Link>
            <Link
              href="/dashboard/settings/email-senders"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pb-3 flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sender Routing Settings</span>
            </Link>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Logged Sends
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {summary.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-[#6f1d56] dark:text-[#f472b6] flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Delivered Successfully
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {summary.sent}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Failed Deliveries
                </p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {summary.failed}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pending / Queued
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {summary.pending}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 w-full flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipient, template name, Resend message ID, or error..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#6f1d56] hover:bg-[#581744] text-white text-sm font-medium rounded-lg transition"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6f1d56] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent (Delivered)</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <button
                onClick={() => fetchLogs()}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                title="Refresh log entries"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4">Template</th>
                    <th className="py-3.5 px-4">Resend / Provider ID</th>
                    <th className="py-3.5 px-4">Logged At (UK)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6f1d56]" />
                        Loading email logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        No email delivery logs found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isSent = log.status === "sent";
                      const isFailed = log.status === "failed";
                      const isPending =
                        log.status === "pending" || log.status === "queued";

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isSent && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Sent
                              </span>
                            )}
                            {isFailed && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                                <XCircle className="w-3.5 h-3.5" />
                                Failed
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                                <Clock className="w-3.5 h-3.5" />
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Recipient */}
                          <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span>{log.email}</span>
                              <button
                                onClick={() => copyToClipboard(log.email, `email-${log.id}`)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                title="Copy email address"
                              >
                                {copiedId === `email-${log.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {log.submission_id && (
                              <div className="text-xs text-gray-400 font-mono mt-0.5">
                                Ref ID: #{log.submission_id}
                              </div>
                            )}
                          </td>

                          {/* Template */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              {formatTemplateName(log.template_name)}
                            </span>
                            {log.error_message && (
                              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs truncate" title={log.error_message}>
                                ⚠️ {log.error_message}
                              </p>
                            )}
                          </td>

                          {/* Resend / Provider Message ID */}
                          <td className="py-3.5 px-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                            {log.resend_message_id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="truncate max-w-[180px]" title={log.resend_message_id}>
                                  {log.resend_message_id}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(log.resend_message_id, `mid-${log.id}`)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                  title="Copy Resend Message ID"
                                >
                                  {copiedId === `mid-${log.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Not recorded</span>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(log.created_at)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                                title="View details and payload"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleResend(log)}
                                disabled={resendingId === log.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                  isFailed
                                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                                    : "bg-[#6f1d56] hover:bg-[#581744] text-white"
                                } disabled:opacity-50`}
                                title="Resend this email"
                              >
                                {resendingId === log.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                <span>Resend</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.total > 0 && (
              <div className="py-4 px-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  Showing <span className="font-semibold">{pagination.from}</span> to{" "}
                  <span className="font-semibold">{pagination.to}</span> of{" "}
                  <span className="font-semibold">{pagination.total}</span> entries
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || loading}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 py-1 text-sm font-medium">
                    Page {currentPage} of {pagination.lastPage}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))
                    }
                    disabled={currentPage >= pagination.lastPage || loading}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: View Email Log Details */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Email Log Details #{selectedLog.id}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Template: {formatTemplateName(selectedLog.template_name)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">
                    Recipient Address
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedLog.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">
                    Delivery Status
                  </span>
                  <span
                    className={`inline-block font-semibold ${
                      selectedLog.status === "sent"
                        ? "text-emerald-600"
                        : selectedLog.status === "failed"
                        ? "text-rose-600"
                        : "text-amber-600"
                    }`}
                  >
                    {selectedLog.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">
                    Created At
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(selectedLog.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">
                    Sent At
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(selectedLog.sent_at)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">
                    Resend Message ID
                  </span>
                  <span className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all">
                    {selectedLog.resend_message_id || "None recorded"}
                  </span>
                </div>
                {selectedLog.error_message && (
                  <div className="col-span-2 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-lg border border-rose-200 dark:border-rose-900">
                    <span className="text-rose-700 dark:text-rose-300 block text-xs uppercase tracking-wider font-bold">
                      Error Message
                    </span>
                    <p className="text-xs text-rose-800 dark:text-rose-200 font-mono mt-1 whitespace-pre-wrap">
                      {selectedLog.error_message}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold mb-1">
                  Email Payload / Placeholders
                </span>
                <pre className="p-4 bg-gray-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.payload, null, 2) || "{}"}
                </pre>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleResend(selectedLog);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 bg-[#6f1d56] hover:bg-[#581744] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Resend This Email</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}
