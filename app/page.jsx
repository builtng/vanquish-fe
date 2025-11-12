"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Calendar, Clock, CheckCircle, AlertCircle, Search, BarChart3, Settings, ChevronDown, ChevronUp, X, Check, AlertTriangle, Menu, Home, UserCheck, FileText, DollarSign, Bell, LogOut, Plus } from 'lucide-react';

export default function VanquishAdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('pending-matches');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expandedConsultant, setExpandedConsultant] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white font-bold text-2xl mb-4 animate-pulse" style={{ backgroundColor: "#6f1d56" }}>
            VT
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;

  // Mock data
  const pendingBookings = [
    {
      id: 'BK001',
      clientName: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      ethnicity: 'Asian',
      orientation: 'Heterosexual',
      issues: ['Anxiety Disorders', 'Depression'],
      modality: 'CBT - Cognitive Behavioral Therapy',
      selectedDay: 'Monday',
      selectedTimeBlock: 'afternoon',
      paymentStatus: 'Paid',
      amount: '£85',
      bookedAt: '2 hours ago',
      preferences: {
        gender: 'No preference',
        age: 'No preference',
        ethnicity: 'Prefer same',
        orientation: 'No preference'
      },
      suggestedConsultants: [
        { 
          name: 'Dr. Lisa Chen', 
          age: 35,
          gender: 'Female',
          ethnicity: 'Asian',
          orientation: 'Heterosexual',
          lgbtqSpecialist: false,
          matchScore: 96, 
          specialties: 'CBT, Anxiety', 
          available: true, 
          experience: '8 years',
          notReadyFor: ['Sexual Abuse'],
          matching: {
            availability: { match: true, reason: 'Available Monday afternoon' },
            modality: { match: true, reason: 'Specializes in CBT' },
            gender: { match: true, reason: 'Female (no preference specified)' },
            ethnicity: { match: true, reason: 'Asian (client prefers same ethnicity)', weight: 'High Priority' },
            orientation: { match: true, reason: 'No preference required' },
            age: { match: true, reason: 'Age 35 (no preference specified)' },
            sensitiveTopics: { match: true, reason: 'Ready to handle all client issues' }
          }
        },
        { 
          name: 'Dr. Priya Patel', 
          age: 38,
          gender: 'Female',
          ethnicity: 'Asian',
          orientation: 'Bisexual',
          lgbtqSpecialist: true,
          matchScore: 94, 
          specialties: 'CBT, Depression', 
          available: true, 
          experience: '5 years',
          notReadyFor: ['Domestic Violence'],
          matching: {
            availability: { match: true, reason: 'Available Monday afternoon' },
            modality: { match: true, reason: 'Specializes in CBT' },
            gender: { match: true, reason: 'Female (no preference specified)' },
            ethnicity: { match: true, reason: 'Asian (client prefers same ethnicity)', weight: 'High Priority' },
            orientation: { match: true, reason: 'No preference required' },
            age: { match: true, reason: 'Age 38 (no preference specified)' },
            sensitiveTopics: { match: true, reason: 'Ready to handle all client issues' }
          }
        },
        { 
          name: 'Dr. James Wilson', 
          age: 45,
          gender: 'Male',
          ethnicity: 'White',
          orientation: 'Heterosexual',
          lgbtqSpecialist: false,
          matchScore: 78, 
          specialties: 'CBT, Trauma', 
          available: true, 
          experience: '12 years',
          notReadyFor: ['Eating Disorders'],
          matching: {
            availability: { match: true, reason: 'Available Monday afternoon' },
            modality: { match: true, reason: 'Specializes in CBT' },
            gender: { match: true, reason: 'Male (no preference specified)' },
            ethnicity: { match: false, reason: 'White (client prefers same ethnicity - Asian)', weight: 'High Priority Mismatch' },
            orientation: { match: true, reason: 'No preference required' },
            age: { match: true, reason: 'Age 45 (no preference specified)' },
            sensitiveTopics: { match: true, reason: 'Ready to handle all client issues' }
          }
        }
      ]
    },
    {
      id: 'BK002',
      clientName: 'Michael Brown',
      age: 28,
      gender: 'Male',
      ethnicity: 'Black',
      orientation: 'Gay',
      issues: ['Relationship Issues', 'Identity Issues', 'Anxiety Disorders'],
      modality: 'Person-Centered Therapy',
      selectedDay: 'Wednesday',
      selectedTimeBlock: 'morning',
      paymentStatus: 'Paid',
      amount: '£95',
      bookedAt: '5 hours ago',
      preferences: {
        gender: 'No preference',
        age: '25-35',
        ethnicity: 'No preference',
        orientation: 'Prefer LGBTQ+ specialist'
      },
      suggestedConsultants: [
        { 
          name: 'Alex Martinez', 
          age: 31,
          gender: 'Non-binary',
          ethnicity: 'Hispanic',
          orientation: 'Queer',
          lgbtqSpecialist: true,
          matchScore: 95, 
          specialties: 'Person-Centered, LGBTQ+', 
          available: true, 
          experience: '6 years',
          notReadyFor: ['Substance Abuse'],
          matching: {
            availability: { match: true, reason: 'Available Wednesday morning' },
            modality: { match: true, reason: 'Specializes in Person-Centered Therapy' },
            gender: { match: true, reason: 'Non-binary (no preference specified)' },
            ethnicity: { match: true, reason: 'No preference required' },
            orientation: { match: true, reason: 'LGBTQ+ specialist (client preferred)', weight: 'High Priority' },
            age: { match: true, reason: 'Age 31 (within client range 25-35)', weight: 'Medium Priority' },
            sensitiveTopics: { match: true, reason: 'Ready to handle all client issues' }
          }
        }
      ]
    },
    {
      id: 'BK003',
      clientName: 'Emma Davis',
      age: 45,
      gender: 'Female',
      ethnicity: 'White',
      orientation: 'Bisexual',
      issues: ['Sexual Abuse', 'Trauma/PTSD', 'Depression'],
      modality: 'Psychodynamic Therapy',
      selectedDay: 'Thursday',
      selectedTimeBlock: 'evening',
      paymentStatus: 'Paid',
      amount: '£110',
      bookedAt: '1 day ago',
      preferences: {
        gender: 'Prefer Female',
        age: '40-55',
        ethnicity: 'No preference',
        orientation: 'No preference'
      },
      suggestedConsultants: [
        { 
          name: 'Dr. Rachel Green', 
          age: 48,
          gender: 'Female',
          ethnicity: 'White',
          orientation: 'Heterosexual',
          lgbtqSpecialist: false,
          matchScore: 93, 
          specialties: 'Psychodynamic, Relationships', 
          available: true, 
          experience: '15 years',
          notReadyFor: ['Eating Disorders'],
          matching: {
            availability: { match: true, reason: 'Available Thursday evening' },
            modality: { match: true, reason: 'Specializes in Psychodynamic Therapy' },
            gender: { match: true, reason: 'Female (client preferred)', weight: 'Medium Priority' },
            ethnicity: { match: true, reason: 'No preference required' },
            orientation: { match: true, reason: 'No preference required' },
            age: { match: true, reason: 'Age 48 (within client range 40-55)', weight: 'Medium Priority' },
            sensitiveTopics: { match: true, reason: 'Ready to handle all client issues' }
          }
        },
        { 
          name: 'Dr. Thomas Anderson', 
          age: 58,
          gender: 'Male',
          ethnicity: 'White',
          orientation: 'Heterosexual',
          lgbtqSpecialist: false,
          matchScore: 75, 
          specialties: 'Psychodynamic, Trauma', 
          available: true, 
          experience: '20 years',
          notReadyFor: ['Sexual Abuse', 'Child Abuse'],
          matching: {
            availability: { match: true, reason: 'Available Thursday evening' },
            modality: { match: true, reason: 'Specializes in Psychodynamic Therapy' },
            gender: { match: false, reason: 'Male (client prefers Female)', weight: 'Medium Priority Mismatch' },
            ethnicity: { match: true, reason: 'No preference required' },
            orientation: { match: true, reason: 'No preference required' },
            age: { match: false, reason: 'Age 58 (outside client range 40-55)', weight: 'Low Impact' },
            sensitiveTopics: { match: false, reason: 'NOT ready for: Sexual Abuse (client has this issue)', weight: 'CRITICAL FLAG' }
          }
        }
      ]
    }
  ];

  const stats = {
    pendingMatches: 3,
    completedToday: 5,
    totalRevenue: '£425',
    activeConsultants: 12
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pending-matches', label: 'Pending Matches', icon: AlertCircle, badge: stats.pendingMatches },
    { id: 'completed-matches', label: 'Completed Matches', icon: CheckCircle },
    { id: 'consultants', label: 'Manage Consultants', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleConsultant = (index) => {
    setExpandedConsultant(expandedConsultant === index ? null : index);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Logo & Toggle */}
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold">Vanquish</h1>
              <p className="text-xs text-gray-400">Admin Portal</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              AD
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-gray-400 truncate">admin@vanquish.com</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button className="w-full mt-3 flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage your therapy matching system</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent w-64"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <div className="p-8">
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.pendingMatches}</span>
                  </div>
                  <p className="text-sm text-gray-600">Pending Matches</p>
                  <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.completedToday}</span>
                  </div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully matched</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.totalRevenue}</span>
                  </div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-xs text-gray-500 mt-1">From bookings</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.activeConsultants}</span>
                  </div>
                  <p className="text-sm text-gray-600">Active Consultants</p>
                  <p className="text-xs text-gray-500 mt-1">Available for booking</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setCurrentPage('pending-matches')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-left"
                  >
                    <AlertCircle className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-900">Review Pending</p>
                    <p className="text-sm text-gray-500">Match clients now</p>
                  </button>
                  <button 
                    onClick={() => setCurrentPage('consultants')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-left"
                  >
                    <Users className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-900">Manage TCs</p>
                    <p className="text-sm text-gray-500">View consultants</p>
                  </button>
                  <button 
                    onClick={() => setCurrentPage('reports')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-left"
                  >
                    <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-500">Analytics dashboard</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Matches Page */}
          {currentPage === 'pending-matches' && (
            <div className="p-8">
              <div className="flex gap-8 h-full">
                {/* Bookings List - Left Side */}
                <div className="w-96 flex-shrink-0">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">New Bookings</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                        {pendingBookings.length} pending
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                      {pendingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setExpandedConsultant(null);
                          }}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedBooking?.id === booking.id
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-purple-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{booking.clientName}</h4>
                              <p className="text-xs text-gray-500">{booking.id}</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              PAID
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="capitalize font-medium">{booking.selectedDay} {booking.selectedTimeBlock}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{booking.modality}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{booking.issues.length} concern(s)</span>
                            <span className="text-gray-500">{booking.bookedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Details - Right Side */}
                <div className="flex-1">
                  {selectedBooking ? (
                    <div className="space-y-6">
                      {/* Client Info Card */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                        <div className="grid grid-cols-3 gap-6 mb-6">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Full Name</p>
                            <p className="font-semibold text-gray-900">{selectedBooking.clientName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Age & Gender</p>
                            <p className="font-semibold text-gray-900">{selectedBooking.age} • {selectedBooking.gender}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Payment</p>
                            <p className="font-semibold text-green-600">{selectedBooking.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Ethnicity</p>
                            <p className="font-semibold text-gray-900">{selectedBooking.ethnicity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Orientation</p>
                            <p className="font-semibold text-gray-900">{selectedBooking.orientation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                            <p className="font-semibold text-gray-900">{selectedBooking.id}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Session Schedule</p>
                            <div className="flex items-center gap-2 bg-purple-50 px-4 py-3 rounded-lg">
                              <Clock className="w-5 h-5 text-purple-600" />
                              <div>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {selectedBooking.selectedDay}s • {selectedBooking.selectedTimeBlock}
                                </p>
                                <p className="text-xs text-gray-600">Recurring weekly</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Therapy Type</p>
                            <div className="bg-blue-50 px-4 py-3 rounded-lg">
                              <p className="font-semibold text-gray-900">{selectedBooking.modality}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 mt-6">
                          <p className="text-xs text-gray-500 mb-3">Primary Concerns</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedBooking.issues.map((issue, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 mt-6">
                          <p className="text-xs text-gray-500 mb-3">Client Preferences</p>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <p className="text-xs text-gray-600 mb-0.5">Gender</p>
                              <p className="text-sm font-medium text-gray-900">{selectedBooking.preferences.gender}</p>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <p className="text-xs text-gray-600 mb-0.5">Age</p>
                              <p className="text-sm font-medium text-gray-900">{selectedBooking.preferences.age}</p>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <p className="text-xs text-gray-600 mb-0.5">Ethnicity</p>
                              <p className="text-sm font-medium text-gray-900">{selectedBooking.preferences.ethnicity}</p>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <p className="text-xs text-gray-600 mb-0.5">Orientation</p>
                              <p className="text-sm font-medium text-gray-900">{selectedBooking.preferences.orientation}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Suggested Consultants */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Consultants</h3>
                        <div className="space-y-4">
                          {selectedBooking.suggestedConsultants.map((consultant, index) => {
                            const hasCriticalFlag = Object.values(consultant.matching).some(
                              m => m.weight === 'CRITICAL FLAG'
                            );
                            
                            return (
                              <div key={index} className={`border-2 rounded-xl overflow-hidden transition-all ${
                                hasCriticalFlag ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                              }`}>
                                <div className="p-5">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 flex-wrap mb-2">
                                        <h5 className="text-lg font-semibold text-gray-900">{consultant.name}</h5>
                                        <span className={`px-3 py-1 text-sm font-bold rounded-lg ${
                                          consultant.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                                          consultant.matchScore >= 80 ? 'bg-blue-100 text-blue-700' :
                                          'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {consultant.matchScore}% Match
                                        </span>
                                        {consultant.lgbtqSpecialist && (
                                          <span className="px-3 py-1 text-sm font-medium rounded-lg bg-purple-100 text-purple-700">
                                            LGBTQ+ Specialist
                                          </span>
                                        )}
                                        {hasCriticalFlag && (
                                          <span className="px-3 py-1 text-sm font-bold rounded-lg bg-red-100 text-red-700 flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4" />
                                            CRITICAL FLAG
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mb-1">{consultant.specialties}</p>
                                      <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{consultant.experience}</span>
                                        <span>•</span>
                                        <span>{consultant.age} yrs • {consultant.gender}</span>
                                        <span>•</span>
                                        <span>{consultant.ethnicity}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => toggleConsultant(index)}
                                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                  >
                                    {expandedConsultant === index ? (
                                      <>
                                        <ChevronUp className="w-4 h-4" />
                                        Hide Details
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-4 h-4" />
                                        View Match Breakdown
                                      </>
                                    )}
                                  </button>
                                </div>

                                {expandedConsultant === index && (
                                  <div className="bg-gray-50 px-5 py-4 border-t-2 border-gray-200">
                                    <h6 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                      Match Analysis - 7 Criteria
                                    </h6>
                                    <div className="grid grid-cols-2 gap-4">
                                      {Object.entries(consultant.matching).map(([criterion, details]) => (
                                        <div key={criterion} className="bg-white rounded-lg p-3 border border-gray-200">
                                          <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                              {details.match ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                              ) : (
                                                details.weight === 'CRITICAL FLAG' ? (
                                                  <AlertTriangle className="w-5 h-5 text-red-600" />
                                                ) : (
                                                  <X className="w-5 h-5 text-red-600" />
                                                )
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between gap-2 mb-1">
                                                <span className="font-semibold text-sm text-gray-900 capitalize">
                                                  {criterion.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                {details.weight && (
                                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                                                    details.weight === 'CRITICAL FLAG'
                                                      ? 'bg-red-100 text-red-700'
                                                      : details.weight.includes('High') 
                                                      ? details.match ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                      : details.weight.includes('Medium')
                                                      ? 'bg-orange-100 text-orange-700'
                                                      : 'bg-gray-100 text-gray-600'
                                                  }`}>
                                                    {details.weight}
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-xs text-gray-600">{details.reason}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {consultant.notReadyFor.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">TC Not Ready For:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {consultant.notReadyFor.map((topic, idx) => {
                                            const isClientIssue = selectedBooking.issues.includes(topic);
                                            return (
                                              <span 
                                                key={idx} 
                                                className={`px-3 py-1 text-xs rounded-lg font-medium ${
                                                  isClientIssue 
                                                    ? 'bg-red-100 text-red-700 font-bold' 
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                              >
                                                {topic} {isClientIssue && '⚠️'}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="p-5 pt-0">
                                  <button 
                                    className={`w-full mt-4 px-6 py-3 rounded-lg transition-colors text-sm font-bold ${
                                      hasCriticalFlag
                                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                    }`}
                                  >
                                    {hasCriticalFlag ? '⚠️ Assign Anyway (Override Warning)' : `✓ Assign ${consultant.name.split(' ')[0]} to Client`}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center h-full">
                      <div className="text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Booking Selected</h3>
                        <p className="text-gray-500">Select a booking from the list to view details and suggested consultants</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other Pages Placeholder */}
          {currentPage !== 'dashboard' && currentPage !== 'pending-matches' && (
            <div className="p-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {navigationItems.find(item => item.id === currentPage)?.icon && 
                    React.createElement(navigationItems.find(item => item.id === currentPage).icon, {
                      className: "w-8 h-8 text-purple-600"
                    })
                  }
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {navigationItems.find(item => item.id === currentPage)?.label}
                </h3>
                <p className="text-gray-500">This page is under construction</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}