"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import apiService from "@/lib/api";
import { formatTimeSlotDisplay } from "@/lib/timeFormatter";
import { StripePaymentWrapper } from "@/components/StripePayment";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  ChevronRight,
  X,
  Send,
} from "lucide-react";

function ClientBookingContent() {
  const searchParams = useSearchParams();
  const clientUuid = searchParams.get("uuid");
  const emailParam = searchParams.get("email");

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [email, setEmail] = useState(emailParam || "");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState(null); // 'block' or 'single'
  const [selectedDate, setSelectedDate] = useState("");
  const [sessionsCount, setSessionsCount] = useState(4);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (showBookingModal && clientData?.client?.uuid) {
      const fetchSlots = async () => {
        try {
          setLoadingSlots(true);
          const data = await apiService.getAvailableSlots(
            clientData.client.uuid,
          );
          setAvailableSlots(data.slots || []);

          // If it's a block booking and we have a specific date from the server, use it
          if (bookingType === "block" && data.slots && data.slots.length > 0) {
            setSelectedDate(data.slots[0].date);
          }
        } catch (err) {
          console.error("Failed to fetch slots:", err);
          toast.error("Failed to load available slots");
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [showBookingModal, bookingType, clientData]);

  useEffect(() => {
    if (clientUuid) {
      // Try to authenticate with UUID
      handleAuthenticate();
    } else {
      setLoading(false);
    }
  }, [clientUuid]);

  const handleAuthenticate = async (e) => {
    if (e) e.preventDefault();

    const currentEmail = email || emailParam;

    if (!currentEmail && !clientUuid) {
      setError("Invalid or missing access tokens.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiService.authenticateClientBooking(
        currentEmail,
        clientUuid,
      );

      if (data.client) {
        setClientData(data);
        setAuthenticated(true);
      } else {
        setError(
          data.message ||
            "Unable to access booking portal. Please check your link.",
        );
      }
    } catch (err) {
      setError(err.message || "Failed to access portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }

    if (!selectedSlot.available) {
      toast.error("This slot is already booked. Please choose another one.");
      return;
    }

    const dateTime = `${selectedSlot.date} ${selectedSlot.formatted_time}:00`;

    // Determine session type based on service type
    const serviceType = clientData?.client?.service_type;
    const sessionType =
      serviceType === "Counselling & Coaching"
        ? "counselling_coaching"
        : "mid_range";

    const bookingData = {
      client_uuid: clientData.client.uuid,
      scheduled_at: dateTime,
      session_type: sessionType,
      is_single: true,
    };

    setPendingBookingData(bookingData);
    setPaymentAmount(40.0); // Fixed price for mid-range/coaching session
    setBookingType("single"); // Explicitly set for payment context
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handleBookBlock = async () => {
    if (!selectedDate && !selectedSlot) {
      setError("Please select a start date and time slot");
      return;
    }

    if (selectedSlot && !selectedSlot.available) {
      toast.error(
        "The selected slot is already booked. Please choose another one.",
      );
      return;
    }

    // Calculate payment amount based on service type
    let amount = 0;
    if (clientData?.client?.service_type === "Low Cost") {
      // £25 for block of 4 sessions
      amount = 25.0;
    } else {
      // £40 per session for Mid Range, Ish, etc.
      amount = 40.0 * sessionsCount;
    }

    // Store booking data for after payment
    setPendingBookingData({
      client_uuid: clientData.client.uuid,
      start_date: selectedDate || selectedSlot.date,
      time_slot: selectedSlot ? selectedSlot.time : null,
      sessions_count: sessionsCount,
    });

    // Show payment modal
    setPaymentAmount(amount);
    setBookingType("block"); // Explicitly set for payment context
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const confirmBookingAfterPayment = async () => {
    if (!pendingBookingData) return;

    try {
      setLoading(true);
      setError(null);

      let data;
      if (pendingBookingData.is_single) {
        const apiData = { ...pendingBookingData };
        delete apiData.is_single;
        data = await apiService.bookSession(apiData);
        toast.success(data.message || "Session booked successfully!");
      } else {
        data = await apiService.bookBlock(pendingBookingData);
        toast.success(
          data.message ||
            `Successfully booked ${pendingBookingData.sessions_count} sessions!`,
        );
      }

      setShowPaymentModal(false);
      setPendingBookingData(null);

      // Refresh data
      const updatedData = await apiService.getClientBookingStatus(
        clientData.client.uuid,
      );
      setClientData(updatedData);
    } catch (err) {
      setError(err.message || "Failed to book sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? "Access Denied" : "Invalid Access Link"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "Please use the unique link sent to your email to access your booking portal."}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-800">
              Need help? Contact support at{" "}
              <a
                href="mailto:support@vanquishtherapies.co.uk"
                className="underline font-semibold"
              >
                support@vanquishtherapies.co.uk
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const client = clientData?.client;
  const upcomingSessions = clientData?.upcoming_sessions || [];
  const nextSessionNeedingBooking = clientData?.next_session_needing_booking;
  const daysUntilDeadline = client?.days_until_deadline;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Book Your Sessions
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {client?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {client?.name}
                </p>
                <p className="text-xs text-gray-500">{client?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Booking Deadline Alert (Low Cost) */}
        {client?.service_type === "Low Cost" &&
          client?.next_booking_deadline && (
            <div
              className={`mb-6 rounded-lg p-4 border-2 ${
                daysUntilDeadline !== null && daysUntilDeadline <= 2
                  ? "bg-red-50 border-red-300"
                  : daysUntilDeadline !== null && daysUntilDeadline <= 7
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-blue-50 border-blue-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    daysUntilDeadline !== null && daysUntilDeadline <= 2
                      ? "text-red-600"
                      : daysUntilDeadline !== null && daysUntilDeadline <= 7
                        ? "text-yellow-600"
                        : "text-blue-600"
                  }`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Booking Deadline:{" "}
                    {new Date(client.next_booking_deadline).toLocaleDateString(
                      "en-GB",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {daysUntilDeadline !== null && daysUntilDeadline <= 0
                      ? "Your booking deadline has passed. Please book immediately."
                      : daysUntilDeadline !== null && daysUntilDeadline <= 2
                        ? `⚠️ Only ${daysUntilDeadline} day(s) remaining! Book now to secure 4 sessions.`
                        : daysUntilDeadline !== null
                          ? `You have ${daysUntilDeadline} day(s) to book your next block of sessions.`
                          : "Please book your next block of sessions."}
                  </p>
                  <p className="text-xs text-gray-600">
                    {daysUntilDeadline !== null && daysUntilDeadline <= 0
                      ? "If you don't book now, you will automatically receive 3 sessions instead of 4 (same price)."
                      : "If you don't book in time, you will automatically receive 3 sessions instead of 4 (same price)."}
                  </p>
                  {client?.service_type === "Low Cost" && (
                    <button
                      onClick={() => {
                        setBookingType("block");
                        setShowBookingModal(true);
                      }}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Book Next Block
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Service Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service Type</p>
              <p className="font-medium text-gray-900">
                {client?.service_type}
              </p>
            </div>
            {client?.allocated_day && (
              <div>
                <p className="text-sm text-gray-600">Allocated Day & Time</p>
                <p className="font-medium text-gray-900">
                  {client.allocated_day}{" "}
                  {formatTimeSlotDisplay(client.allocated_time)}
                </p>
              </div>
            )}
            {client?.matched_tc && (
              <div>
                <p className="text-sm text-gray-600">Your Counsellor</p>
                <p className="font-medium text-gray-900">
                  {client.matched_tc.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Sessions
            </h2>
            {client?.service_type !== "Low Cost" && (
              <button
                onClick={() => {
                  setBookingType("single");
                  setShowBookingModal(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Session
              </button>
            )}
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">
                          {formatDate(session.scheduled_at)}
                        </h3>
                      </div>
                      {session.is_block_booking && (
                        <p className="text-sm text-gray-600">
                          Session {session.block_number} of{" "}
                          {session.total_sessions_in_block}
                        </p>
                      )}
                      {session.status === "scheduled" && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowBookingModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {bookingType === "block"
                    ? "Book Block of Sessions"
                    : "Book Session"}
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                {bookingType === "block" && (
                  <>
                    {!client?.allocated_day || !client?.allocated_time ? (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Your Weekly Time Slot
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          For {client?.service_type} services, you'll have this
                          same slot each week.
                        </p>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setSelectedDate(slot.date);
                                }}
                                disabled={!slot.available}
                                className={`p-2 border rounded-lg text-sm transition-colors text-left ${
                                  selectedSlot === slot
                                    ? "bg-purple-100 border-purple-500 text-purple-700"
                                    : !slot.available
                                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                      : "hover:bg-gray-50 border-gray-300 text-gray-700"
                                }`}
                              >
                                <div className="font-medium">
                                  {new Date(slot.date).toLocaleDateString(
                                    undefined,
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </div>
                                <div className="text-xs opacity-75">
                                  {formatTimeSlotDisplay(slot.time)}
                                </div>
                                {!slot.available && (
                                  <div className="text-[10px] text-red-500 font-medium font-inter mt-1">
                                    Booked
                                  </div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="col-span-2 text-center py-4 text-gray-500">
                              {loadingSlots ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                  Loading available slots...
                                </>
                              ) : (
                                "No available dates found"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Booking Start Date *
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          disabled={client?.service_type === "Low Cost"}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            client?.service_type === "Low Cost"
                              ? "bg-gray-100 cursor-not-allowed border-gray-200"
                              : "border-gray-300"
                          }`}
                          required
                        />
                        <p className="text-xs text-purple-600 mt-2 font-medium">
                          Consistent weekly slot maintained:{" "}
                          {client?.allocated_day}s at{" "}
                          {formatTimeSlotDisplay(client?.allocated_time)}.
                        </p>
                      </div>
                    )}

                    {client?.service_type === "Low Cost" && (
                      <div
                        className={`mb-4 p-3 rounded-lg border ${
                          daysUntilDeadline !== null && daysUntilDeadline < 0
                            ? "bg-red-50 border-red-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {daysUntilDeadline !== null && daysUntilDeadline < 0
                            ? "Booking Deadline Passed"
                            : "Next Block Details"}
                        </p>
                        <p className="text-xs text-gray-700">
                          {daysUntilDeadline !== null && daysUntilDeadline < 0
                            ? "Your sessions will be automatically reduced to 3 (penalty applied)."
                            : "Your sessions will be scheduled for a block of 4."}
                        </p>
                      </div>
                    )}
                    {client?.service_type !== "Low Cost" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Sessions
                        </label>
                        <select
                          value={sessionsCount}
                          onChange={(e) =>
                            setSessionsCount(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value={4}>4 sessions (Full block)</option>
                          <option value={8}>8 sessions</option>
                          <option value={12}>12 sessions</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {bookingType === "single" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {loadingSlots ? (
                        <div className="col-span-2 text-center py-4 text-gray-500">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          Loading available slots...
                        </div>
                      ) : availableSlots.length > 0 ? (
                        availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSlot(slot)}
                            disabled={!slot.available}
                            className={`p-2 border rounded-lg text-sm transition-colors text-left ${
                              selectedSlot === slot
                                ? "bg-purple-100 border-purple-500 text-purple-700"
                                : !slot.available
                                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                  : "hover:bg-gray-50 border-gray-300 text-gray-700"
                            }`}
                          >
                            <div className="font-medium">
                              {new Date(slot.date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </div>
                            <div className="text-xs opacity-75">
                              {formatTimeSlotDisplay(slot.time)}
                            </div>
                            {!slot.available && (
                              <div className="text-[10px] text-red-500 font-medium font-inter mt-1">
                                Booked
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-4 text-gray-500">
                          No available slots at the moment
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      bookingType === "block"
                        ? handleBookBlock
                        : handleBookSession
                    }
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Book{" "}
                    {bookingType === "block"
                      ? `${sessionsCount} Sessions`
                      : "Session"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowPaymentModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Complete Payment
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 bg-blue-50 border-blue-200 border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Booking Summary
                  </h3>
                  <p className="text-sm text-blue-800">
                    {pendingBookingData?.is_single ? (
                      <>
                        Single Session on{" "}
                        {pendingBookingData?.scheduled_at &&
                          new Date(
                            pendingBookingData.scheduled_at,
                          ).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                        at{" "}
                        {pendingBookingData?.scheduled_at
                          ?.split(" ")[1]
                          .slice(0, 5)}
                      </>
                    ) : (
                      <>
                        {pendingBookingData?.sessions_count} Sessions starting
                        from{" "}
                        {pendingBookingData?.start_date &&
                          new Date(
                            pendingBookingData.start_date,
                          ).toLocaleDateString()}
                      </>
                    )}
                  </p>
                  <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between items-center font-bold text-blue-900">
                    <span>Total to pay:</span>
                    <span>£{paymentAmount.toFixed(2)}</span>
                  </div>
                </div>

                <StripePaymentWrapper
                  clientId={clientData?.client?.id}
                  amount={paymentAmount}
                  paymentType={
                    bookingType === "block" ? "session_block" : "session"
                  }
                  onSuccess={confirmBookingAfterPayment}
                  onError={(err) =>
                    toast.error(err.message || "Payment failed")
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ClientBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ClientBookingContent />
    </Suspense>
  );
}
