import { useState } from "react";
import styles from "./SupportPage.module.css";

export default function SupportPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !message) {
            setError("Completează toate câmpurile.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/support/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, message }),
            });

            if (!res.ok) {
                setError("Eroare la trimiterea mesajului.");
                return;
            }

            setSuccess("Mesajul a fost trimis. Te vom contacta.");
            setEmail("");
            setMessage("");
        } catch {
            setError("Eroare de conexiune cu serverul.");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* ⬇️ CLASĂ LIPSĂ */}
                <h1 className={styles.title}>Contact suport</h1>

                {/* ⬇️ CLASĂ LIPSĂ */}
                <form onSubmit={submit} className={styles.form}>
                    <label>Email</label>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <label>Mesaj</label>
                    <textarea
                        rows={6}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />

                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}

                    <button type="submit">Trimite mesaj</button>
                </form>
            </div>
        </div>
    );
}
