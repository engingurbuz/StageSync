"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PendingFormsCheck } from "@/components/dialogs/pending-forms-check";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
        <footer className="shrink-0 border-t border-border px-4 py-2 text-center text-[11px] text-muted-foreground/50">
          Maestro — Koronun Dijital Şefi
        </footer>
      </div>

      {/* Required forms check - blocks UI until completed */}
      <PendingFormsCheck />
    </div>
  );
}
