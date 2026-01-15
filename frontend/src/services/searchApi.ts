// frontend/src/services/searchApi.ts
import axios from "axios";

import type {
    ListingCardDto,
    ListingMapDto,
    ListingSummaryDto,
    PageDto,
    UUID,
} from "@/types/search";

// Axios instance
const api = axios.create({
    // dev: Vite proxy -> "/api"
    baseURL: "/api",
    timeout: 12000,
    paramsSerializer: (params: any): string => {
        const sp = new URLSearchParams();
        Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            sp.append(key, String(value));
        });
        return sp.toString();
    },
});

// Attach JWT if present
api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("jwt") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("jwt") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken");

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
    farmerId?: UUID;
    bbox?: string; // "w,s,e,n"
    page?: number;
    size?: number;
    sort?: "price,asc" | "price,desc" | "createdAt,asc" | "createdAt,desc";
}

export function searchListings(params: SearchParams) {
    // FINAL URL: /api/search/listings
    return api.get<PageDto<ListingCardDto>>("/search/listings", { params }).then((r) => r.data);
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
    // FINAL URL: /api/listings/map
    return api.get<ListingMapDto[]>("/listings/map", { params }).then((r) => r.data);
}

export function getListingSummary(id: UUID) {
    // FINAL URL: /api/search/listings/{id}/summary
    return api.get<ListingSummaryDto>(`/search/listings/${id}/summary`).then((r) => r.data);
}

export function getListingDetails(id: UUID) {
    // FINAL URL: /api/search/listings/{id}
    return api.get<ListingCardDto>(`/search/listings/${id}`).then((r) => r.data);
}
