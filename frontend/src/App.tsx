import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import MapPage from "./pages/mappage/MapPage";
import Home from "./pages/homePage/Home";
import UploadProductPage from "./pages/uploadProductPage/UploadProductPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/profile/ProfilePage";

import ProtectedRoute from "./ProtectedRoute"; //

export default function App() {
    return (
        <Routes>
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

        </Routes>
    );
}
