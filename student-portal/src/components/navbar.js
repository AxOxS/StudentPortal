import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, signOut } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    if (!user) return null; // Don't render navbar if not logged in
    
    const userRole = user?.role;
    
    // Check if a path is active
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const handleLogout = () => {
        signOut();
        navigate('/login', { replace: true });
    };
    
    return (
        <nav className="main-navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/">Student Portal</Link>
                </div>
                
                <div className="navbar-links">
                    <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>
                        Dashboard
                    </Link>
                    
                    {userRole === 'Student' && (
                        <>
                            <Link to="/student" className={`navbar-link ${isActive('/student')}`}>
                                My Schedule and Grades
                            </Link>
                        </>
                    )}
                    
                    {userRole === 'Teacher' && (
                        <>
                            <Link to="/teacher" className={`navbar-link ${isActive('/teacher')}`}>
                                Gradebook
                            </Link>
                        </>
                    )}
                    
                    {userRole === 'Admin' && (
                        <>
                            <Link to="/admin" className={`navbar-link ${isActive('/admin')}`}>
                                Admin Panel
                            </Link>
                        </>
                    )}
                </div>
                
                <div className="navbar-user">
                    <div className="navbar-dropdown">
                        <button className="navbar-user-button">
                            {user.name || user.email || userRole}
                            <span className="dropdown-icon">▼</span>
                        </button>
                        <div className="dropdown-content">
                            <Link to="/profile" className="dropdown-item">Profile Settings</Link>
                            <button onClick={handleLogout} className="dropdown-item">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;