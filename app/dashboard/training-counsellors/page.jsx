"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import apiService from '@/lib/api';
import { formatName, getCounsellorPrefixType } from '@/lib/nameFormatter';
import DashboardLayout from '@/components/DashboardLayout';

import { 

  Users, Search, Filter, ChevronDown, MoreVertical, Eye,

  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,

  CheckCircle, Clock, AlertTriangle, Video, FileText,

  UserCheck, Activity, ChevronRight, MapPin, User, 

  Download, Send, Archive, Plus, ChevronLeft,

  CreditCard, Package, AlertCircle, Check, XCircle,

  Save, ChevronUp, List, CalendarDays, RefreshCw,

  Ban, Award, BookOpen, Briefcase, Building2

} from 'lucide-react';



export default function ViewAllTrainingCounsellorsPage() {
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState('');

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterService, setFilterService] = useState('all');

  const [filterModality, setFilterModality] = useState('all');

  const [filterAvailability, setFilterAvailability] = useState('all');

  const [sortBy, setSortBy] = useState('availability');

  // Data states
  const [trainingCounsellors, setTrainingCounsellors] = useState([]);
  const [pendingClients, setPendingClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

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

  // Fetch training counsellors from API
  const fetchTrainingCounsellors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterModality !== 'all') params.modality = filterModality;
      
      const data = await apiService.getTrainingCounsellors(params);
      
      // Transform API data to match frontend structure
      const transformedData = data.map(tc => ({
        id: tc.uuid || tc.id, // Use UUID for routing, fallback to id for backward compatibility
        uuid: tc.uuid || tc.id,
        tc_id: tc.tc_id,
        name: tc.name,
        email: tc.email,
        phone: tc.phone,
        modality: tc.modality,
        status: tc.status,
        counsellor_type: tc.counsellor_type || 'Trainee',
        currentClients: tc.current_clients || 0,
        currentClientsList: tc.clients ? tc.clients.map(c => ({
          name: c.name,
          age: c.age || null,
          id: c.uuid || c.id // Use UUID for routing
        })) : [],
        availability: tc.availability || {},
        topicsWithExperience: tc.topics_with_experience || [],
        topicsNotReadyFor: tc.topics_not_ready_for || [],
        course: tc.course,
        institution: tc.institution,
        joinedDate: tc.joined_date,
        lastActivity: tc.last_activity ? new Date(tc.last_activity) : null,
        qualified_form_completed: tc.qualified_form_completed || false,
      }));
      
      setTrainingCounsellors(transformedData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching practitioners:', err);
      setError('Failed to load practitioners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending clients for assignment dropdown
  const fetchPendingClients = async () => {
    try {
      const data = await apiService.getPendingMatches();
      // Transform API data for dropdown
      const transformedData = data.map(client => ({
        id: client.uuid || client.id,
        name: client.name,
        age: client.age || null,
        issues: client.primary_issues || []
      }));
      setPendingClients(transformedData);
    } catch (err) {
      console.error('Error fetching pending clients:', err);
      // Don't set error state here as it's not critical for the main page
    }
  };

  // Initial fetch and refresh on filter changes
  useEffect(() => {
    fetchTrainingCounsellors();
    fetchPendingClients();
  }, [searchTerm, filterStatus, filterService, filterModality]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrainingCounsellors();
      fetchPendingClients();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [searchTerm, filterStatus, filterService, filterModality]);

  // Filter and sort TCs
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

    // Service filter
    if (filterService !== 'all') {
      filtered = filtered.filter(tc => {
        if (filterService === 'Qualified Counsellor') {
          return tc.counsellor_type === 'Qualified';
        } else if (filterService === 'Coach') {
          return tc.counsellor_type === 'Coach';
        } else if (filterService === 'Trainee Counsellor') {
          return tc.counsellor_type === 'Trainee';
        } else if (filterService === 'Trainee Coach') {
          return tc.counsellor_type === 'Trainee Coach';
        }
        return true;
      });
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

  // Format last activity
  const formatLastActivity = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };



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



  const handleAssignClient = async (e) => {
    e.preventDefault();

    if (!assignForm.clientId || !selectedTC) {
      alert('Please select a client to assign.');
      return;
    }

    try {
      const client = pendingClients.find(c => c.id === assignForm.clientId);
      
      await apiService.assignMatch({
        client_id: assignForm.clientId,
        tc_id: selectedTC.uuid || selectedTC.id,
        assignment_notes: assignForm.notes || null,
        send_notification: assignForm.sendNotification,
      });

      alert(`Client "${formatName(client.name, 'client')}" assigned to "${formatName(selectedTC.name, getCounsellorPrefixType(selectedTC.counsellor_type))}"!\n\nClient will now move to "Agreement Pending" stage.`);
      
      setShowAssignModal(false);
      setAssignForm({ clientId: '', notes: '', sendNotification: true });
      
      // Refresh data
      fetchTrainingCounsellors();
      fetchPendingClients();
    } catch (err) {
      console.error('Error assigning client:', err);
      alert(`Failed to assign client: ${err.message || 'Please try again.'}`);
    }
  };



  return (
    <DashboardLayout>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* Header */}

        <div className="bg-white border-b border-gray-200 flex-shrink-0">

          <div className="px-6 py-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

              <div>

                <h1 className="text-2xl font-bold text-gray-900">Practitioners</h1>

                <p className="text-sm text-gray-600 mt-1">Managing practitioners and their caseloads</p>

              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchTrainingCounsellors}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <Link

                  href="/dashboard/training-counsellors"

                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 whitespace-nowrap"

                  style={{ backgroundColor: '#6f1d56' }}

                >

                  <Plus className="w-4 h-4" />

                  <span className="hidden sm:inline">Add New TC</span>
                  <span className="sm:hidden">Add</span>

                </Link>
              </div>

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

        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 overflow-x-hidden">

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

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 min-w-[120px] flex-shrink-0"

            >

              <option value="all">All Status</option>

              <option value="Active">Active</option>

              <option value="At Capacity">At Capacity</option>

              <option value="On Leave">On Leave</option>

              <option value="Inactive">Inactive</option>

            </select>

            <select

              value={filterService}

              onChange={(e) => setFilterService(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 min-w-[160px]"

            >

              <option value="all">All Services</option>

              <option value="Qualified Counsellor">Qualified Counsellor</option>

              <option value="Coach">Coach</option>

              <option value="Trainee Counsellor">Trainee Counsellor</option>

              <option value="Trainee Coach">Trainee Coach</option>

            </select>

            <select

              value={filterModality}

              onChange={(e) => setFilterModality(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 min-w-[180px]"

            >

              <option value="all">All Modalities</option>

              <option value="CBT">CBT - Cognitive Behavioral Therapy</option>

              <option value="Person-Centred">Person-Centred</option>

              <option value="Integrative">Integrative</option>

              <option value="Psychodynamic">Psychodynamic</option>

              <option value="Humanistic">Humanistic</option>

              <option value="Gestalt">Gestalt</option>

              <option value="Solution-Focused">Solution-Focused</option>

              <option value="Transactional Analysis">Transactional Analysis</option>

              <option value="EMDR">EMDR</option>

              <option value="Mindfulness-Based">Mindfulness-Based</option>

              <option value="Narrative Therapy">Narrative Therapy</option>

              <option value="Systemic">Systemic</option>

              <option value="Existential">Existential</option>

            </select>

            <select

              value={filterAvailability}

              onChange={(e) => setFilterAvailability(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 min-w-[140px]"

            >

              <option value="all">All Availability</option>

              <option value="has-capacity">Has Capacity</option>

              <option value="full">Full</option>

            </select>

            <select

              value={sortBy}

              onChange={(e) => setSortBy(e.target.value)}

              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 min-w-[150px]"

            >

              <option value="availability">Sort: Availability</option>

              <option value="name">Sort: Name</option>

              <option value="clients">Sort: Client Count</option>

            </select>

          </div>

        </div>



        {/* TC Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ minHeight: 0 }}>
          {loading && trainingCounsellors.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading practitioners...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">{error}</p>
                  <button
                    onClick={fetchTrainingCounsellors}
                    className="text-sm text-red-700 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {!loading && filteredTCs.length === 0 && !error && (
              <div className="col-span-2 text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Practitioners Found</h3>
                <p className="text-gray-600">Try adjusting your filters or add a new training counsellor</p>
              </div>
            )}

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

                    <Link href={`/dashboard/training-counsellors/details/${tc.uuid || tc.id}`} className="text-lg font-bold text-gray-900 mb-1 hover:text-purple-600 block">{formatName(tc.name, getCounsellorPrefixType(tc.counsellor_type))}</Link>
                    {tc.counsellor_type === 'Qualified' && (
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mt-1">
                        Qualified
                      </span>
                    )}

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

                          {formatName(client.name, 'client')}, {client.age}

                        </span>

                      ))}

                    </div>

                  )}

                </div>



                {/* Actions */}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">

                  <Link

                    href={`/dashboard/training-counsellors/details/${tc.uuid || tc.id}`}

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

                  <p className="text-sm text-gray-600 mt-1">Assign a client to {formatName(selectedTC.name, getCounsellorPrefixType(selectedTC.counsellor_type))}</p>

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

                      <p className="font-semibold text-purple-900">{formatName(selectedTC.name, getCounsellorPrefixType(selectedTC.counsellor_type))}</p>

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

                        {formatName(client.name, 'client')} ({client.age}) - {client.issues.join(', ')}

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

    </DashboardLayout>
  );

}
