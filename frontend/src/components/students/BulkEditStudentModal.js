import React, { useState } from 'react';
import { X, Save, Layers, user } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';

const BulkEditStudentModal = ({ count, onClose, onUpdate }) => {
    const [field, setField] = useState('semester'); // 'semester' or 'status'
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!value) return;
        onUpdate({ [field]: value });
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
            <div className="glass-panel bounce-in" style={{ width: '95%', maxWidth: '400px', padding: '20px', background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Layers size={18} /> Bulk Edit ({count} Students)
                    </h3>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label className="field-label">Field to Update</label>
                        <GlassSelect
                            options={[
                                { value: 'semester', label: 'Semester' },
                                { value: 'status', label: 'Status' }
                            ]}
                            value={field}
                            onChange={(val) => { setField(val); setValue(''); }}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label className="field-label">New Value</label>
                        {field === 'semester' ? (
                            <GlassSelect
                                options={[
                                    ...['1', '2', '3', '4', '5', '6'].map(v => ({ value: v, label: `Semester ${v}` })),
                                    { value: 'Alumni', label: 'Alumni' }
                                ]}
                                value={value}
                                onChange={setValue}
                                style={{ width: '100%' }}
                                placeholder="Select Semester"
                            />
                        ) : (
                            <GlassSelect
                                options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Blocked', label: 'Blocked' },
                                    { value: 'Graduated', label: 'Graduated' }
                                ]}
                                value={value}
                                onChange={setValue}
                                style={{ width: '100%' }}
                                placeholder="Select Status"
                            />
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} className="icon-btn-ghost" style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="primary-glass-btn"
                        disabled={loading || !value}
                        style={{ padding: '8px 20px' }}
                    >
                        {loading ? 'Updating...' : 'Update All'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkEditStudentModal;
