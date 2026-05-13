"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ModalProvider } from "@/contexts/ModalContext";
import NewMessageNotifier from "@/components/NewMessageNotifier";
import MessageReadNotifier from "@/components/MessageReadNotifier";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
      <AuthProvider>
        <BrandingProvider>
          <SidebarProvider>
            <ToastProvider>
              <ModalProvider>
                {children}
                <NewMessageNotifier />
                <MessageReadNotifier />
              </ModalProvider>
            </ToastProvider>
          </SidebarProvider>
        </BrandingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
