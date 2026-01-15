import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import { useAuth } from "../../context/AuthContext";
import { searchListings } from "../../services/searchApi";
import { toAbsoluteUrl } from "../../services/api";
import type { ListingCardDto } from "../../types/search";
import styles from "./MyListings.module.css";

export default function MyListingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState<ListingCardDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Fetch my listings
        // Assuming searchListings handles farmerId param now
        searchListings({ farmerId: user.id as any, size: 100 }) // 'as any' if types aren't strictly updated in IDE yet
            .then((data) => {
                setListings(data.items);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load my listings", err);
                setError("Nu s-au putut încărca anunțurile.");
                setLoading(false);
            });
    }, [user]);

    if (!user) {
        return (
            <div className={styles['myListings-layout']}>
                <MainHeader />
                <div className={styles['myListings-container']}>
                    <p className={styles['empty-state']}>
                        Trebuie să fii conectat pentru a vedea anunțurile tale. <Link to="/auth">Conectează-te</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['myListings-layout']}>
            <MainHeader />
            <div className={styles['myListings-container']}>
                <h1 className={styles['myListings-title']}>Anunțurile mele</h1>

                {loading && <div className={styles['loading']}>Se încarcă...</div>}

                {error && <div className={styles['empty-state']} style={{ color: 'red' }}>{error}</div>}

                {!loading && !error && listings.length === 0 && (
                    <div className={styles['empty-state']}>
                        Nu ai publicat niciun anunț încă. <br />
                        <Link to="/upload" style={{ color: '#16a34a', fontWeight: 'bold' }}>Vinde un produs</Link>
                    </div>
                )}

                <div className={styles['myListings-grid']}>
                    {listings.map((l) => {
                        const best = (l.images?.length ? l.images[0].url : null) ?? l.thumbnailUrl ?? null;
                        const imgUrl = toAbsoluteUrl(best) ?? "/placeholder.jpg";

                        return (
                            <div key={l.id} className={styles['listing-card']}>
                                <div className={styles['card-thumb']}>
                                    <img
                                        src={imgUrl}
                                        alt={l.title}
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.jpg";
                                        }}
                                    />
                                </div>
                                <div className={styles['card-content']}>
                                    <h3 className={styles['card-title']}>{l.title}</h3>
                                    <div className={styles['card-price']}>
                                        {(l.priceCents != null ? l.priceCents / 100 : 0).toFixed(0)} {l.currency}
                                    </div>

                                    <div className={styles['card-actions']}>
                                        <button
                                            className={styles['view-btn']}
                                            onClick={() => navigate(`/listings/${l.id}`)}
                                        >
                                            Vezi
                                        </button>
                                        <button
                                            className={styles['edit-btn']}
                                            onClick={() => navigate(`/my-listings/edit/${l.id}`)}
                                        >
                                            Editează
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
