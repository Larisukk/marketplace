import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/mappage/MapPage";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";

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
        </Routes>
    );
}
