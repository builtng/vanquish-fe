"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import apiService from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Users, Search, Filter, ChevronDown, MoreVertical, Eye,
  Mail, Phone, Calendar, Edit, Trash2, ArrowUpDown, X,
  CheckCircle, Clock, AlertTriangle, Video, FileText,
  UserCheck, Activity, ChevronRight, MapPin, User, 
  Download, Send, Archive, Plus, ChevronLeft,
  CreditCard, Package, AlertCircle, Check, XCircle,
  Save, ChevronUp, Award, BookOpen, Briefcase,
  GraduationCap, FileCheck, Shield, Building2, RefreshCw, CalendarDays
} from 'lucide-react';

export default function TrainingProvidersPage() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [trainingProviders, setTrainingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch training providers data from API (aggregated from training counsellors)
  useEffect(() => {
    const fetchTrainingProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all training counsellors
        const tcsData = await apiService.getTrainingCounsellors();
        const tcs = Array.isArray(tcsData) ? tcsData : [];
        
        // Group TCs by training organization
        const providersMap = new Map();
        
        tcs.forEach(tc => {
          // Get training org info from TC data (now includes intake form data)
          const orgName = tc.training_org_name || tc.institution || 'Unknown Organization';
          const orgAddress = tc.training_org_address || '';
          const courseTitle = tc.course_title || tc.course || 'Unknown Course';
          const tutorName = tc.tutor_name || 'Not provided';
          const tutorEmail = tc.tutor_email || 'Not provided';
          const tutorPhone = tc.tutor_phone || 'Not provided';
          const placementLeadName = tc.placement_lead_name || 'Not provided';
          const placementLeadEmail = tc.placement_lead_email || 'Not provided';
          const placementLeadPhone = tc.placement_lead_phone || 'Not provided';
          
          // Create unique key for organization + course
          const key = `${orgName}|${courseTitle}`;
          
          if (!providersMap.has(key)) {
            providersMap.set(key, {
              id: `TP${String(providersMap.size + 1).padStart(3, '0')}`,
              name: orgName,
              address: orgAddress,
              courses: []
            });
          }
          
          const provider = providersMap.get(key);
          
          // Check if course already exists
          let course = provider.courses.find(c => c.courseTitle === courseTitle);
          
          if (!course) {
            course = {
              courseTitle: courseTitle,
              tutorName: tutorName,
              tutorEmail: tutorEmail,
              tutorPhone: tutorPhone,
              placementLeadName: placementLeadName,
              placementLeadEmail: placementLeadEmail,
              placementLeadPhone: placementLeadPhone,
              practitioners: []
            };
            provider.courses.push(course);
          }
          
          // Add practitioner to course
          course.practitioners.push(tc.name);
        });
        
        // Convert map to array
        const providers = Array.from(providersMap.values());
        setTrainingProviders(providers);
        
      } catch (err) {
        console.error('Error fetching training providers:', err);
        setError('Failed to load training providers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingProviders();
  }, []);

  // Mock Training Providers Data (removed - now using API)
  const oldTrainingProviders = [
    {
      id: 'TP001',
      name: 'Salford University',
      address: '43 Crescent, Salford M5 4WT',
      courses: [
        {
          courseTitle: 'BSc in Therapy & Coaching',
          tutorName: 'Rachel Zuzu',
          tutorEmail: 'r.zuzu@salford.ac.uk',
          tutorPhone: '+44 161 295 5000',
          placementLeadName: 'Zara',
          placementLeadEmail: 'zara@salford.ac.uk',
          placementLeadPhone: '+44 161 295 5001',
          practitioners: ['Sarah Johnson', 'James Wilson']
        }
      ]
    },
    {
      id: 'TP002',
      name: 'CPCAB',
      address: 'London, UK',
      courses: [
        {
          courseTitle: 'Level 4 Diploma in Therapeutic Counselling',
          tutorName: 'Dr. Michael Thompson',
          tutorEmail: 'm.thompson@cpcab.co.uk',
          tutorPhone: '+44 20 1234 5678',
          placementLeadName: 'Emma Brown',
          placementLeadEmail: 'e.brown@cpcab.co.uk',
          placementLeadPhone: '+44 20 1234 5679',
          practitioners: ['David Chen', 'Priya Patel']
        }
      ]
    },
    {
      id: 'TP003',
      name: 'Manchester Metropolitan University',
      address: 'All Saints Building, Manchester M15 6BH',
      courses: [
        {
          courseTitle: 'MA in Counselling and Psychotherapy',
          tutorName: 'Prof. Sarah Williams',
          tutorEmail: 's.williams@mmu.ac.uk',
          tutorPhone: '+44 161 247 2000',
          placementLeadName: 'John Smith',
          placementLeadEmail: 'j.smith@mmu.ac.uk',
          placementLeadPhone: '+44 161 247 2001',
          practitioners: ['Mohammed Ali']
        }
      ]
    }
  ];

  const filteredProviders = trainingProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.courses.some(c => c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = filterCourse === 'all' || 
                         provider.courses.some(c => c.courseTitle === filterCourse);
    return matchesSearch && matchesCourse;
  }).sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

  const allCourses = [...new Set(trainingProviders.flatMap(p => p.courses.map(c => c.courseTitle)))];

  return (
    <PageGuard menuId="providers">
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          actions={
            <button
              onClick={() => window.location.reload()}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Training Providers</h1>
            <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">Training providers & tutors information collected from practitioner applications</p>
          </div>
        </DashboardHeader>

        {/* Stats Cards */}
        <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">Total Providers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{trainingProviders.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{trainingProviders.reduce((sum, p) => sum + p.courses.length, 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">Total Practitioners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{trainingProviders.reduce((sum, p) => sum + p.courses.reduce((s, c) => s + c.practitioners.length, 0), 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">Active Contacts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{trainingProviders.reduce((sum, p) => sum + p.courses.length * 2, 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search providers, courses, or contacts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div className="min-w-[120px] flex-shrink-0">
              <SearchableSelect
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                options={[
                  { value: 'all', label: 'All Courses' },
                  ...allCourses.map(course => ({ value: course, label: course }))
                ]}
                placeholder="All Courses"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
          {loading && trainingProviders.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 dark:text-[var(--text-tertiary)] animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">Loading training providers...</p>
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
                    onClick={() => window.location.reload()}
                    className="text-sm text-red-700 dark:text-red-300 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {!loading && filteredProviders.map(provider => (
              <div key={provider.id} className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">{provider.name}</h2>
                    {provider.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {provider.courses.map((course, index) => (
                    <div key={index} className="border border-gray-200 dark:border-[var(--card-border)] rounded-lg p-4 bg-white dark:bg-[var(--card-bg)]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-3">{course.courseTitle}</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Tutor / Programme Lead */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Tutor / Programme Lead</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">{course.tutorName}</p>
                          <div className="mt-2 space-y-1">
                            {course.tutorEmail && course.tutorEmail !== 'Not provided' ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                                <Mail className="w-4 h-4" />
                                <a href={`mailto:${course.tutorEmail}`} className="hover:text-blue-600 dark:hover:text-blue-400">{course.tutorEmail}</a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-tertiary)]">
                                <Mail className="w-4 h-4" />
                                <span>{course.tutorEmail || 'Not provided'}</span>
                              </div>
                            )}
                            {course.tutorPhone && course.tutorPhone !== 'Not provided' ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                                <Phone className="w-4 h-4" />
                                <a href={`tel:${course.tutorPhone}`} className="hover:text-blue-600 dark:hover:text-blue-400">{course.tutorPhone}</a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-tertiary)]">
                                <Phone className="w-4 h-4" />
                                <span>{course.tutorPhone || 'Not provided'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Placement Lead */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Placement Lead</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">{course.placementLeadName}</p>
                          <div className="mt-2 space-y-1">
                            {course.placementLeadEmail && course.placementLeadEmail !== 'Not provided' ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                                <Mail className="w-4 h-4" />
                                <a href={`mailto:${course.placementLeadEmail}`} className="hover:text-green-600 dark:hover:text-green-400">{course.placementLeadEmail}</a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-tertiary)]">
                                <Mail className="w-4 h-4" />
                                <span>{course.placementLeadEmail || 'Not provided'}</span>
                              </div>
                            )}
                            {course.placementLeadPhone && course.placementLeadPhone !== 'Not provided' ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                                <Phone className="w-4 h-4" />
                                <a href={`tel:${course.placementLeadPhone}`} className="hover:text-green-600 dark:hover:text-green-400">{course.placementLeadPhone}</a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-tertiary)]">
                                <Phone className="w-4 h-4" />
                                <span>{course.placementLeadPhone || 'Not provided'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Practitioners */}
                      {course.practitioners.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                          <p className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">Practitioners from this course:</p>
                          <div className="flex flex-wrap gap-2">
                            {course.practitioners.map((practitioner, pIndex) => (
                              <span key={pIndex} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 ring-1 ring-inset ring-purple-600/20 dark:ring-purple-500/30 text-sm rounded-full">
                                {practitioner}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {!loading && filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-2">No Training Providers Found</h3>
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
    </PageGuard>
  );
}

