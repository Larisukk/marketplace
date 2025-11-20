// frontend/src/services/searchApi.ts
import axios from "axios";
import type {
    ListingCardDto,
    ListingSummaryDto,
    PageDto,
    UUID,
} from "@/types/search";

// Axios instance
const api = axios.create({
    baseURL: "", // or import.meta.env.VITE_API_URL || ""
    timeout: 12000,

    // Your axios version expects: (params: Object) => string
    paramsSerializer: (params: any): string => {
        const sp = new URLSearchParams();
        Object.entries(params as Record<string, unknown>).forEach(
            ([key, value]) => {
                if (value === undefined || value === null) return;
                sp.append(key, String(value));
            }
        );
        return sp.toString();
    },
});

// Attach JWT if present
api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("jwt") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("jwt") ||
        sessionStorage.getItem("token");

    if (token) {
        // headers can be undefined -> ensure object
        if (!config.headers) {
            config.headers = {};
        }
        (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
});

export interface SearchParams {
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    productId?: UUID;
    categoryId?: UUID;
    available?: boolean;
    bbox?: string; // "w,s,e,n" lon/lat
    page?: number;
    size?: number;
    sort?: "price,asc" | "price,desc" | "createdAt,asc" | "createdAt,desc";
}

export async function searchListings(params: SearchParams) {
    const { data } = await api.get<PageDto<ListingCardDto>>(
        "/api/search/search/listings",
        { params }
    );
    return data;
}

// ---- Optional: map endpoints if you still use them elsewhere ----
export interface MapSearchParams {
    q?: string;
    category?: string;
    available?: boolean;
    minLon?: number;
    minLat?: number;
    maxLon?: number;
    maxLat?: number;
    limit?: number;
}

export async function searchListingsForMap(params: MapSearchParams) {
    const { data } = await api.get("/api/listings/map", { params });
    return data;
}

export async function getListingSummary(id: UUID) {
    const { data } = await api.get<ListingSummaryDto>(
        `/api/search/listings/${id}/summary`
    );
    return data;
}
