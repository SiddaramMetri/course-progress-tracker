"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Role = "admin" | "learner";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
  role: Role;
  batch_name: string | null;
  batch_start: string | null;
  batch_end: string | null;
}

interface AuthState {
  token: string;
  refresh_token: string;
  user: UserInfo;
}

interface AuthContextValue {
  user: UserInfo | null;
  token: string | null;
  isAdmin: boolean;
  isLearner: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "cpt-auth";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAdmin: false,
  isLearner: false,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAuth(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "Login failed");
      throw new Error(msg);
    }

    const data = await res.json();
    const state: AuthState = {
      token: data.token,
      refresh_token: data.refresh_token,
      user: data.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setAuth(state);
    // Clear all cached queries so dashboard fetches fresh data for this user
    queryClient.clear();
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
    // Clear all cached queries
    queryClient.clear();
  }, [queryClient]);

  if (!ready) return null;

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user ?? null,
        token: auth?.token ?? null,
        isAdmin: auth?.user?.role === "admin",
        isLearner: auth?.user?.role === "learner",
        isAuthenticated: !!auth?.user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
