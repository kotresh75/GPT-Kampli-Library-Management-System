import React, { useState, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Layers,
    BookOpen, Users
} from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/components/tables.css';

const SmartDepartmentTable = ({
    departments,
    loading,
    onEdit,
    onDelete,
}) => {
    const { t } = useLanguage();
    // --- State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // --- Sorting Logic ---
    const sortedDepartments = useMemo(() => {
        let sortableItems = [...departments];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle string comparison case insensitive
                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

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
    }, [departments, sortConfig]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage);
    const paginatedDepartments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedDepartments.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedDepartments, currentPage, itemsPerPage]);

    // Reset page if departments change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [departments.length]);

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

    if (loading) {
        return (
            <div className="glass-panel w-full p-12 flex justify-center items-center h-64">
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (departments.length === 0) {
        return (
            <div className="glass-panel w-full p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                    <Layers size={48} className="text-gray-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('departments.table.no_depts')}</h3>
                <p className="text-[var(--text-secondary)]">{t('departments.table.no_depts_hint')}</p>
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
                            <th className="sortable" style={{ width: '100px' }} onClick={() => handleSort('code')}>
                                <div className="flex items-center gap-2">{t('departments.table.code')} {getSortIcon('code')}</div>
                            </th>
                            <th className="sortable" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-2">{t('departments.table.name')} {getSortIcon('name')}</div>
                            </th>
                            <th className="sortable" style={{ width: '120px' }} onClick={() => handleSort('student_count')}>
                                <div className="flex items-center gap-2">{t('departments.table.students')} {getSortIcon('student_count')}</div>
                            </th>
                            <th className="sortable" style={{ width: '120px' }} onClick={() => handleSort('book_count')}>
                                <div className="flex items-center gap-2">{t('departments.table.books')} {getSortIcon('book_count')}</div>
                            </th>
                            <th>{t('departments.table.description')}</th>
                            <th style={{ textAlign: 'right', minWidth: '100px' }}>{t('departments.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDepartments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-white/5 transition-colors group">
                                <td className="font-mono text-sm text-[var(--text-primary)] font-bold">
                                    {dept.code}
                                </td>
                                <td>
                                    <span className="font-medium text-[var(--text-primary)]">
                                        {dept.name}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Users size={14} />
                                        {dept.student_count || 0}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <BookOpen size={14} />
                                        {dept.book_count || 0}
                                    </div>
                                </td>
                                <td className="text-sm text-[var(--text-secondary)] max-w-[300px] truncate">
                                    {dept.description || '-'}
                                </td>
                                <td>
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
                                        <button
                                            onClick={() => onEdit && onEdit(dept)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                                            title="Edit Department"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(dept.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                            title="Delete Department"
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
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-2 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-color-light)]">
                    <div className="text-sm text-[var(--text-tertiary)]">
                        {t('departments.table.showing')} <span className="text-[var(--text-primary)] font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> {t('departments.table.to')} <span className="text-[var(--text-primary)] font-bold">{Math.min(currentPage * itemsPerPage, departments.length)}</span> {t('departments.table.of')} <span className="text-[var(--text-primary)] font-bold">{departments.length}</span> {t('departments.table.departments')}
                    </div>

                    <div className="flex items-center gap-2">
                        <div style={{ width: '130px' }}>
                            <GlassSelect
                                options={[
                                    { value: 10, label: `10 ${t('departments.table.per_page')}` },
                                    { value: 20, label: `20 ${t('departments.table.per_page')}` },
                                    { value: 50, label: `50 ${t('departments.table.per_page')}` }
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

                            <span className="text-sm font-medium px-2 text-[var(--text-primary)]">
                                {t('departments.table.page')} {currentPage} {t('departments.table.of')} {totalPages}
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
        </div>
    );
};

export default SmartDepartmentTable;
