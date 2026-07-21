"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import apiService from "@/lib/api";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");
  const bookingParam = searchParams.get("booking");
  const paymentIntentId = searchParams.get("payment_intent");
  const hasTriggered = useRef(false);
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    if (!uuid || !bookingParam) {
      setStatus("error");
      setMessage(
        "We couldn't find your booking details. Please contact support if your session was not booked.",
      );
      return;
    }

    let bookingData;
    try {
      bookingData = JSON.parse(bookingParam);
    } catch (e) {
      setStatus("error");
      setMessage(
        "We couldn't read your booking details. Please contact support if your session was not booked.",
      );
      return;
    }

    const finalize = async () => {
      try {
        const bookingWithPayment = {
          ...bookingData,
          payment_intent_id: paymentIntentId || undefined,
        };
        if (bookingWithPayment.is_single) {
          const apiData = { ...bookingWithPayment };
          delete apiData.is_single;
          await apiService.bookSession(apiData);
        } else {
          await apiService.bookBlock(bookingWithPayment);
        }
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.message ||
            "Payment succeeded, but we couldn't complete your booking. Please contact support.",
        );
      }
    };

    finalize();
  }, [uuid, bookingParam, paymentIntentId]);

  useEffect(() => {
    if (status === "success" && uuid) {
      const timer = setTimeout(() => {
        window.location.href = `/client-booking?uuid=${encodeURIComponent(uuid)}`;
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, uuid]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-6" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Confirming your booking...
            </h1>
            <p className="text-sm text-gray-600">
              Please wait while we finalize your session.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-100">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment successful — your session is booked!
            </h1>
            <p className="text-sm text-gray-600">
              Redirecting you back to your booking portal...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
              <AlertCircle className="w-9 h-9 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              We hit a snag confirming your booking
            </h1>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            {uuid && (
              <a
                href={`/client-booking?uuid=${encodeURIComponent(uuid)}`}
                className="inline-block px-5 py-2.5 rounded-lg text-white font-semibold"
                style={{ backgroundColor: "#6f1d56" }}
              >
                Return to booking portal
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ClientBookingConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
