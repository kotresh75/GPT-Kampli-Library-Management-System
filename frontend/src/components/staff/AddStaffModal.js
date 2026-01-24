import React, { useState, useEffect } from 'react';
import { X, Save, User, Lock, Check, Zap, Shield, AlertCircle, CheckCircle, Info } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import ConfirmationModal from '../common/ConfirmationModal';
import StatusModal from '../common/StatusModal';
import '../../styles/components/smart-form-modal.css';

const PERMISSIONS_LIST = [
    { id: 'CATALOG', label: 'Catalog Access', description: 'Can manage book inventory (add/edit books)' },
    { id: 'CIRCULATION', label: 'Circulation & Fines', description: 'Can issue/return books and collect fines' },
    { id: 'STUDENTS', label: 'Student Management', description: 'Can add/edit student records' },
    { id: 'DEPARTMENTS', label: 'Department Management', description: 'Can manage department list' },
    { id: 'REPORTS', label: 'Reports Access', description: 'Can view system analytics and reports' }
];

// Smart role presets based on designation
const ROLE_PRESETS = {
    'Librarian': {
        permissions: ['CATALOG', 'CIRCULATION', 'STUDENTS', 'DEPARTMENTS', 'REPORTS'],
        description: 'Full access to all library operations'
    },
    'Assistant Librarian': {
        permissions: ['CATALOG', 'CIRCULATION', 'STUDENTS', 'DEPARTMENTS'],
        description: 'Access to catalog, circulation, students, and departments'
    },
    'Counter Staff': {
        permissions: ['CIRCULATION'],
        description: 'Access to book circulation and fine collection'
    },
    'Data Entry': {
        permissions: ['CATALOG', 'STUDENTS'],
        description: 'Access to catalog and student data entry'
    }
};

