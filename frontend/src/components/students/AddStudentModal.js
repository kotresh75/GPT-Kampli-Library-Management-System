import React, { useState, useEffect } from 'react';
import { X, Save, User, Hash, Briefcase, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';

const AddStudentModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
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

    useEffect(() => {
        fetch('http://localhost:3001/api/departments')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setDepartments(data) : [])
            .catch(err => console.error("Failed to fetch depts", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name || !formData.register_no || !formData.department) {
            setError("Required fields missing (ERR_VAL_REQ)");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                onAdd(); // Refresh parent
                onClose();
            } else {
                setError((data.error || "Failed to create student") + " (ERR_STU_CRT)");
            }
        } catch (err) {
            setError("Network error (ERR_NET_STU_ADD)");
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
            <div className="glass-panel bounce-in" style={{ width: '95%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>

                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Add New Student</h2>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', overflowY: 'auto' }}>
                    {error && (
                        <div style={{ background: 'rgba(252, 129, 129, 0.2)', color: '#fc8181', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(252, 129, 129, 0.3)' }}>
                            {error}
                        </div>
                    )}

                    <form id="add-student-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>

                        {/* Name & RegNo */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                            <div>
                                <label className="field-label"><User size={14} /> Full Name *</label>
                                <input
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="field-label"><Hash size={14} /> Register No *</label>
                                <input
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.register_no}
                                    onChange={e => setFormData({ ...formData, register_no: e.target.value })}
                                    placeholder="e.g. CS2024001"
                                    required
                                />
                            </div>
                        </div>

                        {/* Dept, Sem, DOB */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div>
                                <label className="field-label"><Briefcase size={14} /> Department *</label>
                                <GlassSelect
                                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                                    value={formData.department}
                                    onChange={val => setFormData({ ...formData, department: val })}
                                    placeholder="Select"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="field-label"><Calendar size={14} /> Semester *</label>
                                <GlassSelect
                                    options={[
                                        { value: '1', label: 'Semester 1' },
                                        { value: '2', label: 'Semester 2' },
                                        { value: '3', label: 'Semester 3' },
                                        { value: '4', label: 'Semester 4' },
                                        { value: '5', label: 'Semester 5' },
                                        { value: '6', label: 'Semester 6' }
                                    ]}
                                    value={formData.semester}
                                    onChange={val => setFormData({ ...formData, semester: val })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="field-label"><Calendar size={14} /> DOB *</label>
                                <input
                                    type="date"
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label className="field-label"><Mail size={14} /> Email</label>
                                <input
                                    type="email"
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="field-label"><Phone size={14} /> Phone</label>
                                <input
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="field-label"><MapPin size={14} /> Address</label>
                            <textarea
                                className="glass-input"
                                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Resident address..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(255,255,255,0.02)' }}>
                    <button onClick={onClose} className="icon-btn-ghost" style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                    <button type="submit" form="add-student-form" className="primary-glass-btn" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} style={{ marginRight: 8 }} /> Save Student</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddStudentModal;
