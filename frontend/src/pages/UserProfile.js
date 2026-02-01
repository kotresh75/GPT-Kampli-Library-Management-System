import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/components/cards.css';
import '../styles/components/smart-form-modal.css'; // Import standard form styles

const UserProfile = () => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setPassData({ ...passData, [e.target.name]: e.target.value });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (passData.newPassword !== passData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }
        if (passData.newPassword.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post('http://localhost:17221/api/auth/change-password', {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setStatus({ type: 'success', message: 'Password changed successfully!' });
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <h1 className="dashboard-title mb-6">My Profile</h1>

            <div className="glass-panel p-8" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: User Profile Card */}
                    <div className="col-span-1">
                        <div className="smart-card p-6 h-full flex flex-col items-center text-center" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl mb-4 text-3xl font-bold text-white uppercase border-4 border-white/10">
                                {userInfo.name ? userInfo.name.charAt(0) : 'U'}
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">{userInfo.name || 'User'}</h2>
                            <p className="text-purple-300 text-sm font-medium mb-6 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 inline-block">
                                {userInfo.designation || userInfo.role || 'Staff Member'}</p>

                            <div className="w-full space-y-4 text-left">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-2"><Mail size={14} /> Email Address</p>
                                    <p className="text-sm text-gray-200 font-medium truncate">{userInfo.email || 'N/A'}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-2"><Shield size={14} /> System Role</p>
                                    <p className="text-sm text-gray-200 font-medium">{userInfo.role || 'Restricted'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Change Password Form */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="smart-card p-6 h-full" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Security Settings</h3>
                                    <p className="text-xs text-gray-400">Update your account password</p>
                                </div>
                            </div>

                            {status.message && (
                                <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 text-sm ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                                    {status.type === 'success' ? <CheckCircle size={18} className="mt-0.5" /> : <AlertCircle size={18} className="mt-0.5" />}
                                    <span style={{ paddingTop: 2 }}>{status.message}</span>
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="max-w-md">
                                <div className="form-group mb-4">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={passData.oldPassword}
                                        onChange={handleChange}
                                        className="smart-input"
                                        placeholder="············"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passData.newPassword}
                                            onChange={handleChange}
                                            className="smart-input"
                                            placeholder="············"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passData.confirmPassword}
                                            onChange={handleChange}
                                            className="smart-input"
                                            placeholder="············"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-submit"
                                        style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
                                    >
                                        {loading ? 'Updating...' : <><Save size={18} /> Update Password</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
