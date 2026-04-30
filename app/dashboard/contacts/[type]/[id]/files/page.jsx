"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Files,
  Folder,
  Plus,
  Search,
  MoreVertical,
  Download,
  Trash2,
  Share2,
  ChevronRight,
  Home,
  Upload,
  RefreshCw,
  FolderPlus,
  Shield,
  Eye,
  Lock,
  MessageSquare,
  ArrowLeft,
  FileText,
  FileArchive,
  FileImage,
  Filter,
  Users
} from "lucide-react";
import apiService from "@/lib/api";
import { format } from "date-fns";
import PageGuard from "@/components/PageGuard";

export default function ContactFilesPage() {
  const { type, id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [contact, setContact] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderStack, setFolderStack] = useState([]); // [{id, name, type}]
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadFormData, setUploadFormData] = useState({
    name: "",
    description: "",
    file: null,
    is_pinned: false
  });
  const [currentCategory, setCurrentCategory] = useState(null);

  const fetchContent = useCallback(async (folderId = null) => {
    try {
      setLoading(true);
      const data = await apiService.getContactFiles(type, id, folderId);
      
      setFolders(data.folders || []);
      setFiles(data.files || []);
      
      if (data.contact) {
        setContact(data.contact);
      }
      
      if (data.current_category) {
        setCurrentCategory(data.current_category);
        setCurrentFolder({ id: data.current_category, name: getCategoryName(data.current_category), is_virtual: true });
      } else if (data.current_folder) {
        setCurrentFolder(data.current_folder);
      } else if (!folderId) {
        setCurrentFolder(null);
        setCurrentCategory(null);
      }
      
    } catch (error) {
      console.error("Error fetching contact files:", error);
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  const getCategoryName = (cat) => {
    switch (cat) {
      case 'private': return 'Private Files';
      case 'shared': return 'Shared with Contact';
      case 'uploaded': return 'Uploaded by Contact';
      default: return cat;
    }
  };

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleFolderClick = (folder) => {
    setFolderStack([...folderStack, folder]);
    fetchContent(folder.id);
  };

  const navigateBack = () => {
    if (folderStack.length === 0) return;
    
    const newStack = [...folderStack];
    newStack.pop();
    setFolderStack(newStack);
    
    const parentFolderId = newStack.length > 0 ? newStack[newStack.length - 1].id : null;
    fetchContent(parentFolderId);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setFolderStack([]);
      fetchContent(null);
    } else {
      const newStack = folderStack.slice(0, index + 1);
      setFolderStack(newStack);
      fetchContent(newStack[newStack.length - 1].id);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await apiService.createFolder({
        name: newFolderName,
        parent_id: currentFolder && !currentFolder.is_virtual ? currentFolder.id : null,
        type: currentCategory === 'private' ? 'internal' : 'shared',
        client_id: type === 'client' ? contact.id : null,
        tc_id: type === 'tc' ? contact.id : null,
        category: currentCategory
      });
      setNewFolderName("");
      setShowFolderModal(false);
      fetchContent(currentFolder ? currentFolder.id : null);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFormData.file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFormData.file);
      formData.append("name", uploadFormData.name || uploadFormData.file.name);
      formData.append("description", uploadFormData.description || "");
      if (currentFolder && !currentFolder.is_virtual) {
        formData.append("folder_id", currentFolder.id);
      }
      
      formData.append("client_id", type === 'client' ? contact.id : "");
      formData.append("tc_id", type === 'tc' ? contact.id : "");
      formData.append("category", currentCategory || "");
      formData.append("is_pinned", uploadFormData.is_pinned ? "1" : "0");

      await apiService.uploadSharedDocument(formData);
      setUploadFormData({ name: "", description: "", file: null, is_pinned: false });
      setShowUploadModal(false);
      fetchContent(currentFolder ? currentFolder.id : null);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await apiService.deleteSharedDocument(id);
      fetchContent(currentFolder ? currentFolder.id : null);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this folder and all its contents?")) return;
    try {
      await apiService.deleteFolder(id);
      fetchContent(currentFolder ? currentFolder.id : null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleDownload = (file) => {
    apiService.downloadSharedDocument(file.id, file.name);
  };

  const getFileIcon = (type) => {
    const ext = type ? type.toLowerCase() : "";
    if (ext.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    if (ext.includes("doc") || ext.includes("txt")) return <FileText className="w-8 h-8 text-blue-500" />;
    if (ext.includes("xls") || ext.includes("csv")) return <FileText className="w-8 h-8 text-green-500" />;
    if (ext.includes("png") || ext.includes("jpg") || ext.includes("jpeg")) return <FileImage className="w-8 h-8 text-purple-500" />;
    if (ext.includes("zip") || ext.includes("rar")) return <FileArchive className="w-8 h-8 text-amber-500" />;
    return <Files className="w-8 h-8 text-gray-400" />;
  };

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageGuard allowedRoles={["admin", "super_admin", "staff"]}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <nav className="flex mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <button 
                      onClick={() => router.push("/dashboard")}
                      className="hover:text-purple-600 transition-colors"
                    >
                      <Home size={16} />
                    </button>
                  </li>
                  <li><ChevronRight size={14} /></li>
                  <li>
                    <button 
                      onClick={() => handleBreadcrumbClick(-1)}
                      className={`hover:text-purple-600 transition-colors ${folderStack.length === 0 ? "font-bold text-gray-900 dark:text-white" : ""}`}
                    >
                      Contact Files
                    </button>
                  </li>
                  {contact && (
                    <>
                      <li><ChevronRight size={14} /></li>
                      <li>
                        <button 
                          onClick={() => handleBreadcrumbClick(-1)}
                          className={`hover:text-purple-600 transition-colors ${folderStack.length === 0 ? "font-bold text-gray-900 dark:text-white" : ""}`}
                        >
                          {contact.name}
                        </button>
                      </li>
                    </>
                  )}
                  {folderStack.map((folder, index) => (
                    <React.Fragment key={folder.id}>
                      <li><ChevronRight size={14} /></li>
                      <li>
                        <button 
                          onClick={() => handleBreadcrumbClick(index)}
                          className={`hover:text-purple-600 transition-colors ${index === folderStack.length - 1 ? "font-bold text-gray-900 dark:text-white" : ""}`}
                        >
                          {folder.name}
                        </button>
                      </li>
                    </React.Fragment>
                  ))}
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Files className="text-purple-500" />
                {currentFolder ? currentFolder.name : (contact ? `${contact.name}'s Files` : "Contact Files")}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => fetchContent(currentFolder ? currentFolder.id : null)}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              
              {currentFolder && (
                <>
                  <button
                    onClick={() => setShowFolderModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    <FolderPlus size={16} />
                    New Folder
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm"
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search files and folders..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Section */}
        {loading && folderStack.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders List */}
            {filteredFolders.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className="group p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/50 transition-all cursor-pointer relative"
                      onClick={() => handleFolderClick(folder)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${folder.is_virtual ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"}`}>
                          {folder.category === 'private' ? <Lock size={24} /> : 
                           folder.category === 'shared' ? <Share2 size={24} /> :
                           folder.category === 'uploaded' ? <Upload size={24} /> :
                           <Folder size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {folder.name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {folder.description || (folder.is_virtual ? "Virtual Category" : "Folder")}
                          </p>
                        </div>
                        {!folder.is_virtual && (
                          <button 
                            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Files List */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Files</h2>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Document Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Size</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Upload Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <Files size={40} className="text-gray-300 mb-2" />
                            <p>No files found in this folder</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {getFileIcon(file.file_type)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md">
                                  {file.name}
                                </h4>
                                {file.description && (
                                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                    {file.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{file.file_type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{file.file_size}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {file.created_at ? format(new Date(file.created_at), "MMM d, yyyy") : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleDownload(file)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                                title="Download"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Modal for Creating Folder */}
        {showFolderModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FolderPlus className="text-purple-500" />
                  Create New Folder
                </h3>
              </div>
              <form onSubmit={handleCreateFolder}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                      placeholder="e.g. Identity Documents"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                    <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed flex gap-2">
                      <Lock size={14} className="flex-shrink-0 mt-0.5" />
                      This folder will be created in the <strong>{getCategoryName(currentCategory)}</strong> category.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFolderModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                    disabled={!newFolderName.trim()}
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Uploading File */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Upload className="text-purple-500" />
                  Upload Document
                </h3>
              </div>
              <form onSubmit={handleUpload}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select File</label>
                    <input
                      type="file"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-800 dark:file:text-gray-200"
                      onChange={(e) => setUploadFormData({ ...uploadFormData, file: e.target.files[0] })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                      placeholder="Enter a friendly name for this file"
                      value={uploadFormData.name}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                    <textarea
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white resize-none"
                      rows="3"
                      placeholder="Add some context about this file..."
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_pinned"
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      checked={uploadFormData.is_pinned}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, is_pinned: e.target.checked })}
                    />
                    <label htmlFor="is_pinned" className="text-sm text-gray-700 dark:text-gray-300">Pin this document to top</label>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    disabled={!uploadFormData.file || isUploading}
                  >
                    {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isUploading ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageGuard>
  );
}
