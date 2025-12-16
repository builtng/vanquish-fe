"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import apiService from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { formatName, getCounsellorPrefixType } from '@/lib/nameFormatter';
import SearchableSelect from '@/components/SearchableSelect';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Users, Search, Filter, ChevronDown, MoreVertical, Eye,
  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,
  CheckCircle, Clock, AlertTriangle, Video, FileText,
  UserCheck, Activity, ChevronRight, MapPin, User,
  Building2, RefreshCw, Plus, CalendarDays, UserPlus
} from 'lucide-react';

export default function InductionsPage() {
  const pathname = usePathname();
  const { success, error: showError } = useToast();
  const [inductions, setInductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddAttendeesModal, setShowAddAttendeesModal] = useState(false);
  const [selectedInduction, setSelectedInduction] = useState(null);
  const [trainingCounsellors, setTrainingCounsellors] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    tc_id: '',
    scheduled_at: '',
    location: '',
    notes: '',
    attendee_tc_ids: [],
  });

  useEffect(() => {
    fetchInductions();
    fetchTrainingCounsellors();
  }, []);

  const fetchInductions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInductions({ upcoming: true });
      setInductions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching inductions:', err);
      setError('Failed to load inductions. Please try again.');
      showError('Failed to load inductions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingCounsellors = async () => {
    try {
      const data = await apiService.getTrainingCounsellors({ status: 'Active' });
      setTrainingCounsellors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching training counsellors:', err);
    }
  };

  const handleCreateInduction = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      if (!createForm.tc_id || !createForm.scheduled_at || createForm.attendee_tc_ids.length === 0) {
        showError('Please fill in all required fields and select at least one attendee.');
        setActionLoading(false);
        return;
      }

      await apiService.createInduction(createForm);
      success('Induction created successfully! Invitation emails have been sent.');
      setShowCreateModal(false);
      setCreateForm({
        tc_id: '',
        scheduled_at: '',
        location: '',
        notes: '',
        attendee_tc_ids: [],
      });
      fetchInductions();
    } catch (err) {
      console.error('Error creating induction:', err);
      showError(err.message || 'Failed to create induction. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAttendees = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      if (!selectedInduction || createForm.attendee_tc_ids.length === 0) {
        showError('Please select at least one attendee.');
        setActionLoading(false);
        return;
      }

      await apiService.addInductionAttendees(selectedInduction.uuid || selectedInduction.id, createForm.attendee_tc_ids);
      success('Attendees added successfully! Invitation emails have been sent.');
      setShowAddAttendeesModal(false);
      setSelectedInduction(null);
      setCreateForm({
        tc_id: '',
        scheduled_at: '',
        location: '',
        notes: '',
        attendee_tc_ids: [],
      });
      fetchInductions();
    } catch (err) {
      console.error('Error adding attendees:', err);
      showError(err.message || 'Failed to add attendees. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled':
        return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">Scheduled</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">Cancelled</span>;
      default:
        return null;
    }
  };

  const getAttendeeStatusBadge = (status) => {
    switch(status) {
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">Accepted</span>;
      case 'declined':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">Declined</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">Expired</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">Pending</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          actions={
            <>
              <button
                onClick={fetchInductions}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-opacity"
                style={{ backgroundColor: '#6f1d56' }}
              >
                <Plus className="w-4 h-4" />
                Create Induction
              </button>
            </>
          }
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Inductions</h1>
            <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">Manage induction sessions for trainee counsellors</p>
          </div>
        </DashboardHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
          {loading && inductions.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 dark:text-[var(--text-tertiary)] animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">Loading inductions...</p>
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
                    onClick={fetchInductions}
                    className="text-sm text-red-700 dark:text-red-300 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && inductions.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-2">No Inductions Found</h3>
              <p className="text-gray-600 dark:text-[var(--text-secondary)] mb-4">Create your first induction session</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium transition-opacity"
                style={{ backgroundColor: '#6f1d56' }}
              >
                Create Induction
              </button>
            </div>
          )}

          {!loading && inductions.length > 0 && (
            <div className="space-y-4">
              {inductions.map(induction => (
                <div key={induction.id} className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                          Induction Session
                        </h3>
                        {getStatusBadge(induction.status)}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span><strong>Conducted by:</strong> {formatName(induction.training_counsellor?.name || 'Unknown', getCounsellorPrefixType(induction.training_counsellor?.counsellor_type))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span><strong>Date & Time:</strong> {formatDateTime(induction.scheduled_at)}</span>
                        </div>
                        {induction.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span><strong>Location:</strong> {induction.location}</span>
                          </div>
                        )}
                        {induction.notes && (
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-[var(--hover-bg)] rounded-lg">
                            <p><strong>Notes:</strong> {induction.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInduction(induction);
                          setShowAddAttendeesModal(true);
                        }}
                        className="px-3 py-1.5 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] text-sm font-medium flex items-center gap-2 bg-white dark:bg-[var(--card-bg)]"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Attendees
                      </button>
                    </div>
                  </div>

                  {/* Attendees Section */}
                  {induction.attendees && induction.attendees.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-3">
                        Attendees ({induction.confirmed_attendees?.length || induction.attendees.filter(a => a.status === 'accepted').length} confirmed)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {induction.attendees.map(attendee => (
                          <div key={attendee.id} className="border border-gray-200 dark:border-[var(--card-border)] rounded-lg p-3 bg-white dark:bg-[var(--card-bg)]">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-[var(--text-primary)]">
                                  {formatName(attendee.training_counsellor?.name || 'Unknown', getCounsellorPrefixType(attendee.training_counsellor?.counsellor_type))}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                                  {attendee.training_counsellor?.email || 'No email'}
                                </p>
                              </div>
                              <div className="ml-3">
                                {getAttendeeStatusBadge(attendee.status)}
                                {attendee.status === 'pending' && attendee.expires_at && (
                                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                                    Expires: {new Date(attendee.expires_at).toLocaleDateString('en-GB')}
                                  </p>
                                )}
                                {attendee.accepted_at && (
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Accepted: {new Date(attendee.accepted_at).toLocaleDateString('en-GB')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Induction Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCreateModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-[var(--card-bg)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Create Induction</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg">
                  <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                </button>
              </div>

              <form onSubmit={handleCreateInduction} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                    Conducted By (TC) <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={createForm.tc_id}
                    onChange={(e) => setCreateForm({...createForm, tc_id: e.target.value})}
                    options={trainingCounsellors.map(tc => ({
                      value: tc.id,
                      label: `${formatName(tc.name, getCounsellorPrefixType(tc.counsellor_type))}${tc.modality ? ` (${tc.modality})` : ''}`
                    }))}
                    placeholder="Select a trainee counsellor..."
                    isMulti={false}
                    required={true}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={createForm.scheduled_at}
                      onChange={(e) => setCreateForm({...createForm, scheduled_at: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({...createForm, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="e.g., Online, Office Address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                    Attendees <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={createForm.attendee_tc_ids}
                    onChange={(e) => {
                      setCreateForm({...createForm, attendee_tc_ids: e.target.value});
                    }}
                    options={trainingCounsellors.map(tc => ({
                      value: tc.id,
                      label: `${formatName(tc.name, getCounsellorPrefixType(tc.counsellor_type))}${tc.modality ? ` (${tc.modality})` : ''}`
                    }))}
                    placeholder="Select attendees..."
                    isMulti={true}
                    required={true}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                    Notes
                  </label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Additional information about the induction..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={actionLoading}
                    className="px-6 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-bg)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#6f1d56' }}
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Induction'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Add Attendees Modal */}
      {showAddAttendeesModal && selectedInduction && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => {
            setShowAddAttendeesModal(false);
            setSelectedInduction(null);
          }}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Add Attendees</h2>
                <button onClick={() => {
                  setShowAddAttendeesModal(false);
                  setSelectedInduction(null);
                }} className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg">
                  <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                </button>
              </div>

              <form onSubmit={handleAddAttendees} className="p-6 space-y-4">
                <p className="text-sm text-gray-700 dark:text-[var(--text-primary)]">
                  Add attendees to induction on {formatDateTime(selectedInduction.scheduled_at)}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                    Select Attendees <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={createForm.attendee_tc_ids}
                    onChange={(e) => {
                      setCreateForm({...createForm, attendee_tc_ids: e.target.value});
                    }}
                    options={trainingCounsellors
                      .filter(tc => !selectedInduction.attendees?.some(a => a.tc_id === tc.id))
                      .map(tc => ({
                        value: tc.id,
                        label: `${formatName(tc.name, getCounsellorPrefixType(tc.counsellor_type))}${tc.modality ? ` (${tc.modality})` : ''}`
                      }))}
                    placeholder="Select attendees..."
                    isMulti={true}
                    required={true}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAttendeesModal(false);
                      setSelectedInduction(null);
                    }}
                    disabled={actionLoading}
                    className="px-6 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-bg)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#6f1d56' }}
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Attendees'
                    )}
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

