import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/mappage/MapPage.tsx";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";


export default function App() {
    const { user } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/map" replace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />}/>
            </Routes>
        </BrowserRouter>
    );
}
