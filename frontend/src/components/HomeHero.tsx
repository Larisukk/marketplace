// src/components/HomeHero.tsx

import React, { useState } from 'react';

interface HomeHeroProps {
    onSearch: (product: string, county: string) => void;
}

const ROMANIAN_COUNTIES = [
    "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
    "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
    "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
    "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
    "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
    "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui",
    "Vrancea"
];

const COLORS = {
    DARK_GREEN: '#0F2A1D',
    MEDIUM_GREEN: '#375534',
    ACCENT_GREEN: '#AEC3B0',
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

    return (
        <section className="hero-container">

            {/* START: Column 1 - Search Panel */}
            <div className="hero-column search-panel">
                {/* REMOVED: logo-section from here as it's now in the Header */}

                <h1 className="search-title">Găsește Producătorul Local Ideal</h1>

                <p className="search-subtitle">Începe căutarea cu un produs sau o locație pentru a vedea ofertele pe hartă.</p>

                <form onSubmit={handleSubmit} className="search-form">

                    {/* Product Search Input */}
                    <input
                        type="text"
                        placeholder="Ex: Roșii, Ouă de țară..."
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        aria-label="Câmp de căutare produs"
                    />

                    {/* County Select Input */}
                    <select
                        className="county-select"
                        value={selectedCounty}
                        onChange={(e) => setSelectedCounty(e.target.value)}
                        aria-label="Selectează județul"
                        style={{ color: selectedCounty ? COLORS.DARK_GREEN : '#888' }}
                    >
                        <option value="" disabled>-- Selectează Județul --</option>
                        {ROMANIAN_COUNTIES.map(county => (
                            <option key={county} value={county}>{county}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="cta-button"
                        disabled={!productQuery.trim() && !selectedCounty}
                        style={{ backgroundColor: COLORS.MEDIUM_GREEN }}
                    >
                        CAUTĂ PE HARTĂ
                    </button>
                </form>

            </div>
            {/* END: Column 1 */}

            {/* START: Column 2 - Slogan Panel */}
            <div className="hero-column slogan-panel" style={{ backgroundColor: COLORS.ACCENT_GREEN }}>
                <div className="slogan-content">
                    <div className="random-image-placeholder" style={{ color: COLORS.DARK_GREEN }}>
                        <span role="img" aria-label="Simbol Natură">🌱</span>
                    </div>
                    <h2 style={{ color: COLORS.DARK_GREEN }}>Alimente Autentice. Prospețime Garantată.</h2>
                    <p style={{ color: COLORS.MEDIUM_GREEN }}>Cumpără direct de la sursă, susține comunitățile locale.</p>
                </div>
            </div>
            {/* END: Column 2 */}

        </section>
    );
};

export default HomeHero;