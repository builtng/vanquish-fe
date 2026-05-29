"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/lib/toast";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import apiService from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  X,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  MessageSquarePlus,
} from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

export default function UsersPage() {
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState({
    count: 0,
    max_users: 3,
    can_add_more: true,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDropNoteModal, setShowDropNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [sendingNote, setSendingNote] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "staff",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if user is admin
  const isAdmin = authUser?.role === "admin" || authUser?.role === "super_admin";

  useEffect(() => {
    // Only load data if user is admin
    if (isAdmin) {
      loadUsers();
      loadUserCount();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      // Handle rate limit errors gracefully
      if (err.message && err.message.includes("Too Many Attempts")) {
        // Silently retry after a delay
        setTimeout(() => {
          loadUsers();
        }, 2000);
        return;
      }
      showError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadUserCount = async () => {
    try {
      const data = await apiService.getUserCount();
      setUserCount(data);
    } catch (err) {
      // Handle rate limit errors gracefully - retry silently
      if (err.message && err.message.includes("Too Many Attempts")) {
        setTimeout(() => {
          loadUserCount();
        }, 2000);
        return;
      }
      console.error("Failed to load user count:", err);
    }
  };

  const handleAddUser = () => {
    if (!userCount.can_add_more) {
      showError(
        `Maximum number of users (${userCount.max_users}) has been reached.`,
      );
      return;
    }
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "staff",
    });
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    if (user.id === authUser?.id) {
      showError("You cannot delete your own account.");
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDropNote = (user) => {
    setSelectedUser(user);
    setNoteContent("");
    setShowDropNoteModal(true);
  };

  const submitNote = async () => {
    if (!noteContent.trim()) {
      showError("Please enter a note.");
      return;
    }

    try {
      setSendingNote(true);
      await apiService.storeStaffNote({
        staff_id: selectedUser.id,
        note: noteContent.trim(),
      });
      success("Note sent successfully!");
      setShowDropNoteModal(false);
      setNoteContent("");
    } catch (err) {
      showError(err.message || "Failed to drop note");
    } finally {
      setSendingNote(false);
    }
  };

  const saveUser = async () => {
    if (!formData.name || !formData.email) {
      showError("Please fill in all required fields");
      return;
    }

    // Trim and validate name
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError("Name cannot be empty");
      return;
    }

    // Validate name format: only letters, spaces, hyphens, apostrophes, and periods
    const namePattern = /^[a-zA-Z\s\-\'\.]+$/;
    if (!namePattern.test(trimmedName)) {
      showError(
        "Name can only contain letters, spaces, hyphens (-), apostrophes ('), and periods (.)",
      );
      return;
    }

    if (
      showAddModal &&
      (!formData.password || !formData.password_confirmation)
    ) {
      showError("Password is required for new users");
      return;
    }

    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    ) {
      showError("Passwords do not match");
      return;
    }

    if (formData.password && formData.password.length < 8) {
      showError("Password must be at least 8 characters long");
      return;
    }

    // For new users, save directly. For edits, show confirmation modal
    if (showAddModal) {
      try {
        setSaving(true);
        const userData = {
          name: trimmedName,
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        };

        await apiService.createUser(userData);
        success("User created successfully!");
        setShowAddModal(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
          role: "staff",
        });
        loadUsers();
        loadUserCount();
      } catch (err) {
        showError(err.message || "Failed to save user");
      } finally {
        setSaving(false);
      }
    } else {
      // Show confirmation modal for edits
      setShowEditConfirmModal(true);
    }
  };

  const confirmSaveUser = async () => {
    if (!selectedUser) return;

    const trimmedName = formData.name.trim();
    try {
      setSaving(true);
      setShowEditConfirmModal(false);
      const userData = {
        name: trimmedName,
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      };

      if (formData.password) {
        userData.password = formData.password;
        userData.password_confirmation = formData.password_confirmation;
      }

      await apiService.updateUser(selectedUser.id, userData);
      success("User updated successfully!");
      setShowEditModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "staff",
      });
      loadUsers();
      loadUserCount();
    } catch (err) {
      showError(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    if (selectedUser.id === authUser?.id) {
      showError("You cannot delete your own account.");
      setShowDeleteModal(false);
      return;
    }

    try {
      setDeleting(true);
      await apiService.deleteUser(selectedUser.id);
      success("User deleted successfully!");
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
      loadUserCount();
    } catch (err) {
      showError(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageGuard menuId="users">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader
            actions={
              <button
                onClick={handleAddUser}
                disabled={!userCount.can_add_more}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            }
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                User Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                Manage system users and access
              </p>
            </div>
          </DashboardHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
            {/* User Count Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Users: {userCount.count} / {userCount.max_users}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {userCount.can_add_more
                      ? `You can add ${userCount.max_users - userCount.count} more user(s)`
                      : "Maximum number of users reached"}
                  </p>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 dark:text-[var(--text-secondary)]">
                  Loading users...
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 dark:text-[var(--text-tertiary)] mx-auto mb-4" />
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">
                  No users found
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--card-border)]">
                  <thead className="bg-gray-50 dark:bg-[var(--hover-bg)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        2FA Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[var(--card-bg)] divide-y divide-gray-200 dark:divide-[var(--card-border)]">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)]"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin" || user.role === "super_admin"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                                : user.role === "consultation_staff"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                : user.role === "compliance_officer"
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : user.role === "super_admin" ? (
                              <>
                                <Shield className="w-3 h-3 mr-1 text-red-500" />
                                Super Admin
                              </>
                            ) : user.role === "consultation_staff" ? (
                              "Consultation Staff"
                            ) : user.role === "compliance_officer" ? (
                              "Compliance Officer"
                            ) : (
                              "Staff"
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                          {user.two_factor_enabled ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Enabled
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-[var(--text-tertiary)]">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDropNote(user)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Drop Note to Staff"
                            >
                              <MessageSquarePlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {user.id !== authUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit User Modal */}
        {(showAddModal || showEditModal) && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {showAddModal ? "Add New User" : "Edit User"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter full name"
                      pattern="[a-zA-Z\s\-\'\.]+"
                      title="Name can only contain letters, spaces, hyphens (-), apostrophes ('), and periods (.)"
                    />
                    <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                      Only letters, spaces, hyphens (-), apostrophes ('), and
                      periods (.) are allowed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                      Role *
                    </label>
                    <SearchableSelect
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      options={[
                        { value: 'super_admin', label: 'Super Admin' },
                        { value: 'admin', label: 'Admin' },
                        { value: 'staff', label: 'Staff' },
                        { value: 'consultation_staff', label: 'Consultation Staff' },
                        { value: 'compliance_officer', label: 'Compliance Officer' },
                      ]}
                      placeholder="Select role"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                      {showAddModal
                        ? "Password *"
                        : "New Password (leave blank to keep current)"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 dark:text-[var(--text-tertiary)]" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 dark:text-[var(--text-tertiary)]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {formData.password && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.password_confirmation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password_confirmation: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 dark:text-[var(--text-tertiary)]" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 dark:text-[var(--text-tertiary)]" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.password &&
                    formData.password_confirmation &&
                    formData.password !== formData.password_confirmation && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-sm text-red-600 dark:text-red-300">
                          Passwords do not match
                        </p>
                      </div>
                    )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors font-medium bg-white dark:bg-[var(--card-bg)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveUser}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name} (${selectedUser?.email})? This action cannot be undone.`}
          itemName={selectedUser?.name}
          confirmText="Delete User"
          cancelText="Cancel"
          loading={deleting}
        />

        {/* Edit Confirmation Modal */}
        <ConfirmationModal
          isOpen={showEditConfirmModal}
          onClose={() => setShowEditConfirmModal(false)}
          onConfirm={confirmSaveUser}
          title="Save Changes"
          message={`Are you sure you want to save changes to ${selectedUser?.name}?`}
          confirmText="Save Changes"
          cancelText="Cancel"
          type="info"
          loading={saving}
          confirmButtonColor="#6f1d56"
        />

        {/* Drop Note Modal */}
        {showDropNoteModal && selectedUser && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowDropNoteModal(false)}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                    <MessageSquarePlus className="w-5 h-5 text-blue-600" />
                    Drop Note for {selectedUser.name}
                  </h2>
                  <button
                    onClick={() => setShowDropNoteModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                      Note Content *
                    </label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your note here. They will receive it as a notification."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowDropNoteModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors font-medium bg-white dark:bg-[var(--card-bg)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitNote}
                      disabled={sendingNote || !noteContent.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      {sendingNote ? "Sending..." : "Send Note"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}
