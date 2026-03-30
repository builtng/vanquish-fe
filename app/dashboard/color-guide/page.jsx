"use client";
import PageGuard from "@/components/PageGuard";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  FileText, Video, UserCheck, CheckCircle, Clock, AlertTriangle, 
  CreditCard, Activity, Mail, Sparkles, BookOpen, Palette
} from 'lucide-react';

export default function ColorGuidePage() {
  const colors = [
    { name: 'Emerald', label: 'Success / Completed', classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' },
    { name: 'Blue', label: 'Primary / Created', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30' },
    { name: 'Teal', label: 'Matched', classes: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30' },
    { name: 'Amber', label: 'Status Change / Review', classes: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' },
    { name: 'Violet', label: 'Consultation', classes: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30' },
    { name: 'Indigo', label: 'Documents', classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' },
    { name: 'Slate', label: 'Notes / System', classes: 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30' },
    { name: 'Sky', label: 'Communication', classes: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30' },
    { name: 'Rose', label: 'Danger / Deletion', classes: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' },
    { name: 'Purple', label: 'Transition / Admin', classes: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30' },
  ];

  return (
    <PageGuard menuId="color-guide">
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">System Color Guide</h1>
          </div>
          <p className="text-sm text-muted-foreground">Reference for the new unified color system (Activity Log & Badges)</p>
        </DashboardHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="space-y-8">
            
            {/* New Main Color Palette */}
            <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Unified Color System</h2>
                  <p className="text-sm text-muted-foreground">Light Mode: bg-*-100 | Dark Mode: bg-*-500/20 + border</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colors.map((color) => (
                  <div key={color.name} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{color.name}</p>
                      <p className="text-xs text-muted-foreground">{color.label}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color.classes}`}>
                      Badge Preview
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Client Stage Badges - Updated */}
            <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Client Stages (Applied)</h2>
                  <p className="text-sm text-muted-foreground">Using the new unified colors</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-medium rounded-full">
                      Application
                    </span>
                    <span className="text-sm text-muted-foreground">Initial State (Blue)</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted">
                    <span className="px-3 py-1 bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 text-xs font-medium rounded-full">
                      Consultation Booked
                    </span>
                    <span className="text-sm text-muted-foreground">Consultation (Violet)</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted">
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 text-xs font-medium rounded-full">
                      Matched
                    </span>
                    <span className="text-sm text-muted-foreground">Matched (Teal)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-medium rounded-full">
                      Active Therapy
                    </span>
                    <span className="text-sm text-muted-foreground">Success/Active (Emerald)</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-medium rounded-full">
                      Prioritised
                    </span>
                    <span className="text-sm text-muted-foreground">Review Needed (Amber)</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted">
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30 text-xs font-medium rounded-full">
                      Completed
                    </span>
                    <span className="text-sm text-muted-foreground">Inactive (Slate)</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
    </PageGuard>
  );
}
