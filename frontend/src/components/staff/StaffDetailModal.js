import { formatDate } from '../../utils/dateUtils';
import { X, Activity, User, Mail, Phone, Briefcase, Calendar, Clock, Lock } from 'lucide-react';

const StaffDetailModal = ({ staff, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (staff) {
            setLoading(true);
            fetch(`http://localhost:3001/api/staff/${staff.id}/activity`)
                .then(res => res.json())
                .then(data => setLogs(Array.isArray(data) ? data : []))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [staff]);

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
            <div className="glass-panel bounce-in" style={{ width: '95%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>

                {/* Header with Profile Summarry */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <User size={30} color="var(--text-main)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>{staff.name}</h2>
                            <div style={{ display: 'flex', gap: 15, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> {staff.designation}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {staff.email}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* Sidebar Profile Details */}
                    <div style={{ width: '250px', padding: '20px', borderRight: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '15px' }}>Profile Details</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, fontSize: '0.9rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Phone size={14} color="var(--primary-color)" /> {staff.phone || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</label>
                                <span style={{
                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                                    background: staff.status === 'Active' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(252, 129, 129, 0.2)',
                                    color: staff.status === 'Active' ? '#48bb78' : '#fc8181'
                                }}>
                                    {staff.status}
                                </span>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Login</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Clock size={14} color="var(--primary-color)" />
                                    {staff.last_login ? formatDate(staff.last_login, true) : 'Never'}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Joined</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={14} color="var(--primary-color)" />
                                    {formatDate(staff.created_at)}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Permissions</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {(staff.access_permissions || []).map(p => (
                                    <span key={p} style={{
                                        fontSize: '0.7rem', padding: '3px 6px', borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)'
                                    }}>
                                        {p}
                                    </span>
                                ))}
                                {(!staff.access_permissions || staff.access_permissions.length === 0) && <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>None</span>}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Logs Timeline */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Activity size={20} color="#f6e05e" /> Activity Log
                        </h3>

                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner-lg"></div></div>
                        ) : logs.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                No activity recorded yet.
                            </div>
                        ) : (
                            <div className="timeline" style={{ position: 'relative', paddingLeft: '20px' }}>
                                {/* Timeline Line (CSS simulated) */}
                                <div style={{ position: 'absolute', left: '6px', top: '10px', bottom: '10px', width: '2px', background: 'var(--glass-border)' }}></div>

                                {logs.map(log => (
                                    <div key={log.id} style={{ position: 'relative', marginBottom: '20px', paddingLeft: '20px' }}>
                                        {/* Dot */}
                                        <div style={{
                                            position: 'absolute', left: '-5px', top: '4px', width: '12px', height: '12px',
                                            borderRadius: '50%', background: 'var(--primary-color)', border: '2px solid var(--bg-color)'
                                        }}></div>

                                        {/* Content */}
                                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600 }}>{log.action_type}</span> - {log.description}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 10 }}>
                                            <span>{formatDate(log.timestamp, true)}</span>
                                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0 4px', borderRadius: '3px' }}>{log.module}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.02)' }}>
                    <button onClick={onClose} className="primary-glass-btn" style={{ padding: '8px 20px' }}>Close</button>
                </div>

            </div>
        </div>
    );
};

export default StaffDetailModal;
