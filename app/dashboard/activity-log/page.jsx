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
  Save, XCircle, AlertCircle, Info, TrendingUp, Building2, CalendarDays
} from 'lucide-react';
import apiService from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import DashboardLayout from '@/components/DashboardLayout';

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
    };
    return iconMap[type] || Activity;
  };

  // Color mapping for activity types
  const getActivityColor = (type) => {
    const colorMap = {
      'client_assigned': 'bg-green-100 text-green-800',
      'client_created': 'bg-blue-100 text-blue-800',
      'client_tc_matched': 'bg-green-100 text-green-800',
      'status_changed': 'bg-yellow-100 text-yellow-800',
      'consultation_booked': 'bg-purple-100 text-purple-800',
      'consultation_completed': 'bg-green-100 text-green-800',
      'document_uploaded': 'bg-indigo-100 text-indigo-800',
      'note_added': 'bg-gray-100 text-gray-800',
      'email_sent': 'bg-cyan-100 text-cyan-800',
      'tc_created': 'bg-blue-100 text-blue-800',
      'agreement_signed': 'bg-green-100 text-green-800',
      'session_completed': 'bg-green-100 text-green-800',
      'risk_flag': 'bg-red-100 text-red-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
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
            user: log.user ? `${log.user.name} (Admin)` : 'System',
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
      'risk_flag': 'Risk Flag'
    };
    return labels[type] || type;
  };

  const filteredActivities = activities.filter(activity => {
    // Only show activities from internal team (exclude counsellors - those with "(TC)" in name)
    const isInternalTeamAction = !activity.user.includes('(TC)') && activity.user !== 'System';
    if (!isInternalTeamAction) return false;
    
    const matchesSearch = activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesUser = filterUser === 'all' || activity.user === filterUser;
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
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading activities...</p>
            </div>
          ) : (
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
                            {activity.clientUuid && (
                              <Link
                                href={`/dashboard/client-details/${activity.clientUuid}`}
                                className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                                title="View Client"
                              >
                                <Eye className="w-4 h-4 text-purple-600" />
                              </Link>
                            )}
                            {activity.tcUuid && (
                              <Link
                                href={`/dashboard/training-counsellors/details/${activity.tcUuid}`}
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
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
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
    </DashboardLayout>
  );
}

