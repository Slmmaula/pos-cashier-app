"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { ToastViewport } from "@/components/ui/toast";
import { AuthInit } from "@/components/auth-init";
import { PrintHost } from "@/components/print-host";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <AuthInit />
        {children}
        <ToastViewport />
        <PrintHost />
      </MotionConfig>
    </ThemeProvider>
  );
}
