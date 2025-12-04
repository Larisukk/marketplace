import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
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

                {/*<Route*/}
                {/*    path="/chat"*/}
                {/*    element={!user ? <ChatPage /> : <Navigate to="/auth" replace />}*/}
                {/*/>*/}
                <Route path="/chat" element={<ChatPage />} />
                <Route
                    path="/auth"
                    element={!user ? <AuthPage /> : <Navigate to="/map" replace />}
                />
            </Routes>
        </ChatProvider>
    );
}
