import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, LogIn, Sun, Moon, Type, Globe, ArrowLeft, X } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import logo from '../assets/logo.png';
import LogoParticles from '../components/common/LogoParticles';
import InteractiveBG from '../components/common/InteractiveBG';

import StatusModal from '../components/common/StatusModal';
import API_BASE from '../config/apiConfig';
import { getProfileIconUrl } from '../utils/imageUtils';

const RECENT_LOGINS_KEY = 'recent_logins';
const MAX_RECENT = 5;

/** Read recent logins from localStorage */
const getRecentLogins = () => {
    try {
        const raw = localStorage.getItem(RECENT_LOGINS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/** Save a user to the recent logins list (deduped, max 5, most recent first) */
const saveRecentLogin = (user) => {
    const list = getRecentLogins().filter(u => u.email !== user.email);
    list.unshift({
        name: user.name,
        email: user.email,
        role: user.role,
        profile_icon: user.profile_icon || null
    });
    localStorage.setItem(RECENT_LOGINS_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
};

/** Remove one account from the list */
const removeRecentLogin = (email) => {
    const list = getRecentLogins().filter(u => u.email !== email);
    localStorage.setItem(RECENT_LOGINS_KEY, JSON.stringify(list));
    return list;
};

const LoginPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme, fontScale, setFontScale, highContrast } = usePreferences();
    const { t, language, toggleLanguage } = useLanguage();
    const { login } = useUser();
    const [showWarning, setShowWarning] = useState(false);
    const passwordRef = useRef(null);

    // Map numeric scale to labels
    const SCALE_MAP = { 85: 'S', 100: 'M', 115: 'L', 130: 'XL' };

    // Helper to cycle font sizes
    const cycleFontSize = () => {
        const scales = [85, 100, 115, 130];
        let currentIdx = scales.indexOf(fontScale);
        if (currentIdx === -1) currentIdx = 1;
        const nextIndex = (currentIdx + 1) % scales.length;
        setFontScale(scales[nextIndex]);
    };

    const handleThemeToggle = () => {
        if (highContrast) {
            setShowWarning(true);
            return;
        }
        toggleTheme();
    };

    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldError, setFieldError] = useState(''); // 'email' or 'password'
    const [shake, setShake] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recentLogins, setRecentLogins] = useState([]);

    // Load recent logins on mount
    useEffect(() => {
        setRecentLogins(getRecentLogins());
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
        setFieldError('');
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    /** Click a recent account chip — fill email, focus password */
    const handleSelectRecent = (account) => {
        setCredentials(prev => ({ ...prev, email: account.email, password: '' }));
        setError('');
        setFieldError('');
        // Focus password input after a tick (state needs to settle)
        setTimeout(() => {
            if (passwordRef.current) passwordRef.current.focus();
        }, 50);
    };

    /** Remove a recent account */
    const handleRemoveRecent = (e, email) => {
        e.stopPropagation(); // Don't trigger chip click
        setRecentLogins(removeRecentLogin(email));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFieldError('');

        try {
            const response = await axios.post(`${API_BASE}/api/auth/login`, credentials);

            // Success
            const { token, user } = response.data;
            login(user, token);

            // Save to recent logins list
            saveRecentLogin(user);

            navigate('/dashboard');
        } catch (err) {
            triggerShake();
            if (err.response) {
                const { message, error_code, field } = err.response.data;
                // Use backend message or map codes if needed
                setError(message || 'Login failed');

                // Highlight specific field if provided
                if (field) {
                    setFieldError(field);
                } else if (error_code === 'ERR_WRONG_PASSWORD') {
                    setFieldError('password');
                } else if (error_code === 'ERR_USER_NOT_FOUND') {
                    setFieldError('email');
                }
            } else {
                setError('Server unreachable. Check connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    /** Get initials for avatar fallback */
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="login-container">
            <InteractiveBG />

            {/* Top Right Controls */}
            <div className="login-controls">
                {/* Back Button */}
                <button className="icon-btn" onClick={() => navigate('/')} title={t('common.back') || "Go Back"}>
                    <ArrowLeft size={18} />
                    <span className="lang-code" style={{ fontSize: '0.9rem', marginLeft: '5px' }}>{t('common.back') || "Back"}</span>
                </button>

                {/* Language Toggle */}
                <button className="icon-btn" onClick={toggleLanguage} title="Switch Language">
                    <Globe size={18} />
                    <span className="lang-code">{language === 'en' ? 'KN' : 'EN'}</span>
                </button>

                {/* Font Size Toggle */}
                <button className="icon-btn" onClick={cycleFontSize} title={t('change_font_size')}>
                    <Type size={18} />
                    <span className="lang-code">{SCALE_MAP[fontScale] || 'C'}</span>
                </button>

                {/* Theme Toggle */}
                <button className="icon-btn" onClick={handleThemeToggle} title={t('toggle_theme')}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Login Row: Form + Recent Panel side by side */}
            <div className="login-row">
                <div className="login-card glass-panel bounce-in">

                    <LogoParticles
                        logoSrc={logo}
                        title={t('auth.welcome_back')}
                        subtitle={t('auth.sign_in_subtitle')}
                        compact
                    />

                    <form onSubmit={handleSubmit} className="login-form">

                        <div className={`input-group ${fieldError === 'email' ? 'error-glow' : ''} ${shake && fieldError === 'email' ? 'shake-animation' : ''}`}>
                            <Mail className={`input-icon ${fieldError === 'email' ? 'text-red-400' : ''}`} size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder={t('auth.email_placeholder')}
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                autoFocus={recentLogins.length === 0}
                            />
                        </div>

                        <div className={`input-group ${fieldError === 'password' ? 'error-glow' : ''} ${shake && fieldError === 'password' ? 'shake-animation' : ''}`}>
                            <Lock className={`input-icon ${fieldError === 'password' ? 'text-red-400' : ''}`} size={20} />
                            <input
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder={t('auth.password_placeholder')}
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
                            <div className={`error-banner ${shake && !fieldError ? 'shake-animation' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    {error}
                                </div>
                            </div>
                        )}

                        <button type="submit" className="login-btn primary-glass-btn" disabled={loading}>
                            {loading ? <div className="spinner-sm"></div> : (
                                <>
                                    <span>{t('auth.sign_in_btn')}</span>
                                    <LogIn size={20} className="ml-2" />
                                </>
                            )}
                        </button>

                        <div className="forgot-password">
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
                                {t('auth.forgot_password')}
                            </a>
                        </div>

                    </form>
                </div>

                {recentLogins.length > 0 && (
                    <div className="recent-logins-panel glass-panel bounce-in">
                        <div className="recent-logins-header">Recent</div>
                        <div className="recent-logins">
                            {recentLogins.map((account) => (
                                <button
                                    key={account.email}
                                    type="button"
                                    className={`recent-login-chip ${credentials.email === account.email ? 'active' : ''}`}
                                    onClick={() => handleSelectRecent(account)}
                                    title={account.email}
                                >
                                    <div className="chip-avatar">
                                        {account.profile_icon ? (
                                            <img src={getProfileIconUrl(account.profile_icon)} alt="" />
                                        ) : (
                                            <span>{getInitials(account.name)}</span>
                                        )}
                                    </div>
                                    <div className="chip-info">
                                        <span className="chip-name">{account.name}</span>
                                        <span className="chip-role">{account.role}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="chip-remove"
                                        onClick={(e) => handleRemoveRecent(e, account.email)}
                                        title="Remove"
                                    >
                                        <X size={14} />
                                    </button>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <StatusModal
                isOpen={showWarning}
                onClose={() => setShowWarning(false)}
                type="error"
                title={t('action_locked')}
                message={t('high_contrast_warning')}
            />
        </div>
    );
};

export default LoginPage;