const AddStaffModal = ({ staff, onClose, onSave }) => {
    const isEdit = !!staff;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        designation: '',
        access_permissions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPresetHint, setShowPresetHint] = useState(false);

    // Modals
    const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null });
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        if (staff) {
            setFormData({
                name: staff.name || '',
                email: staff.email || '',
                phone: staff.phone || '',
                designation: staff.designation || '',
                access_permissions: staff.access_permissions || []
            });
        }
    }, [staff]);

    // Handle designation change and suggest permissions
    const handleDesignationChange = (designation) => {
        setFormData(prev => ({ ...prev, designation }));
        if (!isEdit && ROLE_PRESETS[designation]) {
            setShowPresetHint(true);
        }
    };

    // Apply role preset
    const applyRolePreset = () => {
        const preset = ROLE_PRESETS[formData.designation];
        if (preset) {
            setFormData(prev => ({ ...prev, access_permissions: [...preset.permissions] }));
            setShowPresetHint(false);
        }
    };

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const current = prev.access_permissions;
            if (current.includes(permId)) {
                return { ...prev, access_permissions: current.filter(p => p !== permId) };
            } else {
                return { ...prev, access_permissions: [...current, permId] };
            }
        });
        setShowPresetHint(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Please enter a valid name');
            return;
        }
        if (!formData.email.trim()) {
            setError('Please enter an email address');
            return;
        }
        if (!formData.designation) {
            setError('Please select a designation');
            return;
        }
        if (formData.access_permissions.length === 0) {
            setError('Please select at least one permission');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const url = isEdit
                ? `http://localhost:3001/api/staff/${staff.id}`
                : `http://localhost:3001/api/staff`;

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    phone: formData.phone.replace(/\s/g, '')
                })
            });

            const data = await res.json();

            if (res.ok) {
                onSave();
                onClose();
            } else {
                setError((data.error || "Operation failed") + " (ERR_STF_ADD)");
            }
        } catch (err) {
            setError("Network Error - Please check if backend is running");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = () => {
        if (!isEdit) return;
        setConfirmConfig({ show: true, action: 'reset_password' });
    };

    const executeResetPassword = async () => {
        setConfirmConfig({ show: false, action: null });
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/staff/${staff.id}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setStatusModal({
                    show: true,
                    type: 'success',
                    title: 'Password Reset',
                    message: "Password has been reset to 'password123'"
                });
            } else {
                setStatusModal({
                    show: true,
                    type: 'error',
                    title: 'Reset Failed',
                    message: 'Failed to reset password. Please try again.'
                });
            }
        } catch (e) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Network Error',
                message: 'Unable to connect to server.'
            });
        }
    };

    return (
        <div className="smart-form-overlay" onClick={onClose}>
            <div className="smart-form-modal" onClick={e => e.stopPropagation()} style={{ width: '650px' }}>

                {/* Header */}
                <div className="smart-form-header">
                    <h2>
                        <div style={{ width: 32, height: 32, background: 'var(--primary-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} color="white" />
                        </div>
                        {isEdit ? 'Edit Staff' : 'Add New Staff'}
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {error && (
                        <div className="validation-msg" style={{ padding: '12px', background: 'rgba(252, 129, 129, 0.15)', borderRadius: '8px' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form id="staff-form" onSubmit={handleSubmit}>

                        {/* Name & Email Row */}
                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    className="smart-input"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Email Address *</label>
                                <input
                                    type="email"
                                    className="smart-input"
                                    placeholder="staff@library.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={isEdit}
                                />
                            </div>
                        </div>

                        {/* Phone & Designation Row */}
                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    className="smart-input"
                                    placeholder="98765 43210"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Designation *</label>
                                <GlassSelect
                                    options={[
                                        { value: 'Librarian', label: 'Librarian' },
                                        { value: 'Assistant Librarian', label: 'Assistant Librarian' },
                                        { value: 'Counter Staff', label: 'Counter Staff' },
                                        { value: 'Data Entry', label: 'Data Entry' }
                                    ]}
                                    value={formData.designation}
                                    onChange={handleDesignationChange}
                                    placeholder="Select role..."
                                />
                            </div>
                        </div>

                        {/* Smart Preset Hint */}
                        {showPresetHint && ROLE_PRESETS[formData.designation] && (
                            <div style={{
                                background: 'rgba(66, 153, 225, 0.1)',
                                border: '1px solid rgba(66, 153, 225, 0.3)',
                                borderRadius: '10px',
                                padding: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(66, 153, 225, 0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Zap size={20} color="var(--primary-color)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>Smart Preset Available</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {ROLE_PRESETS[formData.designation].description}
                                    </div>
                                </div>
                                <button type="button" onClick={applyRolePreset} className="btn-submit" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                    Apply
                                </button>
                            </div>
                        )}

                        {/* Permissions Section */}
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>
                                    <Shield size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Access Permissions *
                                </label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {formData.access_permissions.length} of {PERMISSIONS_LIST.length} selected
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {PERMISSIONS_LIST.map(perm => {
                                    const isSelected = formData.access_permissions.includes(perm.id);
                                    return (
                                        <div
                                            key={perm.id}
                                            onClick={() => handlePermissionToggle(perm.id)}
                                            style={{
                                                padding: '14px', borderRadius: '10px',
                                                border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                                background: isSelected ? 'rgba(66, 153, 225, 0.1)' : 'rgba(255,255,255,0.02)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px', height: '22px', borderRadius: '6px',
                                                border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--text-secondary)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: isSelected ? 'var(--primary-color)' : 'transparent',
                                                transition: 'all 0.2s ease', flexShrink: 0
                                            }}>
                                                {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{perm.label}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{perm.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info Note */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px',
                            background: 'rgba(159, 122, 234, 0.1)', borderRadius: '8px',
                            fontSize: '0.8rem', color: 'var(--text-secondary)'
                        }}>
                            <Info size={16} color="#9f7aea" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>
                                {isEdit
                                    ? 'Changes will take effect immediately.'
                                    : 'Default password is "password123" - staff should change it on first login.'
                                }
                            </span>
                        </div>

                        {/* Footer - Inside Form */}
                        <div className="smart-form-footer" style={{ margin: '0 -24px -24px -24px', padding: '20px 24px' }}>
                            {isEdit ? (
                                <button type="button" onClick={handleResetPassword} className="btn-cancel" style={{ color: '#fc8181', borderColor: '#fc8181' }}>
                                    <Lock size={14} style={{ marginRight: 6 }} /> Reset Password
                                </button>
                            ) : <div></div>}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Saving...' : <><Save size={18} /> {isEdit ? 'Update Staff' : 'Save Staff'}</>}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>

            </div>

            <ConfirmationModal
                isOpen={confirmConfig.show}
                onClose={() => setConfirmConfig({ ...confirmConfig, show: false })}
                onConfirm={confirmConfig.action === 'reset_password' ? executeResetPassword : () => { }}
                title="Reset Password?"
                message="Are you sure you want to reset this staff member's password to 'password123'?"
                confirmText="Reset Password"
                isDanger={true}
            />

            <StatusModal
                isOpen={statusModal.show}
                onClose={() => setStatusModal({ ...statusModal, show: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />

        </div>
    );
};

export default AddStaffModal;
