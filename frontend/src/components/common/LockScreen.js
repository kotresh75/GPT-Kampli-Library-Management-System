import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import TitleBar from '../layout/TitleBar';
import '../../styles/components/modals.css'; // Reusing modal styles for input/buttons

const LockScreen = () => {
    const { isLocked, unlock } = useSession();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({ name: 'User', email: '' });

    // Load user info when locked
    useEffect(() => {
        if (isLocked) {
            const stored = localStorage.getItem('user_info');
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse user info", e);
                }
            }
        }
    }, [isLocked]);

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await unlock(password);
            setPassword('');
        } catch (err) {
            setError(err.message);
            // Shake effect or feedback could be added here
        } finally {
            setLoading(false);
        }
    };

    if (!isLocked) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.96)', // Dark, almost opaque
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white'
        }}>
            {/* Title Bar for Lock Screen */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 100000 // Ensure it's above the backdrop content
            }}>
                <TitleBar />
            </div>

            <div className="animate-bounce-in" style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>

                {/* User Avatar / Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 1.5rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
                }}>
                    <Lock size={32} color="white" />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Session Locked
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                    {user.name} ({user.email})<br />
                    <span style={{ fontSize: '0.85rem' }}>Enter password to resume</span>
                </p>

                <form onSubmit={handleUnlock} style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            className="glass-input"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                paddingRight: '48px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: error ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading || !password}
                            style={{
                                position: 'absolute',
                                right: '6px',
                                top: '6px',
                                height: 'calc(100% - 12px)',
                                aspectRatio: '1/1',
                                background: loading ? 'rgba(255,255,255,0.1)' : 'white',
                                color: 'black',
                                border: 'none',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? <div className="spinner-sm" style={{ borderTopColor: 'black', borderRightColor: 'black' }} /> : <ArrowRight size={18} />}
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            marginTop: '1rem',
                            color: '#ef4444',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                </form>
            </div>

            <div style={{ position: 'absolute', bottom: '2rem', fontSize: '0.8rem', color: '#64748b' }}>
                GPTK Library Management System
            </div>
        </div>
    );
};

export default LockScreen;
