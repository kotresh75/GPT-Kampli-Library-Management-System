import React, { useState, useEffect } from 'react';
import { X, Save, User, Hash, Briefcase, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';

const EditStudentModal = ({ student, onClose, onUpdate }) => {
    // Initial state mapped from student prop
    const [formData, setFormData] = useState({
        name: student?.full_name || '',
        register_no: student?.register_number || '',
        department: student?.dept_id || '', // Expecting dept_id from backend response if joined, or we need to handle it.
        // Wait, backend sends 'department_name' from join, but 'dept_id' might be raw column.
        // Let's check getStudents response structure in controller.
        // It fetches "s.*, d.name as department_name". So s.dept_id should be present.
        semester: student?.semester || '1',
        email: student?.email || '',
        phone: student?.phone || '',
        address: student?.address || '',
        dob: student?.dob || '',
        status: student?.status || 'Active'
    });

    // If dept_id is missing (e.g. backend alias issue), we might face trouble.
    // I'll assume student object has dept_id.

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:17221/api/departments')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setDepartments(data) : [])
            .catch(err => console.error("Failed to fetch depts", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`http://localhost:17221/api/students/${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();

            if (res.ok) {
                onUpdate(); // Refresh parent list
                onClose();
            } else {
                setError((result.error || "Failed to update student") + " (ERR_STU_UPD)");
            }
        } catch (err) {
            setError("Network error (ERR_NET_STU_EDT)");
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
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Edit Student</h2>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', overflowY: 'auto' }}>
                    {error && (
                        <div style={{ background: 'rgba(252, 129, 129, 0.2)', color: '#fc8181', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(252, 129, 129, 0.3)' }}>
                            {error}
                        </div>
                    )}

                    <form id="edit-student-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>

                        {/* Name & RegNo */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
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
                                <label className="field-label"><Hash size={14} /> Register No *</label>
                                <input
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.register_no}
                                    onChange={e => setFormData({ ...formData, register_no: e.target.value })}
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
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="field-label"><Calendar size={14} /> Semester *</label>
                                <GlassSelect
                                    options={[
                                        ...['1', '2', '3', '4', '5', '6'].map(v => ({ value: v, label: `Sem ${v}` })),
                                        { value: 'Alumni', label: 'Alumni/Grad' }
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
                                />
                            </div>
                            <div>
                                <label className="field-label"><Phone size={14} /> Phone</label>
                                <input
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="field-label">Account Status</label>
                            <GlassSelect
                                options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Blocked', label: 'Blocked' },
                                    { value: 'Graduated', label: 'Graduated' },
                                    { value: 'Deleted', label: 'Deleted (Soft)' }
                                ]}
                                value={formData.status}
                                onChange={val => setFormData({ ...formData, status: val })}
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="field-label"><MapPin size={14} /> Address</label>
                            <textarea
                                className="glass-input"
                                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(255,255,255,0.02)' }}>
                    <button onClick={onClose} className="icon-btn-ghost" style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                    <button type="submit" form="edit-student-form" className="primary-glass-btn" disabled={loading}>
                        {loading ? 'Updating...' : <><Save size={18} style={{ marginRight: 8 }} /> Update Student</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditStudentModal;
