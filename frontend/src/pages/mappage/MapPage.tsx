// frontend/src/pages/MapPage.tsx
import { FormEvent, useEffect, useRef, useState } from "react";
import MapBox, { type Bbox, type Point } from "../../components/MapBox";
import Header from "../../components/Header";
import styles from "./MapPage.module.css";
// import "../homePage/styles.css"; // Removed as it was refactored/moved
import { useLocation, useNavigate } from "react-router-dom";

import { searchListings } from "@/services/searchApi";
import type { ListingCardDto } from "@/types/search";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../hooks/useChat";

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
        sort: "createdAt,desc", // Newest by default
    });

    const [bbox, setBbox] = useState<Bbox | null>(null);
    const navigate = useNavigate();
    const location = useLocation() as {
        state?: { center?: { lat: number; lon: number; listingId?: string } };
    };
    const { user } = useAuth();
    const { actions } = useChat();

    const [listings, setListings] = useState<ListingCardDto[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [mapCenter, setMapCenter] =
        useState<[number, number]>(DEFAULT_CENTER);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(10); // show 10 per page
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const hasAppliedCenterRef = useRef(false);

    // If we arrive from ListingPage with a center in location.state,
    // center the map on that listing once.
    useEffect(() => {
        if (hasAppliedCenterRef.current) return;
        const center = location.state?.center;
        if (!center) return;

        if (typeof center.lat === "number" && typeof center.lon === "number") {
            setMapCenter([center.lat, center.lon]);
        }
        if (center.listingId) {
            setActiveId(center.listingId);
        }
        hasAppliedCenterRef.current = true;
    }, [location.state, setMapCenter]);

    // Convert ListingCardDto -> Point expected by MapBox
    function listingToPoint(l: ListingCardDto): Point {
        return {
            id: l.id,
            title: l.title,
            productName: l.productName ?? "",
            priceCents: l.priceCents,
            currency: l.currency,
            lon: l.lon ?? 0,
            lat: l.lat ?? 0,
            farmerName: l.farmerName ?? null,
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
        void fetchListingsFor(newBbox, filters, 0); // reset to first page
    }

    // Change sort (Newest / Oldest / Price ↑ / Price ↓) and refetch
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

    // Filters form submit (left side panel)
    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!bbox) return;
        setPage(0);
        void fetchListingsFor(bbox, filters, 0);
    }

    // Pagination
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

    // Click on card → center map + highlight
    function handleCardClick(l: ListingCardDto) {
        setActiveId(l.id);
        if (l.lat != null && l.lon != null) {
            setMapCenter([l.lat, l.lon]); // MapBox expects [lat, lon]
        }
    }

    // Clear all filters
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

    // Handle opening listing (view details only; chat is started from ListingPage)
    async function handleOpenListing(listing: ListingCardDto) {
        if (!listing.farmerUserId) {
            alert("Seller information is not available for this listing.");
            return;
        }

        // Always allow opening the listing page, even if not logged in.
        // Chat/login flow is handled inside ListingPage when the user presses "Start chat".
        navigate(`/listings/${listing.id}`, {
            state: {
                sellerId: listing.farmerUserId,
                autoStartChat: false,
            },
        });
    }

    return (
        <div className={styles['mapPage']}>
            <Header />
            {/* Top bar: title */}
            <header className={styles['mapPage-header']}>
                <h2 className={styles['mapPage-title']}>BioBuy Map</h2>
            </header>

            {/* Main layout: left search + list, right map */}
            <div className={styles['mapPage-content']}>
                {/* LEFT: search panel + results */}
                <section className={styles['mapPage-list']}>
                    <form className={styles['mapPage-filters']} onSubmit={handleSubmit}>
                        <div className={styles['mapPage-field']}>
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

                        <div className={styles['mapPage-fieldRow']}>
                            <div className={styles['mapPage-field']}>
                                <label>Min price</label>
                                <input
                                    type="number"
                                    placeholder="1"
                                    value={filters.minPrice}
                                    onChange={(e) =>
                                        setFilters((f) => ({
                                            ...f,
                                            minPrice: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className={styles['mapPage-field']}>
                                <label>Max price</label>
                                <input
                                    type="number"
                                    placeholder="999"
                                    value={filters.maxPrice}
                                    onChange={(e) =>
                                        setFilters((f) => ({
                                            ...f,
                                            maxPrice: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Sort buttons: Newest / Oldest / Price ↑ / Price ↓ */}
                        <div className={styles['mapPage-sortGroup']}>
                            <span className={styles['mapPage-sortLabel']}>Sort by:</span>
                            <button
                                type="button"
                                className={
                                    styles['mapPage-sortBtn'] +
                                    (filters.sort === "createdAt,desc"
                                        ? ` ${styles['mapPage-sortBtn--active']}`
                                        : "")
                                }
                                onClick={() => updateSort("createdAt,desc")}
                            >
                                Newest
                            </button>
                            <button
                                type="button"
                                className={
                                    styles['mapPage-sortBtn'] +
                                    (filters.sort === "createdAt,asc"
                                        ? ` ${styles['mapPage-sortBtn--active']}`
                                        : "")
                                }
                                onClick={() => updateSort("createdAt,asc")}
                            >
                                Oldest
                            </button>
                            <button
                                type="button"
                                className={
                                    styles['mapPage-sortBtn'] +
                                    (filters.sort === "price,asc"
                                        ? ` ${styles['mapPage-sortBtn--active']}`
                                        : "")
                                }
                                onClick={() => updateSort("price,asc")}
                            >
                                Price ↑
                            </button>
                            <button
                                type="button"
                                className={
                                    styles['mapPage-sortBtn'] +
                                    (filters.sort === "price,desc"
                                        ? ` ${styles['mapPage-sortBtn--active']}`
                                        : "")
                                }
                                onClick={() => updateSort("price,desc")}
                            >
                                Price ↓
                            </button>
                        </div>

                        <div className={`${styles['mapPage-fieldRow']} ${styles['mapPage-fieldRow-bottom']}`}>
                            <label className={styles['mapPage-checkbox']}>
                                <input
                                    type="checkbox"
                                    checked={filters.available}
                                    onChange={(e) =>
                                        setFilters((f) => ({
                                            ...f,
                                            available: e.target.checked,
                                        }))
                                    }
                                />
                                Only available
                            </label>

                            <div className={styles['mapPage-filterButtons']}>
                                <button type="submit" disabled={loading || !bbox}>
                                    {loading ? "Loading..." : "Search"}
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    disabled={loading}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Active filter chips */}
                    <div className={styles['mapPage-chips']}>
                        {filters.q && (
                            <span className={`${styles['chip']} ${styles['chip-main']}`}>
                                q: "{filters.q}"
                            </span>
                        )}
                        {filters.minPrice && (
                            <span className={styles['chip']}>min {filters.minPrice}</span>
                        )}
                        {filters.maxPrice && (
                            <span className={styles['chip']}>max {filters.maxPrice}</span>
                        )}
                        {filters.available && (
                            <span className={`${styles['chip']} ${styles['chip-available']}`}>
                                available
                            </span>
                        )}
                    </div>

                    {/* List header info */}
                    <div className={styles['mapPage-listHeader']}>
                        <div className={styles['mapPage-listInfo']}>
                            Total: <b>{total}</b> • Page {page + 1} / {totalPages}
                        </div>
                    </div>

                    {loading && listings.length === 0 && (
                        <div className={styles['mapPage-status']}>Loading...</div>
                    )}
                    {error && <div className={styles['mapPage-error']}>{error}</div>}
                    {!loading && !error && listings.length === 0 && (
                        <div className={styles['mapPage-status']}>
                            No listings in this area. Move the map or adjust
                            filters.
                        </div>
                    )}

                    {/* Result cards */}
                    {/* Result cards */}
                    {listings.map((l) => (
                        <article
                            key={l.id}
                            className={
                                styles['mapPage-card'] +
                                (activeId === l.id
                                    ? ` ${styles['mapPage-card--active']}`
                                    : "")
                            }
                            onClick={() => handleCardClick(l)}
                        >
                            {l.thumbnailUrl && (
                                <div className={styles['mapPage-card-thumb']}>
                                    <img src={l.thumbnailUrl} alt={l.title} />
                                </div>
                            )}

                            <div className={styles['mapPage-card-body']}>
                                <h3 className={styles['mapPage-card-title']}>
                                    {l.title}
                                </h3>

                                {(l as any).farmerName && (
                                    <div className={styles['mapPage-card-meta']}>
                                        Farmer:{" "}
                                        <strong>
                                            {(l as any).farmerName}
                                        </strong>
                                    </div>
                                )}

                                {(l as any).description && (
                                    <p className={styles['mapPage-card-desc']}>
                                        {(l as any).description}
                                    </p>
                                )}

                                <div className={styles['mapPage-card-footer']}>
                                    {l.priceCents != null && l.currency && (
                                        <span className={styles['mapPage-card-price']}>
                                            {(l.priceCents / 100).toFixed(0)}{" "}
                                            {l.currency}
                                        </span>
                                    )}

                                    {l.productName && (
                                        <span className={styles['mapPage-card-tag']}>
                                            {l.productName}
                                        </span>
                                    )}
                                    {l.categoryName && (
                                        <span className={styles['mapPage-card-tag']}>
                                            {l.categoryName}
                                        </span>
                                    )}
                                </div>

                                {/* 👇 NEW BUTTON GOES HERE */}
                                <div className={styles['mapPage-card-actions']}>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // don't trigger card click
                                            void handleOpenListing(l);
                                        }}
                                    >
                                        Open listing
                                    </button>
                                </div>
                                {/* ☝️ NEW BUTTON */}
                            </div>
                        </article>
                    ))}

                    {/* Pagination – show whenever we have at least one result */}
                    {total > 0 && (
                        <div className={styles['mapPage-pagination']}>
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

                {/* RIGHT: map */}
                <section className={styles['mapPage-mapWrapper']}>
                    <MapBox
                        center={mapCenter}
                        points={points}
                        onBboxChange={handleBboxChange}
                        activeId={activeId}
                        className={styles['mapPage-map']}
                    />
                </section>
            </div>
        </div>
    );
}
