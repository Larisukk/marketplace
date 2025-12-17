import React, { useState } from "react";
import "./BurgerMenu.css";
import {useAuth} from "@/context/AuthContext";

export default function BurgerMenu() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    return (
        <>
            {/* 🔔 LOGIN REQUIRED POPUP */}
            {showLoginPopup && (
                <div className="login-required-overlay">
                    <div className="login-required-popup">
                        <h2>Trebuie să fii conectat</h2>
                        <p>Conectează-te pentru a accesa această funcție.</p>

                        <div className="login-required-buttons">
                            <button
                                className="login-required-confirm"
                                onClick={() => (window.location.href = "/auth")}
                            >
                                Conectează-te
                            </button>

                            <button
                                className="login-required-cancel"
                                onClick={() => setShowLoginPopup(false)}
                            >
                                Anulează
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* BUTON BURGER */}
            <button
                className="menu-icon-btn"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
            >
                ☰
            </button>

            {/* MENU */}
            <nav className={`vertical-menu ${open ? "open" : ""}`}>
                <div className="menu-header">
                    <span className="menu-title">Meniu</span>
                    <button className="close-menu-btn" onClick={() => setOpen(false)}>
                        &times;
                    </button>
                </div>

                <div className="menu-links">
                    <a href="/home" className="menu-link">Acasă</a>
                    <div
                        className="menu-link"
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/profile";
                        }}
                    >
                        Profilul meu
                    </div>
                    <a href="/map" className="menu-link">Produse</a>

                    <div
                        className="menu-link"
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/upload";
                        }}
                    >
                        Vinde un produs
                    </div>
                </div>
            </nav>

            {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}
        </>
    );
}
