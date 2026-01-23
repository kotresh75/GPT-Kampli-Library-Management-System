import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, X } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, type = 'success', title, message, autoClose = 0 }) => {

    useEffect(() => {
        if (isOpen && autoClose > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoClose);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, onClose]);

    if (!isOpen) return null;

    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : XCircle;

    // Premium Design Config
    const theme = isSuccess ? {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.2) 100%)',
        border: 'rgba(16, 185, 129, 0.3)',
        iconColor: '#34d399',
        iconBg: 'rgba(16, 185, 129, 0.2)',
        btnBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        shadow: '0 20px 50px -12px rgba(16, 185, 129, 0.5)'
    } : {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.2) 100%)',
        border: 'rgba(239, 68, 68, 0.3)',
        iconColor: '#f87171',
        iconBg: 'rgba(239, 68, 68, 0.2)',
        btnBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        shadow: '0 20px 50px -12px rgba(239, 68, 68, 0.5)'
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000,
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '420px', padding: '40px 30px', borderRadius: '24px',
                border: `1px solid ${theme.border}`,
                background: 'var(--glass-bg)', // Keep base glass, overlay gradient via pseudo or container
                backgroundImage: theme.bg,
                boxShadow: theme.shadow,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute', top: -50, left: -50, width: '150px', height: '150px',
                    borderRadius: '50%', background: theme.iconBg, filter: 'blur(40px)', opacity: 0.5
                }} />
                <div style={{
                    position: 'absolute', bottom: -50, right: -50, width: '150px', height: '150px',
                    borderRadius: '50%', background: theme.iconBg, filter: 'blur(40px)', opacity: 0.5
                }} />

                <div className="relative mb-6">
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto',
                        background: theme.iconBg, border: `2px solid ${theme.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 20px ${theme.border}`
                    }}>
                        <Icon size={40} color={theme.iconColor} strokeWidth={2.5} />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 tracking-wide transform translate-y-[-2px]">
                    {title || (isSuccess ? 'Success!' : 'Error')}
                </h3>

                <p className="text-gray-300 mb-8 leading-relaxed text-base opacity-90">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-xl font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    style={{
                        background: theme.btnBg,
                        border: 'none',
                        color: 'white',
                        fontSize: '1rem'
                    }}
                >
                    {isSuccess ? 'Continue' : 'Close'}
                </button>
            </div>

            <style jsx>{`
                @keyframes scaleIn {
                    0% { opacity: 0; transform: scale(0.9) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default StatusModal;
