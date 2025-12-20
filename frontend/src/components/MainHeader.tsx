import React, { useState } from 'react';
import styles from '../header/MainHeader.module.css';
import { useAuth } from "../context/AuthContext";

const COLORS = {
    DARK_GREEN: '#0F2A1D',
    ACCENT_GREEN: '#AEC3B0',
    MEDIUM_GREEN: '#375534',
};

const MainHeader: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header className={styles['main-header']}>
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

                    {/* PROFIL */}
                    <a href="/profile" className={styles['menu-link']}>
                        Profilul meu
                    </a>

                    {/* PRODUSE */}
                    <a href="/produse" className={styles['menu-link']}>
                        Produse
                    </a>

                    {/* Vinde un produs */}
                    <a href="/upload" className={styles['menu-link']}>
                        Vinde un produs
                    </a>
                </div>
            </nav>

            {isMenuOpen && <div className={styles['menu-overlay']} onClick={toggleMenu}></div>}
        </>
    );
};

export default MainHeader;
