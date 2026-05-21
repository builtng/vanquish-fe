"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { useToast } from '@/lib/toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import DashboardLayout from '@/components/DashboardLayout';
import PhotoUpload from '@/components/PhotoUpload';
import SearchableSelect from '@/components/SearchableSelect';

import { 
  Edit, Trash2, X, Save, ChevronRight, User, Mail, Phone, 
  Calendar, Building2, GraduationCap, AlertTriangle, CheckCircle
} from 'lucide-react';


function EditTrainingCounsellorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  
  const tcId = searchParams?.get('id') || searchParams?.get('uuid') || null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tcPhoto, setTcPhoto] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    modality: '',
    status: 'Active',
    counsellor_type: 'Trainee',
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    },
    topicsWithExperience: [],
    topicsNotReadyFor: [],
    // Professional Info
    course: '',
    institution: '',
    trainingOrgAddress: '',
    tutorName: '',
    tutorEmail: '',
    tutorPhone: '',
    placementLeadName: '',
    placementLeadEmail: '',
    placementLeadPhone: ''
  });

  const timeSlots = [
    { value: 'morning-early', label: '10-11am' },
    { value: 'morning-late', label: '11am-1pm' },
    { value: 'afternoon-early', label: '1-4pm' },
    { value: 'afternoon-late', label: '4-5pm' },
    { value: 'evening', label: '5-7pm' }
  ];

  const commonTopics = [
    'Anxiety', 'Depression', 'Stress', 'Relationship Issues', 'Grief & Loss',
    'Trauma', 'Self-Esteem', 'Anger Management', 'Addiction', 'Eating Disorders',
    'OCD', 'PTSD', 'Bipolar Disorder', 'ADHD', 'Autism', 'LGBTQ+ Issues',
    'Workplace Issues', 'Family Therapy', 'Couples Therapy', 'Child Therapy'
  ];

  useEffect(() => {
    const fetchTc = async () => {
      if (!tcId) {
        setError('No TC ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getTrainingCounsellorDetails(tcId);
        
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          modality: data.modality || '',
          status: data.status || 'Active',
          counsellor_type: data.counsellor_type || 'Trainee',
          availability: data.availability || {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: []
          },
          topicsWithExperience: data.topics_with_experience || [],
          topicsNotReadyFor: data.topics_not_ready_for || [],
          // Professional Info
          course: data.course_title || data.course || '',
          institution: data.training_org_name || data.institution || '',
          trainingOrgAddress: data.training_org_address || '',
          tutorName: data.tutor_name || '',
          tutorEmail: data.tutor_email || '',
          tutorPhone: data.tutor_phone || '',
          placementLeadName: data.placement_lead_name || '',
          placementLeadEmail: data.placement_lead_email || '',
          placementLeadPhone: data.placement_lead_phone || ''
        });
        
        setTcPhoto(data.photo_url || data.photo || null);
      } catch (err) {
        console.error('Error fetching TC:', err);
        setError('Failed to load practitioner details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTc();
  }, [tcId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (day, slots) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: slots
      }
    }));
  };

  const toggleTimeSlot = (day, slot) => {
    const currentSlots = formData.availability[day] || [];
    const newSlots = currentSlots.includes(slot)
      ? currentSlots.filter(s => s !== slot)
      : [...currentSlots, slot];
    handleAvailabilityChange(day, newSlots);
  };

  const handleTopicToggle = (topic, list) => {
    const currentList = formData[list] || [];
    const newList = currentList.includes(topic)
      ? currentList.filter(t => t !== topic)
      : [...currentList, topic];
    handleInputChange(list, newList);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      showError('Name and email are required');
      return;
    }

    setShowEditConfirmModal(true);
  };

  const confirmSaveChanges = async () => {
    try {
      setSaveLoading(true);
      setShowEditConfirmModal(false);
      await apiService.updateTrainingCounsellor(tcId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        modality: formData.modality || null,
        status: formData.status,
        counsellor_type: formData.counsellor_type,
        availability: formData.availability,
        topics_with_experience: formData.topicsWithExperience,
        topics_not_ready_for: formData.topicsNotReadyFor,
        course: formData.course,
        institution: formData.institution,
        training_org_address: formData.trainingOrgAddress,
        tutor_name: formData.tutorName,
        tutor_email: formData.tutorEmail,
        tutor_phone: formData.tutorPhone,
        placement_lead_name: formData.placementLeadName,
        placement_lead_email: formData.placementLeadEmail,
        placement_lead_phone: formData.placementLeadPhone
      });

      success('Trainee Counsellor updated successfully!');
      router.push(`/dashboard/training-counsellors/details/${tcId}`);
    } catch (err) {
      console.error('Error updating TC:', err);
      showError(err.message || 'Failed to update practitioner. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await apiService.deleteTrainingCounsellor(tcId);
      success('Trainee Counsellor deleted successfully!');
      router.push('/dashboard/training-counsellors');
    } catch (err) {
      console.error('Error deleting TC:', err);
      showError(err.message || 'Failed to delete practitioner. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <PageGuard menuId="tcs">
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple-primary)] mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading practitioner details...</p>
          </div>
        </div>
      </DashboardLayout>
      </PageGuard>
    );
  }

  if (error || !tcId) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">{error || 'Practitioner ID not provided'}</p>
            <Link href="/dashboard/training-counsellors" className="mt-4 text-[var(--purple-primary)] hover:text-[var(--purple-primary)]/80">
              Back to Practitioners
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Link href="/dashboard/training-counsellors" className="hover:text-[var(--purple-primary)]">All Practitioners</Link>
                  <ChevronRight className="w-4 h-4" />
                  <Link href={`/dashboard/training-counsellors/details/${tcId}`} className="hover:text-[var(--purple-primary)]">Practitioner Details</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-foreground font-medium">Edit</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Edit Trainee Counsellor</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#6f1d56' }}
                >
                  <Save className="w-4 h-4" />
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-7xl space-y-6">
            {/* Personal Information */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
              
              {/* Photo Upload - Only show when editing existing TC */}
              {tcId && (
                <div className="flex items-start gap-6 pb-6 border-b border-border mb-6">
                  <PhotoUpload
                    photoUrl={tcPhoto}
                    entityId={tcId}
                    entityType="tc"
                    onUpload={async (id, file) => {
                      const response = await apiService.uploadTcPhoto(id, file);
                      setTcPhoto(response.photo_url || response.photo);
                      return response;
                    }}
                    onDelete={async (id) => {
                      await apiService.deleteTcPhoto(id);
                      setTcPhoto(null);
                    }}
                    size="large"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground mb-1">Profile Photo</h3>
                    <p className="text-xs text-muted-foreground">Upload a photo for this practitioner (Admin only)</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Modality</label>
                  <SearchableSelect
                    value={formData.modality}
                    onChange={(e) => handleInputChange('modality', e.target.value)}
                    options={[
                      { value: '', label: 'Select Modality' },
                      { value: 'CBT', label: 'CBT' },
                      { value: 'Person-Centred', label: 'Person-Centred' },
                      { value: 'Integrative', label: 'Integrative' },
                      { value: 'Psychodynamic', label: 'Psychodynamic' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    placeholder="Select Modality"
                  />
                </div>
              </div>
            </div>

            {/* Status & Type */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Status & Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <SearchableSelect
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'At Capacity', label: 'At Capacity' },
                      { value: 'On Leave', label: 'On Leave' },
                      { value: 'Away', label: 'Away' },
                      { value: 'Inactive', label: 'Inactive' }
                    ]}
                    placeholder="Select Status"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Counsellor Type</label>
                  <SearchableSelect
                    value={formData.counsellor_type}
                    onChange={(e) => handleInputChange('counsellor_type', e.target.value)}
                    options={[
                      { value: 'Trainee', label: 'Trainee' },
                      { value: 'Qualified', label: 'Qualified' }
                    ]}
                    placeholder="Select Type"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Availability Schedule</h2>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <div key={day} className="border border-border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{day}</h3>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map(slot => {
                        const isSelected = (formData.availability[day] || []).includes(slot.value);
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() => toggleTimeSlot(day, slot.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-[var(--purple-primary)] text-white'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                            }`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Professional Information</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Course Title</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="e.g. Diploma in Counselling"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Institution / Training Org</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="e.g. University of Example"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Training Org Address</label>
                  <input
                    type="text"
                    value={formData.trainingOrgAddress}
                    onChange={(e) => handleInputChange('trainingOrgAddress', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="Address of the training organization"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 mb-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Tutor / Programme Lead</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.tutorName}
                      onChange={(e) => handleInputChange('tutorName', e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent text-sm"
                      placeholder="Tutor Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.tutorEmail}
                      onChange={(e) => handleInputChange('tutorEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent text-sm"
                      placeholder="Tutor Email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.tutorPhone}
                      onChange={(e) => handleInputChange('tutorPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent text-sm"
                      placeholder="Tutor Phone"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Placement Lead</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.placementLeadName}
                      onChange={(e) => handleInputChange('placementLeadName', e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent text-sm"
                      placeholder="Lead Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.placementLeadEmail}
                      onChange={(e) => handleInputChange('placementLeadEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent text-sm"
                      placeholder="Lead Email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.placementLeadPhone}
                      onChange={(e) => handleInputChange('placementLeadPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent text-sm"
                      placeholder="Lead Phone"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Expertise */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Clinical Expertise</h2>
              
              {/* Topics with Experience */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">✅ Topics with Experience</h3>
                <div className="flex flex-wrap gap-2">
                  {commonTopics.map(topic => {
                    const isSelected = formData.topicsWithExperience.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicToggle(topic, 'topicsWithExperience')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-[var(--tag-bg-green)] text-[var(--tag-text)] border-2 border-green-600'
                            : 'bg-muted text-foreground hover:bg-muted/80 border-2 border-transparent'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topics NOT Ready For */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">⚠️ Topics NOT Ready For</h3>
                <div className="flex flex-wrap gap-2">
                  {commonTopics.map(topic => {
                    const isSelected = formData.topicsNotReadyFor.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicToggle(topic, 'topicsNotReadyFor')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-[var(--warning-bg)] text-[var(--warning-primary)] border-2 border-red-600'
                            : 'bg-muted text-foreground hover:bg-muted/80 border-2 border-transparent'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete Trainee Counsellor"
        message={`Are you sure you want to delete ${formData.name}? This action cannot be undone.`}
        itemName={formData.name}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
      />

      {/* Edit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEditConfirmModal}
        onClose={() => setShowEditConfirmModal(false)}
        onConfirm={confirmSaveChanges}
        title="Save Changes"
        message={`Are you sure you want to save changes to ${formData.name}?`}
        confirmText="Save Changes"
        cancelText="Cancel"
        type="info"
        loading={saveLoading}
        confirmButtonColor="#6f1d56"
      />
    </DashboardLayout>
  );
}

export default function EditTrainingCounsellorPage() {
  return (
    <React.Suspense fallback={
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple-primary)] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
      </DashboardLayout>
    }>
      <EditTrainingCounsellorContent />
    </React.Suspense>
  );
}
