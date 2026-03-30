"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "@/lib/api";

const BrandingContext = createContext();

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    company_name: "Vanquish",
    company_tagline: "Admin",
    platform_logo_url: "",
    platform_logo_base64: "",
    platform_logo_dark_url: "",
    platform_logo_dark_base64: "",
    pdf_header_text: "",
    pdf_footer_text: "",
  });
  const [loading, setLoading] = useState(true);

  const refreshBranding = async () => {
    try {
      const data = await apiService.getCompanySettings();
      if (data) {
        setBranding(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to fetch branding:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
