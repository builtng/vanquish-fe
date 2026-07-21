"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const redirectStatus = searchParams.get("redirect_status");
  const succeeded = redirectStatus === "succeeded";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2 ${
            succeeded
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          {succeeded ? (
            <CheckCircle className="w-9 h-9 text-green-600" />
          ) : (
            <AlertCircle className="w-9 h-9 text-red-600" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {succeeded ? "Payment successful" : "Payment not completed"}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {succeeded
            ? "Thank you — your payment has been received. If you don't see your booking confirmed shortly, please contact support so we can check on it."
            : "Your payment could not be completed. Please return to the page you were on and try again."}
        </p>
        <a
          href="mailto:support@vanquishtherapies.co.uk"
          className="inline-block px-5 py-2.5 rounded-lg text-white font-semibold"
          style={{ backgroundColor: "#6f1d56" }}
        >
          Contact support
        </a>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
