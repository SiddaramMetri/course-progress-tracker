"use client";

import { AppSidebar } from "./app-sidebar";
import { AuthGuard } from "./auth-guard";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </AuthGuard>
  );
}
