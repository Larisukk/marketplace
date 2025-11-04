import { useCallback, useEffect, useMemo, useState } from "react";
import { searchListings, getListingSummary, type SearchParams } from "@/services/searchApi";
import type { ListingCardDto, PageDto } from "@/types/search";
// at the top of SearchTester.tsx
import type { JSX } from "react";


/**
 * Simple tester page for the backend search endpoints.
 * - Filters: q, minPrice, maxPrice, bbox, sort, available
 * - Pagination: page/size
 * - Clicking an item fetches /summary for that listing
 */

function formatMoney(cents: number, ccy: string): string {
    return `${(cents / 100).toFixed(2)} ${ccy}`;
}

const DEFAULT_PARAMS: SearchParams = {
    q: "",
    available: true,
    bbox: "", // leave empty to ignore bbox
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

    useEffect(() => {
        // fire and forget; satisfies no-misused-promises
        void fetchData();
    }, [fetchData]);

    // ----- UI handlers -----
    const onSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
        ev.preventDefault();
        setPage(0);
        void fetchData();
    };

    const onClickItem = async (id: string): Promise<void> => {
        try {
            const s = await getListingSummary(id);
            // eslint-disable-next-line no-alert
            alert(
                `Summary:\n\n${s.title}\n${formatMoney(s.priceCents, s.currency)}\nlon=${s.lon}, lat=${s.lat}\n\n(Use this to pan the map + open popup.)`
            );
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to load summary";
            setError(message);
        }
    };

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Search Tester (Backend-driven)</h1>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">q (text)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        value={params.q ?? ""}
                        onChange={(e) => setParams((p) => ({ ...p, q: e.target.value }))}
                        placeholder="tomato, apples, cheese..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">minPrice (cents)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        type="number"
                        value={params.minPrice ?? ""}
                        onChange={(e) =>
                            setParams((p) => ({ ...p, minPrice: e.target.value ? Number(e.target.value) : undefined }))
                        }
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">maxPrice (cents)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        type="number"
                        value={params.maxPrice ?? ""}
                        onChange={(e) =>
                            setParams((p) => ({ ...p, maxPrice: e.target.value ? Number(e.target.value) : undefined }))
                        }
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">bbox (w,s,e,n)</label>
                    <input
                        className="w-full border rounded px-2 py-1"
                        value={params.bbox ?? ""}
                        onChange={(e) => setParams((p) => ({ ...p, bbox: e.target.value || undefined }))}
                        placeholder="23.4,46.6,23.8,46.9"
                    />
                </div>

                <div>
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

                <div className="flex items-center gap-2">
                    <input
                        id="available"
                        type="checkbox"
                        checked={params.available ?? true}
                        onChange={(e) => setParams((p) => ({ ...p, available: e.target.checked }))}
                    />
                    <label htmlFor="available">Only available</label>
                </div>

                <button
                    type="submit"
                    className="md:col-span-1 bg-black text-white rounded px-3 py-2"
                    disabled={loading}
                >
                    {loading ? "Loading…" : "Search"}
                </button>
            </form>

            <div className="flex items-center justify-between mb-2">
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

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.items.map((it) => (
                    <li key={it.id} className="border rounded p-3 hover:shadow transition">
                        <div className="text-sm text-gray-500">{it.categoryName ?? "-"}</div>
                        <div className="font-semibold">{it.title}</div>
                        <div className="text-sm">{it.productName ?? "-"}</div>
                        <div className="mt-1">{formatMoney(it.priceCents, it.currency)}</div>
                        <div className="text-xs text-gray-500">
                            lon:{it.lon.toFixed(5)} • lat:{it.lat.toFixed(5)}
                        </div>
                        {it.thumbnailUrl && (
                            <img
                                src={it.thumbnailUrl}
                                alt=""
                                className="mt-2 w-full h-28 object-cover rounded"
                            />
                        )}
                        <div className="mt-2">
                            <button
                                className="border rounded px-2 py-1 text-sm"
                                onClick={() => void onClickItem(it.id)}
                            >
                                Get summary (pan/open)
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
