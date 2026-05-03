"use client";

import { GraduationCap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLoginPage() {
  const { login, user, isAdmin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in as admin
  if (user && isAdmin) {
    router.push("/dashboard");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  // Logged in but not admin
  if (user && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Admin Access Only</h1>
          <p className="text-sm text-muted-foreground mb-4">
            You are logged in as a learner. Admin access is required.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Check if the logged-in user is admin by re-reading from storage
      const stored = localStorage.getItem("cpt-auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user?.role !== "admin") {
          localStorage.removeItem("cpt-auth");
          setError("This account is not an administrator.");
          toast.error("Admin access required");
          setLoading(false);
          return;
        }
      }
      toast.success("Welcome, Admin!");
      router.push("/dashboard");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Login failed";
      const errorMsg = raw.includes("blocked")
        ? "Account is blocked."
        : "Invalid credentials";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">
              Admin Login
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Access the administration panel.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? "Signing in..." : "Admin Sign In"}
            </Button>
          </form>

          <div className="relative my-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              demo account
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setEmail("admin@demo.com");
              setPassword("admin123");
              setError(null);
              setLoading(true);
              try {
                await login("admin@demo.com", "admin123");
                const stored = localStorage.getItem("cpt-auth");
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (parsed.user?.role !== "admin") {
                    localStorage.removeItem("cpt-auth");
                    setError("Not an admin account.");
                    setLoading(false);
                    return;
                  }
                }
                toast.success("Welcome, Admin!");
                router.push("/dashboard");
              } catch {
                setError("Demo login failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Login as Demo Admin
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/" className="text-primary hover:underline">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
