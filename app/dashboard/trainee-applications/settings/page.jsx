"use client";
import React, { useState, useEffect } from "react";
import { Star, Save, AlertTriangle, ArrowLeft, RotateCcw, HelpCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";

export default function TraineeAssessmentSettings() {
  const [priorityIndices, setPriorityIndices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const core34Questions = [
    "I have felt terribly alone and isolated",
    "I have felt tense, anxious or nervous",
    "I have felt I have someone to turn to for support when needed",
    "I have felt O.K about myself",
    "I have felt totally lacking in energy and enthusiasm",
    "I have been physically violent to others",
    "I have felt able to cope when things go wrong",
    "I have been troubled by aches, pains or other physical problems",
    "I have thought of hurting myself",
    "Talking to people has felt too much for me",
    "Tension and anxiety have prevented me from doing important things",
    "I have been happy with the things I have done",
    "I have been disturbed by unwanted thoughts and feelings",
    "I have felt like crying",
    "I have felt panic or terror",
    "I made plans to end my life",
    "I have felt overwhelmed by my problems",
    "I have had difficulty getting to sleep or staying asleep",
    "I have felt warmth or affection for someone",
    "My problems have been impossible to put to one side",
    "I have been able to do most things I needed to",
    "I have threatened or intimidated another person",
    "I have felt despairing or hopeless",
    "I have thought it would be better if I were dead",
    "I have felt criticised by other people",
    "I have thought I have no friends",
    "I have felt unhappy",
    "Unwanted images or memories have been distressing me",
    "I have been irritable when with other people",
    "I have thought I am to blame for my problems and difficulties",
    "I have felt optimistic about my future",
    "I have achieved the things I wanted to",
    "I have felt humiliated or shamed by other people",
    "I have hurt myself physically or taken dangerous risks with my health",
  ];

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-applications-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPriorityIndices(data.priority_questions || []);
      }
    } catch (err) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const togglePriority = (index) => {
    setPriorityIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-applications-settings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ priority_questions: priorityIndices }),
      });
      
      if (res.ok) {
        toast.success("Assessment settings saved!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (err) {
      toast.error("A network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (confirm("Reset priority questions to default?")) {
      setPriorityIndices([5, 8, 15, 21, 23, 33]); // 6, 9, 16, 22, 24, 34 (0-indexed)
    }
  };

  return (
    <PageGuard menuId="trainee-applications">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            actions={
              <div className="flex items-center gap-3">
                <button
                  onClick={resetToDefault}
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 rounded-lg transition-all font-medium text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-bold shadow-lg text-sm ${saving ? 'opacity-70 animate-pulse' : ''}`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            }
          >
            <div className="flex items-center gap-3">
              <Link href="/dashboard/trainee-applications" className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Assessment Settings</h1>
                <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Configure CORE 34 question prioritization</p>
              </div>
            </div>
          </DashboardHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-8 flex gap-4 items-start shadow-sm transition-all hover:shadow-md">
        <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-900 mb-1">How it works</h3>
          <p className="text-blue-800 text-sm leading-relaxed opacity-90">
            Selected priority questions will be displayed at the <strong>top</strong> of the "Initial Assessment" section in the trainee application form. 
            This helps highlighting critical risk assessment questions for applicants and reviewers.
          </p>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question Text</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400">Loading questions...</div>
          ) : (
            core34Questions.map((q, idx) => (
              <div 
                key={idx} 
                className={`group flex items-center justify-between px-6 py-4 transition-all ${
                  priorityIndices.includes(idx) ? 'bg-purple-50/40 border-l-4 border-purple-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <span className={`text-sm font-bold w-6 text-right ${priorityIndices.includes(idx) ? 'text-purple-600' : 'text-gray-300'}`}>
                    {idx + 1}.
                  </span>
                  <p className={`text-sm font-medium ${priorityIndices.includes(idx) ? 'text-purple-900' : 'text-gray-700'}`}>
                    {q}
                  </p>
                </div>
                
                <button 
                  onClick={() => togglePriority(idx)}
                  className={`p-2 rounded-lg transition-all ml-4 ${
                    priorityIndices.includes(idx) 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-300 group-hover:border-purple-300 group-hover:text-purple-400'
                  }`}
                  title={priorityIndices.includes(idx) ? "Remove Priority" : "Make Priority"}
                >
                  <Star className={`w-5 h-5 ${priorityIndices.includes(idx) ? 'fill-current' : ''}`} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
