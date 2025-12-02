// frontend/src/pages/SearchTester.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchListings, getListingSummary, type SearchParams } from "@/services/searchApi";
import type { ListingCardDto, PageDto } from "@/types/search";
import type { JSX } from "react";

function formatMoney(cents: number | undefined, ccy: string | undefined): string {
    if (cents == null) return "-";
    const v = (cents / 100).toFixed(2);
    return `${v} ${ccy ?? ""}`.trim();
}

const DEFAULT_PARAMS: SearchParams = {
    q: "",
    available: true,
    bbox: "",
    page: 0,
    size: 12,
    sort: "createdAt,desc",
};

export default function SearchTester(): JSX.Element {
    const [params, setParams] = useState<SearchParams>(DEFAULT_PARAMS);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{ items: ListingCardDto[]; total: number; size: number }>({
        items: [],
        total: 0,
        size: DEFAULT_PARAMS.size ?? 12,
    });

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(data.total / (data.size || 1))),
        [data.total, data.size]
    );

    // --- Debounce: typing in filters won't spam the API ---
    const debounceRef = useRef<number | null>(null);
    const debouncedFetch = useCallback((fn: () => void, ms = 300) => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(fn, ms);
    }, []);

    const fetchData = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const res: PageDto<ListingCardDto> = await searchListings({ ...params, page });
            setData({ items: res.items, total: res.total, size: res.size });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Request failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [params, page]);

    // Auto-fetch when params/page change (debounced)
    useEffect(() => {
        debouncedFetch(() => void fetchData(), 250);
    }, [fetchData, debouncedFetch]);

    // ----- UI handlers -----
    const onSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
        ev.preventDefault();
        setPage(0);
        void fetchData();
    };

    const onClickItem = async (id: string): Promise<void> => {
        try {
            const s = await getListingSummary(id);
            alert(
                `Summary:\n\n${s.title}\n${formatMoney(s.priceCents, s.currency)}\nlon=${s.lon}, lat=${s.lat}\n\n(Use this to pan the map + open popup.)`
            );
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to load summary";
            setError(message);
        }
    };

    const clearAll = () => {
        setParams(DEFAULT_PARAMS);
        setPage(0);
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Search Tester</h1>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-3">
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium mb-1">q (text)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        value={params.q ?? ""}
                        onChange={(e) => {
                            setPage(0);
                            setParams((p) => ({ ...p, q: e.target.value }));
                        }}
                        placeholder="tomato, apples, cheese..."
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">minPrice (cents)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        type="number"
                        inputMode="numeric"
                        value={params.minPrice ?? ""}
                        onChange={(e) =>
                            setParams((p) => ({ ...p, minPrice: e.target.value ? Number(e.target.value) : undefined }))
                        }
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">maxPrice (cents)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        type="number"
                        inputMode="numeric"
                        value={params.maxPrice ?? ""}
                        onChange={(e) =>
                            setParams((p) => ({ ...p, maxPrice: e.target.value ? Number(e.target.value) : undefined }))
                        }
                    />
                </div>

                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">bbox (w,s,e,n)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        value={params.bbox ?? ""}
                        onChange={(e) => {
                            setPage(0);
                            setParams((p) => ({ ...p, bbox: e.target.value || undefined }));
                        }}
                        placeholder="23.50,46.70,23.75,46.83"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1">sort</label>
                    <select
                        className="w-full border rounded px-2 py-1"
                        value={params.sort ?? "createdAt,desc"}
                        onChange={(e) => setParams((p) => ({ ...p, sort: e.target.value as SearchParams["sort"] }))}
                    >
                        <option value="createdAt,desc">Newest</option>
                        <option value="createdAt,asc">Oldest</option>
                        <option value="price,asc">Price ↑</option>
                        <option value="price,desc">Price ↓</option>
                    </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                    <input
                        id="available"
                        type="checkbox"
                        checked={params.available ?? true}
                        onChange={(e) => setParams((p) => ({ ...p, available: e.target.checked }))}
                    />
                    <label htmlFor="available">Only available</label>
                </div>

                <div className="md:col-span-2 flex gap-2">
                    <button type="submit" className="flex-1 bg-black text-white rounded px-3 py-2" disabled={loading}>
                        {loading ? "Loading…" : "Search"}
                    </button>
                    <button type="button" className="border rounded px-3 py-2" onClick={clearAll} disabled={loading}>
                        Clear
                    </button>
                </div>
            </form>

            {/* Active filter chips */}
            <div className="flex flex-wrap gap-2 mb-3 text-sm">
                {params.q ? <span className="px-2 py-1 rounded-full bg-gray-100">q: "{params.q}"</span> : null}
                {params.minPrice != null ? <span className="px-2 py-1 rounded-full bg-gray-100">min {params.minPrice}</span> : null}
                {params.maxPrice != null ? <span className="px-2 py-1 rounded-full bg-gray-100">max {params.maxPrice}</span> : null}
                {params.bbox ? <span className="px-2 py-1 rounded-full bg-gray-100">bbox {params.bbox}</span> : null}
                {params.available ? <span className="px-2 py-1 rounded-full bg-green-100">available</span> : null}
            </div>

            <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/70 backdrop-blur py-2">
                <div className="text-sm text-gray-600">
                    Total: <b>{data.total}</b> • Page {page + 1} / {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        className="border rounded px-3 py-1"
                        disabled={page <= 0 || loading}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        Prev
                    </button>
                    <button
                        className="border rounded px-3 py-1"
                        disabled={page + 1 >= totalPages || loading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-300 rounded mb-3">{error}</div>}

            {/* Results */}
            {loading && data.items.length === 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i} className="border rounded p-3 animate-pulse">
                            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                            <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                            <div className="h-28 w-full bg-gray-200 rounded" />
                        </li>
                    ))}
                </ul>
            ) : data.items.length === 0 ? (
                <div className="p-6 text-center text-gray-500 border rounded">No results. Try widening the bbox or clearing filters.</div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.items.map((it) => (
                        <li key={it.id} className="border rounded p-3 hover:shadow transition">
                            <div className="text-sm text-gray-500">{it.categoryName ?? "-"}</div>
                            <div className="font-semibold">{it.title}</div>
                            <div className="text-sm">{it.productName ?? "-"}</div>
                            <div className="mt-1">{formatMoney(it.priceCents, it.currency)}</div>

                            {it.lon != null && it.lat != null && (
                                <div className="text-xs text-gray-500">lon:{it.lon.toFixed(5)} • lat:{it.lat.toFixed(5)}</div>
                            )}

                            {it.thumbnailUrl && (
                                <img src={it.thumbnailUrl} alt="" className="mt-2 w-full h-28 object-cover rounded" />
                            )}

                            <div className="mt-2 flex gap-2">
                                <button className="border rounded px-2 py-1 text-sm" onClick={() => void onClickItem(it.id)}>
                                    Get summary
                                </button>
                                {/* Optional: stash coords -> Map page can flyTo on next visit */}
                                {it.lon != null && it.lat != null && (
                                    <button
                                        className="border rounded px-2 py-1 text-sm"
                                        onClick={() => {
                                            sessionStorage.setItem("map:flyTo", JSON.stringify({ lon: it.lon, lat: it.lat, id: it.id }));
                                            window.location.href = "/map";
                                        }}
                                    >
                                        View on map
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
