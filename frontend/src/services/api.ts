// frontend/src/services/api.ts

// JSON API base (dev: Vite proxy -> "/api", or direct "http://localhost:8080/api")
const API_BASE: string = (import.meta as any).env?.VITE_API_URL ?? "/api";

// Backend origin for static files like "/uploads/**"
const BACKEND_ORIGIN: string =
    (import.meta as any).env?.VITE_BACKEND_ORIGIN ?? "http://localhost:8080";

// (optional debug)
// @ts-ignore
console.log("API_BASE =", API_BASE);
// @ts-ignore
console.log("BACKEND_ORIGIN =", BACKEND_ORIGIN);

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function getAccessToken(): string | null {
    // ✅ unify with axios interceptor behavior
    return (
        localStorage.getItem("jwt") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("jwt") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken")
    );
}

/**
 * Backend returns relative URLs like "/uploads/abc.png".
 * Convert to absolute URL so <img src="..."> works in the frontend.
 */
export function toAbsoluteUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // already absolute
    if (/^https?:\/\//i.test(url)) return url;

    // "/uploads/.." must always be served from backend origin (Spring Boot)
    if (url.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${url}`;

    // other absolute paths -> backend origin
    if (url.startsWith("/")) return `${BACKEND_ORIGIN}${url}`;

    // relative path -> backend origin
    return `${BACKEND_ORIGIN}/${url}`;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const headers = new Headers(opts.headers || {});
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const isFormData =
        typeof FormData !== "undefined" && opts.body instanceof FormData;

    if (!isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

    const text = await res.text();
    let data: any = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        const fieldErrors =
            (data && typeof data === "object" && (data as any).errors) || null;

        const message =
            (data &&
                typeof data === "object" &&
                ((data as any).message || (data as any).error)) ||
            res.statusText;

        const err = new Error(message) as Error & {
            fields?: Record<string, string>;
            status?: number;
        };
        err.status = res.status;

        if (fieldErrors) err.fields = fieldErrors;
        throw err;
    }

    return data as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),

    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),

    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),

    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),

    del: <T>(path: string) => request<T>(path, { method: "DELETE" }),

    postForm: <T>(path: string, form: FormData) =>
        request<T>(path, { method: "POST", body: form }),
};
