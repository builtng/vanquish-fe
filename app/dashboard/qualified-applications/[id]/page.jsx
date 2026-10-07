"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Shield,
  Briefcase,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";
import apiService from "@/lib/api";

export default function QualifiedApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchApp = async () => {
      try {
        setLoading(true);
        const res = await apiService.get(`/qc-applications/${id}`);
        setApp(res.data);
      } catch (err) {
        console.error("Failed to load QC application:", err);
        setError("Failed to load qualified counsellor application.");
        toast.error("Could not load application details");
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const renderStatusBadge = (status) => {
    const s = status || "New Application";
    let colorClass = "bg-blue-100 text-blue-800 border-blue-200";
    if (s === "Accepted") colorClass = "bg-green-100 text-green-800 border-green-200";
    if (s === "Rejected") colorClass = "bg-red-100 text-red-800 border-red-200";
    if (s === "Archived") colorClass = "bg-amber-100 text-amber-800 border-amber-200";
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {s}
      </span>
    );
  };

  const prevWork = app?.previous_vanquish_work || app?.answers?.previous_vanquish_work;
  const areasToImprove = app?.areas_to_improve || app?.answers?.areas_to_improve;

  return (
    <PageGuard requirePrivilege="training_counsellors">
      <DashboardLayout>
        <DashboardHeader
          title={app ? `QC-APP-${String(app.id).padStart(4, "0")} — ${app.name}` : "Application Details"}
          subtitle="Qualified Counsellor Application"
        />

        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <Link
            href="/dashboard/qualified-applications"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </Link>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm">Loading application details...</p>
            </div>
          ) : error || !app ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="font-semibold">{error || "Application not found"}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {/* Top Summary */}
              <div className="p-6 bg-gradient-to-r from-purple-50/60 to-transparent">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">{app.name}</h2>
                      {renderStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      QC-APP-{String(app.id).padStart(4, "0")} • Submitted{" "}
                      {app.created_at ? new Date(app.created_at).toLocaleString("en-GB") : "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push("/dashboard/qualified-applications")}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      All Applications
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-purple-100/60 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span>{app.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <span>{app.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>
                      {[
                        app.answers?.registered_address || app.registered_address,
                        app.answers?.registered_city || app.registered_city,
                        app.answers?.registered_postcode || app.registered_postcode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ───────────────── PREVIOUSLY WORKED WITH VANQUISH ───────────────── */}
              <div className="p-6 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Previously Worked With Vanquish
                </h3>
                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/80">
                  <div className="text-sm font-semibold text-gray-900">
                    {prevWork || "N/A"}
                  </div>
                  {areasToImprove && (
                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <span className="text-xs font-semibold text-purple-900 block mb-1">
                        Areas to Improve / Development Details:
                      </span>
                      <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {areasToImprove}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modalities & Experience */}
              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                  Modalities & Experience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Modalities</span>
                    <p className="text-gray-800 font-medium">
                      {Array.isArray(app.answers?.modalities)
                        ? app.answers.modalities.join(", ")
                        : app.answers?.modalities || "N/A"}
                    </p>
                    {(app.other_modalities || app.answers?.other_modalities) && (
                      <p className="text-xs text-gray-600 mt-2">
                        <span className="font-semibold text-gray-700">Other:</span>{" "}
                        {app.other_modalities || app.answers?.other_modalities}
                      </p>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Experience Topics</span>
                    <p className="text-gray-800 font-medium">
                      {Array.isArray(app.answers?.experience_areas)
                        ? app.answers.experience_areas.join(", ")
                        : app.answers?.experience_areas || "N/A"}
                    </p>
                    {(app.other_experience_areas || app.answers?.other_experience_areas) && (
                      <p className="text-xs text-gray-600 mt-2">
                        <span className="font-semibold text-gray-700">Other:</span>{" "}
                        {app.other_experience_areas || app.answers?.other_experience_areas}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="p-6 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Attached Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Qualification", path: app.qualification_document },
                    { label: "DBS Certificate", path: app.dbs_certificate_qualified },
                    { label: "Valid ID", path: app.valid_id_document },
                    { label: "Professional Membership", path: app.professional_membership },
                    { label: "Self-Employment Proof", path: app.self_employment_proof },
                    { label: "Indemnity Insurance", path: app.insurance_qualified },
                  ].map((doc) => (
                    <div
                      key={doc.label}
                      className="p-3 border border-gray-100 rounded-xl flex items-center justify-between text-xs bg-gray-50/50"
                    >
                      <span className="font-medium text-gray-700">{doc.label}</span>
                      {doc.path ? (
                        <a
                          href={apiService.getStorageUrl(doc.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-700 hover:underline font-medium"
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
              {app.signature && (
                <div className="p-6 space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Signature
                  </h3>
                  <img
                    src={app.signature}
                    alt="Applicant Signature"
                    className="max-h-24 border border-gray-200 rounded-lg p-2 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Signed Date: {app.signature_date || "N/A"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
