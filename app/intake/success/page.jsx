"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Mail, Phone } from "lucide-react";
import PublicFormWrapper from "@/components/PublicFormWrapper";

function SuccessContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center border border-purple-100">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-100 animate-bounce-subtle">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Submission Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Thank you for completing your intake form. We have successfully
          received your information and processed your payment.
        </p>

        <div className="space-y-4 mb-10">
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 text-left">
            <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Next Steps
            </h3>
            <ul className="space-y-3 text-sm md:text-base text-purple-800">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  1
                </div>
                <p>
                  Check your email (
                  <strong>{email || "the one provided"}</strong>) for a
                  confirmation message.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  2
                </div>
                <p>
                  Please check your <strong>Spam/Junk folder</strong> if you
                  don't see it in your inbox.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  3
                </div>
                <p>
                  Our team will review your application and match you with the
                  most suitable counsellor.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-left">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Need Assistance?
            </h3>
            <p className="text-sm text-blue-800">
              If you have any questions or haven't received a confirmation email
              within 24 hours, please contact us.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href="mailto:support@vanquishtherapies.co.uk"
                className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <a
                href="tel:+447700900000"
                className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
              >
                <Phone className="w-4 h-4" />
                07700 900000
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Return Home
          </Link>
        </div>

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
