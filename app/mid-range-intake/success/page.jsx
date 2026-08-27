"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import { useBranding } from "@/contexts/BrandingContext";
import apiService from "@/lib/api";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { branding } = useBranding();

  return (
    <PublicFormWrapper>
      <div
        className="min-h-screen flex items-center justify-center p-4 py-12"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 border-2 border-green-200">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {branding?.platform_logo_url && (
            <div className="flex justify-center mb-4">
              <img
                src={apiService.getStorageUrl(branding.platform_logo_url)}
                alt={branding.company_name}
                className="max-h-12 object-contain"
              />
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            THANK YOU FOR BOOKING YOUR CONSULTATION WITH US.
          </h1>

          <div className="text-gray-600 space-y-3 mb-6">
            <p className="font-medium">
              PLEASE REMEMBER TO CHECK YOUR SPAM/JUNK FOLDER IN CASE THE
              BOOKING CONFIRMATION EMAIL DOES NOT APPEAR IN YOUR INBOX.
            </p>
            <p className="font-semibold text-gray-800">
              IF YOU HAVE NOT RECEIVED A CONFIRMATION EMAIL, IT IS IMPORTANT
              THAT YOU CONTACT US AT LEAST 48 HOURS BEFORE YOUR CONSULTATION
              SO WE CAN ASSIST IN CONFIRMING YOUR BOOKING.
            </p>
            <p>We look forward to connecting with you.</p>
          </div>

          <div className="rounded-xl p-4 border bg-purple-50 border-purple-100 text-sm text-purple-800">
            <p className="font-medium">
              A confirmation email has been sent to you with your consultation
              details.
            </p>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            <p>
              Please note — this is not a crisis or emergency service. If you
              need to speak to someone immediately, please contact your GP, NHS
              (111), or the Samaritans (116 123).
            </p>
          </div>
        </div>
      </div>
    </PublicFormWrapper>
  );
}

export default function MidRangeIntakeSuccess() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
