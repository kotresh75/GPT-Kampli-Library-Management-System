import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, Building, AlertCircle } from 'lucide-react';
import '../../styles/components/smart-form-modal.css';

const SmartAddDepartmentModal = ({ onClose, onAdded, initialData = null }) => {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                code: initialData.code || '',
                description: initialData.description || ''
            });
        }
        // Small delay to allow animation mount
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name || !formData.code) {
            setError("Department Name and Code are required");
            setLoading(false);
            return;
        }

        try {
            const url = isEditMode
                ? `http://localhost:3001/api/departments/${initialData.id}`
                : 'http://localhost:3001/api/departments';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Operation failed');

            onAdded();
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
                            <Building size={18} color="white" />
                        </div>
                        {isEditMode ? 'Edit Department' : 'Add New Department'}
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {/* Validation Message */}
                    {error && <div className="validation-msg"><AlertCircle size={14} /> {error}</div>}

                    <form id="department-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>

                        <div className="form-group">
                            <label className="form-label">Department Code</label>
                            <input
                                name="code"
                                className="smart-input"
                                value={formData.code}
                                onChange={(e) => handleChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
                                placeholder="e.g. CSE"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department Name</label>
                            <input
                                name="name"
                                className="smart-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Computer Science"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                name="description"
                                className="smart-input"
                                style={{ minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter brief description..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="smart-form-footer">
                    <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                    <button type="submit" form="department-form" className="btn-submit" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} /> Save Department</>}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default SmartAddDepartmentModal;
