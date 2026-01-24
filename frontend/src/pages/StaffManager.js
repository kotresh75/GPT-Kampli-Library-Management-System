import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, CheckCircle, XCircle, Activity, TrendingUp, Filter } from 'lucide-react';
import StaffCard from '../components/staff/StaffCard';
import AddStaffModal from '../components/staff/AddStaffModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import StatusModal from '../components/common/StatusModal';
import GlassSelect from '../components/common/GlassSelect';

const StaffManager = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDesignation, setFilterDesignation] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        disabled: 0,
        totalTransactions: 0
    });

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, data: null });

    // Status Modal
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const query = new URLSearchParams({
                search,
                designation: filterDesignation,
                status: filterStatus
            }).toString();

            const res = await fetch(`http://localhost:3001/api/staff?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const staffData = Array.isArray(data) ? data : [];
            setStaffList(staffData);

            // Calculate stats from all staff (not filtered)
            if (!search && !filterDesignation && !filterStatus) {
                const activeCount = staffData.filter(s => s.status === 'Active').length;
                const disabledCount = staffData.filter(s => s.status === 'Disabled').length;
                const totalTxn = staffData.reduce((sum, s) => sum + (s.transaction_count || 0), 0);
                setStats({
                    total: staffData.length,
                    active: activeCount,
                    disabled: disabledCount,
                    totalTransactions: totalTxn
                });
            }
        } catch (err) {
            console.error("Failed to fetch staff", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats separately on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch(`http://localhost:3001/api/staff/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [search, filterDesignation, filterStatus]);

    // Handlers
    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setShowAddModal(true);
    };

    const handleToggleStatus = (staff) => {
        const newStatus = staff.status === 'Active' ? 'Disabled' : 'Active';
        const action = newStatus === 'Active' ? 'enable' : 'disable';
        setConfirmConfig({
            show: true,
            action: 'toggle_status',
            data: { id: staff.id, name: staff.name, newStatus, action }
        });
    };

    const handleDelete = (staff) => {
        setConfirmConfig({ show: true, action: 'delete', data: staff });
    };

    const executeConfirmation = async () => {
        const { action, data } = confirmConfig;
        setConfirmConfig({ show: false, action: null, data: null });

        try {
            const token = localStorage.getItem('auth_token');
            let res;
            if (action === 'toggle_status') {
                res = await fetch(`http://localhost:3001/api/staff/${data.id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: data.newStatus })
                });
            } else if (action === 'delete') {
                res = await fetch(`http://localhost:3001/api/staff/${data.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            if (res.ok) {
                fetchStaff();
                setStatusModal({
                    show: true,
                    type: 'success',
                    title: action === 'delete' ? 'Staff Deleted' : 'Status Updated',
                    message: action === 'delete'
                        ? `${data.name} has been permanently deleted.`
                        : `${data.name} has been ${data.action}d successfully.`
                });
            } else {
                const err = await res.json();
                setStatusModal({
                    show: true,
                    type: 'error',
                    title: 'Action Failed',
                    message: err.error || 'An error occurred while performing this action.'
                });
            }
        } catch (error) {
            console.error(error);
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Network Error',
                message: 'Unable to connect to server. Please check your connection.'
            });
        }
    };

    const getConfirmProps = () => {
        const { action, data } = confirmConfig;
        if (action === 'delete') return {
            title: "Delete Staff Permanently?",
            message: `Are you sure you want to permanently delete ${data.name}? This action cannot be undone.`,
            confirmText: "Delete", isDanger: true
        };
        if (action === 'toggle_status') return {
            title: `${data.action === 'enable' ? 'Enable' : 'Disable'} Staff?`,
            message: `Are you sure you want to ${data.action} ${data.name}?`,
            confirmText: data.action === 'enable' ? 'Enable' : 'Disable',
            isDanger: data.action === 'disable'
        };
        return {};
    };

    // Stats Card Component
    const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
        <div className="glass-panel" style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flex: 1,
            minWidth: '200px'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} color={color} />
            </div>
            <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</div>
                {subtext && <div style={{ fontSize: '0.75rem', color: color, marginTop: '2px' }}>{subtext}</div>}
            </div>
        </div>
    );

    return (
        <div className="dashboard-content">
            {/* Header & Toolbar */}
            <div className="mb-6">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 12, marginBottom: '5px' }}>
                    <Users size={28} className="text-blue-400" /> Staff Management
                </h1>
                <p className="text-white/60">Manage library staff, permissions, and accounts.</p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <div className="catalog-toolbar">
                    <div className="toolbar-search" style={{ flex: 1 }}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search Staff by Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="w-[200px]">
                        <GlassSelect
                            options={[
                                { value: '', label: 'All Designations' },
                                { value: 'Librarian', label: 'Librarian' },
                                { value: 'Assistant Librarian', label: 'Assistant Librarian' },
                                { value: 'Counter Staff', label: 'Counter Staff' },
                                { value: 'Data Entry', label: 'Data Entry' }
                            ]}
                            value={filterDesignation}
                            onChange={(val) => setFilterDesignation(val)}
                            icon={Filter}
                        />
                    </div>

                    <div className="w-[180px]">
                        <GlassSelect
                            options={[
                                { value: '', label: 'All Status' },
                                { value: 'Active', label: 'Active' },
                                { value: 'Disabled', label: 'Disabled' }
                            ]}
                            value={filterStatus}
                            onChange={(val) => setFilterStatus(val)}
                            icon={Filter}
                        />
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2"></div>

                    <button className="toolbar-primary-btn whitespace-nowrap" onClick={() => { setEditingStaff(null); setShowAddModal(true); }}>
                        <UserPlus size={20} /> Add New Staff
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '20px', padding: '20px', flexWrap: 'wrap' }}>
                <StatCard
                    icon={Users}
                    label="Total Staff"
                    value={stats.total}
                    color="#4299e1"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Active Staff"
                    value={stats.active}
                    color="#48bb78"
                    subtext={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of total` : ''}
                />
                <StatCard
                    icon={XCircle}
                    label="Disabled Staff"
                    value={stats.disabled}
                    color="#fc8181"
                />
                <StatCard
                    icon={Activity}
                    label="Total Transactions"
                    value={stats.totalTransactions}
                    color="#9f7aea"
                    subtext="Books issued/returned"
                />
            </div>

            {/* Grid */}
            <div style={{ flex: 1, padding: '20px', paddingTop: 0, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        // Skeleton loaders
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: '16px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
                                        <div style={{ height: '12px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                    </div>
                                </div>
                                <div style={{ height: '12px', width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                <div style={{ height: '12px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        ))
                    ) : staffList.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                            <Users size={48} color="var(--text-secondary)" style={{ marginBottom: '15px', opacity: 0.5 }} />
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No staff found matching criteria.</p>
                            <button
                                className="primary-glass-btn"
                                style={{ marginTop: '20px' }}
                                onClick={() => { setEditingStaff(null); setShowAddModal(true); }}
                            >
                                <UserPlus size={18} style={{ marginRight: 8 }} /> Add First Staff Member
                            </button>
                        </div>
                    ) : (
                        staffList.map(staff => (
                            <StaffCard
                                key={staff.id}
                                staff={staff}
                                onEdit={handleEdit}
                                onToggleStatus={handleToggleStatus}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddStaffModal
                    staff={editingStaff}
                    onClose={() => setShowAddModal(false)}
                    onSave={() => { fetchStaff(); }}
                />
            )}

            <ConfirmationModal
                isOpen={confirmConfig.show}
                onClose={() => setConfirmConfig({ ...confirmConfig, show: false })}
                onConfirm={executeConfirmation}
                {...getConfirmProps()}
            />

            <StatusModal
                isOpen={statusModal.show}
                onClose={() => setStatusModal({ ...statusModal, show: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                autoClose={3000}
            />
        </div>
    );
};

export default StaffManager;
