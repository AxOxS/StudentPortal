import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../api/auth";

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = getToken();
    const userRole = getUserRole();

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If token exists but no user role (invalid token), redirect to login
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    // If token and role exist but role is not allowed, redirect to unauthorized
    if (!allowedRoles.includes(userRole.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default PrivateRoute;