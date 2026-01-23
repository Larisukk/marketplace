// frontend/src/pages/ListingPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../hooks/useChat";
import { getListingDetails } from "@/services/searchApi";
import type { ListingCardDto } from "@/types/search";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import MainHeader from "../../components/MainHeader";
import styles from "./ListingPage.module.css";
// import "../homePage/styles.css"; // Removed

type LocationState = { state?: { sellerId?: string; autoStartChat?: boolean } };

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as LocationState;

  const { user } = useAuth();
  const { actions } = useChat();

  const hasAutoStartedRef = useRef(false);

  const [details, setDetails] = useState<ListingCardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const sellerId = location.state?.sellerId ?? (details as any)?.farmerUserId;
  const autoStartChat = location.state?.autoStartChat === true;

  // If your backend base is different, set VITE_API_BASE=http://localhost:8080 in .env
  const apiBase =
    (import.meta.env.VITE_API_BASE as string | undefined) || "http://localhost:8080";

  const resolveImageUrl = (u?: string | null): string | null => {
    if (!u) return null;

    // already absolute
    if (u.startsWith("http://") || u.startsWith("https://")) return u;

    // protocol-relative
    if (u.startsWith("//")) return window.location.protocol + u;

    // make it absolute against backend
    // ensure single slash
    if (u.startsWith("/")) return apiBase.replace(/\/$/, "") + u;
    return apiBase.replace(/\/$/, "") + "/" + u;
  };

  const tileUrl =
    import.meta.env.VITE_TILE_URL ||
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: styles['listing-page-marker'],
      html: `
        <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-10%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.45)" />
            </filter>
          </defs>
          <path
            d="M13 1C7.7 1 3.5 5.22 3.5 10.5C3.5 16.8 11.7 24.9 12.6 25.8C12.8 26 13.1 26 13.3 25.8C14.3 24.9 22.5 16.8 22.5 10.5C22.5 5.22 18.3 1 13 1Z"
            fill="#16a34a"
            filter="url(#shadow)"
          />
          <circle cx="13" cy="10.5" r="4" fill="#bbf7d0" />
        </svg>
      `,
      iconSize: [26, 36],
      iconAnchor: [13, 34],
    });
  }, []);

  // Load listing details
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await getListingDetails(id);
        if (cancelled) return;

        setDetails(data);

        const first =
          resolveImageUrl(data.thumbnailUrl) ||
          resolveImageUrl(data.images?.[0]) ||
          null;

        setActiveImageUrl(first);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Eroare la incarcare detalii produs.";
        setError(msg);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isOwner = useMemo(() => {
    const me = (user as any)?.id as string | undefined;
    if (!me) return false;
    if (!sellerId) return false;
    return String(me) === String(sellerId);
  }, [user, sellerId]);

  // Auto-start chat (not if owner)
  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    if (!user || !sellerId || !autoStartChat) return;
    if (isOwner) return;

    hasAutoStartedRef.current = true;
    void (async () => {
      try {
        const convo = await actions.startConversation(sellerId as any);
        navigate("/chat", { state: { conversationId: convo.id } });
      } catch (err) {
        console.error("Eroare la inceperea unei conversatii:", err);
      }
    })();
  }, [user, sellerId, autoStartChat, isOwner, actions, navigate]);

  const handleStartChat = async () => {
    if (!id) return;
    if (!sellerId) {
      alert("Informatiile despre vanzator nu sunt disponibile pentru acest produs.");
      return;
    }
    if (isOwner) return;

    if (!user) {
      navigate("/auth", {
        state: {
          redirectAfterLogin: `/listings/${id}`,
          sellerId,
          autoStartChat: true,
        },
      });
      return;
    }

    try {
      const convo = await actions.startConversation(sellerId as any);
      navigate("/chat", { state: { conversationId: convo.id } });
    } catch (err) {
      console.error("Eroare la inceperea unei conversatii:", err);
      alert("Eroare la pornirea unei conversatii. Incercati din nou.");
    }
  };

  const priceText = useMemo(() => {
    if (!details) return "—";
    const val = (details.priceCents / 100).toFixed(0);
    const price = `${val} ${details.currency}`;
    if (details.unit) {
      return `${price} / ${details.unit}`;
    }
    return price;
  }, [details]);

  const sellerInitial = useMemo(() => {
    const name = (details as any)?.farmerName as string | undefined;
    if (name && name.trim().length > 0) return name.trim()[0].toUpperCase();
    return sellerId ? "S" : "?";
  }, [details, sellerId]);

  const galleryUrls = useMemo(() => {
    const urls: string[] = [];

    const thumb = resolveImageUrl(details?.thumbnailUrl);
    if (thumb) urls.push(thumb);

    if (details?.images && Array.isArray(details.images)) {
      for (const img of details.images) {
        const u = resolveImageUrl(img);
        if (u && !urls.includes(u)) urls.push(u);
      }
    }
    return urls;
  }, [details]);

  const hasCoords =
    details && typeof details.lat === "number" && typeof details.lon === "number";

  return (
    <>
      <MainHeader />

      <div className={styles['listingPage']}>
        <div className={styles['listingPage-breadcrumb']}>
          <a href="/home" className={styles['breadcrumb-link']}>Acasa</a> /{" "}
          <a href="/map" className={styles['breadcrumb-link']}>Produse</a> /{" "}
          <span>{details?.title ?? "Se incarca…"}</span>
        </div>

        <header className={styles['listingPage-header']}>
          <h1 className={styles['listingPage-title']}>{details?.title ?? "Listing details"}</h1>

        </header>

        <div className={styles['listingPage-main']}>
          <section className={styles['listingPage-leftCard']}>
            <div className={styles['listingPage-image']}>
              <div className={styles['listingPage-imageBadge']}>Previzualizare produs</div>

              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt={details?.title ?? "Listing image"}
                  className={styles['listingPage-imageImg']}
                  onError={(e) => {
                    // If image fails, show placeholder instead of broken icon
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className={styles['listingPage-imagePlaceholder']}>Nicio imagine inca.</span>
              )}

              {/* if main image failed and got hidden */}
              {activeImageUrl && (
                <span className={styles['listingPage-imagePlaceholder']} style={{ display: "none" }} />
              )}
            </div>

            {galleryUrls.length > 1 && (
              <div className={styles['listingPage-thumbnails']}>
                {galleryUrls.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setActiveImageUrl(u)}
                    className={
                      styles['listingPage-thumbnail'] + (u === activeImageUrl ? ` ${styles['is-active']}` : "")
                    }
                    aria-label="Select image"
                  >
                    <img src={u} alt="Thumbnail" />
                  </button>
                ))}
              </div>
            )}

            <div className={styles['listingPage-description']}>
              <h2 className={styles['listingPage-subtitle']}>Descriere</h2>
              <p className={styles['listingPage-descriptionText']}>
                {details?.description && details.description.trim().length > 0
                  ? details.description
                  : "Vanzatorul nu a creat o descriere inca."}
              </p>
            </div>
          </section>

          <aside className={styles['listingPage-rightColumn']}>
            <div className={styles['listingPage-priceCard']}>
              <div className={styles['listingPage-priceLabel']}>Pret</div>
              <div className={styles['listingPage-priceValue']}>{priceText}</div>
              <div className={styles['listingPage-priceHint']}>
                Vorbiti cu vanzatorul pentru a stabili metoda de plata si de transport.
              </div>
            </div>

            {!isOwner ? (
              <div className={styles['listingPage-sellerCard']}>
                <div className={styles['listingPage-sellerHeader']}>
                  <div className={styles['listingPage-sellerLabel']}>Vanzator</div>

                  <div className={styles['listingPage-sellerRow']}>
                    <div className={styles['listingPage-sellerAvatar']}>{sellerInitial}</div>

                    <div>
                      <div className={styles['listingPage-sellerName']}>
                        {(details as any)?.farmerName ||
                          (sellerId ? "Contul vanzatorului" : "Vanzator necunoscut")}
                      </div>
                      <div className={styles['listingPage-sellerHint']}>
                        Intreaba despre disponibilitate, transport si detaliile produsului.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={loading || !sellerId}
                  className={styles['listingPage-chatButton'] + (loading ? ` ${styles['is-loading']}` : "")}
                >
                  <span>{user ? "Discutati cu vanzatorul" : "Conectativa pentru a discuta"}</span>
                </button>

                {!sellerId && (
                  <p className={styles['listingPage-sellerWarning']}>
                    Informatiile despre vanzator lipsesc pentru acest produs.
                  </p>
                )}
              </div>
            ) : (
              <div className={styles['listingPage-sellerCard']}>
                <div className={styles['listingPage-sellerLabel']}>Produsul tau</div>
                <div className={styles['listingPage-sellerHint']}>
                  Tu esti detinatorul acestui produs, deci nu poti porni o conversatie.
                </div>
              </div>
            )}

            {(loading || error) && (
              <div className={styles['listingPage-statusBox']}>
                {loading && !error && "Loading listing details…"}
                {error && !loading && `Error: ${error}`}
              </div>
            )}

            {hasCoords && details && (
              <section className={styles['listingPage-locationCard']}>
                <div className={styles['listingPage-locationHeader']}>
                  <h2 className={styles['listingPage-locationTitle']}>Locatia</h2>

                  <button
                    type="button"
                    onClick={() => {
                      navigate("/map", {
                        state: {
                          center: {
                            lat: details.lat,
                            lon: details.lon,
                            listingId: details.id,
                          },
                        },
                      });
                    }}
                    className={styles['listingPage-locationButton']}
                  >
                    Arata pe mapa
                  </button>
                </div>

                <div className={styles['listingPage-mapWrapper']}>
                  <MapContainer
                    center={[details.lat!, details.lon!]}
                    zoom={14}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url={tileUrl}
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[details.lat!, details.lon!]} icon={markerIcon} />
                  </MapContainer>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
