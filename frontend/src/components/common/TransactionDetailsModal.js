import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, BookOpen, User, Hash, AlignLeft, Info, CheckCircle, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const TransactionDetailsModal = ({ isOpen, onClose, transaction }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !transaction || !mounted) return null;

    // Parse details securely
    let details = {};
    try {
        if (typeof transaction.details === 'string') {
            details = JSON.parse(transaction.details);
        } else if (typeof transaction.details === 'object') {
            details = transaction.details;
        }
    } catch (e) {
        console.error("Failed to parse details", e);
    }

    return createPortal(
        <div className="fixed inset-0 z-[1400] flex items-center justify-center animate-fade-in p-4" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400
        }}>
            <div className="glass-panel w-full max-w-md overflow-hidden animate-scale-in flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
                style={{
                    padding: 0,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    boxShadow: 'var(--glass-shadow)',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--radius-lg)'
                }}
            >
                {/* Header */}
                <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500">
                            <Info size={16} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold leading-tight" style={{ color: 'var(--text-main)' }}>Transaction Details</h3>
                            <div className="text-[10px] font-mono mt-0.5 opacity-75" style={{ color: 'var(--text-secondary)' }}>ID: {transaction.id}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="transition-colors p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto space-y-4 text-xs">

                    {/* Top Row: Student & Book */}
                    <div className="grid grid-cols-1 gap-4">

                        {/* Student Info */}
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-semibold uppercase tracking-wider border-b pb-1 opacity-70" style={{ color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }}>Student</h3>
                            <div className="flex justify-between items-center">
                                <p className="font-medium flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                    <User size={12} className="opacity-70" />
                                    {transaction.student_name || 'N/A'}
                                </p>
                                <p className="font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>{transaction.student_reg_no || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Book Info */}
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-semibold uppercase tracking-wider border-b pb-1 opacity-70" style={{ color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }}>Book</h3>
                            <div className="space-y-1">
                                <p className="font-medium flex items-center gap-2 leading-tight" style={{ color: 'var(--text-main)' }}>
                                    <BookOpen size={12} className="opacity-70 flex-shrink-0" />
                                    {transaction.book_title || 'N/A'}
                                </p>
                                <div className="flex justify-between text-[10px] opacity-70 pl-5" style={{ color: 'var(--text-secondary)' }}>
                                    <span>Acc: {details.accession || transaction.accession_number || 'N/A'}</span>
                                    <span>ISBN: {transaction.book_isbn || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t" style={{ borderColor: 'var(--glass-border)' }}></div>

                    {/* Transaction Data */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--text-secondary)' }}>Transaction Data</h3>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border 
                                ${transaction.action_type === 'ISSUE' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                                    transaction.action_type === 'RETURN' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                                        transaction.action_type === 'FINE_PAID' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                            'border-gray-500/30 text-gray-500 bg-gray-500/10'}`}>
                                {transaction.action_type === 'ISSUE' && <BookOpen size={10} />}
                                {transaction.action_type === 'RETURN' && <CheckCircle size={10} />}
                                {transaction.action_type === 'RENEW' && <RefreshCw size={10} />}
                                {transaction.action_type === 'FINE_PAID' && <DollarSign size={10} />}
                                {transaction.action_type}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                            <div>
                                <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
                                <div className="font-medium" style={{ color: 'var(--text-main)' }}>
                                    {details.action_date || formatDate(transaction.timestamp).split(',')[0]}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>Time</label>
                                <div className="font-medium" style={{ color: 'var(--text-main)' }}>
                                    {details.action_time || new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {/* Conditional Logic Items */}
                            {transaction.action_type === 'ISSUE' && (
                                <>
                                    <div>
                                        <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
                                        <div className="font-medium" style={{ color: 'var(--text-main)' }}>{formatDate(details.due_date)}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>Period</label>
                                        <div className="font-medium" style={{ color: 'var(--text-main)' }}>{details.loan_days} Days</div>
                                    </div>
                                </>
                            )}

                            {transaction.action_type === 'RETURN' && (
                                <>
                                    <div>
                                        <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>Returned</label>
                                        <div className="font-medium" style={{ color: 'var(--text-main)' }}>{formatDate(details.return_date)}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>Condition</label>
                                        <div className={`font-medium ${details.condition === 'Good' ? 'text-green-500' : 'text-red-500'}`}>
                                            {details.condition || 'N/A'}
                                        </div>
                                    </div>
                                </>
                            )}

                            {transaction.action_type === 'RENEW' && (
                                <>
                                    <div>
                                        <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>Extend</label>
                                        <div className="font-medium" style={{ color: 'var(--text-main)' }}>{details.extend_days} Days</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] block opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>New Due</label>
                                        <div className="font-medium" style={{ color: 'var(--text-main)' }}>{formatDate(details.new_due_date)}</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Fine or Remarks Section */}
                        {(details.fine_amount > 0 || details.remarks || details.reason) && (
                            <div className="p-2.5 rounded-lg border flex flex-col gap-1" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'var(--glass-border)' }}>
                                {details.fine_amount > 0 && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-red-500">Fine Generated</span>
                                        <span className="font-bold text-red-500">₹{details.fine_amount}</span>
                                    </div>
                                )}
                                {(details.remarks || details.reason) && (
                                    <div className="text-[11px] italic opacity-80" style={{ color: 'var(--text-main)' }}>
                                        "{details.remarks || details.reason}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t flex justify-end" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                    <button onClick={onClose} className="px-4 py-1.5 rounded-lg transition-colors text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10" style={{ background: 'rgba(128,128,128,0.1)', color: 'var(--text-main)' }}>
                        Close
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default TransactionDetailsModal;
