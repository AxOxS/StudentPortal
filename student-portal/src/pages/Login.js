import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getUserRole } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            setUser(getUserRole()); //Update global user state
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your student portal</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="Enter your email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder="Enter your password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <button className="auth-button" type="submit">Sign In</button>
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;