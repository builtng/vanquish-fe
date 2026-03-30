"use client";
import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message,
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}) {
  const [deleteText, setDeleteText] = useState("");
  const requiredText = "DELETE";

  useEffect(() => {
    if (isOpen) {
      setDeleteText("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canConfirm = deleteText === requiredText && !loading;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && canConfirm) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in">
          {/* Header */}
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{title}</h2>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 dark:text-[var(--text-primary)] mb-4">
              {message || `Are you sure you want to delete ${itemName ? `"${itemName}"` : "this item"}? This action cannot be undone.`}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                Type <span className="font-bold text-red-600 dark:text-red-400">{requiredText}</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={requiredText}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--input-border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)]"
                autoFocus
              />
              {deleteText && deleteText !== requiredText && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Text does not match. Please type "{requiredText}" exactly.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
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

