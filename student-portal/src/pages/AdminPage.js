import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser, getSystemStats, resetUserPassword } from '../api/admin';
import '../styles/AdminPage.css';

const AdminPage = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // User form state
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        role: 'Student',
        password: '',
    });

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch users
            const usersData = await getAllUsers();
            setUsers(usersData);
            
            // Calculate stats from users data
            const totalUsers = usersData.length;
            const totalStudents = usersData.filter(u => u.role === 'Student').length;
            const totalTeachers = usersData.filter(u => u.role === 'Teacher').length;
            
            setStats({
                totalUsers,
                totalStudents,
                totalTeachers,
                activeUsers: totalUsers, // All users are considered active for now
                recentRegistrations: 0 // Not tracked yet
            });
        } catch (err) {
            console.error("Error fetching admin data:", err);
            setError("Failed to load admin data. Please try again later.");
            setUsers([]);
            setStats({
                totalUsers: 0,
                totalStudents: 0,
                totalTeachers: 0,
                activeUsers: 0,
                recentRegistrations: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset the form
    const resetForm = () => {
        setUserFormData({
            name: '',
            email: '',
            role: 'Student',
            password: '',
        });
        setEditingUser(null);
        setIsAddingUser(false);
    };

    // Handle user form submission
    const handleSubmitUser = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update existing user
                await updateUser(editingUser.id, userFormData);
            } else {
                // Create new user
                await createUser(userFormData);
            }
            
            // Refresh the user list
            fetchData();
            resetForm();
        } catch (err) {
            console.error("Error saving user:", err);
            alert(`Failed to ${editingUser ? 'update' : 'create'} user: ${err.message}`);
        }
    };

    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(userId);
                fetchData();
            } catch (err) {
                console.error("Error deleting user:", err);
                alert(`Failed to delete user: ${err.message}`);
            }
        }
    };

    // Handle password reset
    const handleResetPassword = async (userId) => {
        if (window.confirm('Reset password for this user? They will receive an email with instructions.')) {
            try {
                await resetUserPassword(userId);
                alert('Password reset email has been sent to the user.');
            } catch (err) {
                console.error("Error resetting password:", err);
                alert(`Failed to reset password: ${err.message}`);
            }
        }
    };

    // Set up a user for editing
    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            // Don't include password when editing
            password: '',
        });
        setIsAddingUser(true);
    };

    // Get initials from name for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    if (loading) {
        return <div className="admin-container">Loading admin dashboard...</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome, {user?.name || 'Admin'}. Manage the student portal system.</p>
            </div>

            {/* Stats Summary */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-number">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Students</div>
                    <div className="stat-number">{stats.totalStudents}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Teachers</div>
                    <div className="stat-number">{stats.totalTeachers}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Users</div>
                    <div className="stat-number">{stats.activeUsers}</div>
                </div>
            </div>

            <div className="admin-grid">
                {/* User Management Panel */}
                <div className="admin-panel">
                    <div className="panel-header">
                        <h2>User Management</h2>
                        {!isAddingUser && (
                            <button 
                                className="admin-button"
                                onClick={() => setIsAddingUser(true)}
                            >
                                Add User
                            </button>
                        )}
                    </div>
                    <div className="panel-body">
                        {isAddingUser ? (
                            <form onSubmit={handleSubmitUser} className="admin-form">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={userFormData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={userFormData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={userFormData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                {!editingUser && (
                                    <div className="form-group">
                                        <label htmlFor="password">Initial Password</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={userFormData.password}
                                            onChange={handleInputChange}
                                            required={!editingUser}
                                        />
                                    </div>
                                )}
                                <div className="form-actions">
                                    <button type="submit" className="admin-button">
                                        {editingUser ? 'Save Changes' : 'Create User'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="admin-button edit" 
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <ul className="user-list">
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <li className="user-item" key={user.id}>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="user-details">
                                                    <div className="user-name">{user.name}</div>
                                                    <div className="user-role">{user.email} • {user.role}</div>
                                                </div>
                                            </div>
                                            <div className="user-actions">
                                                <button 
                                                    className="admin-button edit"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="admin-button edit"
                                                    onClick={() => handleResetPassword(user.id)}
                                                >
                                                    Reset Password
                                                </button>
                                                <button 
                                                    className="admin-button delete"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p>No users found.</p>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {/* System Settings Panel */}
                <div className="admin-panel">
                    <div className="panel-header">
                        <h2>System Settings</h2>
                    </div>
                    <div className="panel-body">
                        <div className="admin-form">
                            <div className="form-group">
                                <label htmlFor="siteName">Site Name</label>
                                <input
                                    type="text"
                                    id="siteName"
                                    defaultValue="Student Portal"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contactEmail">Support Email</label>
                                <input
                                    type="email"
                                    id="contactEmail"
                                    defaultValue="support@studentportal.com"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="allowRegistrations">Allow Public Registrations</label>
                                <select id="allowRegistrations" defaultValue="true">
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="maintenance">Maintenance Mode</label>
                                <select id="maintenance" defaultValue="false">
                                    <option value="true">On</option>
                                    <option value="false">Off</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button className="admin-button">Save Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Log */}
            <div className="admin-panel">
                <div className="panel-header">
                    <h2>Recent Activity Log</h2>
                </div>
                <div className="panel-body">
                    <ul className="user-list">
                        <li className="user-item">
                            <div className="user-info">
                                <div className="user-avatar">JD</div>
                                <div className="user-details">
                                    <div className="user-name">John Doe</div>
                                    <div className="user-role">Logged in • 5 minutes ago</div>
                                </div>
                            </div>
                        </li>
                        <li className="user-item">
                            <div className="user-info">
                                <div className="user-avatar">JS</div>
                                <div className="user-details">
                                    <div className="user-name">Jane Smith</div>
                                    <div className="user-role">Password reset • 1 hour ago</div>
                                </div>
                            </div>
                        </li>
                        <li className="user-item">
                            <div className="user-info">
                                <div className="user-avatar">MB</div>
                                <div className="user-details">
                                    <div className="user-name">Michael Brown</div>
                                    <div className="user-role">Added new grade • 3 hours ago</div>
                                </div>
                            </div>
                        </li>
                        <li className="user-item">
                            <div className="user-info">
                                <div className="user-avatar">AD</div>
                                <div className="user-details">
                                    <div className="user-name">Admin</div>
                                    <div className="user-role">Created user Alice Williams • Yesterday</div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
