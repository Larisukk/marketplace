import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/mappage/MapPage";
import AuthPage from "./pages/authpage/AuthPage";
import { useAuth } from "./context/AuthContext";
import EmailSentPage from "./pages/authpage/EmailSentPage";
import EmailVerifiedPage from "./pages/authpage/EmailVerifiedPage";
import VerifyEmailPage from "./pages/authpage/VerifyEmailPage";


export default function App() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route path="/map" element={<MapPage />} />

            <Route
                path="/auth"
                element={!user ? <AuthPage /> : <Navigate to="/map" replace />}
            />

            <Route path="/email-sent" element={<EmailSentPage />} />

            <Route path="/verify-email" element={<VerifyEmailPage />} />

            <Route path="/email-verified" element={<EmailVerifiedPage />} />
        </Routes>
    );
}
