import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

import HelpModal from '../common/HelpModal';

const MainLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [user, setUser] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Global Keyboard Shortcut for Help (F12) - Only for Circulation
        const handleKeyDown = (e) => {
            if (e.key === 'F12') {
                if (window.location.hash.includes('circulation')) { // HashRouter uses #
                    e.preventDefault();
                    setIsHelpOpen(prev => !prev);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="app-container">
            {/* TitleBar is now global in App.js */}
            <div className="dashboard-layout">
                <div className="layout-sidebar">
                    <Sidebar isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Mobile Overlay Backdrop */}
                {!isSidebarCollapsed && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                <div className={`layout-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
                    <Header toggleSidebar={toggleSidebar} user={user} onHelpClick={() => setIsHelpOpen(true)} />

                    <main className="layout-scroll-container">
                        <div className="page-content">
                            <Outlet />
                        </div>
                        <Footer />
                    </main>
                </div>
            </div>

            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
    );
};

export default MainLayout;
