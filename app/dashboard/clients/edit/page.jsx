"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { 

  Users, Search, Filter, ChevronDown, MoreVertical, Eye,

  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,

  CheckCircle, Clock, AlertTriangle, Video, FileText,

  UserCheck, Activity, Menu, Home, ClipboardList,

  Settings, LogOut, ChevronRight, MapPin, User, 

  Download, Send, Archive, Plus, ChevronLeft,

  CreditCard, Package, AlertCircle, Check, XCircle,

  Save, ChevronUp

} from 'lucide-react';



export default function EditClientPage() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [expandedSections, setExpandedSections] = useState({

    personal: true,

    service: true,

    clinical: true,

    availability: true,

    referral: true,

    adminNotes: true

  });



  // Mock existing client data - In production, this would be loaded from API

  const [formData, setFormData] = useState({

    // Client ID (read-only)

    clientId: 'CL001',

    clientName: 'Emma Wilson',

    

    // Personal Information

    firstName: 'Emma',

    lastName: 'Wilson',

    email: 'emma.w@email.com',

    phone: '+44 7700 900101',

    age: '31',

    voicemailPermission: 'Yes',

    currentlyInTherapy: 'No',

    

    // Service Selection

    serviceType: 'Low Cost Counselling',

    

    // Clinical Information

    onMedication: 'Yes',

    medicationDetails: 'Sertraline 50mg - prescribed for anxiety and depression',

    disabilities: 'None',

    concernsSelected: ['Depression', 'Anxiety', 'Work Stress'],

    additionalConcernDetails: 'Experiencing burnout from work. Recently promoted to management role and struggling with imposter syndrome. Having trouble sleeping and feeling overwhelmed.',

    riskIssues: 'None reported',

    

    // Availability

    availability: {

      Monday: ['morning-early'],

      Tuesday: [],

      Wednesday: ['afternoon-early'],

      Thursday: [],

      Friday: ['morning-late']

    },

    

    // Referral Information

    howHeardAbout: 'Social Media (Facebook, Instagram)',

    referralReasons: 'N/A',

    referralName: 'N/A',

    referralPhone: 'N/A',

    organizationName: 'N/A',

    organizationEmail: 'N/A',

    

    // Admin Notes

    adminNotes: 'Client seems motivated. Good candidate for Low Cost counselling. Consultation completed 2025-02-20.',

    paymentStatus: 'Paid'

  });



  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



  const timeSlots = [

    { value: 'morning-early', label: '10am - 11am' },

    { value: 'morning-late', label: '11am - 1pm' },

    { value: 'afternoon-early', label: '1pm - 4pm' },

    { value: 'afternoon-late', label: '4pm - 5pm' },

    { value: 'evening', label: '5pm - 7pm' }

  ];



  const concernsOptions = [

    'Communication problems',

    'People pleasing',

    'Loneliness',

    'Discrimination & Racism',

    'Low mood',

    'Stress',

    'Low confidence',

    'Family issues',

    'Fear of intimacy',

    'Personal development',

    'Self-defeating behaviour',

    'Low self-esteem',

    'Relationship problems',

    'High sensitivity',

    'Anxiety',

    'Depression',

    'Trauma',

    'PTSD',

    'Grief & Loss',

    'Anger Management',

    'Eating Disorders',

    'OCD',

    'Self-Harm',

    'Suicidal Ideation',

    'Sexual Abuse/Assault',

    'Domestic Violence',

    'Substance Abuse',

    'Work Stress'

  ];



  const toggleSection = (section) => {

    setExpandedSections(prev => ({

      ...prev,

      [section]: !prev[section]

    }));

  };



  const handleInputChange = (field, value) => {

    setFormData(prev => ({

      ...prev,

      [field]: value

    }));

  };



  const handleAvailabilityChange = (day, timeSlot) => {

    setFormData(prev => ({

      ...prev,

      availability: {

        ...prev.availability,

        [day]: prev.availability[day].includes(timeSlot)

          ? prev.availability[day].filter(t => t !== timeSlot)

          : [...prev.availability[day], timeSlot]

      }

    }));

  };



  const handleConcernToggle = (concern) => {

    setFormData(prev => ({

      ...prev,

      concernsSelected: prev.concernsSelected.includes(concern)

        ? prev.concernsSelected.filter(c => c !== concern)

        : [...prev.concernsSelected, concern]

    }));

  };



  const handleSubmit = (e) => {

    e.preventDefault();

    // Validation

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.age) {

      alert('Please fill in all required personal information fields.');

      return;

    }

    

    // Check if at least one availability slot is selected

    const hasAvailability = Object.values(formData.availability).some(slots => slots.length > 0);

    if (!hasAvailability) {

      alert('Please select at least one availability time slot.');

      return;

    }



    if (formData.concernsSelected.length === 0) {

      alert('Please select at least one area of support.');

      return;

    }



    console.log('Form updated:', formData);

    alert('Client updated successfully! (This would save to database in production)');

    // In production, this would make an API call to update the client

  };



  const handleDelete = () => {

    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {

      console.log('Deleting client:', formData.clientId);

      alert('Client deleted successfully! (This would delete from database in production)');

      // In production, this would make an API call to delete the client

      // Then redirect to All Clients page

    }

  };



  const SectionHeader = ({ title, section, required = false }) => (

    <button

      type="button"

      onClick={() => toggleSection(section)}

      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"

    >

      <div className="flex items-center gap-2">

        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        {required && <span className="text-red-500 text-sm">*</span>}

      </div>

      {expandedSections[section] ? (

        <ChevronUp className="w-5 h-5 text-gray-600" />

      ) : (

        <ChevronDown className="w-5 h-5 text-gray-600" />

      )}

    </button>

  );



  return (

    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}

      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen`}>

        <div className="p-4 border-b border-gray-200 flex-shrink-0">

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

            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">

              <Menu className="w-5 h-5 text-gray-600" />

            </button>

          </div>

        </div>



        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          {[

            { id: 'overview', icon: Home, label: 'Overview', href: '/dashboard' },

            { id: 'consultations', icon: Video, label: 'Consultations', badge: 3, href: '/dashboard/consultations' },

            { id: 'matches', icon: UserCheck, label: 'Pending Matches', badge: 8, href: '/dashboard/pending-matches' },

            { id: 'tcs', icon: Users, label: 'Training Counsellors', href: '/dashboard/training-counsellors' },

            { id: 'clients', icon: ClipboardList, label: 'All Clients', href: '/dashboard/clients' },

            { id: 'activity', icon: Activity, label: 'Activity Log', href: '/dashboard/activity-log' }

          ].map(item => {

            const isActive = pathname === item.href || (item.id === 'clients' && pathname?.startsWith('/dashboard/client'));

            return (

              <Link

                key={item.id}

                href={item.href}

                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${

                  isActive ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-100'

                }`}

              >

                <item.icon className="w-5 h-5 flex-shrink-0" />

                {sidebarOpen && (

                  <>

                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>

                    {item.badge > 0 && (

                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{item.badge}</span>

                    )}

                  </>

                )}

              </Link>

            );

          })}

        </nav>



        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">

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



      {/* Main Content */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}

        <div className="bg-white border-b border-gray-200">

          {/* Breadcrumb */}

          <div className="px-6 py-3 border-b border-gray-100">

            <div className="flex items-center gap-2 text-sm text-gray-600">

              <Link href="/dashboard/clients" className="hover:text-purple-600">All Clients</Link>

              <ChevronRight className="w-4 h-4" />

              <Link href="/dashboard/client-details" className="hover:text-purple-600">{formData.clientName}</Link>

              <ChevronRight className="w-4 h-4" />

              <span className="text-gray-900 font-medium">Edit</span>

            </div>

          </div>



          {/* Page Header */}

          <div className="px-6 py-4">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-3 mb-1">

                  <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>

                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">

                    ID: {formData.clientId}

                  </span>

                </div>

                <p className="text-sm text-gray-600">{formData.clientName}</p>

              </div>

              <button

                type="button"

                onClick={() => window.history.back()}

                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"

              >

                <X className="w-4 h-4" />

                Cancel

              </button>

            </div>

          </div>

        </div>



        {/* Form Content - Scrollable */}

        <div className="flex-1 overflow-y-auto">

          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6">

            {/* Alert Info */}

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">

              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

              <div>

                <p className="text-sm font-medium text-blue-900 mb-1">Editing Client Information</p>

                <p className="text-sm text-blue-700">

                  Update any client information below. Fields marked with * are required. Changes will be saved to the client's profile.

                </p>

              </div>

            </div>



            {/* Personal Information Section */}

            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">

              <SectionHeader title="Personal Information" section="personal" required />

              

              {expandedSections.personal && (

                <div className="p-6 space-y-4">

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        First Name <span className="text-red-500">*</span>

                      </label>

                      <input

                        type="text"

                        value={formData.firstName}

                        onChange={(e) => handleInputChange('firstName', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="Enter first name"

                        required

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Last Name <span className="text-red-500">*</span>

                      </label>

                      <input

                        type="text"

                        value={formData.lastName}

                        onChange={(e) => handleInputChange('lastName', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="Enter last name"

                        required

                      />

                    </div>

                  </div>



                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Email <span className="text-red-500">*</span>

                      </label>

                      <input

                        type="email"

                        value={formData.email}

                        onChange={(e) => handleInputChange('email', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="email@example.com"

                        required

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Phone <span className="text-red-500">*</span>

                      </label>

                      <input

                        type="tel"

                        value={formData.phone}

                        onChange={(e) => handleInputChange('phone', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="+44 7700 900000"

                        required

                      />

                    </div>

                  </div>



                  <div className="grid grid-cols-3 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Age <span className="text-red-500">*</span>

                      </label>

                      <input

                        type="number"

                        value={formData.age}

                        onChange={(e) => handleInputChange('age', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="18"

                        min="18"

                        required

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Voicemail Permission <span className="text-red-500">*</span>

                      </label>

                      <select

                        value={formData.voicemailPermission}

                        onChange={(e) => handleInputChange('voicemailPermission', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      >

                        <option value="Yes">Yes</option>

                        <option value="No">No</option>

                      </select>

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Currently in Therapy? <span className="text-red-500">*</span>

                      </label>

                      <select

                        value={formData.currentlyInTherapy}

                        onChange={(e) => handleInputChange('currentlyInTherapy', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                      >

                        <option value="Yes">Yes</option>

                        <option value="No">No</option>

                      </select>

                    </div>

                  </div>



                  <p className="text-xs text-gray-600 italic">

                    Note: We primarily communicate through Emails and WhatsApp

                  </p>

                </div>

              )}

            </div>



            {/* Service Selection Section */}

            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">

              <SectionHeader title="Service Selection" section="service" required />

              

              {expandedSections.service && (

                <div className="p-6">

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Service Type <span className="text-red-500">*</span>

                  </label>

                  <select

                    value={formData.serviceType}

                    onChange={(e) => handleInputChange('serviceType', e.target.value)}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                  >

                    <option value="Low Cost Counselling">Low Cost Counselling</option>

                    <option value="Mid Range Counselling">Mid Range Counselling with Qualified Counsellors (starting from £40+)</option>

                    <option value="Ish's Services">Ish's Services (Coaching/Counselling)</option>

                  </select>

                </div>

              )}

            </div>



            {/* Clinical Information Section */}

            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">

              <SectionHeader title="Clinical Information" section="clinical" required />

              

              {expandedSections.clinical && (

                <div className="p-6 space-y-4">

                  {/* Medication */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Currently on Medication?

                    </label>

                    <select

                      value={formData.onMedication}

                      onChange={(e) => handleInputChange('onMedication', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent mb-3"

                    >

                      <option value="No">No</option>

                      <option value="Yes">Yes</option>

                    </select>



                    {formData.onMedication === 'Yes' && (

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                          Medication Details (what medication and what it's prescribed for) <span className="text-red-500">*</span>

                        </label>

                        <textarea

                          value={formData.medicationDetails}

                          onChange={(e) => handleInputChange('medicationDetails', e.target.value)}

                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                          rows={3}

                          placeholder="e.g., Sertraline 50mg - prescribed for anxiety and depression"

                          required={formData.onMedication === 'Yes'}

                        />

                      </div>

                    )}

                  </div>



                  {/* Disabilities */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Disabilities / Impairments

                    </label>

                    <textarea

                      value={formData.disabilities}

                      onChange={(e) => handleInputChange('disabilities', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                      rows={2}

                      placeholder="Enter any disabilities or impairments, or N/A if none"

                    />

                  </div>



                  {/* Areas Requiring Support */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-3">

                      Areas Requiring Support <span className="text-red-500">*</span>

                    </label>

                    <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">

                      {concernsOptions.map(concern => (

                        <label key={concern} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">

                          <input

                            type="checkbox"

                            checked={formData.concernsSelected.includes(concern)}

                            onChange={() => handleConcernToggle(concern)}

                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"

                          />

                          <span className="text-sm text-gray-700">{concern}</span>

                        </label>

                      ))}

                    </div>

                    <p className="text-xs text-gray-600 mt-2">

                      Selected: {formData.concernsSelected.length} {formData.concernsSelected.length === 1 ? 'concern' : 'concerns'}

                    </p>

                  </div>



                  {/* Additional Details */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Additional Details About Selected Areas <span className="text-red-500">*</span>

                    </label>

                    <textarea

                      value={formData.additionalConcernDetails}

                      onChange={(e) => handleInputChange('additionalConcernDetails', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                      rows={4}

                      placeholder="Please provide specific details about the areas selected above..."

                      required

                    />

                  </div>



                  {/* Risk Issues */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Risk Issues or Substance Misuse <span className="text-red-500">*</span>

                    </label>

                    <textarea

                      value={formData.riskIssues}

                      onChange={(e) => handleInputChange('riskIssues', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                      rows={3}

                      placeholder="Please provide details of any identified risk issues or substance misuse, or enter N/A if none"

                      required

                    />

                  </div>

                </div>

              )}

            </div>



            {/* Availability Section */}

            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">

              <SectionHeader title="Availability Schedule" section="availability" required />

              

              {expandedSections.availability && (

                <div className="p-6">

                  <p className="text-sm text-gray-700 mb-4">

                    Select the accurate days and times the client is available for weekly counselling sessions (UK time).

                    <span className="block text-xs text-gray-600 mt-1">

                      Note: Last session is at 6pm Monday-Thursday, and 5pm on Friday.

                    </span>

                  </p>



                  <div className="space-y-4">

                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (

                      <div key={day} className="border border-gray-200 rounded-lg p-4">

                        <h4 className="font-medium text-gray-900 mb-3">{day}</h4>

                        <div className="grid grid-cols-5 gap-2">

                          {timeSlots.map(slot => {

                            // Restrict Friday evening slot

                            if (day === 'Friday' && slot.value === 'evening') {

                              return null;

                            }

                            return (

                              <label

                                key={slot.value}

                                className={`flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer transition-colors ${

                                  formData.availability[day].includes(slot.value)

                                    ? 'border-purple-600 bg-purple-50 text-purple-900'

                                    : 'border-gray-300 hover:border-purple-300 text-gray-700'

                                }`}

                              >

                                <input

                                  type="checkbox"

                                  checked={formData.availability[day].includes(slot.value)}

                                  onChange={() => handleAvailabilityChange(day, slot.value)}

                                  className="sr-only"

                                />

                                <span className="text-sm font-medium">{slot.label}</span>

                              </label>

                            );

                          })}

                        </div>

                      </div>

                    ))}

                  </div>



                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">

                    <p className="text-sm text-yellow-800">

                      <strong>Important:</strong> At least one availability slot must be selected.

                    </p>

                  </div>

                </div>

              )}

            </div>



            {/* Referral Information Section */}

            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">

              <SectionHeader title="Referral Information" section="referral" />

              

              {expandedSections.referral && (

                <div className="p-6 space-y-4">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      How did they hear about our services? <span className="text-red-500">*</span>

                    </label>

                    <select

                      value={formData.howHeardAbout}

                      onChange={(e) => handleInputChange('howHeardAbout', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                    >

                      <option value="Online (Google, Bing, etc)">Online (Google, Bing, etc)</option>

                      <option value="Social Media (Facebook, Instagram)">Social Media (Facebook, Instagram)</option>

                      <option value="Referral">Referral</option>

                      <option value="Referred through an organization">Referred through an organization</option>

                      <option value="Referred through an individual">Referred through an individual</option>

                    </select>

                  </div>



                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Reasons for Referral

                    </label>

                    <textarea

                      value={formData.referralReasons}

                      onChange={(e) => handleInputChange('referralReasons', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                      rows={3}

                      placeholder="Enter reasons for referral if applicable, or N/A"

                    />

                  </div>



                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Referral's Name

                      </label>

                      <input

                        type="text"

                        value={formData.referralName}

                        onChange={(e) => handleInputChange('referralName', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="Enter referral name or N/A"

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Referral's Phone

                      </label>

                      <input

                        type="tel"

                        value={formData.referralPhone}

                        onChange={(e) => handleInputChange('referralPhone', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="Enter phone or N/A"

                      />

                    </div>

                  </div>



                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Organization Name (if applicable)

                      </label>

                      <input

                        type="text"

                        value={formData.organizationName}

                        onChange={(e) => handleInputChange('organizationName', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="Enter organization name or N/A"

                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        Organization Email

                      </label>

                      <input

                        type="email"

                        value={formData.organizationEmail}

                        onChange={(e) => handleInputChange('organizationEmail', e.target.value)}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                        placeholder="Enter organization email or N/A"

                      />

                    </div>

                  </div>

                </div>

              )}

            </div>



            {/* Admin Notes Section */}

            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">

              <SectionHeader title="Admin Notes & Payment" section="adminNotes" />

              

              {expandedSections.adminNotes && (

                <div className="p-6 space-y-4">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Internal Admin Notes

                    </label>

                    <textarea

                      value={formData.adminNotes}

                      onChange={(e) => handleInputChange('adminNotes', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"

                      rows={4}

                      placeholder="Add any internal notes about this client..."

                    />

                  </div>



                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">

                      Consultation Fee Payment Status (£13)

                    </label>

                    <select

                      value={formData.paymentStatus}

                      onChange={(e) => handleInputChange('paymentStatus', e.target.value)}

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"

                    >

                      <option value="Pending">Pending</option>

                      <option value="Paid">Paid</option>

                      <option value="Waived">Waived</option>

                    </select>

                  </div>

                </div>

              )}

            </div>



            {/* Form Actions */}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">

              <button

                type="button"

                onClick={handleDelete}

                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"

              >

                <Trash2 className="w-5 h-5" />

                Delete Client

              </button>



              <div className="flex items-center gap-4">

                <button

                  type="button"

                  onClick={() => window.history.back()}

                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"

                  style={{ backgroundColor: '#6f1d56' }}

                >

                  <Save className="w-5 h-5" />

                  Save Changes

                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}

