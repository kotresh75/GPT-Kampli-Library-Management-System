import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Layers, CheckCircle2, Filter } from 'lucide-react';

const StudentExportModal = ({ onClose, onExport, totalStudents, selectedCount, filteredCount }) => {
    const [scope, setScope] = useState('all'); // all, selected, filtered
    const [format, setFormat] = useState('xlsx');

    const handleExport = () => {
        onExport(scope, format);
        onClose();
    };

    const ScopeOption = ({ id, label, count, icon: Icon, disabled }) => (
        <div
            onClick={() => !disabled && setScope(id)}
            className="scope-option"
            style={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
                borderColor: scope === id ? 'var(--primary-color)' : 'var(--border-color)',
                background: scope === id ? 'var(--hover-overlay)' : 'transparent',
            }}
        >
            <div className="scope-icon" style={{
                background: scope === id ? 'var(--primary-color)' : 'var(--surface-secondary)',
                color: scope === id ? '#fff' : 'var(--text-secondary)'
            }}>
                <Icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{count} Students</div>
            </div>
            {scope === id && <CheckCircle2 size={20} style={{ color: 'var(--primary-color)' }} />}
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
            <div className="glass-panel bounce-in" style={{ width: '480px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--hover-overlay)', borderRadius: '10px', color: 'var(--text-primary)' }}>
                            <Download size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>Export Data</h2>
                            <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)', opacity: 0.8 }}>Choose what to download</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Scope Selection */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>Data Source</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <ScopeOption id="all" label="All Students" count={totalStudents} icon={Layers} />
                            <ScopeOption id="filtered" label="Filtered View" count={filteredCount} icon={Filter} />
                            <ScopeOption id="selected" label="Selected Items" count={selectedCount} icon={CheckCircle2} disabled={selectedCount === 0} />
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>File Format</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>

                            {/* Excel Option */}
                            <div
                                onClick={() => setFormat('xlsx')}
                                className="format-card"
                                style={{
                                    borderColor: format === 'xlsx' ? '#10b981' : 'var(--border-color)',
                                    background: format === 'xlsx' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                                }}
                            >
                                <FileSpreadsheet size={24} style={{ color: format === 'xlsx' ? '#10b981' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>Excel</span>
                            </div>

                            {/* CSV Option */}
                            <div
                                onClick={() => setFormat('csv')}
                                className="format-card"
                                style={{
                                    borderColor: format === 'csv' ? '#3b82f6' : 'var(--border-color)',
                                    background: format === 'csv' ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                            >
                                <FileText size={24} style={{ color: format === 'csv' ? '#3b82f6' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>CSV</span>
                            </div>

                            {/* PDF Option */}
                            <div
                                onClick={() => setFormat('pdf')}
                                className="format-card"
                                style={{
                                    borderColor: format === 'pdf' ? '#ef4444' : 'var(--border-color)',
                                    background: format === 'pdf' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                                }}
                            >
                                <FileText size={24} style={{ color: format === 'pdf' ? '#ef4444' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>PDF</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        className="primary-glass-btn"
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            background:
                                format === 'xlsx' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                    format === 'pdf' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' :
                                        'var(--primary-btn-bg)'
                        }}
                    >
                        <Download size={20} />
                        Export {format === 'xlsx' ? 'Excel' : format === 'pdf' ? 'PDF' : 'CSV'}
                    </button>

                </div>
            </div>

            <style jsx>{`
                .scope-option {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .scope-option:hover {
                    background: var(--hover-overlay);
                    border-color: var(--border-color-strong);
                }
                .scope-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .format-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .format-card:hover {
                    background: var(--hover-overlay);
                    border-color: var(--border-color-strong);
                }
            `}</style>
        </div>
    );
};

export default StudentExportModal;
