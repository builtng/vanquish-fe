"use client"
import React, { useState } from 'react';
import { User, Heart, Briefcase, Calendar, MessageCircle, CreditCard, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

export default function VanquishClientIntake() {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    voicemailOk: '',
    currentlyInTherapy: '',
    
    // Demographics
    gender: '',
    ethnicity: '',
    sexualOrientation: '',
    
    // Medical & Service
    serviceType: '',
    onMedication: '',
    medicationDetails: '',
    disabilities: '',
    
    // Concerns
    supportAreas: [],
    concernsDetails: '',
    riskIssues: '',
    
    // Availability - Detailed time slots
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: []
    },
    
    // Preferences
    genderPreference: 'No preference',
    agePreference: 'No preference',
    ethnicityPreference: 'No preference',
    orientationPreference: 'No preference',
    
    // Referral
    hearAboutUs: '',
    referralReason: '',
    referrerName: '',
    referrerPhone: '',
    referrerOrg: '',
    referrerEmail: '',
    
    // Payment
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    postcode: '',
    termsAccepted: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const supportAreasList = [
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
    'High sensitivity'
  ];

  // Detailed time slots as per JotForm
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

  const handleSupportAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      supportAreas: prev.supportAreas.includes(area)
        ? prev.supportAreas.filter(a => a !== area)
        : [...prev.supportAreas, area]
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

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const steps = [
    { number: 1, title: 'Personal', icon: User },
    { number: 2, title: 'About You', icon: Heart },
    { number: 3, title: 'Medical', icon: Briefcase },
    { number: 4, title: 'Concerns', icon: MessageCircle },
    { number: 5, title: 'Availability', icon: Calendar },
    { number: 6, title: 'Preferences', icon: Heart },
    { number: 7, title: 'Referral', icon: User },
    { number: 8, title: 'Payment', icon: CreditCard }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your information has been submitted successfully. We'll be in touch within 24 hours to confirm your consultation appointment.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-900 font-medium">
              Consultation Fee: £13.00 Paid
            </p>
            <p className="text-xs text-purple-700 mt-1">
              A confirmation email has been sent to {formData.email}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Taking the first step towards healing takes courage. We're here to support you on your journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl" style={{ backgroundColor: '#6f1d56' }}>
                VT
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">Vanquish Therapies</h1>
                <p className="text-sm md:text-base text-gray-600 mt-0.5 md:mt-1">Client Intake Form</p>
              </div>
            </div>
          </div>

          {/* Mobile Progress - Simple */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#6f1d56' }}>Step {currentStep} of 8</span>
              <span className="text-sm text-gray-600">{steps[currentStep - 1].title}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300" 
                style={{ 
                  backgroundColor: '#6f1d56',
                  width: `${(currentStep / 8) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Desktop Progress - Full Steps */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center" style={{ width: '12.5%' }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        currentStep >= step.number
                          ? 'text-white'
                          : 'bg-gray-200 text-gray-600'
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
                      <div className={`h-1 flex-1 mx-2 rounded transition-colors ${
                        currentStep > step.number ? '' : 'bg-gray-200'
                      }`} style={currentStep > step.number ? { backgroundColor: '#6f1d56' } : {}} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-sm md:text-base text-gray-600">Please provide your contact details so we can reach you.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
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
                    Last Name <span className="text-red-500">*</span>
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
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">We primarily communicate via email and WhatsApp</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="28"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is it okay for us to leave you a voicemail? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.voicemailOk}
                    onChange={(e) => handleInputChange('voicemailOk', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you currently in therapy/counselling anywhere else? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.currentlyInTherapy}
                    onChange={(e) => handleInputChange('currentlyInTherapy', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: About You (Demographics) */}
          {currentStep === 2 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">About You</h2>
                <p className="text-sm md:text-base text-gray-600">This information helps us match you with the right counsellor.</p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
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
                    <option value="Prefer not to say">Prefer not to say</option>
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
                    <option value="Prefer not to say">Prefer not to say</option>
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
                    <option value="Pansexual">Pansexual</option>
                    <option value="Asexual">Asexual</option>
                    <option value="Queer">Queer</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  <strong>Why we ask:</strong> This information helps us match you with a counsellor who understands your background and experiences.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Medical & Service Information */}
          {currentStep === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Medical & Service Information</h2>
                <p className="text-sm md:text-base text-gray-600">Help us understand your needs and ensure your safety.</p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please select the service you require <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange('serviceType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Mid Range">Mid Range Counselling (starting from £40+)</option>
                    <option value="Low Cost">Low Cost Counselling</option>
                    <option value="Ish">Ish's Services (Coaching/Counselling)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you currently on any medication? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.onMedication}
                    onChange={(e) => handleInputChange('onMedication', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {formData.onMedication === 'Yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please mention your medication and what it is prescribed for <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.medicationDetails}
                      onChange={(e) => handleInputChange('medicationDetails', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="E.g., Sertraline 50mg for anxiety and depression"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have any disabilities/impairments? If so, please specify <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.disabilities}
                    onChange={(e) => handleInputChange('disabilities', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please describe any disabilities or impairments, or enter 'N/A' if none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Your Concerns */}
          {currentStep === 4 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your Concerns</h2>
                <p className="text-sm md:text-base text-gray-600">Tell us what areas you would like support with.</p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Areas you require support with <span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">(Select all that apply)</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {supportAreasList.map((area) => (
                        <label key={area} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.supportAreas.includes(area)}
                            onChange={() => handleSupportAreaToggle(area)}
                            className="mt-1 w-5 h-5 rounded border-gray-300"
                            style={{ accentColor: '#6f1d56' }}
                          />
                          <span className="text-sm text-gray-700">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.supportAreas.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {formData.supportAreas.length} area(s)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide more details about your concerns <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.concernsDetails}
                    onChange={(e) => handleInputChange('concernsDetails', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="For example: My partner and I have been arguing frequently over finances..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide details of any identified risk issues or substance misuse
                  </label>
                  <textarea
                    value={formData.riskIssues}
                    onChange={(e) => handleInputChange('riskIssues', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please describe any risk factors we should be aware of, or enter 'N/A' if none"
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900 font-medium mb-1">
                  Crisis Support
                </p>
                <p className="text-sm text-red-800">
                  Vanquish Therapies is not a crisis or emergency service. If you need immediate help, please contact your GP, NHS (111), or the Samaritans (116 123).
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Availability - IMPROVED VERSION */}
          {currentStep === 5 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your Availability</h2>
                <p className="text-sm md:text-base text-gray-600">Select all time slots when you're available for weekly counselling sessions.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Important:</strong> Times are in UK timezone. Last session on Friday is at 5pm.
                </p>
              </div>
              
              <div className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                  <div key={day} className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 font-semibold text-sm capitalize bg-gray-100 border-b border-gray-300" style={{ color: '#6f1d56' }}>
                      {day}
                      {day === 'friday' && <span className="ml-2 text-xs font-normal text-gray-600">(Last session at 5pm)</span>}
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
            </div>
          )}

          {/* Step 6: Counsellor Preferences */}
          {currentStep === 6 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Counsellor Preferences</h2>
                <p className="text-sm md:text-base text-gray-600">These preferences are optional and help us find the best match for you.</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  <strong>Note:</strong> All preferences are optional. Select "No preference" if you don't have specific requirements.
                </p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender Preference
                  </label>
                  <select
                    value={formData.genderPreference}
                    onChange={(e) => handleInputChange('genderPreference', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="No preference">No preference</option>
                    <option value="Male">Prefer Male counsellor</option>
                    <option value="Female">Prefer Female counsellor</option>
                    <option value="Non-binary">Prefer Non-binary counsellor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Preference
                  </label>
                  <select
                    value={formData.agePreference}
                    onChange={(e) => handleInputChange('agePreference', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="No preference">No preference</option>
                    <option value="Younger">Prefer younger counsellor (close to my age)</option>
                    <option value="Older">Prefer older counsellor</option>
                    <option value="Similar">Prefer counsellor of similar age</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity Preference
                  </label>
                  <select
                    value={formData.ethnicityPreference}
                    onChange={(e) => handleInputChange('ethnicityPreference', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="No preference">No preference</option>
                    <option value="Prefer same">Prefer same ethnicity as me</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Orientation Preference
                  </label>
                  <select
                    value={formData.orientationPreference}
                    onChange={(e) => handleInputChange('orientationPreference', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="No preference">No preference</option>
                    <option value="LGBTQ+ specialist">Prefer LGBTQ+ specialist</option>
                    <option value="Same orientation">Prefer same orientation as me</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Referral Information */}
          {currentStep === 7 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Referral Information</h2>
                <p className="text-sm md:text-base text-gray-600">Help us understand how you found us.</p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you become aware of our services? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hearAboutUs}
                    onChange={(e) => handleInputChange('hearAboutUs', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Please select</option>
                    <option value="Online">Online (Google, Bing, etc.)</option>
                    <option value="Social Media">Social Media (Facebook, Instagram)</option>
                    <option value="Referral">Referral</option>
                    <option value="Organization">Referred through an organization</option>
                    <option value="Individual">Referred through an individual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reasons for Referral
                  </label>
                  <textarea
                    value={formData.referralReason}
                    onChange={(e) => handleInputChange('referralReason', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Please provide any additional context about your referral"
                  />
                </div>

                {(formData.hearAboutUs === 'Referral' || formData.hearAboutUs === 'Organization' || formData.hearAboutUs === 'Individual') && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referrer's Name
                        </label>
                        <input
                          type="text"
                          value={formData.referrerName}
                          onChange={(e) => handleInputChange('referrerName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="Full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referrer's Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.referrerPhone}
                          onChange={(e) => handleInputChange('referrerPhone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="+44 7700 900000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name (if applicable)
                        </label>
                        <input
                          type="text"
                          value={formData.referrerOrg}
                          onChange={(e) => handleInputChange('referrerOrg', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="Organization name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Referrer's Email
                        </label>
                        <input
                          type="email"
                          value={formData.referrerEmail}
                          onChange={(e) => handleInputChange('referrerEmail', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 8: Payment */}
          {currentStep === 8 && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Consultation Payment</h2>
                <p className="text-sm md:text-base text-gray-600">Secure your consultation appointment with a small admin fee.</p>
              </div>

              <div className="border-2 rounded-lg p-4 md:p-6 mb-4 md:mb-6" style={{ borderColor: '#6f1d56', backgroundColor: '#fcf6fa' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6f1d56' }}>Initial Consultation</p>
                    <p className="text-xs text-gray-600 mt-1">Assessment and admin fee</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold" style={{ color: '#6f1d56' }}>£13.00</p>
                </div>
                <p className="text-xs md:text-sm text-gray-700">
                  This consultation fee helps us ensure commitment to your therapeutic journey.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
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
                    I understand that missing more than one session or failing to book sessions for a week or more, without communication, may result in my reserved space being released. <span className="text-red-500">*</span>
                  </span>
                </label>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600">
                    🔒 Your payment information is secure and encrypted. This consultation/admin fee is non-refundable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 md:mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
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
              {currentStep}/8
            </div>

            {currentStep < 8 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
                style={{ backgroundColor: '#6f1d56' }}
              >
                <span className="hidden md:inline">Next</span>
                <span className="md:hidden">Next</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.termsAccepted}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-lg font-medium transition-colors text-sm md:text-base ${
                  !formData.termsAccepted ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ backgroundColor: '#6f1d56' }}
              >
                <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Complete Booking</span>
                <span className="md:hidden">Submit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}