import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import StaffCard from '../components/staff/StaffCard';
import AddStaffModal from '../components/staff/AddStaffModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import GlassSelect from '../components/common/GlassSelect';

const StaffManager = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDesignation, setFilterDesignation] = useState('');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, data: null });

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                search,
                designation: filterDesignation
            }).toString();

            const res = await fetch(`http://localhost:3001/api/staff?${query}`);
            const data = await res.json();
            setStaffList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch staff", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [search, filterDesignation]);

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
            let res;
            if (action === 'toggle_status') {
                res = await fetch(`http://localhost:3001/api/staff/${data.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: data.newStatus })
                });
            } else if (action === 'delete') {
                res = await fetch(`http://localhost:3001/api/staff/${data.id}`, { method: 'DELETE' });
            }

            if (res.ok) {
                fetchStaff();
            } else {
                const err = await res.json();
                alert(`Action failed: ${err.error} (ERR_STF_ACT)`);
            }
        } catch (error) {
            console.error(error);
            alert("Network Error (ERR_NET_STF)");
        }
    };

    const getConfirmProps = () => {
        const { action, data } = confirmConfig;
        if (action === 'delete') return {
            title: "Delete Staff?",
            message: `Are you sure you want to delete ${data.name}? This is a soft delete.`,
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

    return (
        <div className="dashboard-content">
            {/* Header */}
            <div className="catalog-header">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={24} color="var(--primary-color)" /> Staff Management
                </h1>
                <div className="catalog-controls">
                    <div className="catalog-search" style={{ minWidth: '250px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                className="glass-input"
                                placeholder="Search Staff..."
                                style={{ paddingLeft: '45px', width: '100%' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <GlassSelect
                        options={[
                            { value: '', label: 'All Designations' },
                            { value: 'Librarian', label: 'Librarian' },
                            { value: 'Assistant Librarian', label: 'Assistant Librarian' },
                            { value: 'Counter Staff', label: 'Counter Staff' }
                        ]}
                        value={filterDesignation}
                        onChange={(val) => setFilterDesignation(val)}
                    />
                </div>
                <div>
                    <button className="primary-glass-btn" onClick={() => { setEditingStaff(null); setShowAddModal(true); }}>
                        <UserPlus size={18} style={{ marginRight: 8 }} /> Add New Staff
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                    ) : staffList.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No staff found matching criteria.</p>
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
                    onSave={fetchStaff}
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

export default StaffManager;
