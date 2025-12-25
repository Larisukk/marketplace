import React, { useState } from "react";
import styles from "../header/MainHeader.module.css";
import { useAuth } from "@/context/AuthContext";

export default function AuthHeader() {
    const [open, setOpen] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const { user } = useAuth();

    return (
        <>
            {/* 🔔 LOGIN REQUIRED POPUP */}
            {showLoginPopup && (
                <div className={styles["login-required-overlay"]}>
                    <div className={styles["login-required-popup"]}>
                        <h2>Trebuie să fii conectat</h2>
                        <p>Conectează-te pentru a accesa această funcție.</p>

                        <div className={styles["login-required-buttons"]}>
                            <button
                                className={styles["login-required-confirm"]}
                                onClick={() => (window.location.href = "/auth")}
                            >
                                Conectează-te
                            </button>

                            <button
                                className={styles["login-required-cancel"]}
                                onClick={() => setShowLoginPopup(false)}
                            >
                                Anulează
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className={`${styles["main-header"]} ${styles["auth-variant"]}`}>
                <div className={styles["header-top-row"]}>
                    <div className={styles["left-group"]}>
                        <button
                            className={styles["menu-icon-btn"]}
                            aria-label="Open menu"
                            onClick={() => setOpen(true)}
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </header>

            {/* MENU */}
            <nav className={`${styles["vertical-menu"]} ${open ? styles["open"] : ""}`}>
                <div className={styles["menu-header"]}>
                    <span className={styles["menu-title"]}>Meniu</span>
                    <button
                        className={styles["close-menu-btn"]}
                        onClick={() => setOpen(false)}
                    >
                        &times;
                    </button>
                </div>

                <div className={styles["menu-links"]}>
                    <a href="/home" className={styles["menu-link"]}>Acasă</a>

                    <div
                        className={styles["menu-link"]}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/profile";
                        }}
                    >
                        Profilul meu
                    </div>

                    <a href="/map" className={styles["menu-link"]}>Harta</a>

                    <div
                        className={styles["menu-link"]}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/upload";
                        }}
                    >
                        Vinde un produs
                    </div>
                </div>
            </nav>

            {open && (
                <div
                    className={styles["menu-overlay"]}
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
}
