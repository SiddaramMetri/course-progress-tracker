const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${message}`);
  }

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
  });

  if (!res.ok) {
    const message = await res.text().catch(() => "Unknown error");
    throw new Error(`Upload error ${res.status}: ${message}`);
  }

  return res.json();
}
