import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../api/auth";

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = getToken();
    const userRole = getUserRole();

    if (!token || !userRole || !allowedRoles.includes(userRole.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default PrivateRoute;