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

  Ban, Award, BookOpen, Briefcase

} from 'lucide-react';



export default function ViewAllTrainingCounsellorsPage() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterModality, setFilterModality] = useState('all');

  const [filterAvailability, setFilterAvailability] = useState('all');

  const [sortBy, setSortBy] = useState('availability');

  

  // Modal states

  const [selectedTC, setSelectedTC] = useState(null);

  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);

  const [showTopicsModal, setShowTopicsModal] = useState(false);

  const [topicsModalData, setTopicsModalData] = useState(null);



  // Assign client form

  const [assignForm, setAssignForm] = useState({

    clientId: '',

    notes: '',

    sendNotification: true

  });



  // Mock TC data

  const trainingCounsellors = [

    {

      id: 'TC001',

      name: 'Sarah Johnson',

      email: 'sarah.j@vanquish.com',

      phone: '+44 7700 900201',

      modality: 'CBT',

      status: 'Active',

      currentClients: 3,

      currentClientsList: [

        { name: 'Emma Wilson', age: 31, id: 'CL001' },

        { name: 'John Smith', age: 28, id: 'CL002' },

        { name: 'Michael Brown', age: 35, id: 'CL011' }

      ],

      availability: {

        Monday: ['morning-early', 'morning-late'],

        Tuesday: [],

        Wednesday: ['afternoon-early'],

        Thursday: [],

        Friday: ['morning-late']

      },

      topicsWithExperience: ['Anxiety', 'Depression', 'Work Stress', 'Relationship Issues', 'Low Self-esteem'],

      topicsNotReadyFor: ['Sexual Abuse', 'Domestic Violence', 'Suicidal Ideation'],

      lastActivity: '2 hours ago',

      joinedDate: '2024-08-15',

      course: 'Level 4 Diploma in Therapeutic Counselling',

      institution: 'CPCAB'

    },

    {

      id: 'TC002',

      name: 'David Chen',

      email: 'david.c@vanquish.com',

      phone: '+44 7700 900202',

      modality: 'Person-Centred',

      status: 'Active',

      currentClients: 4,

      currentClientsList: [

        { name: 'Robert Davies', age: 35, id: 'CL004' },

        { name: 'Sophie Taylor', age: 29, id: 'CL007' },

        { name: 'Sarah Martinez', age: 27, id: 'CL012' },

        { name: 'Charlotte Evans', age: 30, id: 'CL005' }

      ],

      availability: {

        Monday: ['afternoon-early', 'evening'],

        Tuesday: ['morning-early'],

        Wednesday: [],

        Thursday: ['afternoon-late', 'evening'],

        Friday: []

      },

      topicsWithExperience: ['Trauma', 'PTSD', 'Grief & Loss', 'Depression', 'Anxiety', 'Self-Harm'],

      topicsNotReadyFor: ['Eating Disorders', 'OCD'],

      lastActivity: '5 hours ago',

      joinedDate: '2024-06-20',

      course: 'MSc Counselling Psychology',

      institution: 'University of London'

    },

    {

      id: 'TC003',

      name: 'Priya Patel',

      email: 'priya.p@vanquish.com',

      phone: '+44 7700 900203',

      modality: 'Integrative',

      status: 'Active',

      currentClients: 2,

      currentClientsList: [

        { name: 'Hannah Lee', age: 28, id: 'CL010' },

        { name: 'Alice Cooper', age: 26, id: 'CL008' }

      ],

      availability: {

        Monday: ['morning-early', 'afternoon-early'],

        Tuesday: ['morning-late', 'afternoon-early'],

        Wednesday: ['morning-early'],

        Thursday: [],

        Friday: ['afternoon-late']

      },

      topicsWithExperience: ['Anxiety', 'Social Anxiety', 'Depression', 'Stress Management', 'Communication Problems', 'Low Confidence'],

      topicsNotReadyFor: ['Sexual Abuse', 'Domestic Violence', 'Substance Abuse', 'Suicidal Ideation', 'Self-Harm'],

      lastActivity: '1 day ago',

      joinedDate: '2024-09-10',

      course: 'Level 5 Diploma in Integrative Counselling',

      institution: 'BACP Accredited College'

    },

    {

      id: 'TC004',

      name: 'James Wilson',

      email: 'james.w@vanquish.com',

      phone: '+44 7700 900204',

      modality: 'CBT',

      status: 'At Capacity',

      currentClients: 6,

      currentClientsList: [

        { name: 'Client A', age: 29, id: 'CL013' },

        { name: 'Client B', age: 33, id: 'CL014' },

        { name: 'Client C', age: 27, id: 'CL015' },

        { name: 'Client D', age: 31, id: 'CL016' },

        { name: 'Client E', age: 25, id: 'CL017' },

        { name: 'Client F', age: 38, id: 'CL018' }

      ],

      availability: {

        Monday: ['evening'],

        Tuesday: ['afternoon-late', 'evening'],

        Wednesday: ['evening'],

        Thursday: ['evening'],

        Friday: []

      },

      topicsWithExperience: ['Anxiety', 'Depression', 'OCD', 'Phobias', 'Panic Attacks', 'Health Anxiety'],

      topicsNotReadyFor: ['Sexual Abuse', 'Domestic Violence'],

      lastActivity: '3 hours ago',

      joinedDate: '2024-03-12',

      course: 'Postgraduate Diploma in CBT',

      institution: 'Oxford Cognitive Therapy Centre'

    },

    {

      id: 'TC005',

      name: 'Emily Roberts',

      email: 'emily.r@vanquish.com',

      phone: '+44 7700 900205',

      modality: 'Person-Centred',

      status: 'On Leave',

      currentClients: 0,

      currentClientsList: [],

      availability: {

        Monday: [],

        Tuesday: [],

        Wednesday: [],

        Thursday: [],

        Friday: []

      },

      topicsWithExperience: ['Depression', 'Anxiety', 'Grief & Loss', 'Relationship Issues', 'Life Transitions'],

      topicsNotReadyFor: ['Sexual Abuse', 'Domestic Violence', 'Suicidal Ideation', 'Eating Disorders'],

      lastActivity: '2 weeks ago',

      joinedDate: '2024-07-05',

      course: 'Level 4 Counselling Skills',

      institution: 'Relate Training'

    },

    {

      id: 'TC006',

      name: 'Mohammed Ali',

      email: 'mohammed.a@vanquish.com',

      phone: '+44 7700 900206',

      modality: 'Integrative',

      status: 'Active',

      currentClients: 5,

      currentClientsList: [

        { name: 'Client G', age: 24, id: 'CL019' },

        { name: 'Client H', age: 32, id: 'CL020' },

        { name: 'Client I', age: 29, id: 'CL021' },

        { name: 'Client J', age: 36, id: 'CL022' },

        { name: 'Client K', age: 28, id: 'CL023' }

      ],

      availability: {

        Monday: ['afternoon-late'],

        Tuesday: ['morning-early', 'morning-late'],

        Wednesday: ['afternoon-early'],

        Thursday: ['morning-late'],

        Friday: ['morning-early']

      },

      topicsWithExperience: ['Cultural Identity', 'Discrimination & Racism', 'Depression', 'Anxiety', 'Family Conflicts', 'Stress Management'],

      topicsNotReadyFor: ['Sexual Abuse', 'Eating Disorders'],

      lastActivity: '4 hours ago',

      joinedDate: '2024-05-18',

      course: 'MA Counselling and Psychotherapy',

      institution: 'University of Manchester'

    }

  ];



  // Pending match clients for assign modal

  const pendingClients = [

    { id: 'CL005', name: 'Charlotte Evans', age: 30, issues: ['Anxiety', 'Work Stress'] },

    { id: 'CL006', name: 'Benjamin Clark', age: 24, issues: ['Sexual Abuse', 'Low Self-esteem'] },

    { id: 'CL009', name: 'Thomas Wright', age: 33, issues: ['Depression', 'Relationship Issues'] }

  ];



  // Filter and sort TCs

  const getFilteredTCs = () => {

    let filtered = trainingCounsellors;



    // Search

    if (searchTerm) {

      filtered = filtered.filter(tc => 

        tc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

        tc.email.toLowerCase().includes(searchTerm.toLowerCase())

      );

    }



    // Status filter

    if (filterStatus !== 'all') {

      filtered = filtered.filter(tc => tc.status === filterStatus);

    }



    // Modality filter

    if (filterModality !== 'all') {

      filtered = filtered.filter(tc => tc.modality === filterModality);

    }



    // Availability filter

    if (filterAvailability === 'has-capacity') {

      filtered = filtered.filter(tc => tc.status === 'Active' && tc.currentClients < 6);

    } else if (filterAvailability === 'full') {

      filtered = filtered.filter(tc => tc.status === 'At Capacity');

    }



    // Sort

    filtered.sort((a, b) => {

      switch(sortBy) {

        case 'availability':

          // Active with capacity first

          if (a.status === 'Active' && b.status !== 'Active') return -1;

          if (a.status !== 'Active' && b.status === 'Active') return 1;

          return a.currentClients - b.currentClients;

        case 'name':

          return a.name.localeCompare(b.name);

        case 'clients':

          return b.currentClients - a.currentClients;

        default:

          return 0;

      }

    });



    return filtered;

  };



  const filteredTCs = getFilteredTCs();



  // Stats

  const totalTCs = trainingCounsellors.length;

  const availableNow = trainingCounsellors.filter(tc => tc.status === 'Active' && tc.currentClients < 6).length;

  const atCapacity = trainingCounsellors.filter(tc => tc.status === 'At Capacity').length;

  const onLeave = trainingCounsellors.filter(tc => tc.status === 'On Leave').length;



  const getStatusBadge = (status, clientCount) => {

    if (status === 'Active') {

      return (

        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1 w-fit">

          <CheckCircle className="w-3 h-3" /> Active ({clientCount} clients)

        </span>

      );

    } else if (status === 'At Capacity') {

      return (

        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full flex items-center gap-1 w-fit">

          <AlertTriangle className="w-3 h-3" /> At Capacity ({clientCount} clients)

        </span>

      );

    } else if (status === 'On Leave') {

      return (

        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1 w-fit">

          <Clock className="w-3 h-3" /> On Leave

        </span>

      );

    }

    return (

      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">

        Inactive

      </span>

    );

  };



  const getInitialsColor = (name) => {

    const colors = [

      'bg-purple-500',

      'bg-blue-500',

      'bg-green-500',

      'bg-yellow-500',

      'bg-red-500',

      'bg-pink-500',

      'bg-indigo-500'

    ];

    const index = name.charCodeAt(0) % colors.length;

    return colors[index];

  };



  const formatAvailability = (availability) => {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const available = days.filter(day => availability[day] && availability[day].length > 0);

    if (available.length === 0) return 'No availability set';

    if (available.length === 5) return 'Mon-Fri';

    return available.map(d => d.substring(0, 3)).join(', ');

  };



  const handleOpenTopics = (topics, type) => {

    setTopicsModalData({ topics, type });

    setShowTopicsModal(true);

  };



  const handleAssignClient = (e) => {

    e.preventDefault();

    const client = pendingClients.find(c => c.id === assignForm.clientId);

    alert(`Client "${client.name}" assigned to "${selectedTC.name}"!\n\nClient will now move to "Agreement Pending" stage.`);

    setShowAssignModal(false);

    setAssignForm({ clientId: '', notes: '', sendNotification: true });

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

                <h1 className="text-2xl font-bold text-gray-900">Training Counsellors</h1>

                <p className="text-sm text-gray-600 mt-1">Manage training counsellors and their caseloads</p>

              </div>

              <Link

                href="/dashboard/training-counsellors/details"

                className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"

                style={{ backgroundColor: '#6f1d56' }}

              >

                <Plus className="w-4 h-4" />

                Add New TC

              </Link>

            </div>



            {/* Stats Cards */}

            <div className="grid grid-cols-4 gap-4">

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">

                <p className="text-sm text-blue-600 mb-1">Total TCs</p>

                <p className="text-2xl font-bold text-blue-900">{totalTCs}</p>

              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">

                <p className="text-sm text-green-600 mb-1">Available Now</p>

                <p className="text-2xl font-bold text-green-900">{availableNow}</p>

              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">

                <p className="text-sm text-orange-600 mb-1">At Capacity</p>

                <p className="text-2xl font-bold text-orange-900">{atCapacity}</p>

              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">

                <p className="text-sm text-purple-600 mb-1">On Leave</p>

                <p className="text-2xl font-bold text-purple-900">{onLeave}</p>

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

              value={filterStatus}

              onChange={(e) => setFilterStatus(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"

            >

              <option value="all">All Status</option>

              <option value="Active">Active</option>

              <option value="At Capacity">At Capacity</option>

              <option value="On Leave">On Leave</option>

              <option value="Inactive">Inactive</option>

            </select>

            <select

              value={filterModality}

              onChange={(e) => setFilterModality(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"

            >

              <option value="all">All Modalities</option>

              <option value="CBT">CBT</option>

              <option value="Person-Centred">Person-Centred</option>

              <option value="Integrative">Integrative</option>

            </select>

            <select

              value={filterAvailability}

              onChange={(e) => setFilterAvailability(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"

            >

              <option value="all">All Availability</option>

              <option value="has-capacity">Has Capacity</option>

              <option value="full">Full</option>

            </select>

            <select

              value={sortBy}

              onChange={(e) => setSortBy(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"

            >

              <option value="availability">Sort: Availability</option>

              <option value="name">Sort: Name</option>

              <option value="clients">Sort: Client Count</option>

            </select>

          </div>

        </div>



        {/* TC Cards Grid */}

        <div className="flex-1 overflow-y-auto p-6">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {filteredTCs.map(tc => (

              <div

                key={tc.id}

                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"

                onClick={() => {

                  setSelectedTC(tc);

                  setShowDetailPanel(true);

                }}

              >

                {/* Header */}

                <div className="flex items-start gap-4 mb-4">

                  <div className={`w-16 h-16 rounded-full ${getInitialsColor(tc.name)} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>

                    {tc.name.split(' ').map(n => n[0]).join('')}

                  </div>

                  <div className="flex-1 min-w-0">

                    <Link href="/dashboard/training-counsellors/details" className="text-lg font-bold text-gray-900 mb-1 hover:text-purple-600 block">{tc.name}</Link>

                    <p className="text-sm text-gray-600 mb-2">{tc.modality} Specialist</p>

                    {getStatusBadge(tc.status, tc.currentClients)}

                  </div>

                </div>



                {/* Availability */}

                <div className="mb-4 pb-4 border-b border-gray-200">

                  <div className="flex items-center gap-2 text-sm text-gray-700">

                    <Calendar className="w-4 h-4 text-gray-500" />

                    <span className="font-medium">Available:</span>

                    <span>{formatAvailability(tc.availability)}</span>

                  </div>

                </div>



                {/* Topics With Experience */}

                <div className="mb-4">

                  <p className="text-xs font-medium text-gray-600 mb-2">✅ Experience with:</p>

                  <div className="flex flex-wrap gap-2">

                    {tc.topicsWithExperience.slice(0, 4).map(topic => (

                      <span key={topic} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">

                        {topic}

                      </span>

                    ))}

                    {tc.topicsWithExperience.length > 4 && (

                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">

                        +{tc.topicsWithExperience.length - 4} more

                      </span>

                    )}

                  </div>

                </div>



                {/* Topics NOT Ready For */}

                <div className="mb-4 pb-4 border-b border-gray-200">

                  <button

                    onClick={(e) => {

                      e.stopPropagation();

                      handleOpenTopics(tc.topicsNotReadyFor, 'NOT Ready For');

                    }}

                    className="flex items-center gap-2 text-sm hover:bg-red-50 px-2 py-1 rounded transition-colors"

                  >

                    <AlertTriangle className="w-4 h-4 text-red-600" />

                    <span className="font-medium text-red-900">

                      ⚠️ {tc.topicsNotReadyFor.length} topics NOT ready for

                    </span>

                    <ChevronRight className="w-4 h-4 text-red-600" />

                  </button>

                </div>



                {/* Current Clients */}

                <div className="mb-4">

                  <p className="text-xs font-medium text-gray-600 mb-2">👥 Current Clients:</p>

                  {tc.currentClients === 0 ? (

                    <p className="text-sm text-gray-500 italic">No clients assigned</p>

                  ) : (

                    <div className="flex flex-wrap gap-2">

                      {tc.currentClientsList.map(client => (

                        <span key={client.id} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">

                          {client.name}, {client.age}

                        </span>

                      ))}

                    </div>

                  )}

                </div>



                {/* Actions */}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">

                  <Link

                    href="/dashboard/training-counsellors/details"

                    onClick={(e) => {

                      e.stopPropagation();

                    }}

                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center justify-center gap-2"

                  >

                    <Eye className="w-4 h-4" />

                    View Profile

                  </Link>

                  {tc.status === 'Active' && (

                    <button

                      onClick={(e) => {

                        e.stopPropagation();

                        setSelectedTC(tc);

                        setShowAssignModal(true);

                      }}

                      className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm flex items-center justify-center gap-2"

                      style={{ backgroundColor: '#6f1d56' }}

                    >

                      <UserCheck className="w-4 h-4" />

                      Assign Client

                    </button>

                  )}

                  <button

                    onClick={(e) => {

                      e.stopPropagation();

                      window.location.href = `mailto:${tc.email}`;

                    }}

                    className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"

                    title="Send Email"

                  >

                    <Mail className="w-4 h-4" />

                  </button>

                </div>

              </div>

            ))}

          </div>



          {filteredTCs.length === 0 && (

            <div className="text-center py-12">

              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Training Counsellors Found</h3>

              <p className="text-gray-600">Try adjusting your filters</p>

            </div>

          )}

        </div>

      </div>



      {/* Topics Modal */}

      {showTopicsModal && topicsModalData && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowTopicsModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-900">Topics {topicsModalData.type}</h2>

                <button onClick={() => setShowTopicsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">

                  <X className="w-5 h-5 text-gray-600" />

                </button>

              </div>



              <div className="p-6">

                <div className="flex flex-wrap gap-2">

                  {topicsModalData.topics.map(topic => (

                    <span key={topic} className="px-3 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg border border-red-200">

                      {topic}

                    </span>

                  ))}

                </div>

              </div>



              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">

                <button

                  onClick={() => setShowTopicsModal(false)}

                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        </>

      )}



      {/* Assign Client Modal */}

      {showAssignModal && selectedTC && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowAssignModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">Assign Client</h2>

                  <p className="text-sm text-gray-600 mt-1">Assign a client to {selectedTC.name}</p>

                </div>

                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">

                  <X className="w-5 h-5 text-gray-600" />

                </button>

              </div>



              <form onSubmit={handleAssignClient} className="p-6 space-y-4">

                {/* TC Info */}

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">

                  <div className="flex items-center gap-3">

                    <div className={`w-12 h-12 rounded-full ${getInitialsColor(selectedTC.name)} flex items-center justify-center text-white text-lg font-bold`}>

                      {selectedTC.name.split(' ').map(n => n[0]).join('')}

                    </div>

                    <div>

                      <p className="font-semibold text-purple-900">{selectedTC.name}</p>

                      <p className="text-sm text-purple-700">{selectedTC.modality} • {selectedTC.currentClients} current clients</p>

                    </div>

                  </div>

                </div>



                {/* Select Client */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Select Client from Pending Matches <span className="text-red-500">*</span>

                  </label>

                  <select

                    value={assignForm.clientId}

                    onChange={(e) => setAssignForm({...assignForm, clientId: e.target.value})}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                    required

                  >

                    <option value="">Select a client...</option>

                    {pendingClients.map(client => (

                      <option key={client.id} value={client.id}>

                        {client.name} ({client.age}) - {client.issues.join(', ')}

                      </option>

                    ))}

                  </select>

                </div>



                {/* Notes */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Assignment Notes (Optional)

                  </label>

                  <textarea

                    value={assignForm.notes}

                    onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                    rows={3}

                    placeholder="Add any notes about this assignment..."

                  />

                </div>



                {/* Send Notification */}

                <div className="flex items-center gap-2">

                  <input

                    type="checkbox"

                    id="sendNotification"

                    checked={assignForm.sendNotification}

                    onChange={(e) => setAssignForm({...assignForm, sendNotification: e.target.checked})}

                    className="w-4 h-4 text-purple-600 border-gray-300 rounded"

                  />

                  <label htmlFor="sendNotification" className="text-sm text-gray-700">

                    Send notification emails to client and TC

                  </label>

                </div>



                {/* Info Box */}

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">

                  <div className="flex items-start gap-3">

                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />

                    <div>

                      <p className="text-sm font-medium text-green-900 mb-1">After Assignment</p>

                      <p className="text-sm text-green-800">

                        Client will move to "Agreement Pending" stage and receive an agreement form to sign before starting therapy.

                      </p>

                    </div>

                  </div>

                </div>



                {/* Actions */}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

                  <button

                    type="button"

                    onClick={() => setShowAssignModal(false)}

                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"

                    style={{ backgroundColor: '#6f1d56' }}

                  >

                    <UserCheck className="w-5 h-5" />

                    Assign Client

                  </button>

                </div>

              </form>

            </div>

          </div>

        </>

      )}

    </div>

  );

}
