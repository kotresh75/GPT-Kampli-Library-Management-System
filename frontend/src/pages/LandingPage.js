import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Type, LogIn } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import logo from '../assets/logo.png';

import StatusModal from '../components/common/StatusModal';

const LandingPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme, fontScale, setFontScale, highContrast } = usePreferences();
    const [showWarning, setShowWarning] = useState(false);

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

    return (
        <div className="landing-container">
            {/* Background Animation Layer */}
            <div className="gradient-bg"></div>

            {/* Main Content Layout */}
            <div className="landing-panel glass-panel">

                {/* 1. Top Navigation Bar */}
                <header className="landing-header">
                    <div className="logo-section">
                        <img src={logo} alt="College Logo" className="college-logo" />
                        <div className="brand-info">
                            <span className="brand-name">GPTK LMS</span>
                            <span className="brand-tagline">v1.0.0</span>
                        </div>
                    </div>

                    <div className="header-actions flex gap-2">
                        {/* Font Size Toggle */}
                        <button className="icon-btn" onClick={cycleFontSize} title="Change Font Size">
                            <Type size={18} />
                            <span className="lang-code">{SCALE_MAP[fontScale] || 'C'}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button className="icon-btn" onClick={handleThemeToggle} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </header>

                {/* 2. Hero Content */}
                <main className="landing-hero">
                    <div className="hero-text-group">
                        <h1 className="hero-title">
                            Welcome to GPTK Library
                        </h1>
                        <h2 className="hero-subtitle-gradient">
                            Your Gateway to Knowledge
                        </h2>
                    </div>

                    <p className="hero-description">
                        Access thousands of books, resources, and digital assets. Manage your library account seamlessly.
                    </p>

                    {/* 3. Call to Action */}
                    <div className="cta-section">
                        <button className="primary-glass-btn" onClick={() => navigate('/login')}>
                            <span className="flex items-center gap-2">
                                Access Portal <LogIn size={20} />
                            </span>
                        </button>
                        <p className="login-hint">
                            Restricted to Staff & Administrators
                        </p>
                    </div>
                </main>

                <footer className="landing-footer">
                    <p className="copyright">© {new Date().getFullYear()} Government Polytechnic Kampli. All Rights Reserved.</p>
                </footer>
            </div>

            <StatusModal
                isOpen={showWarning}
                onClose={() => setShowWarning(false)}
                type="error"
                title="Action Locked"
                message="High Contrast Mode is on. Please turn it off in Settings > Appearance to change themes."
            />
        </div>
    );
};

export default LandingPage;
