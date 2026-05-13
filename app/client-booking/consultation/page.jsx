"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, Calendar, CheckCircle } from "lucide-react";
import apiService from "@/lib/api";
import CalendarPicker from "@/components/CalendarPicker";

function InternalBookConsultation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientUuid = searchParams.get("uuid");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consultationId, setConsultationId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!clientUuid) {
      toast.error("Client UUID is missing.");
      return;
    }

    const fetchSlots = async () => {
      try {
        const data = await apiService.getAvailableConsultationSlots();
        setSlots(data);
      } catch (error) {
        toast.error("Failed to load available dates.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [clientUuid]);

  const handleBookConsultation = async () => {
    if (!selectedSlot) {
      toast.error("Please select a date and time.");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await apiService.bookConsultation({
        client_uuid: clientUuid,
        consultation_slot_id: selectedSlot.id,
        notify_tc: false,
        notify_trainee: false,
      });

      if (response && response.id) {
        setConsultationId(response.id);
      } else if (response && response.consultation && response.consultation.id) {
        setConsultationId(response.consultation.id);
      }

      setSuccess(true);
      toast.success("Consultation booked successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to book consultation.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your consultation has been successfully booked. You will receive a
              confirmation email shortly.
            </p>
            <div className="space-y-3">
              {consultationId && (
                <button
                  onClick={() => router.push(`/consultation/${consultationId}`)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  View Consultation Details
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f2c4a]"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Book Your Consultation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please select an available date and time.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-[#0f2c4a]" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                No consultation dates available at the moment. Please check back
                later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Dates
              </label>
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

              <div className="pt-6">
                <button
                  onClick={handleBookConsultation}
                  disabled={!selectedSlot || bookingLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0f2c4a] hover:bg-[#0c233e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f2c4a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Book Consultation"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookConsultation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0f2c4a]" />
        </div>
      }
    >
      <InternalBookConsultation />
    </Suspense>
  );
}
