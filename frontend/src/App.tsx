
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/mappage/MapPage";
import Home from "./pages/homePage/Home";
import UploadProductPage from "./pages/uploadProductPage/UploadProductPage";



export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/upload" element={<UploadProductPage />} />
            </Routes>
        </BrowserRouter>
    );
}