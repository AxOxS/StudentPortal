import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div>
            <h2>Unauthorized Access</h2>
            <p>You do not have permission to view this page.</p>
            <Link to="/dashboard">Go to Dashboard</Link>
        </div>
    );
};

export default Unauthorized;
