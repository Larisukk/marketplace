import { useEffect, useRef } from "react";
import L from "leaflet";

// Shape returned by /api/listings/map (your DTO)
type ListingDTO = {
  id: string;
  title: string;
  productName?: string;
  categoryName?: string;
  farmerName?: string;
  priceCents?: number;
  currency?: string;
  available?: boolean;
  lat?: number;
  lon?: number;
  addressText?: string;
};

function formatPrice(priceCents?: number, currency?: string) {
  const n = (priceCents ?? 0) / 100;
  const cur = (currency ?? "RON").toUpperCase();
  return `${Math.round(n)} ${cur}`;
}

function priceBubbleIcon(priceText: string) {
  return L.divIcon({
    className: "price-bubble",
    html: `
      <div style="
        display:inline-flex;align-items:center;justify-content:center;
        padding:6px 10px;border-radius:999px;
        background:#2a8c68;color:#fff;font:800 13px/1 system-ui,sans-serif;
        box-shadow:0 2px 8px rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.15);
      ">${priceText}</div>
    `,
    iconSize: [1, 1],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
}

export default function MapView({ q }: { q?: string }) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Create map once
    if (!mapRef.current) {
      // Ensure container exists
      const el = document.getElementById("map");
      if (!el) return;

      mapRef.current = L.map(el).setView([44.43, 26.10], 11); // Bucharest default

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(mapRef.current);
    }

    const map = mapRef.current!;
    const layer = L.layerGroup().addTo(map);

    const qs = q && q.trim().length ? `?q=${encodeURIComponent(q.trim())}` : "";

    async function load() {
      try {
        // Try array endpoint first
        let res = await fetch(`/api/listings/map${qs}`);
        if (!res.ok) {
          // Fallback: GeoJSON endpoint
          res = await fetch(`/api/listings/map.geojson${qs}`);
        }
        if (!res.ok) {
          console.warn("Map API not reachable", res.status);
          return;
        }
        const data = await res.json();
        const points: [number, number][] = [];

        // Case 1: GeoJSON FeatureCollection
        if (data?.type === "FeatureCollection" && Array.isArray(data.features)) {
          data.features.forEach((f: any) => {
            const coords = f?.geometry?.coordinates; // [lon, lat]
            const p = f?.properties ?? {};
            if (Array.isArray(coords) && coords.length >= 2) {
              const lat = coords[1], lon = coords[0];
              const priceText = formatPrice(p.priceCents, p.currency);
              points.push([lat, lon]);

              L.marker([lat, lon], { icon: priceBubbleIcon(priceText) })
                  .addTo(layer)
                  .bindPopup(
                      `<b>${p.title ?? "Listing"}</b><br/>
                   ${p.product ?? ""}${p.category ? ` · ${p.category}` : ""}<br/>
                   <small>👨‍🌾 ${p.farmer ?? "Seller"}</small><br/>
                   <small>📍 ${p.address ?? ""}</small>`
                  );
            }
          });
        }
        // Case 2: Array of DTOs with lat/lon
        else if (Array.isArray(data)) {
          (data as ListingDTO[]).forEach((l) => {
            if (l.lat && l.lon) {
              points.push([l.lat, l.lon]);
              L.marker([l.lat, l.lon], { icon: priceBubbleIcon(formatPrice(l.priceCents, l.currency)) })
                  .addTo(layer)
                  .bindPopup(
                      `<b>${l.title}</b><br/>
                   ${l.productName ?? ""}${l.categoryName ? ` · ${l.categoryName}` : ""}<br/>
                   <small>👨‍🌾 ${l.farmerName ?? "Seller"}</small><br/>
                   <small>📍 ${l.addressText ?? ""}</small>`
                  );
            }
          });
        } else {
          console.warn("Unknown payload shape", data);
        }

        if (points.length) {
          map.fitBounds(points, { padding: [40, 40] });
        } else {
          // No results; keep default center
          console.info("No listings matched the filter.");
        }
      } catch (e) {
        console.error("Failed to load map listings", e);
      }
    }

    load();

    // Cleanup the layer when dependencies change/unmount
    return () => {
      map.removeLayer(layer);
    };
  }, [q]);

  return <div id="map" className="map" />;
}
