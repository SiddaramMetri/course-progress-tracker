"use client";

import { GraduationCap, Shield, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

const DEMO_ACCOUNTS = [
  {
    label: "Admin User",
    email: "admin@demo.com",
    password: "admin123",
    role: "admin" as const,
    icon: Shield,
  },
  {
    label: "Alice Johnson",
    email: "alice@demo.com",
    password: "learner123",
    role: "learner" as const,
    icon: User,
  },
  {
    label: "Bob Smith",
    email: "bob@demo.com",
    password: "learner123",
    role: "learner" as const,
    icon: User,
  },
];

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error")
  );
  const [loading, setLoading] = useState(false);

  // Already logged in - redirect handled by AuthGuard, just show nothing
  if (user) return null;

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Login failed";
      const errorMsg = raw.includes("blocked")
        ? "Account is blocked. Contact your administrator."
        : "Invalid email or password";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    await handleLogin(email.trim(), password);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    await handleLogin(demoEmail, demoPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Course Progress Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to continue
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or try a demo account
            </span>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              return (
                <Button
                  key={account.email}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled={loading}
                  onClick={() =>
                    handleDemoLogin(account.email, account.password)
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{account.label}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {account.role}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
