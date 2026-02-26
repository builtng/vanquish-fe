"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';

import { 

  Users, Search, Filter, ChevronDown, MoreVertical, Eye,

  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,

  CheckCircle, Clock, AlertTriangle, Video, FileText,

  UserCheck, Activity, Home, ClipboardList,

  Settings, LogOut, ChevronRight, MapPin, User, 

  Download, Send, Archive, Plus, ChevronLeft,

  CreditCard, Package, AlertCircle, Check, XCircle, Building2, CalendarDays

} from 'lucide-react';



export default function IndividualClientDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);

  const [activeNotesTab, setActiveNotesTab] = useState('consultation');
  const [editingSection, setEditingSection] = useState(null);

  // Redirect to clients list - this page should only be accessed via [uuid] route
  useEffect(() => {
    router.push('/dashboard/clients');
  }, [router]);

  // Show loading while redirecting
  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // This should never render, but keeping for type safety
  const placeholderClient = {

    id: 'CL001',

    name: 'Emma Wilson',

    age: 31,

    email: 'emma.w@email.com',

    phone: '+44 7700 900101',

    address: '123 High Street, London',

    postcode: 'SW1A 1AA',

    gender: 'Female',

    ethnicity: 'White British',

    sexualOrientation: 'Heterosexual',

    stage: 'Active Therapy',

    status: 'active',

    daysInSystem: 45,

    voicemailPermission: 'Yes',

    howHeardAbout: 'Social Media (Instagram)',

    

    // Journey Timeline

    journey: [

      { stage: 'Application', date: '2025-02-15', completed: true },

      { stage: 'Consultation Booked', date: '2025-02-18', completed: true },

      { stage: 'Consultation Completed', date: '2025-02-20', completed: true },

      { stage: 'Matched', date: '2025-02-22', completed: true },

      { stage: 'Pending Match', date: null, completed: false, skipped: true },

      { stage: 'Agreement Pending', date: '2025-02-23', completed: true },

      { stage: 'Active Therapy', date: '2025-02-28', completed: true, current: true },

      { stage: 'Completed', date: null, completed: false }

    ],

    

    // Clinical Information

    primaryIssues: ['Depression', 'Anxiety', 'Work Stress'],

    additionalDetails: 'Experiencing burnout from work. Recently promoted to management role and struggling with imposter syndrome. Having trouble sleeping and feeling overwhelmed.',

    medication: 'Sertraline 50mg - prescribed for anxiety and depression',

    disabilities: 'None',

    riskFlags: 'None reported',

    substanceMisuse: 'Social drinker only',

    

    // Availability

    availability: [

      { day: 'Monday', timeBlocks: ['Morning (10-11am)'] },

      { day: 'Wednesday', timeBlocks: ['Afternoon (2-4pm)'] },

      { day: 'Friday', timeBlocks: ['Morning (11am-1pm)'] }

    ],

    

    // Service & Package

    serviceType: 'Low Cost Counselling',

    packageDetails: {

      name: 'Low Cost Counselling Package',

      totalSessions: 6,

      sessionsCompleted: 3,

      sessionsDNA: 1,

      sessionsRemaining: 2,

      status: 'Active',

      startDate: '2025-02-28',

      expectedEndDate: '2025-04-18'

    },

    

    // Matched TC

    matchedTC: {

      name: 'Sarah Johnson',

      email: 'sarah.j@vanquish.com',

      phone: '+44 7700 900201',

      currentClients: 3,

      maxClients: 6,

      modality: 'CBT - Cognitive Behavioral Therapy',

      matchScore: 87,

      matchBreakdown: {

        availability: { score: 38, max: 40, percentage: 95 },

        modality: { score: 18, max: 20, percentage: 90 },

        age: { score: 8, max: 10, percentage: 80 },

        ethnicity: { score: 10, max: 10, percentage: 100 },

        sexualOrientation: { score: 8, max: 10, percentage: 80 },

        gender: { score: 5, max: 10, percentage: 50 }

      },

      warningFlags: [],

      otherClients: [

        { name: 'John Smith', age: 28 },

        { name: 'Victoria James', age: 29 },

        { name: 'Michael Brown', age: 35 }

      ]

    },

    

    // Payment History

    payments: [

      {

        id: 'PAY001',

        date: '2025-02-15',

        type: 'Consultation Fee',

        description: 'Initial assessment booking',

        amount: 13,

        status: 'Paid',

        method: 'Card (****4242)'

      },

      {

        id: 'PAY002',

        date: '2025-02-20',

        type: 'Therapy Package',

        description: 'Low Cost Counselling (6 sessions)',

        amount: 240,

        status: 'Paid',

        method: 'Card (****4242)'

      }

    ],

    

    // Session History

    sessions: [

      {

        sessionNumber: 1,

        date: '2025-02-28',

        time: '10:00 AM',

        tcName: 'Sarah Johnson',

        duration: '50 min',

        status: 'Completed',

        notes: 'Initial session. Good rapport established. Client opened up about work stress and anxiety.'

      },

      {

        sessionNumber: 2,

        date: '2025-03-07',

        time: '10:00 AM',

        tcName: 'Sarah Johnson',

        duration: '50 min',

        status: 'Completed',

        notes: 'Discussed anxiety triggers at work. Introduced breathing techniques.'

      },

      {

        sessionNumber: 3,

        date: '2025-03-14',

        time: '10:00 AM',

        tcName: 'Sarah Johnson',

        duration: '-',

        status: 'DNA',

        notes: 'Client did not attend. No advance notice given. Follow-up email sent.'

      },

      {

        sessionNumber: 4,

        date: '2025-03-21',

        time: '10:00 AM',

        tcName: 'Sarah Johnson',

        duration: '50 min',

        status: 'Completed',

        notes: 'Client apologized for missed session. Discussed boundaries and self-care strategies.'

      },

      {

        sessionNumber: 5,

        date: '2025-03-28',

        time: '10:00 AM',

        tcName: 'Sarah Johnson',

        duration: '-',

        status: 'Scheduled',

        notes: 'Upcoming session'

      },

      {

        sessionNumber: 6,

        date: '2025-04-04',

        time: '10:00 AM',

        tcName: 'Sarah Johnson',

        duration: '-',

        status: 'Scheduled',

        notes: 'Final scheduled session'

      }

    ],

    

    // Consultation Record

    consultation: {

      date: '2025-02-20',

      time: '2:00 PM',

      conductedBy: 'Admin Team - Isha',

      duration: '45 min',

      notes: 'Client presented with work-related stress and anxiety. Recently promoted and experiencing imposter syndrome. Good insight into issues. Motivated for therapy. Assessed as suitable for Low Cost Counselling with CBT approach. No immediate risk concerns. Recommended 6-session package.',

      outcome: 'Approved for Low Cost Counselling',

      recommendedService: 'Low Cost Counselling - CBT focus'

    },

    

    // Agreement

    agreement: {

      status: 'Signed',

      sentDate: '2025-02-23',

      signedDate: '2025-02-25',

      documentUrl: '#'

    }

  };



  // Notes data

  const consultationNotes = [

    {

      id: 'CN001',

      date: '2025-02-20 2:45 PM',

      author: 'Isha (Admin)',

      content: 'Client presented well during consultation. Clear about needs. Discussed work stress and recent promotion. Recommended CBT approach. Client agreed to Low Cost package.'

    }

  ];



  const sessionNotes = [

    {

      id: 'SN001',

      date: '2025-02-28 10:50 AM',

      author: 'Sarah Johnson (TC)',

      session: 'Session 1',

      content: 'Excellent first session. Client was open and engaged. Established therapeutic alliance. Identified key areas: work stress, anxiety, sleep issues. Plan: Continue with CBT techniques.'

    },

    {

      id: 'SN002',

      date: '2025-03-07 10:50 AM',

      author: 'Sarah Johnson (TC)',

      session: 'Session 2',

      content: 'Progress noted. Client practicing breathing techniques. Discussed cognitive distortions. Homework: Thought diary for anxiety triggers.'

    },

    {

      id: 'SN003',

      date: '2025-03-14 10:15 AM',

      author: 'Sarah Johnson (TC)',

      session: 'Session 3 - DNA',

      content: 'Client did not attend. No message received. Follow-up email sent to check in.'

    },

    {

      id: 'SN004',

      date: '2025-03-21 10:50 AM',

      author: 'Sarah Johnson (TC)',

      session: 'Session 4',

      content: 'Client apologized for missed session - work emergency. Good discussion about boundaries and self-care. Client showing progress in managing anxiety.'

    }

  ];



  const adminNotes = [

    {

      id: 'AN001',

      date: '2025-02-15 9:30 AM',

      author: 'Isha (Admin)',

      content: 'Application received. Client seems motivated. Good candidate for Low Cost counselling.'

    },

    {

      id: 'AN002',

      date: '2025-02-22 11:00 AM',

      author: 'Isha (Admin)',

      content: 'Matched with Sarah Johnson - excellent fit based on availability and CBT modality. Match score: 87%'

    },

    {

      id: 'AN003',

      date: '2025-03-15 9:00 AM',

      author: 'Isha (Admin)',

      content: 'Client missed session yesterday. Sarah has followed up via email.'

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



  const getSessionStatusBadge = (status) => {

    switch(status) {

      case 'Completed':

        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">

          <CheckCircle className="w-3 h-3" /> Completed

        </span>;

      case 'DNA':

        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">

          <XCircle className="w-3 h-3" /> DNA

        </span>;

      case 'Scheduled':

        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">

          <Calendar className="w-3 h-3" /> Scheduled

        </span>;

      case 'Cancelled':

        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">

          <Clock className="w-3 h-3" /> Cancelled

        </span>;

      default:

        return null;

    }

  };



  return (
    <PageGuard menuId="clients">
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}

        <div className="bg-white border-b border-gray-200">

          {/* Breadcrumb */}

          <div className="px-6 py-3 border-b border-gray-100">

            <div className="flex items-center gap-2 text-sm text-gray-600">

              <Link href="/dashboard/clients" className="hover:text-purple-600">All Clients</Link>

              <ChevronRight className="w-4 h-4" />

              <span className="text-gray-900 font-medium">{client.name}</span>

            </div>

          </div>



          {/* Client Header */}

          <div className="px-6 py-4">

            <div className="flex items-start justify-between">

              <div className="flex items-start gap-4">

                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: '#6f1d56' }}>

                  {client.name.split(' ').map(n => n[0]).join('')}

                </div>

                <div>

                  <div className="flex items-center gap-3 mb-2">

                    <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>

                    <span className="text-gray-600">•</span>

                    <span className="text-lg text-gray-600">{client.age} years old</span>

                    <span className="text-gray-600">•</span>

                    <span className="text-sm text-gray-500">ID: {client.id}</span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}></div>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColor(client.stage)}`}>

                      {client.stage}

                    </span>

                    <span className="text-sm text-gray-600">Last activity: 2 hours ago</span>

                  </div>

                </div>

              </div>



              {/* Quick Actions */}

              <div className="flex items-center gap-2">

                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">

                  <Mail className="w-4 h-4" />

                  Send Email

                </button>

                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">

                  <Phone className="w-4 h-4" />

                  Call

                </button>

                <Link href={`/dashboard/clients/edit?id=${client.id}`} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">

                  <Edit className="w-4 h-4" />

                  Edit

                </Link>

                <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2">

                  <Archive className="w-4 h-4" />

                  Archive

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

                <p className="text-sm text-purple-600 mb-1">Service Type</p>

                <p className="text-xl font-bold text-purple-900">{client.serviceType}</p>

              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">

                <p className="text-sm text-blue-600 mb-1">Days in System</p>

                <p className="text-xl font-bold text-blue-900">{client.daysInSystem} days</p>

              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">

                <p className="text-sm text-green-600 mb-1">Sessions Completed</p>

                <p className="text-xl font-bold text-green-900">{client.packageDetails.sessionsCompleted}/{client.packageDetails.totalSessions}</p>

              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">

                <p className="text-sm text-orange-600 mb-1">Next Session</p>

                <p className="text-sm font-bold text-orange-900">28 Mar, 10:00 AM</p>

              </div>

            </div>



            {/* Journey Timeline */}

            <div className="bg-white rounded-lg border border-gray-200 p-6">

              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Journey</h2>

              <div className="relative">

                {/* Timeline Line */}

                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>

                <div 

                  className="absolute top-6 left-0 h-0.5 bg-purple-600 transition-all duration-500"

                  style={{ width: `${(client.journey.filter(j => j.completed).length / client.journey.length) * 100}%` }}

                ></div>



                {/* Timeline Stages */}

                <div className="relative flex justify-between">

                  {client.journey.map((stage, index) => (

                    <div key={index} className="flex flex-col items-center" style={{ flex: 1 }}>

                      {/* Circle */}

                      <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center relative z-10 ${

                        stage.completed 

                          ? 'bg-purple-600 border-purple-600' 

                          : stage.current

                          ? 'bg-white border-purple-600'

                          : 'bg-white border-gray-300'

                      }`}>

                        {stage.completed ? (

                          <Check className="w-6 h-6 text-white" />

                        ) : stage.current ? (

                          <Clock className="w-6 h-6 text-purple-600" />

                        ) : (

                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>

                        )}

                      </div>

                      

                      {/* Label */}

                      <div className="mt-3 text-center">

                        <p className={`text-xs font-medium ${

                          stage.completed || stage.current ? 'text-gray-900' : 'text-gray-500'

                        }`}>

                          {stage.stage}

                        </p>

                        {stage.date && (

                          <p className="text-xs text-gray-500 mt-1">{stage.date}</p>

                        )}

                      </div>

                    </div>

                  ))}

                </div>

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

                    <Link href={`/dashboard/clients/edit?id=${client.id}`} className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">

                      <Edit className="w-4 h-4" />

                      Edit

                    </Link>

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Full Name</p>

                      <p className="text-sm font-medium text-gray-900">{client.name}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Age</p>

                      <p className="text-sm font-medium text-gray-900">{client.age} years old</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Email</p>

                      <p className="text-sm font-medium text-gray-900">{client.email}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Phone</p>

                      <p className="text-sm font-medium text-gray-900">{client.phone}</p>

                    </div>

                    <div className="col-span-2">

                      <p className="text-sm text-gray-600 mb-1">Address</p>

                      <p className="text-sm font-medium text-gray-900">{client.address}, {client.postcode}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Gender</p>

                      <p className="text-sm font-medium text-gray-900">{client.gender}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Ethnicity</p>

                      <p className="text-sm font-medium text-gray-900">{client.ethnicity}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Sexual Orientation</p>

                      <p className="text-sm font-medium text-gray-900">{client.sexualOrientation}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-600 mb-1">Voicemail Permission</p>

                      <p className="text-sm font-medium text-gray-900">{client.voicemailPermission}</p>

                    </div>

                    <div className="col-span-2">

                      <p className="text-sm text-gray-600 mb-1">How They Heard About Us</p>

                      <p className="text-sm font-medium text-gray-900">{client.howHeardAbout}</p>

                    </div>

                  </div>

                </div>



                {/* Clinical Information */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Information</h2>

                  

                  <div className="space-y-4">

                    <div>

                      <p className="text-sm text-gray-600 mb-2">Primary Issues / Concerns</p>

                      <div className="flex flex-wrap gap-2">

                        {client.primaryIssues.map(issue => (

                          <span key={issue} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">

                            {issue}

                          </span>

                        ))}

                      </div>

                    </div>



                    <div>

                      <p className="text-sm text-gray-600 mb-2">Additional Details</p>

                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{client.additionalDetails}</p>

                    </div>



                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-sm text-gray-600 mb-2">Medication</p>

                        <p className="text-sm text-gray-900">{client.medication}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-600 mb-2">Disabilities / Impairments</p>

                        <p className="text-sm text-gray-900">{client.disabilities}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-600 mb-2">Risk Flags</p>

                        <p className="text-sm text-gray-900">{client.riskFlags}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-600 mb-2">Substance Misuse</p>

                        <p className="text-sm text-gray-900">{client.substanceMisuse}</p>

                      </div>

                    </div>

                  </div>

                </div>



                {/* Availability */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability Schedule</h2>

                  <div className="space-y-3">

                    {client.availability.map(avail => (

                      <div key={avail.day} className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-100">

                        <div className="w-28">

                          <p className="text-sm font-medium text-purple-900">{avail.day}</p>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          {avail.timeBlocks.map(block => (

                            <span key={block} className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">

                              {block}

                            </span>

                          ))}

                        </div>

                      </div>

                    ))}

                  </div>

                </div>



                {/* Matched Trainee Counsellor */}

                {client.matchedTC && (

                  <div className="bg-white rounded-lg border border-gray-200 p-6">

                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Matched Trainee Counsellor</h2>

                    

                    {/* TC Profile Card */}

                    <div className="border border-gray-200 rounded-lg p-4 mb-4">

                      <div className="flex items-start justify-between mb-4">

                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">

                            <User className="w-6 h-6 text-purple-600" />

                          </div>

                          <div>

                            <p className="font-semibold text-gray-900">{client.matchedTC.name}</p>

                            <p className="text-sm text-gray-600">{client.matchedTC.modality}</p>

                          </div>

                        </div>

                        <div className="text-right">

                          <p className="text-2xl font-bold text-purple-600">{client.matchedTC.matchScore}%</p>

                          <p className="text-xs text-gray-600">Match Score</p>

                        </div>

                      </div>



                      <div className="grid grid-cols-2 gap-3 mb-4">

                        <div className="bg-gray-50 p-3 rounded-lg">

                          <p className="text-xs text-gray-600 mb-1">Current Caseload</p>

                          <p className="text-sm font-semibold text-gray-900">

                            {client.matchedTC.currentClients}/{client.matchedTC.maxClients} clients

                          </p>

                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">

                          <p className="text-xs text-gray-600 mb-1">Contact</p>

                          <p className="text-sm font-semibold text-gray-900">{client.matchedTC.email}</p>

                        </div>

                      </div>



                      {/* Other Clients */}

                      <div>

                        <p className="text-xs text-gray-600 mb-2">Other Clients</p>

                        <div className="flex flex-wrap gap-2">

                          {client.matchedTC.otherClients.map((oc, idx) => (

                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">

                              {oc.name}, {oc.age}

                            </span>

                          ))}

                        </div>

                      </div>

                    </div>



                    {/* Match Score Breakdown */}

                    <div>

                      <p className="text-sm font-medium text-gray-900 mb-3">Match Score Breakdown</p>

                      <div className="space-y-3">

                        {Object.entries(client.matchedTC.matchBreakdown).map(([key, value]) => (

                          <div key={key}>

                            <div className="flex items-center justify-between mb-1">

                              <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>

                              <span className="text-sm font-medium text-gray-900">{value.score}/{value.max} ({value.percentage}%)</span>

                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">

                              <div 

                                className="bg-purple-600 h-2 rounded-full transition-all duration-500"

                                style={{ width: `${value.percentage}%` }}

                              ></div>

                            </div>

                          </div>

                        ))}

                      </div>

                    </div>



                    {client.matchedTC.warningFlags.length > 0 && (

                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">

                        <div className="flex items-start gap-2">

                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

                          <div>

                            <p className="text-sm font-medium text-yellow-900 mb-1">Warning Flags</p>

                            <p className="text-sm text-yellow-800">

                              TC marked as not ready for: {client.matchedTC.warningFlags.join(', ')}

                            </p>

                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                )}



                {/* Payment History */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>

                  <div className="space-y-3">

                    {client.payments.map(payment => (

                      <div key={payment.id} className="border border-gray-200 rounded-lg p-4">

                        <div className="flex items-center justify-between mb-2">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">

                              <CreditCard className="w-5 h-5 text-green-600" />

                            </div>

                            <div>

                              <p className="font-medium text-gray-900">{payment.type}</p>

                              <p className="text-sm text-gray-600">{payment.description}</p>

                            </div>

                          </div>

                          <div className="text-right">

                            <p className="text-xl font-bold text-gray-900">£{payment.amount}</p>

                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">

                              {payment.status}

                            </span>

                          </div>

                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">

                          <span>{payment.date}</span>

                          <span>{payment.method}</span>

                        </div>

                      </div>

                    ))}

                  </div>

                  

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">

                    <div className="flex items-center justify-between">

                      <span className="font-semibold text-gray-900">Total Paid</span>

                      <span className="text-2xl font-bold text-gray-900">

                        £{client.payments.reduce((sum, p) => sum + p.amount, 0)}

                      </span>

                    </div>

                  </div>

                </div>



                {/* Session History */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-lg font-semibold text-gray-900">Session History</h2>

                    <button className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 text-sm" style={{ backgroundColor: '#6f1d56' }}>

                      <Plus className="w-4 h-4" />

                      Add Session

                    </button>

                  </div>



                  <div className="overflow-x-auto">

                    <table className="w-full">

                      <thead className="bg-gray-50">

                        <tr>

                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>

                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>

                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TC Name</th>

                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>

                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>

                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-200">

                        {client.sessions.map(session => (

                          <tr key={session.sessionNumber} className="hover:bg-gray-50">

                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{session.sessionNumber}</td>

                            <td className="px-4 py-3 text-sm text-gray-700">

                              {session.date}<br/>

                              <span className="text-gray-500">{session.time}</span>

                            </td>

                            <td className="px-4 py-3 text-sm text-gray-700">{session.tcName}</td>

                            <td className="px-4 py-3 text-sm text-gray-700">{session.duration}</td>

                            <td className="px-4 py-3">{getSessionStatusBadge(session.status)}</td>

                            <td className="px-4 py-3">

                              <button className="p-2 hover:bg-gray-100 rounded-lg">

                                <Eye className="w-4 h-4 text-gray-600" />

                              </button>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>



                {/* Consultation Record */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Initial Consultation Record</h2>

                  

                  <div className="space-y-4">

                    <div className="grid grid-cols-3 gap-4">

                      <div>

                        <p className="text-sm text-gray-600 mb-1">Date</p>

                        <p className="text-sm font-medium text-gray-900">{client.consultation.date}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-600 mb-1">Time</p>

                        <p className="text-sm font-medium text-gray-900">{client.consultation.time}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-600 mb-1">Duration</p>

                        <p className="text-sm font-medium text-gray-900">{client.consultation.duration}</p>

                      </div>

                    </div>



                    <div>

                      <p className="text-sm text-gray-600 mb-1">Conducted By</p>

                      <p className="text-sm font-medium text-gray-900">{client.consultation.conductedBy}</p>

                    </div>



                    <div>

                      <p className="text-sm text-gray-600 mb-2">Consultation Notes</p>

                      <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{client.consultation.notes}</p>

                    </div>



                    <div className="grid grid-cols-2 gap-4">

                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">

                        <p className="text-sm text-gray-600 mb-1">Outcome</p>

                        <p className="text-sm font-medium text-green-900">{client.consultation.outcome}</p>

                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">

                        <p className="text-sm text-gray-600 mb-1">Recommended Service</p>

                        <p className="text-sm font-medium text-blue-900">{client.consultation.recommendedService}</p>

                      </div>

                    </div>

                  </div>

                </div>



                {/* Agreement Status */}

                {client.agreement && (

                  <div className="bg-white rounded-lg border border-gray-200 p-6">

                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Agreement</h2>

                    

                    <div className="space-y-4">

                      <div className="flex items-center gap-3">

                        {client.agreement.status === 'Signed' ? (

                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">

                            <CheckCircle className="w-6 h-6 text-green-600" />

                          </div>

                        ) : (

                          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">

                            <Clock className="w-6 h-6 text-yellow-600" />

                          </div>

                        )}

                        <div>

                          <p className="font-medium text-gray-900">Agreement {client.agreement.status}</p>

                          <p className="text-sm text-gray-600">

                            {client.agreement.status === 'Signed' 

                              ? `Signed on ${client.agreement.signedDate}`

                              : `Sent on ${client.agreement.sentDate}`

                            }

                          </p>

                        </div>

                      </div>



                      <div className="flex items-center gap-3">

                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">

                          <Download className="w-4 h-4" />

                          Download Agreement

                        </button>

                        {client.agreement.status !== 'Signed' && (

                          <button className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 font-medium flex items-center gap-2">

                            <Send className="w-4 h-4" />

                            Resend Agreement

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                )}



                {/* Notes Section with Tabs */}

                <div className="bg-white rounded-lg border border-gray-200 p-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Activity</h2>

                  

                  {/* Tabs */}

                  <div className="flex items-center gap-2 border-b border-gray-200 mb-4">

                    <button

                      onClick={() => setActiveNotesTab('consultation')}

                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${

                        activeNotesTab === 'consultation'

                          ? 'border-purple-600 text-purple-600'

                          : 'border-transparent text-gray-600 hover:text-gray-900'

                      }`}

                    >

                      Consultation Notes

                    </button>

                    <button

                      onClick={() => setActiveNotesTab('session')}

                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${

                        activeNotesTab === 'session'

                          ? 'border-purple-600 text-purple-600'

                          : 'border-transparent text-gray-600 hover:text-gray-900'

                      }`}

                    >

                      Session Notes

                    </button>

                    <button

                      onClick={() => setActiveNotesTab('admin')}

                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${

                        activeNotesTab === 'admin'

                          ? 'border-purple-600 text-purple-600'

                          : 'border-transparent text-gray-600 hover:text-gray-900'

                      }`}

                    >

                      Admin Notes

                    </button>

                  </div>



                  {/* Notes Content */}

                  <div className="space-y-4">

                    {activeNotesTab === 'consultation' && consultationNotes.map(note => (

                      <div key={note.id} className="border border-gray-200 rounded-lg p-4">

                        <div className="flex items-start justify-between mb-2">

                          <div>

                            <p className="font-medium text-gray-900">{note.author}</p>

                            <p className="text-sm text-gray-600">{note.date}</p>

                          </div>

                          <button className="p-2 hover:bg-gray-100 rounded-lg">

                            <Edit className="w-4 h-4 text-gray-600" />

                          </button>

                        </div>

                        <p className="text-sm text-gray-700">{note.content}</p>

                      </div>

                    ))}



                    {activeNotesTab === 'session' && sessionNotes.map(note => (

                      <div key={note.id} className="border border-gray-200 rounded-lg p-4">

                        <div className="flex items-start justify-between mb-2">

                          <div>

                            <p className="font-medium text-gray-900">{note.author}</p>

                            <p className="text-sm text-gray-600">{note.session} • {note.date}</p>

                          </div>

                          <button className="p-2 hover:bg-gray-100 rounded-lg">

                            <Eye className="w-4 h-4 text-gray-600" />

                          </button>

                        </div>

                        <p className="text-sm text-gray-700">{note.content}</p>

                      </div>

                    ))}



                    {activeNotesTab === 'admin' && (

                      <>

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

                        

                        {/* Add New Admin Note */}

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

                      </>

                    )}

                  </div>

                </div>

              </div>



              {/* Right Column - 1/3 width - Package Summary */}

              <div className="col-span-1">

                <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">

                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Package Summary</h2>

                  

                  <div className="space-y-4">

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">

                      <div className="flex items-center gap-2 mb-2">

                        <Package className="w-5 h-5 text-purple-600" />

                        <p className="font-medium text-purple-900">{client.packageDetails.name}</p>

                      </div>

                      <p className="text-sm text-purple-700">

                        {client.packageDetails.totalSessions} Sessions Package

                      </p>

                    </div>



                    <div className="space-y-3">

                      <div className="flex justify-between items-center">

                        <span className="text-sm text-gray-600">Total Sessions</span>

                        <span className="text-sm font-semibold text-gray-900">{client.packageDetails.totalSessions}</span>

                      </div>

                      <div className="flex justify-between items-center">

                        <span className="text-sm text-gray-600">Completed</span>

                        <span className="text-sm font-semibold text-green-600">{client.packageDetails.sessionsCompleted}</span>

                      </div>

                      <div className="flex justify-between items-center">

                        <span className="text-sm text-gray-600">DNA (Did Not Attend)</span>

                        <span className="text-sm font-semibold text-red-600">{client.packageDetails.sessionsDNA}</span>

                      </div>

                      <div className="flex justify-between items-center">

                        <span className="text-sm text-gray-600">Remaining</span>

                        <span className="text-sm font-semibold text-blue-600">{client.packageDetails.sessionsRemaining}</span>

                      </div>

                    </div>



                    <div className="pt-4 border-t border-gray-200">

                      <div className="flex justify-between items-center mb-1">

                        <span className="text-sm text-gray-600">Progress</span>

                        <span className="text-sm font-semibold text-gray-900">

                          {Math.round((client.packageDetails.sessionsCompleted / client.packageDetails.totalSessions) * 100)}%

                        </span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">

                        <div 

                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"

                          style={{ width: `${(client.packageDetails.sessionsCompleted / client.packageDetails.totalSessions) * 100}%` }}

                        ></div>

                      </div>

                    </div>



                    <div className="pt-4 border-t border-gray-200 space-y-2">

                      <div className="flex justify-between items-center">

                        <span className="text-sm text-gray-600">Start Date</span>

                        <span className="text-sm font-medium text-gray-900">{client.packageDetails.startDate}</span>

                      </div>

                      <div className="flex justify-between items-center">

                        <span className="text-sm text-gray-600">Expected End</span>

                        <span className="text-sm font-medium text-gray-900">{client.packageDetails.expectedEndDate}</span>

                      </div>

                      <div className="flex justify-between items-center">

                        <span className="text-sm text-gray-600">Status</span>

                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">

                          {client.packageDetails.status}

                        </span>

                      </div>

                    </div>

                  </div>



                  {/* Quick Actions */}

                  <div className="mt-6 space-y-2">

                    <button className="w-full py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm" style={{ backgroundColor: '#6f1d56' }}>

                      Progress to Next Stage

                    </button>

                    <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">

                      Book Next Session

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
    </DashboardLayout>
    </PageGuard>
  );
}

