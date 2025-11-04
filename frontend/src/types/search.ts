export type UUID = string;

export interface ListingCardDto {
    id: UUID;
    title: string;
    priceCents: number;
    currency: string;
    lon: number;
    lat: number;
    productName: string | null;
    categoryName: string | null;
    thumbnailUrl: string | null;
}

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
