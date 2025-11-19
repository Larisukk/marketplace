// src/components/LocateMe.tsx
import { useEffect, useRef, useState } from "react";
import { Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

type UserLocation = {
    lat: number;
    lon: number;
    accuracy: number | null;
};

// simple blue dot marker
function createUserIcon() {
    return L.divIcon({
        className: "user-location-dot",
        html: `<div class="user-location-inner"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}

const LocateMe = () => {
    const map = useMap();

    const [loc, setLoc] = useState<UserLocation | null>(null);
    const [follow, setFollow] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const watchId = useRef<number | null>(null);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchId.current != null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, []);

    // --- one-shot locate (T2.7.1) ---
    const locateOnce = () => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            pos => {
                setError(null);
                const { latitude, longitude, accuracy } = pos.coords;
                setLoc({ lat: latitude, lon: longitude, accuracy });
                setFollow(true);
                map.setView([latitude, longitude]);
            },
            err => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    };

    // --- live tracking (T2.7.2) ---
    const toggleFollow = () => {
        setFollow(prev => {
            const next = !prev;

            if (!("geolocation" in navigator)) {
                setError("Geolocation not supported");
                return false;
            }

            if (next) {
                // start watching
                watchId.current = navigator.geolocation.watchPosition(
                    pos => {
                        const { latitude, longitude, accuracy } = pos.coords;
                        setLoc({
                            lat: latitude,
                            lon: longitude,
                            accuracy,
                        });
                        map.setView([latitude, longitude]);
                    },
                    err => {
                        setError(err.message);
                        setFollow(false);
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 1000,
                        timeout: 20000,
                    }
                );
            } else {
                // stop watching
                if (watchId.current != null) {
                    navigator.geolocation.clearWatch(watchId.current);
                    watchId.current = null;
                }
            }

            return next;
        });
    };

    // --- disable follow when user pans map (T2.7.3) ---
    useMapEvents({
        dragstart() {
            if (follow) {
                setFollow(false);
                if (watchId.current != null) {
                    navigator.geolocation.clearWatch(watchId.current);
                    watchId.current = null;
                }
            }
        },
    });

    return (
        <>
            {/* UI buttons overlay */}
            <div className="locate-controls">
                <button onClick={locateOnce}>Locate me</button>
                <button onClick={toggleFollow} disabled={!loc}>
                    {follow ? "Stop Follow" : "Follow me"}
                </button>
                {error && <span className="locate-error">{error}</span>}
            </div>

            {/* draw dot + accuracy */}
            {loc && (
                <>
                    <Marker
                        position={[loc.lat, loc.lon]}
                        icon={createUserIcon()}
                    />
                    {loc.accuracy && (
                        <Circle
                            center={[loc.lat, loc.lon]}
                            radius={loc.accuracy}
                            pathOptions={{ fillOpacity: 0.15 }}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default LocateMe;
