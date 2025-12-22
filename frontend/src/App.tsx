import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import MapPage from "./pages/mappage/MapPage";
import Home from "./pages/homePage/Home";
import UploadProductPage from "./pages/uploadProductPage/UploadProductPage";
import AuthPage from "./pages/authpage/AuthPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EmailSentPage from "./pages/authpage/EmailSentPage";
import EmailVerifiedPage from "./pages/authpage/EmailVerifiedPage";
import VerifyEmailPage from "./pages/authpage/VerifyEmailPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Terms from "./pages/legal/Terms";
import Header from "./components/Header";
import SupportPage from "@/pages/support/SupportPage"; // GLOBAL header

export default function App() {
    const location = useLocation();

    // pages where header MUST NOT appear
    const hideHeaderOn = ["/map"];

    const shouldShowHeader = !hideHeaderOn.includes(location.pathname);

    return (
        <>
            {shouldShowHeader && <Header />}

            <Routes>
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/support" element={<SupportPage />} />


                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/map" element={<MapPage />} />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <UploadProductPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/email-sent" element={<EmailSentPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/email-verified" element={<EmailVerifiedPage />} />
            </Routes>
        </>
    );
}
