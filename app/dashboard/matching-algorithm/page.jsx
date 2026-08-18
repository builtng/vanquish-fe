"use client";
import PageGuard from "@/components/PageGuard";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import apiService from '@/lib/api';
import {
  GitMerge, CheckCircle, Brain, Calendar,
  RefreshCw, Users, Globe, HeartHandshake, Cake,
  Save, Loader2, AlertCircle
} from 'lucide-react';

const FACTORS = [
  { key: 'availability_weight', label: 'Availability', icon: Calendar, color: 'text-green-500', description: "Matches the client's preferred days/times with the TC's open slots." },
  { key: 'modality_weight', label: 'Modality', icon: RefreshCw, color: 'text-purple-500', description: "Aligns the recommended therapy modality (e.g., CBT, Person-Centred) with the TC's training." },
  { key: 'gender_weight', label: 'Gender', icon: Users, color: 'text-blue-500', description: "Aligns the client's gender preference with the TC's gender." },
  { key: 'ethnicity_weight', label: 'Ethnicity', icon: Globe, color: 'text-amber-500', description: "Aligns the client's ethnicity preference with the TC's ethnicity." },
  { key: 'sexual_orientation_weight', label: 'Sexual Orientation', icon: HeartHandshake, color: 'text-pink-500', description: "Aligns the client's sexual orientation preference with the TC's sexual orientation." },
  { key: 'age_weight', label: 'Age', icon: Cake, color: 'text-orange-500', description: "Aligns the client's age preference with the TC's age." },
];

const DEFAULT_WEIGHTS = {
  availability_weight: 40,
  modality_weight: 20,
  gender_weight: 20,
  ethnicity_weight: 10,
  sexual_orientation_weight: 5,
  age_weight: 5,
};

export default function MatchingAlgorithmPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMatchingAlgorithmSettings();
      setWeights((prev) => ({ ...prev, ...data }));
    } catch (err) {
      showError('Failed to load matching algorithm settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const total = FACTORS.reduce((sum, f) => sum + (parseFloat(weights[f.key]) || 0), 0);
  const totalRounded = Math.round(total * 100) / 100;
  const isValidTotal = totalRounded === 100;

  const handleSave = async () => {
    if (!isValidTotal) {
      showError(`The six weights must add up to 100% (currently ${totalRounded}%)`);
      return;
    }

    try {
      setSaving(true);
      const payload = FACTORS.reduce((acc, f) => {
        acc[f.key] = parseFloat(weights[f.key]) || 0;
        return acc;
      }, {});
      const res = await apiService.updateMatchingAlgorithmSettings(payload);
      setWeights((prev) => ({ ...prev, ...res.settings }));
      success('Matching algorithm settings updated');
    } catch (err) {
      showError(err.message || 'Failed to update matching algorithm settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageGuard menuId="matching-algo">
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
                    The matching algorithm is designed to pair clients with the most suitable Training Counsellor (TC) based on logistical availability and personal preferences. While the final assignment is approved by a Clinical Supervisor, the system provides a <strong>Match Score (0-100%)</strong> to guide the decision.
                  </p>
                </div>
              </div>
            </section>

            {/* Key Criteria */}
            <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">Scoring Factors</h2>
                    <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                      {isAdmin ? 'How the Match Score is calculated — editable by admin' : 'How the Match Score is calculated'}
                    </p>
                  </div>
                </div>

                {isAdmin && !loading && (
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${isValidTotal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Total: {totalRounded}%
                    </span>
                    <button
                      onClick={handleSave}
                      disabled={saving || !isValidTotal}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {!isValidTotal && isAdmin && !loading && (
                <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  The six weights must add up to 100% before they can be saved.
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {FACTORS.map((factor) => {
                    const Icon = factor.icon;
                    return (
                      <div key={factor.key} className="card-item p-4 rounded-lg border border-gray-100 dark:border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 ${factor.color} mt-1`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">{factor.label}</h4>
                              {isAdmin ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={weights[factor.key]}
                                    onChange={(e) => handleChange(factor.key, e.target.value)}
                                    className="w-16 px-2 py-1 text-right text-sm font-semibold rounded border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-900 dark:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <span className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">%</span>
                                </div>
                              ) : (
                                <span className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">{weights[factor.key]}%</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                              {factor.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                    Client data is collected via intake form, including availability and preferences. A consultation confirms the recommended modality and risk level.
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
                      <li>Not qualified for the client's risk level or specific needs</li>
                  </ul>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-gray-800"></div>
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">3. Tentative Match</h3>
                  <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                    Admin selects the best match after the agreement is signed. The client is moved to "Matched With Counsellor" status.
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
    </PageGuard>
  );
}
