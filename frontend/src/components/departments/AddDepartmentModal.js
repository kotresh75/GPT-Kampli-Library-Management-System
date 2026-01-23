import React, { useState } from 'react';
import { X, Save, Building } from 'lucide-react';

const AddDepartmentModal = ({ onClose, onAdded, initialData = null }) => {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState(initialData || {
        name: '',
        code: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEditMode
                ? `http://localhost:3001/api/departments/${formData.id}`
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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
            <div className="glass-panel bounce-in" style={{ width: '500px', background: 'var(--bg-color)', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)' }}>
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{isEditMode ? 'Edit Department' : 'Add Department'}</h2>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && <div className="error-banner">{error}</div>}

                    <div className="form-group">
                        <label>Department Name</label>
                        <input
                            className="glass-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Computer Science"
                            required
                            autoFocus
                            style={{ background: 'var(--glass-bg)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)', border: '1px solid var(--text-secondary)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Department Code</label>
                        <input
                            className="glass-input"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. CSE"
                            required
                            style={{ background: 'var(--glass-bg)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)', border: '1px solid var(--text-secondary)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            className="glass-textarea"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description..."
                            style={{ minHeight: '80px', background: 'var(--glass-bg)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)', border: '1px solid var(--text-secondary)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button type="button" onClick={onClose} className="icon-btn" style={{ padding: '10px 20px', height: 'auto' }}>Cancel</button>
                        <button type="submit" disabled={loading} className="primary-glass-btn" style={{ padding: '10px 24px', height: 'auto' }}>
                            {loading ? 'Saving...' : <><Save size={18} style={{ marginRight: 8 }} /> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDepartmentModal;
