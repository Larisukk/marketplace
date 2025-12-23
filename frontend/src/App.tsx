// frontend/src/App.tsx
import styles from "./App.module.css";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/homePage/Home";
import MapPage from "./pages/mappage/MapPage";
import UploadProductPage from "./pages/uploadProductPage/UploadProductPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ListingPage from "./pages/listingpage/ListingPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import ChatPage from "./pages/chatpage/ChatPage";

import { ChatProvider } from "./context/ChatContext";
import { useAuth } from "./context/AuthContext";

export default function App() {
    const { user } = useAuth();

    return (
        <ChatProvider>
            <Routes>
                {/* default landing */}
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* public pages */}
                <Route path="/home" element={<Home />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/listings/:id" element={<ListingPage />} />
                <Route path="/chat" element={<ChatPage />} />

                {/* auth page: if already logged in, redirect away */}
                <Route
                    path="/auth"
                    element={!user ? <AuthPage /> : <Navigate to="/home" replace />}
                />

                {/* protected pages */}
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

                {/* fallback */}
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </ChatProvider>
    );
}
