"use client";

/**
 * PublicFormWrapper - Ensures public forms respect the theme system
 * Adds theme-aware CSS classes to override hardcoded Tailwind colors
 */
export default function PublicFormWrapper({ children }) {
  return (
    <div className="public-form-theme-wrapper">
      <style jsx global>{`
        .public-form-theme-wrapper {
          /* Override hardcoded gray backgrounds */
          --tw-bg-opacity: 1;
        }
        
        .public-form-theme-wrapper .bg-gray-50 {
          background-color: var(--bg-secondary) !important;
        }
        
        .public-form-theme-wrapper .bg-gray-100 {
          background-color: var(--hover-bg) !important;
        }
        
        .public-form-theme-wrapper .bg-gray-200 {
          background-color: var(--border-color) !important;
        }
        
        .public-form-theme-wrapper .bg-gray-300 {
          background-color: var(--input-border) !important;
        }
        
        /* Override hardcoded gray text colors */
        .public-form-theme-wrapper .text-gray-900 {
          color: var(--text-primary) !important;
        }
        
        .public-form-theme-wrapper .text-gray-800 {
          color: var(--text-primary) !important;
        }
        
        .public-form-theme-wrapper .text-gray-700 {
          color: var(--text-primary) !important;
        }
        
        .public-form-theme-wrapper .text-gray-600 {
          color: var(--text-secondary) !important;
        }
        
        .public-form-theme-wrapper .text-gray-500 {
          color: var(--text-tertiary) !important;
        }
        
        .public-form-theme-wrapper .text-gray-400 {
          color: var(--text-tertiary) !important;
        }
        
        /* Override hardcoded gray borders */
        .public-form-theme-wrapper .border-gray-300 {
          border-color: var(--input-border) !important;
        }
        
        .public-form-theme-wrapper .border-gray-200 {
          border-color: var(--border-color) !important;
        }
        
        .public-form-theme-wrapper .border-gray-100 {
          border-color: var(--border-color) !important;
        }
        
        /* Card backgrounds */
        .public-form-theme-wrapper .card {
          background-color: var(--card-bg);
          border-color: var(--card-border);
        }
        
        /* Ensure white backgrounds use card-bg in dark mode */
        .public-form-theme-wrapper .bg-white {
          background-color: var(--card-bg) !important;
        }
      `}</style>
      {children}
    </div>
  );
}
