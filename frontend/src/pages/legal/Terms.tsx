import styles from "./LegalPage.module.css";
import { NavLink, useNavigate } from "react-router-dom";

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className={styles.legalPage}>
            <div className={styles.legalBreadcrumb}>
            <span>BioBuy</span> › <span>Informații utile</span>
            </div>

            <h1 className={styles.legalTitle}>Termene și condiții</h1>

            <div className={styles.legalLayout}>
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

                <main className={styles.legalContent}>
                <section>
                        <h2>1. Definiții și termeni</h2>
                        <p>
                            BioBuy este o platformă online care facilitează conectarea
                            utilizatorilor cu producători locali și fermieri.
                        </p>
                    </section>

                    <section>
                        <h2>2. Utilizarea platformei</h2>
                        <ul>
                            <li>Crearea unui cont este obligatorie</li>
                            <li>Utilizatorii trebuie să furnizeze date reale</li>
                            <li>Este interzisă folosirea abuzivă a platformei</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Drepturi și obligații</h2>
                        <p>
                            BioBuy își rezervă dreptul de a suspenda conturile care încalcă
                            termenii și condițiile.
                        </p>
                    </section>

                    <section>
                        <h2>4. Limitarea răspunderii</h2>
                        <p>
                            BioBuy nu este responsabil pentru eventuale pierderi rezultate din
                            utilizarea platformei.
                        </p>
                    </section>

                    <section>
                        <h2>5. Contact</h2>
                        <p>
                            Pentru întrebări legate de termeni:
                            <br />
                            <strong>contact@biobuy.ro</strong>
                        </p>
                    </section>

                    <p className={styles.legalFooter}>
                    Ultima actualizare: decembrie 2025
                    </p>
                </main>

                <aside className={styles.legalActions}>
                <h3>Quick actions</h3>
                    <button onClick={() => navigate("/support")}>Contact suport</button>
                </aside>
            </div>
        </div>
    );
}
