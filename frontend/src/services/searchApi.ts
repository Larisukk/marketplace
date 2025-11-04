import axios from "axios";
import type { ListingCardDto, ListingSummaryDto, PageDto, UUID } from "@/types/search"; // or "../types/search" if using Option B

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080"
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

export async function getListingSummary(id: UUID) {
    const { data } = await api.get<ListingSummaryDto>(`/api/search/listings/${id}/summary`);
    return data;
}
