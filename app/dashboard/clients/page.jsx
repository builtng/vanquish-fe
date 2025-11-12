"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Search, Filter, ChevronDown, MoreVertical, Eye,
  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,
  CheckCircle, Clock, AlertTriangle, Video, FileText,
  UserCheck, Activity, Menu, Home, ClipboardList,
  Settings, LogOut, ChevronRight, MapPin, User
} from 'lucide-react';

export default function ViewAllClients() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterTC, setFilterTC] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Mock Data - All Clients
  const allClients = [
    {
      id: 'CL001',
      name: 'Emma Wilson',
      age: 31,
      email: 'emma.w@email.com',
      phone: '+44 7700 900101',
      stage: 'Active Therapy',
      matchedTC: 'Sarah Johnson',
      serviceType: 'Low Cost',
      lastActivity: '2 hours ago',
      status: 'active',
      startDate: '2025-02-15',
      sessionsCompleted: 6,
      primaryIssues: ['Depression', 'Anxiety'],
      address: '123 High Street, London',
      postcode: 'SW1A 1AA'
    },
    {
      id: 'CL002',
      name: 'John Smith',
      age: 28,
      email: 'john.s@email.com',
      phone: '+44 7700 900102',
      stage: 'Active Therapy',
      matchedTC: 'Sarah Johnson',
      serviceType: 'Mid Range',
      lastActivity: '1 day ago',
      status: 'active',
      startDate: '2025-02-01',
      sessionsCompleted: 8,
      primaryIssues: ['Anxiety', 'Work Stress'],
      address: '456 Main Road, Manchester',
      postcode: 'M1 1AA'
    },
    {
      id: 'CL003',
      name: 'Victoria James',
      age: 29,
      email: 'victoria.j@email.com',
      phone: '+44 7700 900103',
      stage: 'Consultation Booked',
      matchedTC: 'Sarah Johnson',
      serviceType: 'Low Cost',
      lastActivity: '3 hours ago',
      status: 'active',
      consultationDate: '2025-03-18 10:00 AM',
      primaryIssues: ['Anxiety', 'Work Stress'],
      address: '789 Park Lane, Birmingham',
      postcode: 'B1 1AA'
    },
    {
      id: 'CL004',
      name: 'Robert Davies',
      age: 35,
      email: 'robert.d@email.com',
      phone: '+44 7700 900104',
      stage: 'Consultation Booked',
      matchedTC: 'David Chen',
      serviceType: 'Mid Range',
      lastActivity: '5 hours ago',
      status: 'active',
      consultationDate: '2025-03-18 2:00 PM',
      primaryIssues: ['Trauma', 'Depression'],
      address: '321 Queen Street, Edinburgh',
      postcode: 'EH1 1AA'
    },
    {
      id: 'CL005',
      name: 'Charlotte Evans',
      age: 30,
      email: 'charlotte.e@email.com',
      phone: '+44 7700 900105',
      stage: 'Pending Match',
      matchedTC: null,
      serviceType: 'Low Cost',
      lastActivity: '1 hour ago',
      status: 'urgent',
      submittedDate: '2025-03-17',
      primaryIssues: ['Anxiety', 'Work Stress'],
      address: '654 Church Road, Liverpool',
      postcode: 'L1 1AA'
    },
    {
      id: 'CL006',
      name: 'Benjamin Clark',
      age: 24,
      email: 'benjamin.c@email.com',
      phone: '+44 7700 900106',
      stage: 'Pending Match',
      matchedTC: null,
      serviceType: 'Low Cost',
      lastActivity: '2 days ago',
      status: 'urgent',
      submittedDate: '2025-03-16',
      primaryIssues: ['Sexual Abuse', 'Low Self-esteem'],
      address: '987 Station Road, Bristol',
      postcode: 'BS1 1AA'
    },
    {
      id: 'CL007',
      name: 'Sophie Taylor',
      age: 29,
      email: 'sophie.t@email.com',
      phone: '+44 7700 900107',
      stage: 'Active Therapy',
      matchedTC: 'David Chen',
      serviceType: 'Low Cost',
      lastActivity: '1 day ago',
      status: 'active',
      startDate: '2025-01-25',
      sessionsCompleted: 12,
      primaryIssues: ['Trauma', 'PTSD'],
      address: '147 Bridge Street, Leeds',
      postcode: 'LS1 1AA'
    },
    {
      id: 'CL008',
      name: 'Alice Cooper',
      age: 26,
      email: 'alice.c@email.com',
      phone: '+44 7700 900108',
      stage: 'Agreement Pending',
      matchedTC: 'Priya Patel',
      serviceType: 'Low Cost',
      lastActivity: '8 days ago',
      status: 'stuck',
      matchedDate: '2025-03-12',
      primaryIssues: ['Anxiety', 'Depression'],
      address: '258 Hill Road, Newcastle',
      postcode: 'NE1 1AA'
    },
    {
      id: 'CL009',
      name: 'Thomas Wright',
      age: 33,
      email: 'thomas.w@email.com',
      phone: '+44 7700 900109',
      stage: 'Application',
      matchedTC: null,
      serviceType: 'Mid Range',
      lastActivity: '1 hour ago',
      status: 'active',
      submittedDate: '2025-03-17',
      primaryIssues: ['Depression', 'Relationship Issues'],
      address: '369 Valley Road, Sheffield',
      postcode: 'S1 1AA'
    },
    {
      id: 'CL010',
      name: 'Hannah Lee',
      age: 28,
      email: 'hannah.l@email.com',
      phone: '+44 7700 900110',
      stage: 'Active Therapy',
      matchedTC: 'Priya Patel',
      serviceType: 'Low Cost',
      lastActivity: '3 hours ago',
      status: 'active',
      startDate: '2025-02-20',
      sessionsCompleted: 8,
      primaryIssues: ['Anxiety', 'Social Anxiety'],
      address: '741 River Road, Glasgow',
      postcode: 'G1 1AA'
    },
    {
      id: 'CL011',
      name: 'Michael Brown',
      age: 35,
      email: 'michael.b@email.com',
      phone: '+44 7700 900111',
      stage: 'Active Therapy',
      matchedTC: 'Sarah Johnson',
      serviceType: 'Mid Range',
      lastActivity: '1 day ago',
      status: 'active',
      startDate: '2025-03-01',
      sessionsCompleted: 4,
      primaryIssues: ['Relationship Issues', 'Communication'],
      address: '852 Park Avenue, Cardiff',
      postcode: 'CF1 1AA'
    },
    {
      id: 'CL012',
      name: 'Sarah Martinez',
      age: 27,
      email: 'sarah.m@email.com',
      phone: '+44 7700 900112',
      stage: 'Agreement Pending',
      matchedTC: 'David Chen',
      serviceType: 'Low Cost',
      lastActivity: '9 days ago',
      status: 'stuck',
      matchedDate: '2025-03-10',
      primaryIssues: ['Stress', 'Anxiety'],
      address: '963 Castle Street, Belfast',
      postcode: 'BT1 1AA'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'urgent': return 'bg-red-500';
      case 'stuck': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStageBadgeColor = (stage) => {
    switch(stage) {
      case 'Application': return 'bg-blue-100 text-blue-800';
      case 'Consultation Booked': return 'bg-purple-100 text-purple-800';
      case 'Consultation Completed': return 'bg-purple-100 text-purple-800';
      case 'Matched': return 'bg-green-100 text-green-800';
      case 'Pending Match': return 'bg-yellow-100 text-yellow-800';
      case 'Agreement Pending': return 'bg-orange-100 text-orange-800';
      case 'Active Therapy': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = allClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || client.stage === filterStage;
    const matchesTC = filterTC === 'all' || client.matchedTC === filterTC;
    const matchesService = filterService === 'all' || client.serviceType === filterService;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStage && matchesTC && matchesService && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const ClientDetailPanel = ({ client, onClose }) => (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
          <p className="text-sm text-gray-600">{client.email}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Status & Stage */}
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}></div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColor(client.stage)}`}>
            {client.stage}
          </span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">Age</p>
            <p className="text-2xl font-bold text-purple-900">{client.age}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Service Type</p>
            <p className="text-sm font-bold text-blue-900">{client.serviceType}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{client.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{client.phone}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p>{client.address}</p>
                <p>{client.postcode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Issues */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Issues</h3>
          <div className="flex flex-wrap gap-2">
            {client.primaryIssues.map(issue => (
              <span key={issue} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                {issue}
              </span>
            ))}
          </div>
        </div>

        {/* Matched TC */}
        {client.matchedTC && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Matched Training Counsellor</h3>
            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{client.matchedTC}</p>
                <p className="text-sm text-gray-600">Training Counsellor</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Info */}
        {client.sessionsCompleted && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sessions Completed</span>
                <span className="font-semibold text-gray-900">{client.sessionsCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Start Date</span>
                <span className="font-semibold text-gray-900">{client.startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Activity</span>
                <span className="font-semibold text-gray-900">{client.lastActivity}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Progress to Next Stage
          </button>
          <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Book Consultation
          </button>
          <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Send Email
          </button>
          <button className="w-full py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium">
            Archive Client
          </button>
        </div>
      </div>
    </div>
  );

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
            { id: 'matches', icon: UserCheck, label: 'Pending Matches', badge: 8, href: '/dashboard' },
            { id: 'tcs', icon: Users, label: 'Training Counsellors', href: '/dashboard/training-counsellors' },
            { id: 'clients', icon: ClipboardList, label: 'All Clients', href: '/dashboard/clients' },
            { id: 'activity', icon: Activity, label: 'Activity Log', href: '/dashboard' }
          ].map(item => {
            const isActive = pathname === item.href;
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Clients</h1>
                <p className="text-sm text-gray-600 mt-1">{filteredClients.length} clients total</p>
              </div>
              <Link href="/dashboard/clients/edit" className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2" style={{ backgroundColor: '#6f1d56' }}>
                <Users className="w-4 h-4" />
                Add New Client
              </Link>
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
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Stages</option>
              <option value="Application">Application</option>
              <option value="Consultation Booked">Consultation Booked</option>
              <option value="Pending Match">Pending Match</option>
              <option value="Agreement Pending">Agreement Pending</option>
              <option value="Active Therapy">Active Therapy</option>
            </select>
            <select
              value={filterTC}
              onChange={(e) => setFilterTC(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All TCs</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="David Chen">David Chen</option>
              <option value="Priya Patel">Priya Patel</option>
            </select>
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Status</option>
              <option value="urgent">Urgent</option>
              <option value="stuck">Stuck</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matched TC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <Link href={`/dashboard/client-details`} className="font-medium text-gray-900 hover:text-purple-600">
                        {client.name}
                      </Link>
                      <p className="text-sm text-gray-600">{client.age} years old</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageBadgeColor(client.stage)}`}>
                      {client.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.matchedTC ? (
                      <span className="text-sm text-gray-900">{client.matchedTC}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{client.serviceType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{client.lastActivity}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/client-details`}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-purple-600" />
                      </Link>
                      <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="Send Email">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={20}>20 per page</option>
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

      {/* Side Panel */}
      {selectedClient && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedClient(null)}></div>
          <ClientDetailPanel client={selectedClient} onClose={() => setSelectedClient(null)} />
        </>
      )}
    </div>
  );
}

