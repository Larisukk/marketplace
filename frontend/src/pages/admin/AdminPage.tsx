import React, { useEffect, useState } from "react";
import MainHeader from "../../components/MainHeader";
import { searchListings } from "../../services/searchApi";
import { listingService } from "../../services/listings";
import { ListingCardDto } from "../../types/search";
import styles from "../mylistings/MyListings.module.css"; // Reuse styles
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../services/api";
import { adminService } from "../../services/admin";

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState<ListingCardDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'ADMIN')) {
            navigate("/");
            return;
        }
    }, [user, authLoading, navigate]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            // Fetch all (available and unavailable), large page size
            // Passing available: undefined/null to backend should return all
            const res = await searchListings({ size: 100, sort: "createdAt,desc" });
            setListings(res.items);
        } catch (e) {
            console.error(e);
            alert("Eroare la incarcarea anunturilor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchListings();
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Sigur vrei să ștergi acest anunț? Acțiunea este ireversibilă.")) return;
        try {
            await listingService.delete(id);
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (e) {
            console.error(e);
            alert("Eroare la ștergere.");
        }
    };

    const handleBan = async (userId: string) => {
        if (!window.confirm("Sigur vrei să banezi acest utilizator?")) return;
        try {
            await adminService.banUser(userId);
            alert("Utilizator banat cu succes.");
        } catch (e) {
            console.error(e);
            alert("Eroare la banare utilizator.");
        }
    };

    if (authLoading || !user || user.role !== 'ADMIN') return null;

    return (
        <div className={styles['myListings-layout']}>
            <MainHeader />
            <div className={styles['myListings-container']}>
                <h1 className={styles['myListings-title']}>Admin Dashboard - Toate Anunțurile</h1>

                {loading ? (
                    <div className={styles.loading}>Se încarcă...</div>
                ) : listings.length === 0 ? (
                    <div className={styles['empty-state']}>Nu există anunțuri în platformă.</div>
                ) : (
                    <div className={styles['myListings-grid']}>
                        {listings.map(item => (
                            <div key={item.id} className={styles['listing-card']}>
                                <div className={styles['card-thumb']}>
                                    {item.thumbnailUrl ? (
                                        <img src={toAbsoluteUrl(item.thumbnailUrl) || ""} alt={item.title} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                            Fără poză
                                        </div>
                                    )}
                                </div>
                                <div className={styles['card-content']}>
                                    <h3 className={styles['card-title']}>{item.title}</h3>
                                    <div className={styles['card-price']}>
                                        {item.priceCents ? (item.priceCents / 100).toFixed(2) : "?"} {item.currency}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                        Fermier: {item.farmerName}
                                    </div>

                                    <div className={styles['card-actions']}>
                                        <button
                                            className={styles['edit-btn']}
                                            style={{ backgroundColor: '#ffcccc', color: '#cc0000' }}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Șterge (Admin)
                                        </button>
                                        <button
                                            className={styles['edit-btn']}
                                            style={{ backgroundColor: '#333', color: '#fff', marginLeft: '0.5rem' }}
                                            onClick={() => handleBan(item.farmerUserId)}
                                        >
                                            Ban User
                                        </button>
                                        <a href={`/listings/${item.id}`} className={styles['view-btn']}>
                                            Vezi
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
