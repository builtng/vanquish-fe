"use client";

import React from "react";
import CounsellorSidebar from "./CounsellorSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import BuildIdentifier from "./BuildIdentifier";

export default function CounsellorLayout({ children, unreadCount = 0 }) {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--background)] flex transition-colors duration-200">
      {/* Sidebar */}
      <CounsellorSidebar unreadCount={unreadCount} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        <footer className="py-2 px-4 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 flex items-center justify-between text-xs text-gray-500">
          <span>Vanquish Therapies Portal</span>
          <BuildIdentifier className="!py-0" />
        </footer>
      </div>
    </div>
  );
}
