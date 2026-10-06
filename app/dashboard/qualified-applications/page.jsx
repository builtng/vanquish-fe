"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Link2,
  Clock,
  Eye,
  AlertCircle,
  Check,
  FileText,
  ExternalLink,
  ChevronRight,
  Shield,
  Info,
  Calendar,
  X,
  RefreshCw,
  UserCheck,
  Award,
} from "lucide-react";
import apiService from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";

function QualifiedApplicationsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'admin' || authUser?.role === 'super_admin';

  const [applications, setApplications] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [includeArchived, setIncludeArchived] = useState(searchParams.get("include_archived") === "1");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Archive Modal
  const [archiveModalApp, setArchiveModalApp] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingApp, setLinkingApp] = useState(null);
  const [selectedTcId, setSelectedTcId] = useState("");
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [selectedFields, setSelectedFields] = useState({});
  const [isLinking, setIsLinking] = useState(false);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Accept Modal / State
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        status: statusFilter,
        include_archived: includeArchived ? 1 : 0,
      };
      const res = await apiService.getQcApplications(params);
      setApplications(res.data || []);
      setTotalPages(res.last_page || 1);
    } catch (err) {
      console.error("Error fetching QC applications:", err);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPractitioners = async () => {
    try {
      const res = await apiService.getTrainingCounsellors({ per_page: 500 });
      setPractitioners(res.data || []);
    } catch (err) {
      console.error("Error fetching practitioners for linking:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter, includeArchived]);

  useEffect(() => {
    fetchPractitioners();
  }, []);

  const handleToggleArchived = (e) => {
    const checked = e.target.checked;
    setIncludeArchived(checked);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("include_archived", "1");
    } else {
      params.delete("include_archived");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleArchiveSubmit = async () => {
    if (!archiveModalApp) return;
    setIsArchiving(true);
    try {
      await apiService.deleteQcApplication(archiveModalApp.id);
      toast.success("Application archived successfully.");
      setArchiveModalApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to archive application.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  // Duplicate Conflict Modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateConflictData, setDuplicateConflictData] = useState(null);

  // Accept handler
  const handleAccept = async (app, forceNew = false) => {
    if (
      !forceNew &&
      !confirm(
        `Are you sure you want to accept the application for ${app.name}? This will create an active Qualified Counsellor record.`
      )
    ) {
      return;
    }

    setAcceptingId(app.id);
    try {
      const res = await apiService.acceptQcApplication(app.id, forceNew ? { force_new: true } : {});
      toast.success(res.message || "Application accepted successfully!");
      if (res.user_message) {
        toast.info(res.user_message);
      }
      setShowDuplicateModal(false);
      setDuplicateConflictData(null);
      fetchApplications();
    } catch (err) {
      console.error("Error accepting application:", err);
      const status = err?.status || err?.data?.status;
      const msg = err?.data?.message || err?.message || "Failed to accept application.";

      if (status === 409 || err?.data?.existing_tc || msg.includes("already exists")) {
        setDuplicateConflictData({
          app,
          message: msg,
          existingTc: err?.data?.existing_tc,
        });
        setShowDuplicateModal(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setAcceptingId(null);
    }
  };

  // Restore handler
  const handleRestore = async (app) => {
    try {
      await apiService.restoreQcApplication(app.id);
      toast.success("Application restored successfully.");
      fetchApplications();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to restore application.");
    }
  };

  // Open Link Modal
  const openLinkModal = (app, defaultTcId = null) => {
    setLinkingApp(app);
    const suggestedId = defaultTcId || app.suggested_training_counsellor_id || app.suggested_match?.id || "";
    setSelectedTcId(suggestedId ? String(suggestedId) : "");

    const matchedTc = practitioners.find((p) => String(p.id) === String(suggestedId));
    setSelectedPractitioner(matchedTc || null);

    // Initialise checkboxes (default unticked for safety)
    setSelectedFields({
      name: false,
      phone: false,
      registered_address: false,
      registered_city: false,
      registered_postcode: false,
      has_supervisor: false,
      previous_vanquish_work: false,
      counsellor_training_details: false,
      modality: false,
      topics_with_experience: false,
      areas_to_improve: false,
      unique_trait: false,
      challenging_cases: false,
      qualification_document: false,
      dbs_certificate_qualified: false,
      insurance_qualified: false,
      self_employment_proof: false,
      professional_membership: false,
    });

    setShowLinkModal(true);
  };

  const handlePractitionerSelect = (tcId) => {
    setSelectedTcId(tcId);
    const found = practitioners.find((p) => String(p.id) === String(tcId));
    setSelectedPractitioner(found || null);
  };

  const toggleField = (fieldName) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleLinkSubmit = async () => {
    if (!selectedTcId) {
      toast.error("Please select a practitioner to link this application to.");
      return;
    }

    const fieldsToCopy = Object.keys(selectedFields).filter((k) => selectedFields[k]);

    setIsLinking(true);
    try {
      const res = await apiService.linkQcApplication(linkingApp.id, {
        training_counsellor_id: selectedTcId,
        copy_fields: fieldsToCopy,
      });

      toast.success(res.message || "Application successfully linked to practitioner.");
      setShowLinkModal(false);
      setLinkingApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Error linking application:", err);
      toast.error(err?.data?.message || err?.message || "Failed to link application.");
    } finally {
      setIsLinking(false);
    }
  };

  // Open Reject Modal
  const openRejectModal = (app) => {
    setRejectingApp(app);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectingApp) return;

    setIsRejecting(true);
    try {
      const res = await apiService.rejectQcApplication(rejectingApp.id, {
        reason: rejectReason,
      });

      toast.success(res.message || "Application rejected and archived.");
      setShowRejectModal(false);
      setRejectingApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Error rejecting application:", err);
      toast.error(err?.data?.message || err?.message || "Failed to reject application.");
    } finally {
      setIsRejecting(false);
    }
  };

  const renderStatusBadge = (status, archivedAt = null) => {
    if (archivedAt || status === "Archived") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          Archived {archivedAt ? `(${new Date(archivedAt).toLocaleDateString("en-GB")})` : ''}
        </span>
      );
    }
    switch (status) {
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "Submitted":
      case "New Application":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#6f1d56] border border-purple-200">
            <Clock className="w-3.5 h-3.5" /> Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status || "Pending"}
          </span>
        );
    }
  };

  // Fields for Side-by-Side Comparison
  const comparisonFields = [
    { key: "name", label: "Full Name", getAppVal: (a) => a.name, getTcVal: (t) => t?.name },
    { key: "phone", label: "Telephone", getAppVal: (a) => a.phone, getTcVal: (t) => t?.phone },
    {
      key: "registered_address",
      label: "Street Address",
      getAppVal: (a) => a.answers?.registered_address,
      getTcVal: (t) => t?.registered_address || t?.address,
    },
    {
      key: "registered_city",
      label: "City",
      getAppVal: (a) => a.answers?.registered_city,
      getTcVal: (t) => t?.registered_city,
    },
    {
      key: "registered_postcode",
      label: "Postcode",
      getAppVal: (a) => a.answers?.registered_postcode,
      getTcVal: (t) => t?.registered_postcode,
    },
    {
      key: "modality",
      label: "Modality",
      getAppVal: (a) =>
        Array.isArray(a.answers?.modalities)
          ? a.answers.modalities.join(", ")
          : a.answers?.modalities || "N/A",
      getTcVal: (t) => t?.modality || "N/A",
    },
    {
      key: "topics_with_experience",
      label: "Experience Topics",
      getAppVal: (a) =>
        Array.isArray(a.answers?.experience_areas)
          ? a.answers.experience_areas.join(", ")
          : a.answers?.experience_areas || "N/A",
      getTcVal: (t) =>
        Array.isArray(t?.topics_with_experience)
          ? t.topics_with_experience.join(", ")
          : t?.topics_with_experience || "N/A",
    },
    {
      key: "has_supervisor",
      label: "Has Clinical Supervisor",
      getAppVal: (a) => a.answers?.has_supervisor || "N/A",
      getTcVal: (t) => t?.has_supervisor || "N/A",
    },
    {
      key: "previous_vanquish_work",
      label: "Previous Vanquish Work",
      getAppVal: (a) => a.answers?.previous_vanquish_work || "N/A",
      getTcVal: (t) => t?.previous_vanquish_work || "N/A",
    },
    {
      key: "counsellor_training_details",
      label: "Training Details",
      getAppVal: (a) => a.answers?.counsellor_training_details || "N/A",
      getTcVal: (t) => t?.counsellor_training_details || "N/A",
    },
    {
      key: "areas_to_improve",
      label: "Areas to Improve",
      getAppVal: (a) => a.answers?.areas_to_improve || "N/A",
      getTcVal: (t) => t?.areas_to_improve || "N/A",
    },
    {
      key: "unique_trait",
      label: "Unique Trait",
      getAppVal: (a) => a.answers?.unique_trait || "N/A",
      getTcVal: (t) => t?.unique_trait || "N/A",
    },
    {
      key: "challenging_cases",
      label: "Challenging Cases",
      getAppVal: (a) => a.answers?.challenging_cases || "N/A",
      getTcVal: (t) => t?.challenging_cases || "N/A",
    },
    {
      key: "qualification_document",
      label: "Qualification Document",
      getAppVal: (a) => a.qualification_document ? "Uploaded file present" : "None",
      getTcVal: (t) => t?.qualification_document ? "File present" : "None",
    },
    {
      key: "dbs_certificate_qualified",
      label: "DBS Certificate",
      getAppVal: (a) => a.dbs_certificate_qualified ? "Uploaded file present" : "None",
      getTcVal: (t) => t?.dbs_certificate_qualified || t?.dbs_certificate ? "File present" : "None",
    },
    {
      key: "insurance_qualified",
      label: "Indemnity Insurance",
      getAppVal: (a) => a.insurance_qualified ? "Uploaded file present" : "None",
      getTcVal: (t) => t?.insurance_qualified ? "File present" : "None",
    },
    {
      key: "self_employment_proof",
      label: "Proof of Self-Employment",
      getAppVal: (a) => a.self_employment_proof ? "Uploaded file present" : "None",
      getTcVal: (t) => t?.self_employment_proof ? "File present" : "None",
    },
    {
      key: "professional_membership",
      label: "Professional Membership",
      getAppVal: (a) => a.professional_membership ? "Uploaded file present" : "None",
      getTcVal: (t) => t?.professional_membership ? "File present" : "None",
    },
  ];

  return (
    <PageGuard permissions={["view_trainee_applications", "manage_training_counsellors"]}>
      <DashboardLayout>
        <DashboardHeader
          title="Qualified Counsellor Applications"
          description="Review, link, and accept incoming qualified practitioner applications."
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Bar with Search & Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f1d56]/20 focus:border-[#6f1d56]"
              />
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={handleToggleArchived}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                Show archived
              </label>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]/20 focus:border-[#6f1d56]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={fetchApplications}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <Link
                href="/dashboard/training-counsellors"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Users className="w-4 h-4" /> All Practitioners
              </Link>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mb-2"></div>
                <p className="text-sm">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base font-semibold text-gray-700">No applications found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {statusFilter !== "all"
                    ? "Try changing your status filter."
                    : "No qualified counsellor applications have been submitted yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-3.5 px-4">Reference & Applicant</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Suggested Match</th>
                      <th className="py-3.5 px-4">Submitted</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => {
                      const suggested =
                        app.suggested_match ||
                        (app.suggested_training_counsellor_id
                          ? practitioners.find((p) => String(p.id) === String(app.suggested_training_counsellor_id))
                          : null);

                      const isArchived = Boolean(app.archived_at || app.status === "Archived" || app.status === "Rejected");

                      return (
                        <tr key={app.id} className={`hover:bg-purple-50/20 transition ${isArchived ? "opacity-75 bg-gray-50/50" : ""}`}>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900">{app.name}</div>
                            <div className="text-xs font-mono text-purple-700">
                              QC-APP-{String(app.id).padStart(4, "0")}
                            </div>
                          </td>

                          <td className="py-4 px-4 space-y-0.5">
                            <div className="text-gray-900">{app.email}</div>
                            {app.phone && <div className="text-xs text-gray-500">{app.phone}</div>}
                          </td>

                          <td className="py-4 px-4">{renderStatusBadge(app.status, app.archived_at)}</td>

                          <td className="py-4 px-4">
                            {suggested ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900">
                                <span>
                                  Suggested match: <strong className="font-semibold">{suggested.name}</strong> ({suggested.tc_id})
                                </span>
                              </div>
                            ) : app.training_counsellor ? (
                              <div className="text-xs text-emerald-700 font-medium">
                                Linked: {app.training_counsellor.name} ({app.training_counsellor.tc_id})
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-xs text-gray-500">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString("en-GB") : "-"}
                          </td>

                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setShowDetailModal(true);
                              }}
                              className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                              View
                            </button>

                            {isArchived ? (
                              isAdmin && (
                                <button
                                  onClick={() => handleRestore(app)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                                  title="Restore application"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Restore
                                </button>
                              )
                            ) : (
                              <>
                                {app.status !== "Accepted" && (
                                  <>
                                    <button
                                      onClick={() => openLinkModal(app, suggested?.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                                    >
                                      <Link2 className="w-3.5 h-3.5" /> Link
                                    </button>

                                    <button
                                      onClick={() => handleAccept(app)}
                                      disabled={acceptingId === app.id}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#6f1d56] hover:bg-[#581643] rounded-lg transition disabled:opacity-50"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Accept
                                    </button>

                                    <button
                                      onClick={() => openRejectModal(app)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                    >
                                      <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => setArchiveModalApp(app)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                >
                                  Archive
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================== SIDE-BY-SIDE LINKING MODAL ===================== */}
        {showLinkModal && linkingApp && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-purple-100 animate-fadeIn">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-[#6f1d56]" />
                    Link Application to Existing Practitioner
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Application QC-APP-{String(linkingApp.id).padStart(4, "0")} — {linkingApp.name} ({linkingApp.email})
                  </p>
                </div>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informational Warning Alert */}
              <div className="mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-700" />
                  Important: Linking does not alter counsellor type or TC ID
                </div>
                <p>
                  Linking records this application against the practitioner. It will not change their practitioner type (e.g. Trainee), TC ID, or profile fields unless explicitly ticked below. If you wish to transition a trainee to qualified, use the deliberate <strong>Transition to Qualified</strong> action on their profile.
                </p>
              </div>

              {/* Practitioner Selector */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Target Practitioner
                </label>
                <select
                  value={selectedTcId}
                  onChange={(e) => handlePractitionerSelect(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6f1d56]/20 focus:border-[#6f1d56]"
                >
                  <option value="">-- Select a Practitioner to Link --</option>
                  {practitioners.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.name} ({tc.tc_id}) - {tc.counsellor_type || "Trainee"} [{tc.email}]
                    </option>
                  ))}
                </select>

                {selectedPractitioner && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-3">
                    <span>
                      Type: <strong>{selectedPractitioner.counsellor_type || "Trainee"}</strong>
                    </span>
                    <span>
                      TC ID: <strong className="font-mono">{selectedPractitioner.tc_id}</strong>
                    </span>
                    <span>
                      Status: <strong>{selectedPractitioner.status}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Side-by-Side Comparison with Checkbox per field */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                  <span>Side-by-Side Field Selection</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allTicked = {};
                        comparisonFields.forEach((f) => (allTicked[f.key] = true));
                        setSelectedFields(allTicked);
                      }}
                      className="text-xs text-purple-700 hover:underline font-normal"
                    >
                      Select all
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFields({})}
                      className="text-xs text-gray-500 hover:underline font-normal"
                    >
                      Deselect all
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 bg-gray-50 font-semibold text-gray-700 p-3">
                    <div className="col-span-1 text-center">Copy</div>
                    <div className="col-span-3">Field</div>
                    <div className="col-span-4 text-purple-900">Application Value</div>
                    <div className="col-span-4 text-gray-800">Practitioner Current Value</div>
                  </div>

                  {/* Field Rows */}
                  {comparisonFields.map((field) => {
                    const appVal = field.getAppVal(linkingApp);
                    const tcVal = field.getTcVal(selectedPractitioner);
                    const isChecked = !!selectedFields[field.key];

                    return (
                      <div
                        key={field.key}
                        className={`grid grid-cols-12 p-3 items-center transition ${
                          isChecked ? "bg-purple-50/40" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="col-span-1 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleField(field.key)}
                            className="rounded border-gray-300 text-[#6f1d56] focus:ring-[#6f1d56] cursor-pointer"
                          />
                        </div>
                        <div className="col-span-3 font-medium text-gray-900">{field.label}</div>
                        <div className="col-span-4 text-gray-700 font-mono text-xs break-words pr-2">
                          {appVal || <span className="text-gray-400 italic">None</span>}
                        </div>
                        <div className="col-span-4 text-gray-600 font-mono text-xs break-words">
                          {selectedPractitioner ? (
                            tcVal || <span className="text-gray-400 italic">None</span>
                          ) : (
                            <span className="text-gray-400 italic">(Select practitioner)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {Object.values(selectedFields).filter(Boolean).length} field(s) selected for update.
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLinkSubmit}
                    disabled={isLinking || !selectedTcId}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-[#6f1d56] hover:bg-[#581643] rounded-lg transition disabled:opacity-50"
                  >
                    {isLinking ? "Linking..." : "Confirm & Link Practitioner"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DETAILS MODAL ===================== */}
        {showDetailModal && selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-purple-100 animate-fadeIn">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    QC-APP-{String(selectedApp.id).padStart(4, "0")} — {selectedApp.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
                {/* Basic Details */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <span className="text-xs text-gray-400 block">Email</span>
                    <span className="font-medium text-gray-900">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Phone</span>
                    <span className="font-medium text-gray-900">{selectedApp.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Status</span>
                    {renderStatusBadge(selectedApp.status)}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Submitted At</span>
                    <span className="text-gray-700">
                      {selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleString("en-GB") : "-"}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">Registered Address</h3>
                  <p className="text-gray-700">
                    {[
                      selectedApp.answers?.registered_address,
                      selectedApp.answers?.registered_city,
                      selectedApp.answers?.registered_postcode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>

                {/* Modalities & Experience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">Modalities</h3>
                    <p className="text-gray-700">
                      {Array.isArray(selectedApp.answers?.modalities)
                        ? selectedApp.answers.modalities.join(", ")
                        : selectedApp.answers?.modalities || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">Experience Topics</h3>
                    <p className="text-gray-700">
                      {Array.isArray(selectedApp.answers?.experience_areas)
                        ? selectedApp.answers.experience_areas.join(", ")
                        : selectedApp.answers?.experience_areas || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">Attached Documents</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Qualification", path: selectedApp.qualification_document },
                      { label: "DBS Certificate", path: selectedApp.dbs_certificate_qualified },
                      { label: "Valid ID", path: selectedApp.valid_id_document },
                      { label: "Professional Membership", path: selectedApp.professional_membership },
                      { label: "Self-Employment Proof", path: selectedApp.self_employment_proof },
                      { label: "Indemnity Insurance", path: selectedApp.insurance_qualified },
                    ].map((doc) => (
                      <div
                        key={doc.label}
                        className="p-3 border border-gray-100 rounded-lg flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-gray-700">{doc.label}</span>
                        {doc.path ? (
                          <a
                            href={apiService.getStorageUrl(doc.path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-700 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Not attached</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signature */}
                {selectedApp.signature && (
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">Signature</h3>
                    <img
                      src={selectedApp.signature}
                      alt="Applicant Signature"
                      className="max-h-20 border border-gray-200 rounded p-1 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Date: {selectedApp.signature_date || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== REJECT MODAL ===================== */}
        {showRejectModal && rejectingApp && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fadeIn">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" /> Reject Application
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Rejecting application QC-APP-{String(rejectingApp.id).padStart(4, "0")} for {rejectingApp.name}.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This record will be archived and kept for our records. It will no longer appear in your lists.
              </p>

              <div className="mt-4 space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Reason / Notes (Optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection notes or reason..."
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={isRejecting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50"
                >
                  {isRejecting ? "Archiving..." : "Archive"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== ARCHIVE MODAL ===================== */}
        {archiveModalApp && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fadeIn">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" /> Archive Application
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                QC-APP-{String(archiveModalApp.id).padStart(4, "0")} - {archiveModalApp.name}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This record will be archived and kept for our records. It will no longer appear in your lists.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setArchiveModalApp(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleArchiveSubmit}
                  disabled={isArchiving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                >
                  {isArchiving ? "Archiving..." : "Archive"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DUPLICATE PRACTITIONER CONFLICT MODAL (409) ===================== */}
        {showDuplicateModal && duplicateConflictData && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-amber-200 animate-fadeIn space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Practitioner With This Email Already Exists
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    {duplicateConflictData.message}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
                <p className="font-semibold text-amber-900">Recommended Action:</p>
                <p>
                  Use <strong>Link to existing practitioner</strong> to attach this application to their existing profile without changing their type or overwriting details.
                </p>
                <p className="text-gray-500 text-[11px]">
                  Alternatively, you can force the creation of an entirely separate new practitioner record.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const { app, existingTc } = duplicateConflictData;
                    setShowDuplicateModal(false);
                    openLinkModal(app, existingTc?.id);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#6f1d56] hover:bg-[#581643] rounded-lg transition"
                >
                  <Link2 className="w-4 h-4" /> Link to Existing Practitioner
                </button>

                <button
                  type="button"
                  onClick={() => handleAccept(duplicateConflictData.app, true)}
                  disabled={acceptingId === duplicateConflictData.app.id}
                  className="px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition"
                >
                  Force Create New Record
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}

export default function QualifiedApplicationsPage() {
  return (
    <React.Suspense
      fallback={
        <PageGuard permissions={["view_trainee_applications", "manage_training_counsellors"]}>
          <DashboardLayout>
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mb-2"></div>
              <p className="text-sm">Loading applications...</p>
            </div>
          </DashboardLayout>
        </PageGuard>
      }
    >
      <QualifiedApplicationsContent />
    </React.Suspense>
  );
}
