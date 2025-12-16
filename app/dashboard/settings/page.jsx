"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import apiService from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
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
  ToggleLeft,
  ToggleRight,
  Calendar,
} from 'lucide-react';

export default function SettingsPage() {
  const pathname = usePathname();
  const { logout, user: authUser } = useAuth();
  const { success, error: showError } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSetupStep, setTwoFactorSetupStep] = useState('initial'); // 'initial', 'qr', 'verify', 'complete'
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQRCode, setTwoFactorQRCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await apiService.getUser();
        if (response.user) {
          setProfile({
            name: response.user.name || '',
            email: response.user.email || '',
            phone: '', // Phone not available in User model
          });
          setTwoFactorEnabled(response.user.two_factor_enabled || false);
        }
      } catch (err) {
        showError('Failed to load profile data');
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
          console.error('Failed to refresh 2FA status:', err);
        }
      };
      refresh2FAStatus();
    }
  }, [show2FAModal]);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">Manage your account settings and preferences</p>
          </div>
        </DashboardHeader>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Profile Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!profile.name || !profile.email) {
                      showError('Please fill in all required fields');
                      return;
                    }

                    try {
                      setProfileSaving(true);
                      await apiService.updateProfile({
                        name: profile.name,
                        email: profile.email,
                      });
                      success('Profile updated successfully!');
                    } catch (err) {
                      showError(err.message || 'Failed to update profile. Please try again.');
                    } finally {
                      setProfileSaving(false);
                    }
                  }}
                  disabled={profileLoading || profileSaving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                    <p className="text-xs text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div> */}

            {/* Service & Booking Settings - Admin Only */}
            {authUser && authUser.role === 'admin' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Service Capacity Settings</h2>
                  </div>
                  <ServiceSettingsSection />
                </div>

                <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Booking System Settings</h2>
                  </div>
                  <BookingSettingsSection />
                </div>
              </div>
            )}

            {/* Security Settings */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Change Password</p>
                      <p className="text-xs text-gray-500">Update your account password</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                <button 
                  onClick={() => setShow2FAModal(true)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">
                        {twoFactorEnabled ? 'Manage 2FA settings' : 'Add an extra layer of security'}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowPasswordModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswords({ current: false, new: false, confirm: false });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
                        showError('Please fill in all fields');
                        return;
                      }
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        showError('Passwords do not match');
                        return;
                      }
                      if (passwordForm.newPassword.length < 8) {
                        showError('Password must be at least 8 characters long');
                        return;
                      }

                      try {
                        setPasswordLoading(true);
                        await apiService.changePassword({
                          current_password: passwordForm.currentPassword,
                          new_password: passwordForm.newPassword,
                          new_password_confirmation: passwordForm.confirmPassword,
                        });
                        
                        success('Password changed successfully!');
                        setShowPasswordModal(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setShowPasswords({ current: false, new: false, confirm: false });
                      } catch (err) {
                        showError(err.message || 'Failed to change password. Please try again.');
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Two-Factor Authentication Modal */}
      {show2FAModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={async () => {
            // Refresh user data before closing to ensure we have latest 2FA status
            try {
              const userResponse = await apiService.getUser();
              if (userResponse.user) {
                setTwoFactorEnabled(userResponse.user.two_factor_enabled || false);
              }
            } catch (err) {
              console.error('Failed to reload user data:', err);
            }
            setShow2FAModal(false);
            setTwoFactorSetupStep('initial');
            setVerificationCode('');
            setBackupCodes([]);
          }}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between sticky top-0 bg-white dark:bg-[var(--card-bg)]">
                <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
                <button onClick={async () => {
                  // Refresh user data before closing to ensure we have latest 2FA status
                  try {
                    const userResponse = await apiService.getUser();
                    if (userResponse.user) {
                      setTwoFactorEnabled(userResponse.user.two_factor_enabled || false);
                    }
                  } catch (err) {
                    console.error('Failed to reload user data:', err);
                  }
                  setShow2FAModal(false);
                  setTwoFactorSetupStep('initial');
                  setVerificationCode('');
                  setBackupCodes([]);
                }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Initial State - Show Status */}
                {twoFactorSetupStep === 'initial' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">
                          {twoFactorEnabled 
                            ? '2FA is currently enabled for your account' 
                            : 'Add an extra layer of security to your account'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={twoFactorEnabled}
                          onChange={async (e) => {
                            if (e.target.checked) {
                              // Start setup process
                              try {
                                setTwoFactorLoading(true);
                                const response = await apiService.initiate2FASetup();
                                setTwoFactorSecret(response.secret);
                                // Convert TOTP URL to QR code image URL
                                const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.qr_code_url)}`;
                                setTwoFactorQRCode(qrCodeImageUrl);
                                
                                setTwoFactorSetupStep('qr');
                              } catch (err) {
                                showError(err.message || 'Failed to initiate 2FA setup. Please try again.');
                                // Reset toggle if setup failed
                                setTwoFactorEnabled(false);
                              } finally {
                                setTwoFactorLoading(false);
                              }
                            } else {
                              // Disable 2FA
                              try {
                                setTwoFactorLoading(true);
                                await apiService.disable2FA();
                                
                                // Reload user data to get updated 2FA status
                                const userResponse = await apiService.getUser();
                                if (userResponse.user) {
                                  setTwoFactorEnabled(userResponse.user.two_factor_enabled || false);
                                }
                                
                                success('Two-factor authentication disabled');
                              } catch (err) {
                                showError(err.message || 'Failed to disable 2FA. Please try again.');
                                // Reset toggle if disable failed
                                setTwoFactorEnabled(true);
                              } finally {
                                setTwoFactorLoading(false);
                              }
                            }
                          }}
                          disabled={twoFactorLoading}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>

                    {twoFactorEnabled && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>2FA is active.</strong> You'll need to enter a verification code from your authenticator app when logging in.
                        </p>
                      </div>
                    )}

                    {!twoFactorEnabled && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-3">
                          To enable two-factor authentication, you'll need to:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                          <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                          <li>Scan the QR code that will be displayed</li>
                          <li>Enter the verification code to complete setup</li>
                        </ol>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setShow2FAModal(false);
                          setTwoFactorSetupStep('initial');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Close
                      </button>
                      {twoFactorEnabled && (
                        <button
                          onClick={async () => {
                            try {
                              setTwoFactorLoading(true);
                              const response = await apiService.regenerate2FACode();
                              setTwoFactorSecret(response.secret);
                              // Convert TOTP URL to QR code image URL
                              const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.qr_code_url)}`;
                              setTwoFactorQRCode(qrCodeImageUrl);
                              
                              setTwoFactorSetupStep('qr');
                              success('2FA setup code regenerated. Please scan the new QR code.');
                            } catch (err) {
                              showError(err.message || 'Failed to regenerate 2FA code. Please try again.');
                            } finally {
                              setTwoFactorLoading(false);
                            }
                          }}
                          disabled={twoFactorLoading}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {twoFactorLoading ? 'Regenerating...' : 'Regenerate QR Code'}
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* QR Code Display Step */}
                {twoFactorSetupStep === 'qr' && (
                  <>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Scan this QR code with your authenticator app to set up two-factor authentication.
                      </p>
                      
                      {/* QR Code */}
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 border-2 border-gray-200 rounded-lg">
                          {twoFactorQRCode ? (
                            <img 
                              src={twoFactorQRCode} 
                              alt="2FA QR Code" 
                              className="w-48 h-48"
                            />
                          ) : (
                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                              <p className="text-gray-400">Loading QR code...</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Secret Key */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Or enter this code manually:</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <code className="text-sm font-mono text-gray-900 break-all">{twoFactorSecret}</code>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Important:</strong> Save your backup codes in a safe place. You'll need them if you lose access to your authenticator app.
                        </p>
                      </div>

                      {/* Verification Code Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter verification code from your app
                        </label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setTwoFactorSetupStep('initial');
                          setVerificationCode('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={async () => {
                          if (!verificationCode || verificationCode.length !== 6) {
                            showError('Please enter a 6-digit verification code');
                            return;
                          }

                          try {
                            setTwoFactorLoading(true);
                            const response = await apiService.verify2FASetup(verificationCode);
                            setBackupCodes(response.recovery_codes || []);
                            
                            // Reload user data to get updated 2FA status
                            const userResponse = await apiService.getUser();
                            if (userResponse.user) {
                              setTwoFactorEnabled(userResponse.user.two_factor_enabled || false);
                            }
                            
                            setTwoFactorSetupStep('complete');
                            success('Two-factor authentication enabled successfully!');
                          } catch (err) {
                            showError(err.message || 'Invalid verification code. Please try again.');
                          } finally {
                            setTwoFactorLoading(false);
                          }
                        }}
                        disabled={twoFactorLoading || verificationCode.length !== 6}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                    </div>
                  </>
                )}

                {/* Complete Step - Show Backup Codes */}
                {twoFactorSetupStep === 'complete' && (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2FA Enabled Successfully!</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Two-factor authentication is now active on your account.
                      </p>

                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-yellow-900 mb-2">Save Your Backup Codes</p>
                        <p className="text-xs text-yellow-800 mb-3">
                          These codes can be used to access your account if you lose your authenticator device. Store them in a safe place.
                        </p>
                        <div className="bg-white border border-yellow-300 rounded p-3 mb-3">
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            {backupCodes.map((code, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded text-center">
                                {code}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const text = backupCodes.join('\n');
                            navigator.clipboard.writeText(text);
                            success('Backup codes copied to clipboard!');
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
                              setTwoFactorEnabled(userResponse.user.two_factor_enabled || false);
                            }
                          } catch (err) {
                            console.error('Failed to reload user data:', err);
                          }
                          
                          setShow2FAModal(false);
                          setTwoFactorSetupStep('initial');
                          setVerificationCode('');
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
  );
}

// Service Settings Component
function ServiceSettingsSection() {
  const { success, error: showError } = useToast();
  const [ishCapacity, setIshCapacity] = useState({
    capacity_full: false,
    capacity_message: '',
    alternative_url: '',
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
        capacity_message: data.message || '',
        alternative_url: data.alternative_url || '',
      });
    } catch (err) {
      showError('Failed to load service settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIshCapacity = async () => {
    try {
      setSaving(true);
      await apiService.updateServiceCapacity({
        service_name: 'Ish',
        capacity_full: ishCapacity.capacity_full,
        capacity_message: ishCapacity.capacity_message || null,
        alternative_url: ishCapacity.alternative_url || null,
      });
      success('Ish service capacity updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update service capacity');
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
            <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">Ish's Service Capacity</h3>
            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
              Toggle capacity status and customize the message shown to clients
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={ishCapacity.capacity_full}
              onChange={(e) => setIshCapacity({ ...ishCapacity, capacity_full: e.target.checked })}
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
                value={ishCapacity.capacity_message}
                onChange={(e) => setIshCapacity({ ...ishCapacity, capacity_message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="This service is at capacity at this time. If you would like to work with Ish, you can proceed with our Partner service VQT COACHING & THERAPY."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                Alternative Service URL
              </label>
              <input
                type="url"
                value={ishCapacity.alternative_url}
                onChange={(e) => setIshCapacity({ ...ishCapacity, alternative_url: e.target.value })}
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Booking Settings Component
function BookingSettingsSection() {
  const { success, error: showError } = useToast();
  const [bookingUrl, setBookingUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const services = await apiService.getAllServices();
      const bookingService = services.find(s => s.service_name === 'TrafftBooking');
      if (bookingService) {
        setBookingUrl(bookingService.alternative_url || '');
      }
    } catch (err) {
      console.error('Failed to load booking settings:', err);
      // Don't show error to user as it might just be empty initially
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateServiceCapacity({
        service_name: 'TrafftBooking',
        capacity_full: false, // Default
        alternative_url: bookingUrl,
      });
      success('Booking settings updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update booking settings');
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
      <div className="border border-gray-200 dark:border-[var(--card-border)] rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
            Global Booking System URL
          </label>
          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-2">
            This URL will be used for general client bookings (e.g., Trafft booking page).
          </p>
          <input
            type="url"
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://vanquishtherapiesvqt.trafft.com/booking?service=4"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
