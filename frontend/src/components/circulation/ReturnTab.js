import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RotateCcw, CheckCircle, AlertCircle, RefreshCcw, User, BookOpen, Calendar, Banknote, Package, X, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import StatusModal from '../common/StatusModal';

// Helper: Format date to DD/MM/YYYY
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper: Format date with time to DD/MM/YYYY HH:MM
const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const ReturnTab = () => {
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [issuedStudents, setIssuedStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    // Selection/Expansion State
    const [expandedStudentId, setExpandedStudentId] = useState(null);
    const [studentLoans, setStudentLoans] = useState({}); // Map: studentId -> [loan list]
    const [loadingLoans, setLoadingLoans] = useState(false);

    // Policy Defaults
    const [policyDefaults, setPolicyDefaults] = useState({
        renewalDays: 15,
        maxRenewals: 1,
        dailyFineRate: 1,
        damagedFineAmount: 100,
        lostFineAmount: 500
    });

    // Return Modal State
    const [returnModal, setReturnModal] = useState({
        isOpen: false,
        loan: null,
        student: null,
        condition: 'Good',
        fineAmount: 0,
        remarks: '',
        replacementGiven: false,
        newAccession: ''
    });

    // Renew Modal State
    const [renewModal, setRenewModal] = useState({
        isOpen: false,
        loan: null,
        student: null,
        extendDays: 15
    });

    const [processing, setProcessing] = useState(false);
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const showSuccess = (msg) => setStatusModal({ isOpen: true, type: 'success', title: 'Success', message: msg });
    const showError = (msg) => setStatusModal({ isOpen: true, type: 'error', title: 'Error', message: msg });

    // Fetch Policy Defaults on Mount
    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch('http://localhost:3001/api/circulation/policy-defaults', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPolicyDefaults(data);
                }
            } catch (e) {
                console.error('Failed to fetch policy defaults:', e);
            }
        };
        fetchDefaults();
    }, []);

    // Fetch Issued Students
    const fetchIssuedStudents = useCallback(async (query = '') => {
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = query
                ? `http://localhost:3001/api/circulation/issued-students?q=${encodeURIComponent(query)}`
                : 'http://localhost:3001/api/circulation/issued-students';
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setIssuedStudents(data || []);
        } catch (e) {
            console.error(e);
            setIssuedStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchIssuedStudents();
    }, [fetchIssuedStudents]);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchIssuedStudents(searchQuery);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, fetchIssuedStudents]);

    // Fetch Student Loans
    const fetchStudentLoans = async (studentId) => {
        setLoadingLoans(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/circulation/loans/${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStudentLoans(prev => ({ ...prev, [studentId]: data }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLoans(false);
        }
    };

    // Expand/Collapse & Fetch Loans
    const toggleStudent = async (studentId) => {
        if (expandedStudentId === studentId) {
            setExpandedStudentId(null);
        } else {
            setExpandedStudentId(studentId);
            if (!studentLoans[studentId]) {
                await fetchStudentLoans(studentId);
            }
        }
    };

    // Calculate Overdue Fine
    const calculateOverdueFine = (loan) => {
        const now = new Date();
        const dueDate = new Date(loan.due_date);
        if (now <= dueDate) return 0;
        const overdueDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        return overdueDays * policyDefaults.dailyFineRate;
    };

    // Open Return Modal
    const openReturnModal = (loan, student) => {
        const overdueFine = calculateOverdueFine(loan);
        setReturnModal({
            isOpen: true,
            loan,
            student,
            condition: 'Good',
            fineAmount: overdueFine,
            remarks: '',
            replacementGiven: false,
            newAccession: ''
        });
    };

    // Open Renew Modal
    const openRenewModal = (loan, student) => {
        setRenewModal({
            isOpen: true,
            loan,
            student,
            extendDays: policyDefaults.renewalDays
        });
    };

    // Fetch next available accession number for a book
    const fetchNextAccession = async (isbn) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/circulation/next-accession/${isbn}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                return data.next_accession || '';
            }
        } catch (err) {
            console.error('Error fetching next accession:', err);
        }
        return '';
    };

    // Handle Replacement Toggle
    const handleReplacementToggle = async (checked, loan) => {
        if (checked && loan?.book_isbn) {
            // Auto-fetch next accession number
            const nextAccession = await fetchNextAccession(loan.book_isbn);
            setReturnModal(prev => ({
                ...prev,
                replacementGiven: true,
                newAccession: nextAccession
            }));
        } else {
            setReturnModal(prev => ({
                ...prev,
                replacementGiven: false,
                newAccession: ''
            }));
        }
    };

    // Handle Condition Change in Return Modal
    const handleConditionChange = (condition) => {
        let baseFine = calculateOverdueFine(returnModal.loan);
        if (condition === 'Damaged') baseFine += policyDefaults.damagedFineAmount;
        else if (condition === 'Lost') baseFine += policyDefaults.lostFineAmount;

        setReturnModal(prev => ({
            ...prev,
            condition,
            fineAmount: baseFine,
            replacementGiven: condition === 'Lost' ? prev.replacementGiven : false,
            newAccession: condition === 'Lost' ? prev.newAccession : ''
        }));
    };

    // Execute Return
    const executeReturn = async () => {
        const { loan, condition, fineAmount, remarks, replacementGiven, newAccession, student } = returnModal;
        if (!loan) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:3001/api/circulation/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    transaction_id: loan.transaction_id,
                    condition,
                    remarks,
                    custom_fine_amount: condition !== 'Good' || calculateOverdueFine(loan) > 0 ? fineAmount : null,
                    replacement_given: replacementGiven,
                    new_accession_number: newAccession
                })
            });
            const data = await res.json();

            if (res.ok) {
                showSuccess(`Book returned successfully. ${data.fine_generated ? `Fine: ₹${data.fine_amount}` : ''}`);
                // Refresh loans and student list
                if (student?.id) {
                    await fetchStudentLoans(student.id);
                }
                await fetchIssuedStudents(searchQuery);
            } else {
                showError(data.error || 'Return failed');
            }
        } catch (e) {
            showError('Network Error');
        } finally {
            setProcessing(false);
            setReturnModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    // Execute Renew
    const executeRenew = async () => {
        const { loan, extendDays, student } = renewModal;
        if (!loan) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:3001/api/circulation/renew', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    transaction_id: loan.transaction_id,
                    extend_days: extendDays
                })
            });
            const data = await res.json();

            if (res.ok) {
                showSuccess(`Book renewed! New due date: ${formatDate(data.new_due_date)}`);
                // Refresh loans
                if (student?.id) {
                    await fetchStudentLoans(student.id);
                }
            } else {
                showError(data.error || 'Renew failed');
            }
        } catch (e) {
            showError('Network Error');
        } finally {
            setProcessing(false);
            setRenewModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    // Calculate new due date preview for renew
    const getNewDueDatePreview = () => {
        if (!renewModal.loan) return '-';
        const currentDue = new Date(renewModal.loan.due_date);
        currentDue.setDate(currentDue.getDate() + renewModal.extendDays);
        return formatDate(currentDue);
    };

    const conditions = [
        { value: 'Good', label: 'Good', color: 'green' },
        { value: 'Damaged', label: 'Damaged', color: 'orange' },
        { value: 'Lost', label: 'Lost', color: 'red' }
    ];

    return (
        <div className="h-full flex flex-col pt-0 text-white overflow-hidden relative" style={{ minHeight: '600px' }}>

            {/* Header / Search Row */}
            <div className="catalog-toolbar mb-4">
                <div className="toolbar-search" style={{ flex: 1 }}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by Name or Register No..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {loadingStudents && <RefreshCcw className="animate-spin text-gray-400" size={18} style={{ marginLeft: 'auto' }} />}
                </div>
            </div>


            {/* Feedback Toast - Removed in favor of StatusModal */}

            {/* Student Cards / Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4">
                {/* Empty States */}
                {!loadingStudents && issuedStudents.length === 0 && (
                    <div className="text-center py-20 text-gray-500 opacity-60">
                        <BookOpen size={48} className="mx-auto mb-4" />
                        <p>{searchQuery ? `No students found matching "${searchQuery}"` : 'No students currently have books issued'}</p>
                    </div>
                )}

                {/* Student Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {issuedStudents.map(student => {
                        const isExpanded = expandedStudentId === student.id;
                        const hasOverdue = student.overdue_count > 0;

                        // Grid span style for expanded
                        const gridStyle = isExpanded
                            ? { gridColumn: '1 / -1', transition: 'all 0.3s ease' }
                            : { transition: 'all 0.3s ease' };

                        return (
                            <div
                                key={student.id}
                                className={`glass-panel ${!isExpanded ? 'hover-scale' : ''}`}
                                style={{
                                    padding: '20px',
                                    position: 'relative',
                                    borderLeft: hasOverdue ? '4px solid #fc8181' : '4px solid #48bb78',
                                    zIndex: 1,
                                    ...gridStyle
                                }}
                            >
                                {/* Card Header (Clickable) */}
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleStudent(student.id)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-4">
                                            <div style={{
                                                width: '50px', height: '50px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                border: '1px solid var(--glass-border)'
                                            }}>
                                                <span className="text-xl font-bold text-white">{student.full_name?.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-white">{student.full_name}</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span className="font-mono bg-white/5 px-1.5 rounded">{student.register_number}</span>
                                                    <span>•</span>
                                                    <span>{student.department_code || student.department_name}</span>
                                                    <span>•</span>
                                                    <span>Sem {student.semester}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Books Count Badge */}
                                        <div className="text-right">
                                            <div className="text-sm text-gray-400">Books Issued</div>
                                            <div className="text-2xl font-bold text-white">{student.books_issued}</div>
                                        </div>
                                    </div>

                                    {/* Summary Bar */}
                                    <div className="flex justify-between items-center p-3 rounded-lg border border-glass" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center gap-4 text-sm">
                                            {hasOverdue ? (
                                                <span className="flex items-center gap-1 text-red-400">
                                                    <Clock size={14} /> {student.overdue_count} Overdue
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <CheckCircle size={14} /> All on time
                                                </span>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-white/10 accordion-content">
                                        {loadingLoans ? (
                                            <div className="flex justify-center py-8 text-gray-500 gap-2 items-center">
                                                <RefreshCcw className="animate-spin" size={16} /> Loading books...
                                            </div>
                                        ) : studentLoans[student.id]?.length > 0 ? (
                                            <div className="space-y-3">
                                                {studentLoans[student.id].map(loan => {
                                                    const isOverdue = new Date(loan.due_date) < new Date();
                                                    return (
                                                        <div key={loan.transaction_id} className="p-4 rounded-xl border border-glass bg-white/5">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex-1">
                                                                    <div className="font-semibold text-white text-lg">{loan.title}</div>
                                                                    <div className="text-sm text-gray-400">{loan.author}</div>
                                                                    <div className="text-xs text-gray-500 font-mono mt-1">Acc: {loan.accession_number}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`px-2 py-1 rounded text-xs font-medium ${isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                                        {isOverdue ? `Overdue ${Math.ceil(loan.overdue_days)} days` : 'On Time'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                                                <div>
                                                                    <div className="text-gray-500 text-xs">Issue Date</div>
                                                                    <div className="text-white">{formatDate(loan.issue_date)}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500 text-xs">Due Date</div>
                                                                    <div className={isOverdue ? 'text-red-400 font-bold' : 'text-green-400'}>{formatDate(loan.due_date)}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500 text-xs">Renewals</div>
                                                                    <div className="text-white">{loan.renewal_count || 0} / {policyDefaults.maxRenewals}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500 text-xs">Fine (if any)</div>
                                                                    <div className="text-orange-400">₹{calculateOverdueFine(loan).toFixed(2)}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 pt-2 border-t border-white/10">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); openRenewModal(loan, student); }}
                                                                    disabled={(loan.renewal_count || 0) >= policyDefaults.maxRenewals}
                                                                    className="flex-1 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-sm font-medium border border-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                                >
                                                                    <RefreshCcw size={14} /> Renew
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); openReturnModal(loan, student); }}
                                                                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-sm font-medium border border-blue-500/20 flex items-center justify-center gap-2"
                                                                >
                                                                    <RotateCcw size={14} /> Return
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                <CheckCircle size={24} className="mx-auto mb-2 text-green-400" />
                                                No active loans for this student.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Return Modal */}
            {returnModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="modal-content w-full max-w-lg animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h2 className="modal-title flex items-center gap-2">
                                    <RotateCcw className="text-blue-400" /> Return Book
                                </h2>
                                <button onClick={() => setReturnModal(p => ({ ...p, isOpen: false }))} className="modal-close">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto">

                            {/* Student Info */}
                            <div className="p-3 rounded-xl mb-4 flex items-center gap-3" style={{ background: 'var(--hover-overlay)' }}>
                                <User size={16} className="text-blue-400" />
                                <div>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{returnModal.student?.full_name}</span>
                                    <span style={{ color: 'var(--text-tertiary)' }} className="mx-2">•</span>
                                    <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{returnModal.student?.register_number}</span>
                                </div>
                            </div>

                            {/* Book Info */}
                            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--hover-overlay)' }}>
                                <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{returnModal.loan?.title}</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Accession: <span className="font-mono text-blue-400">{returnModal.loan?.accession_number}</span></div>
                                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    Issued: {formatDate(returnModal.loan?.issue_date)} | Due: {formatDate(returnModal.loan?.due_date)}
                                </div>
                            </div>

                            {/* Condition Selector */}
                            <div className="mb-4">
                                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Book Condition</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {conditions.map(c => {
                                        const isSelected = returnModal.condition === c.value;

                                        // Set colors based on condition type
                                        const colors = {
                                            Good: { bg: '#22c55e', hoverBg: 'rgba(34, 197, 94, 0.15)' },
                                            Damaged: { bg: '#f97316', hoverBg: 'rgba(249, 115, 22, 0.15)' },
                                            Lost: { bg: '#ef4444', hoverBg: 'rgba(239, 68, 68, 0.15)' }
                                        };
                                        const color = colors[c.value];

                                        return (
                                            <button
                                                key={c.value}
                                                onClick={() => handleConditionChange(c.value)}
                                                className="btn"
                                                style={isSelected ? {
                                                    flex: 1,
                                                    background: color.bg,
                                                    color: '#ffffff',
                                                    border: 'none'
                                                } : {
                                                    flex: 1,
                                                    background: 'var(--bg-secondary)',
                                                    color: color.bg,
                                                    border: `1px solid ${color.bg}`,
                                                }}
                                            >
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Fine Input (shown if applicable) */}
                            {(returnModal.condition !== 'Good' || calculateOverdueFine(returnModal.loan) > 0) && (
                                <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                    <label className="block text-sm text-orange-400 mb-2 font-medium flex items-center gap-2">
                                        <Banknote size={16} /> Fine Amount (Editable)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-orange-400">₹</span>
                                        <input
                                            type="number"
                                            value={returnModal.fineAmount}
                                            onChange={(e) => setReturnModal(p => ({ ...p, fineAmount: parseFloat(e.target.value) || 0 }))}
                                            className="flex-1 bg-black/20 border border-orange-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Replacement Option (for Lost) */}
                            {returnModal.condition === 'Lost' && (
                                <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={returnModal.replacementGiven}
                                            onChange={(e) => handleReplacementToggle(e.target.checked, returnModal.loan)}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span style={{ color: '#a855f7' }} className="font-medium flex items-center gap-2">
                                            <Package size={16} /> Student is giving a replacement copy
                                        </span>
                                    </label>
                                    {returnModal.replacementGiven && (
                                        <div className="mt-3">
                                            <label className="block text-sm mb-1" style={{ color: '#a855f7' }}>
                                                New Accession Number (Auto-generated)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="New Accession Number..."
                                                value={returnModal.newAccession}
                                                onChange={(e) => setReturnModal(p => ({ ...p, newAccession: e.target.value }))}
                                                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                                                style={{
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid rgba(147, 51, 234, 0.3)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Remarks */}
                            <div className="mb-6">
                                <label className="block text-sm text-gray-400 mb-2">Remarks</label>
                                <input
                                    type="text"
                                    placeholder="Optional remarks..."
                                    value={returnModal.remarks}
                                    onChange={(e) => setReturnModal(p => ({ ...p, remarks: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setReturnModal(p => ({ ...p, isOpen: false }))}
                                    className="btn btn-secondary flex-1 py-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeReturn}
                                    disabled={processing || (returnModal.condition === 'Lost' && returnModal.replacementGiven && !returnModal.newAccession)}
                                    className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                                >
                                    {processing ? <RefreshCcw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    Confirm Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Renew Modal */}
            {renewModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="modal-content w-full max-w-md animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h2 className="modal-title flex items-center gap-2">
                                    <Calendar className="text-purple-400" /> Renew Book
                                </h2>
                                <button onClick={() => setRenewModal(p => ({ ...p, isOpen: false }))} className="modal-close">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto">

                            {/* Student Info */}
                            <div className="p-3 rounded-xl mb-4 flex items-center gap-3" style={{ background: 'var(--hover-overlay)' }}>
                                <User size={16} className="text-purple-400" />
                                <div>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{renewModal.student?.full_name}</span>
                                    <span style={{ color: 'var(--text-tertiary)' }} className="mx-2">•</span>
                                    <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{renewModal.student?.register_number}</span>
                                </div>
                            </div>

                            {/* Book Info */}
                            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--hover-overlay)' }}>
                                <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{renewModal.loan?.title}</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Due: {formatDate(renewModal.loan?.due_date)}</div>
                            </div>

                            {/* Days Input */}
                            <div className="mb-4">
                                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Extend by (days)</label>
                                <input
                                    type="number"
                                    value={renewModal.extendDays}
                                    onChange={(e) => setRenewModal(p => ({ ...p, extendDays: parseInt(e.target.value) || 0 }))}
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>

                            {/* New Due Date Preview */}
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6">
                                <div className="text-sm text-purple-400">New Due Date:</div>
                                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{getNewDueDatePreview()}</div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setRenewModal(p => ({ ...p, isOpen: false }))}
                                    className="btn btn-secondary flex-1 py-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeRenew}
                                    disabled={processing || renewModal.extendDays <= 0}
                                    className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                                >
                                    {processing ? <RefreshCcw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    Confirm Renew
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />
        </div>
    );
};

export default ReturnTab;
