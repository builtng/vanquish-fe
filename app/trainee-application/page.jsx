"use client";
import React, { useState, useEffect } from "react";
import { User, Briefcase, BookOpen, AlertTriangle, CheckCircle, Save, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import PublicFormWrapper from "@/components/PublicFormWrapper";

export default function TraineeApplicationPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    institution: "",
    courseName: "",
    courseDuration: "",
    experienceBackground: "",
    assessmentAnswers: {},
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [priorityQuestionIndices, setPriorityQuestionIndices] = useState([]);
  const [loading, setLoading] = useState(false);

  const core34Questions = [
    "I have felt terribly alone and isolated",
    "I have felt tense, anxious or nervous",
    "I have felt I have someone to turn to for support when needed",
    "I have felt O.K about myself",
    "I have felt totally lacking in energy and enthusiasm",
    "I have been physically violent to others",
    "I have felt able to cope when things go wrong",
    "I have been troubled by aches, pains or other physical problems",
    "I have thought of hurting myself",
    "Talking to people has felt too much for me",
    "Tension and anxiety have prevented me from doing important things",
    "I have been happy with the things I have done",
    "I have been disturbed by unwanted thoughts and feelings",
    "I have felt like crying",
    "I have felt panic or terror",
    "I made plans to end my life",
    "I have felt overwhelmed by my problems",
    "I have had difficulty getting to sleep or staying asleep",
    "I have felt warmth or affection for someone",
    "My problems have been impossible to put to one side",
    "I have been able to do most things I needed to",
    "I have threatened or intimidated another person",
    "I have felt despairing or hopeless",
    "I have thought it would be better if I were dead",
    "I have felt criticised by other people",
    "I have thought I have no friends",
    "I have felt unhappy",
    "Unwanted images or memories have been distressing me",
    "I have been irritable when with other people",
    "I have thought I am to blame for my problems and difficulties",
    "I have felt optimistic about my future",
    "I have achieved the things I wanted to",
    "I have felt humiliated or shamed by other people",
    "I have hurt myself physically or taken dangerous risks with my health",
  ];

  const assessmentOptions = [
    "Not at all",
    "Only occasionally",
    "Sometimes",
    "Often",
    "Most or all the time",
  ];

  useEffect(() => {
    // Fetch priority questions settings
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-applications/settings`);
        if (res.ok) {
          const data = await res.json();
          setPriorityQuestionIndices(data.priority_questions || []);
        }
      } catch (err) {
        console.error("Failed to fetch assessment settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      assessmentAnswers: {
        ...prev.assessmentAnswers,
        [index]: value,
      }
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.institution && formData.courseName && formData.courseDuration;
      case 3:
        return formData.experienceBackground;
      case 4:
        return Object.keys(formData.assessmentAnswers).length === core34Questions.length;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.warning("Please fill in all required fields.");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.warning("Please answer all assessment questions.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-application/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          institution: formData.institution,
          course_name: formData.courseName,
          course_duration: formData.courseDuration,
          experience_background: formData.experienceBackground,
          assessment_answers: formData.assessmentAnswers,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Application submitted successfully!");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to submit application.");
      }
    } catch (err) {
      toast.error("An error occurred during submission.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PublicFormWrapper>
        <div className="max-w-md mx-auto p-8 text-center bg-white rounded-2xl shadow-xl mt-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Received!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to Vanquish Therapies. Our team will review your application and get back to you shortly.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg"
          >
            Return to Home
          </button>
        </div>
      </PublicFormWrapper>
    );
  }

  // Group questions into priority and others
  const priorityQuestions = core34Questions
    .map((q, i) => ({ text: q, index: i }))
    .filter(q => priorityQuestionIndices.includes(q.index));
  
  const otherQuestions = core34Questions
    .map((q, i) => ({ text: q, index: i }))
    .filter(q => !priorityQuestionIndices.includes(q.index));

  const steps = [
    { n: 1, title: "Personal", icon: User },
    { n: 2, title: "Course", icon: BookOpen },
    { n: 3, title: "Experience", icon: Briefcase },
    { n: 4, title: "Assessment", icon: AlertTriangle },
  ];

  return (
    <PublicFormWrapper>
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Trainee Application</h1>
          <p className="text-purple-100 opacity-80">Stage 1: Basic Information & Initial Assessment</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center relative z-10">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= s.n ? 'bg-white text-purple-700 shadow-xl scale-110' : 'bg-purple-800 text-purple-300'
                    }`}
                  >
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs mt-3 font-medium ${currentStep >= s.n ? 'text-white' : 'text-purple-300'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${currentStep > s.n ? 'bg-white' : 'bg-purple-900 opacity-50'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in p-8 sm:p-10">
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 text-purple-700">
                <User className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input 
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input 
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="jane.smith@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="+44 7700 900000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Residential Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="Street, City, Postcode"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 text-purple-700">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Course Information</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Training Institution *</label>
                <input 
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="University or College name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name *</label>
                <input 
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => handleInputChange('courseName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="e.g. MSc in Integrative Counselling"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Duration *</label>
                <input 
                  type="text"
                  value={formData.courseDuration}
                  onChange={(e) => handleInputChange('courseDuration', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="e.g. 2 years, part-time"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 text-purple-700">
                <Briefcase className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Experience & Background</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Please describe your relevant experience or background *
                </label>
                <textarea 
                  value={formData.experienceBackground}
                  onChange={(e) => handleInputChange('experienceBackground', e.target.value)}
                  rows="10"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="Share any previous placements, volunteer work, or related career experience..."
                />
                <p className="text-xs text-gray-500 mt-2">Maximum recommended 1000 words.</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-4 text-purple-700">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Initial Assessment</h2>
              </div>
              <p className="text-gray-600 bg-purple-50 p-4 rounded-xl border border-purple-100">
                Please answer the following questions based on how you have felt over the <strong>last week</strong>.
              </p>

              {/* Priority Questions Section */}
              {priorityQuestions.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-l-4 border-purple-600 pl-4 py-1 bg-gray-50 uppercase tracking-widest text-xs">Priority Questions</h3>
                  {priorityQuestions.map((q) => (
                    <div key={q.index} className="space-y-3 pb-6 border-b border-gray-100 last:border-0">
                      <p className="font-medium text-gray-800">{q.index + 1}. {q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        {assessmentOptions.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => handleAssessmentChange(q.index, opt)}
                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                              formData.assessmentAnswers[q.index] === opt 
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Remaining Questions Section */}
              <div className="space-y-6 pt-4">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-gray-400 pl-4 py-1 bg-gray-50 uppercase tracking-widest text-xs">Remaining Questions</h3>
                {otherQuestions.map((q) => (
                  <div key={q.index} className="space-y-3 pb-6 border-b border-gray-100 last:border-0">
                    <p className="font-medium text-gray-800">{q.index + 1}. {q.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {assessmentOptions.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleAssessmentChange(q.index, opt)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                            formData.assessmentAnswers[q.index] === opt 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
            {currentStep > 1 ? (
              <button 
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-xl hover:shadow-2xl active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        <p className="text-center text-purple-200 mt-8 text-sm opacity-60">
          Vanquish Therapies © 2026 • Secure Professional Application
        </p>
      </div>
    </PublicFormWrapper>
  );
}
