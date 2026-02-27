"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import PageGuard from "@/components/PageGuard";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";

export default function EmailSendersSettings() {
  const { token, user } = useAuth();
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    from_email: "",
    from_name: "",
  });

  const categories = ["client", "counsellor", "general"];

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchSenders();
    }
  }, [token, user]);

  const fetchSenders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email-senders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setSenders(data);
      } else {
        toast.error("Failed to fetch email senders");
      }
    } catch (error) {
      console.error("Error fetching senders:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sender = null) => {
    if (sender) {
      setEditingId(sender.id);
      setFormData({
        category: sender.category,
        from_email: sender.from_email,
        from_name: sender.from_name || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        category: "",
        from_email: "",
        from_name: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/email-senders/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/email-senders`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingId ? "Sender updated" : "Sender created");
        setShowModal(false);
        fetchSenders();
      } else {
        toast.error(data.message || "Validation failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this sender configuration? The system will fall back to default.",
      )
    )
      return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email-senders/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        toast.success("Sender deleted");
        fetchSenders();
      } else {
        toast.error("Failed to delete sender");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (user?.role !== "admin") {
    return <div className="p-6">Access Denied. Super Admin only.</div>;
  }

  return (
    <PageGuard menuId="settings">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader>
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                  Email Sender Configurations
                </h1>
                <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                  Configure "FROM" email addresses dynamically based on email
                  category.
                </p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Add Sender
              </button>
            </div>
          </DashboardHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">
            <div className="max-w-5xl mx-auto space-y-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="p-4 font-semibold text-sm">Category</th>
                        <th className="p-4 font-semibold text-sm">
                          From Email
                        </th>
                        <th className="p-4 font-semibold text-sm">From Name</th>
                        <th className="p-4 font-semibold text-sm w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {senders.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-6 text-center text-gray-500 dark:text-gray-400"
                          >
                            No dynamic senders configured. System is using
                            defaults.
                          </td>
                        </tr>
                      ) : (
                        senders.map((sender) => (
                          <tr
                            key={sender.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                          >
                            <td className="p-4 font-medium capitalize">
                              {sender.category}
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">
                              {sender.from_email}
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">
                              {sender.from_name || "-"}
                            </td>
                            <td className="p-4 flex gap-3">
                              <button
                                onClick={() => handleOpenModal(sender)}
                                className="text-blue-500 hover:text-blue-700 transition font-medium text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(sender.id)}
                                className="text-red-500 hover:text-red-700 transition font-medium text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <h2 className="text-xl font-bold">
                        {editingId ? "Edit" : "Add"} Sender
                      </h2>
                    </div>
                    <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category
                        </label>
                        {editingId ? (
                          <input
                            type="text"
                            value={formData.category}
                            readOnly
                            className="w-full border dark:border-gray-600 rounded-lg p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                          />
                        ) : (
                          <select
                            required
                            value={formData.category}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                category: e.target.value,
                              })
                            }
                            className="w-full border dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Category...</option>
                            {categories.map((c) => (
                              <option
                                key={c}
                                value={c}
                                disabled={senders.some((s) => s.category === c)}
                              >
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          From Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.from_email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              from_email: e.target.value,
                            })
                          }
                          className="w-full border dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g. hello@domain.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          From Name
                        </label>
                        <input
                          type="text"
                          value={formData.from_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              from_name: e.target.value,
                            })
                          }
                          className="w-full border dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g. Vanquish Therapies"
                        />
                      </div>

                      <div className="pt-4 flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-4 py-2 font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving && (
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
