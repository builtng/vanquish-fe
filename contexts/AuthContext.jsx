"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import apiService from "@/lib/api";
import { resetEcho } from "@/lib/echo";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for stored authentication on mount
    const token = apiService.getToken();
    if (token) {
      // Verify token by fetching user
      apiService
        .getUser()
        .then((response) => {
          setUser(response.user);
        })
        .catch(() => {
          apiService.clearToken();
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Protect dashboard and counsellor-portal routes
    if (!isLoading) {
      const isDashboardRoute = pathname?.startsWith("/dashboard");
      const isLoginRoute = pathname === "/login";
      const isCounsellorPortalRoute =
        pathname?.startsWith("/counsellor-portal");
      const isCounsellorLoginRoute = pathname === "/counsellor-login";

      // Admin dashboard protection
      if (isDashboardRoute) {
        if (!user) {
          router.push("/login");
        } else if (user.role === "counsellor") {
          router.push("/counsellor-portal");
        }
      } else if (isLoginRoute && user) {
        if (user.role === "counsellor") {
          router.push("/counsellor-portal");
        } else {
          router.push("/dashboard");
        }
      }

      // Counsellor portal protection
      if (isCounsellorPortalRoute) {
        if (!user) {
          router.push("/counsellor-login");
        } else if (user.role !== "counsellor") {
          router.push("/dashboard");
        }
      } else if (isCounsellorLoginRoute && user) {
        if (user.role === "counsellor") {
          router.push("/counsellor-portal");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email, password, twoFactorCode = null) => {
    try {
      const response = await apiService.login(email, password, twoFactorCode);

      // Check if 2FA is required
      if (response.requires_two_factor) {
        return { requiresTwoFactor: true, message: response.message };
      }

      resetEcho();
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    const role = user?.role;
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      resetEcho();
      setUser(null);
      if (role === "counsellor") {
        router.push("/counsellor-login");
      } else {
        router.push("/login");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
