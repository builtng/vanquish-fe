"use client";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  XCircle,
  Ban,
  UserCheck,
  FileText,
  Video,
  Users,
  Activity,
  CreditCard
} from 'lucide-react';

export default function ColorGuidePage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Color Indicator Guide</h1>
          <p className="text-sm text-gray-600 mt-1">Understanding color codes and indicators throughout the system</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          
          {/* Client Status Indicators */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Client Status Indicators
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <div>
                  <p className="font-medium text-gray-900">Red Dot - Urgent</p>
                  <p className="text-sm text-gray-600">Client requires immediate attention or has urgent status</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="font-medium text-gray-900">Yellow Dot - Stuck</p>
                  <p className="text-sm text-gray-600">Client is stuck in current stage and needs review</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium text-gray-900">Green Dot - Active</p>
                  <p className="text-sm text-gray-600">Client is actively progressing through the system</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                <div>
                  <p className="font-medium text-gray-900">Gray Dot - Default</p>
                  <p className="text-sm text-gray-600">Standard status or no special status assigned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Stage Badges */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Client Stage Badges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Application</span>
                <p className="text-sm text-gray-600">Initial application submitted</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Consultation Booked</span>
                <p className="text-sm text-gray-600">Consultation scheduled</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Consultation Completed</span>
                <p className="text-sm text-gray-600">Consultation finished</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Pending Match</span>
                <p className="text-sm text-gray-600">Awaiting practitioner assignment</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Matched</span>
                <p className="text-sm text-gray-600">Client matched with practitioner</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">Agreement Pending</span>
                <p className="text-sm text-gray-600">Waiting for agreement signature</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Active Therapy</span>
                <p className="text-sm text-gray-600">Currently in active therapy sessions</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">Completed</span>
                <p className="text-sm text-gray-600">Therapy completed</p>
              </div>
            </div>
          </div>

          {/* Consultation Status Badges */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Consultation Status Badges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Booked
                </span>
                <p className="text-sm text-gray-600">Consultation scheduled</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
                <p className="text-sm text-gray-600">Consultation finished</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> No Show
                </span>
                <p className="text-sm text-gray-600">Client did not attend</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Cancelled
                </span>
                <p className="text-sm text-gray-600">Consultation cancelled</p>
              </div>
            </div>
          </div>

          {/* Session Status Badges */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Session Status Badges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
                <p className="text-sm text-gray-600">Session completed successfully</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Scheduled
                </span>
                <p className="text-sm text-gray-600">Session scheduled</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> DNA
                </span>
                <p className="text-sm text-gray-600">Did Not Attend - client missed session</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Cancelled
                </span>
                <p className="text-sm text-gray-600">Session cancelled</p>
              </div>
            </div>
          </div>

          {/* Payment Status Badges */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Status Badges
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Paid</span>
                <p className="text-sm text-gray-600">Payment received and confirmed</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Pending</span>
                <p className="text-sm text-gray-600">Payment pending or awaiting confirmation</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Waived</span>
                <p className="text-sm text-gray-600">Payment waived or not required</p>
              </div>
            </div>
          </div>

          {/* Urgency Indicators */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Urgency Indicators
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">HIGH</div>
                <div>
                  <p className="font-medium text-gray-900">High Urgency</p>
                  <p className="text-sm text-gray-600">Requires immediate attention - clients waiting, risk flags, or urgent consultations</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">MEDIUM</div>
                <div>
                  <p className="font-medium text-gray-900">Medium Urgency</p>
                  <p className="text-sm text-gray-600">Needs attention soon but not critical</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">LOW</div>
                <div>
                  <p className="font-medium text-gray-900">Low Urgency</p>
                  <p className="text-sm text-gray-600">Standard priority, no immediate action required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log Colors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log Color Codes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Client Assigned</span>
                <p className="text-sm text-gray-600">Client assigned to practitioner</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Client TC Matched</span>
                <p className="text-sm text-gray-600">Client matched with training counsellor</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Consultation Completed</span>
                <p className="text-sm text-gray-600">Consultation finished</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Agreement Signed</span>
                <p className="text-sm text-gray-600">Agreement document signed</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Session Completed</span>
                <p className="text-sm text-gray-600">Therapy session completed</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Client Created</span>
                <p className="text-sm text-gray-600">New client added to system</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">TC Created</span>
                <p className="text-sm text-gray-600">New training counsellor added</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Consultation Booked</span>
                <p className="text-sm text-gray-600">Consultation scheduled</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Status Changed</span>
                <p className="text-sm text-gray-600">Client or consultation status updated</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">Document Uploaded</span>
                <p className="text-sm text-gray-600">Document added to client file</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-sm font-medium rounded-full">Email Sent</span>
                <p className="text-sm text-gray-600">Email notification sent</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">Note Added</span>
                <p className="text-sm text-gray-600">Note or comment added</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">Risk Flag</span>
                <p className="text-sm text-gray-600">Risk flag identified or updated</p>
              </div>
            </div>
          </div>

          {/* Sidebar Badge Colors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Sidebar Badge Colors
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">5</span>
                <div>
                  <p className="font-medium text-gray-900">Red Badge</p>
                  <p className="text-sm text-gray-600">Shows count of items requiring attention (e.g., upcoming consultations, pending matches)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-gray-300 text-gray-600 text-xs rounded-full">0</span>
                <div>
                  <p className="font-medium text-gray-900">Gray Badge</p>
                  <p className="text-sm text-gray-600">Shows zero count when there are no items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Colors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Priority Colors (Dashboard Alerts)
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="font-medium text-red-900 mb-1">High Priority (Red)</p>
                <p className="text-sm text-red-800">Critical items requiring immediate attention - consultations today, risk flags, urgent clients</p>
              </div>
              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <p className="font-medium text-orange-900 mb-1">Medium Priority (Orange)</p>
                <p className="text-sm text-orange-800">Items that need attention soon - clients stuck in stages, pending reviews</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

