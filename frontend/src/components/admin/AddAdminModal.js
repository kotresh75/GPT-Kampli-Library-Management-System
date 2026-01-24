import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, User, Mail, Phone, Shield, AlertCircle } from 'lucide-react';
import '../../styles/components/smart-form-modal.css';

const AddAdminModal = ({ admin, onClose, onSave }) => {
    const isEdit = !!admin;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (admin) {
            setFormData({
                name: admin.name || '',
                email: admin.email || '',
                phone: admin.phone || ''
            });
        }
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
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
            const token = localStorage.getItem('auth_token');

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    if (!isReady) return null;

    return ReactDOM.createPortal(
        <div className="smart-form-overlay" onClick={onClose}>
            <div className="smart-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>

                {/* Header */}
                <div className="smart-form-header">
                    <h2>
                        <div style={{ width: 32, height: 32, background: 'var(--primary-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={18} color="white" />
                        </div>
                        {isEdit ? 'Edit Admin' : 'New Admin'}
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {error && <div className="validation-msg"><AlertCircle size={14} /> {error}</div>}

                    <form id="admin-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

                        <div className="form-group">
                            <label className="form-label"><User size={14} className="inline mr-1" /> Full Name</label>
                            <input
                                className="smart-input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. System Administrator"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label"><Mail size={14} className="inline mr-1" /> Email Address</label>
                            <input
                                type="email"
                                className="smart-input"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="e.g. admin@library.com"
                                required
                                disabled={isEdit}
                                title={isEdit ? "Email cannot be changed" : ""}
                            />
                            {isEdit && <span className="text-xs text-white/40 mt-1 block pl-1">Email cannot be changed after creation.</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label"><Phone size={14} className="inline mr-1" /> Phone Number</label>
                            <input
                                className="smart-input"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="smart-form-footer">
                    <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                    <button type="submit" form="admin-form" className="btn-submit" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} /> {isEdit ? 'Update' : 'Create Admin'}</>}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default AddAdminModal;
