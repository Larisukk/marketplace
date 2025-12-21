// frontend/src/features/search/useMapData.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { Bbox, Point } from "@/components/MapBox";
import type { Filters } from "./filters";
import { buildSearchParams, isEmptyFilters } from "./filters";
import type { ListingCardDto, ListingMapDto } from "@/types/search";
import { toAbsoluteUrl } from "@/services/api"; // ✅ use shared helper

export function useMapData() {
    const [filters, setFilters] = useState<Filters>({});
    const [bbox, setBbox] = useState<Bbox | null>(null);

    const [points, setPoints] = useState<Point[]>([]);
    const [cards, setCards] = useState<ListingCardDto[]>([]);

    const [loading, setLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async () => {
        if (!bbox) return;

        abortRef.current?.abort();
        const ctl = new AbortController();
        abortRef.current = ctl;

        setLoading(true);

        try {
            let url: string;

            // - bbox endpoint returns Point[] (fast, no images)
            // - map endpoint returns ListingMapDto[] (rich, includes imageUrl)
            if (isEmptyFilters(filters)) {
                const qs = buildSearchParams(undefined, bbox, 300);
                url = `/api/listings/bbox?${qs.toString()}`;
            } else {
                const qs = buildSearchParams(filters, bbox, 300);
                url = `/api/listings/map?${qs.toString()}`;
            }

            const r = await fetch(url, { signal: ctl.signal });
            const data = await r.json();

            if (!Array.isArray(data) || data.length === 0) {
                setPoints([]);
                setCards([]);
                return;
            }

            // ✅ ListingMapDto[] from /api/listings/map
            if ("imageUrl" in data[0]) {
                const list = data as ListingMapDto[];

                setCards([]); // hook used for map points

                setPoints(
                    list.map((x) => ({
                        id: x.id,
                        title: x.title,
                        productName: x.productName ?? "",
                        priceCents: x.priceCents ?? null,
                        currency: x.currency ?? null,
                        lon: x.lon ?? 0,
                        lat: x.lat ?? 0,
                        farmerName: x.farmerName ?? null,
                        thumbnailUrl: toAbsoluteUrl(x.imageUrl),
                    }))
                );

                return;
            }

            // ✅ ListingCardDto[] (if some endpoint ever returns it)
            if ("thumbnailUrl" in data[0] || "images" in data[0]) {
                const list = data as ListingCardDto[];
                setCards(list);

                setPoints(
                    list.map((x) => {
                        const bestRel =
                            (x.images?.length ? x.images[0].url : null) ?? x.thumbnailUrl ?? null;

                        return {
                            id: x.id,
                            title: x.title,
                            productName: x.productName ?? "",
                            priceCents: x.priceCents ?? null,
                            currency: x.currency ?? null,
                            lon: x.lon ?? 0,
                            lat: x.lat ?? 0,
                            farmerName: x.farmerName ?? null,
                            thumbnailUrl: toAbsoluteUrl(bestRel),
                        };
                    })
                );

                return;
            }

            // ✅ Default: treat as Point[]
            setPoints(data as Point[]);
            setCards([]);
        } finally {
            setLoading(false);
        }
    }, [filters, bbox]);

    useEffect(() => {
        const t = setTimeout(() => {
            void load();
        }, 250);
        return () => clearTimeout(t);
    }, [load]);

    return { points, cards, loading, setFilters, setBbox };
}
