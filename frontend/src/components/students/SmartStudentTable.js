import React, { useState } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2, Eye,
    CheckCircle, XCircle, GraduationCap, Layers
} from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import '../../styles/components/tables.css';

const SmartStudentTable = ({
    students,
    loading,
    selectedIds,
    onSelect,
    onSelectAll,
    onEdit,
    onDelete,
    onView,
    sortConfig,
    onSort,
    pagination // { currentPage, totalPages, itemsPerPage, onPageChange, onItemsPerPageChange, totalItems }
}) => {
    const [showSelectPopup, setShowSelectPopup] = useState(false);

    // --- Formatters ---
    const getStatusBadge = (status) => {
        if (status === 'Active') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1 w-fit">
                    <CheckCircle size={12} /> Active
                </span>
            );
        } else if (status === 'Blocked') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit">
                    <XCircle size={12} /> Blocked
                </span>
            );
        } else if (status === 'Graduated') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 w-fit">
                    <GraduationCap size={12} /> Alumni
                </span>
            );
        } else {
            return <span className="text-gray-500 text-xs">{status}</span>;
        }
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    if (loading) {
        return (
            <div className="glass-panel w-full p-12 flex justify-center items-center h-64">
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="glass-panel w-full p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                    <Layers size={48} className="text-gray-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Students Found</h3>
                <p className="text-[var(--text-secondary)]">Try adjusting your search or filters.</p>
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
                                                el.indeterminate = selectedIds.size > 0 && selectedIds.size < pagination.totalItems;
                                            }
                                        }}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            // Show popup if: items are selected OR multiple pages exist
                                            if (selectedIds.size > 0 || pagination.totalPages > 1) {
                                                setShowSelectPopup(true);
                                            } else {
                                                // Single page, nothing selected - just select all on this page
                                                const pageIds = students.map(s => s.id);
                                                onSelectAll(pageIds, true);
                                            }
                                        }}
                                        className="cursor-pointer"
                                        title={selectedIds.size > 0 ? `${selectedIds.size} selected - Click to manage` : "Select Students"}
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
                                            minWidth: '180px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    const pageIds = students.map(s => s.id);
                                                    onSelectAll(pageIds, true);
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
                                                Select This Page <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({students.length})</span>
                                            </button>

                                            {/* Global Select All Option */}
                                            {pagination.onSelectAllGlobal && (
                                                <button
                                                    onClick={() => {
                                                        pagination.onSelectAllGlobal();
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
                                                    Select All Students <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({pagination.totalItems})</span>
                                                </button>
                                            )}

                                            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />
                                            <button
                                                onClick={() => {
                                                    // Deselect All
                                                    onSelectAll([], false);
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
                                                Deselect All
                                            </button>
                                        </div>
                                    </>
                                )}
                            </th>
                            <th style={{ width: '60px' }}>#</th>
                            <th className="sortable" onClick={() => onSort('name')}>
                                <div className="flex items-center gap-2">Student Name {getSortIcon('name')}</div>
                            </th>
                            <th className="sortable" onClick={() => onSort('register_no')}>
                                <div className="flex items-center gap-2">Register No {getSortIcon('register_no')}</div>
                            </th>
                            <th className="sortable" onClick={() => onSort('department')}>
                                <div className="flex items-center gap-2">Department {getSortIcon('department')}</div>
                            </th>
                            <th className="sortable" onClick={() => onSort('semester')}>
                                <div className="flex items-center gap-2">Semester {getSortIcon('semester')}</div>
                            </th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right', minWidth: '120px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(student.id)}
                                        onChange={() => onSelect(student.id)}
                                        className="cursor-pointer"
                                    />
                                </td>
                                <td className="text-[var(--text-secondary)]">
                                    {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                                </td>
                                <td>
                                    <span
                                        className="font-medium text-[var(--text-primary)] cursor-pointer hover:text-blue-400 decoration-blue-400 no-underline hover:underline transition-all"
                                        onClick={() => onView && onView(student)}
                                    >
                                        {student.full_name}
                                    </span>
                                </td>
                                <td className="font-mono text-sm text-[var(--text-secondary)]">
                                    {student.register_number}
                                </td>
                                <td>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        {student.department_name}
                                    </span>
                                </td>
                                <td className="font-medium">Sem {student.semester}</td>
                                <td>
                                    {getStatusBadge(student.status)}
                                </td>
                                <td>
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
                                        <button
                                            onClick={() => onView && onView(student)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => onEdit && onEdit(student)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                                            title="Edit Student"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(student.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                            title="Delete Student"
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
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-2 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-color-light)] mt-2">
                    <div className="text-sm text-[var(--text-tertiary)]">
                        Showing <span className="text-[var(--text-primary)] font-bold">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="text-[var(--text-primary)] font-bold">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of <span className="text-[var(--text-primary)] font-bold">{pagination.totalItems}</span> students
                    </div>

                    <div className="flex items-center gap-2">
                        {/* 
                         * Server-side logic often has fixed page sizes or handled elsewhere. 
                         * If backend supports variable limit, we can enable this.
                         * For now, displaying it if onItemsPerPageChange is provided 
                         */}
                        {pagination.onItemsPerPageChange && (
                            <>
                                <div style={{ width: '130px' }}>
                                    <GlassSelect
                                        options={[
                                            { value: 10, label: '10 per page' },
                                            { value: 20, label: '20 per page' },
                                            { value: 50, label: '50 per page' }
                                        ]}
                                        value={pagination.itemsPerPage}
                                        onChange={(val) => pagination.onItemsPerPageChange(val)}
                                        small={true}
                                        showSearch={false}
                                    />
                                </div>
                                <div className="h-4 w-px bg-[var(--border-color)] mx-2"></div>
                            </>
                        )}

                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => pagination.onPageChange(1)}
                                disabled={pagination.currentPage === 1}
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                                disabled={pagination.currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <span className="text-sm font-medium px-2 text-[var(--text-primary)]">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                className="pagination-btn"
                                onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => pagination.onPageChange(pagination.totalPages)}
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartStudentTable;
