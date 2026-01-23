import React, { useState, useEffect } from 'react';
import { Send, Trash2, Users, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

import GlassSelect from '../components/common/GlassSelect';
import StatusModal from '../components/common/StatusModal';
import StudentSearchSelect from '../components/common/StudentSearchSelect';
import GlassEditor from '../components/common/GlassEditor';

const NotificationPage = () => {
    const [recipientType, setRecipientType] = useState('all');
    const [selectedDept, setSelectedDept] = useState('');
    const [targetStudents, setTargetStudents] = useState([]); // Array for multi-select
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // Dynamic Data State
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

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

    // Fetch Departments & History
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                // Use 'auth_token' as consistent with LoginPage
                const token = localStorage.getItem('auth_token');

                const res = await fetch('http://localhost:3001/api/departments', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (!res.ok) {
                    // validation or auth error
                    return;
                }

                const data = await res.json();
                if (Array.isArray(data)) {
                    setDepartments(data.map(d => ({ value: d.id, label: d.name })));
                }
            } catch (err) {
                console.error("Failed to fetch departments", err);
            }
        };
        fetchDepts();
        fetchHistory();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let backendGroup = 'Students';

            if (recipientType === 'all') backendGroup = 'Students';
            else if (recipientType === 'dept') {
                if (!selectedDept) throw new Error('Please select a department');
                backendGroup = `Dept:${selectedDept}`;
            }
            else if (recipientType === 'student') {
                if (targetStudents.length === 0) throw new Error('Please search and select at least one student');
                // Send comma-separated list of IDs
                const ids = targetStudents.map(s => s.id).join(',');
                backendGroup = `Student:${ids}`;
            }

            // Retrieve consistent token
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Authentication token not found. Please log in again.");

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

            setStatusModal({ isOpen: true, type: 'success', title: 'Broadcast Sent', message: `Successfully sent to ${data.recipientCount || 'recipients'}` });
            setSubject('');
            setMessage('');
            setTargetStudents([]);
            setSelectedDept('');
            fetchHistory(); // Refresh history
        } catch (err) {
            setStatusModal({ isOpen: true, type: 'error', title: 'Transmission Failed', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <h1 className="page-title">Broadcast Message / ಸಂದೇಶ ಪ್ರಸಾರ</h1>

            <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }}>

                {/* --- COMPOSER PANEL (LEFT - 60%) --- */}
                <div className="glass-panel" style={{ flex: '3', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Send size={20} /> Compose Message
                        </h2>
                    </div>

                    <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

                        {/* Targeting Section */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Recipient Type</label>
                            <GlassSelect
                                icon={Users}
                                value={recipientType}
                                onChange={setRecipientType}
                                options={[
                                    { value: 'all', label: 'All Students' },
                                    { value: 'dept', label: 'Specific Department' },
                                    { value: 'student', label: 'Specific Students' },
                                    { value: 'overdue', label: 'Overdue Students' },
                                    { value: 'issued', label: 'Issued Students' }
                                ]}
                            />
                        </div>

                        {recipientType === 'dept' && (
                            <div className="glass-card bounce-in" style={{ padding: '15px', background: 'rgba(100,100,255,0.05)' }}>
                                <label style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Select Department:</label>
                                <GlassSelect
                                    value={selectedDept}
                                    onChange={setSelectedDept}
                                    options={departments}
                                    placeholder="Choose Department"
                                />
                            </div>
                        )}

                        {recipientType === 'student' && (
                            <div className="glass-card bounce-in" style={{ padding: '15px', background: 'rgba(100,100,255,0.05)' }}>
                                <label style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Search Student (Multiple):</label>
                                <StudentSearchSelect
                                    selectedStudents={targetStudents}
                                    onSelect={setTargetStudents}
                                    placeholder="Enter Name or Register Number..."
                                />
                            </div>
                        )}

                        {/* Subject */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subject Line</label>
                            <div className="input-group">
                                <FileText className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Enter subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Message Body (WYSIWYG) */}
                        <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Message Body</label>
                            <div style={{ flex: 1, minHeight: '200px' }}>
                                <GlassEditor
                                    value={message}
                                    onChange={setMessage}
                                    placeholder="Type your message here..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="primary-glass-btn"
                                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Send size={18} />}
                                {loading ? 'Sending...' : 'Send Broadcast'}
                            </button>
                            <button type="button" className="icon-btn" onClick={() => { setSubject(''); setMessage(''); }} style={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}>
                                <Trash2 size={18} /> Clear
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- HISTORY PANEL (RIGHT - 40%) --- */}
                <div className="glass-panel" style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} /> History
                        </h2>
                        <select
                            className="glass-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                            value={historySort}
                            onChange={(e) => setHistorySort(e.target.value)}
                        >
                            <option value="desc">Recent First</option>
                            <option value="asc">Oldest First</option>
                        </select>
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
                                    To: {item.target}
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
        </div>
    );
};

export default NotificationPage;
