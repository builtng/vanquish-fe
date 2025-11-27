"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import apiService from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
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
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
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

            {/* Security Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
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
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
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

