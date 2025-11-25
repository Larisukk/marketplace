import { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {

    const token = localStorage.getItem("accessToken");

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}
