"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function JotFormRedirect() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to home
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Form Submitted Successfully!
        </h2>

        <p className="text-gray-600 mb-6">
          Thank you for completing the form. You will be redirected to the
          booking system in {countdown} seconds...
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Next Step:</strong> Please book your consultation slot using
            our booking system.
          </p>
        </div>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors mb-6"
        >
          Return Home
        </button>

        {/* Copyright Information */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <p className="text-xs text-gray-500">
            This form was created using JotForm. JotForm is a third-party
            service not owned or operated by Vanquish Therapies.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} Vanquish Therapies. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
