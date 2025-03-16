import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { getToken, getUserRole } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        id: '',
        role: '',
        name: '',
        email: ''
    });
    const [formData, setFormData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchUserDetails = async () => {
            try {
                const token = getToken();
                const userInfo = getUserRole(); // This contains both role and id
                console.log('Current user info:', userInfo);

                if (!userInfo || !userInfo.id) {
                    console.error('No user ID found in token');
                    setError('Failed to load user details - No user ID found');
                    return;
                }

                const response = await axios.get(`http://localhost:5267/api/users/${userInfo.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('User details response:', response.data);
                
                // Check if we have the data we need
                if (!response.data) {
                    console.error('No user data received');
                    setError('Failed to load user details - No data received');
                    return;
                }

                const { name, email } = response.data;
                console.log('Setting user data:', { name, email });
                
                setUserData({
                    id: userInfo.id,
                    role: userInfo.role,
                    name: name || '',
                    email: email || ''
                });
                setFormData(prev => ({
                    ...prev,
                    email: email || ''
                }));
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Failed to load user details');
            }
        };

        fetchUserDetails();
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any previous error/success messages when user starts typing
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = getToken();
            const userInfo = getUserRole();
            const updateData = {};

            // Only include email if it's different from current email and not empty
            if (formData.email && formData.email !== userData.email) {
                updateData.email = formData.email;
            }

            // Validate password fields if any password field is filled
            if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
                if (!formData.currentPassword) {
                    setError('Current password is required to change password');
                    setLoading(false);
                    return;
                }
                if (!formData.newPassword) {
                    setError('New password is required');
                    setLoading(false);
                    return;
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    setError('New passwords do not match');
                    setLoading(false);
                    return;
                }
                if (formData.newPassword.length < 6) {
                    setError('New password must be at least 6 characters long');
                    setLoading(false);
                    return;
                }

                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            // Only make the API call if there are changes to update
            if (Object.keys(updateData).length === 0) {
                setError('No changes to update');
                setLoading(false);
                return;
            }

            await axios.put(`http://localhost:5267/api/users/${userInfo.id}`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess('Profile updated successfully');
            
            // Clear password fields after successful update
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                // Only reset email if it was updated
                ...(updateData.email ? {} : { email: userData.email })
            }));
            
            // Update displayed email in userData if email was changed
            if (updateData.email) {
                setUserData(prev => ({
                    ...prev,
                    email: updateData.email
                }));
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Profile Settings</h2>
            
            <div style={{ marginBottom: '2rem' }}>
                <h3>User Information</h3>
                <p><strong>ID:</strong> {userData.id}</p>
                <p><strong>Role:</strong> {userData.role}</p>
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Current Email:</strong> {userData.email}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">New Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <h3>Change Password</h3>
                <div>
                    <label htmlFor="currentPassword">Current Password:</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirm New Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage; 