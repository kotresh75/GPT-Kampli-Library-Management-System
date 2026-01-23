import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Trash2, AlertCircle } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';

const EditFineModal = ({ isOpen, onClose, fine, onSave, onWaive }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (fine) {
            setAmount(fine.amount);
            setReason(fine.reason || '');
        }
    }, [fine]);

    if (!isOpen || !fine) return null;

    return createPortal(
        <>
            <div className="modal-overlay" onClick={onClose} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
                <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{
                    width: '100%', maxWidth: '500px', padding: '24px', borderRadius: '16px',
                    border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-500/20">
                                <AlertCircle size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Edit Fine Details</h2>
                                <p className="text-xs text-gray-400">Transaction ID: {fine.id?.slice(0, 8)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Fine Amount (₹)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 transition"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Reason / Description</label>
                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 transition h-32 resize-none"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter reason for fine or waiver..."
                            />
                            <p className="text-xs text-gray-500 mt-1">This text will be recorded in the transaction history.</p>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm font-medium"
                        >
                            <Trash2 size={18} />
                            Waive Fine
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onSave(fine.id, amount, reason)}
                                className="primary-glass-btn px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => onWaive(fine.id, reason)}
                title="Waive Fine?"
                message="Are you sure you want to WAIVE this fine? This action cannot be undone and will mark the fine as settled."
                confirmText="Yes, Waive It"
                isDangerous={true}
            />
        </>,
        document.body
    );
};

export default EditFineModal;
