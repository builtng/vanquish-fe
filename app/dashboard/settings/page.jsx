"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import { usePushNotifications } from "@/lib/usePushNotifications";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Users,
  Video,
  UserCheck,
  Activity,
  Home,
  ClipboardList,
  Settings,
  LogOut,
  Building2,
  Bell,
  User,
  Lock,
  Mail,
  Shield,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  Power,
  ToggleLeft,
  ToggleRight,
  Calendar,
  CreditCard,
} from "lucide-react";
import MenuPrivilegesSettings from "@/components/MenuPrivilegesSettings";
import CompanyBrandingSettings from "@/components/CompanyBrandingSettings";
import SystemModuleToggleSettings from "@/components/SystemModuleToggleSettings";

export default function SettingsPage() {
  const pathname = usePathname();
  const { logout, user: authUser } = useAuth();
  const { success, error: showError } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });
  const {
    pushEnabled,
    permission: pushPermission,
    enablePush,
    disablePush,
    notify: sendPushNotification,
  } = usePushNotifications();
  const [pushToggling, setPushToggling] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSetupStep, setTwoFactorSetupStep] = useState("initial"); // 'initial', 'qr', 'verify', 'complete'
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorQRCode, setTwoFactorQRCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await apiService.getUser();
        if (response.user) {
          setProfile({
            name: response.user.name || "",
            email: response.user.email || "",
            phone: "", // Phone not available in User model
          });
          setTwoFactorEnabled(response.user.two_factor_enabled || false);
        }
      } catch (err) {
        showError("Failed to load profile data");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [showError]);

  // Refresh 2FA status when modal opens
  useEffect(() => {
    if (show2FAModal) {
      const refresh2FAStatus = async () => {
        try {
          const response = await apiService.getUser();
          if (response.user) {
            setTwoFactorEnabled(response.user.two_factor_enabled || false);
          }
        } catch (err) {
          console.error("Failed to refresh 2FA status:", err);
        }
      };
      refresh2FAStatus();
    }
  }, [show2FAModal]);

  const handleProfileSave = async () => {
    try {
      setProfileSaving(true);
      await apiService.updateProfile({ name: profile.name }); // Only update name for now
      success("Profile updated successfully");
    } catch (err) {
      showError(err.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError("New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      await apiService.updatePassword({
        current_password: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
      });
      success("Password updated successfully");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggle2FA = async () => {
    try {
      setTwoFactorLoading(true);
      if (twoFactorEnabled) {
        // Disable 2FA
        await apiService.post("/api/two-factor-authentication");
        success("Two-factor authentication has been disabled.");
        setTwoFactorEnabled(false);
      } else {
        // Start 2FA setup process
        setShow2FAModal(true);
        setTwoFactorSetupStep("initial");
      }
    } catch (err) {
      showError("Failed to update 2FA status.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const start2FASetup = async () => {
    try {
      setTwoFactorLoading(true);
      // Enable 2FA feature first
      await apiService.post("/api/two-factor-authentication");

      // Get QR code and secret
      const qrResponse = await apiService.get("/api/two-factor-qr-code");
      const secretResponse = await apiService.get("/api/two-factor-secret-key");

      // We assume SVGs are returned or base64
      setTwoFactorQRCode(qrResponse.svg || "");
      setTwoFactorSecret(secretResponse.secretKey || "");

      setTwoFactorSetupStep("qr");
    } catch (err) {
      showError("Failed to initialize 2FA setup.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showError("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setTwoFactorLoading(true);
      // Verify the code
      await apiService.post("/api/confirmed-two-factor-authentication", {
        code: verificationCode,
      });

      // Fetch recovery codes
      const codesResponse = await apiService.get(
        "/api/two-factor-recovery-codes",
      );
      setBackupCodes(codesResponse.map((code) => code)); // Adjust mapping based on actual response

      setTwoFactorEnabled(true);
      setTwoFactorSetupStep("complete");
      success("Two-factor authentication successfully enabled!");
    } catch (err) {
      showError("Invalid verification code. Please try again.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <PageGuard menuId="settings">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </DashboardHeader>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                    Profile Settings
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-[var(--text-secondary)] rounded-lg cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                      Contact support to change your email address.
                    </p>
                  </div>
                  {/* Save Profile Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleProfileSave}
                      disabled={profileSaving || profileLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      <Save className="w-4 h-4" />
                      {profileSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                    Notification Preferences
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                        Email Notifications
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                        Receive alerts for new matches and messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.email}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            email: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                          Push Notifications
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                          Receive in-browser alerts for new matches &amp;
                          consultations
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={pushEnabled}
                          disabled={pushToggling || pushPermission === "denied"}
                          onChange={async (e) => {
                            setPushToggling(true);
                            try {
                              if (e.target.checked) {
                                const result = await enablePush();
                                if (result === "granted") {
                                  success("Push notifications enabled!");
                                  sendPushNotification(
                                    "Notifications enabled",
                                    {
                                      body: "You will now receive in-browser alerts from Vanquish.",
                                    },
                                  );
                                } else if (result === "denied") {
                                  showError(
                                    "Notifications are blocked by your browser. Please allow them in your browser settings.",
                                  );
                                } else {
                                  showError(
                                    "Notification permission was not granted.",
                                  );
                                }
                              } else {
                                disablePush();
                                success("Push notifications disabled.");
                              }
                            } finally {
                              setPushToggling(false);
                            }
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                      </label>
                    </div>
                    {/* Blocked state warning */}
                    {pushPermission === "denied" && (
                      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          Notifications are <strong>blocked</strong> by your
                          browser. To enable them, click the lock icon in your
                          browser&apos;s address bar and allow notifications for
                          this site.
                        </p>
                      </div>
                    )}
                    {/* Unsupported browser hint */}
                    {pushPermission === "unsupported" && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Push notifications are not supported in this browser.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                    Security Settings
                  </h2>
                </div>
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                        Password
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                        Change your account password
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium text-sm transition-colors"
                    >
                      Change Password
                    </button>
                  </div>

                  {/* Two-Factor Auth */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-[var(--card-border)]">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                        Two-Factor Authentication (2FA)
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={toggle2FA}
                      disabled={twoFactorLoading}
                      className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                        twoFactorEnabled
                          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
                          : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-900/20 dark:text-purple-400"
                      }`}
                    >
                      {twoFactorLoading ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                      ) : twoFactorEnabled ? (
                        <>Disable 2FA</>
                      ) : (
                        <>Enable 2FA</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Settings - Only visible for admin roles */}
              {authUser && authUser.role === "admin" && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                        Company Branding
                      </h2>
                    </div>
                    <CompanyBrandingSettings />
                  </div>

                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-red-200 dark:border-red-900/30 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Power className="w-5 h-5 text-red-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                          System Maintenance & Global Shutdown
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                          Stop all new registrations and intake forms. Admins
                          can still access the system.
                        </p>
                      </div>
                    </div>
                    <MaintenanceSettingsSection />
                  </div>

                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                            Consultation Available Dates
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                            Manage dates when clients can book intake
                            consultations
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/consultation-slots"
                        className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <span>Manage Dates</span>
                        <Calendar className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                        Service Settings
                      </h2>
                    </div>
                    <ServiceSettingsSection />
                  </div>

                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                          System Module Configuration
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                          Toggle between external JotForms and in-house system modules.
                        </p>
                      </div>
                    </div>
                    <SystemModuleToggleSettings />
                  </div>

                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                        Menu Privileges
                      </h2>
                    </div>
                    <MenuPrivilegesSettings />
                  </div>
                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                        Booking System Settings
                      </h2>
                    </div>
                    <BookingSettingsSection />
                  </div>

                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                        Pricing & Fees
                      </h2>
                    </div>
                    <PricingSettingsSection />
                  </div>

                  {/* Dynamic Email Senders Settings */}
                  <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                            Dynamic Email Senders
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                            Configure FROM email addresses based on email
                            category
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/settings/email-senders"
                        className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <span>Manage Senders</span>
                        <Mail className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => !passwordLoading && setShowPasswordModal(false)}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                      Change Password
                    </h3>
                    <button
                      onClick={() =>
                        !passwordLoading && setShowPasswordModal(false)
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                          className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          required
                          className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2FA Setup Modal */}
        {show2FAModal && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => !twoFactorLoading && setShow2FAModal(false)}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                      {twoFactorSetupStep === "initial" && "Enable 2FA"}
                      {twoFactorSetupStep === "qr" && "Scan QR Code"}
                      {twoFactorSetupStep === "complete" && "2FA Enabled"}
                    </h3>
                    <button
                      onClick={() =>
                        !twoFactorLoading && setShow2FAModal(false)
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {twoFactorSetupStep === "initial" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        Two-factor authentication adds an additional layer of
                        security to your account by requiring more than just a
                        password to log in.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        You will need an authenticator app like Google
                        Authenticator, Authy, or Microsoft Authenticator to
                        complete this setup.
                      </p>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShow2FAModal(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={start2FASetup}
                          disabled={twoFactorLoading}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                        >
                          {twoFactorLoading ? "Loading..." : "Continue"}
                        </button>
                      </div>
                    </div>
                  )}

                  {twoFactorSetupStep === "qr" && (
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        1. Scan this QR code with your authenticator app.
                      </p>

                      <div className="flex justify-center p-4 bg-white border rounded-lg">
                        {twoFactorQRCode ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: twoFactorQRCode,
                            }}
                            className="w-48 h-48"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                            Loading QR Code...
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mb-2">
                          Or enter this secret key manually:
                        </p>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <code className="text-xs font-mono break-all">
                            {twoFactorSecret}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(twoFactorSecret);
                              success("Secret key copied to clipboard!");
                            }}
                            className="ml-2 text-purple-600 hover:text-purple-800 text-xs font-medium"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                          2. Enter the 6-digit code from your app
                        </label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                            )
                          }
                          placeholder="000000"
                          className="w-full px-4 py-2 text-center tracking-[0.5em] text-lg font-mono border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={verify2FA}
                          disabled={
                            twoFactorLoading || verificationCode.length !== 6
                          }
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium block w-full"
                        >
                          {twoFactorLoading
                            ? "Verifying..."
                            : "Verify and Enable"}
                        </button>
                      </div>
                    </div>
                  )}

                  {twoFactorSetupStep === "complete" && (
                    <>
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center text-center py-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Successfully Enabled!
                          </h4>
                          <p className="text-sm text-gray-600 mt-2">
                            Your account is now protected with two-factor
                            authentication.
                          </p>
                        </div>

                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-yellow-900 mb-2">
                            Save Your Backup Codes
                          </p>
                          <p className="text-xs text-yellow-800 mb-3">
                            These codes can be used to access your account if
                            you lose your authenticator device. Store them in a
                            safe place.
                          </p>
                          <div className="bg-white border border-yellow-300 rounded p-3 mb-3">
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              {backupCodes.map((code, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-gray-50 rounded text-center"
                                >
                                  {code}
                                </div>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const text = backupCodes.join("\n");
                              navigator.clipboard.writeText(text);
                              success("Backup codes copied to clipboard!");
                            }}
                            className="text-xs text-yellow-800 hover:text-yellow-900 underline"
                          >
                            Copy all codes
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={async () => {
                            // Reload user data to ensure we have the latest 2FA status
                            try {
                              const userResponse = await apiService.getUser();
                              if (userResponse.user) {
                                setTwoFactorEnabled(
                                  userResponse.user.two_factor_enabled || false,
                                );
                              }
                            } catch (err) {
                              console.error("Failed to reload user data:", err);
                            }

                            setShow2FAModal(false);
                            setTwoFactorSetupStep("initial");
                            setVerificationCode("");
                            setBackupCodes([]);
                          }}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          Done
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}

// Service Settings Component
function ServiceSettingsSection() {
  const { success, error: showError } = useToast();
  const [ishCapacity, setIshCapacity] = useState({
    capacity_full: false,
    capacity_message: "",
    alternative_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIshCapacity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIshCapacity = async () => {
    try {
      setLoading(true);
      const data = await apiService.checkIshCapacity();
      setIshCapacity({
        capacity_full: data.capacity_full || false,
        capacity_message: data.message || "",
        alternative_url: data.alternative_url || "",
      });
    } catch (err) {
      showError("Failed to load service settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIshCapacity = async () => {
    try {
      setSaving(true);
      await apiService.updateServiceCapacity({
        service_name: "Ish",
        capacity_full: ishCapacity.capacity_full,
        capacity_message: ishCapacity.capacity_message || null,
        alternative_url: ishCapacity.alternative_url || null,
      });
      success("Counselling & Coaching service capacity updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to update service capacity");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ish Service Capacity */}
      <div className="border border-gray-200 dark:border-[var(--card-border)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">
              Counselling & Coaching Service Capacity
            </h3>
            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
              Toggle capacity status and customize the message shown to clients
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={ishCapacity.capacity_full}
              onChange={(e) =>
                setIshCapacity({
                  ...ishCapacity,
                  capacity_full: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {ishCapacity.capacity_full && (
          <div className="space-y-3 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                Capacity Message
              </label>
              <textarea
                value={ishCapacity.capacity_message || ""}
                onChange={(e) =>
                  setIshCapacity({
                    ...ishCapacity,
                    capacity_message: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="This service is at capacity at this time. If you would like to work with us, you can proceed with our Partner service VQT COACHING & THERAPY."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                Alternative Service URL
              </label>
              <input
                type="url"
                value={ishCapacity.alternative_url || ""}
                onChange={(e) =>
                  setIshCapacity({
                    ...ishCapacity,
                    alternative_url: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://pci.jotform.com/form/243161740962456"
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveIshCapacity}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Booking Settings Component
function BookingSettingsSection() {
  const { success, error: showError } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // We only care about therapy services (not "General Assessment", "Ish", etc.)
  const THERAPY_SERVICES = ["Low Cost", "Mid Range", "Counselling & Coaching"];

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllServices();
      // Filter to only therapy services relevant to booking
      const filtered = (data || []).filter((s) =>
        THERAPY_SERVICES.includes(s.service_name),
      );
      setServices(filtered);
    } catch (err) {
      showError("Failed to load booking settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (service, newValue) => {
    // Optimistic update
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, booking_enabled: newValue } : s,
      ),
    );
    try {
      setSavingId(service.id);
      await apiService.updateServiceCapacity({
        service_name: service.service_name,
        booking_enabled: newValue,
      });
      success(
        `${service.service_name} booking ${newValue ? "opened" : "closed"} successfully!`,
      );
    } catch (err) {
      // Revert on failure
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, booking_enabled: !newValue } : s,
        ),
      );
      showError(err.message || "Failed to update booking gate");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Admin gate:</strong> Clients can <em>only</em> see available
          dates when the toggle for their service is <strong>ON</strong>. All
          services are OFF by default — turn one on only when you are ready for
          clients to book.
        </p>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-4 text-center">
          No therapy services found. Ensure the database is seeded correctly.
        </p>
      ) : (
        services.map((service) => (
          <div
            key={service.id}
            className="border border-gray-200 dark:border-[var(--card-border)] rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                  {service.service_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">
                  {service.booking_enabled
                    ? "✅ Clients can see available dates and book sessions"
                    : "🔒 Booking is closed — clients see no available dates"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {savingId === service.id && (
                  <span className="text-xs text-gray-400 animate-pulse">
                    Saving…
                  </span>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!service.booking_enabled}
                    disabled={savingId === service.id}
                    onChange={(e) => handleToggle(service, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Pricing Settings Component
function PricingSettingsSection() {
  const { success, error: showError } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllServices();
      setServices(data || []);
    } catch (err) {
      showError("Failed to load pricing settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (service) => {
    try {
      setSavingId(service.id);
      await apiService.updateServiceCapacity({
        service_name: service.service_name,
        capacity_full: service.capacity_full,
        consultation_price: service.consultation_price,
        session_price: service.session_price,
        block_price: service.block_price,
      });
      success(`${service.service_name} pricing updated successfully!`);
    } catch (err) {
      showError(err.message || "Failed to update pricing");
    } finally {
      setSavingId(null);
    }
  };

  const handlePriceChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, [field]: parseFloat(value) || 0 } : s,
      ),
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {services.map((service) => (
        <div
          key={service.id}
          className="border border-gray-200 dark:border-[var(--card-border)] rounded-lg p-5 bg-gray-50/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
              {service.service_name}
            </h3>
            <button
              onClick={() => handleUpdatePrice(service)}
              disabled={savingId === service.id}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-xs font-medium"
            >
              <Save className="w-3.5 h-3.5" />
              {savingId === service.id ? "Saving..." : "Save Prices"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Assessment Fee (£)
              </label>
              <input
                type="number"
                step="0.01"
                value={service.consultation_price || ""}
                onChange={(e) =>
                  handlePriceChange(
                    service.id,
                    "consultation_price",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Session Fee (£)
              </label>
              <input
                type="number"
                step="0.01"
                value={service.session_price || 0}
                onChange={(e) =>
                  handlePriceChange(service.id, "session_price", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Block Fee (£)
              </label>
              <input
                type="number"
                step="0.01"
                value={service.block_price || 0}
                onChange={(e) =>
                  handlePriceChange(service.id, "block_price", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg text-sm"
              />
            </div>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            * Block fee typically applies to Low Cost Counselling (4 sessions).
          </p>
        </div>
      ))}
    </div>
  );
}

// Maintenance Settings Component
function MaintenanceSettingsSection() {
  const { success, error: showError } = useToast();
  const [maintenance, setMaintenance] = useState({
    maintenance_mode: false,
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaintenanceStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMaintenanceStatus = async () => {
    try {
      setLoading(true);
      const data = await apiService.checkMaintenance();
      setMaintenance({
        maintenance_mode: data.maintenance_mode || false,
        message: data.message || "",
      });
    } catch (err) {
      showError("Failed to load maintenance status");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaintenance = async () => {
    try {
      setSaving(true);
      await apiService.updateMaintenance({
        maintenance_mode: maintenance.maintenance_mode,
        message: maintenance.message || null,
      });
      success(
        `System ${maintenance.maintenance_mode ? "shutdown" : "restored"} successfully!`,
      );
    } catch (err) {
      showError(err.message || "Failed to update maintenance status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`p-4 rounded-lg border ${maintenance.maintenance_mode ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50" : "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle
              className={`w-10 h-10 ${maintenance.maintenance_mode ? "text-red-500" : "text-gray-400"}`}
            />
            <div>
              <h3
                className={`font-bold ${maintenance.maintenance_mode ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
              >
                {maintenance.maintenance_mode
                  ? "System is SHUT DOWN"
                  : "System is Operational"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {maintenance.maintenance_mode
                  ? "New client registrations and intake forms are currently blocked."
                  : "All registration and entry points are open to the public."}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setMaintenance({
                ...maintenance,
                maintenance_mode: !maintenance.maintenance_mode,
              })
            }
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              maintenance.maintenance_mode
                ? "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {maintenance.maintenance_mode ? (
              <>
                <Power className="w-4 h-4" />
                Restore System
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Global Shutdown
              </>
            )}
          </button>
        </div>

        {maintenance.maintenance_mode && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                Public Maintenance Message
              </label>
              <textarea
                value={maintenance.message || ""}
                onChange={(e) =>
                  setMaintenance({ ...maintenance, message: e.target.value })
                }
                className="w-full px-4 py-3 border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                rows={3}
                placeholder="Enter the message clients will see when registration is closed..."
              />
              <p className="text-[10px] text-red-500 mt-1 italic">
                * This message will be displayed to anyone trying to register or
                submit intake forms.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpdateMaintenance}
            disabled={saving}
            className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md ${
              maintenance.maintenance_mode
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-800 text-white hover:bg-gray-900"
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Processing..." : "Confirm & Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
