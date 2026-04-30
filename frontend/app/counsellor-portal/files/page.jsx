"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Search,
  FileText,
  Download,
  Shield,
  Upload,
  FolderOpen,
  RefreshCw,
  X,
  User,
  ChevronRight,
  Folder as FolderIcon,
  FileIcon,
  ArrowLeft,
  Home,
} from "lucide-react";

function FilesPageContent() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [folderStack, setFolderStack] = useState([{ id: null, name: "Resources" }]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null,
  });

  const currentFolderId = folderStack[folderStack.length - 1].id;

  const loadData = useCallback(async (folderId = null) => {
    setLoading(true);
    try {
      const [countRes, docsRes] = await Promise.all([
        apiService.getUnreadMessageCount(),
        apiService.getSharedDocuments(folderId),
      ]);
      setUnreadCount(countRes.count || 0);
      setFolders(docsRes.folders || []);
      setFiles(docsRes.files || []);
    } catch (err) {
      console.error("Error loading files:", err);
      showError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData(currentFolderId);
  }, [currentFolderId, loadData]);

  const navigateToFolder = (id, name) => {
    setFolderStack([...folderStack, { id, name }]);
  };

  const navigateBack = () => {
    if (folderStack.length > 1) {
      setFolderStack(folderStack.slice(0, -1));
    }
  };

  const navigateToBreadcrumb = (index) => {
    setFolderStack(folderStack.slice(0, index + 1));
  };

  const handleDownload = async (file) => {
    setDownloading(file.id);
    try {
      await apiService.downloadSharedDocument(file.id, file.name);
      success("Download started");
    } catch (err) {
      showError("Failed to download file");
    } finally {
      setDownloading(null);
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
      if (currentFolderId) data.append("folder_id", currentFolderId);

      await apiService.uploadSharedDocument(data);
      success("Document uploaded successfully");
      setIsUploadModalOpen(false);
      setFormData({ name: "", description: "", file: null });
      loadData(currentFolderId);
    } catch (err) {
      showError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader
        actions={
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-[#6f1d56] text-white rounded-lg hover:opacity-90 font-bold flex items-center gap-2 transition-all text-xs uppercase tracking-wider"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        }
      >
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {folderStack.map((item, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`hover:text-[#6f1d56] transition-colors ${index === folderStack.length - 1 ? "text-[#6f1d56]" : ""}`}
              >
                {item.name}
              </button>
              {index < folderStack.length - 1 && (
                <ChevronRight className="w-3 h-3" />
              )}
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Resources
        </h1>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm min-h-[400px]">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6f1d56] transition-all"
              />
            </div>
            <button 
                onClick={() => loadData(currentFolderId)}
                className="p-2 text-gray-400 hover:text-[#6f1d56] transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <RefreshCw className="w-10 h-10 text-purple-200 animate-spin mb-4" />
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Accessing Secure Storage...</p>
              </div>
            ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FolderOpen className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No items found</h3>
                <p className="text-gray-500 text-xs mt-2 italic px-10">
                  {searchTerm ? "Try a different search term" : "This folder is empty or hasn't been shared with you yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {/* BACK BUTTON */}
                {folderStack.length > 1 && (
                   <button
                    onClick={navigateBack}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10 transition-all border border-transparent group-hover:border-purple-200">
                      <ArrowLeft className="w-8 h-8 text-gray-400 group-hover:text-[#6f1d56] transition-colors" />
                    </div>
                    <span className="mt-3 text-[10px] font-bold text-gray-500 group-hover:text-[#6f1d56] transition-colors uppercase tracking-tighter">
                      Go Back
                    </span>
                  </button>
                )}

                {/* FOLDERS */}
                {filteredFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => navigateToFolder(folder.id, folder.name)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-purple-50/50 dark:bg-purple-900/5 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10 transition-all border border-purple-100/50 dark:border-purple-900/20 group-hover:border-purple-200">
                      <FolderIcon className="w-12 h-12 text-[#a855f7] fill-current opacity-80" />
                    </div>
                    <span className="mt-3 text-xs font-bold text-gray-700 dark:text-gray-300 truncate w-full text-center px-1">
                      {folder.name}
                    </span>
                  </button>
                ))}

                {/* FILES */}
                {filteredFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleDownload(file)}
                    className="flex flex-col items-center group cursor-pointer relative"
                  >
                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 group-hover:border-purple-200 group-hover:shadow-lg shadow-sm">
                      <FileIcon className="w-10 h-10 text-gray-400 group-hover:text-[#6f1d56] transition-colors" />
                      {downloading === file.id && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                           <RefreshCw className="w-6 h-6 text-[#6f1d56] animate-spin" />
                        </div>
                      )}
                    </div>
                    <span className="mt-3 text-xs font-bold text-gray-600 dark:text-gray-400 truncate w-full text-center px-1">
                      {file.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm mb-1">
                Security & Compliance
              </h4>
              <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed font-medium">
                Confidential organizational resources. External distribution is strictly prohibited and subject to professional conduct review.
              </p>
            </div>
          </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-gray-900 dark:text-white">
              <h3 className="font-bold text-sm">Upload to {folderStack[folderStack.length - 1].name}</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Session Feedback"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6f1d56]"
                />
              </div>

              <div>
                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Additional context (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#6f1d56] resize-none"
                />
              </div>

              <div>
                <div className="mt-1 flex justify-center px-4 pt-6 pb-6 border-2 border-gray-100 dark:border-gray-800 border-dashed rounded-xl hover:border-[#6f1d56] transition-colors cursor-pointer group relative bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-300 group-hover:text-[#6f1d56] mb-2" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-bold text-[#6f1d56]">
                        {formData.file ? formData.file.name : "Select file"}
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 text-xs transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-[#6f1d56] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 text-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg shadow-purple-900/10"
                >
                  {uploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CounsellorLayout>
  );
}

export default function FilesPage() {
  return (
    <SidebarProvider>
      <FilesPageContent />
    </SidebarProvider>
  );
}
