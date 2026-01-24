import React, { useState, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, ArrowUp, ArrowDown, Info, Layers, BookOpen, Clock, AlertCircle, CheckCircle, RotateCcw, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import { formatDate } from '../../utils/dateUtils';
import '../../styles/components/tables.css';

const SmartTransactionTable = ({
    transactions,
    loading,
    selectedIds,
    onSelect,
    onSelectAll,
    onView
}) => {
    // Safeguard: Ensure transactions is an array
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    // --- State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
    const [showSelectPopup, setShowSelectPopup] = useState(false);

    // --- Formatters ---
    const StatusBadge = ({ status }) => {
        const styles = {
            ISSUE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            RETURN: 'bg-green-500/20 text-green-400 border-green-500/30',
            RENEW: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            Active: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };
        const icons = {
            ISSUE: <ArrowUpRight size={14} />,
            RETURN: <ArrowDownLeft size={14} />,
            RENEW: <RotateCcw size={14} />
        };

        const style = styles[status] || styles.Active;
        const icon = icons[status] || <Info size={14} />;

        return (
            <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 w-fit ${style}`}>
                {icon} {status}
            </span>
        );
    };

    // --- Sorting Logic ---
    const sortedTransactions = useMemo(() => {
        let sortableItems = [...safeTransactions];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Mappings for complex fields
                if (sortConfig.key === 'timestamp') {
                    aValue = new Date(a.timestamp || a.date).getTime();
                    bValue = new Date(b.timestamp || b.date).getTime();
                } else if (sortConfig.key === 'student_name') {
                    aValue = (a.student_name || '').toLowerCase();
                    bValue = (b.student_name || '').toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [safeTransactions, sortConfig]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedTransactions, currentPage, itemsPerPage]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [safeTransactions.length]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <div className="shrink-0 w-4"><ArrowUpDown size={14} style={{ opacity: 0.3 }} /></div>;
        return <div className="shrink-0 w-4">{sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}</div>;
    };

    if (loading) {
        return (
            <div className="glass-panel w-full p-12 flex justify-center items-center h-64">
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (safeTransactions.length === 0) {
        return (
            <div className="glass-panel w-full p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                    <Layers size={48} className="text-gray-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Transactions Found</h3>
                <p className="text-[var(--text-secondary)]">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds?.size > 0}
                                        ref={(el) => {
                                            if (el) {
                                                el.indeterminate = selectedIds?.size > 0 && selectedIds?.size < safeTransactions.length;
                                            }
                                        }}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            if (selectedIds?.size > 0 || safeTransactions.length > paginatedTransactions.length) {
                                                setShowSelectPopup(true);
                                            } else {
                                                if (onSelectAll) onSelectAll(safeTransactions.map(t => t.id));
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                </div>
                                {showSelectPopup && (
                                    <>
                                        <div
                                            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                                            onClick={() => setShowSelectPopup(false)}
                                        />
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                                            background: 'var(--bg-color)', border: '1px solid var(--glass-border)',
                                            borderRadius: '8px', padding: '4px', zIndex: 101, minWidth: '160px'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    if (onSelectAll) onSelectAll(paginatedTransactions.map(t => t.id));
                                                    setShowSelectPopup(false);
                                                }}
                                                className="popup-btn"
                                            >
                                                Select This Page
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (onSelectAll) onSelectAll(safeTransactions.map(t => t.id));
                                                    setShowSelectPopup(false);
                                                }}
                                                className="popup-btn highlight"
                                            >
                                                Select All ({safeTransactions.length})
                                            </button>
                                            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />
                                            <button
                                                onClick={() => {
                                                    if (onSelectAll) onSelectAll([]); // Clear
                                                    setShowSelectPopup(false);
                                                }}
                                                className="popup-btn"
                                            >
                                                Deselect All
                                            </button>
                                        </div>
                                    </>
                                )}
                            </th>
                            <th className="sortable" style={{ minWidth: '200px' }} onClick={() => handleSort('student_name')}>
                                <div className="flex items-center gap-2 whitespace-nowrap">Student {getSortIcon('student_name')}</div>
                            </th>
                            <th className="sortable" style={{ minWidth: '250px' }} onClick={() => handleSort('book_title')}>
                                <div className="flex items-center gap-2 whitespace-nowrap">Book Details {getSortIcon('book_title')}</div>
                            </th>
                            <th className="sortable" style={{ minWidth: '180px' }} onClick={() => handleSort('timestamp')}>
                                <div className="flex items-center gap-2 whitespace-nowrap">Date & Time {getSortIcon('timestamp')}</div>
                            </th>
                            <th className="sortable" style={{ minWidth: '120px' }} onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-2 whitespace-nowrap">Action {getSortIcon('status')}</div>
                            </th>
                            <th style={{ minWidth: '150px' }}>Details</th>
                            <th style={{ textAlign: 'right', minWidth: '80px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTransactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-white/5 transition-colors group">
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds?.has(txn.id)}
                                        onChange={() => onSelect && onSelect(txn.id)}
                                        className="cursor-pointer"
                                    />
                                </td>
                                <td>
                                    <div className="font-medium text-[var(--text-primary)]">{txn.student_name}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{txn.register_number}</div>
                                    <div className="text-xs text-gray-600">{txn.department_name}</div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                                        <BookOpen size={14} className="text-accent/70" /> {txn.book_title}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)] mt-1">Acc: <span className="font-mono opacity-70">{txn.accession_number}</span></div>
                                </td>
                                <td className="text-[var(--text-secondary)]">
                                    {formatDate(txn.timestamp || txn.date)}
                                    <div className="text-xs opacity-60">
                                        {new Date(txn.timestamp || txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td>
                                    <StatusBadge status={txn.status} />
                                </td>
                                <td className="text-[var(--text-muted)] text-xs max-w-xs truncate">
                                    {txn.status === 'RETURN' && txn.details && (
                                        <span>
                                            Cond: {JSON.parse(txn.details).condition || 'Good'}
                                            {Number(JSON.parse(txn.details).fine_amount) > 0 && <span className="text-red-400 ml-2">Fine: ₹{JSON.parse(txn.details).fine_amount}</span>}
                                        </span>
                                    )}
                                    {txn.status === 'ISSUE' && txn.details && (
                                        <span>Due: {formatDate(JSON.parse(txn.details).due_date)}</span>
                                    )}
                                    {txn.status === 'RENEW' && txn.details && (
                                        <span>New Due: {formatDate(JSON.parse(txn.details).new_due_date)}</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onView && onView(txn)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                            title="View Log"
                                        >
                                            <Info size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-2 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-color-light)]">
                    <div className="text-sm text-[var(--text-tertiary)]">
                        Showing <span className="text-[var(--text-primary)] font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[var(--text-primary)] font-bold">{Math.min(currentPage * itemsPerPage, safeTransactions.length)}</span> of <span className="text-[var(--text-primary)] font-bold">{safeTransactions.length}</span> results
                    </div>

                    <div className="flex items-center gap-2">
                        <div style={{ width: '130px' }}>
                            <GlassSelect
                                options={[
                                    { value: 10, label: '10 per page' },
                                    { value: 20, label: '20 per page' },
                                    { value: 50, label: '50 per page' }
                                ]}
                                value={itemsPerPage}
                                onChange={setItemsPerPage}
                                small={true}
                                showSearch={false}
                            />
                        </div>

                        <div className="h-4 w-px bg-[var(--border-color)] mx-2"></div>

                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <span className="text-sm font-medium px-2 text-[var(--text-primary)]">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .popup-btn {
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    text-align: left;
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    font-size: 0.85rem;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .popup-btn:hover {
                    background: rgba(255,255,255,0.1);
                }
                .popup-btn.highlight {
                    color: var(--primary-color);
                    font-weight: 600;
                }
                .popup-btn.highlight:hover {
                    background: rgba(99, 179, 237, 0.1);
                }
            `}</style>
        </div>
    );
};

export default SmartTransactionTable;
