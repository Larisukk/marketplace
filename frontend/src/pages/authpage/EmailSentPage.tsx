import styles from "./EmailSentPage.module.css";
import { useLocation } from "react-router-dom";
import { getMailProviderUrl } from "../../utils/emailProviders";

export default function EmailSentPage() {
    const location = useLocation();
    const email = location.state?.email || "";
    const providerUrl = email ? getMailProviderUrl(email) : null;

    return (
        <div className={styles["email-sent-wrap"]}>
            <div className={styles["email-sent-card"]}>
                <img src="/logo.png" className={styles["email-logo"]} />

                <h1>Verifica-ti adresa de email</h1>

                <p className={styles["email-text"]}>
                    Am trimis un mesaj de verificare catre <br />
                    <strong>{email}</strong>
                </p>

                {providerUrl && (
                    <a href={providerUrl} className={styles["open-mail-btn"]}>
                        Deschide email-ul meu
                    </a>
                )}
            </div>
        </div>
    );
}
