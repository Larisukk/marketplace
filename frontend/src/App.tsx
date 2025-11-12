
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/MapPage";
import Home from "./pages/Home";
import UploadProductPage from "./pages/UploadProductPage";



export default function App() {
    return (
        <BrowserRouter>
            {/* --- AM ȘTERS LINIA <Nav /> DE AICI --- */}
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/upload" element={<UploadProductPage />} />
            </Routes>
        </BrowserRouter>
    );
}