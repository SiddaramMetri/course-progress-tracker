"use client";

import { Calendar, Mail, Phone, Save, User } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth, type Role } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";

export default function AccountPage() {
  const { user, isAdmin } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setMobile(user?.mobile ?? "");
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim() || null }),
      });
      // Refresh auth state
      const me = await apiFetch<{
        id: string;
        email: string;
        name: string;
        mobile: string | null;
        role: "admin" | "learner";
        batch_name: string | null;
        batch_start: string | null;
        batch_end: string | null;
      }>("/auth/me");
      // Re-store in localStorage
      const stored = localStorage.getItem("cpt-auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.user = me;
        localStorage.setItem("cpt-auth", JSON.stringify(parsed));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile information.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </span>
              </Label>
              <Input id="email" value={user?.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Mobile Number
                </span>
              </Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                Profile updated!
              </span>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Account Info */}
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-sm font-semibold">Account Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Role</p>
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className="capitalize"
              >
                {user?.role}
              </Badge>
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Batch</p>
              {user?.batch_name ? (
                <Badge variant="outline">{user.batch_name}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )}
            </div>
          </div>

          {user?.batch_start && user?.batch_end && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Batch Duration
              </p>
              <p className="text-sm font-medium">
                {user.batch_start} to {user.batch_end}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
