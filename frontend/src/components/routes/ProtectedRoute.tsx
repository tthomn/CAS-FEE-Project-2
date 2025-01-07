import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactElement;
    requiredRole?: "admin" | "user"; // Optional prop to define role access
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { authUser } = useAuth(); // Get the authenticated user

    if (!authUser) {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && authUser.authType !== requiredRole) {
        // Redirect to home or show Access Denied if the role doesn’t match
        return <Navigate to="/" replace />;
    }

    return children; // Render the protected component if role matches or not required
};

export default ProtectedRoute;
