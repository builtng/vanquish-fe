"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import apiService from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import { formatName } from '@/lib/nameFormatter';
import SearchableSelect from '@/components/SearchableSelect';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';

import { 

  Users, Search, Filter, ChevronDown, MoreVertical, Eye,

  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,

  CheckCircle, Clock, AlertTriangle, Video, FileText,

  UserCheck, Activity, Menu, Home, ClipboardList,

  Settings, LogOut, ChevronRight, MapPin, User, 

  Download, Send, Archive, Plus, ChevronLeft,

  CreditCard, Package, AlertCircle, Check, XCircle,

  Save, ChevronUp, List, CalendarDays, RefreshCw,

  Ban, DollarSign, Repeat, Building2

} from 'lucide-react';



export default function ConsultationsManagementPageFixed() {
  const pathname = usePathname();
  const { success, error: showError } = useToast();

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const [activeTab, setActiveTab] = useState('today');

  const [searchTerm, setSearchTerm] = useState('');

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [trainingCounsellors, setTrainingCounsellors] = useState([]);
  const [stats, setStats] = useState({
    today_count: 0,
    upcoming_count: 0,
    this_week_count: 0,
    completed_this_month: 0,
    pending_payment: 0
  });

  

  // Modal states

  const [showBookModal, setShowBookModal] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  
  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: '',
    sendNotification: true
  });



  // Forms

  const [bookForm, setBookForm] = useState({

    clientId: '',

    tcId: '',

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

  // Helper function to refresh consultations and stats
  const refreshData = async () => {
      try {
      // Fetch consultations and stats in parallel
      const [consultationsData, statsData] = await Promise.all([
        apiService.getConsultations(),
        apiService.getConsultationStats()
      ]);
        
        // Handle API response - could be array or wrapped in data property
      const consultationsArray = Array.isArray(consultationsData) ? consultationsData : (consultationsData?.data || []);
        
        // Transform API data to match component structure
        const transformedData = transformConsultationData(consultationsArray);
        
        setConsultations(transformedData);
      setStats(statsData || {
        today_count: 0,
        upcoming_count: 0,
        this_week_count: 0,
        completed_this_month: 0,
        pending_payment: 0
      });
      } catch (err) {
      console.error('Error refreshing data:', err);
      showError('Failed to refresh data. Please try again.');
    }
  };

  // Fetch consultations and stats from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await refreshData();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load consultations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch clients and training counsellors for booking modal
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiService.getClients();
        // Handle paginated response - extract data array
        const clientsData = Array.isArray(response) 
          ? response 
          : (response && response.data ? response.data : []);
        
        // Ensure we have an array before setting state
        setClients(Array.isArray(clientsData) ? clientsData : []);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setClients([]); // Set empty array on error
      }
    };

    const fetchTrainingCounsellors = async () => {
      try {
        const data = await apiService.getTrainingCounsellors({ status: 'Active' });
        const tcsData = Array.isArray(data) ? data : [];
        setTrainingCounsellors(tcsData);
      } catch (err) {
        console.error('Error fetching training counsellors:', err);
        setTrainingCounsellors([]);
      }
    };

    if (showBookModal) {
      fetchClients();
      fetchTrainingCounsellors();
    }
  }, [showBookModal]);

  // Transform API consultation data to match component structure
  const transformConsultationData = (consultations) => {
    if (!Array.isArray(consultations)) {
      return [];
    }
    
    return consultations.map(consultation => ({
      id: consultation.id,
      consultationId: consultation.consultation_id || `CONS${String(consultation.id).padStart(3, '0')}`,
      clientId: consultation.client_id,
      clientUuid: consultation.client?.uuid || consultation.client_id, // Use UUID, fallback to ID for backward compatibility
      clientName: consultation.client?.name || 'Unknown Client',
      clientAge: consultation.client?.age || null,
      date: consultation.scheduled_at ? consultation.scheduled_at.split('T')[0] : null,
      time: consultation.scheduled_at ? new Date(consultation.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
      status: consultation.status === 'scheduled' ? 'Booked' : consultation.status === 'completed' ? 'Completed' : consultation.status === 'no_show' ? 'No Show' : consultation.status === 'cancelled' ? 'Cancelled' : consultation.status,
      serviceRequested: consultation.client?.service_type || 'N/A',
      paymentStatus: 'Paid', // TODO: Get from payment records
      paymentAmount: consultation.recommended_service === 'Coaching/Counselling' ? 25 : (consultation.payment_amount || 13),
      conductedBy: consultation.tc?.name || 'Not Assigned',
      bookedAt: consultation.created_at || null,
      notes: consultation.notes || '',
      completedAt: consultation.completed_at || null,
      duration: consultation.duration_minutes ? `${consultation.duration_minutes} min` : null,
      outcome: consultation.outcome || null,
      recommendedService: consultation.recommended_service || null,
      recommendedModality: consultation.recommended_modality || null
    }));
  };



  // Filter consultations

  const getFilteredConsultations = () => {

    const today = new Date().toISOString().split('T')[0];

    let filtered = consultations;



    if (searchTerm) {

      filtered = filtered.filter(c => 

        (c.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||

        (c.clientId || '').toLowerCase().includes(searchTerm.toLowerCase())

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

  // Calculate actual counts from consultations data
  const today = new Date().toISOString().split('T')[0];
  const todayCount = consultations.filter(c => c.date === today && c.status === 'Booked').length;
  const upcomingCount = consultations.filter(c => c.status === 'Booked').length;
  const completedCount = consultations.filter(c => c.status === 'Completed').length;
  
  // Stats from backend (for display cards)
  const thisWeekCount = stats.this_week_count || 0;
  const completedThisMonth = stats.completed_this_month || 0;
  const pendingPayment = stats.pending_payment || 0;



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



  // Helper function to convert 12-hour format (e.g., "09:00 AM") to 24-hour format (e.g., "09:00")
  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    const [time, period] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours, 10);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    return `${String(hour24).padStart(2, '0')}:${minutes}`;
  };

  // Helper function to safely get initials from a name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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



  const handleCompleteSubmit = async (e) => {

    e.preventDefault();

    try {
      setActionLoading(true);
      
      // Validate required fields
      if (!completeForm.duration || !completeForm.outcome || !completeForm.notes?.trim()) {
        showError('Please fill in all required fields (Duration, Outcome, and Notes).');
        setActionLoading(false);
        return;
      }
      
      await apiService.completeConsultation(selectedConsultation.id, {
        duration_minutes: parseInt(completeForm.duration, 10),
        notes: completeForm.notes.trim(),
        outcome: completeForm.outcome,
        recommended_service: completeForm.recommendedService || null,
        recommended_modality: completeForm.recommendedModality || null,
        risk_notes: completeForm.riskNotes?.trim() || null,
        next_steps: completeForm.nextSteps?.trim() || null
      });

      const outcomeMessage = completeForm.outcome === 'approved' 
        ? `Consultation marked as completed! Client "${selectedConsultation.clientName || 'Unknown Client'}" has been moved to "Pending Match" stage.`
        : `Consultation marked as completed!`;
      
      success(outcomeMessage);
      setShowCompleteModal(false);
      // Reset form
      setCompleteForm({
        duration: '45',
        notes: '',
        outcome: 'approved',
        recommendedService: 'Low Cost Counselling',
        recommendedModality: 'CBT',
        riskNotes: '',
        nextSteps: ''
      });
      // Refresh data
      await refreshData();
    } catch (err) {
      console.error('Error completing consultation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to complete consultation. Please try again.';
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }

  };



  const handleBookSubmit = async (e) => {

    e.preventDefault();

    try {
      setActionLoading(true);
      
      const time24h = convertTo24Hour(bookForm.time);
      if (!bookForm.date || !time24h) {
        showError('Please select both date and time.');
        setActionLoading(false);
        return;
      }
      
      const scheduledDateTime = new Date(`${bookForm.date}T${time24h}`).toISOString();
      
      await apiService.createConsultation({
        client_id: bookForm.clientId,
        tc_id: bookForm.tcId || null,
        scheduled_at: scheduledDateTime,
        notes: bookForm.notes,
        send_confirmation: bookForm.sendConfirmation
      });

      success('Consultation booked successfully!');
      setShowBookModal(false);
      setBookForm({
        clientId: '',
        tcId: '',
        date: '',
        time: '',
        notes: '',
        sendConfirmation: true
      });
      // Refresh data
      await refreshData();
    } catch (err) {
      console.error('Error booking consultation:', err);
      showError(err.message || 'Failed to book consultation. Please try again.');
    } finally {
      setActionLoading(false);
    }

  };



  // Simple Calendar Component

  const CalendarViewComponent = () => {

    const daysInMonth = 30;

    const firstDay = 5;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    

    const getConsultationsForDay = (day) => {

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;

      return consultations.filter(c => c.date === dateStr);

    };



    return (

      <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">

        <div className="flex items-center justify-between mb-6">

          <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">November 2025</h3>

          <div className="flex items-center gap-2">

            <button className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors">

              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />

            </button>

            <button className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] text-sm font-medium transition-colors">

              Today

            </button>

            <button className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors">

              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />

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

                className={`aspect-square border rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors ${

                  isToday ? 'border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-[var(--card-border)]'

                }`}

              >

                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-[var(--text-primary)]'}`}>

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

                      title={`${consultation.time || ''} - ${consultation.clientName || 'Unknown Client'}`}

                    >

                      {consultation.time ? consultation.time.split(' ')[0] : 'N/A'}

                    </div>

                  ))}

                </div>

              </div>

            );

          })}

        </div>



        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-[var(--card-border)]">

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30"></div>

            <span className="text-sm text-gray-700 dark:text-[var(--text-primary)]">Booked</span>

          </div>

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></div>

            <span className="text-sm text-gray-700 dark:text-[var(--text-primary)]">Completed</span>

          </div>

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></div>

            <span className="text-sm text-gray-700 dark:text-[var(--text-primary)]">No Show</span>

          </div>

        </div>

      </div>

    );

  };



  // List View Component

  const ListViewComponent = () => (

    <div className="space-y-4">

      {filteredConsultations.length === 0 ? (

        <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-12 text-center">

          <Calendar className="w-16 h-16 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-2">No Consultations Found</h3>

          <p className="text-gray-600 dark:text-[var(--text-secondary)] mb-4">There are no consultations matching your current filters.</p>

          <button

            onClick={() => setShowBookModal(true)}

            className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium transition-opacity"

            style={{ backgroundColor: '#6f1d56' }}

          >

            Book New Consultation

          </button>

        </div>

      ) : (

        filteredConsultations.map(consultation => (

          <div key={consultation.id} className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6 hover:shadow-md transition-shadow">

            <div className="flex items-start justify-between">

              <div className="flex items-start gap-4 flex-1">

                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">

                  {getInitials(consultation.clientName)}

                </div>

                

                <div className="flex-1">

                  <div className="flex items-center gap-3 mb-2">

                    <Link href={`/dashboard/client-details/${consultation.clientUuid || consultation.clientId}`} className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] hover:text-purple-600 dark:hover:text-purple-400">

                      {formatName(consultation.clientName || 'Unknown Client', 'client')}

                    </Link>

                    <span className="text-gray-600 dark:text-[var(--text-secondary)]">•</span>

                    <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">{consultation.clientAge} years old</span>

                    <span className="text-gray-600 dark:text-[var(--text-secondary)]">•</span>

                    <span className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">{consultation.clientId}</span>

                  </div>



                  <div className="flex items-center gap-4 mb-3">

                    {getStatusBadge(consultation.status)}

                    {getPaymentBadge(consultation.paymentStatus)}

                  </div>



                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">

                    <div className="flex items-center gap-2">

                      <Calendar className="w-4 h-4 text-gray-500 dark:text-[var(--text-tertiary)]" />

                      <span className="text-gray-700 dark:text-[var(--text-primary)]">{consultation.date} at {consultation.time}</span>

                    </div>

                    <div className="flex items-center gap-2">

                      <User className="w-4 h-4 text-gray-500 dark:text-[var(--text-tertiary)]" />

                      <span className="text-gray-700 dark:text-[var(--text-primary)]">Conducted by: {formatName(consultation.conductedBy, 'tc')}</span>

                    </div>

                    <div className="flex items-center gap-2">

                      <Package className="w-4 h-4 text-gray-500 dark:text-[var(--text-tertiary)]" />

                      <span className="text-gray-700 dark:text-[var(--text-primary)]">{consultation.serviceRequested}</span>

                    </div>

                    <div className="flex items-center gap-2">

                      <CreditCard className="w-4 h-4 text-gray-500 dark:text-[var(--text-tertiary)]" />

                      <span className="text-gray-700 dark:text-[var(--text-primary)]">£{consultation.paymentAmount} - {consultation.paymentStatus}</span>

                    </div>

                  </div>



                  {consultation.status === 'Completed' && consultation.outcome && (

                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">

                      <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">Outcome: {consultation.outcome}</p>

                      <p className="text-sm text-green-800 dark:text-green-300">Recommended: {consultation.recommendedService}</p>

                    </div>

                  )}



                  {consultation.notes && (

                    <div className="mt-3 p-3 bg-gray-50 dark:bg-[var(--hover-bg)] rounded-lg">

                      <p className="text-sm text-gray-700 dark:text-[var(--text-primary)]">{consultation.notes}</p>

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
                        // Pre-fill reschedule form with current date/time
                        const currentDate = consultation.date || '';
                        const currentTime = consultation.time || '';
                        setRescheduleForm({
                          date: currentDate,
                          time: currentTime,
                          sendNotification: true
                        });
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

                  href={`/dashboard/client-details/${consultation.clientUuid || consultation.clientId}`}

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
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          actions={
            <button
              onClick={() => setShowBookModal(true)}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-opacity"
              style={{ backgroundColor: '#6f1d56' }}
            >
              <Plus className="w-4 h-4" />
              Book Consultation
            </button>
          }
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Consultations</h1>
          </div>
        </DashboardHeader>

        {/* Stats Cards */}
        <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">Today's Consultations</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{todayCount}</p>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">This Week</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{thisWeekCount}</p>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">Completed This Month</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{completedThisMonth}</p>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">Pending Payment</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{pendingPayment}</p>
            </div>
          </div>
        </div>

        {/* Filters & View Toggle */}
        <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">

          <div className="flex items-center justify-between mb-4">

            <div className="flex-1 max-w-md relative">

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input

                type="text"

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}

                placeholder="Search by client name or ID..."

                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

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

                { id: 'upcoming', label: 'Upcoming', count: upcomingCount },

                { id: 'completed', label: 'Completed', count: completedCount },

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

                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${

                    activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'

                  }`}>

                    {tab.count}

                  </span>

                </button>

              ))}

            </div>

          )}

        </div>



        {/* Content */}

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
          {loading && consultations.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 dark:text-[var(--text-tertiary)] animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">Loading consultations...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-red-700 dark:text-red-300 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && (viewMode === 'list' ? <ListViewComponent /> : <CalendarViewComponent />)}

        </div>
      </div>

      {/* Book Modal */}

      {showBookModal && (

        <>

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowBookModal(false)}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              <div className="sticky top-0 bg-white dark:bg-[var(--card-bg)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Book New Consultation</h2>

                <button onClick={() => setShowBookModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors">

                  <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />

                </button>

              </div>



              <form onSubmit={handleBookSubmit} className="p-6 space-y-4">

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">

                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

                  <div>

                    <p className="text-sm font-medium text-yellow-900 mb-1">Payment Required</p>

                    <p className="text-sm text-yellow-800">

                      Client must have paid the consultation fee (£13 for Counselling, £25 for Coaching/Counselling) before booking.

                    </p>

                  </div>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Select Client <span className="text-red-500">*</span>

                  </label>

                  <SearchableSelect
                    value={bookForm.clientId}
                    onChange={(e) => setBookForm({...bookForm, clientId: e.target.value})}
                    options={Array.isArray(clients) ? clients.map(client => ({
                      value: client.id,
                      label: `${client.name} - ${client.client_id || client.uuid}`
                    })) : []}
                    placeholder="Select a client..."
                    required
                  />

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

                    <SearchableSelect
                      value={bookForm.time}
                      onChange={(e) => setBookForm({...bookForm, time: e.target.value})}
                      options={[
                        { value: '09:00 AM', label: '09:00 AM' },
                        { value: '10:00 AM', label: '10:00 AM' },
                        { value: '11:00 AM', label: '11:00 AM' },
                        { value: '02:00 PM', label: '02:00 PM' },
                        { value: '03:00 PM', label: '03:00 PM' }
                      ]}
                      placeholder="Select time..."
                      required
                    />

                  </div>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Counsellor <span className="text-red-500">*</span>
                  </label>

                  <SearchableSelect
                    value={bookForm.tcId}
                    onChange={(e) => setBookForm({...bookForm, tcId: e.target.value})}
                    options={Array.isArray(trainingCounsellors) ? trainingCounsellors.map(tc => ({
                      value: tc.id,
                      label: `${tc.name} ${tc.modality ? `(${tc.modality})` : ''}`
                    })) : []}
                    placeholder="Select a counsellor..."
                    required
                  />

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

                  <button type="button" onClick={() => setShowBookModal(false)} disabled={actionLoading} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed">

                    Cancel

                  </button>

                  <button type="submit" disabled={actionLoading} className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style={{ backgroundColor: '#6f1d56' }}>
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Book Consultation'
                    )}
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

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

              <div className="sticky top-0 bg-white dark:bg-[var(--card-bg)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Mark Consultation as Completed</h2>

                    <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">{formatName(selectedConsultation.clientName || 'Unknown Client', 'client')} - {selectedConsultation.date} {selectedConsultation.time}</p>

                  </div>

                  <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors">

                    <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />

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

                    <SearchableSelect
                      value={completeForm.outcome}
                      onChange={(e) => setCompleteForm({...completeForm, outcome: e.target.value})}
                      options={[
                        { value: 'approved', label: 'Approved for Therapy' },
                        { value: 'not_approved', label: 'Not Approved' },
                        { value: 'pending', label: 'Pending Review' }
                      ]}
                      placeholder="Select outcome..."
                      required
                    />

                  </div>

                </div>



                {completeForm.outcome === 'approved' && (

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Service</label>

                      <SearchableSelect
                        value={completeForm.recommendedService}
                        onChange={(e) => setCompleteForm({...completeForm, recommendedService: e.target.value})}
                        options={[
                          { value: 'Low Cost Counselling', label: 'Low Cost Counselling' },
                          { value: 'Mid Range Counselling', label: 'Mid Range Counselling' },
                          { value: 'Coaching/Counselling', label: 'Coaching/Counselling' }
                        ]}
                        placeholder="Select service..."
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Modality</label>

                      <SearchableSelect
                        value={completeForm.recommendedModality}
                        onChange={(e) => setCompleteForm({...completeForm, recommendedModality: e.target.value})}
                        options={[
                          { value: 'CBT', label: 'CBT' },
                          { value: 'Person-Centred', label: 'Person-Centred' },
                          { value: 'Integrative', label: 'Integrative' }
                        ]}
                        placeholder="Select modality..."
                      />

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

                  <button type="button" onClick={() => setShowCompleteModal(false)} disabled={actionLoading} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed">

                    Cancel

                  </button>

                  <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save & Complete
                      </>
                    )}
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

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => {
            setShowRescheduleModal(false);
            setRescheduleForm({ date: '', time: '', sendNotification: true });
          }}></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full">

              <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Reschedule Consultation</h2>

                <button onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleForm({ date: '', time: '', sendNotification: true });
                }} className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors">

                  <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />

                </button>

              </div>



              <div className="p-6 space-y-4">

                <p className="text-sm text-gray-700">Reschedule for <strong>{formatName(selectedConsultation.clientName || 'Unknown Client', 'client')}</strong></p>

                

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">New Date <span className="text-red-500">*</span></label>

                  <input 
                    type="date" 
                    value={rescheduleForm.date}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                    required
                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">New Time <span className="text-red-500">*</span></label>

                  <SearchableSelect
                    value={rescheduleForm.time}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, time: e.target.value})}
                    options={[
                      { value: '09:00 AM', label: '09:00 AM' },
                      { value: '10:00 AM', label: '10:00 AM' },
                      { value: '11:00 AM', label: '11:00 AM' },
                      { value: '02:00 PM', label: '02:00 PM' },
                      { value: '03:00 PM', label: '03:00 PM' },
                      { value: '04:00 PM', label: '04:00 PM' }
                    ]}
                    placeholder="Select time..."
                    required
                  />

                </div>



                <div className="flex items-center gap-2">

                  <input 
                    type="checkbox" 
                    id="notify" 
                    checked={rescheduleForm.sendNotification}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, sendNotification: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded" 
                  />

                  <label htmlFor="notify" className="text-sm text-gray-700">Send notification to client</label>

                </div>



                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

                  <button onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleForm({ date: '', time: '', sendNotification: true });
                  }} disabled={actionLoading} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed">

                    Cancel

                  </button>

                  <button

                    onClick={async () => {
                      try {
                        setActionLoading(true);
                        
                        if (!rescheduleForm.date || !rescheduleForm.time) {
                          showError('Please select both date and time.');
                          setActionLoading(false);
                          return;
                        }

                        const time24h = convertTo24Hour(rescheduleForm.time);
                        if (!time24h) {
                          showError('Invalid time format. Please select a valid time.');
                          setActionLoading(false);
                          return;
                        }
                        
                        const scheduledDateTime = new Date(`${rescheduleForm.date}T${time24h}`).toISOString();
                        
                        // Validate date
                        if (isNaN(new Date(scheduledDateTime).getTime())) {
                          showError('Invalid date/time combination. Please check your selection.');
                          setActionLoading(false);
                          return;
                        }
                        
                        await apiService.rescheduleConsultation(selectedConsultation.id, {
                          scheduled_at: scheduledDateTime,
                        });

                        success('Consultation rescheduled successfully!');
                        setShowRescheduleModal(false);
                        setRescheduleForm({ date: '', time: '', sendNotification: true });
                        // Refresh data
                        const data = await apiService.getConsultations();
                        const consultationsArray = Array.isArray(data) ? data : (data?.data || []);
                        setConsultations(transformConsultationData(consultationsArray));
                      } catch (err) {
                        console.error('Error rescheduling consultation:', err);
                        showError(err.message || 'Failed to reschedule consultation. Please try again.');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"

                    style={{ backgroundColor: '#6f1d56' }}

                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Rescheduling...
                      </>
                    ) : (
                      'Reschedule'
                    )}

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

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full">

              <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)]">

                <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Cancel Consultation</h2>

              </div>



              <div className="p-6">

                <p className="text-gray-700 mb-4">

                  Cancel consultation for <strong>{formatName(selectedConsultation.clientName || 'Unknown Client', 'client')}</strong> on {selectedConsultation.date}?

                </p>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>

                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none" 
                    rows={3}
                    placeholder="Enter reason for cancellation..."
                  />

                </div>



                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">

                  <button onClick={() => setShowCancelModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">

                    Keep Consultation

                  </button>

                  <button

                    onClick={() => {
                      setShowCancelModal(false);
                      setShowCancelConfirmModal(true);
                    }}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"

                  >

                    Cancel Consultation

                  </button>

                </div>

              </div>

            </div>

          </div>

        </>

      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirmModal}
        onClose={() => {
          setShowCancelConfirmModal(false);
          setCancelReason('');
        }}
        onConfirm={async () => {
          try {
            setActionLoading(true);
            await apiService.cancelConsultation(selectedConsultation.id, cancelReason);
            success('Consultation cancelled successfully!');
            setShowCancelConfirmModal(false);
            setShowCancelModal(false);
            setCancelReason('');
            // Refresh data
            const data = await apiService.getConsultations();
            const consultationsArray = Array.isArray(data) ? data : (data?.data || []);
            setConsultations(transformConsultationData(consultationsArray));
          } catch (err) {
            console.error('Error cancelling consultation:', err);
            showError(err.message || 'Failed to cancel consultation. Please try again.');
          } finally {
            setActionLoading(false);
          }
        }}
        title="Cancel Consultation"
        message={`Are you sure you want to cancel the consultation for ${selectedConsultation?.clientName || 'Unknown Client'} on ${selectedConsultation?.date}? This action cannot be undone.`}
        confirmText="Cancel Consultation"
        cancelText="Keep Consultation"
        type="danger"
        loading={actionLoading}
        confirmButtonColor="#dc2626"
      />
    </DashboardLayout>
  );
}

