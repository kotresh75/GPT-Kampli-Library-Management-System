import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, BookOpen, User, Hash, AlignLeft, Info, CheckCircle, AlertCircle, RefreshCw, DollarSign, Copy, FileJson, ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { useLanguage } from '../../context/LanguageContext';

const TransactionDetailsModal = ({ isOpen, onClose, transaction }) => {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [showRaw, setShowRaw] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

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

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const StatusBadge = ({ status }) => {
        let style = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        let icon = <Info size={12} />;

        if (status === 'ISSUE') {
            style = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            icon = <ArrowUpRight size={12} />;
        } else if (status === 'RETURN') {
            style = 'bg-green-500/20 text-green-400 border-green-500/30';
            icon = <ArrowDownLeft size={12} />;
        } else if (status === 'RENEW') {
            style = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            icon = <RotateCcw size={12} />;
        } else if (status === 'FINE_PAID') {
            style = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            icon = <DollarSign size={12} />;
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 w-fit ${style}`}>
                {icon} {status}
            </span>
        );
    };

    const DetailItem = ({ label, value, icon: Icon, copyable = false }) => (
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium flex items-center gap-1.5">
                {Icon && <Icon size={10} className="opacity-70" />}
                {label}:
            </span>
            <div className="flex items-center gap-2 max-w-[60%] justify-end">
                <span className="text-sm font-medium text-gray-200 truncate" title={value}>
                    {value || '-'}
                </span>
                {copyable && value && (
                    <button
                        onClick={() => copyToClipboard(value, label)}
                        className={`p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 ${copiedField === label ? 'text-green-400' : 'text-gray-500'}`}
                        title="Copy"
                    >
                        {copiedField === label ? <CheckCircle size={10} /> : <Copy size={10} />}
                    </button>
                )}
            </div>
        </div>
    );

    // ... (keep safeDate helper) ...
    // Safe date helper
    const getDateObj = (ts) => {
        if (!ts) return null;
        const d = new Date(ts);
        return isNaN(d.getTime()) ? null : d;
    };
    // Check multiple possible date fields
    const safeDate = getDateObj(transaction.timestamp || transaction.date || transaction.issue_date || transaction.return_date || transaction.created_at);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in p-4" style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        }}>
            <div className="glass-panel w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[70vh] shadow-2xl"
                onClick={e => e.stopPropagation()}
                style={{
                    maxHeight: '70vh', // Strictly enforce 70% height
                    background: 'var(--glass-bg, #1a1b26)', // Fallback to dark color
                    border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Header */}
                <div className="p-3 border-b border-white/10 flex justify-between items-start bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 text-blue-400 shadow-inner">
                            <Info size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-base font-bold text-white">{t('history.details.title')}</h3>
                                <StatusBadge status={transaction.action_type} />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                                <span className="opacity-70">{t('history.details.id')}: {transaction.id}</span>
                                <button onClick={() => copyToClipboard(transaction.id, 'id')} className="hover:text-white transition-colors">
                                    {copiedField === 'id' ? <CheckCircle size={10} className="text-green-400" /> : <Copy size={10} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">

                    {/* Compact Section 1: Identities (Side-by-Side) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Student Card */}
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2">
                            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1 mb-0.5">
                                <User size={10} /> {t('history.details.student')}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 uppercase">{t('history.details.name')}:</span>
                                    <span className="text-xs font-medium text-white truncate max-w-[70%]" title={transaction.student_name}>{transaction.student_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 uppercase">{t('history.details.reg_no')}:</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-300">{transaction.student_reg_no || transaction.register_number}</span>
                                        <button onClick={() => copyToClipboard(transaction.student_reg_no || transaction.register_number, 'reg')} className="text-gray-600 hover:text-white"><Copy size={9} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 uppercase">{t('history.details.dept')}:</span>
                                    <span className="text-xs text-gray-300 truncate max-w-[70%]">{transaction.student_dept || transaction.department_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Book Card */}
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2">
                            <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1 mb-0.5">
                                <BookOpen size={10} /> {t('history.details.book')}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 uppercase">{t('history.details.book_title')}:</span>
                                    <span className="text-xs font-medium text-white truncate max-w-[70%]" title={transaction.book_title}>{transaction.book_title}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 uppercase">{t('history.details.isbn')}:</span>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-gray-300 font-mono">{details.accession || transaction.accession_number}</span>
                                            <button onClick={() => copyToClipboard(details.accession || transaction.accession_number, 'acc')} className="text-gray-600 hover:text-white"><Copy size={9} /></button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-gray-400 font-mono truncate max-w-[80px]">{transaction.book_isbn || transaction.isbn}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Section 2: Timeline Table */}
                    <div className="rounded-lg border border-white/10 overflow-hidden">
                        <div className="bg-white/5 px-3 py-1.5 border-b border-white/10 flex items-center gap-2">
                            <Clock size={10} className="text-purple-300" />
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">{t('history.details.timeline')}</span>
                        </div>
                        <div className="p-3 grid grid-cols-1 gap-2">
                            <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                <span className="text-[10px] text-gray-500 uppercase">{t('history.details.action_date')}:</span>
                                <span className="text-xs font-medium text-white">{safeDate ? formatDate(safeDate) : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                <span className="text-[10px] text-gray-500 uppercase">{t('history.details.time')}:</span>
                                <span className="text-xs text-gray-300">{safeDate ? safeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                            </div>

                            {transaction.action_type === 'ISSUE' && (
                                <>
                                    <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                        <span className="text-[10px] text-gray-500 uppercase">{t('history.details.due_date')}:</span>
                                        <span className="text-xs font-medium text-blue-300">{formatDate(details.due_date)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                        <span className="text-[10px] text-gray-500 uppercase">{t('history.details.duration')}:</span>
                                        <span className="text-xs text-gray-300">{details.loan_days} {t('history.details.days')}</span>
                                    </div>
                                </>
                            )}

                            {transaction.action_type === 'RETURN' && (
                                <>
                                    <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                        <span className="text-[10px] text-gray-500 uppercase">{t('history.details.returned')}:</span>
                                        <span className="text-xs font-medium text-green-300">{formatDate(details.return_date)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                        <span className="text-[10px] text-gray-500 uppercase">{t('history.details.condition')}:</span>
                                        <span className={`text-xs font-bold ${details.condition === 'Good' ? 'text-green-400' : 'text-red-400'}`}>
                                            {details.condition}
                                        </span>
                                    </div>
                                </>
                            )}

                            {transaction.action_type === 'RENEW' && (
                                <>
                                    <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                        <span className="text-[10px] text-gray-500 uppercase">{t('history.details.extended')}:</span>
                                        <span className="text-xs text-gray-300">+{details.extend_days} {t('history.details.days')}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
                                        <span className="text-[10px] text-gray-500 uppercase">{t('history.details.new_due')}:</span>
                                        <span className="text-xs font-medium text-blue-300">{formatDate(details.new_due_date)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Fines & Remarks */}
                    {(details.fine_amount > 0 || details.remarks || details.reason || details.waiver_reason) && (
                        <div className="grid grid-cols-1 gap-4">
                            {Number(details.fine_amount) > 0 && (
                                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-red-500/20 text-red-400">
                                            <DollarSign size={14} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-red-300 opacity-80 uppercase tracking-wide">{t('history.details.fine_generated')}</div>
                                            <div className="text-sm font-bold text-red-200">₹{details.fine_amount}</div>
                                        </div>
                                    </div>
                                    {transaction.action_type === 'FINE_PAID' && (
                                        <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded border border-green-500/30">
                                            PAID
                                        </div>
                                    )}
                                </div>
                            )}

                            {(details.remarks || details.reason || details.waiver_reason) && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">{t('history.details.notes')}</label>
                                    <div className="p-2 rounded bg-white/5 border border-white/10 text-xs text-gray-300 italic">
                                        "{details.remarks || details.reason || details.waiver_reason}"
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Raw Data Toggle */}
                    <div className="pt-2 border-t border-white/5">
                        <button
                            onClick={() => setShowRaw(!showRaw)}
                            className="flex items-center gap-2 text-[10px] text-blue-400 hover:text-blue-300 transition-colors opacity-70 hover:opacity-100 uppercase tracking-wide font-medium"
                        >
                            <FileJson size={12} />
                            {showRaw ? t('history.details.hide_raw') : t('history.details.view_raw')}
                        </button>

                        {showRaw && (
                            <div className="mt-2 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-[9px] text-gray-400 whitespace-pre-wrap overflow-x-auto scrollbar-thin">
                                {JSON.stringify(details, null, 2)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        {t('history.details.recorded_by')}: <span className="text-gray-400">{transaction.performed_by || 'System'}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/5"
                    >
                        {t('history.details.close')}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default TransactionDetailsModal;
