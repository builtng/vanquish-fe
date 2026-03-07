"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Settings, ExternalLink, Mail, Phone, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import apiService from "@/lib/api";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";

function TraineeApplicationsDashboardContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(filterParam === "video" ? "Stage 2 Video Submitted" : "all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        search,
        status,
        source,
      }).toString();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-applications?${query}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data);
        setTotalPages(data.last_page);
      }
    } catch (err) {
      toast.error("Failed to fetch applications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterParam === "video" && status !== "Stage 2 Video Submitted") {
        setStatus("Stage 2 Video Submitted");
    }
  }, [filterParam]);

  useEffect(() => {
    fetchApplications();
  }, [page, status, source]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-applications/${id}/status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchApplications();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const getStatusBadge = (status) => {
    const common = "px-2 py-1 rounded-full text-[10px] font-bold uppercase border";
    switch (status) {
      case 'New Application':          return `${common} bg-blue-50 text-blue-700 border-blue-100`;
      case 'Stage 1 Complete':         return `${common} bg-purple-50 text-purple-700 border-purple-100`;
      case 'Stage 2 Invited':          return `${common} bg-amber-50 text-amber-700 border-amber-100`;
      case 'Stage 2 Video Submitted':  return `${common} bg-orange-50 text-orange-700 border-orange-100 animate-pulse`;
      case 'Stage 2 Approved':         return `${common} bg-indigo-50 text-indigo-700 border-indigo-100`;
      case 'Stage 3 Interview Booked': return `${common} bg-green-50 text-green-700 border-green-100`;
      case 'Interview Attended':       return `${common} bg-teal-50 text-teal-700 border-teal-100`;
      case 'Interview No Show':        return `${common} bg-rose-50 text-rose-700 border-rose-100`;
      case 'Accepted':                 return `${common} bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm`;
      case 'Rejected':                 return `${common} bg-red-50 text-red-700 border-red-100`;
      case 'Hold':                     return `${common} bg-slate-50 text-slate-700 border-slate-100`;
      default:                         return `${common} bg-gray-50 text-gray-700 border-gray-100`;
    }
  };

  return (
    <PageGuard menuId="trainee-applications">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            actions={
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/trainee-applications/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 transition-all font-medium shadow-sm text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Assessment Settings
                </Link>
                <a
                  href="/trainee-application"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium shadow-sm text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Public Form
                </a>
              </div>
            }
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Trainee Applications</h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">Manage and review applicant submissions</p>
            </div>
          </DashboardHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search Applicants</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="New Application">New Application</option>
              <option value="Stage 1 Complete">Stage 1 Complete (Manual Review)</option>
              <option value="Stage 2 Invited">Invited (S2)</option>
              <option value="Stage 2 Video Submitted">Video Submitted (S2)</option>
              <option value="Stage 2 Approved">Approved (S2) / S3 Pending</option>
              <option value="Stage 3 Interview Booked">Interview Booked (S3)</option>
              <option value="Interview Attended">Interview Attended</option>
              <option value="Interview No Show">No Show</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Hold">Hold / Waitlist</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Source</label>
            <select 
              value={source} 
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Sources</option>
              <option value="internal_form">Internal Form</option>
              <option value="jotform">JotForm</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Course Info</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                          {app.first_name[0]}{app.last_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{app.first_name} {app.last_name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {app.email}
                          </div>
                          {app.phone && (
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {app.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">{app.course_name}</div>
                      <div className="text-xs text-gray-500">{app.institution}</div>
                      <div className="text-xs text-gray-400 italic">Duration: {app.course_duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        app.source === 'jotform' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {app.source.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(app.status)}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/trainee-applications/${app.id}`}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        
                        <button 
                          onClick={() => updateStatus(app.id, 'Stage 1 Complete')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Move to S1 Complete"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, 'Rejected')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 dark:bg-[var(--card-bg)] border-t border-gray-100 dark:border-[var(--card-border)] flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  page === p ? 'bg-purple-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}

export default function TraineeApplicationsDashboard() {
  return (
    <React.Suspense fallback={
      <PageGuard menuId="trainee-applications">
        <DashboardLayout>
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-[var(--background)]">
            <Search className="w-8 h-8 text-gray-400 animate-pulse mb-4" />
            <p className="text-gray-500">Loading applications...</p>
          </div>
        </DashboardLayout>
      </PageGuard>
    }>
      <TraineeApplicationsDashboardContent />
    </React.Suspense>
  );
}
