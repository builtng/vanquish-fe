"use client";

import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import ThemeToggle from './ThemeToggle';

export default function DashboardLayout({ children }) {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--background)] flex transition-colors duration-200">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {children}
      </div>
    </div>
  );
}

