// src/pages/AuthPage.tsx

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";
import AuthHeader from "../../header/AuthHeader";  // <- componenta corectă

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
        <div className="field">
            <input
                id={id}
                className="input floating"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                autoComplete={autoComplete}
                required
            />
            <label htmlFor={id} className="flabel">{label}</label>
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
        <div className="auth-wrap">

            {/* HEADER NOU, MIC, DOAR PENTRU AUTH */}
            <AuthHeader />

            {/* HERO IMAGE */}
            <div className="hero-left" aria-hidden />

            {/* RIGHT COLUMN */}
            <div className="right-stack">

                <div className="logo-floating">
                    <img src="/logo.png" alt="BioBuy" />
                </div>

                {/* CARD */}
                <div className="card single">
                    <div className="right compact">

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
        <div className="tabs" data-active={tab}>
            <button type="button" className="tab" onClick={() => onChange("signup")}>
                Înscrieți-vă
            </button>
            <button type="button" className="tab" onClick={() => onChange("login")}>
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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        await login(email.trim(), password);
        navigate("/home");
    }

    return (
        <form onSubmit={onSubmit} className="form">
            {error && <div className="error">{error}</div>}

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

            <button type="submit" disabled={loading} className="btn">
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

        await register(displayName.trim(), email.trim(), password);
    }

    return (
        <form onSubmit={onSubmit} className="form">
            {error && <div className="error">{error}</div>}

            <FloatingField id="signup-name" label="Nume" value={displayName} onChange={setDisplayName} autoComplete="name" />
            <FloatingField id="signup-email" label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <FloatingField id="signup-password" label="Parolă" type="password" value={password} onChange={setPassword} autoComplete="new-password" />

            {showUnmet && (
                <ul className="pw-rules">
                    {unmet.map(r => (
                        <li key={r.id} data-ok="false">{r.label}</li>
                    ))}
                </ul>
            )}

            <label className="gdpr-checkbox">
                <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    required
                />
                Accept{" "}
                <a href="/terms" target="_blank">Termenii</a> și{" "}
                <a href="/privacy" target="_blank">Politica de confidențialitate</a>
            </label>

            <p className="gdpr-note">
                Continuând, accepți Termenii și Politica de confidențialitate.
                Autentificare doar prin contul creat în aplicație.
            </p>

            <button type="submit" disabled={!accepted} className="btn">
                {loading ? "Se înregistrează…" : "Înregistrați-vă"}
            </button>



        </form>
    );
}
