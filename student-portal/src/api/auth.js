import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:5267/api/auth";

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem("token", response.data.token); // Store jwt token
    }
    return response.data;
};

export const register = async (name, email, password, role) => {
    return axios.post(`${API_URL}/register`, { name, email, passwordHash: password, role });
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");

export const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        //console.log("Decoded token:", decoded); //debuging the token
        return { role: decoded.role,
            id: decoded.id
         }; // Extract role from jwt token
    } catch (err) {
        console.error("Error decoding token:", err);
        return null;
    }
};