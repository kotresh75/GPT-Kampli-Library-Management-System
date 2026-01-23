import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const GlassInputModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    label,
    placeholder,
    confirmText = "Confirm",
    initialValue = ""
}) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setValue(initialValue);
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!value.trim()) {
            alert("Please enter a value"); // Or use a cleaner error state
            return;
        }
        onConfirm(value);
        onClose();
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content-sm" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
                    <input
                        autoFocus
                        type="text"
                        className="glass-input w-full p-3 rounded-lg"
                        style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--glass-border)',
                            color: 'white'
                        }}
                        placeholder={placeholder}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                    />
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                    <button
                        onClick={handleConfirm}
                        className="btn-primary primary-glass-btn"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GlassInputModal;
