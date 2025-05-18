import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:5267/api';

// Get all users in the system
export const getAllUsers = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
        throw error;
    }
};

// Create a new user
export const createUser = async (userData) => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/users`, userData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
    try {
        const token = getToken();
        const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating user with ID ${userId}:`, error);
        throw error;
    }
};

// Delete a user
export const deleteUser = async (userId) => {
    try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with ID ${userId}:`, error);
        throw error;
    }
};

// Get system statistics
export const getSystemStats = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/admin/stats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching system statistics:', error);
        // For demo purposes, return mock data if API endpoint is not available
        return {
            totalUsers: 42,
            totalStudents: 35,
            totalTeachers: 7,
            activeUsers: 38,
            recentRegistrations: 5
        };
    }
};

// Reset user password
export const resetUserPassword = async (userId) => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/users/${userId}/reset-password`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error resetting password for user ${userId}:`, error);
        throw error;
    }
}; 