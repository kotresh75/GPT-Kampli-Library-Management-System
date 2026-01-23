import React, { useState, useEffect } from 'react';
import { Search, Shield, Plus, Lock } from 'lucide-react';
import AdminCard from '../components/admin/AdminCard';
import AddAdminModal from '../components/admin/AddAdminModal';
import ConfirmationModal from '../components/common/ConfirmationModal';

const AdminManager = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modals 
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, data: null });

    // Functions
    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/admins');
            const data = await res.json();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch admins", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Filter Logic
    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(search.toLowerCase()) ||
        admin.email.toLowerCase().includes(search.toLowerCase())
    );

    // Handlers
    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setShowAddModal(true);
    };

    const handleToggleStatus = (admin) => {
        const newStatus = admin.status === 'Active' ? 'Disabled' : 'Active';
        const action = newStatus === 'Active' ? 'enable' : 'disable';
        setConfirmConfig({
            show: true,
            action: 'toggle_status',
            data: { id: admin.id, name: admin.name, newStatus, action }
        });
    };

    const handleDelete = (admin) => {
        setConfirmConfig({ show: true, action: 'delete', data: admin });
    };

    const handleResetPassword = (admin) => {
        setConfirmConfig({ show: true, action: 'reset_password', data: admin });
    };

    const executeConfirmation = async () => {
        const { action, data } = confirmConfig;
        setConfirmConfig({ show: false, action: null, data: null }); // Close modal immediately

        if (action === 'alert') return;

        try {
            let res;
            if (action === 'toggle_status') {
                res = await fetch(`http://localhost:3001/api/admins/${data.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: data.newStatus })
                });
            } else if (action === 'delete') {
                res = await fetch(`http://localhost:3001/api/admins/${data.id}`, { method: 'DELETE' });
            } else if (action === 'reset_password') {
                res = await fetch(`http://localhost:3001/api/admins/${data.id}/reset-password`, { method: 'POST' });
            }

            if (res.ok) {
                fetchAdmins();
                if (action === 'reset_password') {
                    alert(`Password for ${data.name} has been reset to default 'password123'.`);
                }
            } else {
                const err = await res.json();
                alert(`Action failed: ${err.error} (ERR_ADM_ACT)`);
            }
        } catch (error) {
            console.error(error);
            alert("Network Error (ERR_NET_ADM)");
        }
    };

    // Helper for modal props
    const getConfirmProps = () => {
        const { action, data } = confirmConfig;
        if (action === 'delete') return {
            title: "Delete Admin?",
            message: `Are you sure you want to delete ${data.name}? This cannot be undone.`,
            confirmText: "Delete", isDanger: true
        };
        if (action === 'toggle_status') return {
            title: `${data.action === 'enable' ? 'Enable' : 'Disable'} Admin?`,
            message: `Are you sure you want to ${data.action} ${data.name}?`,
            confirmText: data.action === 'enable' ? 'Enable' : 'Disable',
            isDanger: data.action === 'disable'
        };
        if (action === 'reset_password') return {
            title: "Reset Password?",
            message: `Reset password for ${data.name}? It will be set to 'password123'.`,
            confirmText: "Reset Password", isDanger: true
        };
        return {};
    };

    return (
        <div className="dashboard-content">
            {/* Header */}
            <div className="catalog-header">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={24} color="#f6e05e" /> Admin Management
                </h1>
                <div className="catalog-controls">
                    <div className="catalog-search" style={{ minWidth: '300px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                className="glass-input"
                                placeholder="Search Admins..."
                                style={{ paddingLeft: '45px', width: '100%' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <button className="primary-glass-btn" onClick={() => { setEditingAdmin(null); setShowAddModal(true); }}>
                        <Plus size={18} style={{ marginRight: 8 }} /> Create New Admin
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                    ) : filteredAdmins.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No admins found.</p>
                    ) : (
                        filteredAdmins.map(admin => (
                            <AdminCard
                                key={admin.id}
                                admin={admin}
                                onEdit={handleEdit}
                                onToggleStatus={handleToggleStatus}
                                onDelete={handleDelete}
                                onResetPassword={handleResetPassword}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddAdminModal
                    admin={editingAdmin}
                    onClose={() => setShowAddModal(false)}
                    onSave={fetchAdmins}
                />
            )}

            <ConfirmationModal
                isOpen={confirmConfig.show}
                onClose={() => setConfirmConfig({ ...confirmConfig, show: false })}
                onConfirm={executeConfirmation}
                {...getConfirmProps()}
            />
        </div>
    );
};

export default AdminManager;
