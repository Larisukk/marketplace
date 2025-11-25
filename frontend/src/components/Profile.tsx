import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../pages/profile/profile.css";

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState<"personal" | "security">("personal");
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetch("http://localhost:8080/api/auth/change-password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("accessToken"),
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                setError(msg || "Eroare la schimbarea parolei");
                return;
            }

            setSuccess("Parola a fost schimbată cu succes!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {
            setError("Eroare la server.");
        }
    };

    return (
        <>
            {showLogoutPopup && (
                <div className="logout-overlay">
                    <div className="logout-popup">
                        <h2>Sigur vrei să te deconectezi?</h2>
                        <p>Vei fi deconectat din contul tău.</p>

                        <div className="logout-buttons">
                            <button
                                className="logout-confirm"
                                onClick={() => {
                                    logout();
                                    navigate("/auth");
                                }}
                            >
                                Deconectează-te
                            </button>

                            <button
                                className="logout-cancel"
                                onClick={() => setShowLogoutPopup(false)}
                            >
                                Anulează
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="profile-container">
                <div className="settings-menu">
                    <h3>Setări</h3>

                    <ul>
                        <li
                            className={tab === "personal" ? "active" : ""}
                            onClick={() => setTab("personal")}
                        >
                            Date personale
                        </li>

                        <li
                            className={tab === "security" ? "active" : ""}
                            onClick={() => setTab("security")}
                        >
                            Securitate
                        </li>

                        <li
                            className="logout-item"
                            onClick={() => setShowLogoutPopup(true)}
                        >
                            Deconectare
                        </li>
                    </ul>
                </div>

                <div className="profile-left-box">
                    {tab === "personal" && (
                        <>
                            <h2>Datele contului</h2>

                            <div className="profile-field">
                                <label>Nume:</label>
                                <p>{user?.displayName}</p>
                            </div>

                            <div className="profile-field">
                                <label>Email:</label>
                                <p>{user?.email}</p>
                            </div>
                        </>
                    )}

                    {tab === "security" && (
                        <>
                            <h2>Securitate</h2>

                            <form onSubmit={handlePasswordChange} className="password-form">
                                <label>Parola veche:</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />

                                <label>Parola nouă:</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />

                                <label>Confirmare parola nouă:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                {error && <p className="error-msg">{error}</p>}
                                {success && <p className="success-msg">{success}</p>}

                                <button type="submit" className="change-pass-btn">
                                    Schimbă parola
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
