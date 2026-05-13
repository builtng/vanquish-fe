"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  HeartHandshake,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

export default function CounsellorLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { branding } = useBranding();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(
        formData.email,
        formData.password,
        requires2FA ? formData.twoFactorCode : null,
      );

      // Check if 2FA is required
      if (response && response.requiresTwoFactor) {
        setRequires2FA(true);
        setError("");
        setIsLoading(false);
        return;
      }

      // Redirect counsellors to counsellor portal, others to dashboard
      if (response?.user?.role === "counsellor") {
        router.push("/counsellor-portal");
      } else if (
        response?.user?.role === "admin" ||
        response?.user?.role === "staff"
      ) {
        router.push("/dashboard");
      } else {
        setError(
          "This portal is for counsellors only. Please use the admin login.",
        );
        // Clear token since wrong portal
        setIsLoading(false);
        return;
      }
    } catch (err) {
      if (err.response?.data?.errors?.two_factor_code) {
        setError(err.response.data.errors.two_factor_code[0]);
      } else {
        setError(err.message || "Invalid email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Theme Toggle - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Admin Login link - Fixed Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          ← Admin Login
        </Link>
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
              <div
                className="w-16 h-16 rounded-2xl text-white font-bold text-2xl flex items-center justify-center"
                style={{ backgroundColor: "var(--button-primary-bg)" }}
              >
                <HeartHandshake className="w-8 h-8" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {branding.company_name || "Vanquish"}
          </h1>
          <p className="text-muted-foreground">Counsellor Portal Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your counsellor portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="counsellor-email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="counsellor-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-input bg-background/50 text-foreground rounded-lg focus:ring-2 focus:ring-[var(--button-primary-bg)] focus:border-transparent placeholder:text-muted-foreground"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="counsellor-password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="counsellor-password"
                  type={showPassword ? "text" : "password"}
                  required={!requires2FA}
                  disabled={requires2FA}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pl-10 pr-12 py-3 border border-input bg-background/50 text-foreground rounded-lg focus:ring-2 focus:ring-[var(--button-primary-bg)] focus:border-transparent placeholder:text-muted-foreground disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={requires2FA}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication Code Field */}
            {requires2FA && (
              <div>
                <label
                  htmlFor="counsellor-twoFactorCode"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Two-Factor Authentication Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="counsellor-twoFactorCode"
                    type="text"
                    required
                    maxLength={6}
                    value={formData.twoFactorCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setFormData({ ...formData, twoFactorCode: value });
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-input bg-background/50 text-foreground rounded-lg focus:ring-2 focus:ring-[var(--button-primary-bg)] focus:border-transparent placeholder:text-muted-foreground text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="counsellor-remember"
                  type="checkbox"
                  className="h-4 w-4 focus:ring-[var(--button-primary-bg)] border-input rounded"
                  style={{ accentColor: "var(--button-primary-bg)" }}
                />
                <label
                  htmlFor="counsellor-remember"
                  className="ml-2 block text-sm text-foreground"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm font-medium hover:opacity-80"
                style={{ color: "var(--button-primary-bg)" }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="counsellor-login-btn"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--button-primary-bg)" }}
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In to My Portal"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © {new Date().getFullYear()} {branding.company_name || "Vanquish"}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
