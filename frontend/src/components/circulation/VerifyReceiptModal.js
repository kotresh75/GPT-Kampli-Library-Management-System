import React, { useState } from 'react';
import { X, Search, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const VerifyReceiptModal = ({ isOpen, onClose }) => {
    const [receiptId, setReceiptId] = useState('');
    const [loading, setLoading] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleVerify = async () => {
        if (!receiptId.trim()) return;

        setLoading(true);
        setError(null);
        setReceiptData(null);

        try {
            // Smart Input: Auto-prepend 'REC-' if purely numeric or missing it
            let queryId = receiptId.trim();
            if (/^\d+$/.test(queryId)) {
                queryId = `REC-${queryId}`; // User entered just the number
            } else if (!queryId.toUpperCase().startsWith('REC-')) {
                // If they typed something else, let's try searching as is, but maybe help them out?
                // For now, assume exact match or numeric shortcut.
            }

            const token = localStorage.getItem('auth_token');
            // Try explicit ID match first
            // Note: Backend uses LIKE %ID%, so strict formatting isn't always required but good for precision
            const response = await fetch(`http://localhost:3001/api/fines/receipt/${queryId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 404) throw new Error("Receipt not found");
                throw new Error("Verification failed");
            }

            const data = await response.json();
            setReceiptData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="text-green-400" /> Verify Payment Receipt
                </h2>

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={receiptId}
                        onChange={(e) => setReceiptId(e.target.value)}
                        placeholder="Enter Receipt ID (e.g. REC-...)"
                        className="glass-input flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                    <button
                        onClick={handleVerify}
                        disabled={loading || !receiptId.trim()}
                        className="primary-glass-btn flex items-center gap-2"
                    >
                        {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Search size={18} />}
                        Verify
                    </button>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center mb-4">
                        {error}
                    </div>
                )}

                {receiptData && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-2">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs text-gray-400">Student</div>
                                    <div className="font-medium text-white">{receiptData.student_name}</div>
                                    <div className="text-xs text-gray-500">{receiptData.register_number}</div>
                                    <div className="text-[10px] text-emerald-400 mt-1 font-mono">{receiptData.id.startsWith('REC-') ? receiptData.id : `REC-${receiptData.id}`}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Date</div>
                                    <div className="text-white">{formatDate(receiptData.date)}</div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 my-2"></div>

                            <div className="space-y-2">
                                {receiptData.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-300">{item.description}</span>
                                        <span className="text-white font-medium">₹{item.amount}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/10 my-2 pt-2 flex justify-between items-center">
                                <span className="text-gray-400">Total Paid</span>
                                <span className="text-xl font-bold text-green-400">₹{receiptData.total}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium border border-green-500/30">
                                <CheckCircle size={10} /> Valid Receipt
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
                    <button
                        onClick={onClose}
                        className="glass-btn px-4 py-2 text-sm text-gray-300 hover:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyReceiptModal;
