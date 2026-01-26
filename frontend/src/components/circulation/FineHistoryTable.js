import React, { useMemo, useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { FileText, ArrowUpDown, ArrowUp, ArrowDown, Mail, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FineHistoryTable = ({ fines, onViewReceipt, onViewDetails, onResendEmail }) => {
    const { t } = useLanguage();
    const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' });

    const sortedFines = useMemo(() => {
        let sortableFines = [...fines];
        if (sortConfig.key !== null) {
            sortableFines.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle Date sorting specifically
                if (sortConfig.key === 'payment_date' || sortConfig.key === 'created_at') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
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
        return sortableFines;
    }, [fines, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const GetSortIcon = ({ columnKey }) => {
        const style = { minWidth: '16px', width: '16px', height: '16px' };
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={16} style={style} className="text-gray-500 flex-shrink-0" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={16} style={style} className="text-white flex-shrink-0" /> : <ArrowDown size={16} style={style} className="text-white flex-shrink-0" />;
    };

    if (!fines || fines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>{t('circulation.fines.history.no_records')}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-glass bg-white/5">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-glass bg-white/5 text-sm uppercase tracking-wider text-gray-300">
                        <th className="p-4 font-medium cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap" onClick={() => requestSort('payment_date')}>
                            <div className="flex items-center gap-2">{t('circulation.fines.history.date')} <GetSortIcon columnKey="payment_date" /></div>
                        </th>
                        <th className="p-4 font-medium text-gray-400 whitespace-nowrap">{t('circulation.fines.history.receipt_id')}</th>
                        <th className="p-4 font-medium cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap" onClick={() => requestSort('student_name')}>
                            <div className="flex items-center gap-2">{t('circulation.fines.history.student')} <GetSortIcon columnKey="student_name" /></div>
                        </th>
                        <th className="p-4 font-medium cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap" onClick={() => requestSort('department_name')}>
                            <div className="flex items-center gap-2">{t('circulation.fines.history.dept')} <GetSortIcon columnKey="department_name" /></div>
                        </th>
                        <th className="p-4 font-medium cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap" onClick={() => requestSort('amount')}>
                            <div className="flex items-center gap-2">{t('circulation.fines.history.amount')} <GetSortIcon columnKey="amount" /></div>
                        </th>
                        <th className="p-4 font-medium cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap" onClick={() => requestSort('status')}>
                            <div className="flex items-center gap-2">{t('circulation.fines.history.status')} <GetSortIcon columnKey="status" /></div>
                        </th>
                        <th className="p-4 font-medium">{t('circulation.fines.history.reason')}</th>
                        <th className="p-4 font-medium text-right">{t('circulation.fines.history.actions')}</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {sortedFines.map((fine) => (
                        <tr key={fine.id} className="border-b border-glass hover:bg-white/5 transition-colors">
                            <td className="p-4 text-gray-300">
                                {formatDate(fine.payment_date || fine.updated_at)}
                            </td>
                            <td className="p-4 text-xs font-mono text-emerald-400/80">
                                {fine.receipt_number ? `REC-${String(fine.receipt_number).replace(/^REC-/, '')}` : '-'}
                            </td>
                            <td className="p-4">
                                <div className="font-medium text-white">{fine.student_name}</div>
                                <div className="text-xs text-gray-400">{fine.roll_number}</div>
                            </td>
                            <td className="p-4 text-gray-300">
                                {fine.department_name || '-'}
                            </td>
                            <td className="p-4 font-bold text-white">
                                {fine.status === 'Waived' ? (
                                    <span className="text-gray-400">₹0</span>
                                ) : (
                                    `₹${fine.amount}`
                                )}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs border ${fine.status === 'Paid' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                    fine.status === 'Waived' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                                        'border-red-500/30 text-red-400'
                                    }`}>
                                    {fine.status}
                                </span>
                            </td>
                            <td className="p-4 text-gray-400 max-w-xs truncate" title={fine.reason || fine.remark}>
                                {fine.reason || fine.remark || '-'}
                            </td>
                            <td className="p-4 text-right">
                                {fine.status !== 'Unpaid' && (
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onViewReceipt(fine)}
                                            className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                                            title={t('circulation.fines.history.view_receipt')}
                                        >
                                            {t('circulation.fines.history.view_receipt')}
                                        </button>
                                        <button
                                            onClick={() => onResendEmail && onResendEmail(fine)}
                                            className="text-xs text-purple-400 hover:text-purple-300 p-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                                            title={t('circulation.fines.history.resend_email')}
                                        >
                                            <Mail size={16} style={{ minWidth: '16px', width: '16px', height: '16px' }} />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => onViewDetails && onViewDetails(fine)}
                                    className="ml-2 text-gray-400 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
                                    title={t('circulation.fines.history.view_details')}
                                >
                                    <Info size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FineHistoryTable;
