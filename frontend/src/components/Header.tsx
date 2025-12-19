import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../context/AuthContext";
import styles from "../header/MainHeader.module.css";

const COLORS = {
    DARK_GREEN: '#0F2A1D',
    ACCENT_GREEN: '#AEC3B0',
    MEDIUM_GREEN: '#375534',
};

const ROMANIAN_COUNTIES = [
    "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
    "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
    "Cluj", "Constanța", "Covasța", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
    "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
    "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
    "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui",
    "Vrancea"
];

const LocationIcon = () => (
    <svg className="county-option-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

interface CountySelectProps {
    selectedCounty: string;
    onSelectCounty: (county: string) => void;
    className?: string;
}

const CountySelect: React.FC<CountySelectProps> = ({ selectedCounty, onSelectCounty, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (county: string) => {
        onSelectCounty(county);
        setIsOpen(false);
    };

    return (
        <div className={`county-select-wrapper ${className}`} ref={wrapperRef}>
            <div
                className={`county-select-display ${!selectedCounty ? 'placeholder' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="county-display-content">
                    <LocationIcon />
                    <span className="county-display-text">{selectedCounty || 'Oraș'}</span>
                </div>
                <span className="dropdown-arrow">▼</span>
            </div>

            {isOpen && (
                <div className="county-select-dropdown">
                    {ROMANIAN_COUNTIES.map(county => (
                        <div
                            key={county}
                            className={`county-select-option ${selectedCounty === county ? 'selected' : ''}`}
                            onClick={() => handleSelect(county)}
                        >
                            <LocationIcon />
                            <span className="county-option-text">{county}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Header: React.FC = () => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const heroSearchRef = useRef<HTMLElement | null>(null);
    const [headerCounty, setHeaderCounty] = useState('');
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        heroSearchRef.current = document.getElementById('hero-search-form');
    }, []);

    useEffect(() => {
        const mainHeader = headerRef.current;

        const handleScroll = () => {
            const heroSearch = heroSearchRef.current;
            if (heroSearch && mainHeader) {
                const heroRect = heroSearch.getBoundingClientRect();
                setIsSearchVisible(heroRect.top < 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

            <header
                ref={headerRef}
                className={`${styles['main-header']} ${isSearchVisible ? styles['search-visible'] : ''}`}
                style={{ backgroundColor: COLORS.ACCENT_GREEN }}
            >
                <div className={styles['header-top-row']}>
                    <div className={styles['left-group']}>
                        <button className={styles['menu-icon-btn']} aria-label="Open menu" style={{ color: COLORS.DARK_GREEN }} onClick={toggleMenu}>
                            <span className={styles['icon']}>☰</span>
                        </button>
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

                <nav className={styles['main-nav']}>
                    <div className={styles['header-search-bar']}>
                        <input type="text" placeholder="Ce produse locale cauți?" />
                        <span className={styles['divider']}></span>

                        <CountySelect
                            selectedCounty={headerCounty}
                            onSelectCounty={setHeaderCounty}
                            className={styles['header-location-select']}
                        />

                        <span className={styles['divider']}></span>
                        <button className={styles['search-button']}>Căutare</button>
                    </div>
                </nav>
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
                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/profile";
                        }}
                    >
                        Profilul meu
                    </div>

                    <a href="/produse" className={styles['menu-link']}>Produse</a>

                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/upload";
                        }}
                    >
                        Vinde un produs
                    </div>
                </div>
            </nav>

            {isMenuOpen && <div className={styles['menu-overlay']} onClick={toggleMenu}></div>}
        </>
    );
};

export default Header;
