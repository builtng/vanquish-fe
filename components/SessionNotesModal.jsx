"use client";
import React from "react";
import { X, Calendar, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";

export default function SessionNotesModal({
  isOpen,
  onClose,
  session,
}) {
  if (!isOpen || !session) return null;

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'scheduled':
      case 'upcoming':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'dna':
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const statusClasses = {
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'upcoming': 'bg-blue-100 text-blue-800 border-blue-200',
      'dna': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    const defaultClass = 'bg-gray-100 text-gray-800 border-gray-200';
    return statusClasses[statusLower] || defaultClass;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full pointer-events-auto animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Session #{session.sessionNumber || 'N/A'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-4">
              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">{session.date || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">{session.time || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(session.status)}
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium border ${getStatusBadge(session.status)}`}>
                    {session.status || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Training Counsellor */}
              {session.tcName && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Training Counsellor</p>
                  <p className="font-medium text-gray-900">{session.tcName}</p>
                </div>
              )}

              {/* Duration */}
              {session.duration && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{session.duration}</p>
                </div>
              )}

              {/* Notes Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Session Notes</h3>
                <div className="p-4 bg-gray-50 rounded-lg min-h-[100px]">
                  {session.notes ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{session.notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">No notes available for this session.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

