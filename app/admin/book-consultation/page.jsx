"use client";

import PageGuard from "@/components/PageGuard";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import SearchableSelect from "@/components/SearchableSelect";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import CalendarPicker from "@/components/CalendarPicker";
import { AlertTriangle, Calendar, RefreshCw, ChevronLeft } from "lucide-react";

function BookConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();

  const [clients, setClients] = useState([]);
  const [trainingCounsellors, setTrainingCounsellors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingType, setBookingType] = useState("slot"); // 'slot' or 'custom'
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [bookForm, setBookForm] = useState({
    clientId: "",
    tcId: "",
    date: "",
    time: "",
    notes: "",
    sendConfirmation: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch clients
        const clientsResponse = await apiService.getClients();
        const clientsData = Array.isArray(clientsResponse)
          ? clientsResponse
          : clientsResponse && clientsResponse.data
            ? clientsResponse.data
            : [];
        setClients(Array.isArray(clientsData) ? clientsData : []);

        // Fetch training counsellors
        const tcsResponse = await apiService.getTrainingCounsellors({
          status: "Active",
        });
        setTrainingCounsellors(Array.isArray(tcsResponse) ? tcsResponse : []);
      } catch (err) {
        console.error("Error fetching form options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      const data = await apiService.getAvailableConsultationSlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching available slots:", err);
      showError("Failed to fetch available slots.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingType === "slot") {
      fetchAvailableSlots();
    }
  }, [bookingType]);

  useEffect(() => {
    const bookClientUuid = searchParams.get("bookClientUuid");
    if (!bookClientUuid || clients.length === 0) return;

    const matchedClient = clients.find(
      (c) => c.uuid === bookClientUuid || String(c.id) === bookClientUuid,
    );
    if (matchedClient) {
      setBookForm((prev) => ({ ...prev, clientId: matchedClient.id }));
    }
  }, [clients, searchParams]);

  const convertTo24Hour = (time12h) => {
    if (!time12h) return "";
    const [time, period] = time12h.split(" ");
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours, 10);
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    return `${String(hour24).padStart(2, "0")}:${minutes}`;
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();

    if (!bookForm.clientId) {
      showError("Please select a client.");
      return;
    }

    try {
      setActionLoading(true);
      let scheduledDateTime;

      if (bookingType === "slot") {
        if (!selectedSlot) {
          showError("Please select an available slot from the calendar.");
          setActionLoading(false);
          return;
        }
        scheduledDateTime = selectedSlot.consultation_datetime;
      } else {
        const time24h = convertTo24Hour(bookForm.time);
        if (!bookForm.date || !time24h) {
          showError("Please select both date and time.");
          setActionLoading(false);
          return;
        }

        const scheduledDateTimeObj = new Date(`${bookForm.date}T${time24h}`);
        const now = new Date();

        if (scheduledDateTimeObj <= now) {
          showError("Please select a date and time in the future");
          setActionLoading(false);
          return;
        }

        scheduledDateTime = scheduledDateTimeObj.toISOString();
      }

      await apiService.createConsultation({
        client_id: bookForm.clientId,
        tc_id: bookForm.tcId || null,
        scheduled_at: scheduledDateTime,
        notes: bookForm.notes,
        send_confirmation: bookForm.sendConfirmation,
        is_fallback: bookingType === "custom",
      });

      success("Consultation booked successfully!");
      router.push("/dashboard/consultations");
    } catch (err) {
      console.error("Error booking consultation:", err);
      showError(
        err.message || "Failed to book consultation. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 dark:bg-[var(--background)]">
        <DashboardHeader title="Book Consultation" />
        
        <div className="p-6 w-full max-w-6xl space-y-4">
          <div className="mb-2">
            <button
              onClick={() => router.push("/dashboard/consultations")}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Consultations
            </button>
          </div>

          <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--card-border)] overflow-hidden">
            <div className="border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Book Consultation for Existing Client
              </h2>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center items-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#6f1d56]" />
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="p-6 space-y-6">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                      Payment Required
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Client must have paid the consultation fee (£13 for Counselling, £25 for Coaching/Counselling) before booking.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                      Select Client <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      value={bookForm.clientId}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, clientId: e.target.value })
                      }
                      options={
                        Array.isArray(clients)
                          ? clients.map((client) => ({
                              value: client.id,
                              label: `${client.name} - ${client.client_id || client.uuid}`,
                            }))
                          : []
                      }
                      placeholder="Select a client..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                      Assign Counsellor (Optional)
                    </label>
                    <SearchableSelect
                      value={bookForm.tcId}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, tcId: e.target.value })
                      }
                      options={
                        Array.isArray(trainingCounsellors)
                          ? trainingCounsellors.map((tc) => ({
                              value: tc.id,
                              label: `${tc.name} - ${tc.tc_id || tc.uuid}`,
                            }))
                          : []
                      }
                      placeholder="Select a counsellor..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                    Booking Method
                  </label>
                  <div className="flex rounded-lg border border-gray-300 dark:border-[var(--card-border)] p-1 bg-gray-50 dark:bg-[var(--hover-bg)] w-fit mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingType("slot");
                        setSelectedSlot(null);
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        bookingType === "slot"
                          ? "bg-[#6f1d56] text-white shadow hover:bg-[#5a1745]"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
                      }`}
                    >
                      Use Available Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingType("custom");
                        setSelectedSlot(null);
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        bookingType === "custom"
                          ? "bg-[#6f1d56] text-white shadow hover:bg-[#5a1745]"
                          : "text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)]"
                      }`}
                    >
                      Custom Date & Time
                    </button>
                  </div>
                </div>

                {bookingType === "slot" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                      Select Available Slot <span className="text-red-500">*</span>
                    </label>
                    {slotsLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <RefreshCw className="h-8 w-8 animate-spin text-[#6f1d56]" />
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-[var(--hover-bg)]">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          No available consultation slots found.
                        </p>
                      </div>
                    ) : (
                      <CalendarPicker
                        availableSlots={slots.map((slot) => {
                          const date = new Date(slot.consultation_datetime);
                          return {
                            ...slot,
                            date: date.toISOString().split("T")[0],
                            formatted_time: date.toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            }),
                            available: !(
                              slot.max_slots && slot.booked_slots >= slot.max_slots
                            ),
                          };
                        })}
                        selectedSlot={selectedSlot}
                        onSelect={(slot) => setSelectedSlot(slot)}
                      />
                    )}
                  </div>
                )}

                {bookingType === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={bookForm.date}
                        min={new Date().toLocaleDateString("en-CA")}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, date: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        value={bookForm.time}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, time: e.target.value })
                        }
                        options={[
                          { value: "09:00 AM", label: "09:00 AM" },
                          { value: "10:00 AM", label: "10:00 AM" },
                          { value: "11:00 AM", label: "11:00 AM" },
                          { value: "02:00 PM", label: "02:00 PM" },
                          { value: "03:00 PM", label: "03:00 PM" },
                        ]}
                        placeholder="Select time..."
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={bookForm.notes}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-[#6f1d56] focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendConfirmation"
                    checked={bookForm.sendConfirmation}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        sendConfirmation: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#6f1d56] text-[#6f1d56] border-gray-300 rounded focus:ring-[#6f1d56]"
                  />
                  <label
                    htmlFor="sendConfirmation"
                    className="text-sm text-gray-700 dark:text-[var(--text-secondary)]"
                  >
                    Send confirmation email to client
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/consultations")}
                    disabled={actionLoading}
                    className="px-6 py-2.5 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-secondary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-[#6f1d56] text-white rounded-lg hover:bg-[#5a1745] font-medium disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Book Consultation"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Page() {
  return (
    <PageGuard menuId="consultations">
      <BookConsultationPage />
    </PageGuard>
  );
}
