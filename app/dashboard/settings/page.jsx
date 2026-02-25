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

  const handleProfileSave = async () => {
    try {
      setProfileSaving(true);
      await apiService.updateProfile({ name: profile.name }); // Only update name for now
      success('Profile updated successfully');
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await apiService.updatePassword({
        current_password: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
      });
      success('Password updated successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggle2FA = async () => {
    try {
      setTwoFactorLoading(true);
      if (twoFactorEnabled) {
        // Disable 2FA
        await apiService.post('/api/two-factor-authentication');
        success('Two-factor authentication has been disabled.');
        setTwoFactorEnabled(false);
      } else {
        // Start 2FA setup process
        setShow2FAModal(true);
        setTwoFactorSetupStep('initial');
      }
    } catch (err) {
      showError('Failed to update 2FA status.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const start2FASetup = async () => {
    try {
      setTwoFactorLoading(true);
      // Enable 2FA feature first
      await apiService.post('/api/two-factor-authentication');
      
      // Get QR code and secret
      const qrResponse = await apiService.get('/api/two-factor-qr-code');
      const secretResponse = await apiService.get('/api/two-factor-secret-key');
      
      // We assume SVGs are returned or base64
      setTwoFactorQRCode(qrResponse.svg || '');
      setTwoFactorSecret(secretResponse.secretKey || '');
      
      setTwoFactorSetupStep('qr');
    } catch (err) {
      showError('Failed to initialize 2FA setup.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showError('Please enter a valid 6-digit code.');
      return;
    }

    try {
      setTwoFactorLoading(true);
      // Verify the code
      await apiService.post('/api/confirmed-two-factor-authentication', {
        code: verificationCode
      });
      
      // Fetch recovery codes
      const codesResponse = await apiService.get('/api/two-factor-recovery-codes');
      setBackupCodes(codesResponse.map(code => code)); // Adjust mapping based on actual response
      
      setTwoFactorEnabled(true);
      setTwoFactorSetupStep('complete');
      success('Two-factor authentication successfully enabled!');
    } catch (err) {
      showError('Invalid verification code. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-[var(--text-secondary)] rounded-lg cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">Contact support to change your email address.</p>
                </div>
                {/* Save Profile Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving || profileLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Notification Preferences</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Email Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">Receive alerts for new matches and messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Push Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">Receive in-browser alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Security Settings</h2>
              </div>
              <div className="space-y-6">
                {/* Change Password */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Password</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">Change your account password</p>
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
                    <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={toggle2FA}
                    disabled={twoFactorLoading}
                    className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                      twoFactorEnabled 
                        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400' 
                        : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-900/20 dark:text-purple-400'
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
            {authUser && authUser.role === 'admin' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Consultation Available Dates</h2>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">Manage dates when clients can book intake consultations</p>
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Service Settings</h2>
                  </div>
                  <ServiceSettingsSection />
                </div>
                
                <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Booking System Settings</h2>
                  </div>
                  <BookingSettingsSection />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => !passwordLoading && setShowPasswordModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Change Password</h3>
                  <button 
                    onClick={() => !passwordLoading && setShowPasswordModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                      {passwordLoading ? 'Updating...' : 'Update Password'}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => !twoFactorLoading && setShow2FAModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {twoFactorSetupStep === 'initial' && 'Enable 2FA'}
                    {twoFactorSetupStep === 'qr' && 'Scan QR Code'}
                    {twoFactorSetupStep === 'complete' && '2FA Enabled'}
                  </h3>
                  <button 
                    onClick={() => !twoFactorLoading && setShow2FAModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {twoFactorSetupStep === 'initial' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      You will need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to complete this setup.
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
                        {twoFactorLoading ? 'Loading...' : 'Continue'}
                      </button>
                    </div>
                  </div>
                )}

                {twoFactorSetupStep === 'qr' && (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      1. Scan this QR code with your authenticator app.
                    </p>
                    
                    <div className="flex justify-center p-4 bg-white border rounded-lg">
                      {twoFactorQRCode ? (
                        <div dangerouslySetInnerHTML={{ __html: twoFactorQRCode }} className="w-48 h-48" />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">Loading QR Code...</div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mb-2">
                        Or enter this secret key manually:
                      </p>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <code className="text-xs font-mono break-all">{twoFactorSecret}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(twoFactorSecret);
                            success('Secret key copied to clipboard!');
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
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full px-4 py-2 text-center tracking-[0.5em] text-lg font-mono border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={verify2FA}
                        disabled={twoFactorLoading || verificationCode.length !== 6}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium block w-full"
                      >
                        {twoFactorLoading ? 'Verifying...' : 'Verify and Enable'}
                      </button>
                    </div>
                  </div>
                )}

                {twoFactorSetupStep === 'complete' && (
                  <>
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Successfully Enabled!</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Your account is now protected with two-factor authentication.
                        </p>
                      </div>

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
