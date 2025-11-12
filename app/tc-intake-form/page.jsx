"use client"
import React, { useState } from 'react';
import { User, Shield, GraduationCap, Heart, Calendar, Upload, CheckCircle, ChevronRight, ChevronLeft, FileText, AlertTriangle } from 'lucide-react';

export default function VanquishTCApplication() {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    email: '',
    phone: '',
    sexualOrientation: '',
    address: '',
    city: '',
    postcode: '',
    beliefs: [],
    otherBeliefs: '',
    disabilities: '',
    medicalConditions: '',
    
    // Professional Status
    hasIndemnityInsurance: '',
    professionalBodyMember: '',
    professionalBodyDetails: '',
    dbsRegistered: '',
    inPersonalTherapy: '',
    personalTherapyReason: '',
    hasClinicalSupervisor: '',
    supervisorReason: '',
    previousOnlineCounselling: '',
    
    // Availability
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: []
    },
    
    // Course Information
    trainingOrgName: '',
    trainingOrgAddress: '',
    tutorName: '',
    tutorEmail: '',
    tutorPhone: '',
    placementLeadName: '',
    placementLeadPhone: '',
    placementLeadEmail: '',
    courseTitle: '',
    expectedQualification: '',
    courseFocus: '',
    faceToFaceRequired: '',
    faceToFaceHours: '',
    currentClients: '',
    clientCount: '',
    completedHours: '',
    skillsPractice: '',
    
    // Experience & Journey
    familyDifficulties: '',
    personalJourney: '',
    selfAwareness: '',
    counsellorTraining: '',
    experienceAreas: '',
    developmentAreas: '',
    theoreticalApproach: '',
    
    // Topics & Areas - NEW SECTIONS
    topicsExperienceWith: [],
    topicsExperienceOther: '',
    topicsNotReady: [],
    topicsNotReadyOther: '',
    
    psgDay: '',
    psgDayOther: '',
    
    // Documents
    fitnessTopractice: null,
    qualifications: null,
    dbs: null,
    cv: null,
    validId: null,
    insurance: null,
    
    // Terms
    criminalConviction: '',
    termsAccepted: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const beliefsList = [
    'Atheism',
    'Agnosticism',
    'Buddhism',
    'Christianity',
    'Hinduism',
    'Islam',
    'Judaism',
    'Sikhism',
    'Spiritual',
    'Taoism'
  ];
  
  // Comprehensive list of therapy topics/issues
  const therapyTopics = [
    'Abuse (Physical, Emotional, Sexual)',
    'Addiction & Substance Misuse',
    'Anger Management',
    'Anxiety & Panic Attacks',
    'Bereavement & Grief',
    'Body Image Issues',
    'Childhood Trauma',
    'Depression',
    'Domestic Violence',
    'Eating Disorders',
    'Family Conflicts',
    'Gender Identity Issues',
    'Health Anxiety',
    'Infidelity',
    'LGBTQ+ Issues',
    'Low Self-Esteem',
    'OCD (Obsessive Compulsive Disorder)',
    'Parenting Issues',
    'Phobias',
    'PTSD (Post-Traumatic Stress Disorder)',
    'Racial & Cultural Identity',
    'Relationship Issues',
    'Self-Harm',
    'Sexual Abuse/Assault',
    'Social Anxiety',
    'Stress Management',
    'Suicidal Ideation',
    'Work-Related Stress'
  ];

  const timeSlots = [
    { value: '10am-11am', label: '10:00 AM - 11:00 AM', category: 'Morning' },
    { value: '11am-1pm', label: '11:00 AM - 1:00 PM', category: 'Morning' },
    { value: '1pm-4pm', label: '1:00 PM - 4:00 PM', category: 'Afternoon' },
    { value: '4pm-5pm', label: '4:00 PM - 5:00 PM', category: 'Afternoon' },
    { value: '5pm-7pm', label: '5:00 PM - 7:00 PM', category: 'Evening' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBeliefsToggle = (belief) => {
    setFormData(prev => ({
      ...prev,
      beliefs: prev.beliefs.includes(belief)
        ? prev.beliefs.filter(b => b !== belief)
        : [...prev.beliefs, belief]
    }));
  };
  
  const handleTopicToggle = (field, topic) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(topic)
        ? prev[field].filter(t => t !== topic)
        : [...prev[field], topic]
    }));
  };

  const handleAvailabilityToggle = (day, slot) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].includes(slot)
          ? prev.availability[day].filter(s => s !== slot)
          : [...prev.availability[day], slot]
      }
    }));
  };

  const handleFileUpload = (field, files) => {
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const steps = [
    { number: 1, title: 'Personal', icon: User },
    { number: 2, title: 'Professional', icon: Shield },
    { number: 3, title: 'Course Info', icon: GraduationCap },
    { number: 4, title: 'Your Journey', icon: Heart },
    { number: 5, title: 'Availability', icon: Calendar },
    { number: 6, title: 'Documents', icon: Upload },
    { number: 7, title: 'Review', icon: FileText }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to join Vanquish Therapies as a Training Counsellor. We'll review your application and be in touch soon.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-900 font-medium mb-2">
              Next Steps:
            </p>
            <p className="text-xs text-purple-700 text-left">
              • Stage 1: Application review (you are here)<br/>
              • Stage 2: Short virtual video interview (5 questions)<br/>
              • Stage 3: Face-to-face virtual interview
            </p>
          </div>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to {formData.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl" style={{ backgroundColor: '#6f1d56' }}>
                VT
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">Vanquish Therapies</h1>
                <p className="text-sm md:text-base text-gray-600 mt-0.5 md:mt-1">Trainee Counsellor Application (Stage 1)</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
            <p className="text-sm text-orange-900 font-medium mb-2">Before proceeding:</p>
            <ul className="text-xs text-orange-800 space-y-1 list-disc list-inside">
              <li>You must have commenced your course</li>
              <li>Completed fitness-to-practise assessment</li>
              <li>Received official Fitness to Practise document</li>
              <li>Applications with pending fitness to practise will not be processed</li>
            </ul>
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#6f1d56' }}>Step {currentStep} of 7</span>
              <span className="text-sm text-gray-600">{steps[currentStep - 1].title}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300" 
                style={{ 
                  backgroundColor: '#6f1d56',
                  width: `${(currentStep / 7) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Desktop Progress */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.number ? 'text-white' : 'bg-gray-200 text-gray-600'
                    }`} style={currentStep >= step.number ? { backgroundColor: '#6f1d56' } : {}}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      currentStep >= step.number ? 'font-medium' : 'text-gray-500'
                    }`} style={currentStep >= step.number ? { color: '#6f1d56' } : {}}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded ${
                      currentStep > step.number ? '' : 'bg-gray-200'
                    }`} style={currentStep > step.number ? { backgroundColor: '#6f1d56' } : {}} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Candidate Information</h2>
                <p className="text-sm md:text-base text-gray-600">Please provide your personal details as they appear on your ID.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name (As per ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name (As per ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ethnicity}
                    onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Asian">Asian</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Hispanic/Latino">Hispanic/Latino</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Orientation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sexualOrientation}
                    onChange={(e) => handleInputChange('sexualOrientation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Heterosexual">Heterosexual</option>
                    <option value="Gay">Gay</option>
                    <option value="Lesbian">Lesbian</option>
                    <option value="Bisexual">Bisexual</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps us match counsellors with clients who may feel more comfortable with certain perspectives
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="john@example.com"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Registered Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="London"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Please select your beliefs <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {beliefsList.map((belief) => (
                        <label key={belief} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.beliefs.includes(belief)}
                            onChange={() => handleBeliefsToggle(belief)}
                            className="w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: '#6f1d56' }}
                          />
                          <span className="text-sm text-gray-700">{belief}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.beliefs.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other (If not listed above, please specify)
                    </label>
                    <input
                      type="text"
                      value={formData.otherBeliefs}
                      onChange={(e) => handleInputChange('otherBeliefs', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Specify other beliefs"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have any disabilities/impairments? If so, please specify <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.disabilities}
                    onChange={(e) => handleInputChange('disabilities', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please specify or enter 'None'"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have any medical conditions, illnesses or diagnoses that you do not consider a disability? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please specify or enter 'None'"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Status */}
          {currentStep === 2 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Professional Status</h2>
                <p className="text-sm md:text-base text-gray-600">Please provide your professional credentials and requirements.</p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you currently hold Professional Indemnity Insurance? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hasIndemnityInsurance}
                    onChange={(e) => handleInputChange('hasIndemnityInsurance', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you a member of a recognised Counselling/Psychotherapy body? (e.g., NCPS/BACP/Other) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.professionalBodyMember}
                    onChange={(e) => handleInputChange('professionalBodyMember', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {formData.professionalBodyMember === 'Yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please provide your membership details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.professionalBodyDetails}
                      onChange={(e) => handleInputChange('professionalBodyDetails', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., BACP Member Number: 123456, Expiry: 12/2025"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you registered with the DBS update service? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.dbsRegistered}
                    onChange={(e) => handleInputChange('dbsRegistered', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">We will be carrying out a status check</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you currently in Personal Therapy with a Qualified Counsellor? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.inPersonalTherapy}
                    onChange={(e) => handleInputChange('inPersonalTherapy', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">This is a requirement for our placement</p>
                </div>

                {formData.inPersonalTherapy === 'No' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please briefly explain why <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.personalTherapyReason}
                      onChange={(e) => handleInputChange('personalTherapyReason', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., Completed required hours, still searching for a qualified counsellor, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you currently have a Clinical Supervisor? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hasClinicalSupervisor}
                    onChange={(e) => handleInputChange('hasClinicalSupervisor', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {formData.hasClinicalSupervisor === 'No' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please briefly explain why <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.supervisorReason}
                      onChange={(e) => handleInputChange('supervisorReason', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., I will start when I have clients, cannot find a supervisor, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you previously attended or are you currently attending online counselling? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.previousOnlineCounselling}
                    onChange={(e) => handleInputChange('previousOnlineCounselling', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes (Individual)">Yes (Individual counselling)</option>
                    <option value="Yes (Couples)">Yes (Couples counselling)</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Course Information - keeping original */}
          {currentStep === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Current Course Information</h2>
                <p className="text-sm md:text-base text-gray-600">Details about your training and current practice.</p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Organization/College Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.trainingOrgName}
                    onChange={(e) => handleInputChange('trainingOrgName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., London College of Counselling"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Organization Address & Postcode <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.trainingOrgAddress}
                    onChange={(e) => handleInputChange('trainingOrgAddress', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Full address including postcode"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tutor's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tutorName}
                      onChange={(e) => handleInputChange('tutorName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Tutor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tutor's Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.tutorEmail}
                      onChange={(e) => handleInputChange('tutorEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="tutor@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tutor's Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.tutorPhone}
                      onChange={(e) => handleInputChange('tutorPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="+44 7700 900000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placement Lead Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.placementLeadName}
                      onChange={(e) => handleInputChange('placementLeadName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Placement lead name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placement Lead Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.placementLeadPhone}
                      onChange={(e) => handleInputChange('placementLeadPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="+44 7700 900000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placement Lead Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.placementLeadEmail}
                      onChange={(e) => handleInputChange('placementLeadEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="placement@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title / Title of Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., Diploma in Person-Centred Counselling"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Expected to Qualify <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expectedQualification}
                    onChange={(e) => handleInputChange('expectedQualification', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is your counselling course focused on individual counselling, couples counselling, or both? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.courseFocus}
                    onChange={(e) => handleInputChange('courseFocus', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Individual">Individual counselling</option>
                    <option value="Couples">Couples counselling</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does your Training Organisation require you to complete face-to-face hours before commencing online counselling? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.faceToFaceRequired}
                    onChange={(e) => handleInputChange('faceToFaceRequired', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., Yes, 40 hours required OR No"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you currently have face-to-face (individual or couples) clients? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.currentClients}
                    onChange={(e) => handleInputChange('currentClients', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes (Individual)">Yes (Individual)</option>
                    <option value="Yes (Couples)">Yes (Couples)</option>
                    <option value="Yes (Both)">Yes (Both)</option>
                    <option value="None">None</option>
                  </select>
                </div>

                {formData.currentClients && formData.currentClients !== 'None' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many clients are you seeing at present? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.clientCount}
                      onChange={(e) => handleInputChange('clientCount', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., 3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many face-to-face hours have you completed to date? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.completedHours}
                    onChange={(e) => handleInputChange('completedHours', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does your course cover skills practice? Please specify the method and duration <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.skillsPractice}
                    onChange={(e) => handleInputChange('skillsPractice', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., Using the Fishbowl method or taking turns being the Counsellor, Observer, and Client..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Your Journey & Experience - NOW WITH NEW TOPIC SECTIONS */}
          {currentStep === 4 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your Journey & Experience</h2>
                <p className="text-sm md:text-base text-gray-600">Share your story and professional development.</p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What difficulties have you encountered within your family structure, and how has this impacted and influenced your journey? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.familyDifficulties}
                    onChange={(e) => handleInputChange('familyDifficulties', e.target.value)}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please share your reflections..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please tell us about the personal journey which led you to pursue a career in counselling <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.personalJourney}
                    onChange={(e) => handleInputChange('personalJourney', e.target.value)}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Share your story..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Self-awareness is essential to counselling. Please give us an example of your own self-awareness and negative patterns of behaviour <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.selfAwareness}
                    onChange={(e) => handleInputChange('selfAwareness', e.target.value)}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Reflect on your self-awareness..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please mention all Counsellor-related training, education and voluntary/paid experiences (including number of hours) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.counsellorTraining}
                    onChange={(e) => handleInputChange('counsellorTraining', e.target.value)}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="List all relevant training and experience..."
                  />
                </div>

                {/* NEW SECTION: Topics with Experience */}
                <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Topics You HAVE Experience Working With <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Select all topics/issues you have professional experience with, either through training, placement, or practice. This helps us match you with suitable clients.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border border-green-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {therapyTopics.map((topic) => (
                        <label key={topic} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-green-50 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.topicsExperienceWith.includes(topic)}
                            onChange={() => handleTopicToggle('topicsExperienceWith', topic)}
                            className="mt-0.5 w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: '#10b981' }}
                          />
                          <span className="text-sm text-gray-700">{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other topics with experience (not listed above)
                    </label>
                    <textarea
                      value={formData.topicsExperienceOther}
                      onChange={(e) => handleInputChange('topicsExperienceOther', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., Workplace bullying, Chronic illness adjustment, etc."
                    />
                  </div>
                  
                  {formData.topicsExperienceWith.length > 0 && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        ✓ You selected {formData.topicsExperienceWith.length} topic(s) with experience
                      </p>
                    </div>
                  )}
                </div>

                {/* NEW SECTION: Topics Not Ready For */}
                <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Topics You Are NOT YET READY to Work With <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Please be honest about topics/issues you're not yet ready to handle. This is essential for ethical practice, your wellbeing, and client safety. There is no judgment - it shows good self-awareness.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border border-orange-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {therapyTopics.map((topic) => (
                        <label key={topic} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-orange-50 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.topicsNotReady.includes(topic)}
                            onChange={() => handleTopicToggle('topicsNotReady', topic)}
                            className="mt-0.5 w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: '#f59e0b' }}
                          />
                          <span className="text-sm text-gray-700">{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other topics not ready for (not listed above)
                    </label>
                    <textarea
                      value={formData.topicsNotReadyOther}
                      onChange={(e) => handleInputChange('topicsNotReadyOther', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="e.g., Complex PTSD, Severe personality disorders, etc."
                    />
                  </div>
                  
                  {formData.topicsNotReady.length > 0 && (
                    <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                      <p className="text-sm font-medium text-orange-900">
                        ⚠ You selected {formData.topicsNotReady.length} topic(s) you're not ready for
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What areas of personal development do you need to improve on to assist your therapeutic work? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.developmentAreas}
                    onChange={(e) => handleInputChange('developmentAreas', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Reflect on areas for growth..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you describe your theoretical approach? (e.g., Person-centred, CBT) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.theoreticalApproach}
                    onChange={(e) => handleInputChange('theoreticalApproach', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Describe your therapeutic approach..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Steps 5, 6, 7 remain the same - continuing from previous code... */}
          {/* Step 5: Availability */}
          {currentStep === 5 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your Availability</h2>
                <p className="text-sm md:text-base text-gray-600">Select all time slots when you're available to attend online counselling sessions with clients.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Important: Be realistic with your schedule</p>
                <p className="text-xs text-blue-800">
                  Once you begin working with clients, it's difficult to modify your availability as we require consistency. 
                  Practice timings: Mon-Thu 10am-7pm (last session 6:50pm), Fri last session 5:50pm.
                </p>
              </div>
              
              <div className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                  <div key={day} className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 font-semibold text-sm capitalize bg-gray-100 border-b border-gray-300" style={{ color: '#6f1d56' }}>
                      {day}
                      {day === 'friday' && <span className="ml-2 text-xs font-normal text-gray-600">(Last session at 5:50pm)</span>}
                    </div>
                    <div className="p-4">
                      <div className="space-y-2">
                        {timeSlots.map((slot) => (
                          <label key={slot.value} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.availability[day].includes(slot.value)}
                              onChange={() => handleAvailabilityToggle(day, slot.value)}
                              className="w-5 h-5 rounded border-gray-300"
                              style={{ accentColor: '#6f1d56' }}
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{slot.label}</span>
                              <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ 
                                backgroundColor: slot.category === 'Morning' ? '#fef3c7' : 
                                                 slot.category === 'Afternoon' ? '#dbeafe' : '#fce7f3',
                                color: slot.category === 'Morning' ? '#92400e' : 
                                       slot.category === 'Afternoon' ? '#1e40af' : '#9f1239'
                              }}>
                                {slot.category}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {Object.values(formData.availability).some(day => day.length > 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 font-medium mb-2">
                    Your selected availability:
                  </p>
                  {Object.entries(formData.availability).map(([day, slots]) => 
                    slots.length > 0 && (
                      <p key={day} className="text-sm text-green-800 capitalize">
                        <strong>{day}:</strong> {slots.map(s => timeSlots.find(t => t.value === s)?.label).join(', ')}
                      </p>
                    )
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select the day you would be able to attend the Monthly Mandatory Peer Support Group (PSG) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.psgDay}
                  onChange={(e) => handleInputChange('psgDay', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                >
                  <option value="">Please select</option>
                  <option value="Monday 7pm-8:30pm">Monday 7:00 PM - 8:30 PM</option>
                  <option value="Wednesday 7pm-8:30pm">Wednesday 7:00 PM - 8:30 PM</option>
                  <option value="Thursday 7pm-8:30pm">Thursday 7:00 PM - 8:30 PM</option>
                  <option value="None">None of the above</option>
                </select>
              </div>

              {formData.psgDay === 'None' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify why you cannot attend any PSG sessions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.psgDayOther}
                    onChange={(e) => handleInputChange('psgDayOther', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please explain..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 6: Documents */}
          {currentStep === 6 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Required Documents</h2>
                <p className="text-sm md:text-base text-gray-600">Please upload all mandatory documents. Incomplete applications will need to be re-submitted.</p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-sm text-red-900 font-medium mb-2">Important:</p>
                <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                  <li>All mandatory documents must be uploaded with your application</li>
                  <li>We cannot accept documents submitted via email separately</li>
                  <li>Qualification certificates or documents addressed to nicknames/aliases will not be accepted</li>
                  <li>DBS certificate must be Enhanced (Adult Workforce) and no more than 2 years old</li>
                </ul>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness to Practise Document <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload('fitnessTopractice', e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">ONLY APPLY IF YOU HAVE RECEIVED THIS</p>
                  {formData.fitnessTopractice && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.fitnessTopractice.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prior Counselling Qualifications <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload('qualifications', e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {formData.qualifications && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.qualifications.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enhanced DBS (Adult Workforce) - Max 2 years old <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload('dbs', e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {formData.dbs && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.dbs.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload('cv', e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.doc,.docx"
                  />
                  {formData.cv && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.cv.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid ID (Passport or Driving Licence) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload('validId', e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">For insurance purposes, we need to verify your Right to Work in the UK</p>
                  {formData.validId && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.validId.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copy of Indemnity Insurance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload('insurance', e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {formData.insurance && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.insurance.name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Review & Submit */}
          {currentStep === 7 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-sm md:text-base text-gray-600">Final information and declaration.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have you been convicted of a criminal offence within the last 6 months? <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.criminalConviction}
                  onChange={(e) => handleInputChange('criminalConviction', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent mb-2"
                >
                  <option value="">Please select</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {formData.criminalConviction === 'Yes' && (
                  <textarea
                    placeholder="Please give details of date(s), offence(s), and sentence(s) passed"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent mt-2"
                  />
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
                <div className="space-y-3 text-sm">
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Course:</strong> {formData.courseTitle || 'Not specified'}</p>
                  <p><strong>Expected Qualification:</strong> {formData.expectedQualification || 'Not specified'}</p>
                  <p><strong>Availability Slots:</strong> {
                    Object.values(formData.availability).flat().length || 0
                  } time slots selected</p>
                  <p><strong>Topics with Experience:</strong> {formData.topicsExperienceWith.length} selected</p>
                  <p><strong>Topics Not Ready For:</strong> {formData.topicsNotReady.length} selected</p>
                  <p><strong>Documents Uploaded:</strong> {
                    [formData.fitnessTopractice, formData.qualifications, formData.dbs, formData.cv, formData.validId, formData.insurance]
                      .filter(Boolean).length
                  } of 6</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                    style={{ accentColor: '#6f1d56' }}
                  />
                  <span className="text-sm text-gray-700">
                    I certify that the information provided above is true and of accurate record. I understand that providing false information may result in the termination of my application or placement. <span className="text-red-500">*</span>
                  </span>
                </label>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600">
                    Thank you for completing the application. We will be in touch soon. Please note: a copy of this application will not be provided. We may collect anonymised information for educational and training purposes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 md:mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-sm md:text-base ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">Previous</span>
              <span className="md:hidden">Back</span>
            </button>

            <div className="text-sm text-gray-600 font-medium md:hidden">
              {currentStep}/7
            </div>

            {currentStep < 7 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium text-sm md:text-base"
                style={{ backgroundColor: '#6f1d56' }}
              >
                Next
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.termsAccepted}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium text-sm md:text-base ${
                  !formData.termsAccepted ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ backgroundColor: '#6f1d56' }}
              >
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}