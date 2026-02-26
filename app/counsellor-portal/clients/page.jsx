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
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Filter,
  User,
} from "lucide-react";

function ClientsPageContent() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { error: showError } = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!authUser) return;
    loadData();
  }, [authUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dataRes, countRes] = await Promise.allSettled([
        apiService.getCounsellorOwnData(),
        apiService.getUnreadMessageCount(),
      ]);

      if (dataRes.status === "fulfilled") {
        setClients(dataRes.value?.clients || []);
      }
      if (countRes.status === "fulfilled") {
        setUnreadCount(countRes.value?.count || 0);
      }
    } catch (err) {
      console.error("Error loading clients:", err);
      showError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-[var(--hover-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6f1d56] w-64 transition-all"
            />
          </div>
        }
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          My Clients
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Managing your {clients.length} assigned clients
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredClients.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-gray-900 dark:text-[var(--text-primary)] font-semibold mb-1">
                    No clients found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    {searchTerm
                      ? "Try adjusting your search"
                      : "You haven't been assigned any clients yet"}
                  </p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm hover:shadow-md transition-all group overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm"
                            style={{ backgroundColor: "#6f1d56" }}
                          >
                            {client.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] group-hover:text-[#6f1d56] transition-colors">
                              {client.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                {client.stage || "Active"}
                              </span>
                              {client.age && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">
                                  Age {client.age}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/counsellor-portal/clients/${client.id || client.uuid}`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-gray-400" />
                          </div>
                          <span>{client.phone || "Not provided"}</span>
                        </div>
                      </div>

                      {client.primary_issues &&
                        client.primary_issues.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {client.primary_issues.map((issue, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 text-[10px] font-semibold rounded-md border border-purple-100 dark:border-purple-800/30"
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="px-5 py-3 bg-gray-50 dark:bg-[var(--background)] border-t border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Last Session:{" "}
                          {client.last_session_at
                            ? new Date(
                                client.last_session_at,
                              ).toLocaleDateString()
                            : "None"}
                        </span>
                      </div>
                      <Link
                        href={`/counsellor-portal/messages/inbox?new=true&client=${client.id}`}
                        className="text-[11px] font-bold text-[#6f1d56] hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Message Team
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </CounsellorLayout>
  );
}

export default function ClientsPage() {
  return (
    <SidebarProvider>
      <ClientsPageContent />
    </SidebarProvider>
  );
}
