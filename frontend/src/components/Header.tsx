// src/components/Header.tsx

import React from 'react';

const COLORS = {
    DARK_GREEN: '#0F2A1D',
    LIGHT_GREEN: '#E3EED4',
    MEDIUM_GREEN: '#375534',
};

const Header: React.FC = () => {
    return (
        <header className="main-header">
            {/* START: Left Section (Menu & Logo) */}
            <div className="left-group">
                {/* Menu Icon (Hamburger) */}
                <button className="menu-icon-btn" aria-label="Open menu" style={{ color: COLORS.DARK_GREEN }}>
                    <span className="icon">☰</span>
                </button>

                {/* Logo */}
                <div className="logo">
                    <a href="/">
                        {/* CORRECTED: Using 'content.png' path */}
                        <img
                            src="/content.png"
                            alt="BioBuy Logo"
                            className="logo-image"
                        />
                    </a>
                </div>
            </div>
            {/* END: Left Section */}

            {/* START: Center/Navigation Section - Hidden via CSS */}
            <nav className="main-nav">
                {/* Future navigation links go here */}
            </nav>
            {/* END: Center Section */}

            {/* START: Right Section (Chat & Account Icons) */}
            <div className="icon-links">

                {/* Chat Icon */}
                <a href="/chat" className="nav-icon-link" aria-label="Chat" style={{ color: COLORS.DARK_GREEN }}>
                    <span className="icon">💬</span>
                </a>

                {/* Account Icon */}
                <a href="/account" className="nav-icon-link" aria-label="My Account" style={{ color: COLORS.DARK_GREEN }}>
                    <span className="icon">👤</span>
                </a>

            </div>
            {/* END: Right Section */}

        </header>
    );
};

export default Header;