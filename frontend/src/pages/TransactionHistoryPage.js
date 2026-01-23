import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { History, Search, Filter, BookOpen, AlertCircle, CheckCircle, Clock, ArrowUpRight, ArrowDownLeft, RotateCcw, Info } from 'lucide-react';
import TransactionDetailsModal from '../components/common/TransactionDetailsModal';
import { usePreferences } from '../context/PreferencesContext';

const TransactionHistoryPage = () => {
    const { t } = usePreferences();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [search, statusFilter]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter !== 'All') params.append('status', statusFilter);

            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/circulation/history?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (log) => {
        setSelectedTransaction(log);
        setIsDetailsOpen(true);
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            Active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            Returned: 'bg-green-500/20 text-green-400 border-green-500/30',
            Overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
            FINE_WAIVED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            FINE_PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        };
        const icons = {
            Active: <Clock size={14} />,
            Returned: <CheckCircle size={14} />,
            Overdue: <AlertCircle size={14} />,
            FINE_WAIVED: <CheckCircle size={14} />, // Use CheckCircle for now
            FINE_PAID: <CheckCircle size={14} />
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 w-fit ${styles[status] || styles.Active}`}>
                {icons[status]} {status}
            </span>
        );
    };

    return (
        <div className="p-6 text-white h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History size={24} className="text-accent" /> Transaction History
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Full log of issues, returns, and renewals.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-panel p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input
                            type="text"
                            className="glass-input pl-10 w-full"
                            placeholder="Search by Student Name, Reg No, or Book Title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            className="glass-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active Loans</option>
                            <option value="Returned">Returned</option>
                            <option value="Overdue">Overdue</option>
                            <option value="FINE_WAIVED">Fine Waived</option>
                            <option value="FINE_PAID">Fine Paid</option>
                        </select>
                    </div>
                </div>
                <div className="text-sm text-gray-400">
                    Showing last {transactions.length} records
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-gray-300 text-sm">
                            <th className="p-4 font-medium">Student</th>
                            <th className="p-4 font-medium">Book Details</th>
                            <th className="p-4 font-medium">Issued On</th>
                            <th className="p-4 font-medium">Due / Returned</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 text-left font-medium text-gray-300">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading history...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No transactions found matching criteria.</td></tr>
                        ) : (
                            transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-white/5 transition-colors group text-sm">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{txn.student_name}</div>
                                        <div className="text-xs text-gray-500">{txn.register_number}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-white">
                                            <BookOpen size={14} className="text-accent/70" /> {txn.book_title}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Acc: <span className="font-mono text-gray-400">{txn.accession_number}</span></div>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        {formatDate(txn.issue_date)}
                                        <div className="text-xs text-gray-500">{new Date(txn.issue_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="p-4">
                                        {txn.return_date ? (
                                            <div className="text-gray-300">
                                                {formatDate(txn.return_date)}
                                                <div className="text-xs text-gray-500">Returned</div>
                                            </div>
                                        ) : txn.status === 'FINE_WAIVED' ? (
                                            <div className="text-purple-300">
                                                {formatDate(txn.issue_date)}
                                                <div className="text-xs text-purple-500">Waived</div>
                                            </div>
                                        ) : txn.status === 'FINE_PAID' ? (
                                            <div className="text-emerald-300">
                                                {formatDate(txn.issue_date)}
                                                <div className="text-xs text-emerald-500">Paid</div>
                                            </div>
                                        ) : (
                                            <div className={new Date(txn.due_date) < new Date() ? 'text-red-400' : 'text-gray-300'}>
                                                {formatDate(txn.due_date)}
                                                <div className="text-xs text-gray-500">Due Date</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={txn.status} />
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => handleViewDetails(txn)} className="text-blue-600 hover:text-blue-800 p-1">
                                            <Info size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <TransactionDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default TransactionHistoryPage;
