"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  FileText,
  BadgeCheck,
  CheckCircle,
  AlertCircle,
  Save,
  ArrowLeft,
  Loader2,
  Trash2,
  Upload,
  Plus,
  RefreshCw,
  ChevronRight,
  Home,
  Briefcase,
  GraduationCap,
  Sparkles,
  Users,
  Clock,
  MessageSquare
} from "lucide-react";
import apiService from "@/lib/api";
import { toast } from "react-toastify";
import PageGuard from "@/components/PageGuard";

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "professional", label: "Professional Status", icon: Shield },
  { id: "course", label: "Course Information", icon: GraduationCap },
  { id: "experience", label: "Experience & Journey", icon: Briefcase },
  { id: "availability", label: "Availability", icon: Clock },
  { id: "documents", label: "Documents", icon: FileText }
];

export default function InternalFormPage() {
  const { type, id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState(null);
  const [activeHistory, setActiveHistory] = useState(null); // The TraineeApplication or ClientIntakeForm
  
  const [formData, setFormData] = useState({
    // Personal information
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    ethnicity: "",
    sexual_orientation: "",
    address: "",
    beliefs: "",
    beliefs_other: "",
    disabilities: "",
    medical_conditions: "",

    // Fitness to Practise / Professional
    has_insurance: "",
    professional_body_member: "",
    professional_body_details: "",
    dbs_update_service: "",
    dbs_update_details: "",
    in_personal_therapy: "",
    personal_therapy_reason: "",
    has_clinical_supervisor: "",
    supervisor_reason: "",
    previous_online_counselling: "",
    criminal_convictions: "",

    // Course information
    institution: "",
    college_address: "",
    tutor_name: "",
    tutor_email: "",
    tutor_phone: "",
    placement_lead_name: "",
    placement_lead_email: "",
    placement_lead_phone: "",
    course_name: "",
    course_title: "",
    course_duration: "",
    expected_qualification_date: "",
    counselling_type: "",
    face_to_face_requirement: "",
    has_face_to_face_clients: "",
    face_to_face_client_count: "",
    face_to_face_hours_completed: "",
    skills_practice_details: "",

    // Experience & journey
    experience_background: "",
    family_impact: "",
    personal_journey: "",
    self_awareness: "",
    training_history: "",
    areas_of_experience: "",
    personal_development_areas: "",
    theoretical_approach: "",

    // PSG & Availability
    psg_day_preference: "",
    psg_reason: "",
    availability_schedule: "",
    
    // Status
    status: "New Application",
    source: "internal_form"
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (type === "tc") {
        data = await apiService.getTrainingCounsellorDetails(id);
        setContact(data);
        
        // Populate initial form from basic TC data
        setFormData(prev => ({
          ...prev,
          first_name: data.name.split(' ')[0] || "",
          last_name: data.name.split(' ').slice(1).join(' ') || "",
          email: data.email || "",
          phone: data.phone || "",
          institution: data.institution || "",
          course_name: data.course || "",
          theoretical_approach: data.modality || ""
        }));

        // Search for TraineeApplication by email
        if (data.email) {
          try {
            // Use search endpoint if available, but for now we look at the TC's application history
            // Actually, we can fetch all applications and filter (not ideal but safe for now)
            const apps = await apiService.getTraineeApplications({ search: data.email });
            if (apps.data && apps.data.length > 0) {
              const app = apps.data[0];
              setActiveHistory(app);
              populateFrom(app);
            }
          } catch (err) {
            console.error("Error looking up application history:", err);
          }
        }
      } else if (type === "client") {
        const clients = await apiService.getClients({ search: id }); // UUID or ID
        if (clients.data && clients.data.length > 0) {
          data = clients.data[0];
          setContact(data);
          // TODO: Populate from Client data or ClientIntakeForm
        }
      }
    } catch (error) {
      console.error("Error fetching contact data:", error);
      toast.error("Failed to load contact data");
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  const populateFrom = (sourceData) => {
    const updated = { ...formData };
    Object.keys(updated).forEach(key => {
      if (sourceData[key] !== undefined && sourceData[key] !== null) {
        if (key === 'date_of_birth' && sourceData[key]) {
          updated[key] = new Date(sourceData[key]).toISOString().split('T')[0];
        } else {
          updated[key] = String(sourceData[key]);
        }
      }
    });
    setFormData(updated);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Map form data to endpoint expectations
      const payload = {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`,
        create_tc: type === 'tc',
        create_client: type === 'client'
      };

      if (type === 'tc') {
        await apiService.submitTcIntake(payload);
        toast.success("Internal form updated successfully");
      } else {
        await apiService.submitClientIntake(payload);
        toast.success("Internal form updated successfully");
      }
      
      router.back();
    } catch (error) {
      console.error("Error saving internal form:", error);
      toast.error(error.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading form data...</p>
      </div>
    );
  }

  return (
    <PageGuard allowedRoles={["admin", "staff", "super_admin"]}>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <button onClick={() => router.push("/dashboard")} className="hover:text-purple-600 flex items-center gap-1"><Home size={14}/> Dashboard</button>
                <ChevronRight size={14} />
                <button onClick={() => router.back()} className="hover:text-purple-600">{contact?.name || "Contact"}</button>
                <ChevronRight size={14} />
                <span className="font-bold text-gray-900 dark:text-white">Internal Form</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/20">
                  <Sparkles size={24} />
                </div>
                {contact?.name} - Internal Form
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Saving Changes..." : "Save Decisions"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation (Sections) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Sections</p>
                <div className="space-y-1">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(section.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-all text-left group"
                    >
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/20 rounded-lg transition-all">
                        <section.icon size={18} />
                      </div>
                      <span className="font-semibold">{section.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold mb-1">
                    <BadgeCheck size={16} />
                    <span>Submission Mode</span>
                  </div>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 leading-relaxed">
                    Changes will be saved and reflected in both {type === 'tc' ? 'TC' : 'Client'} and Application records.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="lg:col-span-3 space-y-8 pb-32">
              {/* Personal Information */}
              <Section id="personal" icon={User} title="Personal Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                  <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                  <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                  <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                  <Input label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                  <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Non-binary", "Prefer not to say", "Other"]} />
                  <Input label="Ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} />
                  <Input label="Sexual Orientation" name="sexual_orientation" value={formData.sexual_orientation} onChange={handleChange} />
                  <div className="md:col-span-2">
                    <Textarea label="Home Address" name="address" value={formData.address} onChange={handleChange} rows="2" />
                  </div>
                  <Input label="Beliefs / Religious Background" name="beliefs" value={formData.beliefs} onChange={handleChange} placeholder="e.g. Christian, Atheist..." />
                  <Input label="Disabilities" name="disabilities" value={formData.disabilities} onChange={handleChange} />
                  <div className="md:col-span-2">
                    <Textarea label="Medical Conditions" name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} rows="2" />
                  </div>
                </div>
              </Section>

              {/* Professional Status */}
              <Section id="professional" icon={Shield} title="Fitness to Practise & Professional">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select label="Indemnity Insurance?" name="has_insurance" value={formData.has_insurance} onChange={handleChange} options={["Yes", "No", "Applying"]} />
                  <Select label="Professional Body Member?" name="professional_body_member" value={formData.professional_body_member} onChange={handleChange} options={["BACP", "UKCP", "NCS", "Other", "None"]} />
                  <div className="md:col-span-2">
                    <Input label="Professional Body Membership Details" name="professional_body_details" value={formData.professional_body_details} onChange={handleChange} placeholder="Membership number or body name" />
                  </div>
                  <Select label="DBS Update Service?" name="dbs_update_service" value={formData.dbs_update_service} onChange={handleChange} options={["Yes", "No"]} />
                  <Input label="DBS Certificate / Update Details" name="dbs_update_details" value={formData.dbs_update_details} onChange={handleChange} />
                  <Select label="In Personal Therapy?" name="in_personal_therapy" value={formData.in_personal_therapy} onChange={handleChange} options={["Yes", "No"]} />
                  <Input label="Personal Therapy Reason/Duration" name="personal_therapy_reason" value={formData.personal_therapy_reason} onChange={handleChange} />
                  <Select label="Has Clinical Supervisor?" name="has_clinical_supervisor" value={formData.has_clinical_supervisor} onChange={handleChange} options={["Yes", "No"]} />
                  <Input label="Supervisor Details" name="supervisor_reason" value={formData.supervisor_reason} onChange={handleChange} />
                </div>
              </Section>

              {/* Course Information */}
              <Section id="course" icon={GraduationCap} title="Education & Training Provider">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Institution / Training Org" name="institution" value={formData.institution} onChange={handleChange} />
                  <Input label="Course Name / Qualification" name="course_name" value={formData.course_name} onChange={handleChange} />
                  <Input label="Course Level / Title" name="course_title" value={formData.course_title} onChange={handleChange} />
                  <Input label="Course Duration" name="course_duration" value={formData.course_duration} onChange={handleChange} />
                  <Input label="Expected Qualification Date" name="expected_qualification_date" value={formData.expected_qualification_date} onChange={handleChange} placeholder="MM/YYYY" />
                  <Input label="Tutor Name" name="tutor_name" value={formData.tutor_name} onChange={handleChange} />
                  <Input label="Tutor Email" name="tutor_email" value={formData.tutor_email} onChange={handleChange} />
                  <Input label="Placement Lead Name" name="placement_lead_name" value={formData.placement_lead_name} onChange={handleChange} />
                  <Input label="Placement Lead Email" name="placement_lead_email" value={formData.placement_lead_email} onChange={handleChange} />
                </div>
              </Section>

              {/* Experience */}
              <Section id="experience" icon={Briefcase} title="Experience, Journey & Approach">
                <div className="space-y-6">
                  <Textarea label="Personal Journey into Counselling" name="personal_journey" value={formData.personal_journey} onChange={handleChange} rows={4} helpText="Why did they choose this profession?" />
                  <Textarea label="Experience & Background" name="experience_background" value={formData.experience_background} onChange={handleChange} rows={4} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Theoretical Approach" name="theoretical_approach" value={formData.theoretical_approach} onChange={handleChange} placeholder="e.g. CBT, Person-Centred" />
                    <Input label="Areas of Experience" name="areas_of_experience" value={formData.areas_of_experience} onChange={handleChange} placeholder="e.g. Trauma, Anxiety, Teens" />
                  </div>
                  <Textarea label="Self Awareness & Personal Development" name="self_awareness" value={formData.self_awareness} onChange={handleChange} rows={3} />
                </div>
              </Section>

              {/* Availability */}
              <Section id="availability" icon={Clock} title="Availability & Preferences">
                <div className="space-y-6">
                  <Textarea label="Availability Schedule" name="availability_schedule" value={formData.availability_schedule} onChange={handleChange} rows={3} placeholder="Describe days and times available for sessions" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="PSG Day Preference" name="psg_day_preference" value={formData.psg_day_preference} onChange={handleChange} options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "No Preference"]} />
                    <Input label="PSG Reason / Context" name="psg_reason" value={formData.psg_reason} onChange={handleChange} />
                  </div>
                </div>
              </Section>

              {/* Floating Submit Bar (Mobile Only or fallback) */}
              <div className="md:hidden pt-4">
                <button 
                  onClick={handleSubmit} 
                  className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Save Internal Form
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageGuard>
  );
}

// Sub-components for cleaner code
function Section({ id, title, icon: Icon, children }) {
  return (
    <div id={id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300">
      <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/50 group-hover:bg-purple-50/30 dark:group-hover:bg-purple-900/10 transition-colors">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            <Icon size={20} />
          </div>
          {title}
        </h3>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{label}</label>
      <input
        {...props}
        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{label}</label>
      <select
        {...props}
        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white"
      >
        <option value="">Select option...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, helpText, ...props }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between ml-1">
        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">{label}</label>
        {helpText && <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{helpText}</span>}
      </div>
      <textarea
        {...props}
        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white placeholder:text-gray-400 resize-none"
      />
    </div>
  );
}
