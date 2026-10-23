"use client";

import { useState, type ReactNode } from "react";
import { DemoBanner } from "./demo-banner";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { StoreSetupNotice } from "./store-setup-notice";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-page">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner />
        <Header />
        <StoreSetupNotice />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
