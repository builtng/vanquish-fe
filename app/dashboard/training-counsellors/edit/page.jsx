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
import SearchableSelect from '@/components/SearchableSelect';
import { THERAPY_TOPICS } from '@/lib/constants';

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
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ start_date: '', end_date: '', reason: '' });
  const [holidayLoading, setHolidayLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    modality: '',
    gender: '',
    ethnicity: '',
    sexual_orientation: '',
    age: '',
    date_of_birth: '',
    address: '',
    status: 'Active',
    counsellor_type: 'Trainee',
    session_price: '',
    bio: '',
    offers_mid_range: false,
    offers_coaching: false,
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
    placementLeadPhone: '',
    // Qualified Counsellor Fields
    legal_first_name: '',
    legal_last_name: '',
    registered_address: '',
    registered_city: '',
    registered_postcode: '',
    has_supervisor: '',
    previous_vanquish_work: '',
    areas_to_improve: '',
    unique_trait: '',
    counsellor_training_details: '',
    qualified_to_work_with: [],
    challenging_cases: ''
  });

  const timeSlots = [
    { value: '10am-1050am', label: '10:00 AM - 10:50 AM' },
    { value: '11am-1150am', label: '11:00 AM - 11:50 AM' },
    { value: '12pm-1250pm', label: '12:00 PM - 12:50 PM' },
    { value: '1pm-150pm', label: '1:00 PM - 1:50 PM' },
    { value: '2pm-250pm', label: '2:00 PM - 2:50 PM' },
    { value: '3pm-350pm', label: '3:00 PM - 3:50 PM' },
    { value: '4pm-450pm', label: '4:00 PM - 4:50 PM' },
    { value: '5pm-550pm', label: '5:00 PM - 5:50 PM' },
    { value: '6pm-650pm', label: '6:00 PM - 6:50 PM' },
  ];

  const commonTopics = THERAPY_TOPICS;

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
        const intake = Array.isArray(data.intake_form) 
          ? data.intake_form[0] 
          : (data.intake_form || (Array.isArray(data.intakeForm) ? data.intakeForm[0] : (data.intakeForm || {})));
        
        const tcAvail = (data.availability && Object.keys(data.availability).length > 0)
          ? data.availability
          : (intake?.availability || {
              Monday: [],
              Tuesday: [],
              Wednesday: [],
              Thursday: [],
              Friday: []
            });

        setFormData({
          name: data.name || intake?.name || '',
          email: data.email || intake?.email || '',
          phone: data.phone || intake?.phone || '',
          modality: data.modality || intake?.modality || '',
          gender: data.gender || intake?.gender || '',
          ethnicity: data.ethnicity || intake?.ethnicity || '',
          sexual_orientation: data.sexual_orientation || intake?.sexual_orientation || '',
          age: data.age !== null && data.age !== undefined ? String(data.age) : (intake?.age ? String(intake.age) : ''),
          date_of_birth: data.date_of_birth || intake?.date_of_birth || '',
          address: data.address || intake?.address || '',
          status: data.status || 'Active',
          counsellor_type: data.counsellor_type || 'Trainee',
          session_price: data.session_price ?? '',
          bio: data.bio || '',
          offers_mid_range: !!data.offers_mid_range,
          offers_coaching: !!data.offers_coaching,
          availability: {
            Monday: tcAvail?.Monday || [],
            Tuesday: tcAvail?.Tuesday || [],
            Wednesday: tcAvail?.Wednesday || [],
            Thursday: tcAvail?.Thursday || [],
            Friday: tcAvail?.Friday || [],
            Saturday: tcAvail?.Saturday || [],
            Sunday: tcAvail?.Sunday || []
          },
          topicsWithExperience: (Array.isArray(data.topics_with_experience) && data.topics_with_experience.length > 0)
            ? data.topics_with_experience
            : (intake?.topics_with_experience || []),
          topicsNotReadyFor: (Array.isArray(data.topics_not_ready_for) && data.topics_not_ready_for.length > 0)
            ? data.topics_not_ready_for
            : (intake?.topics_not_ready_for || []),
          // Professional Info
          course: data.course_title || data.course || intake?.course || '',
          institution: data.training_org_name || data.institution || intake?.institution || '',
          trainingOrgAddress: data.training_org_address || '',
          tutorName: data.tutor_name || '',
          tutorEmail: data.tutor_email || '',
          tutorPhone: data.tutor_phone || '',
          placementLeadName: data.placement_lead_name || '',
          placementLeadEmail: data.placement_lead_email || '',
          placementLeadPhone: data.placement_lead_phone || '',
          // Qualified Counsellor Fields
          legal_first_name: data.legal_first_name || '',
          legal_last_name: data.legal_last_name || '',
          registered_address: data.registered_address || '',
          registered_city: data.registered_city || '',
          registered_postcode: data.registered_postcode || '',
          has_supervisor: data.has_supervisor || '',
          previous_vanquish_work: data.previous_vanquish_work || '',
          areas_to_improve: data.areas_to_improve || '',
          unique_trait: data.unique_trait || '',
          counsellor_training_details: data.counsellor_training_details || '',
          qualified_to_work_with: data.qualified_to_work_with || [],
          challenging_cases: data.challenging_cases || ''
        });
      } catch (err) {
        console.error('Error fetching TC:', err);
        setError('Failed to load practitioner details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTc();
  }, [tcId]);

  const fetchHolidays = async () => {
    if (!tcId) return;
    try {
      const data = await apiService.getTcHolidays(tcId);
      setHolidays(data || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [tcId]);

  const handleAddHoliday = async () => {
    if (!newHoliday.start_date || !newHoliday.end_date) {
      showError('Please provide a start and end date');
      return;
    }

    try {
      setHolidayLoading(true);
      await apiService.addTcHoliday(tcId, newHoliday);
      setNewHoliday({ start_date: '', end_date: '', reason: '' });
      await fetchHolidays();
      success('Holiday added successfully!');
    } catch (err) {
      showError(err.message || 'Failed to add holiday.');
    } finally {
      setHolidayLoading(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      await apiService.deleteTcHoliday(tcId, holidayId);
      setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    } catch (err) {
      showError(err.message || 'Failed to remove holiday.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvailabilityToggle = (day, slot) => {
    setFormData(prev => {
      const currentSlots = prev.availability[day] || [];
      const newSlots = currentSlots.includes(slot)
        ? currentSlots.filter(s => s !== slot)
        : [...currentSlots, slot];

      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: newSlots
        }
      };
    });
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
        gender: formData.gender || null,
        ethnicity: formData.ethnicity || null,
        sexual_orientation: formData.sexual_orientation || null,
        age: formData.age ? parseInt(formData.age) : null,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
        modality: formData.modality || null,
        status: formData.status,
        counsellor_type: formData.counsellor_type,
        session_price: formData.session_price === '' ? null : formData.session_price,
        bio: formData.bio || null,
        offers_mid_range: formData.offers_mid_range,
        offers_coaching: formData.offers_coaching,
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
        placement_lead_phone: formData.placementLeadPhone,
        legal_first_name: formData.legal_first_name || null,
        legal_last_name: formData.legal_last_name || null,
        registered_address: formData.registered_address || null,
        registered_city: formData.registered_city || null,
        registered_postcode: formData.registered_postcode || null,
        has_supervisor: formData.has_supervisor || null,
        previous_vanquish_work: formData.previous_vanquish_work || null,
        areas_to_improve: formData.areas_to_improve || null,
        unique_trait: formData.unique_trait || null,
        counsellor_training_details: formData.counsellor_training_details || null,
        qualified_to_work_with: formData.qualified_to_work_with || [],
        challenging_cases: formData.challenging_cases || null
      });

      success('Practitioner updated successfully!');
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                  <SearchableSelect
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    options={[
                      { value: '', label: 'Not specified' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Non-binary', label: 'Non-binary' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    placeholder="Select Gender"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ethnicity</label>
                  <SearchableSelect
                    value={formData.ethnicity}
                    onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                    options={[
                      { value: '', label: 'Not specified' },
                      { value: 'White', label: 'White' },
                      { value: 'Asian / Asian British', label: 'Asian / Asian British' },
                      { value: 'Black / African / Caribbean / Black British', label: 'Black / African / Caribbean / Black British' },
                      { value: 'Mixed / Multiple ethnic groups', label: 'Mixed / Multiple ethnic groups' },
                      { value: 'Other ethnic group', label: 'Other ethnic group' }
                    ]}
                    placeholder="Select Ethnicity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sexual Orientation</label>
                  <SearchableSelect
                    value={formData.sexual_orientation}
                    onChange={(e) => handleInputChange('sexual_orientation', e.target.value)}
                    options={[
                      { value: '', label: 'Not specified' },
                      { value: 'Heterosexual / Straight', label: 'Heterosexual / Straight' },
                      { value: 'Gay / Lesbian', label: 'Gay / Lesbian' },
                      { value: 'Bisexual', label: 'Bisexual' },
                      { value: 'Queer', label: 'Queer' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    placeholder="Select Orientation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="e.g. 35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="DD/MM/YYYY or YYYY-MM-DD"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                    placeholder="Enter practitioner's address"
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

              {formData.counsellor_type === 'Qualified' && (
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Mid Range / Coaching Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Session Price (£)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.session_price}
                        onChange={(e) => handleInputChange('session_price', e.target.value)}
                        className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                        placeholder="e.g. 45.00"
                      />
                    </div>
                    <div className="flex items-end gap-6">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={formData.offers_mid_range}
                          onChange={(e) => handleInputChange('offers_mid_range', e.target.checked)}
                          className="w-4 h-4"
                        />
                        Offers Mid Range
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={formData.offers_coaching}
                          onChange={(e) => handleInputChange('offers_coaching', e.target.checked)}
                          className="w-4 h-4"
                        />
                        Offers Coaching
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Short Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      maxLength={2000}
                      className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                      placeholder="Shown to clients choosing a practitioner"
                    />
                  </div>

                  <div className="pt-4 border-t border-border space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Qualified Practitioner Registration & Practice Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Legal First Name</label>
                        <input
                          type="text"
                          value={formData.legal_first_name}
                          onChange={(e) => handleInputChange('legal_first_name', e.target.value)}
                          className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Legal First Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Legal Last Name</label>
                        <input
                          type="text"
                          value={formData.legal_last_name}
                          onChange={(e) => handleInputChange('legal_last_name', e.target.value)}
                          className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Legal Last Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Registered Address</label>
                        <input
                          type="text"
                          value={formData.registered_address}
                          onChange={(e) => handleInputChange('registered_address', e.target.value)}
                          className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Practice / Registered Address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">City</label>
                          <input
                            type="text"
                            value={formData.registered_city}
                            onChange={(e) => handleInputChange('registered_city', e.target.value)}
                            className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Postcode</label>
                          <input
                            type="text"
                            value={formData.registered_postcode}
                            onChange={(e) => handleInputChange('registered_postcode', e.target.value)}
                            className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                            placeholder="Postcode"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Has Clinical Supervisor?</label>
                        <SearchableSelect
                          value={formData.has_supervisor}
                          onChange={(e) => handleInputChange('has_supervisor', e.target.value)}
                          options={[
                            { value: '', label: 'Select' },
                            { value: 'Yes', label: 'Yes' },
                            { value: 'No', label: 'No' },
                          ]}
                          placeholder="Select"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Previous Vanquish Work</label>
                        <input
                          type="text"
                          value={formData.previous_vanquish_work}
                          onChange={(e) => handleInputChange('previous_vanquish_work', e.target.value)}
                          className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="e.g. Yes / No / Trainee alumni"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Counsellor Training & Background Details</label>
                        <textarea
                          value={formData.counsellor_training_details}
                          onChange={(e) => handleInputChange('counsellor_training_details', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Details of qualifications and accredited bodies"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Unique Trait</label>
                        <input
                          type="text"
                          value={formData.unique_trait}
                          onChange={(e) => handleInputChange('unique_trait', e.target.value)}
                          className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="e.g. Specialises in neurodiversity"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Areas to Improve</label>
                        <input
                          type="text"
                          value={formData.areas_to_improve}
                          onChange={(e) => handleInputChange('areas_to_improve', e.target.value)}
                          className="w-full px-4 py-2 border border-input bg-input-bg text-input-text rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="e.g. Couples work"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Holidays (Trainee only - drives auto-scheduling for Low Cost clients) */}
            {formData.counsellor_type === 'Trainee' && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Holidays</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Low Cost clients' sessions are automatically rescheduled around these dates.
                </p>

                {holidays.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {holidays.map((holiday) => (
                      <div key={holiday.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                        <div className="text-sm text-foreground">
                          <span className="font-medium">{holiday.start_date}</span>
                          {' → '}
                          <span className="font-medium">{holiday.end_date}</span>
                          {holiday.reason && <span className="text-muted-foreground"> — {holiday.reason}</span>}
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newHoliday.start_date}
                      onChange={(e) => setNewHoliday(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-input-bg text-input-text rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">End Date</label>
                    <input
                      type="date"
                      value={newHoliday.end_date}
                      onChange={(e) => setNewHoliday(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-input-bg text-input-text rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Reason (optional)</label>
                    <input
                      type="text"
                      value={newHoliday.reason}
                      onChange={(e) => setNewHoliday(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-input-bg text-input-text rounded-lg text-sm"
                      placeholder="e.g. Annual leave"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddHoliday}
                      disabled={holidayLoading}
                      className="w-full px-4 py-2 bg-[var(--purple-primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Add Holiday
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                            onClick={() => handleAvailabilityToggle(day, slot.value)}
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
