"use client";

import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function DashboardHeader({ children, actions }) {
  return (
    <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] shadow-sm sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {children}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

