import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/mappage/MapPage";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";
import ChatPage from "./pages/ChatPage";
import { ChatProvider } from "./context/ChatContext";

export default function App() {
    const { user } = useAuth();

    return (
        <ChatProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/map" replace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />}/>
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
        </ChatProvider>
    );
}
