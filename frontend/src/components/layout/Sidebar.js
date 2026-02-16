import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Repeat, Settings, FileText, Bell, Building, Shield, Briefcase, ArrowLeftRight, Activity } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import logo from '../../assets/logo.png';

const Sidebar = ({ isCollapsed }) => {
    const { t } = useLanguage();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard'), exact: true, permissions: [] }, // Always visible
        { path: '/dashboard/books', icon: Book, label: t('sidebar.books'), permissions: ['CATALOG'] },
        { path: '/dashboard/members', icon: Users, label: t('sidebar.students'), permissions: ['STUDENTS'] },
        { path: '/dashboard/departments', icon: Building, label: t('sidebar.departments'), permissions: ['DEPARTMENTS'] },
        { path: '/dashboard/circulation', icon: ArrowLeftRight, label: t('sidebar.circulation'), permissions: ['CIRCULATION'] },
        { path: '/dashboard/transactions', icon: Repeat, label: t('sidebar.transactions'), permissions: ['CIRCULATION'] },
        { path: '/dashboard/reports', icon: FileText, label: t('sidebar.reports'), permissions: ['REPORTS'] },
        { path: '/dashboard/notifications', icon: Bell, label: t('sidebar.broadcast'), permissions: ['ADMIN'] },
        { path: '/dashboard/staff', icon: Briefcase, label: t('sidebar.staff'), permissions: ['ADMIN'] },
        { path: '/dashboard/admins', icon: Shield, label: t('sidebar.admins'), permissions: ['ADMIN'] },
        { path: '/dashboard/audit', icon: Shield, label: t('sidebar.audit'), permissions: ['ADMIN'] },
        { path: '/dashboard/policy', icon: Shield, label: t('sidebar.policies'), permissions: ['ADMIN'] },
        { path: '/dashboard/settings', icon: Settings, label: t('sidebar.settings'), permissions: ['ADMIN'] },
        { path: '/dashboard/health', icon: Activity, label: t('sidebar.system_health'), permissions: ['ADMIN'] }
    ];

    // Get User Permissions
    const { currentUser } = useUser();
    const userRole = currentUser?.role || 'Guest';
    const userPermissions = currentUser?.permissions || [];

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
