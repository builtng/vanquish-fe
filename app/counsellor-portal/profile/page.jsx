"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import {
  User,
  Mail,
  Lock,
  RefreshCw,
  Save,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Trash2,
  CalendarClock,
} from "lucide-react";

function ProfilePageContent() {
  const router = useRouter();
  const { user: authUser, refreshUser } = useAuth();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [tcData, setTcData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Photo management state
  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Mid Range / Coaching & Counselling consultation delegation toggles
  const [consultationToggles, setConsultationToggles] = useState({
    show_own_consultation_availability: false,
    show_vanquish_consultation_availability: true,
  });
  const [savingToggle, setSavingToggle] = useState(null);

  useEffect(() => {
    if (authUser) {
      setProfileForm({
        name: authUser.name || "",
        email: authUser.email || "",
      });
      if (authUser.photo_url || authUser.photo) {
        setPhotoPreview(apiService.getStorageUrl(authUser.photo_url || authUser.photo));
      }
    }
    loadData();
    loadUnreadCount();
  }, [authUser]);

  const loadData = async () => {
    try {
      const res = await apiService.getCounsellorOwnData();
      if (res && res.tc) {
        setTcData(res.tc);
        if (res.tc.photo_url || res.tc.photo) {
          setPhotoPreview(apiService.getStorageUrl(res.tc.photo_url || res.tc.photo));
        }
        setConsultationToggles({
          show_own_consultation_availability: !!res.tc.show_own_consultation_availability,
          show_vanquish_consultation_availability: !!res.tc.show_vanquish_consultation_availability,
        });
      }
    } catch (err) {
      console.error("Failed to load practitioner data", err);
    }
  };

  const handleToggleConsultationPreference = async (key) => {
    const previous = consultationToggles;
    const next = { ...consultationToggles, [key]: !consultationToggles[key] };
    setConsultationToggles(next);
    setSavingToggle(key);
    try {
      await apiService.updateConsultationDelegationPreferences(next);
      success("Consultation availability preference updated.");
    } catch (err) {
      setConsultationToggles(previous);
      showError(
        err?.message || "Failed to update consultation availability preference.",
      );
    } finally {
      setSavingToggle(null);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await apiService.getUnreadMessageCount();
      setUnreadCount(res.count || 0);
    } catch (err) {}
  };

  // Handle file selection from input or drop
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      showError("Please upload a valid image file (JPG, PNG, WEBP, or GIF).");
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError("Image size must be less than 10MB.");
      return;
    }

    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    // Auto-upload the selected photo
    uploadSelectedPhoto(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const uploadSelectedPhoto = async (fileToUpload) => {
    const file = fileToUpload || photoFile;
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await apiService.uploadCounsellorPhoto(formData);
      success("Profile photo updated successfully!");
      setPhotoFile(null);
      if (res.photo_url || res.photo) {
        setPhotoPreview(apiService.getStorageUrl(res.photo_url || res.photo));
      }
      if (res.tc) {
        setTcData(res.tc);
      }
      await refreshUser();
    } catch (err) {
      showError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async () => {
    setDeletingPhoto(true);
    try {
      await apiService.deleteCounsellorPhoto();
      success("Profile photo removed successfully");
      setPhotoPreview(null);
      setPhotoFile(null);
      setShowDeletePhotoModal(false);
      await refreshUser();
      await loadData();
    } catch (err) {
      showError(err.message || "Failed to remove profile photo");
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.updateProfile(profileForm);
      await refreshUser();
      success("Profile updated successfully");
    } catch (err) {
      showError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      showError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await apiService.changePassword(passwordForm);
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      success("Password changed successfully");
    } catch (err) {
      showError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const initials = (profileForm.name || authUser?.name || "TC")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Practitioner Account & Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Manage your public photo, profile information, and security credentials
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-4xl space-y-8 pb-12">
          
          {/* Profile Photo Section */}
          <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#6f1d56]" />
                <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Profile Photo
                </h2>
              </div>
              {tcData && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-[#6f1d56] dark:text-purple-300 font-semibold">
                  {tcData.counsellor_type || "Practitioner"} • ID: {tcData.tc_id || "TC"}
                </span>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-900/30 shadow-md bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt={profileForm.name || "Practitioner"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl font-black text-[#6f1d56] dark:text-purple-300 tracking-wider">
                        {initials}
                      </div>
                    )}

                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1.5 animate-fadeIn">
                        <RefreshCw className="w-6 h-6 animate-spin text-white" />
                        <span className="font-medium">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Change Overlay Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    aria-label="Upload photo"
                    className="absolute bottom-1 right-1 p-2 bg-[#6f1d56] hover:bg-[#5a1645] text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload & Management Actions */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                      Upload your practitioner image
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1 leading-relaxed">
                      Your photo is shown to clients when selecting a practitioner, on your session notes, and across your portal profile. Use a clear, front-facing portrait.
                    </p>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer transition-all ${
                      isDragOver
                        ? "border-[#6f1d56] bg-purple-50/50 dark:bg-purple-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-[#6f1d56] hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-[#6f1d56] dark:text-purple-300">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        <span className="text-[#6f1d56] underline dark:text-purple-400">Click to choose image</span> or drag and drop here
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        JPG, PNG, WEBP, or GIF • Max 10MB
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
                    className="hidden"
                    onChange={handleInputChange}
                  />

                  {/* Photo Actions Bar */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-4 py-2 bg-[#6f1d56] hover:bg-[#5a1645] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                    >
                      {uploadingPhoto ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          {photoPreview ? "Change Photo" : "Upload Photo"}
                        </>
                      )}
                    </button>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => setShowDeletePhotoModal(true)}
                        disabled={deletingPhoto || uploadingPhoto}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Details Section */}
          <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#6f1d56]" />
                <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Profile Information
                </h2>
              </div>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[#6f1d56] outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm outline-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Contact administration to change your official email address
                  </p>
                </div>
              </div>

              {tcData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-gray-400 block font-medium">Status</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {tcData.status || "Active"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-gray-400 block font-medium">Counsellor Tier</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {tcData.counsellor_type || "Trainee"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-gray-400 block font-medium">Peer Support Group</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {tcData.attendance_group?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#6f1d56] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Consultation Availability Toggle (Qualified counsellors only) */}
          {tcData?.counsellor_type === "Qualified" && (
            <section className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#f4f7f4] text-[#2d5a3f] rounded-xl">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-base">
                      Consultation Availability Toggles
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                      For Qualified Counsellors • Delegate or host your initial consultations
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-[#2d5a3f] text-xs font-bold rounded-full border border-emerald-100">
                  Qualified Practitioner
                </span>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-xs md:text-sm text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed">
                  Control how clients applying for Mid-Range or Coaching &amp;
                  Counselling discover and book initial consultations on your profile.
                </p>

                <div className="space-y-4">
                  {/* Toggle 1: Show clients my consultation availability */}
                  <div className="flex items-start justify-between p-5 bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 transition">
                    <div className="flex items-start gap-4 pr-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2d5a3f] border border-emerald-100/60 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100">
                          Show clients my consultation availability
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] leading-relaxed">
                          Display your own consultation availability on your profile (Filtered searches section which clients view). Clients can book consultation slots directly with you.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={consultationToggles.show_own_consultation_availability}
                      disabled={savingToggle === "show_own_consultation_availability"}
                      onClick={() =>
                        handleToggleConsultationPreference(
                          "show_own_consultation_availability",
                        )
                      }
                      className={`relative inline-flex h-7 w-13 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#2d5a3f] focus:ring-offset-2 disabled:opacity-50 cursor-pointer ${
                        consultationToggles.show_own_consultation_availability
                          ? "bg-[#2d5a3f]"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          consultationToggles.show_own_consultation_availability
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Show clients Vanquish Therapies consultation availability */}
                  <div className="flex items-start justify-between p-5 bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 transition">
                    <div className="flex items-start gap-4 pr-4">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6f1d56] border border-purple-100/60 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-serif font-black text-base">
                        V
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100">
                          Show clients Vanquish Therapies consultation availability
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] leading-relaxed">
                          If you do not have any consultation availability, display Vanquish Therapies' consultation slots instead. Vanquish Therapies will conduct the initial consultation on your behalf, and match the client with you afterwards.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={
                        consultationToggles.show_vanquish_consultation_availability
                      }
                      disabled={
                        savingToggle === "show_vanquish_consultation_availability"
                      }
                      onClick={() =>
                        handleToggleConsultationPreference(
                          "show_vanquish_consultation_availability",
                        )
                      }
                      className={`relative inline-flex h-7 w-13 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#2d5a3f] focus:ring-offset-2 disabled:opacity-50 cursor-pointer ${
                        consultationToggles.show_vanquish_consultation_availability
                          ? "bg-[#2d5a3f]"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          consultationToggles.show_vanquish_consultation_availability
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Priority Logic Callout Box */}
                <div className="p-4 bg-[#f4f7f4] dark:bg-gray-800/60 rounded-2xl border border-[#e2ece4] dark:border-gray-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#2d5a3f] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Priority Logic
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      • When you have open consultation slots and <strong>"Show clients my consultation availability"</strong> is enabled, clients will see your direct availability.<br />
                      • Where you have no consultation availability or prefer not to conduct them, <strong>Vanquish Therapies' consultation availability</strong> is displayed instead.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Password Section */}
          <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#6f1d56]" />
                <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Security & Password
                </h2>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current_password: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-12 py-2 border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[#6f1d56] outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-12 py-2 border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[#6f1d56] outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password_confirmation: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-12 py-2 border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[#6f1d56] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#6f1d56] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* Delete Photo Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeletePhotoModal}
        onClose={() => setShowDeletePhotoModal(false)}
        onConfirm={handleDeletePhoto}
        title="Remove Profile Photo"
        message="Are you sure you want to remove your profile photo? A default avatar placeholder with your initials will be displayed until you upload a new photo."
        loading={deletingPhoto}
      />
    </CounsellorLayout>
  );
}

export default function ProfilePage() {
  return (
    <SidebarProvider>
      <ProfilePageContent />
    </SidebarProvider>
  );
}
