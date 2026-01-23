import React, { useState, useEffect } from 'react';
import styles from '../header/MainHeader.module.css';
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import CountySelect from './CountySelect';
import { COUNTY_BBOX } from '../utils/counties';

const COLORS = {
    DARK_GREEN: '#0F2A1D',
    ACCENT_GREEN: '#AEC3B0',
    MEDIUM_GREEN: '#375534',
};

const MainHeader: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isUploadPage = location.pathname === "/upload";
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    // Search state
    const [scrolled, setScrolled] = useState(false);
    const [productQuery, setProductQuery] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            // Show search bar after scrolling 400px (past hero)
            if (window.scrollY > 400) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (productQuery.trim()) params.set("q", productQuery.trim());
        if (selectedCounty) params.set("county", selectedCounty);
        navigate(`/map?${params.toString()}`);
    };

    // Show search if scrolled on home, OR (optional) always on non-home/map? 
    // Requirement: "on the homepage... scroll down".
    const showSearch = (location.pathname === '/home' || location.pathname === '/') && scrolled;

    // Add 'search-visible' class to header if valid
    const headerClass = `${styles['main-header']} ${showSearch ? styles['search-visible'] : ''}`;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {showLoginPopup && (
                <div className={styles['login-required-overlay']}>
                    <div className={styles['login-required-popup']}>
                        <h2>Trebuie să fii conectat</h2>
                        <p>Conectează-te pentru a accesa această funcție.</p>

                        <div className={styles['login-required-buttons']}>
                            <button
                                className={styles['login-required-confirm']}
                                onClick={() => (window.location.href = "/auth")}
                            >
                                Conectează-te
                            </button>

                            <button
                                className={styles['login-required-cancel']}
                                onClick={() => setShowLoginPopup(false)}
                            >
                                Anulează
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <header className={headerClass}>
                <div className={styles['header-top-row']}>
                    <div className={styles['left-group']}>
                        <button
                            className={styles['menu-icon-btn']}
                            aria-label="Open menu"
                            style={{ color: COLORS.DARK_GREEN }}
                            onClick={toggleMenu}
                        >
                            <span className={styles['icon']}>☰</span>
                        </button>

                        <a href="/home" className={styles['logo-link']}>
                            <img src="/biobuy-logo.png" alt="BioBuy" className={styles['logo-img']} />
                        </a>
                    </div>

                    {/* HEADER SEARCH BAR (Hidden by default, visible via CSS based on parent class) */}
                    <div className={styles['main-nav']}>
                        <form onSubmit={handleSearch} className={styles['header-search-bar']}>
                            <input
                                type="text"
                                placeholder="Caută produse..."
                                value={productQuery}
                                onChange={(e) => setProductQuery(e.target.value)}
                            />
                            <div className={styles['divider']}></div>
                            <CountySelect
                                counties={Object.keys(COUNTY_BBOX)}
                                selectedCounty={selectedCounty}
                                onSelectCounty={setSelectedCounty}
                                className={styles['header-location-select']}
                            />
                            <button type="submit" className={styles['search-button']}>
                                🔍
                            </button>
                        </form>
                    </div>

                    <div className={styles['icon-links']}>
                        {!user && (
                            <a href="/auth" className={styles['login-button']} aria-label="Conectare sau Autentificare">
                                <img src="/profile.png" alt="Pictogramă profil" className={styles['icon']} />
                                Conectare
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <nav
                className={`${styles['vertical-menu']} ${isMenuOpen ? styles['open'] : ''}`}
                style={{ backgroundColor: COLORS.ACCENT_GREEN }}
            >
                <div className={styles['menu-header']}>
                    <span className={styles['menu-title']}>Meniu</span>
                    <button className={styles['close-menu-btn']} aria-label="Close menu" onClick={toggleMenu}>
                        &times;
                    </button>
                </div>

                <div className={styles['menu-links']}>

                    <a href="/home" className={styles['menu-link']}>
                        Acasa
                    </a>

                    {/* PROFIL */}
                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/profile";
                        }}
                    >
                        Profilul meu
                    </div>

                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            window.location.href = "/map";
                        }}
                    >
                        Harta
                    </div>

                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/my-listings";
                        }}
                    >
                        Anunțurile mele
                    </div>

                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/chat";
                        }}
                    >
                        Conversatiile mele
                    </div>


                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/upload";
                        }}
                    >
                        Vinde un produs
                    </div>

                    {user?.role === 'ADMIN' && (
                        <div
                            className={styles['menu-link']}
                            onClick={() => {
                                window.location.href = "/admin";
                            }}
                            style={{ color: '#cc0000', fontWeight: 'bold' }}
                        >
                            Admin Dashboard
                        </div>
                    )}
                </div>
            </nav>

            {isMenuOpen && <div className={styles['menu-overlay']} onClick={toggleMenu}></div>}
        </>
    );
};

export default MainHeader;
