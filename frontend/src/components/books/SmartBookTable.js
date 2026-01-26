import React, { useState, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, ArrowUp, ArrowDown, Edit, Layers, Trash2,
    MoreHorizontal, Eye
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useLanguage } from '../../context/LanguageContext';
import GlassSelect from '../common/GlassSelect';
import '../../styles/components/tables.css';

const SmartBookTable = ({
    books,
    loading,
    selectedIds,
    onSelect,
    onSelectAll,
    onEdit,
    onManage,
    onDelete, // Single delete
    onView
}) => {
    // --- State ---
    const { t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [showSelectPopup, setShowSelectPopup] = useState(false);


    // --- Sorting Logic ---
    const sortedBooks = useMemo(() => {
        let sortableItems = [...books];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested/special cases
                if (sortConfig.key === 'department') {
                    aValue = a.department_name || a.category || '';
                    bValue = b.department_name || b.category || '';
                } else if (sortConfig.key === 'availability') {
                    // Calculate percentage or raw number
                    aValue = a.available_copies;
                    bValue = b.available_copies;
                } else {
                    // String comparison case insensitive
                    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [books, sortConfig]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
    const paginatedBooks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedBooks.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedBooks, currentPage, itemsPerPage]);

    // Reset page if books change (filter applied)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [books.length]);

    // --- Handlers ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    // --- Formatters ---
    const getAvailabilityBadge = (available, total) => {
        const percentage = total > 0 ? (available / total) * 100 : 0;
        let status = 'success';
        let label = t('books.table.status_available');

        if (percentage === 0) {
            status = 'out';
            label = t('books.table.status_out');
        } else if (percentage < 30) {
            status = 'low';
            label = t('books.table.status_low');
        }

        return (
            <div className="flex flex-col gap-1">
                <span className={`status-badge ${status}`}>
                    {status === 'success' && <div className="status-dot success"></div>}
                    {status === 'low' && <div className="status-dot warning"></div>}
                    {status === 'out' && <div className="status-dot danger"></div>}
                    {available} / {total}
                </span>
                {/* Mini bar */}
                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div
                        className={`h-full rounded-full ${status === 'success' ? 'bg-emerald-400' : status === 'low' ? 'bg-amber-400' : 'bg-red-500'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="glass-panel w-full p-12 flex justify-center items-center h-64">
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="glass-panel w-full p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                    <Layers size={48} className="text-gray-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('books.table.no_books')}</h3>
                <p className="text-[var(--text-secondary)]">{t('books.table.no_books_hint')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Wrapper for horizontal scroll */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size > 0}
                                        ref={(el) => {
                                            if (el) {
                                                el.indeterminate = selectedIds.size > 0 && selectedIds.size < books.length;
                                            }
                                        }}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            // Show popup if: items are selected OR multiple pages exist
                                            if (selectedIds.size > 0 || books.length > paginatedBooks.length) {
                                                setShowSelectPopup(true);
                                            } else {
                                                // Single page, nothing selected - just select all
                                                onSelectAll(books.map(b => b.isbn));
                                            }
                                        }}
                                        className="cursor-pointer"
                                        title={selectedIds.size > 0 ? t('books.table.selected_count', { count: selectedIds.size }) : t('books.table.select_tooltip')}
                                    />
                                </div>
                                {/* Selection Popup */}
                                {showSelectPopup && (
                                    <>
                                        <div
                                            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                                            onClick={() => setShowSelectPopup(false)}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            marginTop: '4px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            padding: '4px',
                                            zIndex: 101,
                                            minWidth: '160px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    onSelectAll(paginatedBooks.map(b => b.isbn));
                                                    setShowSelectPopup(false);
                                                }}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    textAlign: 'left',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-main)',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                            >
                                                {t('books.table.select_page')} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({paginatedBooks.length})</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onSelectAll(books.map(b => b.isbn));
                                                    setShowSelectPopup(false);
                                                }}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    textAlign: 'left',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--primary-color)',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    fontWeight: 600
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(99, 179, 237, 0.1)'}
                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                            >
                                                {t('books.table.select_all_global')} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({books.length})</span>
                                            </button>
                                            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />
                                            <button
                                                onClick={() => {
                                                    // Pass all selected IDs so the toggle logic in parent will remove them all
                                                    onSelectAll(Array.from(selectedIds));
                                                    setShowSelectPopup(false);
                                                }}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    textAlign: 'left',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                            >
                                                {t('books.table.deselect_all')}
                                            </button>
                                        </div>
                                    </>
                                )}

                            </th>
                            <th style={{ width: '80px' }}>{t('books.table.cover')}</th>
                            <th className="sortable" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-2">{t('books.table.title')} {getSortIcon('title')}</div>
                            </th>
                            <th className="sortable" onClick={() => handleSort('author')}>
                                <div className="flex items-center gap-2">{t('books.table.author')} {getSortIcon('author')}</div>
                            </th>
                            <th className="sortable" onClick={() => handleSort('department')}>
                                <div className="flex items-center gap-2">{t('books.table.dept')} {getSortIcon('department')}</div>
                            </th>
                            <th className="sortable" onClick={() => handleSort('availability')}>
                                <div className="flex items-center gap-2">{t('books.table.availability')} {getSortIcon('availability')}</div>
                            </th>
                            <th style={{ textAlign: 'right', minWidth: '160px' }}>{t('books.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBooks.map((book) => (
                            <tr key={book.isbn} className="hover:bg-white/5 transition-colors group">
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(book.isbn)}
                                        onChange={() => onSelect(book.isbn)}
                                        className="cursor-pointer"
                                    />
                                </td>
                                <td>
                                    <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden border border-white/10 shadow-sm relative group-hover:scale-110 transition-transform">
                                        {book.cover_image_url ? (
                                            <img src={book.cover_image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">N/A</div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span
                                            className="font-medium text-[var(--text-primary)] cursor-pointer hover:text-blue-400 decoration-blue-400 no-underline hover:underline transition-all"
                                            onClick={() => onView && onView(book)}
                                        >
                                            {book.title}
                                        </span>
                                        <span className="text-xs text-[var(--text-secondary)] font-mono mt-1 opacity-70">ISBN: {book.isbn}</span>
                                    </div>
                                </td>
                                <td className="text-sm text-[var(--text-secondary)]">{book.author}</td>
                                <td>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        {book.department_name || book.category || 'General'}
                                    </span>
                                </td>
                                <td>
                                    {getAvailabilityBadge(book.available_copies, book.total_copies)}
                                </td>
                                <td>
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
                                        <button
                                            onClick={() => onView && onView(book)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                            title={t('books.table.view')}
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => onEdit && onEdit(book)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                                            title={t('books.table.edit')}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onManage && onManage(book)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-500/20 text-purple-400 transition-colors"
                                            title={t('books.table.manage')}
                                        >
                                            <Layers size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(book)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                            title={t('books.table.delete')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex justify-between items-center px-4 py-2 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-color-light)]">
                        <div className="text-sm text-[var(--text-tertiary)]">
                            {t('books.table.showing')} <span className="text-[var(--text-primary)] font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> {t('books.table.to')} <span className="text-[var(--text-primary)] font-bold">{Math.min(currentPage * itemsPerPage, books.length)}</span> {t('books.table.of')} <span className="text-[var(--text-primary)] font-bold">{books.length}</span> {t('books.table.results')}
                        </div>

                        <div className="flex items-center gap-2">
                            <div style={{ width: '130px' }}>
                                <GlassSelect
                                    options={[
                                        { value: 10, label: `10 ${t('books.table.per_page')}` },
                                        { value: 20, label: `20 ${t('books.table.per_page')}` },
                                        { value: 50, label: `50 ${t('books.table.per_page')}` }
                                    ]}
                                    value={itemsPerPage}
                                    onChange={(val) => setItemsPerPage(val)}
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

                                {/* Simple page indicator */}
                                <span className="text-sm font-medium px-2 text-[var(--text-primary)]">
                                    {t('books.table.page')} {currentPage} {t('books.table.of')} {totalPages}
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
                )
            }
        </div >
    );
};

export default SmartBookTable;
