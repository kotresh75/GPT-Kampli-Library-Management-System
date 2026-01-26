import React, { useState, useEffect } from 'react';
import { X, Activity, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminAuditLogModal = ({ admin, onClose }) => {
    const { t } = useLanguage();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (admin) {
            setLoading(true);
            fetch(`http://localhost:3001/api/admins/${admin.id}/logs`)
                .then(res => res.json())
                .then(data => setLogs(Array.isArray(data) ? data : []))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [admin]);

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
            <div className="glass-panel bounce-in" style={{ width: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>

                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Activity size={20} color="#f6e05e" />
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{t('audit.modal.title')}</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('audit.modal.for', { name: admin.name })}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner-lg"></div></div>
                    ) : logs.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('audit.table.no_logs')}</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', position: 'sticky', top: 0 }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('audit.table.action')}</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('audit.table.module')}</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('audit.table.description')}</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('audit.table.timestamp')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '12px 20px' }}>
                                            <span style={{
                                                padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)'
                                            }}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{log.module}</td>
                                        <td style={{ padding: '12px 20px' }}>{log.description}</td>
                                        <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {(() => {
                                                const d = new Date(log.timestamp);
                                                const day = d.getDate().toString().padStart(2, '0');
                                                const m = (d.getMonth() + 1).toString().padStart(2, '0');
                                                const y = d.getFullYear();
                                                const t = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                return `${day}/${m}/${y} ${t}`;
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.02)' }}>
                    <button onClick={onClose} className="primary-glass-btn" style={{ padding: '8px 20px' }}>{t('common.close')}</button>
                </div>

            </div>
        </div>
    );
};

export default AdminAuditLogModal;
