import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false,
    isLoading = false,
    closeOnConfirm = true,
    zIndex = 3000
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={isLoading ? null : onClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: zIndex,
            cursor: isLoading ? 'wait' : 'default'
        }}>
            <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '400px', padding: '24px', borderRadius: '16px',
                border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transform: 'scale(1)', transition: 'all 0.2s',
                animation: 'scaleIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            padding: '0.5rem', borderRadius: '50%',
                            background: isDangerous ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertTriangle size={20} color={isDangerous ? '#F87171' : '#FACC15'} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{title}</h3>
                    </div>
                    {!isLoading && (
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                            onMouseEnter={e => e.target.style.color = 'var(--text-main)'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', lineHeight: '1.625' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    {cancelText && (
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass-bg)', // Adapts to theme
                                color: 'var(--text-secondary)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => !isLoading && (e.target.style.background = 'var(--glass-border)')}
                            onMouseLeave={e => !isLoading && (e.target.style.background = 'var(--glass-bg)')}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onConfirm();
                            if (closeOnConfirm) {
                                onClose();
                            }
                        }}
                        disabled={isLoading}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: isDangerous
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: isLoading ? 'wait' : 'pointer',
                            boxShadow: isDangerous
                                ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                                : '0 4px 12px rgba(59, 130, 246, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => !isLoading && (e.target.style.transform = 'scale(0.96)')}
                        onMouseUp={e => !isLoading && (e.target.style.transform = 'scale(1)')}
                        onMouseLeave={e => !isLoading && (e.target.style.transform = 'scale(1)')}
                    >
                        {isLoading && (
                            <div className="animate-spin" style={{
                                width: '16px', height: '16px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: 'white',
                                borderRadius: '50%'
                            }} />
                        )}
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
