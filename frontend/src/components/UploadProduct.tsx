import React, { useState, useRef, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { listingService } from "../services/listings";

const categories = [
    { value: "fructe", label: "Fructe" },
    { value: "legume", label: "Legume" },
    { value: "lactate", label: "Lactate" },
    { value: "oua", label: "Ouă" },
    { value: "altele", label: "Altele" },
];

const unitOptions = [
    { value: "buc", label: "Bucata" },
    { value: "kg", label: "Kilogram" },
    { value: "l", label: "Litru" },
];

// Cities used only as quick suggestions in the datalist.
// Search will also work for any other town via OSM.
const cityOptions = [
    { label: "Cluj-Napoca", lat: 46.7712, lon: 23.6236 },
    { label: "București", lat: 44.4268, lon: 26.1025 },
    { label: "Iași", lat: 47.1585, lon: 27.6014 },
    { label: "Constanța", lat: 44.1598, lon: 28.6348 },
    { label: "Brașov", lat: 45.6579, lon: 25.6012 },
    { label: "Timișoara", lat: 45.7489, lon: 21.2087 },
];

type LocationMarkerProps = {
    position: LatLngExpression | null;
    onSelect: (lat: number, lon: number) => void;
};

type MapCenterUpdaterProps = {
    center: [number, number];
};

const MapCenterUpdater: React.FC<MapCenterUpdaterProps> = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        // zoom 14 = very close to the city
        map.setView(center, 14);
    }, [center, map]);

    return null;
};

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, onSelect }) => {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    if (!position) return null;
    return <Marker position={position} />;
};

