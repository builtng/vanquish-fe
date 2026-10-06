"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import apiService from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || "";

  const { branding } = useBranding();
  const { theme } = useTheme();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Password reset token is missing from the URL. Please request a new link.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must include at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.resetPassword({
        token,
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccessMessage(
        response.message ||
          "Your password has been reset successfully. You can now log in with your new password.",
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to reset password. The link may have expired or is invalid.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            {branding.platform_logo_url ? (
              <img
                src={
                  theme === "dark" && branding.platform_logo_dark_url
                    ? branding.platform_logo_dark_url
                    : branding.platform_logo_url
                }
                alt={branding.company_name}
                className="max-h-20 object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl text-white font-bold text-2xl flex items-center justify-center bg-[var(--button-primary-bg)]">
                {branding.company_name?.substring(0, 2).toUpperCase() || "VT"}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {branding.company_name || "Vanquish"}
          </h1>
          <p className="text-muted-foreground">Set New Password</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reset Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Please enter your email and a new password with at least 12 characters.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {successMessage ? (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  {successMessage}
                </p>
              </div>
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-lg text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 bg-[var(--button-primary-bg)]"
              >
                Proceed to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!token && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  Warning: No reset token was found in the link. Please ensure you copied the complete link from your email.
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-input bg-background/50 text-foreground rounded-lg focus:ring-2 focus:ring-[var(--button-primary-bg)] focus:border-transparent placeholder:text-muted-foreground"
                  placeholder="name@vqtmanagement.com"
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-input bg-background/50 text-foreground rounded-lg focus:ring-2 focus:ring-[var(--button-primary-bg)] focus:border-transparent placeholder:text-muted-foreground"
                    placeholder="Minimum 12 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 12 characters with uppercase, lowercase, and numeric characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="passwordConfirmation"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="passwordConfirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-input bg-background/50 text-foreground rounded-lg focus:ring-2 focus:ring-[var(--button-primary-bg)] focus:border-transparent placeholder:text-muted-foreground"
                    placeholder="Re-enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !passwordConfirmation}
                className="w-full py-3 px-4 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[var(--button-primary-bg)]"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 text-[var(--button-primary-bg)]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading password reset...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
