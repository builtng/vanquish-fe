"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader } from 'lucide-react';

export default function AcceptInductionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing'); // processing, success, error, expired
  const [message, setMessage] = useState('');
  const [induction, setInduction] = useState(null);

  useEffect(() => {
    if (token) {
      handleAccept();
    }
  }, [token]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      const response = await apiService.acceptInductionInvitation(token);
      setStatus('success');
      setMessage('Induction invitation accepted successfully!');
      setInduction(response.induction);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      if (err.response?.data?.expired) {
        setStatus('expired');
        setMessage('This invitation has expired. Please contact the administrator.');
      } else {
        setStatus('error');
        setMessage(err.response?.data?.message || err.message || 'Failed to accept invitation. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {loading && (
          <div className="text-center">
            <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing...</h2>
            <p className="text-gray-600">Accepting your induction invitation</p>
          </div>
        )}

        {!loading && status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {induction && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Induction Details:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Conducted by:</strong> {induction.training_counsellor?.name || 'N/A'}</p>
                  <p><strong>Date & Time:</strong> {formatDateTime(induction.scheduled_at)}</p>
                  {induction.location && (
                    <p><strong>Location:</strong> {induction.location}</p>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              You will receive a confirmation email shortly. We look forward to seeing you at the induction!
            </p>
          </div>
        )}

        {!loading && status === 'expired' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Please contact the administrator if you still wish to attend this induction.
            </p>
          </div>
        )}

        {!loading && status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

