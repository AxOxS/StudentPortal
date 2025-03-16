import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getToken } from "../api/auth";
import axios from "axios";

const Dashboard = () => {
    const { user, signOut } = useContext(AuthContext);
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const token = getToken();

        axios.get("http://localhost:5267/api/students", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => setStudents(response.data))
        .catch(error => console.error(error));
    }, [user, navigate]);

    const userRole = user?.role;

    return (
        <div>
            <h2>Welcome, {userRole || 'User'}</h2>
            <nav>
                {user && userRole === "Student" && <Link to="/student">Go to Student Page</Link>}
                {user && userRole === "Teacher" && <Link to="/teacher">Go to Teacher Page</Link>}
                {user && userRole === "Admin" && <Link to="/admin">Go to Admin Page</Link>}
                {user && <Link to="/profile" style={{ marginLeft: '1rem' }}>Profile Settings</Link>}
            </nav>
            <button onClick={() => { signOut(); navigate("/login"); }}>Logout</button>
        </div>
    );
};

export default Dashboard;
