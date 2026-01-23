import React, { useState } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';

const PasswordPromptModal = ({ isOpen, onClose, onSuccess, title = "Security Verification", message = "Please enter your admin password to continue." }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        onSuccess(password);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-content-sm animate-bounce-in" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <div className="confirmation-icon warning">
                            <Lock size={24} />
                        </div>
                        <h3 className="modal-title">{title}</h3>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <p className="text-secondary mb-5">{message}</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Admin Password</label>
                            <input
                                type="password"
                                className="glass-input w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        {error && (
                            <div className="error-banner mb-4">
                                <AlertCircle size={14} className="mr-2" /> {error}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary primary-glass-btn" disabled={loading || !password}>
                                {loading ? 'Verifying...' : 'Confirm'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordPromptModal;
