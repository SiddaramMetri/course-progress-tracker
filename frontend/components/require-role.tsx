"use client";

import { useAuth, type Role } from "@/hooks/use-auth";

interface RequireRoleProps {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Only renders children if the current user has the required role.
 * Use this to conditionally show admin-only UI elements.
 *
 * @example
 * <AdminOnly>
 *   <Button>Delete Course</Button>
 * </AdminOnly>
 */
export function RequireRole({ role, children, fallback }: RequireRoleProps) {
  const { user } = useAuth();
  if (user?.role !== role) return fallback ?? null;
  return <>{children}</>;
}

/** Shortcut for admin-only content */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RequireRole role="admin" fallback={fallback}>
      {children}
    </RequireRole>
  );
}
