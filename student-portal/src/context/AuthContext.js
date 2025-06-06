import { createContext, useState, useEffect } from "react";
import { getToken, getUserRole, logout, login } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = getToken();
        if (token) {
            setUser(getUserRole());
        }
    }, []);

    const signIn = async (email, password) => {
        console.log("🟢 signIn function called!");
    
        try {
            console.log("📡 Sending login request..."); 
            const data = await login(email, password);
    
            console.log("🔹 Login response:", data);
    
            if (data.token) {
                console.log("🔹 Token received:", data.token);
                console.log("🔹 Decoded Role:", getUserRole());
    
                setUser(getUserRole());
            } else {
                console.warn("⚠ No token received. Login might have failed.");
            }
        } catch (error) {
            console.error("❌ Login failed:", error);
            alert("Invalid credentials");
        }
    };

    const signOut = () => {
        logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signIn, setUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};