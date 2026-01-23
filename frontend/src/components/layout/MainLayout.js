import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
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
                <Header toggleSidebar={toggleSidebar} user={user} />

                <main className="layout-scroll-container">
                    <div className="page-content">
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
