// frontend/src/services/searchApi.ts
import axios from "axios";
import type { ListingCardDto, ListingSummaryDto, PageDto, UUID } from "@/types/search";

// Axios instance
const api = axios.create({
    baseURL: "", // or import.meta.env.VITE_API_URL || ""
    timeout: 12000,

    // axios v1 expects paramsSerializer: (params: object) => string
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
        config.headers = config.headers ?? {};
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
    bbox?: string; // "w,s,e,n"
    page?: number;
    size?: number;
    sort?: "price,asc" | "price,desc" | "createdAt,asc" | "createdAt,desc";
}

// ----------------------
//  NO async / await
// ----------------------

export function searchListings(params: SearchParams) {
    return api
        .get<PageDto<ListingCardDto>>("/api/search/search/listings", { params })
        .then((r) => r.data);
}

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

export function searchListingsForMap(params: MapSearchParams) {
    return api.get("/api/listings/map", { params }).then((r) => r.data);
}

export function getListingSummary(id: UUID) {
    return api
        .get<ListingSummaryDto>(`/api/search/listings/${id}/summary`)
        .then((r) => r.data);
}

export function getListingDetails(id: UUID) {
    return api
        .get<ListingCardDto>(`/api/search/listings/${id}`)
        .then((r) => r.data);
}
