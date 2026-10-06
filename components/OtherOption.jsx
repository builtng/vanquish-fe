import React from "react";

/**
 * Reusable OtherOption component for forms where ticking an "Other" option
 * conditionally reveals a required text/textarea field.
 *
 * @param {boolean} isTicked - Whether the "Other" option is currently selected/ticked
 * @param {string} label - The exact label to display for the follow-up field
 * @param {string} value - Current input/textarea value
 * @param {function} onChange - Change handler function
 * @param {string} [error] - Validation error message to display
 * @param {string} [placeholder] - Optional placeholder text
 * @param {string} [id] - Element ID
 * @param {string} [name] - Element name
 * @param {string} [type="textarea"] - "textarea" or "text"
 * @param {number} [rows=3] - Rows count if type is textarea
 * @param {string} [className=""] - Optional wrapper styling
 */
export default function OtherOption({
  isTicked,
  label,
  value = "",
  onChange,
  error,
  placeholder,
  id,
  name,
  type = "textarea",
  rows = 3,
  className = "",
}) {
  if (!isTicked) return null;

  const inputId = id || name;

  return (
    <div className={`mt-3 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-[#6f1d56] mb-1.5"
      >
        {label} <span className="text-red-500">*</span>
      </label>
      {type === "textarea" ? (
        <textarea
          id={inputId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
            error ? "border-red-500 bg-red-50/20" : "border-gray-300"
          }`}
          placeholder={placeholder || "Please specify details..."}
        />
      ) : (
        <input
          type="text"
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#6f1d56] outline-none transition-all ${
            error ? "border-red-500 bg-red-50/20" : "border-gray-300"
          }`}
          placeholder={placeholder || "Please specify details..."}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
