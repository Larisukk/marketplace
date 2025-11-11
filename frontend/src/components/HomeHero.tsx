import React, { useState, useEffect, useRef } from 'react';

interface HomeHeroProps {
    onSearch: (product: string, county: string) => void;
}

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


const COLORS = {
    DARK_GREEN: '#0F2A1D',
    MEDIUM_GREEN: '#375534',
    ACCENT_GREEN: '#AEC3B0',
    LIGHT_GREEN: '#E3EED4',
};

const heroStyle: React.CSSProperties = {
    backgroundColor: COLORS.ACCENT_GREEN,
};

const HomeHero: React.FC<HomeHeroProps> = ({ onSearch }) => {
    const [productQuery, setProductQuery] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (productQuery.trim() || selectedCounty) {
            onSearch(productQuery.trim(), selectedCounty);
        }
    };

    const isSearchDisabled = !productQuery.trim() && !selectedCounty;

    return (
        <>
            {/* START: Hero Section */}
            <section
                className="hero-full-width"
                style={heroStyle}
            >
                <div className="hero-content-wrapper">
                    <div className="hero-decorative-image">
                        <img
                            src="/logo.png"
                            alt="Logo BioBuy"
                            className="hero-logo-image"
                        />
                    </div>

                    <div className="hero-main-content">
                        <h1 className="search-title glovo-inspired-title">Livrare de produse proaspete și locale</h1>
                        <p className="search-subtitle glovo-inspired-subtitle">
                            Direct de la fermieri și producători locali
                        </p>

                        <form id="hero-search-form" onSubmit={handleSubmit} className="search-form-inline">
                            <input
                                type="text"
                                placeholder="Ce produse locale cauți?"
                                value={productQuery}
                                onChange={(e) => setProductQuery(e.target.value)}
                                aria-label="Câmp de căutare produs"
                                className="glovo-input"
                            />

                            {/* MODIFICAT: Folosim noua clasă de context */}
                            <CountySelect
                                selectedCounty={selectedCounty}
                                onSelectCounty={setSelectedCounty}
                                className="hero-county-select"
                            />

                            <button
                                type="submit"
                                className="cta-button glovo-button"
                                disabled={isSearchDisabled}
                                style={{ backgroundColor: COLORS.MEDIUM_GREEN }}
                            >Căutare
                            </button>
                        </form>
                    </div>
                </div>

                <svg className="wave-separator" viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path fill="#FFFFFF" d="M0,64L48,64C96,64,192,64,288,58.7C384,53,480,43,576,42.7C672,43,768,53,864,53.3C960,53,1056,43,1152,48C1248,53,1344,64,1392,69.3L1440,75L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
                </svg>
            </section>
            {/* END: Hero Section */}

            {/* Restul componentei HomeHero (secțiunile de sub, footer, etc.) rămân neschimbate */}
            {/* ... (codul .after-hero-section, .city-promo-section, etc.) ... */}
            <div className="after-hero-section" style={{
                color: COLORS.DARK_GREEN,
                marginTop: '0',
                padding: '60px 20px 180px 20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '40px',
                flexWrap: 'wrap',
                position: 'relative',
            }}>
                <div className="feature-item">
                    <img src="1.jpg" alt="Restaurante locale" className="feature-image" />
                    <h3 className="feature-title">Produse proaspete</h3>
                    <p className="feature-text">
                        Sprijină fermierii din zona ta și bucură-te de ingrediente proaspete,găsește <mark>cei mai buni producători din apropiere!</mark>!
                    </p>
                </div>
                <div className="feature-item">
                    <img src="2.jpg" alt="Livrare rapidă" className="feature-image" />
                    <h3 className="feature-title">Livrare rapidă</h3>
                    <p className="feature-text">
                        Ca un fulger! Comandă sau trimite orice în orașul tău și <mark>livrăm în câteva minute</mark>.
                    </p>
                </div>
                <div className="feature-item">
                    <img src="3.jpg" alt="Plin de gust, plin de vitamine" className="feature-image" />
                    <h3 className="feature-title">Mănâncă sănătos</h3>
                    <p className="feature-text">
                        Alege un stil de viață echilibrat cu <mark>ingrediente proaspete, pline de gust.</mark>.
                    </p>
                </div>
                <svg className="wave-separator-bottom" viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path fill={COLORS.ACCENT_GREEN} d="M0,64L48,64C96,64,192,64,288,58.7C384,53,480,43,576,42.7C672,43,768,53,864,53.3C960,53,1056,43,1152,48C1248,53,1344,64,1392,69.3L1440,75L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
                </svg>
            </div>
            <section className="city-promo-section" style={{ backgroundColor: COLORS.ACCENT_GREEN }}>
                <div className="city-promo-content">
                    <h2 className="city-promo-title">Cele mai mari orașe din România</h2>
                    <div className="city-buttons-grid">
                        <button className="city-button">București</button>
                        <button className="city-button">Cluj-Napoca</button>
                        <button className="city-button">Constanța</button>
                        <button className="city-button">Iași</button>
                        <button className="city-button">Brașov</button>
                        <button className="city-button">Timișoara</button>
                        <button className="city-button">Craiova</button>
                        <button className="city-button">Oradea</button>
                        <button className="city-button">Ploiești</button>
                        <button className="city-button">Sibiu</button>
                    </div>
                </div>
            </section>
            <section
                className="featured-categories-section"
                style={{ backgroundColor: COLORS.ACCENT_GREEN, position: 'relative' }}
            >
                <h2 className="featured-categories-title">Categorii vedetă</h2>
                <div className="category-buttons-container">
                    <button className="city-button">Pizza</button>
                    <button className="city-button">Sushi</button>
                    <button className="city-button">Flori</button>
                    <button className="city-button">Burgeri</button>
                    <button className="city-button">Fructe de mare</button>
                    <button className="city-button">Mici</button>
                    <button className="city-button">Cadouri</button>
                </div>
                <button className="category-button-all">Toate categoriile</button>
                <svg className="wave-separator-footer" viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path fill={COLORS.DARK_GREEN} d="M0,64L48,64C96,64,192,64,288,58.7C384,53,480,43,576,42.7C672,43,768,53,864,53.3C960,53,1056,43,1152,48C1248,53,1344,64,1392,69.3L1440,75L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
                </svg>
            </section>
            <footer className="site-footer" style={{ backgroundColor: COLORS.DARK_GREEN }}>
                <div className="footer-content">
                    <div className="footer-links">
                        <a href="/privacy">Politica de confidențialitate</a>
                        <a href="/cookies">Politica de cookies</a>
                        <a href="/terms">Termeni și servicii</a>
                        <a href="/allergens">Alergeni și valori</a>
                        <a href="/contact">Contact</a>
                        <a href="/regulations">Regulamente</a>
                    </div>
                    <hr className="footer-divider" />
                    <div className="footer-middle">
                        <h3 className="footer-logo">BioBuy</h3>
                        <div className="footer-socials">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YT</a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">TT</a>
                        </div>
                    </div>
                    <hr className="footer-divider" />
                    <div className="footer-bottom">
                        <p className="footer-copyright">
                            TM & Copyright 2025 BioBuy Corporation. Toate drepturile rezervate.
                        </p>
                        <button className="cookie-preferences-btn">
                            Preferințe Cookie
                        </button>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default HomeHero;