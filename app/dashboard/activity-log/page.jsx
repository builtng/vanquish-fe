"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Search, Filter, ChevronDown, MoreVertical, Eye,
  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,
  CheckCircle, Clock, AlertTriangle, Video, FileText,
  UserCheck, Activity, ChevronRight, MapPin, User,
  UserPlus, UserMinus, FileCheck, Shield, Bell,
  MessageSquare, Archive, Download, Send, Plus,
  Save, XCircle, AlertCircle, Info, TrendingUp, Building2, CalendarDays, SeparatorHorizontal, Image, Star
} from 'lucide-react';
import apiService from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';

export default function ActivityLogPage() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalActivities, setTotalActivities] = useState(0);

  // Icon mapping for activity types
  const getActivityIcon = (type) => {
    const iconMap = {
      'client_assigned': UserCheck,
      'client_created': UserPlus,
      'client_tc_matched': UserCheck,
      'status_changed': Edit,
      'consultation_booked': Calendar,
      'consultation_completed': CheckCircle,
      'document_uploaded': FileCheck,
      'note_added': MessageSquare,
      'email_sent': Mail,
      'tc_created': UserPlus,
      'agreement_signed': FileCheck,
      'session_completed': CheckCircle,
      'risk_flag': AlertTriangle,
      'client_updated': Edit,
      'client_deleted': Trash2,
      'client_stage_progressed': TrendingUp,
      'feedback_form_sent': MessageSquare,
      'agreement_resent': Mail,
      'satisfaction_score_updated': Star,
      'client_photo_uploaded': Image,
      'client_photo_deleted': Trash2,
      'tc_updated': Edit,
      'tc_transitioned_to_qualified': Shield,
      'qualified_form_submitted': FileCheck,
      'qualified_form_email_sent': Mail,
      'tc_photo_uploaded': Image,
      'tc_photo_deleted': Trash2,
    };
    return iconMap[type] || Activity;
  };

  // Color mapping for activity types
  // Color mapping for activity types
  const getActivityColor = (type) => {
    const colorMap = {
      'client_assigned': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
      'client_created': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
      'client_tc_matched': 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30',
      'status_changed': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
      'consultation_booked': 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30',
      'consultation_completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
      'document_uploaded': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30',
      'note_added': 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30',
      'email_sent': 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30',
      'tc_created': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
      'agreement_signed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
      'session_completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
      'risk_flag': 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
      'client_updated': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
      'client_deleted': 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
      'client_stage_progressed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
      'feedback_form_sent': 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30',
      'agreement_resent': 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30',
      'satisfaction_score_updated': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
      'client_photo_uploaded': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
      'client_photo_deleted': 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
      'tc_updated': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
      'tc_transitioned_to_qualified': 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30',
      'qualified_form_submitted': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
      'qualified_form_email_sent': 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30',
      'tc_photo_uploaded': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
      'tc_photo_deleted': 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
    };
    return colorMap[type] || 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30';
  };

  // Fetch activity logs from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // Fetch a large number to allow frontend filtering
        const params = {
          per_page: 1000, // Fetch more to allow filtering
        };
        
        if (filterType !== 'all') {
          params.action = filterType;
        }

        const response = await apiService.getActivityLogs(params);
        
        // Transform API response to match component format
        const transformedActivities = response.data.map((log) => {
          const createdAt = new Date(log.created_at);
          const date = createdAt.toISOString().split('T')[0];
          const time = createdAt.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }).replace(':', ':').slice(0, 5);
          
          // Build details string from description
          let details = log.description || '';
          if (log.action === 'client_tc_matched' && log.client_name && log.tc_name) {
            // For matches, show both client and TC
            details = `${log.client_name} matched with ${log.tc_name}`;
          } else if (log.client_name && log.client_id) {
            details = `${log.client_name} (${log.client_id})`;
            if (log.changes) {
              const changes = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
              if (changes.serviceType) {
                details += ` - ${changes.serviceType} service`;
              }
            }
          } else if (log.tc_name && log.tc_id) {
            details = `${log.tc_name} (${log.tc_id})`;
            if (log.changes) {
              const changes = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
              if (changes.modality) {
                details += ` - ${changes.modality} modality`;
              }
            }
          }

          return {
            id: log.id,
            timestamp: log.created_at,
            date: date,
            time: time,
            type: log.action,
            icon: getActivityIcon(log.action),
            color: getActivityColor(log.action),
            user: log.user ? log.user.name : 'System',
            userEmail: log.user?.email || null,
            userRole: log.user?.role || null,
            userId: log.user?.id || null,
            action: log.description || '',
            details: details,
            clientId: log.client_id,
            clientUuid: log.client_uuid,
            tcId: log.tc_id,
            tcUuid: log.tc_uuid,
            metadata: log.changes || {},
          };
        });

        setActivities(transformedActivities);
        setTotalActivities(response.total || transformedActivities.length);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [currentPage, itemsPerPage, filterType]);

  const getActivityTypeLabel = (type) => {
    const labels = {
      'client_assigned': 'Client Assigned',
      'client_created': 'Client Created',
      'client_tc_matched': 'Client Matched',
      'status_changed': 'Status Changed',
      'consultation_booked': 'Consultation Booked',
      'consultation_completed': 'Consultation Completed',
      'document_uploaded': 'Document Uploaded',
      'note_added': 'Note Added',
      'email_sent': 'Email Sent',
      'tc_created': 'TC Created',
      'agreement_signed': 'Agreement Signed',
      'session_completed': 'Session Completed',
      'risk_flag': 'Risk Flag',
      'client_updated': 'Client Updated',
      'client_deleted': 'Client Deleted',
      'client_stage_progressed': 'Stage Progressed',
      'feedback_form_sent': 'Feedback Requested',
      'agreement_resent': 'Agreement Resent',
      'satisfaction_score_updated': 'Score Updated',
      'client_photo_uploaded': 'Photo Uploaded',
      'client_photo_deleted': 'Photo Deleted',
      'tc_updated': 'TC Updated',
      'tc_transitioned_to_qualified': 'Qualified Transition',
      'qualified_form_submitted': 'Form Submitted',
      'qualified_form_email_sent': 'Form Email Sent',
      'tc_photo_uploaded': 'Photo Uploaded',
      'tc_photo_deleted': 'Photo Deleted',
    };
    return labels[type] || type;
  };

  const filteredActivities = activities.filter(activity => {
    // Only show activities from internal team (exclude counsellors - those with "(TC)" in name)
    const isInternalTeamAction = !activity.user.includes('(TC)') && activity.user !== 'System';
    if (!isInternalTeamAction) return false;
    
    const matchesSearch = activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.userEmail && activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesUser = filterUser === 'all' || activity.user === filterUser || (activity.userEmail && activity.userEmail === filterUser);
    const matchesDate = filterDateRange === 'all' || activity.date === filterDateRange;
    return matchesSearch && matchesType && matchesUser && matchesDate;
  });

  // Since we're filtering on frontend, calculate pagination from filtered results
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  // Filter users to only show internal team members
  const uniqueUsers = [...new Set(activities
    .filter(a => !a.user.includes('(TC)') && a.user !== 'System')
    .map(a => a.user))];
  const today = new Date().toISOString().split('T')[0];
  const uniqueDates = [...new Set(activities.map(a => a.date))].sort().reverse().slice(0, 7);

  // Filter activities to only internal team for stats
  const internalTeamActivities = activities.filter(a => !a.user.includes('(TC)') && a.user !== 'System');
  const stats = {
    total: totalActivities,
    today: internalTeamActivities.filter(a => a.date === today).length,
    clientAssignments: internalTeamActivities.filter(a => a.type === 'client_assigned').length,
    newClients: internalTeamActivities.filter(a => a.type === 'client_created').length
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          actions={
            <button className="px-4 py-2 border border-border text-foreground bg-card rounded-lg hover:bg-hover-bg font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export Log
            </button>
          }
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
            <p className="text-sm text-muted-foreground mt-1">Track all system activities and changes</p>
          </div>
        </DashboardHeader>

        {/* Stats Cards */}
        <div className="bg-sidebar border-b border-sidebar-border px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-foreground">{stats.today}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client Assignments</p>
                  <p className="text-2xl font-bold text-foreground">{stats.clientAssignments}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 flex items-center justify-center">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Clients</p>
                  <p className="text-2xl font-bold text-foreground">{stats.newClients}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-sidebar border-b border-sidebar-border px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-input text-input-text rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div className="min-w-[120px] flex-shrink-0">
              <SearchableSelect
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'client_assigned', label: 'Client Assigned' },
                  { value: 'client_created', label: 'Client Created' },
                  { value: 'client_tc_matched', label: 'Client Matched' },
                  { value: 'status_changed', label: 'Status Changed' },
                  { value: 'consultation_booked', label: 'Consultation Booked' },
                  { value: 'document_uploaded', label: 'Document Uploaded' },
                  { value: 'note_added', label: 'Note Added' },
                  { value: 'email_sent', label: 'Email Sent' }
                ]}
                placeholder="All Types"
                className="text-sm"
              />
            </div>
            <div className="min-w-[120px] flex-shrink-0">
              <SearchableSelect
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                options={[
                  { value: 'all', label: 'All Users' },
                  ...uniqueUsers.map(user => ({ value: user, label: user }))
                ]}
                placeholder="All Users"
                className="text-sm"
              />
            </div>
            <div className="min-w-[120px] flex-shrink-0">
              <SearchableSelect
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                options={[
                  { value: 'all', label: 'All Dates' },
                  ...uniqueDates.map(date => ({ value: date, label: date }))
                ]}
                placeholder="All Dates"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-[var(--text-secondary)]">Loading activities...</p>
            </div>
          ) : (
          <div className="space-y-3">
            {paginatedActivities.map((activity, index) => {
              const showDateHeader = index === 0 || paginatedActivities[index - 1].date !== activity.date;
              return (
                <React.Fragment key={activity.id}>
                  {showDateHeader && (
                    <div className="sticky top-0 bg-gray-100 dark:bg-[var(--hover-bg)] py-2 px-4 rounded-lg mb-3 z-10">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-[var(--text-primary)]">{activity.date}</h3>
                    </div>
                  )}
                  <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{activity.user}</span>
                                {activity.userRole && (
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 rounded-full">
                                    {activity.userRole}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-text-tertiary">{activity.time}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activity.color}`}>
                                {getActivityTypeLabel(activity.type)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mb-1">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {activity.clientUuid && (
                              <Link
                                href={`/dashboard/client-details/${activity.clientUuid}`}
                                className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-lg transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30"
                                title="View Client"
                              >
                                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                              </Link>
                            )}
                            {activity.tcUuid && (
                              <Link
                                href={`/dashboard/training-counsellors/details/${activity.tcUuid}`}
                                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                                title="View TC"
                              >
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                              </Link>
                            )}
                          </div>
                        </div>
                        {activity.metadata && (
                          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[var(--card-border)]">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/20 text-xs rounded-full">
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
                <Activity className="w-16 h-16 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Activities Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-sidebar border-t border-sidebar-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </span>
              <SearchableSelect
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                options={[
                  { value: 25, label: '25 per page' },
                  { value: 50, label: '50 per page' },
                  { value: 100, label: '100 per page' }
                ]}
                placeholder="25 per page"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)]"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

