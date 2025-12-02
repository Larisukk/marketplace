import { Link } from "react-router-dom";
import "./EmailVerifiedPage.css";

export default function EmailVerifiedPage() {
    return (
        <div className="verify-wrapper">
            <div className="verify-card">

                <div className="verify-icon">
                    <svg width="88" height="88" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="2"/>
                        <path d="M7 12l3 3 7-7" stroke="var(--primary)" strokeWidth="2" fill="none"/>
                    </svg>
                </div>

                <h1 className="verify-title">Email Verified</h1>
                <p className="verify-subtext">
                    Your email address has been successfully verified.
                </p>

                <Link to="/auth" className="verify-btn">
                    Go to Login
                </Link>
            </div>
        </div>
    );
}
