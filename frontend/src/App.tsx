import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/auth"
                element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />
            <Route
                path="/"
                element={
                    user ? (
                        <div style={{ padding: 40 }}>
                            <h1>Bine ai venit, {user.displayName} 👋</h1>
                            <p>Ești autentificat cu {user.email}</p>
                        </div>
                    ) : (
                        <Navigate to="/auth" replace />
                    )
                }
            />
        </Routes>
    );
}
