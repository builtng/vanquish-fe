"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import apiService from "@/lib/api";
import { CheckCircle, XCircle, Loader, HeartHandshake } from "lucide-react";

export default function PlacementResponsePage() {
  const params = useParams();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [inductionDate, setInductionDate] = useState("");
  const [alreadyResponded, setAlreadyResponded] = useState(false);

  const [placementAccepted, setPlacementAccepted] = useState(null);
  const [inductionRsvp, setInductionRsvp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiService.getPlacementResponse(token);
        setFirstName(data.first_name || "");
        setInductionDate(data.induction_date || "");
        if (data.placement_accepted !== null && data.placement_accepted !== undefined) {
          setAlreadyResponded(true);
          setPlacementAccepted(data.placement_accepted);
          setInductionRsvp(data.induction_rsvp);
        }
      } catch (err) {
        setError(err.message || "This link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    if (placementAccepted === null || inductionRsvp === null) return;
    setSubmitting(true);
    try {
      await apiService.submitPlacementResponse(token, {
        placementAccepted,
        inductionRsvp,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ChoiceButton = ({ selected, onClick, label, positive }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
        selected
          ? positive
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-red-400 bg-red-50 text-red-700"
          : "border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {loading && (
          <div className="text-center">
            <Loader className="w-12 h-12 text-[#6f1d56] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Loading...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Invalid</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {!loading && !error && (submitted || alreadyResponded) && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-2">
              We've recorded your response, {firstName}.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4 text-left text-sm text-gray-700 space-y-1">
              <p>
                <strong>Placement:</strong>{" "}
                {placementAccepted ? "Accepted" : "Declined"}
              </p>
              <p>
                <strong>Induction Attendance:</strong>{" "}
                {inductionRsvp ? "Attending" : "Not attending"}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && !submitted && !alreadyResponded && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#fcf6fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="w-8 h-8 text-[#6f1d56]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Confirm Your Placement
              </h2>
              <p className="text-gray-600 text-sm">
                Hi {firstName}, please confirm your response below.
              </p>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-800 mb-2">
                Do you accept your placement offer at Vanquish Therapies?
              </p>
              <div className="flex gap-3">
                <ChoiceButton
                  selected={placementAccepted === true}
                  onClick={() => setPlacementAccepted(true)}
                  label="Yes, I accept"
                  positive
                />
                <ChoiceButton
                  selected={placementAccepted === false}
                  onClick={() => setPlacementAccepted(false)}
                  label="No, I decline"
                  positive={false}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-800 mb-2">
                Will you attend the mandatory online induction
                {inductionDate ? ` (${inductionDate})` : ""}?
              </p>
              <div className="flex gap-3">
                <ChoiceButton
                  selected={inductionRsvp === true}
                  onClick={() => setInductionRsvp(true)}
                  label="Yes, I'll attend"
                  positive
                />
                <ChoiceButton
                  selected={inductionRsvp === false}
                  onClick={() => setInductionRsvp(false)}
                  label="No, I can't"
                  positive={false}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={placementAccepted === null || inductionRsvp === null || submitting}
              className="w-full px-6 py-3 bg-[#6f1d56] text-white rounded-lg hover:bg-[#5a1745] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Submitting..." : "Submit My Response"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
