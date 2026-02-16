import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, BookOpen, User, Hash, AlignLeft, Info } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const TransactionDetailModal = ({ isOpen, onClose, transaction }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !transaction || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1400] flex items-center justify-center animate-fade-in p-4" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400
        }}>
            <div className="glass-panel w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
                style={{
                    padding: 0, // Reset default glass-panel padding for this specific layout
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    boxShadow: 'var(--glass-shadow)',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--radius-lg)'
                }}
            >

                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                            <Info size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-main)' }}>Transaction Details</h3>
                            <div className="text-xs font-mono mt-0.5 opacity-75" style={{ color: 'var(--text-secondary)' }}>{transaction.id}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="transition-colors p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 text-sm">

                    {/* Primary Info (Student & Status) */}
                    <div className="flex justify-between items-start p-4 rounded-xl border" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>Student</span>
                            <div className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                <User size={16} className="opacity-70" />
                                {transaction.student.name}
                            </div>
                            <div className="text-xs pl-6 opacity-80" style={{ color: 'var(--text-secondary)' }}>{transaction.student.regNo}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</span>
                            <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border inline-block
                                ${transaction.action.includes('PAID') ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                                    transaction.action === 'Waived' ? 'border-orange-500/30 text-orange-500 bg-orange-500/10' :
                                        'border-blue-500/30 text-blue-500 bg-blue-500/10'}`}>
                                {transaction.action}
                            </div>
                        </div>
                    </div>

                    {/* Snapshot Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                <Calendar size={12} /> Date
                            </div>
                            <div className="font-medium" style={{ color: 'var(--text-main)' }}>{formatDate(transaction.timestamp)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                <Clock size={12} /> Time
                            </div>
                            <div className="font-medium" style={{ color: 'var(--text-main)' }}>
                                {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {/* Book & Fine Info */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                <BookOpen size={12} /> Book Title
                            </div>
                            <div className="font-medium text-lg leading-snug" style={{ color: 'var(--text-main)' }}>{transaction.details.book_title || 'N/A'}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                    <Hash size={12} /> Accession
                                </div>
                                <div className="font-mono" style={{ color: 'var(--text-main)' }}>{transaction.details.accession || 'N/A'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                    Amount
                                </div>
                                <div className="font-mono font-bold" style={{ color: 'var(--text-main)' }}>₹{transaction.details.fine_amount || transaction.details.amount || 0}</div>
                            </div>
                        </div>
                    </div>

                    {/* Remarks / Reason */}
                    {(transaction.details.remarks || transaction.details.reason) && (
                        <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                            <div className="flex items-center gap-2 text-xs uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                <AlignLeft size={12} /> Remarks / Reason
                            </div>
                            <div className="p-3 rounded-lg italic" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)' }}>
                                "{transaction.details.remarks || transaction.details.reason}"
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t flex justify-end" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg transition-colors text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10" style={{ background: 'rgba(128,128,128,0.1)', color: 'var(--text-main)' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TransactionDetailModal;
