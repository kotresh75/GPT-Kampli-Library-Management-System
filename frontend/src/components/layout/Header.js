import React from 'react';
import { Menu, LogOut, User, Sun, Moon, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';

const Header = ({ toggleSidebar, user }) => {
    const { theme, toggleTheme, fontSize, setFontSize } = usePreferences();
    const navigate = useNavigate();

    // Font size cycler
    const cycleFontSize = () => {
        const sizes = ['small', 'medium', 'large', 'xl'];
        const nextIndex = (sizes.indexOf(fontSize) + 1) % sizes.length;
        setFontSize(sizes[nextIndex]);
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        navigate('/login');
    };

    const handleThemeToggle = () => {
        toggleTheme();
    };

    return (
        <header className="glass-header">
            {/* Left: Sidebar Toggle & Institution Name */}
            <div className="header-left">
                <button className="icon-btn-ghost" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="ml-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Government Polytechnic, Kampli
                    </h2>
                </div>
            </div>

            {/* Right: Controls & Profile */}
            <div className="header-right">
                {/* Personalization Controls */}
                <div className="header-controls">
                    <button className="icon-btn-sm" onClick={cycleFontSize} title="Font Size">
                        <Type size={18} />
                        <span className="control-badge">{fontSize === 'xl' ? 'XL' : fontSize.toUpperCase()[0]}</span>
                    </button>
                    <button
                        className="icon-btn-sm"
                        onClick={handleThemeToggle}
                        title="Toggle Theme"
                        style={{ color: theme === 'dark' ? '#f1c40f' : 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                    >
                        {theme === 'dark' ? <Sun size={18} fill="#f1c40f" /> : <Moon size={18} />}
                    </button>
                </div>

                <div className="divider-vertical"></div>

                {/* User Profile */}
                <div className="user-profile">
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'Admin'}</span>
                        <span className="user-role">{user?.role || 'Profile'}</span>
                    </div>
                </div>

                <button className="icon-btn-danger" onClick={handleLogout} title="Logout">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
