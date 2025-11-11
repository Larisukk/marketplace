// frontend/src/services/searchApi.ts
import axios from "axios";
import type { ListingCardDto, ListingSummaryDto, PageDto, UUID } from "@/types/search";

const api = axios.create({
    baseURL: "",        // <- was VITE_API_URL ?? "http://localhost:8080"
    timeout: 12000,
    paramsSerializer: { /* keep as is */ },
});


// Attach JWT if present (non-breaking)
api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("jwt") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("jwt") ||
        sessionStorage.getItem("token");

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export interface SearchParams {
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    productId?: UUID;
    categoryId?: UUID;
    available?: boolean;
    bbox?: string; // "w,s,e,n" lon/lat WGS84
    page?: number;
    size?: number;
    sort?: "price,asc" | "price,desc" | "createdAt,asc" | "createdAt,desc";
}

export async function searchListings(params: SearchParams) {
    const { data } = await api.get<PageDto<ListingCardDto>>("/api/search/search/listings", { params });
    return data;
}

// ---- Map-driven quick search (hits your /api/listings/map endpoint) ----
export interface MapSearchParams {
    q?: string;
    category?: string;
    available?: boolean;
    minLon?: number;
    minLat?: number;
    maxLon?: number;
    maxLat?: number;
    limit?: number; // default 300
}

export async function searchListingsForMap(params: MapSearchParams) {
    const { data } = await api.get("/api/listings/map", { params });
    return data; // List<ListingMapDTO> (kept untyped here to avoid duplication)
}

export async function getListingSummary(id: UUID) {
    const { data } = await api.get<ListingSummaryDto>(`/api/search/listings/${id}/summary`);
    return data;
}
