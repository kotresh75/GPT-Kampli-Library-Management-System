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
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDangerous ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                            <AlertTriangle size={20} className={isDangerous ? 'text-red-400' : 'text-yellow-400'} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    {!isLoading && (
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            if (closeOnConfirm) {
                                onClose();
                            }
                        }}
                        disabled={isLoading}
                        className={`px-5 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2 ${isDangerous
                            ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/20'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/20'
                            } ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
