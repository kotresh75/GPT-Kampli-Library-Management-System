import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, User, Mail, Phone, Shield, AlertCircle, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/components/smart-form-modal.css';

const TOTAL_ICONS = 15;

const AddAdminModal = ({ admin, onClose, onSave }) => {
    const { t } = useLanguage();
    const isEdit = !!admin;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profile_icon: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [icons, setIcons] = useState([]);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        fetch('http://localhost:17221/api/utils/icons')
            .then(res => res.json())
            .then(data => setIcons(Array.isArray(data) ? data : []))
            .catch(err => console.error("Failed to fetch icons", err));
    }, []);

    useEffect(() => {
        if (admin) {
            setFormData({
                name: admin.name || '',
                email: admin.email || '',
                phone: admin.phone || '',
                profile_icon: admin.profile_icon || ''
            });
        }
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
    }, [admin]);

    const handleIconSelect = (iconPath) => {
        setFormData(prev => ({ ...prev, profile_icon: iconPath }));
        setShowIconPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEdit
                ? `http://localhost:17221/api/admins/${admin.id}`
                : `http://localhost:17221/api/admins`;
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
                setError(data.error || t('admin.modal.err_failed'));
            }
        } catch (err) {
            setError(t('admin.actions.network_err'));
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
                        {isEdit ? t('admin.modal.title_edit') : t('admin.modal.title_new')}
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {error && <div className="validation-msg"><AlertCircle size={14} /> {error}</div>}

                    <form id="admin-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

                        {/* Profile Image Select - Popover */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px', position: 'relative' }}>
                            <div
                                style={{ position: 'relative', width: '80px', height: '80px', cursor: 'pointer' }}
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                title="Click to choose avatar"
                            >
                                <div style={{
                                    width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                                    border: `2px dashed ${showIconPicker ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}>
                                    {formData.profile_icon ? (
                                        <img
                                            src={formData.profile_icon}
                                            alt="Profile"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Shield size={32} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                                    )}
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: -2, right: -2,
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid var(--bg-color)', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                }}>
                                    <User size={12} color="white" />
                                </div>
                            </div>

                            {/* Icon Picker Popover */}
                            {showIconPicker && (
                                <div className="icon-picker-popover">
                                    <div className="icon-picker-grid">
                                        {icons.map((icon, i) => {
                                            const isActive = formData.profile_icon === icon.data;
                                            return (
                                                <div
                                                    key={icon.id || i}
                                                    className={`icon-picker-item ${isActive ? 'active' : ''}`}
                                                    onClick={() => handleIconSelect(icon.data)}
                                                >
                                                    <img src={icon.data} alt={icon.name} />
                                                    {isActive && <div className="icon-picker-check"><Check size={16} color="white" /></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Backdrop to close popover */}
                            {showIconPicker && (
                                <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 2150 }}
                                    onClick={() => setShowIconPicker(false)}
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label"><User size={14} className="inline mr-1" /> {t('admin.modal.full_name')}</label>
                            <input
                                className="smart-input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('admin.modal.full_name_placeholder')}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label"><Mail size={14} className="inline mr-1" /> {t('admin.modal.email')}</label>
                            <input
                                type="email"
                                className="smart-input"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder={t('admin.modal.email_placeholder')}
                                required
                                disabled={isEdit}
                                title={isEdit ? t('admin.modal.email_hint') : ""}
                            />
                            {isEdit && <span className="text-xs text-white/40 mt-1 block pl-1">{t('admin.modal.email_hint')}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label"><Phone size={14} className="inline mr-1" /> {t('admin.modal.phone')}</label>
                            <input
                                className="smart-input"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder={t('admin.modal.phone_placeholder')}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="smart-form-footer">
                    <button type="button" onClick={onClose} className="btn-cancel">{t('admin.modal.cancel')}</button>
                    <button type="submit" form="admin-form" className="btn-submit" disabled={loading}>
                        {loading ? t('admin.modal.saving') : <><Save size={18} /> {isEdit ? t('admin.modal.update') : t('admin.modal.create')}</>}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default AddAdminModal;
