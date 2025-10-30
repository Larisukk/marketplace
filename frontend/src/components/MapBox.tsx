import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Marker icons without `any`
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker1x, shadowUrl: markerShadow });

export type Bbox = { minLon: number; minLat: number; maxLon: number; maxLat: number; };
export type Point = {
    id: string; title: string; productName: string;
    priceCents: number; currency: string; lon: number; lat: number; farmerName: string;
};

type Props = {
    center: [number, number];
    zoom?: number;
    points?: Point[];
    className?: string;                 // let parent style the box
    onBboxChange?: (bbox: Bbox) => void; // parent fetches data based on viewport
    tileUrl?: string;
    tileAttribution?: string;
};

function BboxWatcher({ onBboxChange }: { onBboxChange?: (b: Bbox) => void }) {
    const map = useMapEvents({
        moveend: fire, zoomend: fire,
    });
    function fire() {
        if (!onBboxChange) return;
        const b = map.getBounds();
        onBboxChange({ minLon: b.getWest(), minLat: b.getSouth(), maxLon: b.getEast(), maxLat: b.getNorth() });
    }
    useEffect(() => { fire(); }, []);  // initial
    return null;
}

// Re-measure map when its parent resizes
function ResizeInvalidate({ observe }: { observe: Element | null }) {
    const map = useMap();
    useEffect(() => {
        if (!observe) return;
        const ro = new ResizeObserver(() => map.invalidateSize());
        ro.observe(observe);
        setTimeout(() => map.invalidateSize(), 0);
        return () => ro.disconnect();
    }, [map, observe]);
    return null;
}

export default function MapBox({
                                   center, zoom = 12, points = [], className, onBboxChange, tileUrl, tileAttribution,
                               }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const url  = tileUrl ?? import.meta.env.VITE_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attr = tileAttribution ?? import.meta.env.VITE_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";

    return (
        <div ref={wrapperRef} className={className} style={{ position: "absolute", inset: 0 }}>
            <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                <TileLayer url={url} attribution={attr} />
                <ResizeInvalidate observe={wrapperRef.current} />
                <BboxWatcher onBboxChange={onBboxChange} />
                {points.map(p => (
                    <Marker key={p.id} position={[p.lat, p.lon]}>
                        <Popup>
                            <b>{p.title}</b><br />
                            {p.productName} · {(p.priceCents ?? 0) / 100} {p.currency}<br />
                            <small>👤 {p.farmerName}</small>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
