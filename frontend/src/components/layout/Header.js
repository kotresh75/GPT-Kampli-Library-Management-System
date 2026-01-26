import React, { useState } from 'react';
import { Menu, LogOut, User, Sun, Moon, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { useLanguage } from '../../context/LanguageContext';
import StatusModal from '../common/StatusModal';
// Header Component
const Header = ({ toggleSidebar, user }) => {
    const { theme, toggleTheme, fontScale, setFontScale, highContrast } = usePreferences();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);

    // Map numeric scale to labels for display/cycling
    const SCALE_MAP = {
        85: 'S',
        100: 'M',
        115: 'L',
        130: 'XL'
    };

    // Font size cycler
    const cycleFontSize = () => {
        const scales = [85, 100, 115, 130];
        // Find closest current scale or default to 100
        let currentIdx = scales.indexOf(fontScale);
        if (currentIdx === -1) currentIdx = 1; // Default to medium if custom value

        const nextIndex = (currentIdx + 1) % scales.length;
        setFontScale(scales[nextIndex]);
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'kn' : 'en');
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        navigate('/login');
    };

    const handleThemeToggle = () => {
        if (highContrast) {
            setShowWarning(true);
            return;
        }
        toggleTheme();
    };

    return (
        <>
            <header className="glass-header">
                {/* Left: Sidebar Toggle & Institution Name */}
                <div className="header-left">
                    <button className="icon-btn-ghost" onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <div className="ml-4">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            {t('header.institution_name')}
                        </h2>
                    </div>
                </div>

                {/* Right: Controls & Profile */}
                <div className="header-right">
                    {/* Personalization Controls */}
                    <div className="header-controls">
                        <button className="icon-btn-sm" onClick={toggleLanguage} title={t('header.language')}>
                            <span className="control-badge" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {language === 'en' ? 'KN' : 'EN'}
                            </span>
                        </button>
                        <button className="icon-btn-sm" onClick={cycleFontSize} title={t('header.font_size')}>
                            <Type size={18} />
                            <span className="control-badge">{SCALE_MAP[fontScale] || 'C'}</span>
                        </button>
                        <button
                            className="icon-btn-sm"
                            onClick={handleThemeToggle}
                            title={t('header.toggle_theme')}
                            style={{ color: theme === 'dark' ? '#f1c40f' : 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                        >
                            {theme === 'dark' ? <Sun size={18} fill="#f1c40f" /> : <Moon size={18} />}
                        </button>
                    </div>

                    <div className="divider-vertical"></div>

                    {/* User Profile */}
                    <div className="user-profile" onClick={() => navigate('/dashboard/profile')} style={{ cursor: 'pointer' }}>
                        <div className="user-avatar">
                            <User size={20} />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'Admin'}</span>
                            <span className="user-role">{user?.role || 'Profile'}</span>
                        </div>
                    </div>

                    <button className="icon-btn-danger" onClick={handleLogout} title={t('common.logout')}>
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <StatusModal
                isOpen={showWarning}
                onClose={() => setShowWarning(false)}
                type="error"
                title="Action Locked"
                message="High Contrast Mode is on. Please turn it off in Settings > Appearance to change themes."
            />
        </>
    );
};

export default Header;
