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
  Star, TrendingUp, Award, Shield, Zap
} from 'lucide-react';

export default function PendingMatchesPage() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTC, setSelectedTC] = useState(null);

  // Mock Pending Match Clients
  const pendingMatches = [
    {
      id: 'CL005',
      name: 'Charlotte Evans',
      age: 30,
      email: 'charlotte.e@email.com',
      phone: '+44 7700 900105',
      serviceType: 'Low Cost',
      submittedDate: '2025-03-17',
      daysWaiting: 1,
      urgency: 'high',
      primaryIssues: ['Anxiety', 'Work Stress'],
      preferredModality: 'CBT',
      availability: ['Monday morning', 'Wednesday afternoon', 'Friday evening'],
      location: 'Liverpool',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC001', name: 'Sarah Johnson', modality: 'CBT', matchScore: 92, currentClients: 3, availability: 'High' },
        { id: 'TC003', name: 'Priya Patel', modality: 'Integrative', matchScore: 78, currentClients: 2, availability: 'High' }
      ]
    },
    {
      id: 'CL006',
      name: 'Benjamin Clark',
      age: 24,
      email: 'benjamin.c@email.com',
      phone: '+44 7700 900106',
      serviceType: 'Low Cost',
      submittedDate: '2025-03-16',
      daysWaiting: 2,
      urgency: 'high',
      primaryIssues: ['Sexual Abuse', 'Low Self-esteem'],
      preferredModality: 'Person-Centred',
      availability: ['Tuesday evening', 'Thursday evening'],
      location: 'Bristol',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC002', name: 'David Chen', modality: 'Person-Centred', matchScore: 88, currentClients: 4, availability: 'Medium' },
        { id: 'TC006', name: 'Mohammed Ali', modality: 'Integrative', matchScore: 75, currentClients: 5, availability: 'Low' }
      ]
    },
    {
      id: 'CL009',
      name: 'Thomas Wright',
      age: 33,
      email: 'thomas.w@email.com',
      phone: '+44 7700 900109',
      serviceType: 'Mid Range',
      submittedDate: '2025-03-17',
      daysWaiting: 1,
      urgency: 'medium',
      primaryIssues: ['Depression', 'Relationship Issues'],
      preferredModality: 'CBT',
      availability: ['Monday afternoon', 'Wednesday morning', 'Friday afternoon'],
      location: 'Sheffield',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC001', name: 'Sarah Johnson', modality: 'CBT', matchScore: 95, currentClients: 3, availability: 'High' },
        { id: 'TC004', name: 'James Wilson', modality: 'CBT', matchScore: 82, currentClients: 6, availability: 'Low' }
      ]
    },
    {
      id: 'CL013',
      name: 'Olivia Green',
      age: 27,
      email: 'olivia.g@email.com',
      phone: '+44 7700 900113',
      serviceType: 'Low Cost',
      submittedDate: '2025-03-15',
      daysWaiting: 3,
      urgency: 'high',
      primaryIssues: ['Anxiety', 'Social Anxiety', 'Low Confidence'],
      preferredModality: 'Integrative',
      availability: ['Tuesday morning', 'Thursday morning'],
      location: 'Manchester',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC003', name: 'Priya Patel', modality: 'Integrative', matchScore: 90, currentClients: 2, availability: 'High' },
        { id: 'TC006', name: 'Mohammed Ali', modality: 'Integrative', matchScore: 85, currentClients: 5, availability: 'Low' }
      ]
    },
    {
      id: 'CL014',
      name: 'Daniel Harris',
      age: 29,
      email: 'daniel.h@email.com',
      phone: '+44 7700 900114',
      serviceType: 'Mid Range',
      submittedDate: '2025-03-18',
      daysWaiting: 0,
      urgency: 'low',
      primaryIssues: ['Work Stress', 'Communication Problems'],
      preferredModality: 'CBT',
      availability: ['Monday evening', 'Wednesday evening'],
      location: 'London',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC001', name: 'Sarah Johnson', modality: 'CBT', matchScore: 88, currentClients: 3, availability: 'High' },
        { id: 'TC004', name: 'James Wilson', modality: 'CBT', matchScore: 80, currentClients: 6, availability: 'Low' }
      ]
    },
    {
      id: 'CL015',
      name: 'Sophia Martinez',
      age: 31,
      email: 'sophia.m@email.com',
      phone: '+44 7700 900115',
      serviceType: 'Low Cost',
      submittedDate: '2025-03-14',
      daysWaiting: 4,
      urgency: 'high',
      primaryIssues: ['Grief & Loss', 'Depression'],
      preferredModality: 'Person-Centred',
      availability: ['Tuesday afternoon', 'Thursday afternoon'],
      location: 'Birmingham',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC002', name: 'David Chen', modality: 'Person-Centred', matchScore: 93, currentClients: 4, availability: 'Medium' },
        { id: 'TC005', name: 'Emily Roberts', modality: 'Person-Centred', matchScore: 85, currentClients: 0, availability: 'N/A (On Leave)' }
      ]
    },
    {
      id: 'CL016',
      name: 'Lucas Brown',
      age: 26,
      email: 'lucas.b@email.com',
      phone: '+44 7700 900116',
      serviceType: 'Mid Range',
      submittedDate: '2025-03-18',
      daysWaiting: 0,
      urgency: 'medium',
      primaryIssues: ['Anxiety', 'Panic Attacks'],
      preferredModality: 'CBT',
      availability: ['Monday morning', 'Friday morning'],
      location: 'Leeds',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC001', name: 'Sarah Johnson', modality: 'CBT', matchScore: 91, currentClients: 3, availability: 'High' },
        { id: 'TC004', name: 'James Wilson', modality: 'CBT', matchScore: 87, currentClients: 6, availability: 'Low' }
      ]
    },
    {
      id: 'CL017',
      name: 'Emma Thompson',
      age: 28,
      email: 'emma.t@email.com',
      phone: '+44 7700 900117',
      serviceType: 'Low Cost',
      submittedDate: '2025-03-13',
      daysWaiting: 5,
      urgency: 'high',
      primaryIssues: ['Trauma', 'PTSD', 'Anxiety'],
      preferredModality: 'Person-Centred',
      availability: ['Wednesday evening', 'Friday evening'],
      location: 'Glasgow',
      matchScore: null,
      suggestedTCs: [
        { id: 'TC002', name: 'David Chen', modality: 'Person-Centred', matchScore: 89, currentClients: 4, availability: 'Medium' }
      ]
    }
  ];

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityBadge = (availability) => {
    switch(availability) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMatches = pendingMatches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || match.serviceType === filterService;
    const matchesUrgency = filterUrgency === 'all' || match.urgency === filterUrgency;
    return matchesSearch && matchesService && matchesUrgency;
  }).sort((a, b) => {
    if (sortBy === 'urgency') {
      const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    } else if (sortBy === 'daysWaiting') {
      return b.daysWaiting - a.daysWaiting;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const stats = {
    total: pendingMatches.length,
    highUrgency: pendingMatches.filter(m => m.urgency === 'high').length,
    waitingOver3Days: pendingMatches.filter(m => m.daysWaiting >= 3).length,
    lowCost: pendingMatches.filter(m => m.serviceType === 'Low Cost').length
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
            const isActive = pathname === item.href || (item.id === 'matches' && pathname?.startsWith('/dashboard/pending-matches'));
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
                <h1 className="text-2xl font-bold text-gray-900">Pending Matches</h1>
                <p className="text-sm text-gray-600 mt-1">Clients waiting to be matched with training counsellors</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-purple-600 mb-1">Total Pending</p>
                <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <p className="text-sm text-red-600 mb-1">High Urgency</p>
                <p className="text-2xl font-bold text-red-900">{stats.highUrgency}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <p className="text-sm text-orange-600 mb-1">Waiting 3+ Days</p>
                <p className="text-2xl font-bold text-orange-900">{stats.waitingOver3Days}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-600 mb-1">Low Cost Service</p>
                <p className="text-2xl font-bold text-blue-900">{stats.lowCost}</p>
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
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Services</option>
              <option value="Low Cost">Low Cost</option>
              <option value="Mid Range">Mid Range</option>
            </select>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Urgency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="urgency">Sort: Urgency</option>
              <option value="daysWaiting">Sort: Days Waiting</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredMatches.map(client => (
              <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/dashboard/client-details?id=${client.id}`} className="text-lg font-bold text-gray-900 hover:text-purple-600">
                          {client.name}, {client.age}
                        </Link>
                        <div className={`w-3 h-3 rounded-full ${getUrgencyColor(client.urgency)}`}></div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(client.urgency)}`}>
                          {client.urgency.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {client.daysWaiting} {client.daysWaiting === 1 ? 'day' : 'days'} waiting
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{client.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {client.serviceType}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Prefers: {client.preferredModality}
                        </span>
                        {client.primaryIssues.map(issue => (
                          <span key={issue} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {issue}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Availability:</span> {client.availability.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowAssignModal(true);
                      }}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"
                      style={{ backgroundColor: '#6f1d56' }}
                    >
                      <UserCheck className="w-4 h-4" />
                      Assign TC
                    </button>
                    <Link
                      href={`/dashboard/client-details?id=${client.id}`}
                      className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Suggested TCs */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">💡 Suggested Training Counsellors:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {client.suggestedTCs.map(tc => (
                      <div key={tc.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link href={`/dashboard/training-counsellors/details`} className="font-semibold text-gray-900 hover:text-purple-600">
                                {tc.name}
                              </Link>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {tc.matchScore}% match
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{tc.modality} • {tc.currentClients} current clients</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityBadge(tc.availability)}`}>
                              Availability: {tc.availability}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setSelectedTC(tc);
                              setShowAssignModal(true);
                            }}
                            className="px-3 py-1.5 text-white rounded-lg hover:opacity-90 text-xs font-medium"
                            style={{ backgroundColor: '#6f1d56' }}
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredMatches.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Matches Found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedClient && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => {
            setShowAssignModal(false);
            setSelectedClient(null);
            setSelectedTC(null);
          }}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Assign Training Counsellor</h2>
                <button onClick={() => {
                  setShowAssignModal(false);
                  setSelectedClient(null);
                  setSelectedTC(null);
                }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                  <p className="font-semibold text-purple-900 mb-1">{selectedClient.name}</p>
                  <p className="text-sm text-purple-700">{selectedClient.age} years old • {selectedClient.serviceType}</p>
                  <p className="text-xs text-purple-600 mt-1">Primary Issues: {selectedClient.primaryIssues.join(', ')}</p>
                </div>

                {selectedTC ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <p className="font-semibold text-green-900 mb-1">{selectedTC.name}</p>
                    <p className="text-sm text-green-700">{selectedTC.modality} • Match Score: {selectedTC.matchScore}%</p>
                    <p className="text-xs text-green-600 mt-1">Current Clients: {selectedTC.currentClients} • Availability: {selectedTC.availability}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Training Counsellor</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                      <option value="">Choose a TC...</option>
                      {selectedClient.suggestedTCs.map(tc => (
                        <option key={tc.id} value={tc.id}>
                          {tc.name} ({tc.modality}) - {tc.matchScore}% match
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Notes (Optional)</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Add any notes about this assignment..."
                  />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input type="checkbox" id="sendNotification" defaultChecked className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
                  <label htmlFor="sendNotification" className="text-sm text-gray-700">
                    Send notification emails to client and TC
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedTC(null);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert(`Client "${selectedClient.name}" assigned to "${selectedTC?.name || 'selected TC'}" successfully!`);
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedTC(null);
                    }}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium"
                    style={{ backgroundColor: '#6f1d56' }}
                  >
                    Assign Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

