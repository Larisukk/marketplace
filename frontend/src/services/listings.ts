import { api } from "./api";

export type CreateListingRequest = {
    title: string;
    description: string;
    categoryCode: string;
    unit: string;
    priceRon: number;
    lat: number;
    lon: number;
};

export type CreateListingResponse = {
    id: string;
};

export const listingService = {
    // JSON request – uses your api wrapper
    create(payload: CreateListingRequest) {
        // hits POST /api/listings
        return api.post<CreateListingResponse>("/listings", payload);
    },

    // Multipart upload – we DO NOT use api.post here
    uploadImages(listingId: string, files: File[]) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        // same base as api.ts
        // @ts-ignore
        const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
        const token = localStorage.getItem("accessToken") ?? undefined;

        return fetch(`${API_BASE}/listings/${listingId}/images`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: formData,
        }).then((res) => {
            if (!res.ok) {
                throw new Error("Nu am putut încărca imaginile.");
            }
        });
    },
};
