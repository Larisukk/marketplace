// src/pages/MapPage.tsx
import { useState } from "react";
import MapBox, { type Bbox, type Point } from "../../components/MapBox";
import "./MapPage.css";

export default function MapPage() {
    const [points, setPoints] = useState<Point[]>([]);

    async function handleBboxChange({ minLon, minLat, maxLon, maxLat }: Bbox) {
        const qs = new URLSearchParams({
            minLon: String(minLon),
            minLat: String(minLat),
            maxLon: String(maxLon),
            maxLat: String(maxLat),
            limit: "300",
        });

        try {
            const res = await fetch(`/api/listings/bbox?${qs.toString()}`);
            if (!res.ok) {
                console.error("bbox fetch failed", await res.text());
                return;
            }
            const data = (await res.json()) as Point[];
            setPoints(data);
        } catch (err) {
            console.error("bbox fetch error", err);
        }
    }

    return (
        <div className="mapPage">
            <h2 className="mapPage-title">BioBuy Map</h2>
            <div className="mapPage-mapWrapper">
                <MapBox
                    center={[44.4268, 26.1025]}
                    points={points}
                    onBboxChange={handleBboxChange}
                />
            </div>
        </div>
    );
}
