"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, User, CheckCircle } from "lucide-react";
import apiService from "@/lib/api";

function InternalChooseCounsellor() {
  const searchParams = useSearchParams();
  const clientUuid = searchParams.get("uuid");

  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [choosingUuid, setChoosingUuid] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!clientUuid) {
      setError("This link is missing your client reference. Please use the link from your email.");
      setLoading(false);
      return;
    }

    const fetchCounsellors = async () => {
      try {
        const data = await apiService.getAvailableCounsellors(clientUuid);
        setCounsellors(data.counsellors || []);
      } catch (err) {
        setError(err.message || "Failed to load available practitioners.");
      } finally {
        setLoading(false);
      }
    };

    fetchCounsellors();
  }, [clientUuid]);

  const handleChoose = async (tc) => {
    setChoosingUuid(tc.uuid);
    try {
      await apiService.chooseCounsellor(clientUuid, tc.uuid);
      setSuccess(true);
      toast.success(`You've been matched with ${tc.name}!`);
    } catch (err) {
      toast.error(err.message || "Failed to select this practitioner. Please try again.");
    } finally {
      setChoosingUuid(null);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're All Set!
          </h2>
          <p className="text-gray-600 mb-6">
            Your practitioner choice has been saved! You can now proceed to book your sessions.
          </p>
          <a
            href={`/client-booking?uuid=${uuid}`}
            className="inline-block px-6 py-3 bg-[#6f1d56] text-white font-bold rounded-lg hover:bg-[#581744] transition-colors"
          >
            Go to Booking Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Choose Your Practitioner
          </h1>
          <p className="mt-2 text-gray-600">
            Browse our available practitioners and pick the one who feels right
            for you.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700">
            {error}
          </div>
        ) : counsellors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            No practitioners are available right now. Please check back soon or
            contact support.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {counsellors.map((tc) => (
              <div
                key={tc.uuid}
                className="bg-white rounded-lg shadow-sm p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tc.name}
                    </h3>
                    {tc.session_price && (
                      <p className="text-sm text-gray-500">
                        £{parseFloat(tc.session_price).toFixed(2)} / session
                      </p>
                    )}
                  </div>
                </div>

                {tc.bio && (
                  <p className="text-sm text-gray-600 mb-4">{tc.bio}</p>
                )}

                {tc.topics_with_experience?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tc.topics_with_experience.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleChoose(tc)}
                  disabled={choosingUuid !== null}
                  className="mt-auto px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {choosingUuid === tc.uuid ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "Choose This Practitioner"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChooseCounsellor() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <InternalChooseCounsellor />
    </Suspense>
  );
}
