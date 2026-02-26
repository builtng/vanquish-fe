"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Files,
  Search,
  FileText,
  Download,
  Shield,
  Clock,
  MoreVertical,
  Upload,
  FolderOpen,
} from "lucide-react";

function FilesPageContent() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnreadCount();
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await apiService.getUnreadMessageCount();
      setUnreadCount(res.count || 0);
    } catch (err) {}
  };

  const sharedFiles = [
    {
      id: 1,
      name: "Counsellor_Handbook_2024.pdf",
      size: "2.4 MB",
      date: "2024-01-15",
      type: "PDF",
    },
    {
      id: 2,
      name: "Standard_Operating_Procedures.pdf",
      size: "1.1 MB",
      date: "2024-02-10",
      type: "PDF",
    },
    {
      id: 3,
      name: "Emergency_Contact_Protocol.pdf",
      size: "850 KB",
      date: "2024-02-15",
      type: "PDF",
    },
  ];

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader
        actions={
          <button className="px-4 py-2 bg-[#6f1d56] text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-all text-sm">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        }
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Shared Files
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Access organizational documents and resources
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-[var(--bg-secondary)] flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#6f1d56]"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-[var(--card-border)]">
              {sharedFiles.map((file) => (
                <div
                  key={file.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-600 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-medium uppercase">
                          {file.type} • {file.size}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Added {file.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#6f1d56] transition-colors rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state if needed */}
            <div className="p-12 text-center bg-gray-50/30 dark:bg-gray-900/5">
              <FolderOpen className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-600 text-sm font-medium italic">
                End of file list
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm mb-1">
                Confidentiality Reminder
              </h4>
              <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed">
                All files in this section are highly confidential and for your
                professional use only. Please do not download them to public
                devices or share them externally without explicit written
                permission from the Vanquish Therapy management team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CounsellorLayout>
  );
}

export default function FilesPage() {
  return (
    <SidebarProvider>
      <FilesPageContent />
    </SidebarProvider>
  );
}
