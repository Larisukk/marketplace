import React, { useState, useEffect, useRef } from 'react';

const COLORS = {
    DARK_GREEN: '#0F2A1D',
    ACCENT_GREEN: '#AEC3B0',
    MEDIUM_GREEN: '#375534',
};

// NOU: Lista de județe
const ROMANIAN_COUNTIES = [
    "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
    "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
    "Cluj", "Constanța", "Covasța", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
    "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
    "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
    "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui",
    "Vrancea"
];

// NOU: Iconița de locație (SVG inline)
const LocationIcon = () => (
    <svg className="county-option-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

// NOU: Componenta reutilizabilă pentru dropdown (v2)
interface CountySelectProps {
    selectedCounty: string;
    onSelectCounty: (county: string) => void;
    className?: string; // Pentru a adăuga clase specifice contextului
}

const CountySelect: React.FC<CountySelectProps> = ({ selectedCounty, onSelectCounty, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Efect pentru a închide dropdown-ul dacă se dă clic în afara lui
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

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
                {/* NOU: Conținutul afișat are iconiță */}
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
                            {/* NOU: Opțiunile au iconiță */}
                            <LocationIcon />
                            <span className="county-option-text">{county}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// Componenta principală Header
const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const heroSearchRef = useRef<HTMLElement | null>(null);

    const [headerCounty, setHeaderCounty] = useState('');

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
            <header
                ref={headerRef}
                className={`main-header ${isSearchVisible ? 'search-visible' : ''}`}
                style={{
                    backgroundColor: COLORS.ACCENT_GREEN
                }}
            >
                <div className="header-top-row">
                    <div className="left-group">
                        <button className="menu-icon-btn" aria-label="Open menu" style={{ color: COLORS.DARK_GREEN }} onClick={toggleMenu}>
                            <span className="icon">☰</span>
                        </button>
                    </div>
                    <div className="icon-links">
                        <a href="/login" className="login-button" aria-label="Conectare sau Autentificare">
                            <img src="/profile.png" alt="Pictogramă profil" className="icon" />
                            Conectare
                        </a>
                    </div>
                </div>

                <nav className="main-nav">
                    <div className="header-search-bar">
                        <input type="text" placeholder="Ce produse locale cauți?" />
                        <span className="divider"></span>

                        {/* MODIFICAT: Folosim noua clasă de context */}
                        <CountySelect
                            selectedCounty={headerCounty}
                            onSelectCounty={setHeaderCounty}
                            className="header-location-select"
                        />

                        <span className="divider"></span>
                        <button className="search-button">Căutare</button>
                    </div>
                </nav>
            </header>

            {/* Meniul vertical și Overlay (nemodificate) */}
            <nav
                className={`vertical-menu ${isMenuOpen ? 'open' : ''}`}
                style={{ backgroundColor: COLORS.ACCENT_GREEN }}
            >
                <div className="menu-header">
                    <span className="menu-title">Meniu</span>
                    <button className="close-menu-btn" aria-label="Close menu" onClick={toggleMenu}>
                        &times;
                    </button>
                </div>
                <div className="menu-links">
                    <a href="/profil" className="menu-link">Profilul meu</a>
                    <a href="/produse" className="menu-link">Produse</a>
                </div>
            </nav>

            {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
        </>
    );
};

export default Header;