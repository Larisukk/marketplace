import styles from "./EmailVerifiedPage.module.css";
import { Link } from "react-router-dom";

export default function EmailVerifiedPage() {
    return (
        <div className={styles["verify-wrapper"]}>
            <div className={styles["verify-card"]}>
                <h1 className={styles["verify-title"]}>Adresa de email verificata</h1>
                <p className={styles["verify-subtext"]}>
                    Adresa ta de email a fost verificata cu succes!
                </p>
                <Link to="/auth" className={styles["verify-btn"]}>
                    Mergi spre conectare
                </Link>

            </div>
        </div>
    );
}
