"use client";

import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Notification[]>("/notifications");
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: "POST" });
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await apiFetch("/notifications/read-all", { method: "POST" });
    fetchNotifications();
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground">
                {unread > 0
                  ? `${unread} unread notification${unread > 1 ? "s" : ""}`
                  : "You're all caught up!"}
              </p>
            </div>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BellOff className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-lg border p-4 transition-colors ${
                  notif.is_read ? "bg-background" : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      notif.is_read ? "bg-transparent" : "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-medium">{notif.title}</h3>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleMarkRead(notif.id)}
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
