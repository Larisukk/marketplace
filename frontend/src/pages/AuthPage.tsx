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
                           id, label, type = "text", value, onChange, autoComplete
                       }: FloatingFieldProps) {
    return (
        <div className="field">
            <input
                id={id}
                className="input floating"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "                // IMPORTANT: one space for :placeholder-shown
                autoComplete={autoComplete}
                required
            />
            <label htmlFor={id} className="flabel">{label}</label>
        </div>
    );
}
export default function AuthPage() {
    const [tab, setTab] = useState<"signup" | "login">("signup");

    return (
        <div className="auth-wrap">
            <div className="hero-left" aria-hidden />

            {/* 🔹 LOGO DEASUPRA CARDULUI */}
            <div className="logo-floating">
                <img src="/logo.png" alt="BioBuy" className="logo" />
            </div>

            {/* CARD */}
            <div className="card single">
                <div className="right compact">
                    <Tabs tab={tab} onChange={setTab} />
                    {tab === "signup" ? <SignupForm /> : <LoginForm />}
                    <FooterNote />
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


function SignupForm() {
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        await register(displayName.trim(), email.trim(), password);
        navigate("/");
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


            <button type="submit" disabled={loading} className="btn">
                {loading ? "Se înregistrează…" : "Înregistrati-vă"}
            </button>
        </form>
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
        navigate("/");
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

function FooterNote() {
    return (
        <p className="note">
            Continuând, accepți termenii și politica noastră de confidențialitate. Autentificare doar prin contul creat în aplicație.
        </p>
    );
}
