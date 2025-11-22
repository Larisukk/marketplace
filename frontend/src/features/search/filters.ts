// frontend/src/features/search/filters.ts
export type Filters = {
    q?: string;
    category?: string;
    available?: boolean;
};

export function isEmptyFilters(f: Filters | undefined) {
    if (!f) return true;
    return !f.q && !f.category && typeof f.available === "undefined";
}

export function buildSearchParams(
    f: Filters | undefined,
    bbox?: { minLon: number; minLat: number; maxLon: number; maxLat: number },
    limit = 300
) {
    const p = new URLSearchParams();
    if (f?.q) p.set("q", f.q);
    if (f?.category) p.set("category", f.category);
    if (typeof f?.available !== "undefined") p.set("available", String(f.available));
    if (bbox) {
        p.set("minLon", String(bbox.minLon));
        p.set("minLat", String(bbox.minLat));
        p.set("maxLon", String(bbox.maxLon));
        p.set("maxLat", String(bbox.maxLat));
    }
    p.set("limit", String(limit));
    return p;
}
