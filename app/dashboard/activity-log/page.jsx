"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Search, Filter, ChevronDown, MoreVertical, Eye,
  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,
  CheckCircle, Clock, AlertTriangle, Video, FileText,
  UserCheck, Activity, Menu, Home, ClipboardList,
  Settings, LogOut, ChevronRight, MapPin, User,
  UserPlus, UserMinus, FileCheck, Shield, Bell,
  MessageSquare, Archive, Download, Send, Plus,
  Save, XCircle, AlertCircle, Info, TrendingUp
} from 'lucide-react';

export default function ActivityLogPage() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Mock Activity Log Data
  const activities = [
    {
      id: 'ACT001',
      timestamp: '2025-03-18 14:32:15',
      date: '2025-03-18',
      time: '14:32',
      type: 'client_assigned',
      icon: UserCheck,
      color: 'bg-green-100 text-green-800',
      user: 'Isha (Admin)',
      action: 'Assigned client to training counsellor',
      details: 'Charlotte Evans (CL005) → Sarah Johnson (TC001)',
      clientId: 'CL005',
      tcId: 'TC001',
      metadata: { matchScore: 92, serviceType: 'Low Cost' }
    },
    {
      id: 'ACT002',
      timestamp: '2025-03-18 13:15:42',
      date: '2025-03-18',
      time: '13:15',
      type: 'client_created',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-800',
      user: 'System',
      action: 'New client application submitted',
      details: 'Daniel Harris (CL014) - Mid Range service',
      clientId: 'CL014',
      metadata: { serviceType: 'Mid Range', stage: 'Application' }
    },
    {
      id: 'ACT003',
      timestamp: '2025-03-18 11:45:28',
      date: '2025-03-18',
      time: '11:45',
      type: 'status_changed',
      icon: Edit,
      color: 'bg-yellow-100 text-yellow-800',
      user: 'Isha (Admin)',
      action: 'Changed TC status',
      details: 'James Wilson (TC004) → At Capacity',
      tcId: 'TC004',
      metadata: { oldStatus: 'Active', newStatus: 'At Capacity' }
    },
    {
      id: 'ACT004',
      timestamp: '2025-03-18 10:20:10',
      date: '2025-03-18',
      time: '10:20',
      type: 'consultation_booked',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-800',
      user: 'Isha (Admin)',
      action: 'Consultation booked',
      details: 'Victoria James (CL003) - 2025-03-18 10:00 AM',
      clientId: 'CL003',
      metadata: { consultationDate: '2025-03-18 10:00 AM', tc: 'Sarah Johnson' }
    },
    {
      id: 'ACT005',
      timestamp: '2025-03-18 09:15:33',
      date: '2025-03-18',
      time: '09:15',
      type: 'document_uploaded',
      icon: FileCheck,
      color: 'bg-indigo-100 text-indigo-800',
      user: 'Sarah Johnson (TC)',
      action: 'Document uploaded and verified',
      details: 'DBS Certificate - Sarah Johnson (TC001)',
      tcId: 'TC001',
      metadata: { documentType: 'DBS Certificate', status: 'Verified' }
    },
    {
      id: 'ACT006',
      timestamp: '2025-03-17 16:45:22',
      date: '2025-03-17',
      time: '16:45',
      type: 'client_assigned',
      icon: UserCheck,
      color: 'bg-green-100 text-green-800',
      user: 'Isha (Admin)',
      action: 'Assigned client to training counsellor',
      details: 'Benjamin Clark (CL006) → David Chen (TC002)',
      clientId: 'CL006',
      tcId: 'TC002',
      metadata: { matchScore: 88, serviceType: 'Low Cost' }
    },
    {
      id: 'ACT007',
      timestamp: '2025-03-17 15:30:18',
      date: '2025-03-17',
      time: '15:30',
      type: 'note_added',
      icon: MessageSquare,
      color: 'bg-gray-100 text-gray-800',
      user: 'Isha (Admin)',
      action: 'Admin note added',
      details: 'Note added to Sarah Johnson (TC001) profile',
      tcId: 'TC001',
      metadata: { noteType: 'Admin Note', content: 'First client match completed successfully...' }
    },
    {
      id: 'ACT008',
      timestamp: '2025-03-17 14:20:55',
      date: '2025-03-17',
      time: '14:20',
      type: 'client_created',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-800',
      user: 'System',
      action: 'New client application submitted',
      details: 'Charlotte Evans (CL005) - Low Cost service',
      clientId: 'CL005',
      metadata: { serviceType: 'Low Cost', stage: 'Application' }
    },
    {
      id: 'ACT009',
      timestamp: '2025-03-17 12:10:41',
      date: '2025-03-17',
      time: '12:10',
      type: 'email_sent',
      icon: Mail,
      color: 'bg-cyan-100 text-cyan-800',
      user: 'Isha (Admin)',
      action: 'Email sent to client',
      details: 'Welcome email sent to Thomas Wright (CL009)',
      clientId: 'CL009',
      metadata: { emailType: 'Welcome Email', subject: 'Welcome to Vanquish Therapy' }
    },
    {
      id: 'ACT010',
      timestamp: '2025-03-17 11:05:27',
      date: '2025-03-17',
      time: '11:05',
      type: 'tc_created',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-800',
      user: 'Isha (Admin)',
      action: 'New training counsellor added',
      details: 'Mohammed Ali (TC006) - Integrative modality',
      tcId: 'TC006',
      metadata: { modality: 'Integrative', status: 'Active' }
    },
    {
      id: 'ACT011',
      timestamp: '2025-03-16 17:30:12',
      date: '2025-03-16',
      time: '17:30',
      type: 'agreement_signed',
      icon: FileCheck,
      color: 'bg-green-100 text-green-800',
      user: 'System',
      action: 'Agreement signed by client',
      details: 'Alice Cooper (CL008) - Agreement completed',
      clientId: 'CL008',
      metadata: { stage: 'Agreement Pending → Active Therapy', tc: 'Priya Patel' }
    },
    {
      id: 'ACT012',
      timestamp: '2025-03-16 16:15:08',
      date: '2025-03-16',
      time: '16:15',
      type: 'session_completed',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      user: 'System',
      action: 'Therapy session completed',
      details: 'Emma Wilson (CL001) - Session 6 completed',
      clientId: 'CL001',
      tcId: 'TC001',
      metadata: { sessionNumber: 6, duration: '50 minutes' }
    },
    {
      id: 'ACT013',
      timestamp: '2025-03-16 14:45:33',
      date: '2025-03-16',
      time: '14:45',
      type: 'client_created',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-800',
      user: 'System',
      action: 'New client application submitted',
      details: 'Benjamin Clark (CL006) - Low Cost service',
      clientId: 'CL006',
      metadata: { serviceType: 'Low Cost', stage: 'Application' }
    },
    {
      id: 'ACT014',
      timestamp: '2025-03-16 13:20:19',
      date: '2025-03-16',
      time: '13:20',
      type: 'risk_flag',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800',
      user: 'Isha (Admin)',
      action: 'Risk flag added to client',
      details: 'Risk flag added to Benjamin Clark (CL006)',
      clientId: 'CL006',
      metadata: { riskLevel: 'High', reason: 'Sexual Abuse disclosure' }
    },
    {
      id: 'ACT015',
      timestamp: '2025-03-16 10:30:44',
      date: '2025-03-16',
      time: '10:30',
      type: 'status_changed',
      icon: Edit,
      color: 'bg-yellow-100 text-yellow-800',
      user: 'Isha (Admin)',
      action: 'Changed client stage',
      details: 'Sophie Taylor (CL007) → Active Therapy',
      clientId: 'CL007',
      metadata: { oldStage: 'Agreement Pending', newStage: 'Active Therapy' }
    },
    {
      id: 'ACT016',
      timestamp: '2025-03-15 15:50:21',
      date: '2025-03-15',
      time: '15:50',
      type: 'client_created',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-800',
      user: 'System',
      action: 'New client application submitted',
      details: 'Olivia Green (CL013) - Low Cost service',
      clientId: 'CL013',
      metadata: { serviceType: 'Low Cost', stage: 'Application' }
    },
    {
      id: 'ACT017',
      timestamp: '2025-03-15 14:25:17',
      date: '2025-03-15',
      time: '14:25',
      type: 'document_uploaded',
      icon: FileCheck,
      color: 'bg-indigo-100 text-indigo-800',
      user: 'David Chen (TC)',
      action: 'Document uploaded and verified',
      details: 'Professional Indemnity Insurance - David Chen (TC002)',
      tcId: 'TC002',
      metadata: { documentType: 'Insurance', status: 'Verified' }
    },
    {
      id: 'ACT018',
      timestamp: '2025-03-15 11:40:52',
      date: '2025-03-15',
      time: '11:40',
      type: 'consultation_completed',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      user: 'System',
      action: 'Consultation completed',
      details: 'Robert Davies (CL004) - Consultation with David Chen completed',
      clientId: 'CL004',
      tcId: 'TC002',
      metadata: { outcome: 'Successful', nextStep: 'Agreement Pending' }
    },
    {
      id: 'ACT019',
      timestamp: '2025-03-14 16:20:38',
      date: '2025-03-14',
      time: '16:20',
      type: 'client_created',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-800',
      user: 'System',
      action: 'New client application submitted',
      details: 'Sophia Martinez (CL015) - Low Cost service',
      clientId: 'CL015',
      metadata: { serviceType: 'Low Cost', stage: 'Application' }
    },
    {
      id: 'ACT020',
      timestamp: '2025-03-14 13:55:24',
      date: '2025-03-14',
      time: '13:55',
      type: 'client_created',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-800',
      user: 'System',
      action: 'New client application submitted',
      details: 'Emma Thompson (CL017) - Low Cost service',
      clientId: 'CL017',
      metadata: { serviceType: 'Low Cost', stage: 'Application' }
    }
  ];

  const getActivityTypeLabel = (type) => {
    const labels = {
      'client_assigned': 'Client Assigned',
      'client_created': 'Client Created',
      'status_changed': 'Status Changed',
      'consultation_booked': 'Consultation Booked',
      'consultation_completed': 'Consultation Completed',
      'document_uploaded': 'Document Uploaded',
      'note_added': 'Note Added',
      'email_sent': 'Email Sent',
      'tc_created': 'TC Created',
      'agreement_signed': 'Agreement Signed',
      'session_completed': 'Session Completed',
      'risk_flag': 'Risk Flag'
    };
    return labels[type] || type;
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesUser = filterUser === 'all' || activity.user === filterUser;
    const matchesDate = filterDateRange === 'all' || activity.date === filterDateRange;
    return matchesSearch && matchesType && matchesUser && matchesDate;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const uniqueUsers = [...new Set(activities.map(a => a.user))];
  const uniqueDates = [...new Set(activities.map(a => a.date))].sort().reverse().slice(0, 7);

  const stats = {
    total: activities.length,
    today: activities.filter(a => a.date === '2025-03-18').length,
    clientAssignments: activities.filter(a => a.type === 'client_assigned').length,
    newClients: activities.filter(a => a.type === 'client_created').length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen`}>
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#6f1d56' }}>
                  VT
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">Vanquish</h1>
                  <p className="text-xs text-gray-600">Admin</p>
                </div>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: Home, label: 'Overview', href: '/dashboard' },
            { id: 'consultations', icon: Video, label: 'Consultations', badge: 3, href: '/dashboard/consultations' },
            { id: 'matches', icon: UserCheck, label: 'Pending Matches', badge: 8, href: '/dashboard/pending-matches' },
            { id: 'tcs', icon: Users, label: 'Training Counsellors', href: '/dashboard/training-counsellors' },
            { id: 'clients', icon: ClipboardList, label: 'All Clients', href: '/dashboard/clients' },
            { id: 'activity', icon: Activity, label: 'Activity Log', href: '/dashboard/activity-log' }
          ].map(item => {
            const isActive = pathname === item.href || (item.id === 'activity' && pathname?.startsWith('/dashboard/activity-log'));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-sm text-gray-600 mt-1">Track all system activities and changes</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Log
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-purple-600 mb-1">Total Activities</p>
                <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-600 mb-1">Today</p>
                <p className="text-2xl font-bold text-blue-900">{stats.today}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-green-600 mb-1">Client Assignments</p>
                <p className="text-2xl font-bold text-green-900">{stats.clientAssignments}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <p className="text-sm text-orange-600 mb-1">New Clients</p>
                <p className="text-2xl font-bold text-orange-900">{stats.newClients}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Types</option>
              <option value="client_assigned">Client Assigned</option>
              <option value="client_created">Client Created</option>
              <option value="status_changed">Status Changed</option>
              <option value="consultation_booked">Consultation Booked</option>
              <option value="document_uploaded">Document Uploaded</option>
              <option value="note_added">Note Added</option>
              <option value="email_sent">Email Sent</option>
            </select>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {paginatedActivities.map((activity, index) => {
              const showDateHeader = index === 0 || paginatedActivities[index - 1].date !== activity.date;
              return (
                <React.Fragment key={activity.id}>
                  {showDateHeader && (
                    <div className="sticky top-0 bg-gray-100 py-2 px-4 rounded-lg mb-3 z-10">
                      <h3 className="text-sm font-semibold text-gray-700">{activity.date}</h3>
                    </div>
                  )}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{activity.user}</span>
                              <span className="text-xs text-gray-500">{activity.time}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activity.color}`}>
                                {getActivityTypeLabel(activity.type)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.details}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {activity.clientId && (
                              <Link
                                href={`/dashboard/client-details?id=${activity.clientId}`}
                                className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                                title="View Client"
                              >
                                <Eye className="w-4 h-4 text-purple-600" />
                              </Link>
                            )}
                            {activity.tcId && (
                              <Link
                                href={`/dashboard/training-counsellors/details`}
                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View TC"
                              >
                                <User className="w-4 h-4 text-blue-600" />
                              </Link>
                            )}
                          </div>
                        </div>
                        {activity.metadata && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {paginatedActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

