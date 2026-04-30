"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  UserCheck,
  FolderPlus,
  Share2,
  ChevronRight,
  Home,
  MoreVertical,
  Pin,
  FileIcon,
  Folder as FolderIcon,
  ArrowLeft,
  Check,
} from "lucide-react";

export default function SharedDocumentsPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { confirm } = useModal();
  
  const [loading, setLoading] = useState(true);
  const [folderStack, setFolderStack] = useState([{ id: null, name: "Home" }]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [clients, setClients] = useState([]);
  
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "internal",
    parent_id: null,
    file: null,
    description: "",
  });

  const [shareData, setShareData] = useState({
    folder: null,
    shares: [],
  });

  const currentFolderId = folderStack[folderStack.length - 1].id;

  const loadData = useCallback(async (folderId = null) => {
    setLoading(true);
    try {
      const res = await apiService.getSharedDocuments(folderId);
      setFolders(res.folders || []);
      setFiles(res.files || []);
      setCurrentFolder(res.current_folder);
    } catch (err) {
      console.error("Error loading documents:", err);
      showError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData(currentFolderId);
  }, [currentFolderId, loadData]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await apiService.getClients();
        setClients(res.data || []);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

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

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await apiService.createFolder({
        name: formData.name,
        type: formData.type,
        parent_id: currentFolderId,
      });
      success("Folder created successfully");
      setIsNewFolderModalOpen(false);
      setFormData({ ...formData, name: "", type: "internal" });
      loadData(currentFolderId);
    } catch (err) {
      showError(err.message || "Failed to create folder");
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      showError("Please select a file");
      return;
    }

    try {
      const data = new FormData();
      data.append("file", formData.file);
      data.append("name", formData.name || formData.file.name);
      data.append("description", formData.description);
      if (currentFolderId) data.append("folder_id", currentFolderId);

      await apiService.uploadSharedDocument(data);
      success("File uploaded successfully");
      setIsUploadModalOpen(false);
      setFormData({ ...formData, file: null, name: "", description: "" });
      loadData(currentFolderId);
    } catch (err) {
      showError(err.message || "Failed to upload file");
    }
  };

  const handleDeleteFolder = async (folder) => {
    const ok = await confirm({
      title: "Delete Folder",
      message: `Are you sure you want to delete "${folder.name}" and all its contents?`,
      confirmText: "Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await apiService.deleteFolder(folder.id);
        success("Folder deleted");
        loadData(currentFolderId);
      } catch (err) {
        showError("Failed to delete folder");
      }
    }
  };

  const handleDeleteFile = async (file) => {
    const ok = await confirm({
      title: "Delete File",
      message: `Are you sure you want to delete "${file.name}"?`,
      confirmText: "Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await apiService.deleteSharedDocument(file.id);
        success("File deleted");
        loadData(currentFolderId);
      } catch (err) {
        showError("Failed to delete file");
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      await apiService.downloadSharedDocument(file.id, file.name);
      success("Download started");
    } catch (err) {
      showError("Download failed");
    }
  };

  const openShareModal = (folder) => {
    setShareData({
      folder,
      shares: folder.shares || [],
    });
    setIsShareModalOpen(true);
  };

  const handleUpdateShares = async () => {
    try {
      await apiService.shareFolder(shareData.folder.id, shareData.shares);
      success("Sharing updated");
      setIsShareModalOpen(false);
      loadData(currentFolderId);
    } catch (err) {
      showError("Failed to update sharing");
    }
  };

  const toggleShareTarget = (type, id = null) => {
    const exists = shareData.shares.some(s => s.target_type === type && s.target_id === id);
    if (exists) {
      setShareData({
        ...shareData,
        shares: shareData.shares.filter(s => !(s.target_type === type && s.target_id === id))
      });
    } else {
      setShareData({
        ...shareData,
        shares: [...shareData.shares, { target_type: type, target_id: id }]
      });
    }
  };

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardHeader
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormData({ ...formData, type: "internal" });
                setIsUploadModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#6f1d56] rounded-lg border border-purple-200 hover:bg-purple-100 font-medium transition-all"
            >
              <Upload className="w-4 h-4" />
              UPLOAD FILES
            </button>
            <button
              onClick={() => {
                setFormData({ ...formData, type: "internal" });
                setIsNewFolderModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#6f1d56] rounded-lg border border-purple-200 hover:bg-purple-100 font-medium transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              NEW FOLDER
            </button>
            <button
              onClick={() => {
                setFormData({ ...formData, type: "shared" });
                setIsNewFolderModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-purple-200 text-[#6f1d56] rounded-lg hover:bg-purple-50 font-medium transition-all"
            >
              <Share2 className="w-4 h-4" />
              NEW SHARED FOLDER
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          {folderStack.map((item, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`hover:text-[#6f1d56] transition-colors ${index === folderStack.length - 1 ? "font-bold text-[#6f1d56]" : ""}`}
              >
                {item.name}
              </button>
              {index < folderStack.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-3">
          Files
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
                placeholder="Search files and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6f1d56] transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(currentFolderId)}
                className="p-2 text-gray-400 hover:text-[#6f1d56] transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Folder Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 text-purple-200 animate-spin mb-4" />
                <p className="text-gray-400">Loading your files...</p>
              </div>
            ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Files className="w-10 h-10 text-gray-200 dark:text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">This folder is empty</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">
                  Upload files or create new folders to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                {/* BACK BUTTON if not home */}
                {folderStack.length > 1 && (
                  <button
                    onClick={navigateBack}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10 transition-all border border-transparent group-hover:border-purple-200">
                      <ArrowLeft className="w-8 h-8 text-gray-400 group-hover:text-[#6f1d56] transition-colors" />
                    </div>
                    <span className="mt-3 text-xs font-bold text-gray-500 group-hover:text-[#6f1d56] transition-colors uppercase">
                      Go Back
                    </span>
                  </button>
                )}

                {/* FOLDERS */}
                {filteredFolders.map((folder) => (
                  <div key={folder.id} className="flex flex-col items-center group relative">
                    <button
                      onClick={() => navigateToFolder(folder.id, folder.name)}
                      className="w-full aspect-square bg-purple-50/50 dark:bg-purple-900/5 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10 transition-all border border-purple-100/50 dark:border-purple-900/20 group-hover:border-purple-200"
                    >
                      <FolderIcon className={`w-12 h-12 ${folder.type === 'shared' ? 'text-blue-400' : 'text-[#a855f7]'} fill-current opacity-80`} />
                      {folder.type === 'shared' && (
                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 p-1 rounded-full border border-white">
                          <Share2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                    <div className="mt-3 flex items-center gap-1 max-w-full px-2">
                       <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate text-center">
                        {folder.name}
                      </span>
                    </div>
                    
                    {/* Folder Actions Menu */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openShareModal(folder); }}
                        className="p-1.5 bg-white shadow-md rounded-full text-blue-600 hover:bg-blue-50 border border-gray-100"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                        className="p-1.5 bg-white shadow-md rounded-full text-red-600 hover:bg-red-50 border border-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* FILES */}
                {filteredFiles.map((file) => (
                  <div key={file.id} className="flex flex-col items-center group relative">
                    <button
                      onClick={() => handleDownload(file)}
                      className="w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 group-hover:border-purple-200 group-hover:shadow-lg shadow-sm"
                    >
                      <FileIcon className="w-10 h-10 text-gray-400 group-hover:text-[#6f1d56] transition-colors" />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-white/90 backdrop-blur-sm border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl">
                         <span className="text-[10px] font-bold text-[#6f1d56] block text-center uppercase tracking-tighter">
                          {file.file_type} • {file.file_size}
                        </span>
                      </div>
                    </button>
                    <span className="mt-3 text-xs font-bold text-gray-600 dark:text-gray-400 truncate w-full text-center px-1">
                      {file.name}
                    </span>

                    {/* File Actions */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                       <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                        className="p-1.5 bg-white shadow-md rounded-full text-[#6f1d56] hover:bg-purple-50 border border-gray-100"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(file); }}
                        className="p-1.5 bg-white shadow-md rounded-full text-red-600 hover:bg-red-50 border border-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {formData.type === 'shared' ? 'Create Shared Folder' : 'Create New Folder'}
              </h3>
              <button 
                onClick={() => setIsNewFolderModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Marketing Materials"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#6f1d56] transition-all"
                />
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {formData.type === 'shared' 
                    ? "This folder will be shared based on your selected criteria after creation." 
                    : "This folder is for internal/admin use only."}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#6f1d56] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:opacity-90 transition-all hover:-translate-y-0.5"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Upload to {folderStack[folderStack.length - 1].name}</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleUploadFile} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Policy 2024 (leave blank to use filename)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#6f1d56]"
                />
              </div>

              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-100 dark:border-gray-800 border-dashed rounded-2xl hover:border-[#6f1d56] transition-colors cursor-pointer group relative bg-gray-50/50 dark:bg-gray-800/50"
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-300 group-hover:text-[#6f1d56] transition-colors" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative cursor-pointer font-bold text-[#6f1d56] hover:text-[#5a1746]">
                      {formData.file ? formData.file.name : "Choose a file to upload"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    PDF, DOCX, XLSX, images up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setFormData({ ...formData, file });
                  }}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.file}
                  className="flex-1 px-4 py-3 bg-[#6f1d56] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:opacity-90 disabled:opacity-30 transition-all hover:-translate-y-0.5"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && shareData.folder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300 border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Share "{shareData.folder.name}"</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Permissions and Visibility</p>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share With Groups</label>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => toggleShareTarget('all_trainees')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${shareData.shares.some(s => s.target_type === 'all_trainees') ? 'border-[#6f1d56] bg-purple-50 dark:bg-purple-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-purple-200'}`}
                    >
                        <User className={`w-6 h-6 ${shareData.shares.some(s => s.target_type === 'all_trainees') ? 'text-[#6f1d56]' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-bold uppercase text-center">Trainee Counsellors</span>
                        {shareData.shares.some(s => s.target_type === 'all_trainees') && <Check className="w-3 h-3 text-[#6f1d56] absolute top-2 right-2" />}
                    </button>

                    <button 
                      onClick={() => toggleShareTarget('all_qualified')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group relative ${shareData.shares.some(s => s.target_type === 'all_qualified') ? 'border-[#6f1d56] bg-purple-50 dark:bg-purple-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-purple-200'}`}
                    >
                        <UserCheck className={`w-6 h-6 ${shareData.shares.some(s => s.target_type === 'all_qualified') ? 'text-[#6f1d56]' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-bold uppercase text-center">Qualified Counsellors</span>
                        {shareData.shares.some(s => s.target_type === 'all_qualified') && <Check className="w-3 h-3 text-[#6f1d56] absolute top-2 right-2" />}
                    </button>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share With Individual Contacts</label>
                 <div className="max-h-56 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-xl divide-y divide-gray-50 dark:divide-gray-800">
                    {clients.length === 0 ? (
                      <div className="p-8 text-center">
                         <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                         <p className="text-xs text-gray-400">No contacts found</p>
                      </div>
                    ) : (
                      clients.map(client => (
                        <button
                          key={client.id}
                          onClick={() => toggleShareTarget('individual_client', client.id)}
                          className={`w-full flex items-center justify-between p-3 text-left transition-colors ${shareData.shares.some(s => s.target_type === 'individual_client' && s.target_id === client.id) ? 'bg-purple-50 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                               {client.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                               <p className={`text-[11px] font-bold ${shareData.shares.some(s => s.target_type === 'individual_client' && s.target_id === client.id) ? 'text-[#6f1d56]' : 'text-gray-700 dark:text-gray-300'}`}>{client.name}</p>
                               <p className="text-[9px] text-gray-400">{client.email}</p>
                            </div>
                          </div>
                          {shareData.shares.some(s => s.target_type === 'individual_client' && s.target_id === client.id) && (
                            <div className="w-5 h-5 rounded-full bg-[#6f1d56] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                 </div>
                 <p className="text-[10px] text-gray-400 italic text-center">
                    Shared folders appear in the respective user's portal under "Resources".
                 </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateShares}
                  className="flex-1 px-4 py-3 bg-[#6f1d56] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:opacity-90 transition-all hover:-translate-y-0.5"
                >
                  Save Sharing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
