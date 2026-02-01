import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, User, Hash, Briefcase, Calendar, Mail, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/components/smart-form-modal.css';

const SmartAddStudentModal = ({ onClose, onAdd }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        father_name: '',
        register_no: '',
        department: '',
        semester: '1',
        email: '',
        phone: '',
        address: '',
        dob: ''
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        fetch('http://localhost:17221/api/departments')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setDepartments(data) : [])
            .catch(err => console.error("Failed to fetch depts", err));

        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name || !formData.register_no || !formData.department) {
            setError(t('students.modal.err_req'));
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:17221/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || t('students.modal.err_create'));

            onAdd();
            onClose();
        } catch (err) {
            setError(err.message || t('students.modal.err_network'));
        } finally {
            setLoading(false);
        }
    };

    if (!isReady) return null;

    return ReactDOM.createPortal(
        <div className="smart-form-overlay" onClick={onClose}>
            <div className="smart-form-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="smart-form-header">
                    <h2>
                        <div style={{ width: 32, height: 32, background: 'var(--primary-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} color="white" />
                        </div>
                        {t('students.modal.title_new')}
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {/* Validation Message */}
                    {error && <div className="validation-msg"><AlertCircle size={14} /> {error}</div>}

                    <form id="add-student-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>

                        {/* Section: Academic */}
                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">{t('students.modal.reg_no')}</label>
                                <input
                                    name="register_no"
                                    className="smart-input"
                                    value={formData.register_no}
                                    onChange={(e) => handleChange({ target: { name: 'register_no', value: e.target.value.toUpperCase() } })}
                                    placeholder={t('students.modal.reg_no_placeholder')}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">{t('students.modal.sem')}</label>
                                <GlassSelect
                                    options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s.toString(), label: t('students.modal.sem_opt', { num: s }) }))}
                                    value={formData.semester}
                                    onChange={val => handleChange({ target: { name: 'semester', value: val } })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('students.modal.dept')}</label>
                            <GlassSelect
                                options={departments.map(d => ({ value: d.id, label: d.name }))}
                                value={formData.department}
                                onChange={val => handleChange({ target: { name: 'department', value: val } })}
                                placeholder={t('students.modal.dept_select')}
                            />
                        </div>

                        {/* Section: Personal */}
                        <div className="form-group">
                            <label className="form-label">{t('students.modal.name')}</label>
                            <input
                                name="name"
                                className="smart-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t('students.modal.name_placeholder')}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('students.modal.father')}</label>
                            <input
                                name="father_name"
                                className="smart-input"
                                value={formData.father_name}
                                onChange={handleChange}
                                placeholder={t('students.modal.father_placeholder')}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">{t('students.modal.email')}</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="smart-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('students.modal.optional')}
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">{t('students.modal.phone')}</label>
                                <input
                                    name="phone"
                                    className="smart-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder={t('students.modal.optional')}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('students.modal.dob')}</label>
                            <input
                                name="dob"
                                type="date"
                                className="smart-input"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('students.modal.address')}</label>
                            <textarea
                                name="address"
                                className="smart-input"
                                style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                                value={formData.address}
                                onChange={handleChange}
                                placeholder={t('students.modal.address_placeholder')}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="smart-form-footer">
                    <button type="button" onClick={onClose} className="btn-cancel">{t('students.modal.cancel')}</button>
                    <button type="submit" form="add-student-form" className="btn-submit" disabled={loading}>
                        {loading ? t('students.modal.saving') : <><Save size={18} /> {t('students.modal.save')}</>}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default SmartAddStudentModal;
