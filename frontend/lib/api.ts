const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("cpt-auth");
  if (!stored) return {};
  try {
    const { token } = JSON.parse(stored);
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  } catch {
    return {};
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

  if (!res.ok) {
    const message = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${message}`);
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

  if (!res.ok) {
    const message = await res.text().catch(() => "Unknown error");
    throw new Error(`Upload error ${res.status}: ${message}`);
  }

  return res.json();
}
