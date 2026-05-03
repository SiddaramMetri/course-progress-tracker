"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function TopNavbar() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => apiFetch<{ count: number }>("/notifications/unread-count"),
    enabled: isAuthenticated,
    refetchInterval: 60000, // poll every 60s instead of 30s
    staleTime: 30000,
  });

  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => apiFetch<Notification[]>("/notifications"),
    enabled: isAuthenticated && open, // only fetch when popup is open
    staleTime: 10000,
  });

  const unreadCount = unreadData?.count ?? 0;

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.all,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.unreadCount,
    });
  };

  const handleMarkRead = async (id: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: "POST" });
    invalidateNotifications();
  };

  const handleMarkAllRead = async () => {
    await apiFetch("/notifications/read-all", { method: "POST" });
    invalidateNotifications();
  };

  const displayNotifications = (notifications ?? []).slice(0, 10);

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-end gap-3 border-b bg-background/95 backdrop-blur px-6">
      {/* Notification Bell */}
      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setOpen(!open)}
          className="relative flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Popup */}
        {open && (
          <div className="absolute right-0 top-10 w-80 rounded-xl border bg-popover shadow-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
            <Separator />
            <div className="max-h-[320px] overflow-y-auto">
              {displayNotifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                displayNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                      n.is_read ? "" : "bg-primary/5"
                    }`}
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        n.is_read ? "bg-transparent" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div
                        className="shrink-0 mt-1 h-5 w-5 flex items-center justify-center rounded text-muted-foreground"
                        title="Click to mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <Separator />
            <div className="px-4 py-2">
              <Link
                href="/notifications"
                className="text-xs text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
        {user?.name?.charAt(0)?.toUpperCase()}
      </div>
    </header>
  );
}
