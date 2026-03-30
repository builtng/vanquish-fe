"use client";
import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { SearchableStatusSelect } from "@/components/StatusBadge";

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Enter Information",
  message,
  placeholder = "",
  defaultValue = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info", // 'danger', 'warning', 'info'
  loading = false,
  confirmButtonColor = "#6f1d56",
  inputType = "text", // 'text', 'textarea', 'number', 'email', 'select'
  options = [], // for select type
  required = true,
}) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-100 dark:bg-red-900/30",
          iconColor: "text-red-600 dark:text-red-400",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "warning":
        return {
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      case "info":
        return {
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          iconColor: "text-blue-600 dark:text-blue-400",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      default:
        return {
          iconBg: "bg-gray-100 dark:bg-gray-800",
          iconColor: "text-gray-600 dark:text-gray-400",
          borderColor: "border-gray-200 dark:border-gray-700",
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    if (required && !inputValue?.toString().trim()) return;
    onConfirm(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && inputType !== "textarea" && inputType !== "select") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
            w-full pointer-events-auto animate-scale-in
            ${inputType === "select" ? "max-w-lg" : "max-w-md"}
          `}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {message && <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">{message}</p>}

            {/* Input */}
            {inputType === "textarea" ? (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none outline-none"
                rows={4}
                autoFocus
              />
            ) : inputType === "select" ? (
              <SearchableStatusSelect
                options={options}
                value={inputValue}
                onChange={setInputValue}
                disabled={loading}
              />
            ) : (
              <input
                type={inputType}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                autoFocus
              />
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || (required && !inputValue?.toString().trim())}
                className="px-6 py-2.5 text-white rounded-xl hover:opacity-90 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-md hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: confirmButtonColor }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing…</span>
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
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
        .animate-scale-in { animation: scale-in 0.18s cubic-bezier(.22,.68,0,1.2); }
      `}</style>
    </>
  );
}
