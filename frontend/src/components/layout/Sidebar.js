import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Repeat, Settings, FileText, Bell, Building, Shield, Briefcase, ArrowLeftRight, Activity } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import logo from '../../assets/logo.png';

const Sidebar = ({ isCollapsed }) => {


    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/dashboard/books', icon: Book, label: 'Books' },
        { path: '/dashboard/members', icon: Users, label: 'Students' },
        { path: '/dashboard/departments', icon: Building, label: 'Departments' },
        { path: '/dashboard/circulation', icon: ArrowLeftRight, label: 'Circulation Desk' },
        { path: '/dashboard/staff', icon: Briefcase, label: 'Staff' },
        { path: '/dashboard/transactions', icon: Repeat, label: 'Transactions' },
        { path: '/dashboard/policy', icon: Shield, label: 'Policies' },
        { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
        { path: '/dashboard/notifications', icon: Bell, label: 'Broadcast' },
        { path: '/dashboard/admins', icon: Shield, label: 'Admins' },
        { path: '/dashboard/audit', icon: Shield, label: 'Audit' },
        { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
        { path: '/dashboard/health', icon: Activity, label: 'System Health' },
    ];

    return (
        <aside className={`glass-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-brand">
                <img src={logo} alt="Logo" className="sidebar-logo" />
                <div className="brand-text">
                    <span className="brand-title">GPTK LMS</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
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
