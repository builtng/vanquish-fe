"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import { useModal } from "@/contexts/ModalContext";
import {
  Files,
  Search,
  FileText,
  Download,
  Upload,
  FolderOpen,
  RefreshCw,
  Trash2,
  X,
  User,
} from "lucide-react";

export default function AdminSharedDocuments() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { confirm } = useModal();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const docsRes = await apiService.getSharedDocuments();
      setDocuments(docsRes || []);
    } catch (err) {
      console.error("Error loading documents:", err);
      showError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    setDownloading(doc.id);
    try {
      await apiService.downloadSharedDocument(doc.id, doc.name);
      success("Download started");
    } catch (err) {
      showError("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Document",
      message: "Are you sure you want to delete this document? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger"
    });
    if (!ok) return;
    
    setDeleting(id);
    try {
      await apiService.deleteSharedDocument(id);
      success("Document deleted successfully");
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      showError("Failed to delete document");
    } finally {
      setDeleting(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      showError("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name || formData.file.name);
      data.append("description", formData.description);
      data.append("file", formData.file);

      await apiService.uploadSharedDocument(data);
      success("Document uploaded successfully");
      setIsUploadModalOpen(false);
      setFormData({ name: "", description: "", file: null });
      loadData();
    } catch (err) {
      showError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardHeader
        actions={
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-[#6f1d56] text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        }
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Resource Library
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Manage documents shared with all practitioners
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-[var(--bg-secondary)] flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6f1d56]"
                />
              </div>
              <button 
                onClick={loadData}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-[var(--card-border)]">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading library...</p>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-600 text-sm font-medium italic">
                    {searchTerm ? "No files match your search" : "The resource library is empty"}
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-[#6f1d56] flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-medium uppercase">
                            {doc.file_type} • {doc.file_size}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            By {doc.uploader?.name || "Admin"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        className="p-2 text-gray-400 hover:text-[#6f1d56] transition-colors rounded-lg hover:bg-purple-50"
                        title="Download"
                      >
                        {downloading === doc.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        {deleting === doc.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between bg-gray-50/50 dark:bg-[var(--bg-secondary)]">
              <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">Upload Resource</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Document Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Practitioner Handbook 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#6f1d56]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe what this document contains..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#6f1d56] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Select File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-[#6f1d56] transition-colors cursor-pointer group relative">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#6f1d56] transition-colors" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <span className="relative cursor-pointer font-medium text-[#6f1d56] hover:text-[#5a1746]">
                        {formData.file ? formData.file.name : "Upload a file"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      PDF, DOCX, XLSX up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 bg-[#6f1d56] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Confirm Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
