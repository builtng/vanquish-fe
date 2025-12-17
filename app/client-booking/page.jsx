"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import apiService from '@/lib/api';
import { formatTimeSlotDisplay } from '@/lib/timeFormatter';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  ChevronRight,
  X,
  Send,
} from 'lucide-react';

function ClientBookingContent() {
  const searchParams = useSearchParams();
  const clientUuid = searchParams.get('uuid');

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [email, setEmail] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState(null); // 'block' or 'single'
  const [selectedDate, setSelectedDate] = useState('');
  const [sessionsCount, setSessionsCount] = useState(4);

  useEffect(() => {
    if (clientUuid) {
      // Try to authenticate with UUID
      handleAuthenticate();
    } else {
      setLoading(false);
    }
  }, [clientUuid]);

  const handleAuthenticate = async (e) => {
    if (e) e.preventDefault();
    
    if (!email && !clientUuid) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.authenticateClientBooking(email, clientUuid);
      
      if (data.client) {
        setClientData(data);
        setAuthenticated(true);
      } else {
        setError(data.message || 'Unable to authenticate. Please check your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookBlock = async () => {
    if (!selectedDate) {
      setError('Please select a start date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiService.bookBlock({
        client_uuid: clientData.client.uuid,
        start_date: selectedDate,
        sessions_count: sessionsCount,
      });

      toast.success(`Successfully booked ${sessionsCount} sessions!`);
      setShowBookingModal(false);
      
      // Refresh data
      const updatedData = await apiService.getClientBookingStatus(clientData.client.uuid);
      setClientData(updatedData);
    } catch (err) {
      setError(err.message || 'Failed to book sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <Calendar className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Book Your Sessions</h1>
            <p className="text-gray-600 mt-2">Enter your email to access your booking portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  const client = clientData?.client;
  const upcomingSessions = clientData?.upcoming_sessions || [];
  const nextSessionNeedingBooking = clientData?.next_session_needing_booking;
  const daysUntilDeadline = client?.days_until_deadline;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Your Sessions</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {client?.name}</p>
            </div>
            <button
              onClick={() => {
                setAuthenticated(false);
                setClientData(null);
                setEmail('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Booking Deadline Alert (Low Cost) */}
        {client?.service_type === 'Low Cost' && client?.next_booking_deadline && (
          <div className={`mb-6 rounded-lg p-4 border-2 ${
            daysUntilDeadline !== null && daysUntilDeadline <= 2
              ? 'bg-red-50 border-red-300'
              : daysUntilDeadline !== null && daysUntilDeadline <= 7
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                daysUntilDeadline !== null && daysUntilDeadline <= 2
                  ? 'text-red-600'
                  : daysUntilDeadline !== null && daysUntilDeadline <= 7
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Booking Deadline: {new Date(client.next_booking_deadline).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {daysUntilDeadline !== null && daysUntilDeadline <= 0
                    ? 'Your booking deadline has passed. Please book immediately.'
                    : daysUntilDeadline !== null && daysUntilDeadline <= 2
                    ? `⚠️ Only ${daysUntilDeadline} day(s) remaining! Book now to secure 4 sessions.`
                    : daysUntilDeadline !== null
                    ? `You have ${daysUntilDeadline} day(s) to book your next block of sessions.`
                    : 'Please book your next block of sessions.'}
                </p>
                <p className="text-xs text-gray-600">
                  {daysUntilDeadline !== null && daysUntilDeadline <= 0
                    ? 'If you don\'t book now, you will automatically receive 3 sessions instead of 4 (same price).'
                    : 'If you don\'t book in time, you will automatically receive 3 sessions instead of 4 (same price).'}
                </p>
                {client?.service_type === 'Low Cost' && (
                  <button
                    onClick={() => {
                      setBookingType('block');
                      setShowBookingModal(true);
                    }}
                    className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Book Next Block
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Service Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service Type</p>
              <p className="font-medium text-gray-900">{client?.service_type}</p>
            </div>
            {client?.allocated_day && (
              <div>
                <p className="text-sm text-gray-600">Allocated Day & Time</p>
                <p className="font-medium text-gray-900">
                  {client.allocated_day} {formatTimeSlotDisplay(client.allocated_time)}
                </p>
              </div>
            )}
            {client?.matched_tc && (
              <div>
                <p className="text-sm text-gray-600">Your Counsellor</p>
                <p className="font-medium text-gray-900">{client.matched_tc.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
            {client?.service_type !== 'Low Cost' && (
              <button
                onClick={() => {
                  setBookingType('single');
                  setShowBookingModal(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Session
              </button>
            )}
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">
                          {formatDate(session.scheduled_at)}
                        </h3>
                      </div>
                      {session.is_block_booking && (
                        <p className="text-sm text-gray-600">
                          Session {session.block_number} of {session.total_sessions_in_block}
                        </p>
                      )}
                      {session.status === 'scheduled' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowBookingModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {bookingType === 'block' ? 'Book Block of Sessions' : 'Book Session'}
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                {bookingType === 'block' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Sessions will be scheduled weekly on {client?.allocated_day} at {formatTimeSlotDisplay(client?.allocated_time)}
                      </p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Sessions
                      </label>
                      <select
                        value={sessionsCount}
                        onChange={(e) => setSessionsCount(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value={4}>4 sessions (Full block)</option>
                        <option value={3}>3 sessions (Auto-deduction applied)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Same price for 3 or 4 sessions
                      </p>
                    </div>
                  </>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={bookingType === 'block' ? handleBookBlock : () => {}}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Book {bookingType === 'block' ? `${sessionsCount} Sessions` : 'Session'}
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

export default function ClientBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ClientBookingContent />
    </Suspense>
  );
}

