import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Briefcase, Lock, Check } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';

const PERMISSIONS_LIST = [
    { id: 'CATALOG', label: 'Catalog Access (Add/Edit Books)', description: 'Can manage book inventory' },
    { id: 'CIRCULATION', label: 'Circulation Access', description: 'Can issue and return books' },
    { id: 'STUDENTS', label: 'Student Management', description: 'Can add/edit student records' },
    { id: 'FINES', label: 'Fine Management', description: 'Can collect or waive fines' },
    { id: 'REPORTS', label: 'Reports Access', description: 'Can view system analytics' }
];

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

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const current = prev.access_permissions;
            if (current.includes(permId)) {
                return { ...prev, access_permissions: current.filter(p => p !== permId) };
            } else {
                return { ...prev, access_permissions: [...current, permId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEdit
                ? `http://localhost:3001/api/staff/${staff.id}`
                : `http://localhost:3001/api/staff`;

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                onSave();
                onClose();
            } else {
                setError((data.error || "Operation failed") + " (ERR_STF_ADD)");
            }
        } catch (err) {
            setError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!isEdit) return;
        if (!window.confirm("Are you sure you want to reset the password for this staff member?")) return;
        try {
            const res = await fetch(`http://localhost:3001/api/staff/${staff.id}/reset-password`, { method: 'POST' });
            if (res.ok) alert("Password reset to 'password123'");
            else alert("Failed to reset password");
        } catch (e) { alert("Network Error"); }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
            <div className="glass-panel bounce-in" style={{ width: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>

                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <User size={20} /> {isEdit ? 'Edit Staff' : 'New Staff'}
                    </h2>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                <div style={{ padding: '25px', overflowY: 'auto' }}>
                    {error && (
                        <div style={{ background: 'rgba(252, 129, 129, 0.2)', color: '#fc8181', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                            {error}
                        </div>
                    )}

                    <form id="staff-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label className="field-label">Full Name *</label>
                                <input
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="field-label">Email Address *</label>
                                <input
                                    type="email"
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={isEdit}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label className="field-label">Phone Number</label>
                                <input
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="field-label">Designation</label>
                                <GlassSelect
                                    options={[
                                        { value: 'Librarian', label: 'Librarian' },
                                        { value: 'Assistant Librarian', label: 'Assistant Librarian' },
                                        { value: 'Counter Staff', label: 'Counter Staff' },
                                        { value: 'Data Entry', label: 'Data Entry' }
                                    ]}
                                    value={formData.designation}
                                    onChange={(val) => setFormData({ ...formData, designation: val })}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <label className="field-label" style={{ marginBottom: '10px', display: 'block' }}>Access Permissions</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {PERMISSIONS_LIST.map(perm => {
                                    const isSelected = formData.access_permissions.includes(perm.id);
                                    return (
                                        <div
                                            key={perm.id}
                                            onClick={() => handlePermissionToggle(perm.id)}
                                            style={{
                                                padding: '12px', borderRadius: '8px',
                                                border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                                background: isSelected ? 'rgba(66, 153, 225, 0.1)' : 'rgba(255,255,255,0.02)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '4px',
                                                border: '2px solid var(--text-secondary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: isSelected ? 'var(--primary-color)' : 'transparent',
                                                borderColor: isSelected ? 'var(--primary-color)' : 'var(--text-secondary)'
                                            }}>
                                                {isSelected && <Check size={14} color="white" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{perm.label}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{perm.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </form>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                        {isEdit && (
                            <button type="button" onClick={handleResetPassword} className="icon-btn" style={{ fontSize: '0.85rem', color: '#fc8181', display: 'flex', gap: 6, alignItems: 'center', padding: '6px 12px' }}>
                                <Lock size={14} /> Reset Password
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} className="icon-btn-ghost">Cancel</button>
                        <button type="submit" form="staff-form" className="primary-glass-btn" disabled={loading}>
                            {loading ? 'Saving...' : <><Save size={18} style={{ marginRight: 8 }} /> {isEdit ? 'Update Staff' : 'Create Staff'}</>}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AddStaffModal;
