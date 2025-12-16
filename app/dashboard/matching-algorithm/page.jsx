"use client";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  GitMerge, Clock, CheckCircle, Brain, Calendar, 
  MapPin, Shield, Star, RefreshCw
} from 'lucide-react';

export default function MatchingAlgorithmPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Matching Algorithm Logic</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Explanation of how the system matches Clients with Training Counsellors</p>
        </DashboardHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
          <div className="space-y-8">
            
            {/* Overview */}
            <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">Matching Process Overview</h2>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">The core workflow for assigning practitioners</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-gray-800 dark:text-[var(--text-primary)] leading-relaxed">
                    The matching algorithm is designed to pair clients with the most suitable Training Counsellor (TC) based on clinical needs, logistical availability, and personal preferences. While the final assignment is approved by a Clinical Supervisor, the system provides a <strong>Match Score (0-100%)</strong> to guide the decision.
                  </p>
                </div>
              </div>
            </section>

            {/* Key Criteria */}
            <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">Scoring Factors</h2>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">How the Match Score is calculated</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-item p-4 rounded-lg border border-gray-100 dark:border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">availability (40%)</h4>
                      <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                        Matches the client's preferred days/times with the TC's open slots. This is the most critical logistical factor.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-item p-4 rounded-lg border border-gray-100 dark:border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">Clinical Issues (30%)</h4>
                      <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                        Compares client's primary issues (e.g., Anxiety, Depression) with the TC's reported "Experience Topics" and excludes TCs who listed the issue as "Not Ready For".
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-item p-4 rounded-lg border border-gray-100 dark:border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">Modality Match (20%)</h4>
                      <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                        Aligns the recommended therapy modality (e.g., CBT, Person-Centred) from the consultation with the TC's training.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-item p-4 rounded-lg border border-gray-100 dark:border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">Case Load Balance (10%)</h4>
                      <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                        Prioritizes TCs who need more hours to meet their qualification requirements vs those at capacity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Workflow Steps */}
            <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">Assignment Workflow</h2>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Step-by-step logic</p>
                </div>
              </div>

              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-6 space-y-8">
                <div className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></div>
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">1. Intake & Assessment</h3>
                  <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                    Client data is collected via intake form, including availability and issues. A consultation confirms the recommended modality and risk level.
                  </p>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-white dark:border-gray-800"></div>
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">2. System Filtering</h3>
                  <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                    The system filters out TCs who are:
                  </p>
                  <ul className="list-disc ml-5 mt-1 text-xs space-y-1 text-gray-600 dark:text-[var(--text-secondary)]">
                      <li>Inactive or suspended</li>
                      <li>At full capacity (unless override authorized)</li>
                      <li>Not qualified for the client's risk level or specific issues</li>
                  </ul>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-gray-800"></div>
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">3. Tentative Match</h3>
                  <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                    Admin selects the best match. The client is moved to "Pending Match" status.
                  </p>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">4. Confirmation</h3>
                  <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                    Once the TC accepts and the client signs the agreement, the status updates to "Matched" and then "Active Therapy".
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
