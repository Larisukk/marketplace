// src/components/MapBox.tsx
import { useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
    useMap,
} from "react-leaflet";
import L, { type DivIcon, type LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import LocateMe from "./LocateMe";

import MarkerClusterGroup from "react-leaflet-cluster";

/** Single listing point coming from /api/search/search/listings */
export type Point = {
    id: string;
    title: string;
    productName: string;
    priceCents: number | null;
    currency: string | null;
    lon: number;
    lat: number;
    farmerName: string | null;
};

export type Bbox = {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
};

type MapBoxProps = {
    center: [number, number];
    points: Point[];
    onBboxChange: (bbox: Bbox) => void;
};

/* ---------- helpers ---------- */

function createPriceIcon(p: Point): DivIcon {
    const hasPrice =
        p.priceCents !== null &&
        p.priceCents !== undefined &&
        !Number.isNaN(p.priceCents);

    const label = hasPrice
        ? `${(p.priceCents! / 100).toFixed(0)} ${p.currency || "RON"}`
        : "•";

    return L.divIcon({
        className: "price-marker",
        html: `<div class="price-badge">${label}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
}

/** Bubble cluster icon (green circle with count) */
function createClusterIcon(cluster: any): DivIcon {
    const count = cluster.getChildCount();

    return L.divIcon({
        html: `<div class="cluster-badge"><span>${count}</span></div>`,
        // both classes so we override default markercluster CSS cleanly
        className: "marker-cluster marker-cluster-badge",
        iconSize: [40, 40],
    });
}

/** Watches map moves, debounces, and notifies parent with bbox. */
function BboxWatcher({ onChange }: { onChange: (bbox: Bbox) => void }) {
    const map = useMapEvents({});
    const timeoutRef = useRef<number | null>(null);

    function notify(bounds: LatLngBounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onChange({
            minLon: sw.lng,
            minLat: sw.lat,
            maxLon: ne.lng,
            maxLat: ne.lat,
        });
    }

    function scheduleUpdate() {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            notify(map.getBounds());
        }, 400);
    }

    useMapEvents({
        moveend() {
            scheduleUpdate();
        },
    });

    useEffect(() => {
        scheduleUpdate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

/** Keep Leaflet center in sync with `center` prop (used for card-click fly-to). */
function CenterOnProp({ center }: { center: [number, number] }) {
    const map = useMap();
    const prev = useRef<[number, number] | null>(null);

    useEffect(() => {
        if (!center) return;
        const [lat, lon] = center;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        if (!prev.current || prev.current[0] !== lat || prev.current[1] !== lon) {
            map.setView(center, map.getZoom());
            prev.current = center;
        }
    }, [center, map]);

    return null;
}

/* ---------- main component ---------- */

export default function MapBox({ center, points, onBboxChange }: MapBoxProps) {
    const tileUrl =
        import.meta.env.VITE_TILE_URL ||
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const validPoints = points.filter(
        (p) =>
            typeof p.lat === "number" &&
            typeof p.lon === "number" &&
            !Number.isNaN(p.lat) &&
            !Number.isNaN(p.lon)
    );

    return (
        <MapContainer
            center={center}
            zoom={12}
            minZoom={4}
            scrollWheelZoom
            className="mapPage-map fullOnDesktop"
        >
            <TileLayer
                url={tileUrl}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <CenterOnProp center={center} />
            <LocateMe />
            <BboxWatcher onChange={onBboxChange} />

            {/* clustering for performance, with bubble icons */}
            <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createClusterIcon}
            >
                {validPoints.map((p) => (
                    <Marker
                        key={p.id}
                        position={[p.lat, p.lon]}
                        icon={createPriceIcon(p)}
                    >
                        <Popup>
                            <strong>{p.title}</strong>
                            <br />
                            {p.productName}
                            {p.priceCents != null && (
                                <>
                                    {" — "}
                                    {(p.priceCents / 100).toFixed(2)}{" "}
                                    {p.currency || "RON"}
                                </>
                            )}
                            <br />
                            {p.farmerName && (
                                <small>Farmer: {p.farmerName}</small>
                            )}
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
