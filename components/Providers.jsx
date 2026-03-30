"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ModalProvider } from "@/contexts/ModalContext";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
      <AuthProvider>
        <BrandingProvider>
          <SidebarProvider>
            <ToastProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </ToastProvider>
          </SidebarProvider>
        </BrandingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
