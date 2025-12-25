import styles from "./LegalPage.module.css";
import { NavLink, useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className={styles.legalPage}>
        {/* Breadcrumb */}
            <div className={styles.legalBreadcrumb}>
            <span>BioBuy</span> › <span>Informații utile</span>
            </div>

            <h1 className={styles.legalTitle}>Politica de confidențialitate</h1>

            <div className={styles.legalLayout}>
            {/* LEFT MENU */}
                <aside className={styles.legalSidebar}>
                    <button className={styles.backBtn}
                    onClick={() => navigate("/auth")}
                    >
                        ← Înapoi
                    </button>

                    <ul>
                        <li>
                            <NavLink
                                to="/privacy"
                                className={({ isActive }) =>
                                    isActive ? styles.active : undefined
                                }
                            >
                                Politica de confidențialitate
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/terms"
                                className={({ isActive }) =>
                                    isActive ? styles.active : undefined
                                }

                            >
                                Termene și condiții
                            </NavLink>
                        </li>
                    </ul>
                </aside>

                {/* MAIN CONTENT */}
                <main className={styles.legalContent}>
                <section>
                        <h2>1. Ce date colectăm</h2>
                        <ul>
                            <li>Date de identificare (nume, email)</li>
                            <li>Date de autentificare și securitate</li>
                            <li>Informații despre utilizarea platformei</li>
                            <li>Locația selectată (județ)</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Cum folosim datele</h2>
                        <ul>
                            <li>Crearea și administrarea contului</li>
                            <li>Procesarea comenzilor</li>
                            <li>Îmbunătățirea experienței utilizatorului</li>
                            <li>Respectarea obligațiilor legale</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Stocarea și securitatea datelor</h2>
                        <p>
                            Datele sunt stocate în condiții de siguranță, folosind măsuri
                            tehnice și organizatorice adecvate.
                        </p>
                    </section>

                    <section>
                        <h2>4. Drepturile tale</h2>
                        <ul>
                            <li>Dreptul de acces</li>
                            <li>Dreptul de rectificare</li>
                            <li>Dreptul de ștergere</li>
                            <li>Dreptul de restricționare a prelucrării</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Contact</h2>
                        <p>
                            Ne poți contacta la: <strong>privacy@biobuy.ro</strong>
                        </p>
                    </section>

                    <p className={styles.legalFooter}>
                    Ultima actualizare: decembrie 2025
                    </p>
                </main>

                {/* QUICK ACTIONS */}
                <aside className={styles.legalActions}>
                <h3>Quick actions</h3>
                    <button onClick={() => navigate("/support")}>Contact suport</button>
                </aside>
            </div>
        </div>
    );
}
