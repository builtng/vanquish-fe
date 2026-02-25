"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Calendar, Clock, Plus, Trash2, Users, Save, X } from "lucide-react";

export default function ConsultationSlotsAdminPage() {
  const { success, error: showError } = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    maxSlots: 1,
  });

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConsultationSlots();
      setSlots(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to fetch consultation slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateTime = new Date(
        `${formData.date}T${formData.time}`,
      ).toISOString();
      await apiService.createConsultationSlot({
        consultation_datetime: dateTime,
        max_slots: parseInt(formData.maxSlots, 10) || null,
      });
      success("Slot created successfully");
      setShowModal(false);
      setFormData({ date: "", time: "", maxSlots: 1 });
      fetchSlots();
    } catch (err) {
      console.error(err);
      showError("Failed to create slot");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;
    try {
      await apiService.deleteConsultationSlot(id);
      success("Slot deleted");
      fetchSlots();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to delete slot");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col flex-1 h-screen bg-gray-50 overflow-hidden">
        <DashboardHeader
          actions={
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:opacity-90 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Slot
            </button>
          }
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consultation Slots
            </h1>
            <p className="text-sm text-gray-500">
              Manage available dates and times for intake consultations
            </p>
          </div>
        </DashboardHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No slots found</h3>
              <p className="text-gray-500">
                Add some initial available slots for clients to book.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden text-gray-900">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b">
                  <tr>
                    <th className="p-4 font-medium text-gray-600 text-sm">
                      Date & Time
                    </th>
                    <th className="p-4 font-medium text-gray-600 text-sm">
                      Status
                    </th>
                    <th className="p-4 font-medium text-gray-600 text-sm">
                      Bookings
                    </th>
                    <th className="p-4 font-medium text-gray-600 text-sm text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {new Date(
                              slot.consultation_datetime,
                            ).toLocaleDateString(undefined, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />{" "}
                            {new Date(
                              slot.consultation_datetime,
                            ).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            slot.status === "available"
                              ? "bg-green-100 text-green-800"
                              : slot.status === "full"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {slot.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="w-4 h-4" /> {slot.booked_slots} /{" "}
                          {slot.max_slots || "∞"}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={slot.booked_slots > 0}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            slot.booked_slots > 0
                              ? "Cannot delete slot with existing bookings"
                              : "Delete slot"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-gray-900">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Add New Slot</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Max Bookings Allowed (Per Slot)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxSlots}
                  onChange={(e) =>
                    setFormData({ ...formData, maxSlots: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-shadow placeholder-gray-400"
                  placeholder="Leave empty for unlimited bookings"
                />
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  Leave empty for unlimited bookings per timeslot.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  <Save className="w-4 h-4" /> Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
