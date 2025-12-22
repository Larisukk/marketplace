import styles from "./App.module.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MapPage from "./pages/mappage/MapPage";
import Home from "./pages/homepage/Home";
import UploadProductPage from "./pages/uploadProductPage/UploadProductPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ListingPage from "./pages/listingpage/ListingPage";
import ProtectedRoute from "./components/routing/ProtectedRoute"; //
import { ChatProvider } from "./context/ChatContext";
import ChatPage from "./pages/chatpage/ChatPage";

export default function App() {
    return (
        <ChatProvider>
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
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/listings/:id" element={<ListingPage />} />
            </Routes>
        </ChatProvider>
    );
}
