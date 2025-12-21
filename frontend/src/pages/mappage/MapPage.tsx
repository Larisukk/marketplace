// frontend/src/pages/mappage/MapPage.tsx
import { FormEvent, useState } from "react";
import MapBox, { type Bbox, type Point } from "../../components/MapBox";
import "./MapPage.css";

import { searchListings } from "@/services/searchApi";
import type { ListingCardDto } from "@/types/search";
import { toAbsoluteUrl } from "@/services/api"; // ✅ shared helper

type SortOption =
    | "createdAt,desc"
    | "createdAt,asc"
    | "price,asc"
    | "price,desc";

type Filters = {
    q: string;
    minPrice: string; // in currency units
    maxPrice: string;
    available: boolean;
    sort: SortOption;
};

const DEFAULT_CENTER: [number, number] = [44.4268, 26.1025];

export default function MapPage() {
    const [filters, setFilters] = useState<Filters>({
        q: "",
        minPrice: "",
        maxPrice: "",
        available: true,
        sort: "createdAt,desc",
    });

    const [bbox, setBbox] = useState<Bbox | null>(null);

    const [listings, setListings] = useState<ListingCardDto[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Convert ListingCardDto -> Point expected by MapBox
    function listingToPoint(l: ListingCardDto): Point {
        const best =
            (l.images?.length ? l.images[0].url : null) ?? l.thumbnailUrl ?? null;

        return {
            id: l.id,
            title: l.title,
            productName: l.productName ?? "",
            priceCents: l.priceCents,
            currency: l.currency,
            lon: l.lon ?? 0,
            lat: l.lat ?? 0,
            farmerName: l.farmerName ?? null,

            // MapBox will call toAbsoluteUrl too, but it's ok to normalize here as well
            thumbnailUrl: toAbsoluteUrl(best),
        };
    }

    async function fetchListingsFor(
        currentBbox: Bbox | null,
        currentFilters: Filters,
        pageParam: number
    ) {
        if (!currentBbox) return;

        setLoading(true);
        setError(null);

        const bboxStr = [
            currentBbox.minLon,
            currentBbox.minLat,
            currentBbox.maxLon,
            currentBbox.maxLat,
        ]
            .map(String)
            .join(",");

        const minPriceCents =
            currentFilters.minPrice.trim() === ""
                ? undefined
                : Math.round(parseFloat(currentFilters.minPrice) * 100);

        const maxPriceCents =
            currentFilters.maxPrice.trim() === ""
                ? undefined
                : Math.round(parseFloat(currentFilters.maxPrice) * 100);

        try {
            const data = await searchListings({
                bbox: bboxStr,
                q: currentFilters.q.trim() || undefined,
                minPrice:
                    minPriceCents != null && !Number.isNaN(minPriceCents)
                        ? minPriceCents
                        : undefined,
                maxPrice:
                    maxPriceCents != null && !Number.isNaN(maxPriceCents)
                        ? maxPriceCents
                        : undefined,
                available: currentFilters.available,
                page: pageParam,
                size: pageSize,
                sort: currentFilters.sort,
            });

            setListings(data.items);
            setPoints(data.items.map(listingToPoint));
            setPage(data.page);
            setTotal(data.total);
        } catch (e) {
            console.error("search error", e);
            setError("Could not load listings.");
        } finally {
            setLoading(false);
        }
    }

    // MapBox → bbox changed
    function handleBboxChange(newBbox: Bbox) {
        setBbox(newBbox);
        void fetchListingsFor(newBbox, filters, 0);
    }

    // Change sort and refetch
    function updateSort(next: SortOption) {
        setFilters((prev) => {
            const updated: Filters = { ...prev, sort: next };
            if (bbox) {
                setPage(0);
                void fetchListingsFor(bbox, updated, 0);
            }
            return updated;
        });
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!bbox) return;
        setPage(0);
        void fetchListingsFor(bbox, filters, 0);
    }

    function handlePrevPage() {
        if (!bbox) return;
        if (page <= 0) return;
        const nextPage = page - 1;
        void fetchListingsFor(bbox, filters, nextPage);
    }

    function handleNextPage() {
        if (!bbox) return;
        if (page >= totalPages - 1) return;
        const nextPage = page + 1;
        void fetchListingsFor(bbox, filters, nextPage);
    }

    function handleCardClick(l: ListingCardDto) {
        setActiveId(l.id);
        if (l.lat != null && l.lon != null) {
            setMapCenter([l.lat, l.lon]);
        }
    }

    function clearFilters() {
        const reset: Filters = {
            q: "",
            minPrice: "",
            maxPrice: "",
            available: true,
            sort: "createdAt,desc",
        };
        setFilters(reset);
        setPage(0);
        if (bbox) void fetchListingsFor(bbox, reset, 0);
    }

    return (
        <div className="mapPage">
            <header className="mapPage-header">
                <h2 className="mapPage-title">BioBuy Map</h2>
            </header>

            <div className="mapPage-content">
                <section className="mapPage-list">
                    <form className="mapPage-filters" onSubmit={handleSubmit}>
                        <div className="mapPage-field">
                            <label>Search</label>
                            <input
                                type="text"
                                placeholder="tomatoes, apples, cheese..."
                                value={filters.q}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, q: e.target.value }))
                                }
                            />
                        </div>

                        <div className="mapPage-fieldRow">
                            <div className="mapPage-field">
                                <label>Min price</label>
                                <input
                                    type="number"
                                    placeholder="1"
                                    value={filters.minPrice}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, minPrice: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="mapPage-field">
                                <label>Max price</label>
                                <input
                                    type="number"
                                    placeholder="999"
                                    value={filters.maxPrice}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, maxPrice: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="mapPage-sortGroup">
                            <span className="mapPage-sortLabel">Sort by:</span>
                            <button
                                type="button"
                                className={
                                    "mapPage-sortBtn" +
                                    (filters.sort === "createdAt,desc"
                                        ? " mapPage-sortBtn--active"
                                        : "")
                                }
                                onClick={() => updateSort("createdAt,desc")}
                            >
                                Newest
                            </button>
                            <button
                                type="button"
                                className={
                                    "mapPage-sortBtn" +
                                    (filters.sort === "createdAt,asc"
                                        ? " mapPage-sortBtn--active"
                                        : "")
                                }
                                onClick={() => updateSort("createdAt,asc")}
                            >
                                Oldest
                            </button>
                            <button
                                type="button"
                                className={
                                    "mapPage-sortBtn" +
                                    (filters.sort === "price,asc"
                                        ? " mapPage-sortBtn--active"
                                        : "")
                                }
                                onClick={() => updateSort("price,asc")}
                            >
                                Price ↑
                            </button>
                            <button
                                type="button"
                                className={
                                    "mapPage-sortBtn" +
                                    (filters.sort === "price,desc"
                                        ? " mapPage-sortBtn--active"
                                        : "")
                                }
                                onClick={() => updateSort("price,desc")}
                            >
                                Price ↓
                            </button>
                        </div>

                        <div className="mapPage-fieldRow mapPage-fieldRow-bottom">
                            <label className="mapPage-checkbox">
                                <input
                                    type="checkbox"
                                    checked={filters.available}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, available: e.target.checked }))
                                    }
                                />
                                Only available
                            </label>

                            <div className="mapPage-filterButtons">
                                <button type="submit" disabled={loading || !bbox}>
                                    {loading ? "Loading..." : "Search"}
                                </button>
                                <button type="button" onClick={clearFilters} disabled={loading}>
                                    Clear
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mapPage-chips">
                        {filters.q && <span className="chip chip-main">q: "{filters.q}"</span>}
                        {filters.minPrice && <span className="chip">min {filters.minPrice}</span>}
                        {filters.maxPrice && <span className="chip">max {filters.maxPrice}</span>}
                        {filters.available && <span className="chip chip-available">available</span>}
                    </div>

                    <div className="mapPage-listHeader">
                        <div className="mapPage-listInfo">
                            Total: <b>{total}</b> • Page {page + 1} / {totalPages}
                        </div>
                    </div>

                    {loading && listings.length === 0 && (
                        <div className="mapPage-status">Loading...</div>
                    )}
                    {error && <div className="mapPage-error">{error}</div>}
                    {!loading && !error && listings.length === 0 && (
                        <div className="mapPage-status">
                            No listings in this area. Move the map or adjust filters.
                        </div>
                    )}

                    {listings.map((l) => {
                        const best =
                            (l.images?.length ? l.images[0].url : null) ?? l.thumbnailUrl ?? null;

                        const imgUrl = toAbsoluteUrl(best) ?? "/placeholder.jpg";

                        return (
                            <article
                                key={l.id}
                                className={
                                    "mapPage-card" +
                                    (activeId === l.id ? " mapPage-card--active" : "")
                                }
                                onClick={() => handleCardClick(l)}
                            >
                                <div className="mapPage-card-thumb">
                                    <img
                                        src={imgUrl}
                                        alt={l.title}
                                        loading="lazy"
                                        onError={(e) => {
                                            if (e.currentTarget.src.endsWith("/placeholder.jpg")) return;
                                            e.currentTarget.src = "/placeholder.jpg";
                                        }}
                                    />
                                </div>

                                <div className="mapPage-card-body">
                                    <h3 className="mapPage-card-title">{l.title}</h3>

                                    {l.farmerName && (
                                        <div className="mapPage-card-meta">
                                            Farmer: <strong>{l.farmerName}</strong>
                                        </div>
                                    )}

                                    {l.description && <p className="mapPage-card-desc">{l.description}</p>}

                                    <div className="mapPage-card-footer">
                                        {l.priceCents != null && l.currency && (
                                            <span className="mapPage-card-price">
                        {(l.priceCents / 100).toFixed(0)} {l.currency}
                      </span>
                                        )}

                                        {l.productName && (
                                            <span className="mapPage-card-tag">{l.productName}</span>
                                        )}
                                        {l.categoryName && (
                                            <span className="mapPage-card-tag">{l.categoryName}</span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}

                    {total > 0 && (
                        <div className="mapPage-pagination">
                            <button
                                type="button"
                                onClick={handlePrevPage}
                                disabled={page <= 0 || loading}
                            >
                                Prev
                            </button>
                            <span>
                Page {page + 1} / {totalPages}
              </span>
                            <button
                                type="button"
                                onClick={handleNextPage}
                                disabled={loading || page >= totalPages - 1}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>

                <section className="mapPage-mapWrapper">
                    <MapBox center={mapCenter} points={points} onBboxChange={handleBboxChange} />
                </section>
            </div>
        </div>
    );
}
