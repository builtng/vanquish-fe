"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import apiService from '@/lib/api';
import {
  MessageSquare,
  Calendar,
  Users,
  Bell,
  Send,
  Mail,
  Clock,
  User,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function CounsellorPortalPage() {
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counsellorData, setCounsellorData] = useState(null);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages', 'clients', 'sessions'
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (!authUser || authUser.role !== 'counsellor') {
      showError('Unauthorized. Counsellor access required.');
      return;
    }
    loadCounsellorData();
    loadMessages();
    loadUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadMessages();
      loadUnreadCount();
      loadCounsellorData();
    }, 30000);
    return () => clearInterval(interval);
  }, [authUser]);

  const loadCounsellorData = async () => {
    try {
      const data = await apiService.getCounsellorOwnData();
      setCounsellorData(data);
    } catch (err) {
      console.error('Error loading counsellor data:', err);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await apiService.getMessages({ per_page: 50 });
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadMessageCount();
      setUnreadCount(response.count || 0);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      try {
        await apiService.markMessageAsRead(message.id);
        message.is_read = true;
        message.read_at = new Date().toISOString();
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageForm.subject || !messageForm.message) {
      showError('Please fill in both subject and message');
      return;
    }

    try {
      await apiService.sendMessageToStaff(messageForm);
      success('Message sent successfully to admin team!');
      setShowMessageModal(false);
      setMessageForm({ subject: '', message: '' });
    } catch (err) {
      showError(err.message || 'Failed to send message');
    }
  };

  if (!authUser || authUser.role !== 'counsellor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need counsellor privileges to access this portal.</p>
        </div>
      </div>
    );
  }

  const unreadMessages = messages.filter((m) => !m.is_read);
  const readMessages = messages.filter((m) => m.is_read);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Counsellor Portal</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {authUser.name}</p>
            </div>
            <button
              onClick={() => setShowMessageModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'clients'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  My Clients
                  {counsellorData?.total_clients > 0 && (
                    <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                      {counsellorData.total_clients}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sessions'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming Sessions
                  {counsellorData?.upcoming_consultations?.length > 0 && (
                    <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                      {counsellorData.upcoming_consultations.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Unread Messages Alert */}
        {unreadCount > 0 && activeTab === 'messages' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-blue-700">Click on a message below to read it</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages from Staff
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Unread Messages */}
              {unreadMessages.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">Unread ({unreadMessages.length})</h3>
                  </div>
                  {unreadMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleViewMessage(message)}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>From: {message.from_user?.name || 'Staff'}</span>
                            <span>
                              {new Date(message.created_at).toLocaleDateString()} at{' '}
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Read Messages */}
              {readMessages.length > 0 && (
                <div>
                  {unreadMessages.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700">Read ({readMessages.length})</h3>
                    </div>
                  )}
                  {readMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleViewMessage(message)}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-700">{message.subject}</h4>
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>From: {message.from_user?.name || 'Staff'}</span>
                            <span>
                              {new Date(message.created_at).toLocaleDateString()} at{' '}
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Assigned Clients
              </h2>
            </div>
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading clients...</div>
            ) : !counsellorData?.clients || counsellorData.clients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No clients assigned yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {counsellorData.clients.map((client) => (
                  <div key={client.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{client.name}</h4>
                        {client.age && <p className="text-sm text-gray-600">Age: {client.age}</p>}
                        {client.primary_issues && client.primary_issues.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {client.primary_issues.map((issue, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        )}
                        {client.stage && (
                          <p className="text-xs text-gray-500 mt-2">Stage: {client.stage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Sessions
              </h2>
            </div>
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading sessions...</div>
            ) : !counsellorData?.upcoming_consultations || counsellorData.upcoming_consultations.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming sessions scheduled</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {counsellorData.upcoming_consultations.map((consultation) => (
                  <div key={consultation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {consultation.client?.name || 'Client'}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(consultation.scheduled_at).toLocaleDateString('en-GB', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(consultation.scheduled_at).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        {consultation.notes && (
                          <p className="text-sm text-gray-600 mt-2">{consultation.notes}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Message Modal */}
      {selectedMessage && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedMessage(null)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>
                      <strong>From:</strong> {selectedMessage.from_user?.name || 'Staff'}
                    </span>
                    <span>
                      <strong>Date:</strong>{' '}
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedMessage.related_client && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-900">
                        <strong>Related to client:</strong> {selectedMessage.related_client.name}
                      </p>
                    </div>
                  )}
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMessageModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Send Message to Staff</h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter message subject"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your message"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
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

