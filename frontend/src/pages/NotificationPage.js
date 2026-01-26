import React, { useState, useEffect } from 'react';
import { Send, Trash2, Users, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';

import GlassSelect from '../components/common/GlassSelect';
import StatusModal from '../components/common/StatusModal';
import StudentSearchSelect from '../components/common/StudentSearchSelect';
import GlassEditor from '../components/common/GlassEditor';

const NotificationPage = () => {
    const { t } = useLanguage();
    const [recipientType, setRecipientType] = useState('student');
    const [targetStudents, setTargetStudents] = useState([]); // Array for multi-select
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(false);
    const [isBroadcastEnabled, setIsBroadcastEnabled] = useState(true);

    // Fetch Settings to check if Broadcast is enabled
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/settings/app');
                if (res.ok) {
                    const data = await res.json();
                    if (data.email_events && data.email_events.broadcastMessages === false) {
                        setIsBroadcastEnabled(false);
                    } else {
                        setIsBroadcastEnabled(true);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    // Status Modal State
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    // History State
    const [history, setHistory] = useState([]);
    const [historySort, setHistorySort] = useState('desc'); // 'desc' (Recent) or 'asc' (Oldest)

    // Fetch History Helper
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/admins/broadcast/history?order=${historySort}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    // Re-fetch when sort changes
    useEffect(() => {
        fetchHistory();
    }, [historySort]);

    const socket = useSocket();
    useEffect(() => {
        if (!socket) return;
        const handleUpdate = () => {
            console.log("Broadcast History Update: Refreshing");
            fetchHistory();
        };
        socket.on('broadcast_update', handleUpdate);
        return () => socket.off('broadcast_update', handleUpdate);
    }, [socket, historySort]);

    // Fetch History
    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let backendGroup = '';

            if (recipientType === 'student') {
                if (targetStudents.length === 0) throw new Error(t('broadcast.status.select_student_err'));
                // Send comma-separated list of IDs
                const ids = targetStudents.map(s => s.id).join(',');
                backendGroup = `Student:${ids}`;
            }
            else if (recipientType === 'overdue') {
                backendGroup = 'Overdue';
            }
            else if (recipientType === 'issued') {
                backendGroup = 'Issued';
            }

            // Retrieve consistent token
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error(t('broadcast.status.auth_err'));

            const response = await fetch('http://localhost:3001/api/admins/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipient_group: backendGroup,
                    subject,
                    message // HTML content from editor
                })
            });

            const data = await response.json();
            if (!response.ok) {
                // Handle different error formats ({ error: ... } vs { message: ... })
                const errMsg = data.error || data.message || `Server Error: ${JSON.stringify(data)}`;
                throw new Error(errMsg);
            }

            setStatusModal({ isOpen: true, type: 'success', title: t('broadcast.status.sent'), message: `${t('broadcast.status.success_msg')} ${data.recipientCount || t('broadcast.status.recipients')}` });
            setSubject('');
            setMessage('');
            setTargetStudents([]);
            fetchHistory(); // Refresh history
        } catch (err) {
            setStatusModal({ isOpen: true, type: 'error', title: t('broadcast.status.failed'), message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <h1 className="page-title">{t('broadcast.title')}</h1>

            <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }}>

                {/* --- COMPOSER PANEL (LEFT - 60%) --- */}
                <div className="glass-panel" style={{ flex: '3', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Send size={20} /> {t('broadcast.compose.title')}
                        </h2>
                    </div>

                    {!isBroadcastEnabled && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#EF4444',
                            fontSize: '0.9rem'
                        }}>
                            <AlertCircle size={20} />
                            <div>
                                <strong>Warning:</strong> Broadcast messages are currently disabled in Settings. Emails will NOT be sent.
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

                        {/* Targeting Section */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('broadcast.compose.recipient_type')}</label>
                            <GlassSelect
                                icon={Users}
                                value={recipientType}
                                onChange={setRecipientType}
                                options={[
                                    { value: 'student', label: t('broadcast.compose.types.student') },
                                    { value: 'overdue', label: t('broadcast.compose.types.overdue') },
                                    { value: 'issued', label: t('broadcast.compose.types.issued') }
                                ]}
                            />
                        </div>



                        {recipientType === 'student' && (
                            <div className="glass-card bounce-in" style={{ padding: '15px', background: 'rgba(100,100,255,0.05)' }}>
                                <label style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>{t('broadcast.compose.search_student')}:</label>
                                <StudentSearchSelect
                                    selectedStudents={targetStudents}
                                    onSelect={setTargetStudents}
                                    placeholder={t('broadcast.compose.enter_student')}
                                />
                            </div>
                        )}

                        {/* Subject */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('broadcast.compose.subject')}</label>
                            <div className="input-group">
                                <FileText className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder={t('broadcast.compose.enter_subject')}
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Message Body (WYSIWYG) */}
                        <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('broadcast.compose.body')}</label>
                            <div style={{ flex: 1, minHeight: '200px' }}>
                                <GlassEditor
                                    value={message}
                                    onChange={setMessage}
                                    placeholder={t('broadcast.compose.type_message')}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                            <button
                                type="submit"
                                disabled={loading || !isBroadcastEnabled}
                                className="primary-glass-btn"
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px',
                                    opacity: (loading || !isBroadcastEnabled) ? 0.6 : 1,
                                    cursor: (loading || !isBroadcastEnabled) ? 'not-allowed' : 'pointer',
                                    filter: !isBroadcastEnabled ? 'grayscale(1)' : 'none'
                                }}
                            >
                                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Send size={18} />}
                                {loading ? t('broadcast.compose.sending') : t('broadcast.compose.send')}
                            </button>
                            <button type="button" className="icon-btn" onClick={() => { setSubject(''); setMessage(''); }} style={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}>
                                <Trash2 size={18} /> {t('broadcast.compose.clear')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- HISTORY PANEL (RIGHT - 40%) --- */}
                <div className="glass-panel" style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} /> {t('broadcast.history.title')}
                        </h2>
                        <div style={{ width: '160px' }}>
                            <GlassSelect
                                value={historySort}
                                onChange={setHistorySort}
                                options={[
                                    { value: 'desc', label: t('broadcast.history.recent') },
                                    { value: 'asc', label: t('broadcast.history.oldest') }
                                ]}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {history.map(item => (
                            <div key={item.id} className="glass-card" style={{ padding: '15px', marginBottom: '15px', borderLeft: item.status === 'sent' ? '4px solid #48bb78' : '4px solid #f56565' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{item.date}</span>
                                    {item.status === 'sent' ? <CheckCircle size={16} color="#48bb78" /> : <AlertCircle size={16} color="#f56565" />}
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{item.subject}</h4>
                                <div style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                    {t('broadcast.history.to')}: {item.target}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                autoClose={statusModal.type === 'success' ? 3000 : 0}
            />
        </div >
    );
};

export default NotificationPage;
