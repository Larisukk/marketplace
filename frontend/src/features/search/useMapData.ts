// frontend/src/features/search/useMapData.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { Bbox, Point } from "@/components/MapBox";
import type { Filters } from "./filters";
import { buildSearchParams, isEmptyFilters } from "./filters";

export function useMapData() {
    const [filters, setFilters] = useState<Filters>({});
    const [bbox, setBbox] = useState<Bbox | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
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
            if (isEmptyFilters(filters)) {
                // Fast path: bbox-only endpoint
                const qs = buildSearchParams(undefined, bbox, 300);
                url = `/api/listings/bbox?${qs.toString()}`;
            } else {
                // Full search path: filters + bbox
                const qs = buildSearchParams(filters, bbox, 300);
                url = `/api/listings/map?${qs.toString()}`;
            }
            const r = await fetch(url, { signal: ctl.signal });
            const data = await r.json();
            setPoints(data);
        } finally {
            setLoading(false);
        }
    }, [filters, bbox]);

    // debounce queries 250ms on any change (filters or bbox)
    useEffect(() => {
        const t = setTimeout(() => { void load(); }, 250);
        return () => clearTimeout(t);
    }, [load]);

    return { points, loading, setFilters, setBbox };
}
