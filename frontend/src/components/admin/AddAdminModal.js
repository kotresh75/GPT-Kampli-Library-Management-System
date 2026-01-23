import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Shield } from 'lucide-react';

const AddAdminModal = ({ admin, onClose, onSave }) => {
    const isEdit = !!admin;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (admin) {
            setFormData({
                name: admin.name || '',
                email: admin.email || '', // Email usually read-only in edit for security, but allow for now? Maybe lock email.
                phone: admin.phone || ''
            });
        }
    }, [admin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEdit
                ? `http://localhost:3001/api/admins/${admin.id}`
                : `http://localhost:3001/api/admins`;

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
                setError(data.error || "Operation failed");
            }
        } catch (err) {
            setError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
            <div className="glass-panel bounce-in" style={{ width: '450px', padding: 0, background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>

                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Shield size={20} /> {isEdit ? 'Edit Admin' : 'New Admin'}
                    </h2>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                <div style={{ padding: '25px' }}>
                    {error && (
                        <div style={{ background: 'rgba(252, 129, 129, 0.2)', color: '#fc8181', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                            {error}
                        </div>
                    )}

                    <form id="admin-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <div>
                            <label className="field-label"><User size={14} /> Full Name *</label>
                            <input
                                className="glass-input"
                                style={{ width: '100%' }}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="field-label"><Mail size={14} /> Email Address *</label>
                            <input
                                type="email"
                                className="glass-input"
                                style={{ width: '100%' }}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isEdit} // Prevent email change on edit to preserve identity
                                title={isEdit ? "Email cannot be changed" : ""}
                            />
                        </div>
                        <div>
                            <label className="field-label"><Phone size={14} /> Phone Number</label>
                            <input
                                className="glass-input"
                                style={{ width: '100%' }}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </form>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(255,255,255,0.02)' }}>
                    <button onClick={onClose} className="icon-btn-ghost">Cancel</button>
                    <button type="submit" form="admin-form" className="primary-glass-btn" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} style={{ marginRight: 8 }} /> {isEdit ? 'Update' : 'Create Admin'}</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddAdminModal;
