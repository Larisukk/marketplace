import { useEffect, useState } from "react";
import MapBox, { type Bbox, type Point } from "../../components/MapBox";

export default function MapPage() {
    const [points, setPoints] = useState<Point[]>([]);
    const [mapHeightPct, setMapHeightPct] = useState<number>(50); // 30–90 recommended

    // write the CSS variable so CSS can size the map box
    useEffect(() => {
        document.documentElement.style.setProperty("--map-h", `${mapHeightPct}dvh`);
    }, [mapHeightPct]);

    async function fetchForBbox({ minLon, minLat, maxLon, maxLat }: Bbox) {
        const qs = new URLSearchParams({
            minLon: String(minLon), minLat: String(minLat),
            maxLon: String(maxLon), maxLat: String(maxLat),
            limit: "300",
        });
        const r = await fetch(`/api/listings/bbox?${qs.toString()}`);
        setPoints(await r.json());
    }

    return (
        <div style={{ padding: "12px" }}>
            {/* Small control to adjust the map height live */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <label style={{ fontWeight: 600 }}>Map height: {mapHeightPct}%</label>
                <input
                    type="range"
                    min={30}
                    max={90}
                    value={mapHeightPct}
                    onChange={(e) => setMapHeightPct(Number(e.target.value))}
                />
                {/* Toggle this class if you want full height on desktop */}
                <small style={{ opacity: 0.7 }}>
                    Default is 50% of screen; drag to resize. On desktop you can also switch to full height via CSS class.
                </small>
            </div>

            {/* Add className "fullOnDesktop" if you want full height on >=1024px */}
            <div className="mapResponsive">
                <MapBox
                    center={[44.4268, 26.1025]}
                    points={points}
                    onBboxChange={fetchForBbox}
                />
            </div>
        </div>
    );
}
