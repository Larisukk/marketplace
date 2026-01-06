// src/pages/AuthPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./auth.module.css";
import AuthHeader from "../../header/AuthHeader";

// ===============================
// Floating Field Component
// ===============================
type FloatingFieldProps = {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    autoComplete?: string;
};

function FloatingField({
    id, label, type = "text", value, onChange, autoComplete,
}: FloatingFieldProps) {
    return (
        <div className={styles.field}>
            {/* one space for :placeholder-shown */}
            <input
                id={id}
                className={`${styles.input} ${styles.floating}`}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                autoComplete={autoComplete}
                required
            />

            <label htmlFor={id} className={styles.flabel}>{label}</label>
        </div>
    );
}



// ===============================
// MAIN PAGE COMPONENT
// ===============================
export default function AuthPage() {
    const [tab, setTab] = useState<"signup" | "login">("signup");
    const { clearError } = useAuth();

    // ASCUNDE MainHeader-ul global
    useEffect(() => {
        document.body.classList.add("auth-mode");
        return () => document.body.classList.remove("auth-mode");
    }, []);

    function switchTab(t: "signup" | "login") {
        clearError();
        setTab(t);
    }

    return (
        <div className={styles['auth-wrap']}>
            {/* left hero image */}
            <AuthHeader />
            <div className={styles['hero-left']} aria-hidden />

            {/* ---- RIGHT COLUMN: LOGO + CARD, with fixed gap (no overlap) ---- */}
            <div className={styles['right-stack']}>
                <div className={styles['logo-floating']}>
                    <img src="/logo.png" alt="BioBuy" className={styles.logo} />
                </div>

                <div className={`${styles.card} ${styles.single}`}>
                    <div className={`${styles.right} ${styles.compact}`}>
                        <Tabs tab={tab} onChange={switchTab} />

                        {tab === "signup"
                            ? <SignupForm key="signup" />
                            : <LoginForm key="login" />
                        }

                    </div>
                </div>
            </div>
        </div>
    );
}



// ===============================
// TABS
// ===============================
function Tabs({
    tab,
    onChange,
}: { tab: "signup" | "login"; onChange: (t: "signup" | "login") => void }) {
    return (
        <div className={styles.tabs} data-active={tab}>
            <button type="button" className={styles.tab} onClick={() => onChange("signup")}>
                Înscrieți-vă
            </button>
            <button type="button" className={styles.tab} onClick={() => onChange("login")}>
                Conectare
            </button>
        </div>
    );
}



// ===============================
// LOGIN FORM
// ===============================
function LoginForm() {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation() as { state?: { redirectAfterLogin?: string; sellerId?: string; autoStartChat?: boolean } };
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            await login(email.trim(), password);

            const redirectPath = location.state?.redirectAfterLogin || "/home";
            navigate(redirectPath, {
                state: {
                    sellerId: location.state?.sellerId,
                    autoStartChat: location.state?.autoStartChat,
                },
            });
        } catch (err) {
            // Error is handled by AuthContext
        }
    }



    return (
        <form onSubmit={onSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <FloatingField
                id="login-email"
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
            />

            <FloatingField
                id="login-password"
                label="Parolă"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
            />

            <button type="submit" disabled={loading} className={styles.btn}>
                {loading ? "Se conectează…" : "Conectați-vă"}
            </button>
        </form>
    );
}



// ===============================
// SIGNUP FORM
// ===============================
function SignupForm() {
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation() as { state?: { redirectAfterLogin?: string; sellerId?: string; autoStartChat?: boolean } };
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const [accepted, setAccepted] = useState(false);

    // Password checks
    const rules = [
        { id: "len", ok: password.length >= 8 && password.length <= 64, label: "Minim 8 și maxim 64 de caractere" },
        { id: "lower", ok: /[a-z]/.test(password), label: "Cel puțin o literă mică (a-z)" },
        { id: "upper", ok: /[A-Z]/.test(password), label: "Cel puțin o literă mare (A-Z)" },
        { id: "digit", ok: /\d/.test(password), label: "Cel puțin o cifră (0-9)" },
        { id: "symb", ok: /[^\w\s]/.test(password), label: "Cel puțin un simbol (!@#$% etc.)" },
    ];

    const unmet = rules.filter(r => !r.ok);
    const allOk = unmet.length === 0;
    const showUnmet = submitted && !allOk;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitted(true);
        if (!allOk) return;

        try {
            await register(displayName.trim(), email.trim(), password);

            navigate("/email-sent", {
                state: { email: email.trim() },
            });
        } catch (err) {
            // Error handled by context
        }

    }


    return (
        <form onSubmit={onSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <FloatingField id="signup-name" label="Nume" value={displayName} onChange={setDisplayName} autoComplete="name" />
            <FloatingField id="signup-email" label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <FloatingField id="signup-password" label="Parolă" type="password" value={password} onChange={setPassword} autoComplete="new-password" />

            {showUnmet && (
                <ul className={styles['pw-rules']}>
                    {unmet.map(r => (
                        <li key={r.id} data-ok="false">{r.label}</li>
                    ))}
                </ul>
            )}

            <label className={styles['gdpr-checkbox']}>
                <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    required
                />
                Accept{" "}
                <a href="/terms" target="_blank" rel="noreferrer">Termenii</a>
                si
                <a href="/privacy" target="_blank" rel="noreferrer">Politica de confidențialitate</a>

            </label>

            <p className={styles['gdpr-note']}>
                Continuând, accepți Termenii și Politica de confidențialitate.
                Autentificare doar prin contul creat în aplicație.
            </p>

            <button type="submit" disabled={!accepted} className={styles.btn}>
                {loading ? "Se înregistrează…" : "Înregistrați-vă"}
            </button>



        </form>
    );
}

function FooterNote() {
    return (
        <p className={styles.note}>
            Continuând, accepți termenii și politica noastră de confidențialitate.
            Autentificare doar prin contul creat în aplicație.
        </p>
    );
}
