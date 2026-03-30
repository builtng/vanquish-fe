"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, CheckCircle, Video, User, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

function TraineeInterviewBookingContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");
  
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (uuid) {
      fetchSlots();
    }
  }, [uuid]);

  const fetchSlots = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-interview/slots`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      toast.error("Failed to load interview slots.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/trainee-interview/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, slot_id: selectedSlot.id }),
      });
      
      if (res.ok) {
        setBooked(true);
        toast.success("Interview scheduled successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to book interview.");
      }
    } catch (err) {
      toast.error("A network error occurred.");
    } finally {
      setBooking(false);
    }
  };

  if (!uuid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md text-center">
          <CheckCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Invalid Link</h1>
          <p className="text-gray-500 mt-2">The interview booking link appears to be invalid or expired.</p>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-lg text-center transition-all animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Confirmed!</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Your Placement Interview has been scheduled. You will receive a confirmation email with the Zoom link and details shortly.
          </p>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-gray-800">{new Date(selectedSlot.consultation_datetime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-gray-800">{new Date(selectedSlot.consultation_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Please contact support if you need to reschedule.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Stage 3: Placement Interview</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Congratulations on reaching the final interview stage. Please select a time slot that works for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" /> Interview Details
              </h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Duration:</strong> 45 - 60 minutes</span>
                </li>
                <li className="flex gap-3">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Format:</strong> Zoom Video Call</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>Please have your ID ready for verification.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Slots List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-purple-600 p-6 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Available Time Slots
                </h3>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p>Loading available slots...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No interview slots are currently available. Please check back later or contact recruitment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                          selectedSlot?.id === slot.id 
                            ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-100' 
                            : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-colors ${
                            selectedSlot?.id === slot.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                          }`}>
                            <span>{new Date(slot.consultation_datetime).toLocaleString('en-US', { month: 'short' })}</span>
                            <span className="text-lg leading-none">{new Date(slot.consultation_datetime).getDate()}</span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {new Date(slot.consultation_datetime).toLocaleDateString(undefined, { weekday: 'long' })}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {new Date(slot.consultation_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        {selectedSlot?.id === slot.id && <CheckCircle className="w-6 h-6 text-purple-600" />}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={handleBook}
                    disabled={!selectedSlot || booking}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                      !selectedSlot || booking 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-purple-200'
                    }`}
                  >
                    {booking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Confirm Booking <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4 italic">
                    By confirming, you agree to attend the video interview at the selected time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TraineeInterviewBooking() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading interview booking...</p>
      </div>
    }>
      <TraineeInterviewBookingContent />
    </React.Suspense>
  );
}
