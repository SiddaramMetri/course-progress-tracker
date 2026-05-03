const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "cpt-auth";

function getStoredAuth(): { token: string; refresh_token: string } | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  if (auth?.token) return { Authorization: `Bearer ${auth.token}` };
  return {};
}

function clearAuthAndRedirect(reason?: string) {
  localStorage.removeItem(STORAGE_KEY);
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    const url = reason
      ? `/login?error=${encodeURIComponent(reason)}`
      : "/login";
    window.location.href = url;
  }
}

/** Parse API error response - extract detail from JSON or return raw */
function parseApiError(body: string): string {
  try {
    const parsed = JSON.parse(body);
    return parsed.detail || body;
  } catch {
    return body || "Unknown error";
  }
}

async function tryRefreshToken(): Promise<boolean> {
  const auth = getStoredAuth();
  if (!auth?.refresh_token) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: auth.refresh_token }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    const newAuth = {
      token: data.token,
      refresh_token: data.refresh_token,
      user: data.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry with new token
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
          ...options?.headers,
        },
      });

      if (retryRes.ok) {
        if (retryRes.status === 204) return undefined as T;
        return retryRes.json();
      }

      if (retryRes.status === 401) {
        clearAuthAndRedirect();
        throw new Error("Session expired. Please login again.");
      }

      const message = await retryRes.text().catch(() => "Unknown error");
      throw new Error(parseApiError(message));
    }

    // Refresh failed - clear auth and redirect to login
    clearAuthAndRedirect();
    throw new Error("Session expired. Please login again.");
  }

  // Auto-logout on 403 "blocked"
  if (res.status === 403) {
    const body = await res.text().catch(() => "");
    if (body.includes("blocked")) {
      clearAuthAndRedirect("Your account has been blocked.");
      throw new Error("Account is blocked");
    }
    throw new Error(parseApiError(body));
  }

  if (!res.ok) {
    const message = await res.text().catch(() => "Unknown error");
    throw new Error(parseApiError(message));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function apiUpload<T>(
  path: string,
  file: File
): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });

  // Auto-refresh on 401 for uploads too
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryRes = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        body: formData,
        headers: getAuthHeaders(),
      });
      if (retryRes.ok) return retryRes.json();
    }
    clearAuthAndRedirect();
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    const message = await res.text().catch(() => "Unknown error");
    throw new Error(`Upload error ${res.status}: ${message}`);
  }

  return res.json();
}