const UploadProduct: React.FC = () => {
    const [photos, setPhotos] = useState<File[]>([]);
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("");

    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);

    // Romania center by default
    const [mapCenter, setMapCenter] = useState<[number, number]>([45.9432, 24.9668]);
    const [cityQuery, setCityQuery] = useState("");

    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

    const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
    const unitDropdownRef = useRef<HTMLDivElement | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setPhotos(Array.from(event.target.files));
        }
    };

    // search city: first try our suggestion list, then fall back to OSM geocoding
    const handleCitySearch = async () => {
        const query = cityQuery.trim();
        if (!query) return;

        // 1) try local suggestions
        const normalized = query.toLowerCase();
        const fromList =
            cityOptions.find((c) => c.label.toLowerCase() === normalized) ||
            cityOptions.find((c) => c.label.toLowerCase().includes(normalized));

        if (fromList) {
            setMapCenter([fromList.lat, fromList.lon]);
            return;
        }

        // 2) fall back to OpenStreetMap Nominatim for any town
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ro&q=${encodeURIComponent(
                query
            )}`;

            const response = await fetch(url, {
                headers: {
                    // browser will set UA; this just asks for Romanian names if possible
                    "Accept-Language": "ro",
                },
            });

            if (!response.ok) {
                throw new Error("Search request failed");
            }

            type NominatimResult = { lat: string; lon: string; display_name: string };

            const data: NominatimResult[] = await response.json();

            if (!data.length) {
                setSubmitError(
                    "Nu am găsit orașul/localitatea respectivă. Poți încerca să dai zoom și să dai click direct pe hartă."
                );
                return;
            }

            const result = data[0];
            const latNum = parseFloat(result.lat);
            const lonNum = parseFloat(result.lon);

            if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
                setSubmitError(
                    "Nu am putut interpreta coordonatele pentru această locație."
                );
                return;
            }

            setSubmitError(null);
            setMapCenter([latNum, lonNum]);
            // user can still click exact spot to fine-tune marker
        } catch (err) {
            console.error(err);
            setSubmitError(
                "A apărut o eroare la căutarea locației. Încearcă din nou sau pune markerul direct pe hartă."
            );
        }
    };

    const handleMapSelect = (latitude: number, longitude: number) => {
        setLat(latitude);
        setLon(longitude);
        setMapCenter([latitude, longitude]);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!category || !title || !unit || !price) {
            setSubmitError("Completează categoria, titlul, unitatea și prețul.");
            return;
        }

        if (lat == null || lon == null) {
            setSubmitError("Te rog să selectezi locația pe hartă (click pe hartă).");
            return;
        }

        if (photos.length === 0) {
            setSubmitError("Adaugă cel puțin o fotografie pentru anunț.");
            return;
        }

        const priceNumber = parseFloat(price.replace(",", "."));
        if (Number.isNaN(priceNumber)) {
            setSubmitError("Prețul nu este valid.");
            return;
        }

        try {
            setSubmitting(true);

            const { id } = await listingService.create({
                title,
                description,
                categoryCode: category,
                unit,
                priceRon: priceNumber,
                lat,
                lon,
            });

            await listingService.uploadImages(id, photos);

            setSubmitSuccess(true);
            setPhotos([]);
            setCategory("");
            setTitle("");
            setDescription("");
            setPrice("");
            setUnit("");
            setCityQuery("");
            setLat(null);
            setLon(null);
            setMapCenter([45.9432, 24.9668]);
        } catch (e: any) {
            setSubmitError(
                e?.response?.data?.message ??
                e?.message ??
                "A apărut o eroare la publicarea anunțului."
            );
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target as Node)
            ) {
                setIsCategoryDropdownOpen(false);
            }
            if (
                unitDropdownRef.current &&
                !unitDropdownRef.current.contains(event.target as Node)
            ) {
                setIsUnitDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCategoryLabel = categories.find((c) => c.value === category)?.label;
    const selectedUnitLabel = unitOptions.find((u) => u.value === unit)?.label;

    const markerPosition: LatLngExpression | null =
        lat != null && lon != null ? [lat, lon] : null;

    return (
        <div className="upload-form-container">
            <form onSubmit={handleSubmit}>
                {submitError && <div className="form-error">{submitError}</div>}
                {submitSuccess && (
                    <div className="form-success">Anunțul a fost publicat cu succes.</div>
                )}

                {/* FOTO */}
                <div className="form-section photo-upload-section">
                    <label htmlFor="photo-upload" className="photo-upload-label">
                        {photos.length === 0 ? (
                            <>
                                <span className="plus-icon">+</span>
                                <span>Încărcare fotografii</span>
                            </>
                        ) : (
                            <p>{photos.length} fotografii selectate</p>
                        )}
                    </label>
                    <input
                        type="file"
                        id="photo-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>

                {/* CATEGORIE */}
                <div className="form-section category-select-wrapper" ref={categoryDropdownRef}>
                    <label>Categorie</label>

                    <div
                        className="category-select-display"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        aria-expanded={isCategoryDropdownOpen}
                    >
            <span
                className={`category-display-text ${!category ? "placeholder" : ""}`}
            >
              {selectedCategoryLabel || "Selectează o categorie"}
            </span>
                        <span className="dropdown-arrow">▼</span>
                    </div>

                    {isCategoryDropdownOpen && (
                        <div className="category-select-dropdown">
                            {categories.map((cat) => (
                                <div
                                    key={cat.value}
                                    className={`category-select-option ${
                                        category === cat.value ? "selected" : ""
                                    }`}
                                    onClick={() => {
                                        setCategory(cat.value);
                                        setIsCategoryDropdownOpen(false);
                                    }}
                                >
                                    {cat.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* TITLU */}
                <div className="form-section">
                    <label>Titlu</label>
                    <input
                        type="text"
                        placeholder="Spune cumpărătorilor ce vinzi"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* DESCRIERE */}
                <div className="form-section">
                    <label>Descrie articolul</label>
                    <textarea
                        rows={4}
                        placeholder="Oferă detalii cumpărătorilor"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* LOCAȚIE – CĂUTARE ORAȘ + HARTĂ MICĂ */}
                <div className="form-section">
                    <label>Locație pe hartă</label>

                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            marginBottom: "8px",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Caută orașul/localitatea (ex. Baia Mare)"
                            value={cityQuery}
                            onChange={(e) => setCityQuery(e.target.value)}
                            list="upload-city-options"
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                fontSize: "16px",
                                backgroundColor: "transparent",
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleCitySearch}
                            style={{
                                border: "none",
                                borderRadius: "999px",
                                padding: "6px 12px",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                                backgroundColor: "#AEC3B0",
                                color: "#0F2A1D",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Caută
                        </button>
                    </div>

                    <datalist id="upload-city-options">
                        {cityOptions.map((c) => (
                            <option key={c.label} value={c.label} />
                        ))}
                    </datalist>

                    <div
                        style={{
                            width: "100%",
                            height: "220px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid #dfe1e5",
                        }}
                    >
                        <MapContainer
                            center={mapCenter}
                            zoom={11}
                            scrollWheelZoom={false}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapCenterUpdater center={mapCenter} />
                            <LocationMarker position={markerPosition} onSelect={handleMapSelect} />
                        </MapContainer>
                    </div>

                    {lat != null && lon != null && (
                        <p className="location-preview">
                            Locație selectată: Lat {lat.toFixed(5)}, Lon {lon.toFixed(5)}
                        </p>
                    )}
                </div>

                {/* UNITATE */}
                <div className="form-section category-select-wrapper" ref={unitDropdownRef}>
                    <label>Unitate</label>

                    <div
                        className="category-select-display"
                        onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                        aria-expanded={isUnitDropdownOpen}
                    >
            <span className={`category-display-text ${!unit ? "placeholder" : ""}`}>
              {selectedUnitLabel || "Selectează unitatea"}
            </span>
                        <span className="dropdown-arrow">▼</span>
                    </div>

                    {isUnitDropdownOpen && (
                        <div className="category-select-dropdown">
                            {unitOptions.map((u) => (
                                <div
                                    key={u.value}
                                    className={`category-select-option ${
                                        unit === u.value ? "selected" : ""
                                    }`}
                                    onClick={() => {
                                        setUnit(u.value);
                                        setIsUnitDropdownOpen(false);
                                    }}
                                >
                                    {u.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PREȚ */}
                <div className="form-section">
                    <label>Preț</label>
                    <div className="price-input-wrapper">
                        <input
                            type="text"
                            value={price}
                            onChange={(e) => {
                                let value = e.target.value.replace(",", ".");
                                if (value === "") {
                                    setPrice("");
                                    return;
                                }
                                if (/^\d+(\.\d{0,2})?$/.test(value)) {
                                    setPrice(value);
                                }
                            }}
                        />
                        <span className="currency-label">RON</span>
                    </div>
                </div>

                <button type="submit" className="submit-product-btn" disabled={submitting}>
                    {submitting ? "Se publică…" : "Publică Anunțul"}
                </button>
            </form>
        </div>
    );
};

export default UploadProduct;
