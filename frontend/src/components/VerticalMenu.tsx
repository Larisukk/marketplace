import React, {useState} from "react";
import styles from "../header/MainHeader.module.css";
import { useAuth } from "@/context/AuthContext";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function VerticalMenu({ open, onClose }: Props) {
    const { user } = useAuth();
    const [showLoginPopup, setShowLoginPopup] = useState(false);

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

            <nav className={`${styles["vertical-menu"]} ${open ? styles["open"] : ""}`}>
                <div className={styles["menu-header"]}>
                    <span className={styles["menu-title"]}>Meniu</span>
                    <button className={styles["close-menu-btn"]} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className={styles["menu-links"]}>
                    <a href="/home" className={styles['menu-link']}>Acasă</a>
                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            if (!user) setShowLoginPopup(true);
                            else window.location.href = "/profile";
                        }}
                    >
                        Profilul meu
                    </div>

                    <div
                        className={styles['menu-link']}
                        onClick={() => {
                            window.location.href = "/map";
                        }}
                    >
                        Harta
                    </div>


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

            {open && <div className={styles["menu-overlay"]} onClick={onClose} />}
        </>
    );
}
