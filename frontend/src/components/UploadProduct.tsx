import React, { useState, useRef, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useNavigate } from "react-router-dom";
import { listingService } from "../services/listings";
import styles from "../pages/uploadProductPage/UploadProduct.module.css";

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
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
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
            const files = Array.from(event.target.files);
            setPhotos(files);

            // Create preview URLs
            const previews = files.map(file => URL.createObjectURL(file));
            setPhotoPreviews(previews);
        }
    };

    const removePhoto = (index: number) => {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(photoPreviews[index]);

        const newPhotos = photos.filter((_, i) => i !== index);
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        setPhotos(newPhotos);
        setPhotoPreviews(newPreviews);
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            // Clean up all preview URLs when component unmounts
            photoPreviews.forEach(url => {
                try {
                    URL.revokeObjectURL(url);
                } catch (e) {
                    // Ignore errors when revoking URLs
                }
            });
        };
    }, []); // Only run cleanup on unmount

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

            // Clean up preview URLs
            photoPreviews.forEach(url => URL.revokeObjectURL(url));

            setSubmitSuccess(true);
            setPhotos([]);
            setPhotoPreviews([]);
            setCategory("");
            setTitle("");
            setDescription("");
            setPrice("");
            setUnit("");
            setCityQuery("");
            setLat(null);
            setLon(null);
            setMapCenter([45.9432, 24.9668]);

            // Navigate to the new listing after a short delay
            setTimeout(() => {
                navigate(`/listings/${id}`);
            }, 1500);
        } catch (e: any) {
            console.error("Upload error:", e);
            let errorMessage = "A apărut o eroare la publicarea anunțului.";

            if (e?.response?.data?.message) {
                errorMessage = e.response.data.message;
            } else if (e?.message) {
                errorMessage = e.message;
            } else if (typeof e === 'string') {
                errorMessage = e;
            }

            setSubmitError(errorMessage);
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
        <div className={styles['upload-form-container']}>
            <form onSubmit={handleSubmit}>
                {submitError && <div className={styles['form-error']}>{submitError}</div>}
                {submitSuccess && (
                    <div className={styles['form-success']}>Anunțul a fost publicat cu succes.</div>
                )}

                {/* FOTO */}
                <div className={`${styles['form-section']} ${styles['photo-upload-section']}`}>
                    <label htmlFor="photo-upload" className={styles['photo-upload-label']}>
                        {photos.length === 0 ? (
                            <>
                                <span className={styles['plus-icon']}>+</span>
                                <span>Încărcare fotografii</span>
                            </>
                        ) : (
                            <span>{photos.length} {photos.length === 1 ? 'fotografie selectată' : 'fotografii selectate'}</span>
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

                    {photoPreviews.length > 0 && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                            gap: "10px",
                            marginTop: "15px"
                        }}>
                            {photoPreviews.map((preview, index) => (
                                <div key={index} style={{ position: "relative" }}>
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                            width: "100%",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                            border: "1px solid #dfe1e5"
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        style={{
                                            position: "absolute",
                                            top: "5px",
                                            right: "5px",
                                            background: "rgba(0,0,0,0.7)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "24px",
                                            height: "24px",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            lineHeight: "1"
                                        }}
                                        aria-label="Remove photo"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CATEGORIE */}
                <div className={`${styles['form-section']} ${styles['category-select-wrapper']}`} ref={categoryDropdownRef}>
                    <label>Categorie</label>

                    <div
                        className={styles['category-select-display']}
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        aria-expanded={isCategoryDropdownOpen}
                    >
                        <span
                            className={`${styles['category-display-text']} ${!category ? styles['placeholder'] : ""}`}
                        >
                            {selectedCategoryLabel || "Selectează o categorie"}
                        </span>
                        <span className={styles['dropdown-arrow']}>▼</span>
                    </div>

                    {isCategoryDropdownOpen && (
                        <div className={styles['category-select-dropdown']}>
                            {categories.map((cat) => (
                                <div
                                    key={cat.value}
                                    className={`${styles['category-select-option']} ${category === cat.value ? styles['selected'] : ""
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
                <div className={styles['form-section']}>
                    <label>Titlu</label>
                    <input
                        type="text"
                        placeholder="Spune cumpărătorilor ce vinzi"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* DESCRIERE */}
                <div className={styles['form-section']}>
                    <label>Descrie articolul</label>
                    <textarea
                        rows={4}
                        placeholder="Oferă detalii cumpărătorilor"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* LOCAȚIE – CĂUTARE ORAȘ + HARTĂ MICĂ */}
                <div className={styles['form-section']}>
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
                        <p className={styles['location-preview']}>
                            Locație selectată: Lat {lat.toFixed(5)}, Lon {lon.toFixed(5)}
                        </p>
                    )}
                </div>

                {/* UNITATE */}
                <div className={`${styles['form-section']} ${styles['category-select-wrapper']}`} ref={unitDropdownRef}>
                    <label>Unitate</label>

                    <div
                        className={styles['category-select-display']}
                        onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                        aria-expanded={isUnitDropdownOpen}
                    >
                        <span className={`${styles['category-display-text']} ${!unit ? styles['placeholder'] : ""}`}>
                            {selectedUnitLabel || "Selectează unitatea"}
                        </span>
                        <span className={styles['dropdown-arrow']}>▼</span>
                    </div>

                    {isUnitDropdownOpen && (
                        <div className={styles['category-select-dropdown']}>
                            {unitOptions.map((u) => (
                                <div
                                    key={u.value}
                                    className={`${styles['category-select-option']} ${unit === u.value ? styles['selected'] : ""
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
                <div className={styles['form-section']}>
                    <label>Preț</label>
                    <div className={styles['price-input-wrapper']}>
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
                        <span className={styles['currency-label']}>RON</span>
                    </div>
                </div>

                <button type="submit" className={styles['submit-product-btn']} disabled={submitting}>
                    {submitting ? "Se publică…" : "Publică Anunțul"}
                </button>
            </form>
        </div>
    );
};

export default UploadProduct;
