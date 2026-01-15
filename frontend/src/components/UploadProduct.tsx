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
import { getListingDetails } from "../services/searchApi";
import { toAbsoluteUrl } from "../services/api";
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

interface UploadProductProps {
    listingId?: string; // If present, Edit Mode
}

const UploadProduct: React.FC<UploadProductProps> = ({ listingId }) => {
    const navigate = useNavigate();

    // Existing images (from backend) - Edit Mode only
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // New images to upload
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

    // Load existing data if editing
    useEffect(() => {
        if (!listingId) return;

        getListingDetails(listingId as any).then(data => {
            console.log("Fetched listing details:", data);
            setTitle(data.title || "");
            setDescription(data.description || "");

            // Price
            if (data.priceCents != null) {
                setPrice((data.priceCents / 100).toString());
            }

            // Unit
            if (data.unit) {
                setUnit(data.unit);
            }

            // Category
            if (data.categoryName) {
                const norm = data.categoryName.toLowerCase().trim();
                const foundCat = categories.find(c => c.label.toLowerCase() === norm || c.value === norm);
                if (foundCat) {
                    setCategory(foundCat.value);
                } else {
                    console.warn("Category not found for:", data.categoryName);
                }
            }

            if (data.lat && data.lon) {
                setLat(data.lat);
                setLon(data.lon);
                setMapCenter([data.lat, data.lon]);
            }

            // Images
            if (data.images && Array.isArray(data.images)) {
                const imgs = data.images as any[];
                if (imgs.length > 0 && typeof imgs[0] === 'string') {
                    setExistingImages(imgs as string[]);
                } else if (imgs.length > 0 && typeof imgs[0] === 'object') {
                    setExistingImages(imgs.map((i: any) => i.url));
                } else {
                    setExistingImages([]);
                }
            }
        }).catch(err => {
            console.error(err);
            setSubmitError("Nu am putut încărca detaliile anunțului.");
        });
    }, [listingId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setPhotos([...photos, ...files]);

            // Create preview URLs
            const previews = files.map(file => URL.createObjectURL(file));
            setPhotoPreviews([...photoPreviews, ...previews]);
        }
    };

    const removePhoto = (index: number) => {
        URL.revokeObjectURL(photoPreviews[index]);
        const newPhotos = photos.filter((_, i) => i !== index);
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        setPhotos(newPhotos);
        setPhotoPreviews(newPreviews);
    };

    const removeExistingImage = async (url: string) => {
        if (!listingId) return;
        if (!window.confirm("Ștergi această poză?")) return;

        try {
            await listingService.deleteImage(listingId, url);
            setExistingImages(prev => prev.filter(p => p !== url));
        } catch (e) {
            console.error(e);
            alert("Eroare la ștergerea imaginii.");
        }
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            photoPreviews.forEach(url => {
                try { URL.revokeObjectURL(url); } catch (e) { }
            });
        };
    }, []);

    const handleCitySearch = async () => {
        const query = cityQuery.trim();
        if (!query) return;

        const normalized = query.toLowerCase();
        const fromList =
            cityOptions.find((c) => c.label.toLowerCase() === normalized) ||
            cityOptions.find((c) => c.label.toLowerCase().includes(normalized));

        if (fromList) {
            setMapCenter([fromList.lat, fromList.lon]);
            return;
        }

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ro&q=${encodeURIComponent(query)}`;
            const response = await fetch(url, { headers: { "Accept-Language": "ro" } });
            if (!response.ok) throw new Error("Search request failed");
            const data: any[] = await response.json();

            if (!data.length) {
                setSubmitError("Nu am găsit orașul respective. Încearcă zoom pe hartă.");
                return;
            }

            const result = data[0];
            const latNum = parseFloat(result.lat);
            const lonNum = parseFloat(result.lon);

            if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
                setSubmitError("Coordonate invalide.");
                return;
            }

            setSubmitError(null);
            setMapCenter([latNum, lonNum]);
        } catch (err) {
            console.error(err);
            setSubmitError("Eroare la căutare.");
        }
    };

    const handleMapSelect = (latitude: number, longitude: number) => {
        setLat(latitude);
        setLon(longitude);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        // Validation limits relaxed for Edit? No, same validation.
        // Validation
        if (!listingId) {
            // Strict validation for creation
            if (!category || !title || !unit || !price) {
                setSubmitError("Completează categoria, titlul, unitatea și prețul.");
                return;
            }
        }

        if (!listingId && (lat == null || lon == null)) {
            setSubmitError("Selectează locația pe hartă.");
            return;
        }

        if (!listingId && photos.length === 0) {
            setSubmitError("Adaugă cel puțin o fotografie.");
            return;
        }

        const priceNumber = parseFloat(price.replace(",", "."));
        if (Number.isNaN(priceNumber)) {
            setSubmitError("Prețul nu este valid.");
            return;
        }

        try {
            setSubmitting(true);
            let targetId = listingId;

            if (listingId) {
                // UPDATE
                await listingService.update(listingId, {
                    title,
                    description,
                    categoryCode: category,
                    unit,
                    priceRon: priceNumber,
                    lat: lat ?? undefined,
                    lon: lon ?? undefined,
                });
            } else {
                // CREATE
                const res = await listingService.create({
                    title,
                    description,
                    categoryCode: category,
                    unit,
                    priceRon: priceNumber,
                    lat: lat!,
                    lon: lon!,
                });
                targetId = res.id;
            }

            // Upload NEW images if any
            if (photos.length > 0 && targetId) {
                await listingService.uploadImages(targetId, photos);
            }

            // Cleanup
            photoPreviews.forEach(url => URL.revokeObjectURL(url));

            setSubmitSuccess(true);
            if (!listingId) {
                // Reset form only if creating new
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
            }

            // Redirect
            setTimeout(() => {
                navigate(`/listings/${targetId}`);
            }, 1500);

        } catch (e: any) {
            console.error("Submit error:", e);
            let errorMessage = "A apărut o eroare.";
            if (e?.response?.data?.message) errorMessage = e.response.data.message;
            else if (e?.message) errorMessage = e.message;
            setSubmitError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
            if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
                setIsUnitDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCategoryLabel = categories.find((c) => c.value === category)?.label;
    const selectedUnitLabel = unitOptions.find((u) => u.value === unit)?.label;
    const markerPosition: LatLngExpression | null = lat != null && lon != null ? [lat, lon] : null;

    return (
        <div className={styles['upload-form-container']}>
            <form onSubmit={handleSubmit}>
                <h2 style={{ color: '#0F2A1D', marginBottom: '20px' }}>
                    {listingId ? "Editează Anunțul" : "Publică un Anunț Nou"}
                </h2>

                {submitError && <div className={styles['form-error']}>{submitError}</div>}
                {submitSuccess && (
                    <div className={styles['form-success']}>
                        {listingId ? "Anunțul a fost actualizat!" : "Anunțul a fost publicat!"}
                    </div>
                )}

                {/* FOTO - Existing + New */}
                <div className={`${styles['form-section']} ${styles['photo-upload-section']}`}>
                    <label className={styles['photo-upload-label']}>FOTOGRAFII</label>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="photo-upload" style={{ cursor: 'pointer', color: '#16a34a', fontWeight: 'bold' }}>
                            + Adaugă poze noi
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

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "10px",
                        marginTop: "5px"
                    }}>
                        {/* Existing Images */}
                        {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} style={{ position: "relative" }}>
                                <img
                                    src={toAbsoluteUrl(url) || ""}
                                    alt="Existing"
                                    style={{
                                        width: "100%",
                                        height: "100px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        border: "2px solid #aec3b0"
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(url)}
                                    style={{
                                        position: "absolute",
                                        top: "5px", right: "5px",
                                        background: "red", color: "white",
                                        border: "none", borderRadius: "50%",
                                        width: "20px", height: "20px",
                                        cursor: "pointer", display: "flex",
                                        alignItems: "center", justifyContent: "center"
                                    }}
                                >×</button>
                            </div>
                        ))}

                        {/* New Previews */}
                        {photoPreviews.map((preview, index) => (
                            <div key={`new-${index}`} style={{ position: "relative" }}>
                                <img
                                    src={preview}
                                    alt={`New ${index}`}
                                    style={{
                                        width: "100%", height: "100px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        border: "2px dashed #16a34a"
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    style={{
                                        position: "absolute",
                                        top: "5px", right: "5px",
                                        background: "rgba(0,0,0,0.7)", color: "white",
                                        border: "none", borderRadius: "50%",
                                        width: "20px", height: "20px",
                                        cursor: "pointer", display: "flex",
                                        alignItems: "center", justifyContent: "center"
                                    }}
                                >×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CATEGORIE */}
                <div className={`${styles['form-section']} ${styles['category-select-wrapper']}`} ref={categoryDropdownRef}>
                    <label>Categorie</label>
                    <div
                        className={styles['category-select-display']}
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    >
                        <span className={`${styles['category-display-text']} ${!category ? styles['placeholder'] : ""}`}>
                            {selectedCategoryLabel || "Selectează o categorie"}
                        </span>
                        <span className={styles['dropdown-arrow']}>▼</span>
                    </div>
                    {isCategoryDropdownOpen && (
                        <div className={styles['category-select-dropdown']}>
                            {categories.map((cat) => (
                                <div
                                    key={cat.value}
                                    className={`${styles['category-select-option']} ${category === cat.value ? styles['selected'] : ""}`}
                                    onClick={() => { setCategory(cat.value); setIsCategoryDropdownOpen(false); }}
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
                        placeholder="Ex: Mere Idared"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* DESCRIERE */}
                <div className={styles['form-section']}>
                    <label>Descriere</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* UNITATE */}
                <div className={`${styles['form-section']} ${styles['category-select-wrapper']}`} ref={unitDropdownRef}>
                    <label>Unitate de măsură</label>
                    <div
                        className={styles['category-select-display']}
                        onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
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
                                    className={`${styles['category-select-option']} ${unit === u.value ? styles['selected'] : ""}`}
                                    onClick={() => { setUnit(u.value); setIsUnitDropdownOpen(false); }}
                                >
                                    {u.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PREȚ */}
                <div className={styles['form-section']}>
                    <label>Preț (RON)</label>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                {/* MAP */}
                <div className={styles['form-section']}>
                    <label>Locație</label>
                    <div className={styles['location-search-row']} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={cityQuery}
                            onChange={(e) => setCityQuery(e.target.value)}
                            placeholder="Caută oraș..."
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <button type="button" onClick={handleCitySearch} style={{ padding: '8px 16px', borderRadius: '6px', background: '#aec3b0', border: 'none', cursor: 'pointer' }}>Caută</button>
                    </div>
                    <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={11}
                            scrollWheelZoom={false}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; OSM'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapCenterUpdater center={mapCenter} />
                            <LocationMarker position={markerPosition} onSelect={handleMapSelect} />
                        </MapContainer>
                    </div>
                    {lat && lon && <small>Lat: {lat.toFixed(4)}, Lon: {lon.toFixed(4)}</small>}
                </div>

                <button type="submit" className={styles['submit-product-btn']} disabled={submitting}>
                    {submitting ? "Se salvează..." : (listingId ? "Actualizează Anunțul" : "Publică Anunțul")}
                </button>
            </form>
        </div>
    );
};

export default UploadProduct;
