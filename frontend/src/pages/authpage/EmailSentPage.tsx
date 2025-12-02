import "./EmailSentPage.css";
import { useLocation } from "react-router-dom";
import { getMailProviderUrl } from "../../utils/emailProviders";

export default function EmailSentPage() {
    const location = useLocation();
    const email = location.state?.email || "";

    const providerUrl = email ? getMailProviderUrl(email) : null;

    return (
        <div className="email-sent-wrap">
            <div className="email-sent-card">

                <img src="/logo.png" alt="Logo" className="email-logo" />

                <h1>Check your email</h1>

                <p className="email-text">
                    Your account was created successfully.
                    Please confirm your email address to activate your account.

                    We’ve sent a verification message to:
                    <br /><strong>{email}</strong>
                </p>

                {providerUrl ? (
                    <a href={providerUrl} target="_blank" rel="noreferrer" className="open-mail-btn">
                        Open my email
                    </a>
                ) : (
                    <a
                        href="#"
                        className="open-mail-btn"
                        onClick={(e) => e.preventDefault()}
                        style={{ opacity: 0.7, cursor: "default" }}
                    >
                        Open my email
                    </a>
                )}

                <p className="email-note">
                    Didn’t receive the email? Check your spam folder or wait a few minutes.
                </p>

            </div>
        </div>
    );
}
