"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import apiService from "@/lib/api";
import CounsellorLayout from "@/components/CounsellorLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  User,
  Mail,
  Lock,
  RefreshCw,
  Save,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

function ProfilePageContent() {
  const router = useRouter();
  const { user: authUser, refreshUser } = useAuth();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (authUser) {
      setProfileForm({
        name: authUser.name || "",
        email: authUser.email || "",
      });
    }
    loadUnreadCount();
  }, [authUser]);

  const loadUnreadCount = async () => {
    try {
      const res = await apiService.getUnreadMessageCount();
      setUnreadCount(res.count || 0);
    } catch (err) {}
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

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <DashboardHeader>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          Account Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Manage your profile and security credentials
        </p>
      </DashboardHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-4xl space-y-8">
          {/* Profile Section */}
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
                    Contact admin to change your email
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#6f1d56] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
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

          {/* Password Section */}
          <section className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#6f1d56]" />
                <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Security
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
                  className="px-6 py-2 bg-[#6f1d56] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all font-bold shadow-sm"
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
