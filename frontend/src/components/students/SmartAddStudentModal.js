import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, User, Hash, Briefcase, Calendar, Mail, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import '../../styles/components/smart-form-modal.css';

const SmartAddStudentModal = ({ onClose, onAdd }) => {
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
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/api/departments')
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
            setError("Required fields missing");
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

            if (!res.ok) throw new Error(data.error || "Failed to create student");

            onAdd();
            onClose();
        } catch (err) {
            setError(err.message || "Network error");
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
                        Add New Student
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
                                <label className="form-label">Register Number</label>
                                <input
                                    name="register_no"
                                    className="smart-input"
                                    value={formData.register_no}
                                    onChange={(e) => handleChange({ target: { name: 'register_no', value: e.target.value.toUpperCase() } })}
                                    placeholder="e.g. 172CS24001"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Semester</label>
                                <GlassSelect
                                    options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s.toString(), label: `Semester ${s}` }))}
                                    value={formData.semester}
                                    onChange={val => handleChange({ target: { name: 'semester', value: val } })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <GlassSelect
                                options={departments.map(d => ({ value: d.id, label: d.name }))}
                                value={formData.department}
                                onChange={val => handleChange({ target: { name: 'department', value: val } })}
                                placeholder="Select Department"
                            />
                        </div>

                        {/* Section: Personal */}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                name="name"
                                className="smart-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="smart-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    name="phone"
                                    className="smart-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
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
                            <label className="form-label">Address</label>
                            <textarea
                                name="address"
                                className="smart-input"
                                style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter full address"
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="smart-form-footer">
                    <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                    <button type="submit" form="add-student-form" className="btn-submit" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} /> Save Student</>}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default SmartAddStudentModal;
