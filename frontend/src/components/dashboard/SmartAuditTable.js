import React from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, ArrowUp, ArrowDown, Activity, AlertTriangle, Layers
} from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/components/tables.css';

const SmartAuditTable = ({
    logs,
    loading,
    sortConfig,
    onSort,
    pagination // { currentPage, totalPages, itemsPerPage, onPageChange, onItemsPerPageChange, totalItems }
}) => {
    const { t } = useLanguage();

    // --- Formatters ---
    const getActionColor = (action) => {
        if (['DELETE', 'DISABLE', 'REMOVE'].includes(action)) return 'red';
        if (['UPDATE', 'EDIT', 'MODIFY'].includes(action)) return 'orange';
        if (['CREATE', 'ADD', 'Issue', 'ISSUE'].includes(action)) return 'green';
        if (['LOGIN', 'Return', 'RETURN', 'RENEW'].includes(action)) return 'blue';
        return 'gray';
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr.replace(' ', 'T'));
            if (isNaN(date.getTime())) return dateStr;
            const d = date.getDate().toString().padStart(2, '0');
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const y = date.getFullYear();
            const t = date.toLocaleTimeString('en-GB', { hour12: true });
            return `${d}/${m}/${y} ${t}`;
        } catch (e) {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="glass-panel w-full p-12 flex justify-center items-center h-64">
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="glass-panel w-full p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                    <Layers size={48} className="text-gray-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('audit.table.no_logs')}</h3>
                <p className="text-[var(--text-secondary)]">{t('history.table.no_transactions_desc')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="sortable" onClick={() => onSort('timestamp')} style={{ minWidth: '160px' }}>
                                <div className="flex items-center gap-2">{t('audit.table.timestamp')} {getSortIcon('timestamp')}</div>
                            </th>
                            <th className="sortable" onClick={() => onSort('actor_name')}>
                                <div className="flex items-center gap-2">{t('audit.table.actor')} {getSortIcon('actor_name')}</div>
                            </th>
                            <th className="sortable" onClick={() => onSort('actor_role')}>
                                <div className="flex items-center gap-2">{t('audit.table.role')} {getSortIcon('actor_role')}</div>
                            </th>
                            <th className="sortable" onClick={() => onSort('action_type')}>
                                <div className="flex items-center gap-2">{t('audit.table.action')} {getSortIcon('action_type')}</div>
                            </th>
                            <th className="sortable" onClick={() => onSort('module')}>
                                <div className="flex items-center gap-2">{t('audit.table.module')} {getSortIcon('module')}</div>
                            </th>
                            <th>{t('audit.table.description')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id || Math.random()} className="hover:bg-white/5 transition-colors">
                                <td className="font-mono text-sm text-[var(--text-secondary)]">
                                    {formatDate(log.timestamp)}
                                </td>
                                <td>
                                    <div className="font-medium text-[var(--text-primary)]">{log.actor_name || 'System'}</div>
                                    <div className="text-xs text-[var(--text-tertiary)]">{log.actor_email}</div>
                                </td>
                                <td>
                                    <span className={`px-2 py-0.5 rounded text-xs border ${log.actor_role === 'Admin'
                                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                        : log.actor_role === 'System'
                                            ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                                            : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {log.actor_role || 'System'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${getActionColor(log.action_type)}-500/10 text-${getActionColor(log.action_type)}-400 border border-${getActionColor(log.action_type)}-500/20`}>
                                        {log.action_type}
                                    </span>
                                </td>
                                <td className="text-[var(--text-secondary)]">{log.module}</td>
                                <td className="text-[var(--text-secondary)] max-w-xs truncate" title={log.description}>
                                    {log.description}
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
                        {t('audit.table.showing')} <span className="text-[var(--text-primary)] font-bold">{pagination.currentPage}</span> {t('audit.table.of')} <span className="text-[var(--text-primary)] font-bold">{pagination.totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {pagination.onItemsPerPageChange && (
                            <>
                                <div style={{ width: '130px' }}>
                                    <GlassSelect
                                        options={[
                                            { value: 20, label: `20 ${t('audit.table.per_page')}` },
                                            { value: 50, label: `50 ${t('audit.table.per_page')}` },
                                            { value: 100, label: `100 ${t('audit.table.per_page')}` }
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
                                {pagination.currentPage} / {pagination.totalPages}
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

export default SmartAuditTable;
