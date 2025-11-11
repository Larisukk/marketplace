import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import MapPage from "./pages/MapPage";
import SearchTester from "./pages/SearchTester";

function Nav() {
    return (
        <div style={{ background:"#1f4633", color:"#e6f3ea", padding:"10px 16px", display:"flex", gap:16 }}>
            <strong>BioBuy</strong>
            <Link to="/map" style={{ color:"#cfe9dc" }}>Map</Link>
            <Link to="/search-tester" style={{ color:"#cfe9dc" }}>Search Tester</Link>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Nav />
            <Routes>
                <Route path="/" element={<Navigate to="/map" replace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/search-tester" element={<SearchTester />} />
            </Routes>
        </BrowserRouter>
    );
}
