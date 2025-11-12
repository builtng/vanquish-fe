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

  Download, Send, Archive, Plus, ChevronLeft,

  CreditCard, Package, AlertCircle, Check, XCircle,

  Save, ChevronUp, Award, BookOpen, Briefcase,

  GraduationCap, FileCheck, Shield

} from 'lucide-react';



export default function IndividualTCDetailPage() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [activeNotesTab, setActiveNotesTab] = useState('admin');

  const [showAssignModal, setShowAssignModal] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);



  // Mock TC data

  const tc = {

    id: 'TC001',

    name: 'Sarah Johnson',

    email: 'sarah.j@vanquish.com',

    phone: '+44 7700 900201',

    status: 'Active',

    modality: 'CBT - Cognitive Behavioral Therapy',

    

    // Overview stats

    currentClients: 3,

    totalSessionsCompleted: 28,

    daysInSystem: 120,

    averageMatchScore: 85,

    

    // Personal Information

    age: 29,

    gender: 'Female',

    ethnicity: 'White British',

    pronouns: 'She/Her',

    

    // Professional Information

    course: 'Level 4 Diploma in Therapeutic Counselling',

    institution: 'CPCAB',

    yearOfStudy: 'Year 2',

    expectedGraduation: '2025-06',

    supervisor: 'Dr. Michael Thompson',

    joinedDate: '2024-08-15',

    

    // Availability

    availability: {

      Monday: ['morning-early', 'morning-late'],

      Tuesday: [],

      Wednesday: ['afternoon-early'],

      Thursday: [],

      Friday: ['morning-late']

    },

    

    // Clinical Expertise

    topicsWithExperience: [

      'Anxiety',

      'Depression',

      'Work Stress',

      'Relationship Issues',

      'Low Self-esteem',

      'Grief & Loss',

      'Life Transitions',

      'Communication Problems'

    ],

    topicsNotReadyFor: [

      'Sexual Abuse',

      'Domestic Violence',

      'Suicidal Ideation'

    ],

    

    // Current Clients

    currentClientsList: [

      {

        id: 'CL001',

        name: 'Emma Wilson',

        age: 31,

        startDate: '2025-02-28',

        sessionsCompleted: 6,

        primaryIssues: ['Anxiety', 'Work Stress'],

        lastSession: '2025-03-21',

        nextSession: '2025-03-28'

      },

      {

        id: 'CL002',

        name: 'John Smith',

        age: 28,

        startDate: '2025-02-01',

        sessionsCompleted: 8,

        primaryIssues: ['Depression', 'Relationship Issues'],

        lastSession: '2025-03-20',

        nextSession: '2025-03-27'

      },

      {

        id: 'CL011',

        name: 'Michael Brown',

        age: 35,

        startDate: '2025-03-01',

        sessionsCompleted: 4,

        primaryIssues: ['Work Stress', 'Communication'],

        lastSession: '2025-03-22',

        nextSession: '2025-03-29'

      }

    ],

    

    // Documents

    documents: [

      { id: 'DOC001', name: 'DBS Certificate', type: 'DBS', uploadDate: '2024-08-10', status: 'Verified', url: '#' },

      { id: 'DOC002', name: 'Professional Indemnity Insurance', type: 'Insurance', uploadDate: '2024-08-10', status: 'Verified', url: '#' },

      { id: 'DOC003', name: 'Course Certificate', type: 'Qualification', uploadDate: '2024-08-12', status: 'Verified', url: '#' },

      { id: 'DOC004', name: 'Student ID', type: 'ID', uploadDate: '2024-08-12', status: 'Verified', url: '#' },

      { id: 'DOC005', name: 'Supervisor Agreement', type: 'Agreement', uploadDate: '2024-08-15', status: 'Verified', url: '#' },

      { id: 'DOC006', name: 'Fitness to Practice Certificate', type: 'Fitness', uploadDate: '2024-08-15', status: 'Verified', url: '#' }

    ],

    

    // Performance

    performance: {

      clientSatisfaction: 4.8,

      sessionAttendanceRate: 95,

      dnaRate: 5,

      responseTime: '2 hours'

    }

  };



  // Admin notes

  const adminNotes = [

    {

      id: 'AN001',

      date: '2024-08-15 10:00 AM',

      author: 'Isha (Admin)',

      content: 'TC application approved. Excellent references and strong motivation. Matched modality is CBT which we need more of.'

    },

    {

      id: 'AN002',

      date: '2024-09-01 2:30 PM',

      author: 'Isha (Admin)',

      content: 'First client match completed successfully. Sarah showed great professionalism in initial client contact.'

    },

    {

      id: 'AN003',

      date: '2024-10-15 11:00 AM',

      author: 'Isha (Admin)',

      content: 'Feedback from clients has been very positive. Sarah demonstrates strong therapeutic alliance building.'

    }

  ];



  const timeSlots = [

    { value: 'morning-early', label: '10-11am' },

    { value: 'morning-late', label: '11am-1pm' },

    { value: 'afternoon-early', label: '1-4pm' },

    { value: 'afternoon-late', label: '4-5pm' },

    { value: 'evening', label: '5-7pm' }

  ];



  const getStatusColor = (status) => {

    switch(status) {

      case 'Active': return 'bg-green-500';

      case 'At Capacity': return 'bg-orange-500';

      case 'On Leave': return 'bg-blue-500';

      case 'Away': return 'bg-yellow-500';

      case 'Inactive': return 'bg-gray-500';

      default: return 'bg-gray-400';

    }

  };



  const getStatusBadge = (status) => {

    const colors = {

      'Active': 'bg-green-100 text-green-800',

      'At Capacity': 'bg-orange-100 text-orange-800',

      'On Leave': 'bg-blue-100 text-blue-800',

      'Away': 'bg-yellow-100 text-yellow-800',

      'Inactive': 'bg-gray-100 text-gray-800'

    };

    return colors[status] || 'bg-gray-100 text-gray-800';

  };



  const getDocumentStatusBadge = (status) => {

    if (status === 'Verified') {

      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">

        <CheckCircle className="w-3 h-3" /> Verified

      </span>;

    } else if (status === 'Pending') {

      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">

        <Clock className="w-3 h-3" /> Pending

      </span>;

    }

    return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">

      <AlertTriangle className="w-3 h-3" /> Expired

    </span>;

  };



  const getInitialsColor = () => {

    return 'bg-purple-500';

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

            const isActive = pathname === item.href || (item.id === 'tcs' && pathname?.startsWith('/dashboard/training-counsellors'));

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



        <div className="p-4 border-t border-gray-200 space-y-2">

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

          {/* Breadcrumb */}

          <div className="px-6 py-3 border-b border-gray-100">

            <div className="flex items-center gap-2 text-sm text-gray-600">

              <Link href="/dashboard/training-counsellors" className="hover:text-purple-600">All Training Counsellors</Link>

              <ChevronRight className="w-4 h-4" />

              <span className="text-gray-900 font-medium">{tc.name}</span>

            </div>

          </div>



          {/* TC Header */}

          <div className="px-6 py-4">

            <div className="flex items-start justify-between">

              <div className="flex items-start gap-4">

                <div className={`w-16 h-16 rounded-full ${getInitialsColor()} flex items-center justify-center text-white text-2xl font-bold`}>

                  {tc.name.split(' ').map(n => n[0]).join('')}

                </div>

                <div>

                  <div className="flex items-center gap-3 mb-2">

                    <h1 className="text-2xl font-bold text-gray-900">{tc.name}</h1>

                    <span className="text-gray-600">•</span>

                    <span className="text-lg text-gray-600">{tc.age} years old</span>

                    <span className="text-gray-600">•</span>

                    <span className="text-sm text-gray-500">ID: {tc.id}</span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className={`w-3 h-3 rounded-full ${getStatusColor(tc.status)}`}></div>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(tc.status)}`}>

                      {tc.status}

                    </span>

                    <span className="text-sm text-gray-600">{tc.modality}</span>

                  </div>

                </div>

              </div>



              {/* Quick Actions */}

              <div className="flex items-center gap-2">

                <button

                  onClick={() => setShowStatusModal(true)}

                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"

                >

                  <Clock className="w-4 h-4" />

                  Change Status

                </button>

                <button

                  onClick={() => setShowAssignModal(true)}

                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"

                  style={{ backgroundColor: '#6f1d56' }}

                >

                  <UserCheck className="w-4 h-4" />

                  Assign Client

                </button>

                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">

                  <Mail className="w-4 h-4" />

                  Send Email

                </button>

                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">

                  <Edit className="w-4 h-4" />

                  Edit

                </button>

              </div>

            </div>

          </div>

        </div>



        {/* Content Area - Scrollable */}

        <div className="flex-1 overflow-y-auto">

          <div className="p-6 space-y-6">

            {/* Overview Cards */}

            <div className="grid grid-cols-4 gap-4">

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">

                <p className="text-sm text-purple-600 mb-1">Current Clients</p>

                <p className="text-2xl font-bold text-purple-900">{tc.currentClients}</p>

              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">

                <p className="text-sm text-blue-600 mb-1">Sessions Completed</p>

                <p className="text-2xl font-bold text-blue-900">{tc.totalSessionsCompleted}</p>

              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">

                <p className="text-sm text-green-600 mb-1">Days in System</p>

                <p className="text-2xl font-bold text-green-900">{tc.daysInSystem}</p>

              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">

                <p className="text-sm text-orange-600 mb-1">Avg Match Score</p>

                <p className="text-2xl font-bold text-orange-900">{tc.averageMatchScore}%</p>

              </div>

            </div>



            {/* Two Column Layout */}

            <div className="grid grid-cols-3 gap-6">

              {/* Left Column - 2/3 width */}

              <div className="col-span-2 space-y-6">

                {/* Personal Information */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

                    <Link href="/dashboard/training-counsellors/details" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">

                      <Edit className="w-4 h-4" />

                      Edit

                    </Link>

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Full Name</p>

                      <p className="text-sm font-medium text-gray-900">{tc.name}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Age</p>

                      <p className="text-sm font-medium text-gray-900">{tc.age} years old</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Email</p>

                      <p className="text-sm font-medium text-gray-900">{tc.email}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Phone</p>

                      <p className="text-sm font-medium text-gray-900">{tc.phone}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Gender</p>

                      <p className="text-sm font-medium text-gray-900">{tc.gender}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Pronouns</p>

                      <p className="text-sm font-medium text-gray-900">{tc.pronouns}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Ethnicity</p>

                      <p className="text-sm font-medium text-gray-900">{tc.ethnicity}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Joined Date</p>

                      <p className="text-sm font-medium text-gray-900">{tc.joinedDate}</p>

                    </div>

                  </div>

                </div>



                {/* Professional Information */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>

                  <div className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-sm text-gray-600 mb-1">Modality</p>

                        <p className="text-sm font-medium text-gray-900">{tc.modality}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-600 mb-1">Year of Study</p>

                        <p className="text-sm font-medium text-gray-900">{tc.yearOfStudy}</p>

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Course</p>

                      <p className="text-sm font-medium text-gray-900">{tc.course}</p>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-sm text-gray-600 mb-1">Institution</p>

                        <p className="text-sm font-medium text-gray-900">{tc.institution}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-600 mb-1">Expected Graduation</p>

                        <p className="text-sm font-medium text-gray-900">{tc.expectedGraduation}</p>

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Supervisor</p>

                      <p className="text-sm font-medium text-gray-900">{tc.supervisor}</p>

                    </div>

                  </div>

                </div>



                {/* Availability Schedule */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability Schedule</h2>

                  <div className="space-y-3">

                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {

                      const daySlots = tc.availability[day];

                      const hasSlots = daySlots && daySlots.length > 0;

                      

                      return (

                        <div key={day} className={`flex items-center gap-4 p-3 rounded-lg border ${

                          hasSlots ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'

                        }`}>

                          <div className="w-28">

                            <p className={`text-sm font-medium ${hasSlots ? 'text-green-900' : 'text-gray-500'}`}>

                              {day}

                            </p>

                          </div>

                          <div className="flex-1">

                            {hasSlots ? (

                              <div className="flex flex-wrap gap-2">

                                {daySlots.map(slot => {

                                  const slotLabel = timeSlots.find(ts => ts.value === slot)?.label;

                                  return (

                                    <span key={slot} className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">

                                      {slotLabel}

                                    </span>

                                  );

                                })}

                              </div>

                            ) : (

                              <span className="text-sm text-gray-500 italic">Not available</span>

                            )}

                          </div>

                        </div>

                      );

                    })}

                  </div>

                </div>



                {/* Clinical Expertise */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Expertise</h2>

                  

                  <div className="space-y-4">

                    {/* Topics with Experience */}

                    <div>

                      <p className="text-sm font-medium text-gray-900 mb-2">✅ Topics with Experience</p>

                      <div className="flex flex-wrap gap-2">

                        {tc.topicsWithExperience.map(topic => (

                          <span key={topic} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">

                            {topic}

                          </span>

                        ))}

                      </div>

                    </div>



                    {/* Topics NOT Ready For */}

                    <div className="pt-4 border-t border-gray-200">

                      <p className="text-sm font-medium text-gray-900 mb-2">⚠️ Topics NOT Ready For</p>

                      <div className="flex flex-wrap gap-2">

                        {tc.topicsNotReadyFor.map(topic => (

                          <span key={topic} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">

                            {topic}

                          </span>

                        ))}

                      </div>

                      <p className="text-xs text-gray-600 mt-2 italic">

                        These topics will show as warnings when matching clients, but won't prevent assignment

                      </p>

                    </div>

                  </div>

                </div>



                {/* Current Clients */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-lg font-semibold text-gray-900">Current Clients ({tc.currentClients})</h2>

                  </div>

                  

                  <div className="space-y-3">

                    {tc.currentClientsList.map(client => (

                      <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

                        <div className="flex items-start justify-between mb-3">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">

                              <User className="w-5 h-5 text-purple-600" />

                            </div>

                            <div>

                              <Link href={`/dashboard/client-details?id=${client.id}`} className="font-semibold text-gray-900 hover:text-purple-600">

                                {client.name}, {client.age}

                              </Link>

                              <p className="text-xs text-gray-500">{client.id}</p>

                            </div>

                          </div>

                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">

                            {client.sessionsCompleted} sessions

                          </span>

                        </div>



                        <div className="grid grid-cols-2 gap-3 text-sm">

                          <div>

                            <p className="text-gray-600 text-xs mb-1">Start Date</p>

                            <p className="font-medium text-gray-900">{client.startDate}</p>

                          </div>

                          <div>

                            <p className="text-gray-600 text-xs mb-1">Last Session</p>

                            <p className="font-medium text-gray-900">{client.lastSession}</p>

                          </div>

                          <div>

                            <p className="text-gray-600 text-xs mb-1">Next Session</p>

                            <p className="font-medium text-gray-900">{client.nextSession}</p>

                          </div>

                          <div>

                            <p className="text-gray-600 text-xs mb-1">Primary Issues</p>

                            <div className="flex flex-wrap gap-1">

                              {client.primaryIssues.map(issue => (

                                <span key={issue} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">

                                  {issue}

                                </span>

                              ))}

                            </div>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>



                {/* Documents */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents & Verification</h2>

                  

                  <div className="space-y-3">

                    {tc.documents.map(doc => (

                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">

                            <FileCheck className="w-5 h-5 text-blue-600" />

                          </div>

                          <div>

                            <p className="font-medium text-gray-900">{doc.name}</p>

                            <p className="text-xs text-gray-600">Uploaded: {doc.uploadDate}</p>

                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          {getDocumentStatusBadge(doc.status)}

                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">

                            <Download className="w-4 h-4 text-gray-600" />

                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>



                {/* Admin Notes */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>

                  

                  <div className="space-y-4">

                    {adminNotes.map(note => (

                      <div key={note.id} className="border border-gray-200 rounded-lg p-4">

                        <div className="flex items-start justify-between mb-2">

                          <div>

                            <p className="font-medium text-gray-900">{note.author}</p>

                            <p className="text-sm text-gray-600">{note.date}</p>

                          </div>

                          <div className="flex items-center gap-2">

                            <button className="p-2 hover:bg-gray-100 rounded-lg">

                              <Edit className="w-4 h-4 text-gray-600" />

                            </button>

                            <button className="p-2 hover:bg-red-100 rounded-lg">

                              <Trash2 className="w-4 h-4 text-red-600" />

                            </button>

                          </div>

                        </div>

                        <p className="text-sm text-gray-700">{note.content}</p>

                      </div>

                    ))}

                    

                    {/* Add New Note */}

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">

                      <textarea

                        placeholder="Add a new admin note..."

                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                        rows={3}

                      ></textarea>

                      <div className="flex items-center justify-end gap-2 mt-2">

                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">

                          Cancel

                        </button>

                        <button className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm" style={{ backgroundColor: '#6f1d56' }}>

                          Add Note

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>



              {/* Right Column - 1/3 width - Performance Summary */}

              <div className="col-span-1">

                <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>

                  

                  <div className="space-y-4">

                    {/* Client Satisfaction */}

                    <div>

                      <div className="flex justify-between items-center mb-1">

                        <span className="text-sm text-gray-600">Client Satisfaction</span>

                        <span className="text-sm font-semibold text-gray-900">{tc.performance.clientSatisfaction}/5.0</span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">

                        <div 

                          className="bg-green-600 h-2 rounded-full"

                          style={{ width: `${(tc.performance.clientSatisfaction / 5) * 100}%` }}

                        ></div>

                      </div>

                    </div>



                    {/* Attendance Rate */}

                    <div>

                      <div className="flex justify-between items-center mb-1">

                        <span className="text-sm text-gray-600">Attendance Rate</span>

                        <span className="text-sm font-semibold text-gray-900">{tc.performance.sessionAttendanceRate}%</span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">

                        <div 

                          className="bg-green-600 h-2 rounded-full"

                          style={{ width: `${tc.performance.sessionAttendanceRate}%` }}

                        ></div>

                      </div>

                    </div>



                    {/* DNA Rate */}

                    <div>

                      <div className="flex justify-between items-center mb-1">

                        <span className="text-sm text-gray-600">DNA Rate</span>

                        <span className="text-sm font-semibold text-gray-900">{tc.performance.dnaRate}%</span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">

                        <div 

                          className="bg-red-600 h-2 rounded-full"

                          style={{ width: `${tc.performance.dnaRate}%` }}

                        ></div>

                      </div>

                    </div>



                    {/* Response Time */}

                    <div className="pt-4 border-t border-gray-200">

                      <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>

                      <p className="text-xl font-bold text-gray-900">{tc.performance.responseTime}</p>

                    </div>

                  </div>



                  {/* Quick Actions */}

                  <div className="mt-6 space-y-2 pt-6 border-t border-gray-200">

                    <button

                      onClick={() => setShowStatusModal(true)}

                      className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"

                    >

                      Change Status

                    </button>

                    <button

                      onClick={() => setShowAssignModal(true)}

                      className="w-full py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm"

                      style={{ backgroundColor: '#6f1d56' }}

                    >

                      Assign New Client

                    </button>

                    <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">

                      Send Message

                    </button>

                    <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">

                      Download Report

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>



      {/* Change Status Modal */}

      {showStatusModal && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowStatusModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-900">Change TC Status</h2>

                <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">

                  <X className="w-5 h-5 text-gray-600" />

                </button>

              </div>



              <div className="p-6 space-y-4">

                <p className="text-sm text-gray-700">Update status for <strong>{tc.name}</strong></p>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>

                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">

                    <option value="Active">Active</option>

                    <option value="At Capacity">At Capacity</option>

                    <option value="On Leave">On Leave</option>

                    <option value="Away">Away</option>

                    <option value="Inactive">Inactive</option>

                  </select>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>

                  <textarea

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                    rows={3}

                    placeholder="Add reason for status change..."

                  />

                </div>



                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

                  <button

                    onClick={() => setShowStatusModal(false)}

                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"

                  >

                    Cancel

                  </button>

                  <button

                    onClick={() => {

                      alert('Status updated successfully!');

                      setShowStatusModal(false);

                    }}

                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium"

                    style={{ backgroundColor: '#6f1d56' }}

                  >

                    Update Status

                  </button>

                </div>

              </div>

            </div>

          </div>

        </>

      )}



      {/* Assign Client Modal - Simple version, reuses same logic from TC list page */}

      {showAssignModal && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowAssignModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-900">Assign Client to {tc.name}</h2>

                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">

                  <X className="w-5 h-5 text-gray-600" />

                </button>

              </div>



              <div className="p-6">

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">

                  <p className="text-sm text-green-800">

                    Select a client from the pending matches list to assign to this training counsellor.

                  </p>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>

                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">

                    <option value="">Select a client...</option>

                    <option value="CL005">Charlotte Evans (30) - Anxiety, Work Stress</option>

                    <option value="CL006">Benjamin Clark (24) - Sexual Abuse, Low Self-esteem</option>

                    <option value="CL009">Thomas Wright (33) - Depression, Relationship Issues</option>

                  </select>

                </div>



                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">

                  <button

                    onClick={() => setShowAssignModal(false)}

                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"

                  >

                    Cancel

                  </button>

                  <button

                    onClick={() => {

                      alert('Client assigned successfully!');

                      setShowAssignModal(false);

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

