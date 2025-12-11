// frontend/src/types/search.ts
export type UUID = string;

export interface ListingCardDto {
    id: UUID;
    farmerUserId: UUID;
    title: string;
    priceCents: number;
    currency: string;
    lon?: number;
    lat?: number;
    productName: string | null;
    categoryName: string | null;
    thumbnailUrl: string | null;
    description: string | null;
    farmerName: string | null;
}

export interface ListingSummaryDto {
    id: UUID;
    farmerUserId: UUID;
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
