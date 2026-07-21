"use client";
import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import PublicFormWrapper from "@/components/PublicFormWrapper";

function SuccessContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");
  const slot = searchParams.get("slot");
  const hasTriggeredBooking = useRef(false);

  useEffect(() => {
    if (!uuid || !slot || hasTriggeredBooking.current) return;
    hasTriggeredBooking.current = true;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/client/book-consultation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_uuid: uuid,
          consultation_slot_id: slot,
        }),
      },
    ).catch((err) => {
      console.error("Error confirming consultation booking:", err);
    });
  }, [uuid, slot]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center border border-purple-100">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-100 animate-bounce-subtle">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Thank you for booking your consultation with us.
        </h1>

        <div className="space-y-4 mb-10">
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 text-left">
            <p className="text-sm md:text-base text-purple-800">
              Please remember to check your{" "}
              <strong>Spam/Junk folder</strong> in case the booking
              confirmation email does not appear in your inbox.
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-left">
            <p className="text-sm text-blue-800">
              If you have not received a confirmation email, it is important
              that you contact us at least 48 hours before your consultation
              so we can assist in confirming your booking.
            </p>
          </div>
        </div>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          We look forward to connecting with you.
        </p>

        <p className="mt-12 text-xs text-gray-400">
          © {new Date().getFullYear()} Vanquish Therapies. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function IntakeSuccessPage() {
  return (
    <PublicFormWrapper>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </PublicFormWrapper>
  );
}
