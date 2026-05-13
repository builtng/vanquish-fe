"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Video, Calendar, Clock, User, CheckCircle, AlertCircle } from "lucide-react";
import apiService from "@/lib/api";
import { formatName } from "@/lib/nameFormatter";
import { toast } from "react-hot-toast";

function ConsultationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [consultation, setConsultation] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch consultation and company settings in parallel
        // Note: The user said /consultation/17, so we assume ID is passed
        // We might need to handle UUID vs ID depending on how the link is generated
        
        const [consultationData, settingsData] = await Promise.all([
          apiService.getConsultation(id),
          apiService.getCompanySettings()
        ]);

        setConsultation(consultationData);
        setCompanySettings(settingsData);
      } catch (err) {
        console.error("Error fetching consultation:", err);
        setError("Could not find your consultation details. It may have been cancelled or moved.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your consultation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Consultation Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const scheduledAt = consultation?.scheduled_at ? new Date(consultation.scheduled_at) : null;
  const zoomLink = consultation?.zoom_link || companySettings?.consultation_zoom_link;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 px-8 py-10 text-white text-center">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-extrabold mb-2">Your Intake Consultation</h1>
            <p className="text-purple-100 opacity-80">Online Video Assessment Session</p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Appointment Details
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {scheduledAt ? scheduledAt.toLocaleDateString("en-GB", { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        }) : "Not Scheduled"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {scheduledAt ? scheduledAt.toLocaleTimeString("en-GB", { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : "N/A"}
                        <span className="ml-2 text-sm font-normal text-gray-400">UK Time</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Client Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatName(consultation?.client?.name || "Client", "client")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Your consultation is confirmed. Please be ready 5 minutes before the scheduled time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zoom Action Section */}
            <div className="bg-gray-50 rounded-3xl p-8 text-center border-2 border-dashed border-gray-200">
              {zoomLink ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Your Meeting</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Click the button below to join your consultation via Zoom. If you don't have Zoom installed, you can join via your browser.
                  </p>
                  <a
                    href={zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-4 bg-[#2D8CFF] text-white rounded-2xl font-bold text-lg hover:bg-[#1a73e8] transition-all shadow-xl hover:shadow-[#2d8cff]/20 transform hover:-translate-y-1"
                  >
                    <Video className="w-6 h-6" />
                    Join Zoom Consultation
                  </a>
                  <p className="text-xs text-gray-400 mt-6">
                    Having trouble? Copy and paste this link: <br />
                    <span className="font-mono break-all">{zoomLink}</span>
                  </p>
                </>
              ) : (
                <div className="py-6">
                  <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Zoom Link Not Ready</h3>
                  <p className="text-gray-600">
                    The meeting link hasn't been set yet. Please check back closer to your appointment time or contact support.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500">
                Need to reschedule? Contact us at <span className="font-semibold text-purple-600">{companySettings?.company_email || "support@vqtmanagement.com"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {companySettings?.company_name || "Vanquish Management"}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    }>
      <ConsultationDetailContent />
    </Suspense>
  );
}
