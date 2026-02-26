"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import apiService from "@/lib/api";
import { useToast } from "@/lib/toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import DashboardLayout from "@/components/DashboardLayout";

import {
  Users,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  ArrowUpDown,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Video,
  FileText,
  UserCheck,
  Activity,
  Home,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  User,
  Download,
  Send,
  Archive,
  Plus,
  ChevronLeft,
  CreditCard,
  Package,
  AlertCircle,
  Check,
  XCircle,
  Save,
  ChevronUp,
  Building2,
  RefreshCw,
} from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";

function EditClientPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // Extract client ID from URL query parameters or pathname
  const clientId =
    searchParams?.get("id") ||
    searchParams?.get("clientId") ||
    searchParams?.get("uuid") ||
    null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientPhoto, setClientPhoto] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    personal: true,

    service: true,

    clinical: true,

    availability: true,

    referral: true,

    adminNotes: true,
  });

  // Client form data - loaded from API
  const [formData, setFormData] = useState({
    // Client ID (read-only)

    clientId: "",

    clientName: "",

    // Personal Information

    firstName: "",

    lastName: "",

    email: "",

    phone: "",

    age: "",

    voicemailPermission: "Yes",

    currentlyInTherapy: "No",

    // Service Selection

    serviceType: "Low Cost Counselling",

    // Clinical Information

    onMedication: "No",

    medicationDetails: "",

    disabilities: "None",

    concernsSelected: [],

    additionalConcernDetails: "",

    riskIssues: "None reported",

    // Availability

    availability: {
      Monday: [],

      Tuesday: [],

      Wednesday: [],

      Thursday: [],

      Friday: [],
    },

    // Referral Information

    howHeardAbout: "",

    referralReasons: "N/A",

    referralName: "N/A",

    referralPhone: "N/A",

    organizationName: "N/A",

    organizationEmail: "N/A",

    // Admin Notes

    adminNotes: "",

    paymentStatus: "Pending",
  });

  // Determine if we're creating or editing
  const isCreating = !clientId;

  // Fetch client data from API (only if editing)
  useEffect(() => {
    const fetchClient = async () => {
      // If creating, don't fetch - just set loading to false
      if (!clientId) {
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const client = await apiService.getClient(clientId);

        // Transform API data to form structure
        setFormData({
          clientId: client.client_id || client.uuid || client.id || clientId,
          clientName: client.name || "",
          photo: client.photo || null,
          firstName: client.first_name || client.name?.split(" ")[0] || "",
          lastName:
            client.last_name ||
            client.name?.split(" ").slice(1).join(" ") ||
            "",
          email: client.email || "",
          phone: client.phone || "",
          age: client.age?.toString() || "",
          voicemailPermission: client.voicemail_permission || "Yes",
          currentlyInTherapy: client.currently_in_therapy || "No",
          serviceType: client.service_type || "Low Cost Counselling",
          onMedication: client.on_medication || "No",
          medicationDetails: client.medication_details || "",
          disabilities: client.disabilities || "None",
          concernsSelected: client.primary_issues || [],
          additionalConcernDetails: client.additional_details || "",
          riskIssues: client.risk_issues || "None reported",
          availability: {
            Monday: client.availability?.Monday || [],
            Tuesday: client.availability?.Tuesday || [],
            Wednesday: client.availability?.Wednesday || [],
            Thursday: client.availability?.Thursday || [],
            Friday: client.availability?.Friday || [],
          },
          howHeardAbout: client.how_heard_about || "",
          referralReasons: client.referral_reasons || "N/A",
          referralName: client.referral_name || "N/A",
          referralPhone: client.referral_phone || "N/A",
          organizationName: client.organization_name || "N/A",
          organizationEmail: client.organization_email || "N/A",
          adminNotes: client.admin_notes || "",
          paymentStatus: client.payment_status || "Pending",
        });
        setClientPhoto(client.photo_url || client.photo || null);
      } catch (err) {
        console.error("Error fetching client:", err);
        setError("Failed to load client data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const timeSlots = [
    { value: "10am-1050am", label: "10:00 AM - 10:50 AM" },
    { value: "11am-1150am", label: "11:00 AM - 11:50 AM" },
    { value: "12pm-1250pm", label: "12:00 PM - 12:50 PM" },
    { value: "1pm-150pm", label: "1:00 PM - 1:50 PM" },
    { value: "2pm-250pm", label: "2:00 PM - 2:50 PM" },
    { value: "3pm-350pm", label: "3:00 PM - 3:50 PM" },
    { value: "4pm-450pm", label: "4:00 PM - 4:50 PM" },
    { value: "5pm-550pm", label: "5:00 PM - 5:50 PM" },
    { value: "6pm-650pm", label: "6:00 PM - 6:50 PM" },
  ];

  const concernsOptions = [
    "Communication problems",

    "People pleasing",

    "Loneliness",

    "Discrimination & Racism",

    "Low mood",

    "Stress",

    "Low confidence",

    "Family issues",

    "Fear of intimacy",

    "Personal development",

    "Self-defeating behaviour",

    "Low self-esteem",

    "Relationship problems",

    "High sensitivity",

    "Anxiety",

    "Depression",

    "Trauma",

    "PTSD",

    "Grief & Loss",

    "Anger Management",

    "Eating Disorders",

    "OCD",

    "Self-Harm",

    "Suicidal Ideation",

    "Sexual Abuse/Assault",

    "Domestic Violence",

    "Substance Abuse",

    "Work Stress",
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,

      [section]: !prev[section],
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  const handleAvailabilityChange = (day, timeSlot) => {
    setFormData((prev) => {
      const currentDaySlots = prev.availability?.[day] || [];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: currentDaySlots.includes(timeSlot)
            ? currentDaySlots.filter((t) => t !== timeSlot)
            : [...currentDaySlots, timeSlot],
        },
      };
    });
  };

  const handleConcernToggle = (concern) => {
    setFormData((prev) => ({
      ...prev,

      concernsSelected: prev.concernsSelected.includes(concern)
        ? prev.concernsSelected.filter((c) => c !== concern)
        : [...prev.concernsSelected, concern],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.age
    ) {
      showError("Please fill in all required personal information fields.");

      return;
    }

    // Check if at least one availability slot is selected
    const isIshServices = formData.serviceType === "Ish's Services";

    if (!isIshServices) {
      const hasAvailability = Object.values(formData.availability || {}).some(
        (slots) => (slots || []).length > 0,
      );
      if (!hasAvailability) {
        showError("Please select at least one availability time slot.");
        return;
      }

      if (formData.concernsSelected.length === 0) {
        showError("Please select at least one area of support.");
        return;
      }
    }

    // Determine if creating or updating
    if (isCreating) {
      // Create new client - no confirmation needed
      try {
        setSaveLoading(true);
        const newClient = await apiService.createClient({
          name: `${formData.firstName} ${formData.lastName}`,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          voicemail_permission: formData.voicemailPermission,
          currently_in_therapy: formData.currentlyInTherapy,
          service_type: formData.serviceType,
          on_medication: formData.onMedication,
          medication_details: formData.medicationDetails,
          disabilities: formData.disabilities,
          primary_issues: formData.concernsSelected,
          additional_details: formData.additionalConcernDetails,
          risk_issues: formData.riskIssues,
          availability: formData.availability,
          how_heard_about: formData.howHeardAbout,
          referral_reasons: formData.referralReasons,
          referral_name: formData.referralName,
          referral_phone: formData.referralPhone,
          organization_name: formData.organizationName,
          organization_email: formData.organizationEmail,
          admin_notes: formData.adminNotes,
          payment_status: formData.paymentStatus,
          stage: "Application",
          status: "active",
        });

        success("Client created successfully!");
        router.push(
          `/dashboard/client-details/${newClient.uuid || newClient.id}`,
        );
      } catch (err) {
        console.error("Error creating client:", err);
        showError(err.message || "Failed to create client. Please try again.");
      } finally {
        setSaveLoading(false);
      }
      return;
    }

    // Update existing client - show confirmation modal
    setPendingFormData(formData);
    setShowEditConfirmModal(true);
  };

  const confirmSaveChanges = async () => {
    if (!pendingFormData || !clientId) return;

    try {
      setSaveLoading(true);
      setShowEditConfirmModal(false);
      await apiService.updateClient(clientId, {
        name: `${pendingFormData.firstName} ${pendingFormData.lastName}`,
        first_name: pendingFormData.firstName,
        last_name: pendingFormData.lastName,
        email: pendingFormData.email,
        phone: pendingFormData.phone,
        age: parseInt(pendingFormData.age),
        voicemail_permission: pendingFormData.voicemailPermission,
        currently_in_therapy: pendingFormData.currentlyInTherapy,
        service_type: pendingFormData.serviceType,
        on_medication: pendingFormData.onMedication,
        medication_details: pendingFormData.medicationDetails,
        disabilities: pendingFormData.disabilities,
        primary_issues: pendingFormData.concernsSelected,
        additional_details: pendingFormData.additionalConcernDetails,
        risk_issues: pendingFormData.riskIssues,
        availability: pendingFormData.availability,
        how_heard_about: pendingFormData.howHeardAbout,
        referral_reasons: pendingFormData.referralReasons,
        referral_name: pendingFormData.referralName,
        referral_phone: pendingFormData.referralPhone,
        organization_name: pendingFormData.organizationName,
        organization_email: pendingFormData.organizationEmail,
        admin_notes: pendingFormData.adminNotes,
        payment_status: pendingFormData.paymentStatus,
      });

      success("Client updated successfully!");
      router.push(`/dashboard/client-details/${clientId}`);
    } catch (err) {
      console.error("Error updating client:", err);
      showError(err.message || "Failed to update client. Please try again.");
    } finally {
      setSaveLoading(false);
      setPendingFormData(null);
    }
  };

  const handleDelete = () => {
    if (isCreating) {
      showError("Cannot delete a client that hasn't been created yet.");
      return;
    }

    if (!clientId) {
      showError("No client ID available. Cannot delete client.");
      return;
    }

    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await apiService.deleteClient(clientId);
      setDeleteLoading(false);
      setShowDeleteConfirmModal(false);
      success("Client deleted successfully!");
      router.push("/dashboard/clients");
    } catch (err) {
      console.error("Error deleting client:", err);
      setDeleteLoading(false);
      setShowDeleteConfirmModal(false);
      showError(err.message || "Failed to delete client. Please try again.");
    }
  };

  const SectionHeader = ({ title, section, required = false }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--hover-bg)] transition-colors border-b border-[var(--border-color)]"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {required && <span className="text-red-500 text-sm">*</span>}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" />
      ) : (
        <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
      )}
    </button>
  );

  return (
    <PageGuard menuId="clients">
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}

        <div className="bg-[var(--card-bg)] border-b border-[var(--border-color)]">
          {/* Breadcrumb */}

          <div className="px-6 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Link
                href="/dashboard/clients"
                className="hover:text-[var(--purple-primary)]"
              >
                All Clients
              </Link>

              {!isCreating && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <Link
                    href={`/dashboard/client-details/${formData.clientId}`}
                    className="hover:text-[var(--purple-primary)]"
                  >
                    {formData.clientName}
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[var(--text-primary)] font-medium">
                    Edit
                  </span>
                </>
              )}
              {isCreating && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[var(--text-primary)] font-medium">
                    Add New Client
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Page Header */}

          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    {isCreating ? "Add New Client" : "Edit Client"}
                  </h1>

                  {!isCreating && (
                    <span className="px-3 py-1 bg-[var(--purple-bg)] text-[var(--purple-primary)] text-sm font-medium rounded-full">
                      ID: {formData.clientId}
                    </span>
                  )}
                </div>

                {!isCreating && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    {formData.clientName}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--hover-bg)] font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Form Content - Scrollable */}

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-[var(--text-tertiary)] animate-spin mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">
                  Loading client data...
                </p>
              </div>
            </div>
          )}

          {error && !isCreating && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">
                    {error}
                  </p>
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

          {!loading && !error && (
            <form onSubmit={handleSubmit} className="max-w-7xl px-6 py-6">
              {/* Alert Info */}

              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                    {isCreating
                      ? "Creating New Client"
                      : "Editing Client Information"}
                  </p>

                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {isCreating
                      ? "Fill in all required information below to create a new client. Fields marked with * are required."
                      : "Update any client information below. Fields marked with * are required. Changes will be saved to the client's profile."}
                  </p>
                </div>
              </div>

              {/* Personal Information Section */}

              <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] mb-6 overflow-hidden">
                <SectionHeader
                  title="Personal Information"
                  section="personal"
                  required
                />

                {expandedSections.personal && (
                  <div className="p-6 space-y-4">
                    {/* Photo Upload Section - Only show when editing existing client */}
                    {!isCreating && formData.clientId && (
                      <div className="flex items-start gap-6 pb-4 border-b border-[var(--border-color)]">
                        <PhotoUpload
                          photoUrl={clientPhoto}
                          entityId={formData.clientId}
                          entityType="client"
                          onUpload={async (id, file) => {
                            const response = await apiService.uploadClientPhoto(
                              id,
                              file,
                            );
                            setClientPhoto(
                              response.photo_url || response.photo,
                            );
                            return response;
                          }}
                          onDelete={async (id) => {
                            await apiService.deleteClientPhoto(id);
                            setClientPhoto(null);
                          }}
                          size="large"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                            Profile Photo
                          </h3>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            Upload a photo for this client (Admin only)
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="Enter first name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="email@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="+44 7700 900000"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Age <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) =>
                            handleInputChange("age", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="18"
                          min="18"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Voicemail Permission{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={formData.voicemailPermission}
                          onChange={(e) =>
                            handleInputChange(
                              "voicemailPermission",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        >
                          <option value="Yes">Yes</option>

                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Currently in Therapy?{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={formData.currentlyInTherapy}
                          onChange={(e) =>
                            handleInputChange(
                              "currentlyInTherapy",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        >
                          <option value="Yes">Yes</option>

                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-tertiary)] italic">
                      Note: We primarily communicate through Emails and WhatsApp
                    </p>
                  </div>
                )}
              </div>

              {/* Service Selection Section */}

              <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] mb-6 overflow-hidden">
                <SectionHeader
                  title="Service Selection"
                  section="service"
                  required
                />

                {expandedSections.service && (
                  <div className="p-6">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Service Type <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={formData.serviceType}
                      onChange={(e) =>
                        handleInputChange("serviceType", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="Low Cost Counselling">
                        Low Cost Counselling
                      </option>

                      <option value="Mid Range Counselling">
                        Mid Range Counselling with Qualified Counsellors
                        (starting from £40+)
                      </option>

                      <option value="Ish's Services">
                        Ish's Services (Coaching/Counselling)
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* Clinical Information Section */}

              <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] mb-6 overflow-hidden">
                <SectionHeader
                  title="Clinical Information"
                  section="clinical"
                  required
                />

                {expandedSections.clinical && (
                  <fieldset
                    className="p-6 space-y-4"
                    disabled={formData.serviceType === "Ish's Services"}
                  >
                    {/* Medication */}

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Currently on Medication?
                      </label>

                      <select
                        value={formData.onMedication}
                        onChange={(e) =>
                          handleInputChange("onMedication", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent mb-3"
                      >
                        <option value="No">No</option>

                        <option value="Yes">Yes</option>
                      </select>

                      {formData.onMedication === "Yes" && (
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Medication Details (what medication and what it's
                            prescribed for){" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <textarea
                            value={formData.medicationDetails}
                            onChange={(e) =>
                              handleInputChange(
                                "medicationDetails",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="e.g., Sertraline 50mg - prescribed for anxiety and depression"
                            required={formData.onMedication === "Yes"}
                          />
                        </div>
                      )}
                    </div>

                    {/* Disabilities */}

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Disabilities / Impairments
                      </label>

                      <textarea
                        value={formData.disabilities}
                        onChange={(e) =>
                          handleInputChange("disabilities", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Enter any disabilities or impairments, or N/A if none"
                      />
                    </div>

                    {/* Areas Requiring Support */}

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                        Areas Requiring Support{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                        {concernsOptions.map((concern) => (
                          <label
                            key={concern}
                            className="flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-primary)] p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.concernsSelected.includes(
                                concern,
                              )}
                              onChange={() => handleConcernToggle(concern)}
                              className="w-4 h-4 text-[var(--purple-primary)] border-[var(--border-color)] rounded focus:ring-[var(--purple-primary)]"
                            />

                            <span className="text-sm text-[var(--text-primary)]">
                              {concern}
                            </span>
                          </label>
                        ))}
                      </div>

                      <p className="text-xs text-[var(--text-tertiary)] mt-2">
                        Selected: {formData.concernsSelected.length}{" "}
                        {formData.concernsSelected.length === 1
                          ? "concern"
                          : "concerns"}
                      </p>
                    </div>

                    {/* Additional Details */}

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Additional Details About Selected Areas{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        value={formData.additionalConcernDetails}
                        onChange={(e) =>
                          handleInputChange(
                            "additionalConcernDetails",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Please provide specific details about the areas selected above..."
                        required
                      />
                    </div>

                    {/* Risk Issues */}

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Risk Issues or Substance Misuse{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        value={formData.riskIssues}
                        onChange={(e) =>
                          handleInputChange("riskIssues", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Please provide details of any identified risk issues or substance misuse, or enter N/A if none"
                        required
                      />
                    </div>
                  </fieldset>
                )}
              </div>

              {/* Availability Section */}

              <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] mb-6 overflow-hidden">
                <SectionHeader
                  title="Availability Schedule"
                  section="availability"
                  required
                />

                {expandedSections.availability && (
                  <fieldset
                    className="p-6"
                    disabled={formData.serviceType === "Ish's Services"}
                  >
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      Select the accurate days and times the client is available
                      for weekly counselling sessions (UK time).
                      <span className="block text-xs text-[var(--text-tertiary)] mt-1">
                        Note: Last session is at 6pm Monday-Thursday, and 5pm on
                        Friday.
                      </span>
                    </p>

                    <div className="space-y-4">
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                      ].map((day) => (
                        <div
                          key={day}
                          className="border border-[var(--border-color)] rounded-lg p-4"
                        >
                          <h4 className="font-medium text-[var(--text-primary)] mb-3">
                            {day}
                          </h4>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {timeSlots.map((slot) => {
                              // Restrict Friday evening slot (last session at 5pm)
                              if (
                                day === "Friday" &&
                                slot.value === "6pm-650pm"
                              ) {
                                return null;
                              }

                              return (
                                <label
                                  key={slot.value}
                                  className={`flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer transition-colors ${
                                    (
                                      formData.availability?.[day] || []
                                    ).includes(slot.value)
                                      ? "border-[var(--purple-border)] bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-200"
                                      : "border-[var(--border-color)] hover:border-[var(--purple-border)] text-[var(--text-secondary)]"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={(
                                      formData.availability?.[day] || []
                                    ).includes(slot.value)}
                                    onChange={() =>
                                      handleAvailabilityChange(day, slot.value)
                                    }
                                    className="sr-only"
                                  />

                                  <span className="text-sm font-medium">
                                    {slot.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Important:</strong> At least one availability
                        slot must be selected.
                      </p>
                    </div>
                  </fieldset>
                )}
              </div>

              {/* Referral Information Section */}

              <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] mb-6 overflow-hidden">
                <SectionHeader
                  title="Referral Information"
                  section="referral"
                />

                {expandedSections.referral && (
                  <fieldset
                    className="p-6 space-y-4"
                    disabled={formData.serviceType === "Ish's Services"}
                  >
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        How did they hear about our services?{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={formData.howHeardAbout}
                        onChange={(e) =>
                          handleInputChange("howHeardAbout", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                      >
                        <option value="Online (Google, Bing, etc)">
                          Online (Google, Bing, etc)
                        </option>

                        <option value="Social Media (Facebook, Instagram)">
                          Social Media (Facebook, Instagram)
                        </option>

                        <option value="Referral">Referral</option>

                        <option value="Referred through an organization">
                          Referred through an organization
                        </option>

                        <option value="Referred through an individual">
                          Referred through an individual
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Reasons for Referral
                      </label>

                      <textarea
                        value={formData.referralReasons}
                        onChange={(e) =>
                          handleInputChange("referralReasons", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Enter reasons for referral if applicable, or N/A"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Referral's Name
                        </label>

                        <input
                          type="text"
                          value={formData.referralName}
                          onChange={(e) =>
                            handleInputChange("referralName", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Enter referral name or N/A"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Referral's Phone
                        </label>

                        <input
                          type="tel"
                          value={formData.referralPhone}
                          onChange={(e) =>
                            handleInputChange("referralPhone", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Enter phone or N/A"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Organization Name (if applicable)
                        </label>

                        <input
                          type="text"
                          value={formData.organizationName}
                          onChange={(e) =>
                            handleInputChange(
                              "organizationName",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Enter organization name or N/A"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                          Organization Email
                        </label>

                        <input
                          type="email"
                          value={formData.organizationEmail}
                          onChange={(e) =>
                            handleInputChange(
                              "organizationEmail",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                          placeholder="Enter organization email or N/A"
                        />
                      </div>
                    </div>
                  </fieldset>
                )}
              </div>

              {/* Admin Notes Section */}

              <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] mb-6 overflow-hidden">
                <SectionHeader
                  title="Admin Notes & Payment"
                  section="adminNotes"
                />

                {expandedSections.adminNotes && (
                  <fieldset
                    className="p-6 space-y-4"
                    disabled={formData.serviceType === "Ish's Services"}
                  >
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Internal Admin Notes
                      </label>

                      <textarea
                        value={formData.adminNotes}
                        onChange={(e) =>
                          handleInputChange("adminNotes", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Add any internal notes about this client..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Consultation Fee Payment Status (£13)
                      </label>

                      <select
                        value={formData.paymentStatus}
                        onChange={(e) =>
                          handleInputChange("paymentStatus", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                      >
                        <option value="Pending">Pending</option>

                        <option value="Paid">Paid</option>

                        <option value="Waived">Waived</option>
                      </select>
                    </div>
                  </fieldset>
                )}
              </div>

              {/* Form Actions */}

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                {!isCreating && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-6 py-3 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete Client
                      </>
                    )}
                  </button>
                )}
                {isCreating && <div></div>}

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--hover-bg)] font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-6 py-3 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--button-primary-bg)",
                      color: "var(--button-primary-text)",
                    }}
                  >
                    {saveLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        {isCreating ? "Creating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isCreating ? "Create Client" : "Save Changes"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        itemName={
          formData.firstName && formData.lastName
            ? `${formData.firstName} ${formData.lastName}`
            : "this client"
        }
        confirmText="Delete Client"
        cancelText="Cancel"
        loading={deleteLoading}
      />

      {/* Edit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEditConfirmModal}
        onClose={() => {
          setShowEditConfirmModal(false);
          setPendingFormData(null);
        }}
        onConfirm={confirmSaveChanges}
        title="Save Changes"
        message={`Are you sure you want to save changes to ${formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : "this client"}?`}
        confirmText="Save Changes"
        cancelText="Cancel"
        type="info"
        loading={saveLoading}
        confirmButtonColor="var(--button-primary-bg)"
      />
    </DashboardLayout>
    </PageGuard>
  );
}

export default function EditClientPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading...</p>
          </div>
        </div>
      }
    >
      <EditClientPageContent />
    </Suspense>
  );
}
