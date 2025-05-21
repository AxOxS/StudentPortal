import { Navigate } from "react-router-dom";
import { getToken } from "../api/auth";

const PublicRoute = ({ children }) => {
    const token = getToken();

    // If user is logged in (has token), redirect to dashboard
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    // If not logged in, show the public route (login/register)
    return children;
};

export default PublicRoute; 