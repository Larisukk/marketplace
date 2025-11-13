// src/pages/AuthPage.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../auth.css";

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
            {/* one space for :placeholder-shown */}
            <input
                id={id}
                className="input floating"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "   // just one space string
                autoComplete={autoComplete}
                required
            />

            <label htmlFor={id} className="flabel">{label}</label>
        </div>
    );
}

export default function AuthPage() {
    const [tab, setTab] = useState<"signup" | "login">("signup");
    const { clearError } = useAuth();

    function switchTab(t: "signup" | "login") {
        clearError();       // clear any backend error when switching tabs
        setTab(t);
    }

    return (
        <div className="auth-wrap">
            {/* left hero image */}
            <div className="hero-left" aria-hidden />

            {/* ---- RIGHT COLUMN: LOGO + CARD, with fixed gap (no overlap) ---- */}
            <div className="right-stack">
                <div className="logo-floating">
                    <img src="/logo.png" alt="BioBuy" className="logo" />
                </div>

                <div className="card single">
                    <div className="right compact">
                        <Tabs tab={tab} onChange={switchTab} />
                        {tab === "signup" ? <SignupForm key="signup" /> : <LoginForm key="login" />}
                        <FooterNote />
                    </div>
                </div>
            </div>
        </div>
    );
}

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

function SignupForm() {
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);

    // UI rules (aligned with backend regex spirit)
    const rules = [
        { id: "len",   ok: password.length >= 8 && password.length <= 64, label: "Minim 8 și maxim 64 de caractere" },
        { id: "lower", ok: /[a-z]/.test(password),                          label: "Cel puțin o literă mică (a-z)" },
        { id: "upper", ok: /[A-Z]/.test(password),                          label: "Cel puțin o literă mare (A-Z)" },
        { id: "digit", ok: /\d/.test(password),                             label: "Cel puțin o cifră (0-9)" },
        { id: "symb",  ok: /[^\w\s]/.test(password),                        label: "Cel puțin un simbol (!@#$% etc.)" },
    ];
    const allOk = rules.every(r => r.ok);
    const unmet = rules.filter(r => !r.ok);
    const showUnmet = submitted && !allOk; // show ONLY after submit, and only the unmet ones

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitted(true);
        if (!allOk) return; // don’t send if password is weak; show unmet list instead

        await register(displayName.trim(), email.trim(), password);
        navigate("/home");
    }

    return (
        <form onSubmit={onSubmit} className="form">
            {error && <div className="error">{error}</div>}

            <FloatingField
                id="signup-name"
                label="Nume"
                value={displayName}
                onChange={setDisplayName}
                autoComplete="name"
            />

            <FloatingField
                id="signup-email"
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
            />

            <FloatingField
                id="signup-password"
                label="Parolă"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
            />

            {showUnmet && (
                <ul className="pw-rules">
                    {unmet.map(r => (
                        <li key={r.id} data-ok="false">{r.label}</li>
                    ))}
                </ul>
            )}

            <button type="submit" disabled={loading} className="btn">
                {loading ? "Se înregistrează…" : "Înregistrați-vă"}
            </button>
        </form>
    );
}

function FooterNote() {
    return (
        <p className="note">
            Continuând, accepți termenii și politica noastră de confidențialitate.
            Autentificare doar prin contul creat în aplicație.
        </p>
    );
}
