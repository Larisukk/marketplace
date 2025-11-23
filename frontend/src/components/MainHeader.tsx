import React, { useState } from 'react';
import '../header/MainHeader.css';
const COLORS = {
    DARK_GREEN: '#0F2A1D',
    ACCENT_GREEN: '#AEC3B0',
    MEDIUM_GREEN: '#375534',
};
const MainHeader: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header
                className="main-header"
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

            </header>
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

export default MainHeader;