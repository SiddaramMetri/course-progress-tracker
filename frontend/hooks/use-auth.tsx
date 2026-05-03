"use client";

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
  user: UserInfo;
}

interface AuthContextValue {
  user: UserInfo | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "cpt-auth";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    const state: AuthState = { token: data.token, user: data.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setAuth(state);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  if (!ready) return null;

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user ?? null,
        token: auth?.token ?? null,
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
