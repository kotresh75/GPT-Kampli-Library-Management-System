import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Repeat, Settings, FileText, Bell, Building, Shield, Briefcase, ArrowLeftRight, Activity } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import logo from '../../assets/logo.png';

const Sidebar = ({ isCollapsed }) => {


    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true, permissions: [] }, // Always visible
        { path: '/dashboard/books', icon: Book, label: 'Books', permissions: ['CATALOG'] },
        { path: '/dashboard/members', icon: Users, label: 'Students', permissions: ['STUDENTS'] },
        { path: '/dashboard/departments', icon: Building, label: 'Departments', permissions: ['DEPARTMENTS'] },
        { path: '/dashboard/circulation', icon: ArrowLeftRight, label: 'Circulation Desk', permissions: ['CIRCULATION'] },
        { path: '/dashboard/transactions', icon: Repeat, label: 'Transactions', permissions: ['CIRCULATION'] },
        { path: '/dashboard/reports', icon: FileText, label: 'Reports', permissions: ['REPORTS'] },
        { path: '/dashboard/notifications', icon: Bell, label: 'Broadcast', permissions: ['ADMIN'] },
        { path: '/dashboard/staff', icon: Briefcase, label: 'Staff', permissions: ['ADMIN'] },
        { path: '/dashboard/admins', icon: Shield, label: 'Admins', permissions: ['ADMIN'] },
        { path: '/dashboard/audit', icon: Shield, label: 'Audit', permissions: ['ADMIN'] },
        { path: '/dashboard/policy', icon: Shield, label: 'Policies', permissions: ['ADMIN'] },
        { path: '/dashboard/settings', icon: Settings, label: 'Settings', permissions: ['ADMIN'] },
        { path: '/dashboard/health', icon: Activity, label: 'System Health', permissions: ['ADMIN'] }
    ];

    // Get User Permissions
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userRole = userInfo.role || 'Guest';
    const userPermissions = userInfo.permissions || [];

    // Filter Items
    const filteredMenu = menuItems.filter(item => {
        // 1. Everyone sees dashboard
        if (item.permissions.length === 0) return true;

        // 2. Admins see everything
        if (userRole === 'Admin') return true;

        // 3. Staff check permissions
        if (userRole === 'Staff') {
            // If item requires 'ADMIN' permission explicitly, hide it from Staff
            if (item.permissions.includes('ADMIN')) return false;

            // Otherwise, check if user has at least one of the required permissions
            return item.permissions.some(p => userPermissions.includes(p));
        }

        return false;
    });

    return (
        <aside className={`glass-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-brand">
                <img src={logo} alt="Logo" className="sidebar-logo" />
                <div className="brand-text">
                    <span className="brand-title">GPTK LMS</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {filteredMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.label : ''} // Tooltip on collapse
                    >
                        <item.icon size={22} className="sidebar-icon" />
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
