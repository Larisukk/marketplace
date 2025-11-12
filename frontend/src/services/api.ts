// src/services/api.ts
// sus, după const API_BASE...
console.log("API_BASE =", import.meta.env.VITE_API_URL);

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text as unknown;
  }

  if (!res.ok) {
    const parsed = data as Record<string, unknown> | null;
    const message =
        (parsed && typeof parsed === "object" &&
            (typeof parsed["message"] === "string" ? parsed["message"] :
                typeof parsed["error"] === "string" ? parsed["error"] : undefined)) ||
        res.statusText;
    throw new Error(message);
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
