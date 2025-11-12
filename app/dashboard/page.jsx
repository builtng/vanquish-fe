"use client"
import React, { useState } from 'react';
import { 
  Users, Calendar, CheckCircle, Clock, AlertTriangle, Search, 
  Filter, BarChart3, Settings, ChevronRight, FileText, Mail,
  Phone, MapPin, Award, TrendingUp, UserCheck, Eye, X,
  Download, RefreshCw, Plus, Edit, Trash2, Menu, Home,
  ClipboardList, Activity, Bell, LogOut, ChevronDown, AlertCircle,
  User, Video, FileCheck, BookOpen, PlayCircle
} from 'lucide-react';

export default function VanquishAdminComprehensive() {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTC, setSelectedTC] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock Data - Comprehensive
  const trainingCounsellors = [
    {
      id: 'TC001',
      name: 'Sarah Johnson',
      age: 32,
      email: 'sarah.j@email.com',
      phone: '+44 7700 900001',
      status: 'Active',
      joinedDate: '2025-01-15',
      totalClients: 4,
      activeClients: 3,
      capacity: 6,
      completedSessions: 28,
      availability: {
        monday: ['10am-11am', '11am-1pm'],
        wednesday: ['1pm-4pm', '5pm-7pm'],
        friday: ['10am-11am']
      },
      modalities: ['CBT', 'Person-Centred'],
      specializations: ['Anxiety', 'Depression', 'Stress'],
      ethnicity: 'Asian',
      gender: 'Female',
      sexualOrientation: 'Heterosexual',
      topicsNotReady: ['Sexual Abuse', 'Eating Disorders'],
      currentClients: [
        { id: 'CL001', name: 'John Smith', age: 28, startDate: '2025-02-01', sessionsCompleted: 8, status: 'Active', issues: ['Anxiety', 'Work Stress'] },
        { id: 'CL002', name: 'Emma Wilson', age: 31, startDate: '2025-02-15', sessionsCompleted: 6, status: 'Active', issues: ['Depression'] },
        { id: 'CL005', name: 'Michael Brown', age: 35, startDate: '2025-03-01', sessionsCompleted: 4, status: 'Active', issues: ['Relationship Issues'] }
      ]
    },
    {
      id: 'TC002',
      name: 'David Chen',
      age: 38,
      email: 'david.c@email.com',
      phone: '+44 7700 900002',
      status: 'Active',
      joinedDate: '2025-01-20',
      totalClients: 6,
      activeClients: 5,
      capacity: 6,
      completedSessions: 42,
      availability: {
        tuesday: ['10am-11am', '1pm-4pm'],
        thursday: ['11am-1pm', '4pm-5pm'],
        friday: ['1pm-4pm']
      },
      modalities: ['Psychodynamic', 'Integrative'],
      specializations: ['Trauma', 'Relationship Issues', 'Self-esteem'],
      ethnicity: 'Asian',
      gender: 'Male',
      sexualOrientation: 'Heterosexual',
      topicsNotReady: ['Eating Disorders', 'Suicidal Ideation'],
      currentClients: [
        { id: 'CL003', name: 'Sophie Taylor', age: 29, startDate: '2025-01-25', sessionsCompleted: 12, status: 'Active', issues: ['Trauma'] },
        { id: 'CL004', name: 'James Wilson', age: 42, startDate: '2025-02-10', sessionsCompleted: 8, status: 'Active', issues: ['Depression'] },
        { id: 'CL006', name: 'Rachel Green', age: 34, startDate: '2025-02-20', sessionsCompleted: 6, status: 'Active', issues: ['Anxiety'] },
        { id: 'CL007', name: 'Tom Harris', age: 27, startDate: '2025-03-05', sessionsCompleted: 4, status: 'Active', issues: ['Self-esteem'] },
        { id: 'CL008', name: 'Nina Patel', age: 31, startDate: '2025-03-10', sessionsCompleted: 3, status: 'Active', issues: ['Work Stress'] }
      ]
    },
    {
      id: 'TC003',
      name: 'Priya Patel',
      age: 35,
      email: 'priya.p@email.com',
      phone: '+44 7700 900003',
      status: 'Active',
      joinedDate: '2024-12-01',
      totalClients: 3,
      activeClients: 3,
      capacity: 6,
      completedSessions: 24,
      availability: {
        monday: ['1pm-4pm', '5pm-7pm'],
        wednesday: ['10am-11am', '1pm-4pm'],
        friday: ['11am-1pm']
      },
      modalities: ['CBT', 'Mindfulness-Based'],
      specializations: ['Anxiety', 'OCD', 'Phobias'],
      ethnicity: 'Asian',
      gender: 'Female',
      sexualOrientation: 'Heterosexual',
      topicsNotReady: ['Domestic Violence', 'Sexual Abuse'],
      currentClients: [
        { id: 'CL012', name: 'Oliver Smith', age: 25, startDate: '2025-02-05', sessionsCompleted: 10, status: 'Active', issues: ['OCD'] },
        { id: 'CL013', name: 'Hannah Lee', age: 28, startDate: '2025-02-20', sessionsCompleted: 8, status: 'Active', issues: ['Anxiety'] },
        { id: 'CL014', name: 'Marcus White', age: 33, startDate: '2025-03-01', sessionsCompleted: 6, status: 'Active', issues: ['Phobias'] }
      ]
    }
  ];

  const consultations = [
    {
      id: 'CONS001',
      clientName: 'Victoria James',
      clientAge: 29,
      clientEmail: 'victoria.j@email.com',
      tcName: 'Sarah Johnson',
      tcId: 'TC001',
      date: '2025-03-18',
      time: '10:00 AM',
      status: 'Upcoming',
      type: 'Initial Consultation',
      notes: 'Client prefers female counsellor'
    },
    {
      id: 'CONS002',
      clientName: 'Robert Davies',
      clientAge: 35,
      clientEmail: 'robert.d@email.com',
      tcName: 'David Chen',
      tcId: 'TC002',
      date: '2025-03-18',
      time: '2:00 PM',
      status: 'Upcoming',
      type: 'Initial Consultation',
      notes: 'Experience with trauma work preferred'
    },
    {
      id: 'CONS003',
      clientName: 'Alice Cooper',
      clientAge: 26,
      clientEmail: 'alice.c@email.com',
      tcName: 'Priya Patel',
      tcId: 'TC003',
      date: '2025-03-17',
      time: '1:00 PM',
      status: 'Completed',
      type: 'Initial Consultation',
      notes: 'Consultation went well, client agreed to proceed'
    }
  ];

  const pendingMatches = [
    {
      id: 'PM001',
      clientName: 'Charlotte Evans',
      clientAge: 30,
      clientEmail: 'charlotte.e@email.com',
      clientGender: 'Female',
      clientEthnicity: 'White',
      clientOrientation: 'Heterosexual',
      submittedDate: '2025-03-17',
      preferredModality: 'CBT',
      primaryIssues: ['Anxiety', 'Work Stress'],
      agePreference: 'No preference',
      genderPreference: 'Female',
      ethnicityPreference: 'No preference',
      orientationPreference: 'No preference',
      availability: ['Monday 10am-11am', 'Wednesday 1pm-4pm', 'Friday 10am-11am'],
      status: 'Pending Review',
      suggestedMatches: [
        {
          tcId: 'TC001',
          tcName: 'Sarah Johnson',
          matchScore: 92,
          breakdown: {
            availability: 95,
            modality: 100,
            age: 90,
            ethnicity: 80,
            orientation: 100,
            gender: 100
          },
          warnings: [],
          currentClients: 3,
          capacity: 6,
          clientsList: [
            { name: 'John Smith', age: 28 },
            { name: 'Emma Wilson', age: 31 },
            { name: 'Michael Brown', age: 35 }
          ]
        },
        {
          tcId: 'TC003',
          tcName: 'Priya Patel',
          matchScore: 88,
          breakdown: {
            availability: 85,
            modality: 100,
            age: 85,
            ethnicity: 80,
            orientation: 100,
            gender: 100
          },
          warnings: [],
          currentClients: 3,
          capacity: 6,
          clientsList: [
            { name: 'Oliver Smith', age: 25 },
            { name: 'Hannah Lee', age: 28 },
            { name: 'Marcus White', age: 33 }
          ]
        }
      ]
    },
    {
      id: 'PM002',
      clientName: 'Benjamin Clark',
      clientAge: 24,
      clientEmail: 'benjamin.c@email.com',
      clientGender: 'Male',
      clientEthnicity: 'Mixed',
      clientOrientation: 'Gay',
      submittedDate: '2025-03-16',
      preferredModality: 'Person-Centred',
      primaryIssues: ['Sexual Abuse', 'Low Self-esteem'],
      agePreference: '30+',
      genderPreference: 'No preference',
      ethnicityPreference: 'No preference',
      orientationPreference: 'LGBTQ+ friendly',
      availability: ['Tuesday 1pm-4pm', 'Thursday 11am-1pm'],
      status: 'Pending Review',
      suggestedMatches: [
        {
          tcId: 'TC002',
          tcName: 'David Chen',
          matchScore: 85,
          breakdown: {
            availability: 90,
            modality: 80,
            age: 95,
            ethnicity: 75,
            orientation: 85,
            gender: 85
          },
          warnings: [],
          currentClients: 5,
          capacity: 6,
          clientsList: [
            { name: 'Sophie Taylor', age: 29 },
            { name: 'James Wilson', age: 42 },
            { name: 'Rachel Green', age: 34 },
            { name: 'Tom Harris', age: 27 },
            { name: 'Nina Patel', age: 31 }
          ]
        },
        {
          tcId: 'TC001',
          tcName: 'Sarah Johnson',
          matchScore: 72,
          breakdown: {
            availability: 70,
            modality: 60,
            age: 80,
            ethnicity: 75,
            orientation: 80,
            gender: 70
          },
          warnings: ['⚠️ TC marked "Sexual Abuse" as not ready to handle'],
          currentClients: 3,
          capacity: 6,
          clientsList: [
            { name: 'John Smith', age: 28 },
            { name: 'Emma Wilson', age: 31 },
            { name: 'Michael Brown', age: 35 }
          ]
        }
      ]
    }
  ];

  const clientProgression = [
    {
      id: 'CL015',
      name: 'Alice Cooper',
      age: 26,
      tcName: 'Priya Patel',
      tcId: 'TC003',
      stages: [
        { name: 'Application Submitted', status: 'completed', date: '2025-03-10' },
        { name: 'Matched with TC', status: 'completed', date: '2025-03-12' },
        { name: 'Consultation Booked', status: 'completed', date: '2025-03-14' },
        { name: 'Consultation Completed', status: 'completed', date: '2025-03-17' },
        { name: 'Agreement Sent', status: 'current', date: '2025-03-17' },
        { name: 'Agreement Signed', status: 'pending', date: null },
        { name: 'Sessions Bookable', status: 'pending', date: null },
        { name: 'Active Therapy', status: 'pending', date: null }
      ]
    },
    {
      id: 'CL016',
      name: 'Victoria James',
      age: 29,
      tcName: 'Sarah Johnson',
      tcId: 'TC001',
      stages: [
        { name: 'Application Submitted', status: 'completed', date: '2025-03-15' },
        { name: 'Matched with TC', status: 'completed', date: '2025-03-16' },
        { name: 'Consultation Booked', status: 'completed', date: '2025-03-16' },
        { name: 'Consultation Completed', status: 'pending', date: null },
        { name: 'Agreement Sent', status: 'pending', date: null },
        { name: 'Agreement Signed', status: 'pending', date: null },
        { name: 'Sessions Bookable', status: 'pending', date: null },
        { name: 'Active Therapy', status: 'pending', date: null }
      ]
    }
  ];

  const stats = {
    totalTCs: trainingCounsellors.length,
    activeTCs: trainingCounsellors.filter(tc => tc.status === 'Active').length,
    totalActiveClients: trainingCounsellors.reduce((sum, tc) => sum + tc.activeClients, 0),
    pendingMatches: pendingMatches.length,
    upcomingConsultations: consultations.filter(c => c.status === 'Upcoming').length,
    totalCapacity: trainingCounsellors.reduce((sum, tc) => sum + tc.capacity, 0),
    availableSlots: trainingCounsellors.reduce((sum, tc) => sum + (tc.capacity - tc.activeClients), 0)
  };

  const StatCard = ({ icon: Icon, label, value, sublabel, color = '#6f1d56' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {sublabel && (
            <p className="text-xs text-gray-500 mt-2">{sublabel}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Logo & Toggle */}
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
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: 'overview', icon: Home, label: 'Overview' },
          { id: 'consultations', icon: Video, label: 'Consultations', badge: stats.upcomingConsultations },
          { id: 'matches', icon: UserCheck, label: 'Pending Matches', badge: stats.pendingMatches },
          { id: 'tcs', icon: Users, label: 'Training Counsellors' },
          { id: 'clients', icon: ClipboardList, label: 'Client Progression' },
          { id: 'activity', icon: Activity, label: 'Activity Log' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-purple-100 text-purple-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Settings & Logout */}
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
  );

  const MatchDetailModal = ({ match, onClose }) => {
    if (!match) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Match Details</h2>
              <p className="text-sm text-gray-600 mt-1">{match.clientName}, {match.clientAge} years old</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Client Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Client Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Primary Issues</p>
                  <div className="flex flex-wrap gap-2">
                    {match.primaryIssues.map(issue => (
                      <span key={issue} className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Preferred Modality</p>
                  <p className="text-sm font-medium text-gray-900">{match.preferredModality}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Gender Preference</p>
                  <p className="text-sm font-medium text-gray-900">{match.genderPreference}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Age Preference</p>
                  <p className="text-sm font-medium text-gray-900">{match.agePreference}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {match.availability.map(slot => (
                    <span key={slot} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Matches */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Training Counsellors</h3>
              <div className="space-y-4">
                {match.suggestedMatches.map(suggestion => (
                  <div key={suggestion.tcId} className={`border-2 rounded-xl p-6 ${
                    suggestion.warnings.length > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-gray-900">{suggestion.tcName}</h4>
                          <span className="text-3xl font-bold text-purple-600">{suggestion.matchScore}%</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Currently: {suggestion.currentClients}/{suggestion.capacity} clients</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            suggestion.currentClients >= suggestion.capacity
                              ? 'bg-red-100 text-red-800'
                              : suggestion.currentClients >= suggestion.capacity - 1
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {suggestion.currentClients >= suggestion.capacity
                              ? 'At Capacity'
                              : suggestion.currentClients >= suggestion.capacity - 1
                              ? 'Almost Full'
                              : 'Available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Warnings */}
                    {suggestion.warnings.length > 0 && (
                      <div className="mb-4 p-4 bg-orange-100 border border-orange-300 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-orange-900 mb-1">Important Notice</p>
                            {suggestion.warnings.map((warning, idx) => (
                              <p key={idx} className="text-sm text-orange-800">{warning}</p>
                            ))}
                            <p className="text-xs text-orange-700 mt-2">
                              This TC is still shown as a potential match but requires admin review and approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Current Clients List */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Current Clients:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {suggestion.clientsList.map((client, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{client.name}, {client.age}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Match Breakdown */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">Match Breakdown:</p>
                      {[
                        { label: 'Availability Match', value: suggestion.breakdown.availability, weight: 40 },
                        { label: 'Modality Match', value: suggestion.breakdown.modality, weight: 20 },
                        { label: 'Age Match', value: suggestion.breakdown.age, weight: 10 },
                        { label: 'Ethnicity Match', value: suggestion.breakdown.ethnicity, weight: 10 },
                        { label: 'Orientation Match', value: suggestion.breakdown.orientation, weight: 10 },
                        { label: 'Gender Match', value: suggestion.breakdown.gender, weight: 10 }
                      ].map(item => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{item.label} (Weight: {item.weight}%)</span>
                            <span className="font-semibold text-gray-900">{item.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${item.value}%`,
                                backgroundColor: item.value >= 80 ? '#10b981' : item.value >= 60 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Approve & Match
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                        View Full Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeView === 'overview' && 'Dashboard Overview'}
                {activeView === 'consultations' && 'Consultations'}
                {activeView === 'matches' && 'Pending Matches'}
                {activeView === 'tcs' && 'Training Counsellors'}
                {activeView === 'clients' && 'Client Progression'}
                {activeView === 'activity' && 'Activity Log'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-600">admin@vanquish.com</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  label="Active TCs"
                  value={stats.activeTCs}
                  sublabel={`${stats.totalTCs} total`}
                  color="#6f1d56"
                />
                <StatCard
                  icon={UserCheck}
                  label="Active Clients"
                  value={stats.totalActiveClients}
                  sublabel={`${stats.availableSlots} slots available`}
                  color="#10b981"
                />
                <StatCard
                  icon={Video}
                  label="Upcoming Consults"
                  value={stats.upcomingConsultations}
                  sublabel="Next 7 days"
                  color="#3b82f6"
                />
                <StatCard
                  icon={Clock}
                  label="Pending Matches"
                  value={stats.pendingMatches}
                  sublabel="Awaiting review"
                  color="#f59e0b"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveView('consultations')}
                  className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <Video className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900">View Consultations</h3>
                  <p className="text-sm text-gray-600 mt-1">{stats.upcomingConsultations} upcoming</p>
                </button>
                <button 
                  onClick={() => setActiveView('matches')}
                  className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                >
                  <UserCheck className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-900">Review Matches</h3>
                  <p className="text-sm text-gray-600 mt-1">{stats.pendingMatches} pending</p>
                </button>
                <button 
                  onClick={() => setActiveView('tcs')}
                  className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                >
                  <Users className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900">Manage TCs</h3>
                  <p className="text-sm text-gray-600 mt-1">{stats.activeTCs} active</p>
                </button>
              </div>

              {/* Today's Consultations Preview */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Consultations</h2>
                  <button 
                    onClick={() => setActiveView('consultations')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {consultations.filter(c => c.status === 'Upcoming').slice(0, 3).map(consult => (
                    <div key={consult.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Video className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{consult.clientName}</p>
                        <p className="text-sm text-gray-600">with {consult.tcName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{consult.time}</p>
                        <p className="text-xs text-gray-600">{consult.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Consultations View */}
          {activeView === 'consultations' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search consultations..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <select className="px-4 py-3 border border-gray-300 rounded-lg">
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                    <Plus className="w-5 h-5 inline mr-2" />
                    Book Consultation
                  </button>
                </div>
              </div>

              {/* Consultations List */}
              <div className="space-y-4">
                {consultations.map(consult => (
                  <div key={consult.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          consult.status === 'Upcoming' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <Video className={`w-8 h-8 ${
                            consult.status === 'Upcoming' ? 'text-blue-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{consult.clientName}, {consult.clientAge}</h3>
                          <p className="text-sm text-gray-600">{consult.clientEmail}</p>
                          <p className="text-sm text-gray-900 mt-2">
                            <strong>TC:</strong> {consult.tcName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          consult.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                          consult.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {consult.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-3">{consult.date}</p>
                        <p className="text-sm text-gray-600">{consult.time}</p>
                      </div>
                    </div>
                    {consult.notes && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-900">
                          <strong>Note:</strong> {consult.notes}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        View Details
                      </button>
                      {consult.status === 'Upcoming' && (
                        <>
                          <button className="flex-1 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                            Reschedule
                          </button>
                          <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Mark Completed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Matches View */}
          {activeView === 'matches' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Client Matches</h2>
                <div className="space-y-6">
                  {pendingMatches.map(match => (
                    <div key={match.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{match.clientName}, {match.clientAge}</h3>
                          <p className="text-sm text-gray-600">{match.clientEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">Submitted: {match.submittedDate}</p>
                        </div>
                        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          {match.status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Primary Issues</p>
                          <div className="flex flex-wrap gap-2">
                            {match.primaryIssues.map(issue => (
                              <span key={issue} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Preferred Modality</p>
                          <p className="text-sm font-medium text-gray-900">{match.preferredModality}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Top Matches ({match.suggestedMatches.length}):
                        </p>
                        <div className="space-y-3">
                          {match.suggestedMatches.slice(0, 2).map(suggestion => (
                            <div key={suggestion.tcId} className={`border rounded-lg p-4 ${
                              suggestion.warnings.length > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl font-bold text-purple-600">{suggestion.matchScore}%</span>
                                  <div>
                                    <p className="font-semibold text-gray-900">{suggestion.tcName}</p>
                                    <p className="text-xs text-gray-600">
                                      {suggestion.currentClients}/{suggestion.capacity} clients
                                    </p>
                                  </div>
                                </div>
                                {suggestion.warnings.length > 0 && (
                                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                                )}
                              </div>
                              
                              {suggestion.warnings.length > 0 && (
                                <div className="text-xs text-orange-800 mb-2">
                                  {suggestion.warnings[0]}
                                </div>
                              )}
                              
                              <div className="text-xs text-gray-600">
                                <strong>Current clients:</strong> {suggestion.clientsList.map(c => `${c.name} (${c.age})`).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => setSelectedMatch(match)}
                          className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                        >
                          View Full Match Details
                        </button>
                        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          Contact Client
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Training Counsellors View */}
          {activeView === 'tcs' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search TCs..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                    <Plus className="w-5 h-5 inline mr-2" />
                    Add TC
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainingCounsellors.map(tc => (
                    <div key={tc.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-lg">
                              {tc.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{tc.name}</h3>
                            <p className="text-xs text-gray-600">{tc.age} years old</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tc.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <p className="text-lg font-bold text-purple-900">{tc.totalClients}</p>
                          <p className="text-xs text-purple-600">Total</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-lg font-bold text-blue-900">{tc.activeClients}</p>
                          <p className="text-xs text-blue-600">Active</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-900">{tc.capacity - tc.activeClients}</p>
                          <p className="text-xs text-green-600">Available</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Current Clients:</p>
                        <div className="space-y-1">
                          {tc.currentClients.slice(0, 3).map(client => (
                            <div key={client.id} className="flex items-center gap-2 text-xs text-gray-600">
                              <User className="w-3 h-3" />
                              <span>{client.name}, {client.age}</span>
                            </div>
                          ))}
                          {tc.currentClients.length > 3 && (
                            <p className="text-xs text-gray-500">+{tc.currentClients.length - 3} more</p>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedTC(tc)}
                        className="w-full py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm"
                      >
                        View Full Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Client Progression View */}
          {activeView === 'clients' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Client Journey Tracking</h2>
                <div className="space-y-6">
                  {clientProgression.map(client => (
                    <div key={client.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{client.name}, {client.age}</h3>
                          <p className="text-sm text-gray-600">Matched with: {client.tcName}</p>
                        </div>
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {client.stages.find(s => s.status === 'current')?.name}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-4">
                          {client.stages.map((stage, idx) => (
                            <div key={idx} className="relative flex items-start gap-4">
                              <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                                stage.status === 'completed' ? 'bg-green-100' :
                                stage.status === 'current' ? 'bg-blue-100' :
                                'bg-gray-100'
                              }`}>
                                {stage.status === 'completed' && <CheckCircle className="w-6 h-6 text-green-600" />}
                                {stage.status === 'current' && <PlayCircle className="w-6 h-6 text-blue-600" />}
                                {stage.status === 'pending' && <Clock className="w-6 h-6 text-gray-400" />}
                              </div>
                              <div className="flex-1 pt-2">
                                <p className={`font-medium ${
                                  stage.status === 'completed' ? 'text-gray-900' :
                                  stage.status === 'current' ? 'text-blue-900' :
                                  'text-gray-500'
                                }`}>
                                  {stage.name}
                                </p>
                                {stage.date && (
                                  <p className="text-xs text-gray-600 mt-1">{stage.date}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                          Progress to Next Stage
                        </button>
                        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Log */}
          {activeView === 'activity' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { type: 'match', text: 'New match created: Alice Cooper → Priya Patel', time: '2 hours ago', color: 'green' },
                  { type: 'consultation', text: 'Consultation completed: Victoria James with Sarah Johnson', time: '3 hours ago', color: 'blue' },
                  { type: 'progress', text: 'Client progressed to Agreement stage: Benjamin Clark', time: '5 hours ago', color: 'purple' },
                  { type: 'tc', text: 'New TC application received: Marcus Thompson', time: '1 day ago', color: 'orange' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${activity.color}-100`}>
                      <Activity className={`w-5 h-5 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedMatch && <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </div>
  );
}