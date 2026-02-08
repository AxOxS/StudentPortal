import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        passwordHash: "",
        role: "Student"  // Default role
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(`${process.env.REACT_APP_AUTH_URL || 'http://localhost:5000/api/auth'}/register`, formData, {
                headers: { "Content-Type": "application/json" }
            });

            if (response.status === 200 || response.status === 201) {
                setSuccess("User registered successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
            }
        } catch (err) {
            // Handle error - check if it's a string or object
            const errorMsg = typeof err.response?.data === 'string' 
                ? err.response.data 
                : err.response?.data?.message || err.response?.data || "Registration failed.";
            setError(errorMsg);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Sign up to get started with the student portal</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input 
                            id="name"
                            type="text" 
                            name="name" 
                            placeholder="Enter your full name"
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            name="email" 
                            placeholder="Enter your email"
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            name="passwordHash" 
                            placeholder="Create a password"
                            value={formData.passwordHash} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select 
                            id="role"
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange}
                        >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    
                    <button className="auth-button" type="submit">Create Account</button>
                </form>
                
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
