import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, CheckCircle, AlertCircle, Sun, Moon, Type } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { theme, toggleTheme, fontScale, setFontScale, highContrast } = usePreferences();

    // Helper to cycle font sizes
    const cycleFontSize = () => {
        const scales = [85, 100, 115, 130];
        let currentIdx = scales.indexOf(fontScale);
        if (currentIdx === -1) currentIdx = 1;
        const nextIndex = (currentIdx + 1) % scales.length;
        setFontScale(scales[nextIndex]);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(2);
                setMessage("OTP sent to your email.");
            } else {
                setError((data.message || 'Failed to send OTP') + " (ERR_AUTH_OTP_SEND)");
            }
        } catch (err) {
            setError('Network error (ERR_NET_OTP)');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(3);
                setMessage("OTP Verified.");
            } else {
                setError((data.message || 'Invalid OTP') + " (ERR_AUTH_OTP_INV)");
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match (ERR_VAL_PWD_MATCH)");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Password reset successfully!");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError((data.message || 'Reset failed') + " (ERR_AUTH_RST_FAIL)");
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>



            <div className="glass-panel p-8 w-full max-w-md relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound size={32} className="text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold">Reset Password</h2>
                    <p className="text-gray-400 text-sm mt-2">
                        {step === 1 && "Enter your email to receive an OTP"}
                        {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
                        {step === 3 && "Create a new strong password"}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-200 text-sm flex items-center gap-2 animate-shake">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {message && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded text-green-200 text-sm flex items-center gap-2">
                        <CheckCircle size={16} /> {message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                            <div className="input-group">
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-glass-btn w-full justify-center" disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">OTP Code</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                className="glass-input w-full text-center text-2xl tracking-widest"
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="primary-glass-btn w-full justify-center" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordReset}>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">New Password</label>
                            <div className="input-group">
                                <KeyRound className="input-icon" size={20} />
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                            <div className="input-group">
                                <KeyRound className="input-icon" size={20} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-glass-btn w-full justify-center" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
