import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, LogIn, Sun, Moon, Type } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import logo from '../assets/logo.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme, fontSize, setFontSize } = usePreferences();

    // Helper to cycle font sizes
    const cycleFontSize = () => {
        const sizes = ['small', 'medium', 'large', 'xl'];
        const currentIndex = sizes.indexOf(fontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        setFontSize(sizes[nextIndex]);
    };

    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', credentials);

            // Success
            const { token, user } = response.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_info', JSON.stringify(user));

            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                setError((err.response.data.message || 'Login failed') + " (ERR_AUTH_LOGIN)");
            } else {
                setError('Server unreachable (ERR_NET_CONN)');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="gradient-bg"></div>

            {/* Top Right Controls */}
            <div className="login-controls">
                {/* Font Size Toggle */}
                <button className="icon-btn" onClick={cycleFontSize} title="Change Font Size">
                    <Type size={18} />
                    <span className="lang-code">{fontSize === 'xl' ? 'XL' : fontSize.toUpperCase().charAt(0)}</span>
                </button>

                {/* Theme Toggle */}
                <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="login-card glass-panel bounce-in">

                <div className="login-header text-center flex flex-col items-center justify-center">
                    <img src={logo} alt="Logo" className="login-logo" />
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">

                    <div className={`input-group ${error ? 'error-glow' : ''}`}>
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className={`input-group ${error ? 'error-glow' : ''}`}>
                        <Lock className="input-icon" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-eye"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex="-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <div className="error-banner">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-btn primary-glass-btn" disabled={loading}>
                        {loading ? <div className="spinner-sm"></div> : (
                            <>
                                <span>Sign In</span>
                                <LogIn size={20} className="ml-2" />
                            </>
                        )}
                    </button>

                    <div className="forgot-password">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
                            Forgot Password?
                        </a>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;
