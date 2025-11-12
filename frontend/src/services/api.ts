// src/services/api.ts
// sus, după const API_BASE...
// @ts-ignore
console.log("API_BASE =", import.meta.env.VITE_API_URL);

// @ts-ignore
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}
// src/services/api.ts
async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = localStorage.getItem("accessToken");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    // extrage un mesaj prietenos + harta de erori pe câmpuri
    const fieldErrors = (data && typeof data === "object" && data.errors) || null;
    const message =
        (data && typeof data === "object" && (data.message || data.error)) ||
        res.statusText;
    const err = new Error(message) as Error & { fields?: Record<string,string> };
    if (fieldErrors) err.fields = fieldErrors;
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put:  <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT",  body: JSON.stringify(body ?? {}) }),
  patch:<T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH",body: JSON.stringify(body ?? {}) }),
  del:  <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
