"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for stored authentication on mount
    const storedUser = localStorage.getItem("vanquish_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("vanquish_user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Protect dashboard routes
    if (!isLoading) {
      const isDashboardRoute = pathname?.startsWith("/dashboard");
      const isLoginRoute = pathname === "/login";

      if (isDashboardRoute && !user) {
        router.push("/login");
      } else if (isLoginRoute && user) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("vanquish_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vanquish_user");
    router.push("/login");
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

