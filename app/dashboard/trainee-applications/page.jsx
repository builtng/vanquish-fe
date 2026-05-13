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
import { useModal } from "@/contexts/ModalContext";
import { StatusBadge, SearchableStatusSelect } from "@/components/StatusBadge";

function TraineeApplicationsDashboardContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(filterParam === "video" ? "Stage 2 Video Submitted" : "all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { prompt, confirm } = useModal();
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        status,
        source,
      };
      
      const data = await apiService.getTraineeApplications(params);
      setApplications(data.data);
      setTotalPages(data.last_page);
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

  const updateStatus = async (id, newStatus, inductionDate = null) => {
    setUpdatingId(id);
    try {
      await apiService.updateTraineeApplicationStatus(id, newStatus, inductionDate);
      toast.success(`Status updated to ${newStatus}`);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChangeAction = async (id, newStatus) => {
    if (newStatus === 'Accepted') {
      const date = await prompt({
        title: "Induction Date",
        message: "Enter Induction Date for this trainee:",
        defaultValue: "Monday, April 6th, 2026"
      });
      if (date) updateStatus(id, newStatus, date);
    } else {
      updateStatus(id, newStatus);x
    }
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.filter(app => app).map(app => app.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const bulkUpdateStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => apiService.updateTraineeApplicationStatus(id, newStatus)));
      toast.success(`Updated ${selectedIds.length} applications to ${newStatus}`);
      setSelectedIds([]);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to update some applications.");
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
          
          <div className="w-full md:w-56">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
            <SearchableStatusSelect
              options={[
                'New Application','Stage 1 Complete','Stage 2 Invited',
                'Stage 2 Video Submitted','Stage 2 Approved','Stage 3 Interview Booked',
                'Interview Attended','Interview No Show','Accepted',
                'Induction Attended','Induction No-Show','Onboarding',
                'Active Placement','Rejected','Hold'
              ]}
              value={status}
              onChange={(v) => { setStatus(v); setPage(1); }}
              includeAll
              size="sm"
            />
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-purple-700 ml-2">{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-purple-200"></div>
            <button 
              onClick={() => bulkUpdateStatus('Stage 1 Complete')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
            >
              Approve All (S1)
            </button>
            <button 
              onClick={() => bulkUpdateStatus('Rejected')}
              className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              Reject All
            </button>
          </div>
          <button 
            onClick={() => setSelectedIds([])}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <div className="flex justify-center">
                    <input 
                      type="checkbox" 
                      checked={applications.length > 0 && selectedIds.length === applications.length}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded-md border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer shadow-sm transition-all hover:border-purple-400"
                    />
                  </div>
                </th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Course Info</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status & Action</th>
                <th className="px-6 py-4 text-right">View</th>
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
                applications.filter(app => app).map((app) => (
                  <tr key={app.id} className={`hover:bg-gray-50/80 transition-all group ${selectedIds.includes(app.id) ? 'bg-purple-50/40 ring-1 ring-inset ring-purple-100' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="w-5 h-5 rounded-md border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer shadow-sm transition-all hover:border-purple-400"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-100 flex items-center justify-center text-purple-700 font-black shadow-inner">
                          {app.first_name[0]}{app.last_name[0]}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 group-hover:text-purple-700 transition-colors leading-tight text-sm translate-y-[-1px]">{app.first_name} {app.last_name}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1 font-medium italic">
                            <Mail className="w-3 h-3 text-purple-400" /> {app.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[180px]">
                        <div className="text-xs font-black text-gray-800 leading-tight line-clamp-1">{app.course_name}</div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-70">{app.institution}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest w-fit shadow-sm border ${
                          app.source === 'jotform' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                          {app.source.replace('_', ' ')}
                        </span>
                        <div className="text-[9px] text-gray-400 flex items-center gap-1 font-bold">
                          <Clock className="w-2.5 h-2.5 opacity-50" /> {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <SearchableStatusSelect
                          options={[
                            'New Application','Stage 1 Complete','Stage 2 Invited',
                            'Stage 2 Video Submitted','Stage 2 Approved','Stage 3 Interview Booked',
                            'Interview Attended','Interview No Show','Accepted',
                            'Induction Attended','Induction No-Show','Onboarding',
                            'Active Placement','Rejected','Hold'
                          ]}
                          value={app.status}
                          onChange={(v) => handleStatusChangeAction(app.id, v)}
                          disabled={updatingId === app.id}
                          size="sm"
                        />
                        {app.status === 'Accepted' && app.induction_date && (
                          <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 ml-1 animate-in fade-in slide-in-from-left-2">
                            <CheckCircle className="w-2.5 h-2.5" /> Starts: {app.induction_date}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/dashboard/trainee-applications/${app.id}`}
                        className="inline-flex p-3 text-gray-400 hover:text-purple-600 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-purple-100"
                        title="View Full Profile"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
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
