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

  Save, ChevronUp, List, CalendarDays, RefreshCw,

  Ban, DollarSign, Repeat

} from 'lucide-react';



export default function ConsultationsManagementPageFixed() {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const [activeTab, setActiveTab] = useState('today');

  const [searchTerm, setSearchTerm] = useState('');

  

  // Modal states

  const [showBookModal, setShowBookModal] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [selectedConsultation, setSelectedConsultation] = useState(null);



  // Forms

  const [bookForm, setBookForm] = useState({

    clientId: '',

    date: '',

    time: '',

    notes: '',

    sendConfirmation: true

  });



  const [completeForm, setCompleteForm] = useState({

    duration: '45',

    notes: '',

    outcome: 'approved',

    recommendedService: 'Low Cost Counselling',

    recommendedModality: 'CBT',

    riskNotes: '',

    nextSteps: ''

  });



  // Mock consultations data

  const consultations = [

    {

      id: 'CONS001',

      clientId: 'CL003',

      clientName: 'Victoria James',

      clientAge: 29,

      date: '2025-11-07',

      time: '10:00 AM',

      status: 'Booked',

      serviceRequested: 'Low Cost Counselling',

      paymentStatus: 'Paid',

      paymentAmount: 13,

      conductedBy: 'Isha',

      bookedAt: '2025-11-05 2:30 PM',

      notes: ''

    },

    {

      id: 'CONS002',

      clientId: 'CL004',

      clientName: 'Robert Davies',

      clientAge: 35,

      date: '2025-11-07',

      time: '2:00 PM',

      status: 'Booked',

      serviceRequested: 'Mid Range Counselling',

      paymentStatus: 'Paid',

      paymentAmount: 13,

      conductedBy: 'Isha',

      bookedAt: '2025-11-04 4:15 PM',

      notes: ''

    },

    {

      id: 'CONS003',

      clientId: 'CL009',

      clientName: 'Thomas Wright',

      clientAge: 33,

      date: '2025-11-08',

      time: '11:00 AM',

      status: 'Booked',

      serviceRequested: 'Mid Range Counselling',

      paymentStatus: 'Paid',

      paymentAmount: 13,

      conductedBy: 'Isha',

      bookedAt: '2025-11-06 9:00 AM',

      notes: ''

    },

    {

      id: 'CONS004',

      clientId: 'CL001',

      clientName: 'Emma Wilson',

      clientAge: 31,

      date: '2025-10-20',

      time: '2:00 PM',

      status: 'Completed',

      serviceRequested: 'Low Cost Counselling',

      paymentStatus: 'Paid',

      paymentAmount: 13,

      conductedBy: 'Isha',

      completedAt: '2025-10-20 3:00 PM',

      duration: '45 min',

      outcome: 'Approved for Therapy',

      recommendedService: 'Low Cost Counselling - CBT focus',

      notes: 'Client presented with work-related stress and anxiety. Recently promoted and experiencing imposter syndrome. Good insight into issues. Motivated for therapy.'

    },

    {

      id: 'CONS005',

      clientId: 'CL010',

      clientName: 'Hannah Lee',

      clientAge: 28,

      date: '2025-10-18',

      time: '10:30 AM',

      status: 'Completed',

      serviceRequested: 'Low Cost Counselling',

      paymentStatus: 'Paid',

      paymentAmount: 13,

      conductedBy: 'Isha',

      completedAt: '2025-10-18 11:30 AM',

      duration: '60 min',

      outcome: 'Approved for Therapy',

      recommendedService: 'Low Cost Counselling',

      notes: 'Client experiencing social anxiety. Good candidate for therapy.'

    },

    {

      id: 'CONS006',

      clientId: 'CL011',

      clientName: 'Michael Brown',

      clientAge: 35,

      date: '2025-10-25',

      time: '3:00 PM',

      status: 'No Show',

      serviceRequested: 'Mid Range Counselling',

      paymentStatus: 'Paid',

      paymentAmount: 13,

      conductedBy: 'Isha',

      notes: 'Client did not attend. Follow-up email sent.'

    }

  ];



  // Filter consultations

  const getFilteredConsultations = () => {

    const today = '2025-11-07';

    let filtered = consultations;



    if (searchTerm) {

      filtered = filtered.filter(c => 

        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||

        c.clientId.toLowerCase().includes(searchTerm.toLowerCase())

      );

    }



    switch(activeTab) {

      case 'today':

        filtered = filtered.filter(c => c.date === today && c.status === 'Booked');

        break;

      case 'upcoming':

        filtered = filtered.filter(c => c.status === 'Booked');

        break;

      case 'completed':

        filtered = filtered.filter(c => c.status === 'Completed');

        break;

      default:

        break;

    }



    return filtered;

  };



  const filteredConsultations = getFilteredConsultations();



  // Stats

  const todayCount = consultations.filter(c => c.date === '2025-11-07' && c.status === 'Booked').length;

  const thisWeekCount = consultations.filter(c => c.status === 'Booked').length;

  const completedThisMonth = consultations.filter(c => c.status === 'Completed').length;

  const pendingPayment = consultations.filter(c => c.paymentStatus === 'Pending').length;



  const getStatusBadge = (status) => {

    const badges = {

      'Booked': <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1 w-fit">

        <Calendar className="w-3 h-3" /> Booked

      </span>,

      'Completed': <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1 w-fit">

        <CheckCircle className="w-3 h-3" /> Completed

      </span>,

      'Cancelled': <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1 w-fit">

        <Ban className="w-3 h-3" /> Cancelled

      </span>,

      'No Show': <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1 w-fit">

        <XCircle className="w-3 h-3" /> No Show

      </span>

    };

    return badges[status] || null;

  };



  const getPaymentBadge = (status) => {

    if (status === 'Paid') {

      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Paid</span>;

    } else if (status === 'Pending') {

      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>;

    }

    return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Waived</span>;

  };



  const handleOpenComplete = (consultation) => {

    setSelectedConsultation(consultation);

    setCompleteForm({

      duration: '45',

      notes: '',

      outcome: 'approved',

      recommendedService: 'Low Cost Counselling',

      recommendedModality: 'CBT',

      riskNotes: '',

      nextSteps: ''

    });

    setShowCompleteModal(true);

  };



  const handleCompleteSubmit = (e) => {

    e.preventDefault();

    alert(`Consultation marked as completed!\n\nClient "${selectedConsultation.clientName}" has been moved to "Pending Match" stage.\n\nGo to Pending Matches to assign a Training Counsellor.`);

    setShowCompleteModal(false);

  };



  const handleBookSubmit = (e) => {

    e.preventDefault();

    alert('Consultation booked successfully!');

    setShowBookModal(false);

  };



  // Simple Calendar Component

  const CalendarViewComponent = () => {

    const daysInMonth = 30;

    const firstDay = 5;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    

    const getConsultationsForDay = (day) => {

      const dateStr = `2025-11-${String(day).padStart(2, '0')}`;

      return consultations.filter(c => c.date === dateStr);

    };



    return (

      <div className="bg-white rounded-lg border border-gray-200 p-6">

        <div className="flex items-center justify-between mb-6">

          <h3 className="text-xl font-bold text-gray-900">November 2025</h3>

          <div className="flex items-center gap-2">

            <button className="p-2 hover:bg-gray-100 rounded-lg">

              <ChevronLeft className="w-5 h-5 text-gray-600" />

            </button>

            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">

              Today

            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg">

              <ChevronRight className="w-5 h-5 text-gray-600" />

            </button>

          </div>

        </div>



        <div className="grid grid-cols-7 gap-2">

          {days.map(day => (

            <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">

              {day}

            </div>

          ))}



          {[...Array(firstDay)].map((_, i) => (

            <div key={`empty-${i}`} className="aspect-square"></div>

          ))}



          {[...Array(daysInMonth)].map((_, i) => {

            const day = i + 1;

            const dayConsultations = getConsultationsForDay(day);

            const isToday = day === 7;



            return (

              <div

                key={day}

                className={`aspect-square border rounded-lg p-2 hover:bg-gray-50 transition-colors ${

                  isToday ? 'border-purple-600 bg-purple-50' : 'border-gray-200'

                }`}

              >

                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-purple-900' : 'text-gray-900'}`}>

                  {day}

                </div>

                <div className="space-y-1">

                  {dayConsultations.map(consultation => (

                    <div

                      key={consultation.id}

                      className={`text-xs px-1 py-0.5 rounded truncate ${

                        consultation.status === 'Booked'

                          ? 'bg-blue-100 text-blue-800'

                          : consultation.status === 'Completed'

                          ? 'bg-green-100 text-green-800'

                          : 'bg-red-100 text-red-800'

                      }`}

                      title={`${consultation.time} - ${consultation.clientName}`}

                    >

                      {consultation.time.split(' ')[0]}

                    </div>

                  ))}

                </div>

              </div>

            );

          })}

        </div>



        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 rounded bg-blue-100"></div>

            <span className="text-sm text-gray-700">Booked</span>

          </div>

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 rounded bg-green-100"></div>

            <span className="text-sm text-gray-700">Completed</span>

          </div>

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 rounded bg-red-100"></div>

            <span className="text-sm text-gray-700">No Show</span>

          </div>

        </div>

      </div>

    );

  };



  // List View Component

  const ListViewComponent = () => (

    <div className="space-y-4">

      {filteredConsultations.length === 0 ? (

        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">

          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />

          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Consultations Found</h3>

          <p className="text-gray-600 mb-4">There are no consultations matching your current filters.</p>

          <button

            onClick={() => setShowBookModal(true)}

            className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium"

            style={{ backgroundColor: '#6f1d56' }}

          >

            Book New Consultation

          </button>

        </div>

      ) : (

        filteredConsultations.map(consultation => (

          <div key={consultation.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">

            <div className="flex items-start justify-between">

              <div className="flex items-start gap-4 flex-1">

                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">

                  {consultation.clientName.split(' ').map(n => n[0]).join('')}

                </div>

                

                <div className="flex-1">

                  <div className="flex items-center gap-3 mb-2">

                    <Link href="/dashboard/client-details" className="text-lg font-semibold text-gray-900 hover:text-purple-600">

                      {consultation.clientName}

                    </Link>

                    <span className="text-gray-600">•</span>

                    <span className="text-sm text-gray-600">{consultation.clientAge} years old</span>

                    <span className="text-gray-600">•</span>

                    <span className="text-xs text-gray-500">{consultation.clientId}</span>

                  </div>



                  <div className="flex items-center gap-4 mb-3">

                    {getStatusBadge(consultation.status)}

                    {getPaymentBadge(consultation.paymentStatus)}

                  </div>



                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">

                    <div className="flex items-center gap-2">

                      <Calendar className="w-4 h-4 text-gray-500" />

                      <span className="text-gray-700">{consultation.date} at {consultation.time}</span>

                    </div>

                    <div className="flex items-center gap-2">

                      <User className="w-4 h-4 text-gray-500" />

                      <span className="text-gray-700">Conducted by: {consultation.conductedBy}</span>

                    </div>

                    <div className="flex items-center gap-2">

                      <Package className="w-4 h-4 text-gray-500" />

                      <span className="text-gray-700">{consultation.serviceRequested}</span>

                    </div>

                    <div className="flex items-center gap-2">

                      <CreditCard className="w-4 h-4 text-gray-500" />

                      <span className="text-gray-700">£{consultation.paymentAmount} - {consultation.paymentStatus}</span>

                    </div>

                  </div>



                  {consultation.status === 'Completed' && consultation.outcome && (

                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">

                      <p className="text-sm font-medium text-green-900 mb-1">Outcome: {consultation.outcome}</p>

                      <p className="text-sm text-green-800">Recommended: {consultation.recommendedService}</p>

                    </div>

                  )}



                  {consultation.notes && (

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">

                      <p className="text-sm text-gray-700">{consultation.notes}</p>

                    </div>

                  )}

                </div>

              </div>



              <div className="flex items-center gap-2 ml-4">

                {consultation.status === 'Booked' && (

                  <>

                    <button

                      onClick={() => handleOpenComplete(consultation)}

                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2"

                    >

                      <CheckCircle className="w-4 h-4" />

                      Mark Complete

                    </button>

                    <button

                      onClick={() => {

                        setSelectedConsultation(consultation);

                        setShowRescheduleModal(true);

                      }}

                      className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"

                      title="Reschedule"

                    >

                      <RefreshCw className="w-4 h-4" />

                    </button>

                    <button

                      onClick={() => {

                        setSelectedConsultation(consultation);

                        setShowCancelModal(true);

                      }}

                      className="p-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"

                      title="Cancel"

                    >

                      <Ban className="w-4 h-4" />

                    </button>

                  </>

                )}

                

                <Link

                  href="/dashboard/client-details"

                  className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"

                  title="View Client Profile"

                >

                  <Eye className="w-4 h-4" />

                </Link>

              </div>

            </div>

          </div>

        ))

      )}

    </div>

  );



  return (

    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}

      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>

        <div className="p-4 border-b border-gray-200">

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



        <nav className="flex-1 p-4 space-y-2">

          {[

            { id: 'overview', icon: Home, label: 'Overview', href: '/dashboard' },

            { id: 'consultations', icon: Video, label: 'Consultations', badge: todayCount, href: '/dashboard/consultations' },

            { id: 'matches', icon: UserCheck, label: 'Pending Matches', badge: 8, href: '/dashboard/pending-matches' },

            { id: 'tcs', icon: Users, label: 'Training Counsellors', href: '/dashboard/training-counsellors' },

            { id: 'clients', icon: ClipboardList, label: 'All Clients', href: '/dashboard/clients' },

            { id: 'activity', icon: Activity, label: 'Activity Log', href: '/dashboard/activity-log' }

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

          <div className="px-6 py-4">

            <div className="flex items-center justify-between mb-4">

              <div>

                <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>

                <p className="text-sm text-gray-600 mt-1">Manage initial client consultations with Isha</p>

              </div>

              <button

                onClick={() => setShowBookModal(true)}

                className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"

                style={{ backgroundColor: '#6f1d56' }}

              >

                <Plus className="w-4 h-4" />

                Book Consultation

              </button>

            </div>



            {/* Stats Cards */}

            <div className="grid grid-cols-4 gap-4">

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">

                <p className="text-sm text-blue-600 mb-1">Today's Consultations</p>

                <p className="text-2xl font-bold text-blue-900">{todayCount}</p>

              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">

                <p className="text-sm text-purple-600 mb-1">This Week</p>

                <p className="text-2xl font-bold text-purple-900">{thisWeekCount}</p>

              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">

                <p className="text-sm text-green-600 mb-1">Completed This Month</p>

                <p className="text-2xl font-bold text-green-900">{completedThisMonth}</p>

              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">

                <p className="text-sm text-orange-600 mb-1">Pending Payment</p>

                <p className="text-2xl font-bold text-orange-900">{pendingPayment}</p>

              </div>

            </div>

          </div>

        </div>



        {/* Filters & View Toggle */}

        <div className="bg-white border-b border-gray-200 px-6 py-4">

          <div className="flex items-center justify-between mb-4">

            <div className="flex-1 max-w-md relative">

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input

                type="text"

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}

                placeholder="Search by client name or ID..."

                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

              />

            </div>



            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">

              <button

                onClick={() => setViewMode('list')}

                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${

                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'

                }`}

              >

                <List className="w-4 h-4" />

                List

              </button>

              <button

                onClick={() => setViewMode('calendar')}

                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${

                  viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'

                }`}

              >

                <CalendarDays className="w-4 h-4" />

                Calendar

              </button>

            </div>

          </div>



          {viewMode === 'list' && (

            <div className="flex items-center gap-2">

              {[

                { id: 'today', label: 'Today', count: todayCount },

                { id: 'upcoming', label: 'Upcoming', count: thisWeekCount },

                { id: 'completed', label: 'Completed', count: completedThisMonth },

                { id: 'all', label: 'All', count: consultations.length }

              ].map(tab => (

                <button

                  key={tab.id}

                  onClick={() => setActiveTab(tab.id)}

                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${

                    activeTab === tab.id ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-100'

                  }`}

                >

                  {tab.label}

                  {tab.count > 0 && (

                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${

                      activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'

                    }`}>

                      {tab.count}

                    </span>

                  )}

                </button>

              ))}

            </div>

          )}

        </div>



        {/* Content */}

        <div className="flex-1 overflow-y-auto p-6">

          {viewMode === 'list' ? <ListViewComponent /> : <CalendarViewComponent />}

        </div>

      </div>



      {/* Book Modal */}

      {showBookModal && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowBookModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-900">Book New Consultation</h2>

                <button onClick={() => setShowBookModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">

                  <X className="w-5 h-5 text-gray-600" />

                </button>

              </div>



              <form onSubmit={handleBookSubmit} className="p-6 space-y-4">

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">

                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

                  <div>

                    <p className="text-sm font-medium text-yellow-900 mb-1">Payment Required</p>

                    <p className="text-sm text-yellow-800">

                      Client must have paid the £13 consultation fee before booking.

                    </p>

                  </div>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Select Client <span className="text-red-500">*</span>

                  </label>

                  <select

                    value={bookForm.clientId}

                    onChange={(e) => setBookForm({...bookForm, clientId: e.target.value})}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                    required

                  >

                    <option value="">Select a client...</option>

                    <option value="CL005">Charlotte Evans - CL005</option>

                    <option value="CL006">Benjamin Clark - CL006</option>

                    <option value="CL009">Thomas Wright - CL009</option>

                  </select>

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Date <span className="text-red-500">*</span>

                    </label>

                    <input

                      type="date"

                      value={bookForm.date}

                      onChange={(e) => setBookForm({...bookForm, date: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      required

                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Time <span className="text-red-500">*</span>

                    </label>

                    <select

                      value={bookForm.time}

                      onChange={(e) => setBookForm({...bookForm, time: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      required

                    >

                      <option value="">Select time...</option>

                      <option value="09:00 AM">09:00 AM</option>

                      <option value="10:00 AM">10:00 AM</option>

                      <option value="11:00 AM">11:00 AM</option>

                      <option value="02:00 PM">02:00 PM</option>

                      <option value="03:00 PM">03:00 PM</option>

                    </select>

                  </div>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Conducted By</label>

                  <input type="text" value="Isha" disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>

                  <textarea

                    value={bookForm.notes}

                    onChange={(e) => setBookForm({...bookForm, notes: e.target.value})}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                    rows={3}

                  />

                </div>



                <div className="flex items-center gap-2">

                  <input

                    type="checkbox"

                    id="sendConfirmation"

                    checked={bookForm.sendConfirmation}

                    onChange={(e) => setBookForm({...bookForm, sendConfirmation: e.target.checked})}

                    className="w-4 h-4 text-purple-600 border-gray-300 rounded"

                  />

                  <label htmlFor="sendConfirmation" className="text-sm text-gray-700">

                    Send confirmation email to client

                  </label>

                </div>



                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

                  <button type="button" onClick={() => setShowBookModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">

                    Cancel

                  </button>

                  <button type="submit" className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium" style={{ backgroundColor: '#6f1d56' }}>

                    Book Consultation

                  </button>

                </div>

              </form>

            </div>

          </div>

        </>

      )}



      {/* Complete Modal */}

      {showCompleteModal && selectedConsultation && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCompleteModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">Mark Consultation as Completed</h2>

                    <p className="text-sm text-gray-600 mt-1">{selectedConsultation.clientName} - {selectedConsultation.date} {selectedConsultation.time}</p>

                  </div>

                  <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">

                    <X className="w-5 h-5 text-gray-600" />

                  </button>

                </div>

              </div>



              <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration <span className="text-red-500">*</span></label>

                    <select

                      value={completeForm.duration}

                      onChange={(e) => setCompleteForm({...completeForm, duration: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      required

                    >

                      <option value="30">30 minutes</option>

                      <option value="45">45 minutes</option>

                      <option value="60">60 minutes</option>

                    </select>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">Outcome <span className="text-red-500">*</span></label>

                    <select

                      value={completeForm.outcome}

                      onChange={(e) => setCompleteForm({...completeForm, outcome: e.target.value})}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      required

                    >

                      <option value="approved">Approved for Therapy</option>

                      <option value="waitlist">Waitlist</option>

                      <option value="not-suitable">Not Suitable</option>

                      <option value="follow-up">Requires Follow-up</option>

                    </select>

                  </div>

                </div>



                {completeForm.outcome === 'approved' && (

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Service</label>

                      <select

                        value={completeForm.recommendedService}

                        onChange={(e) => setCompleteForm({...completeForm, recommendedService: e.target.value})}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      >

                        <option value="Low Cost Counselling">Low Cost Counselling</option>

                        <option value="Mid Range Counselling">Mid Range Counselling</option>

                      </select>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Modality</label>

                      <select

                        value={completeForm.recommendedModality}

                        onChange={(e) => setCompleteForm({...completeForm, recommendedModality: e.target.value})}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      >

                        <option value="CBT">CBT</option>

                        <option value="Person-Centred">Person-Centred</option>

                        <option value="Integrative">Integrative</option>

                      </select>

                    </div>

                  </div>

                )}



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Notes <span className="text-red-500">*</span></label>

                  <textarea

                    value={completeForm.notes}

                    onChange={(e) => setCompleteForm({...completeForm, notes: e.target.value})}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                    rows={5}

                    placeholder="Detailed notes about the consultation..."

                    required

                  />

                </div>



                {completeForm.outcome === 'approved' && (

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">

                    <div className="flex items-start gap-3">

                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />

                      <div>

                        <p className="text-sm font-medium text-green-900 mb-1">Client Will Move to Pending Match</p>

                        <p className="text-sm text-green-800">

                          Once saved, this client will automatically move to the "Pending Match" stage.

                        </p>

                      </div>

                    </div>

                  </div>

                )}



                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

                  <button type="button" onClick={() => setShowCompleteModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">

                    Cancel

                  </button>

                  <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">

                    <Save className="w-5 h-5" />

                    Save & Complete

                  </button>

                </div>

              </form>

            </div>

          </div>

        </>

      )}



      {/* Reschedule Modal */}

      {showRescheduleModal && selectedConsultation && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowRescheduleModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-900">Reschedule Consultation</h2>

                <button onClick={() => setShowRescheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">

                  <X className="w-5 h-5 text-gray-600" />

                </button>

              </div>



              <div className="p-6 space-y-4">

                <p className="text-sm text-gray-700">Reschedule for <strong>{selectedConsultation.clientName}</strong></p>

                

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>

                  <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>

                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">

                    <option value="">Select time...</option>

                    <option value="09:00 AM">09:00 AM</option>

                    <option value="10:00 AM">10:00 AM</option>

                  </select>

                </div>



                <div className="flex items-center gap-2">

                  <input type="checkbox" id="notify" className="w-4 h-4 text-purple-600 border-gray-300 rounded" defaultChecked />

                  <label htmlFor="notify" className="text-sm text-gray-700">Send notification to client</label>

                </div>



                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

                  <button onClick={() => setShowRescheduleModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">

                    Cancel

                  </button>

                  <button

                    onClick={() => {

                      alert('Consultation rescheduled!');

                      setShowRescheduleModal(false);

                    }}

                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium"

                    style={{ backgroundColor: '#6f1d56' }}

                  >

                    Reschedule

                  </button>

                </div>

              </div>

            </div>

          </div>

        </>

      )}



      {/* Cancel Modal */}

      {showCancelModal && selectedConsultation && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCancelModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">

              <div className="px-6 py-4 border-b border-gray-200">

                <h2 className="text-xl font-bold text-gray-900">Cancel Consultation</h2>

              </div>



              <div className="p-6">

                <p className="text-gray-700 mb-4">

                  Cancel consultation for <strong>{selectedConsultation.clientName}</strong> on {selectedConsultation.date}?

                </p>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>

                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none" rows={3} />

                </div>



                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">

                  <button onClick={() => setShowCancelModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">

                    Keep Consultation

                  </button>

                  <button

                    onClick={() => {

                      alert('Consultation cancelled!');

                      setShowCancelModal(false);

                    }}

                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"

                  >

                    Cancel Consultation

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

