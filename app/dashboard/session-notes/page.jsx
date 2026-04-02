"use client";

import PageGuard from "@/components/PageGuard";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Search, Filter, Calendar, User, 
  ExternalLink, Eye, ChevronLeft, ChevronRight,
  TrendingDown, AlertTriangle, CheckCircle, Clock
} from "lucide-react";
import apiService from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import SearchableSelect from "@/components/SearchableSelect";
import SessionNoteDetailsModal from "@/components/SessionNoteDetailsModal";

export default function SessionNotesPage() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchNotes();
  }, [filterType]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      
      const data = await apiService.getSessionNotes(params);
      setNotes(data || []);
    } catch (err) {
      console.error("Error fetching session notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const searchLower = searchTerm.toLowerCase();
    return (
      note.client?.name?.toLowerCase().includes(searchLower) ||
      note.counsellor?.name?.toLowerCase().includes(searchLower) ||
      note.type?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'risk_update': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'block_summary': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <FileText className="w-4 h-4 text-purple-500" />;
    }
  };

  const getTypeLabel = (type) => {
    return type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "General Note";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reviewed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <PageGuard menuId="session-notes-menu">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Session Notes</h1>
              <p className="text-sm text-muted-foreground mt-1">Review weekly session notes and risk updates from practitioners</p>
            </div>
          </DashboardHeader>

          {/* Filters */}
          <div className="bg-sidebar border-b border-sidebar-border px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by client or practitioner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-input text-input-text rounded-lg focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                />
              </div>
              <div className="w-full md:w-64">
                <SearchableSelect
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  options={[
                    { value: 'all', label: 'All types' },
                    { value: 'weekly', label: 'Weekly Sessions' },
                    { value: 'block_summary', label: 'Block Summaries' },
                    { value: 'risk_update', label: 'Risk Updates' },
                  ]}
                  placeholder="Filter by type"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p>Loading session notes...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border-2 border-dashed border-border p-12 text-center text-gray-400">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No session notes found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paginatedNotes.map((note) => (
                  <div 
                    key={note.id}
                    className="bg-card hover:bg-hover-bg border border-border rounded-xl p-5 shadow-sm transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-[#6f1d56] dark:text-purple-400 shrink-0">
                          {getTypeIcon(note.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground">{note.client?.name || "Unknown Client"}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(note.status)}`}>
                              {note.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>By: {note.counsellor?.name || "System"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(note.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                              <span>{getTypeLabel(note.type)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedNoteId(note.id)}
                          className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-[#6f1d56] dark:text-purple-400 rounded-lg text-sm font-bold hover:bg-[#6f1d56] hover:text-white transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {note.client?.uuid && (
                          <Link 
                            href={`/dashboard/client-details/${note.client.uuid}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-foreground transition-colors"
                            title="Go to Client Page"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {note.content?.summary && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground line-clamp-2 italic">
                          "{note.content.summary}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-sidebar border-t border-sidebar-border px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(filteredNotes.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredNotes.length, currentPage * itemsPerPage)} of {filteredNotes.length} notes
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-hover-bg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? 'bg-[#6f1d56] text-white' 
                          : 'hover:bg-hover-bg text-muted-foreground'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-hover-bg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <SessionNoteDetailsModal 
          noteId={selectedNoteId} 
          onClose={() => setSelectedNoteId(null)} 
        />
      </DashboardLayout>
    </PageGuard>
  );
}
