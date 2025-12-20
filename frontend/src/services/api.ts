// src/services/api.ts

// Debug log
// @ts-ignore
console.log("API_BASE =", import.meta.env.VITE_API_URL);

// API base url from .env, fallback to /api
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Get token from localStorage
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// Helper to append query params
function buildUrl(path: string, params?: Record<string, any>) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

// Internal request method
async function request<T>(
    path: string,
    opts: RequestInit = {},
    params?: Record<string, any>
): Promise<T> {

  const url = buildUrl(path, params);

  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...opts, headers });

  const text = await res.text();
  let data: any = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* leave raw text */
  }

  if (!res.ok) {
    const fieldErrors = data?.errors ?? null;
    const message = data?.message || data?.error || res.statusText;

    const err = new Error(message) as Error & {
      fields?: Record<string, string>;
    };

    if (fieldErrors) {
      err.fields = fieldErrors;
    }

    throw err;
  }

  return data as T;
}

// Public API
export const api = {
  get: <T>(path: string, params?: Record<string, any>) =>
      request<T>(path, {}, params),

  post: <T>(path: string, body?: unknown) =>
      request<T>(
          path,
          { method: "POST", body: JSON.stringify(body ?? {}) }
      ),

  postParams: <T>(path: string, body: unknown, params?: Record<string, any>) =>
      request<T>(
          path,
          { method: "POST", body: JSON.stringify(body ?? {}) },
          params
      ),

  put: <T>(path: string, body?: unknown) =>
      request<T>(
          path,
          { method: "PUT", body: JSON.stringify(body ?? {}) }
      ),

  patch: <T>(path: string, body?: unknown) =>
      request<T>(
          path,
          { method: "PATCH", body: JSON.stringify(body ?? {}) }
      ),

  del: <T>(path: string) =>
      request<T>(path, { method: "DELETE" }),
};
