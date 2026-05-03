"use client";

import { AppSidebar } from "./app-sidebar";
import { AuthGuard } from "./auth-guard";
import { TopNavbar } from "./top-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 ml-64 flex flex-col">
          <TopNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
