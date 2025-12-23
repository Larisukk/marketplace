// frontend/src/types/search.ts
export type UUID = string;

export interface ListingImageDto {
    id: string;
    url: string;
    sortOrder: number;
}

// -----------------------------
// SEARCH ( /api/search/listings )
// -----------------------------
export interface ListingCardDto {
    id: UUID;
    title: string;
    priceCents: number | null;
    currency: string | null;

    lon?: number;
    lat?: number;

    productName: string | null;
    categoryName: string | null;

    // returned by backend as "/uploads/<file>"
    thumbnailUrl: string | null;

    // optional (if you ever add endpoint for all images)
    images?: ListingImageDto[];

    description: string | null;
    farmerName: string | null;
}

// -----------------------------
// MAP ( /api/listings/map )
// -----------------------------
export interface ListingMapDto {
    id: UUID;
    title: string;
    productName: string | null;
    categoryName: string | null;
    farmerName: string | null;

    lat: number | null;
    lon: number | null;

    priceCents: number | null;
    currency: string | null;

    quantity: number | null;
    unit: string | null;
    available: boolean | null;
    addressText: string | null;

    // returned by backend as "/uploads/<file>" (may be null if no images)
    imageUrl: string | null;
}

// ---------------------------------------
// Minimal summary ( /api/search/listings/{id}/summary )
// ---------------------------------------
export interface ListingSummaryDto {
    id: UUID;
    title: string;
    lon: number;
    lat: number;
    priceCents: number;
    currency: string;
}

export interface PageDto<T> {
    items: T[];
    page: number;
    size: number;
    total: number;
}
