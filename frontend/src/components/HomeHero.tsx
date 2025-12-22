import React, { useState, useEffect, useRef } from 'react';
import styles from '../pages/homepage/Home.module.css';

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

const LocationIcon = () => (
    <svg className={styles['county-option-icon']} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

interface CountySelectProps {
    selectedCounty: string;
    onSelectCounty: (county: string) => void;
    className?: string;
}

const CountySelect: React.FC<CountySelectProps> = ({
                                                       selectedCounty,
                                                       onSelectCounty,
                                                       className = '',
                                                   }) => {
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

    // 🔍 FILTRARE DUPĂ CE SCRIE USERUL
    const filteredCounties = ROMANIAN_COUNTIES.filter((county) =>
        county.toLowerCase().includes(selectedCounty.toLowerCase())
    );

    const handleSelect = (county: string) => {
        onSelectCounty(county);
        setIsOpen(false);
    };

    return (
        <div className={`${styles['county-select-wrapper']} ${className}`} ref={wrapperRef}>
            <div
                className={`${styles['county-select-display']} ${!selectedCounty ? styles['placeholder'] : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >

                <div className={styles['county-display-content']}>
                    <LocationIcon />
                    <input
                        type="text"
                        value={selectedCounty}
                        placeholder="Judet"
                        onChange={(e) => {
                            onSelectCounty(e.target.value);
                            setIsOpen(true);
                        }}
                        className={styles['county-input']}
                    />
                </div>
                <span
                    className={styles['dropdown-arrow']}
                    onClick={(e) => {
                        e.stopPropagation(); // 🔴 FOARTE IMPORTANT
                        setIsOpen((prev) => !prev);
                    }}
                >
                ▼
                </span>
            </div>
            {/* 🔽 SUGESTII FILTRATE */}
            {isOpen && filteredCounties.length > 0 && (
                <div className={styles['county-select-dropdown']}>
                    {filteredCounties.map((county) => (
                        <div
                            key={county}
                            className={`${styles['county-select-option']} ${selectedCounty === county ? styles['selected'] : ''}`}
                            onClick={() => handleSelect(county)}
                        >
                            <LocationIcon />
                            <span className={styles['county-option-text']}>{county}</span>
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
            <section
                className={styles['hero-full-width']}
                style={heroStyle}
            >
                <div className={styles['hero-content-wrapper']}>
                    <div className={styles['hero-decorative-image']}>
                        <img
                            src="/logo.png"
                            alt="Logo BioBuy"
                            className={styles['hero-logo-image']}
                        />
                    </div>

                    <div className={styles['hero-main-content']}>
                        <h1 className={`${styles['search-title']} ${styles['glovo-inspired-title']}`}>Livrare de produse proaspete și locale</h1>
                        <p className={`${styles['search-subtitle']} ${styles['glovo-inspired-subtitle']}`}>
                            Direct de la fermieri și producători locali
                        </p>

                        <form id="hero-search-form" onSubmit={handleSubmit} className={styles['search-form-inline']}>
                            <input
                                type="text"
                                placeholder="Ce produse locale cauți?"
                                value={productQuery}
                                onChange={(e) => setProductQuery(e.target.value)}
                                aria-label="Câmp de căutare produs"
                                className={styles['glovo-input']}
                            />

                            <CountySelect
                                selectedCounty={selectedCounty}
                                onSelectCounty={setSelectedCounty}
                                className={styles['hero-county-select']}
                            />

                            <button
                                type="submit"
                                className={`${styles['cta-button']} ${styles['glovo-button']}`}
                                disabled={isSearchDisabled}
                                style={{ backgroundColor: COLORS.MEDIUM_GREEN }}
                            >Căutare
                            </button>
                        </form>
                    </div>
                </div>

                <svg className={styles['wave-separator']} viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path fill="#FFFFFF" d="M0,64L48,64C96,64,192,64,288,58.7C384,53,480,43,576,42.7C672,43,768,53,864,53.3C960,53,1056,43,1152,48C1248,53,1344,64,1392,69.3L1440,75L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
                </svg>
            </section>

            <div className={styles['after-hero-section']} style={{
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
                <div className={styles['feature-item']}>
                    <img src="1.jpg" alt="Restaurante locale" className={styles['feature-image']} />
                    <h3 className={styles['feature-title']}>Produse proaspete</h3>
                    <p className={styles['feature-text']}>
                        Sprijină fermierii din zona ta și bucură-te de ingrediente proaspete,găsește <mark>cei mai buni producători din apropiere!</mark>!
                    </p>
                </div>
                <div className={styles['feature-item']}>
                    <img src="2.jpg" alt="Livrare rapidă" className={styles['feature-image']} />
                    <h3 className={styles['feature-title']}>Livrare rapidă</h3>
                    <p className={styles['feature-text']}>
                        Ca un fulger! Comandă sau trimite orice în orașul tău și <mark>livrăm în câteva minute</mark>.
                    </p>
                </div>
                <div className={styles['feature-item']}>
                    <img src="3.jpg" alt="Plin de gust, plin de vitamine" className={styles['feature-image']} />
                    <h3 className={styles['feature-title']}>Mănâncă sănătos</h3>
                    <p className={styles['feature-text']}>
                        Alege un stil de viață echilibrat cu <mark>ingrediente proaspete, pline de gust.</mark>.
                    </p>
                </div>
                <svg className={styles['wave-separator-bottom']} viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path fill={COLORS.ACCENT_GREEN} d="M0,64L48,64C96,64,192,64,288,58.7C384,53,480,43,576,42.7C672,43,768,53,864,53.3C960,53,1056,43,1152,48C1248,53,1344,64,1392,69.3L1440,75L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
                </svg>
            </div>


            <section className={styles['city-promo-section']} style={{ backgroundColor: COLORS.ACCENT_GREEN }}>
                <div className={styles['city-promo-content']}>

                    <img src="/4.png" alt="Misiunea Noastra Simbol" style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '1.5rem', display: 'block', margin: '0 auto' }} />

                    <h2 className={styles['city-promo-title']}>Misiunea Noastra</h2>

                    <p className={styles['feature-text']} style={{ color: COLORS.DARK_GREEN, marginBottom: '1.5rem', textAlign: 'justify' }}>
                        Misiunea noastră este de a redefini experiența organică, aducând beneficiile sănătății și sustenabilității direct în casa ta.
                    </p>
                    <p className={styles['feature-text']} style={{ color: COLORS.DARK_GREEN, marginBottom: '1.5rem', textAlign: 'justify' }}>
                        În centrul viziunii noastre se află dedicarea de a-ți oferi o selecție de produse organice de înaltă calitate, care susțin un stil de viață conștient.
                    </p>
                    <p className={styles['feature-text']} style={{ color: COLORS.DARK_GREEN, marginBottom: '1.5rem', textAlign: 'justify' }}>
                        Suntem angajați să fim mai mult decât un magazin: suntem puntea ta de legătură cu sursa. Am eliminat intermediarii pentru a garanta că fiecare produs ajunge la tine proaspăt, direct de la producătorii locali care împărtășesc valorile noastre: respect pentru natură și pasiune pentru calitate.
                    </p>
                    <p className={styles['feature-text']} style={{ color: COLORS.DARK_GREEN, textAlign: 'justify' }}>
                        Prin încurajarea consumului de alimente bio și sprijinirea practicilor ecologice, platforma noastră promovează sănătatea ta și vitalitatea mediului înconjurător.
                    </p>
                </div>
                <svg className={styles['wave-separator-footer']} viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path fill={COLORS.DARK_GREEN}
                        d="M0,64L48,64C96,64,192,64,288,58.7C384,53,480,43,576,42.7C672,43,768,53,864,53.3C960,53,1056,43,1152,48C1248,53,1344,64,1392,69.3L1440,75L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
                </svg>
            </section>

            <footer className={styles['site-footer']} style={{ backgroundColor: COLORS.DARK_GREEN }}>
                <div className={styles['footer-content']}>
                    <div className={styles['footer-links']}>
                        <a href="/privacy">Politica de confidențialitate</a>
                        <a href="/cookies">Politica de cookies</a>
                        <a href="/terms">Termeni și servicii</a>
                        <a href="/allergens">Alergeni și valori</a>
                        <a href="/contact">Contact</a>
                        <a href="/regulations">Regulamente</a>
                    </div>
                    <hr className={styles['footer-divider']} />
                    <div className={styles['footer-middle']}>
                        <h3 className={styles['footer-logo']}>BioBuy</h3>
                        <div className={styles['footer-socials']}>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YT</a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">TT</a>
                        </div>
                    </div>
                    <hr className={styles['footer-divider']} />
                    <div className={styles['footer-bottom']}>
                        <p className={styles['footer-copyright']}>
                            TM & Copyright 2025 BioBuy Corporation. Toate drepturile rezervate.
                        </p>
                        <button className={styles['cookie-preferences-btn']}>
                            Preferințe Cookie
                        </button>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default HomeHero;