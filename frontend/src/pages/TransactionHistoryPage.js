import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { History, Search, Filter, BookOpen, AlertCircle, CheckCircle, Clock, ArrowUpRight, ArrowDownLeft, RotateCcw, Info, Download, Calendar } from 'lucide-react';
import TransactionDetailsModal from '../components/common/TransactionDetailsModal';
import { usePreferences } from '../context/PreferencesContext';
import GlassSelect from '../components/common/GlassSelect';
import SmartExportModal from '../components/common/SmartExportModal';
import SmartTransactionTable from '../components/history/SmartTransactionTable';

const TransactionHistoryPage = () => {
    const { t } = usePreferences();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [timeFilter, setTimeFilter] = useState('All'); // All, Today, Week, Month, Year

    const [departments, setDepartments] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Selection
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Fetch Departments for Filter
    useEffect(() => {
        fetch('http://localhost:3001/api/departments')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setDepartments(data) : [])
            .catch(err => console.error("Failed to fetch departments", err));
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [search, statusFilter, departmentFilter, timeFilter]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter !== 'All') params.append('status', statusFilter);
            if (departmentFilter !== 'All') params.append('department', departmentFilter);

            // Time Filter Logic
            if (timeFilter !== 'All') {
                const now = new Date();
                let startDate = new Date();

                if (timeFilter === 'Today') {
                    startDate.setHours(0, 0, 0, 0);
                } else if (timeFilter === 'Week') {
                    startDate.setDate(now.getDate() - 7);
                    startDate.setHours(0, 0, 0, 0); // consistency
                } else if (timeFilter === 'Month') {
                    startDate.setDate(now.getDate() - 30);
                    startDate.setHours(0, 0, 0, 0);
                } else if (timeFilter === 'Year') {
                    startDate.setDate(now.getDate() - 365);
                    startDate.setHours(0, 0, 0, 0);
                }

                // Format as YYYY-MM-DD using Local Time
                const year = startDate.getFullYear();
                const month = String(startDate.getMonth() + 1).padStart(2, '0');
                const day = String(startDate.getDate()).padStart(2, '0');
                params.append('startDate', `${year}-${month}-${day}`);
                // endDate is implicitly "now" / undefined means no upper bound effectively, or we can send today
            }

            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/circulation/history?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTransactions(Array.isArray(data) ? data : []);
            setSelectedIds(new Set());
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

    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = (ids) => {
        const allSelected = ids.every(id => selectedIds.has(id));
        const newSet = new Set(selectedIds);

        if (allSelected) {
            ids.forEach(id => newSet.delete(id));
        } else {
            ids.forEach(id => newSet.add(id));
        }
        setSelectedIds(newSet);
    };

    return (
        <div className="dashboard-content">
            {/* --- Controls --- */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="catalog-toolbar">
                    <h1 className="text-2xl font-bold flex items-center gap-2 mr-4 text-white">
                        <History size={24} className="text-accent" /> History
                    </h1>

                    <div className="toolbar-search" style={{ flex: 1 }}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search History..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="w-[180px]">
                        <GlassSelect
                            value={departmentFilter}
                            onChange={(val) => setDepartmentFilter(val)}
                            options={[
                                { value: 'All', label: 'All Departments' },
                                ...departments.map(d => ({ value: d.name, label: d.name }))
                            ]}
                            icon={Filter}
                            placeholder="All Departments"
                        />
                    </div>

                    <div className="w-[150px]">
                        <GlassSelect
                            value={timeFilter}
                            onChange={setTimeFilter}
                            options={[
                                { value: 'All', label: 'All Time' },
                                { value: 'Today', label: 'Today' },
                                { value: 'Week', label: 'Last 7 Days' },
                                { value: 'Month', label: 'Last 30 Days' },
                                { value: 'Year', label: 'Last Year' }
                            ]}
                            icon={Calendar}
                            placeholder="Time Period"
                        />
                    </div>

                    <div className="w-[150px]">
                        <GlassSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'All', label: 'All Actions' },
                                { value: 'ISSUE', label: 'Issued' },
                                { value: 'RETURN', label: 'Returned' },
                                { value: 'RENEW', label: 'Renewed' }
                            ]}
                            icon={Filter}
                            placeholder="Status"
                        />
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2"></div>

                    <button className="toolbar-icon-btn" onClick={() => setShowExportModal(true)} title="Export Data">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Smart Table */}
            <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <SmartTransactionTable
                    transactions={transactions}
                    loading={loading}
                    selectedIds={selectedIds}
                    onSelect={toggleSelect}
                    onSelectAll={toggleSelectAll}
                    onView={handleViewDetails}
                />
            </div>

            <TransactionDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                transaction={selectedTransaction}
            />

            {showExportModal && (
                <SmartExportModal
                    onClose={() => setShowExportModal(false)}
                    totalCount={transactions.length} // Should specificy total count from pagination ideally, but logical enough
                    filteredCount={transactions.length}
                    selectedCount={selectedIds.size}
                    entityName="Transactions"
                    onExport={(scope, format) => {
                        // Export Logic Reusing existing data
                        let dataToExport = transactions;

                        if (scope === 'selected') {
                            dataToExport = transactions.filter(t => selectedIds.has(t.id));
                        }

                        const cleanData = dataToExport.map(t => {
                            let details = {};
                            try { details = JSON.parse(t.details || '{}'); } catch (e) { }
                            return {
                                Date: new Date(t.timestamp || t.date).toLocaleString(),
                                Action: t.status,
                                Student: t.student_name,
                                RegNo: t.register_number,
                                Department: t.department_name,
                                Book: t.book_title,
                                Accession: t.accession_number,
                                Fine: details.fine_amount || 0,
                                Condition: details.condition || '-',
                                Remarks: details.remarks || '-'
                            };
                        });

                        if (format === 'xlsx') {
                            const XLSX = require('xlsx');
                            const ws = XLSX.utils.json_to_sheet(cleanData);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "History");
                            XLSX.writeFile(wb, `transaction_history_${new Date().toISOString().slice(0, 10)}.xlsx`);
                        } else if (format === 'csv') {
                            const headers = Object.keys(cleanData[0]).join(',');
                            const rows = cleanData.map(row =>
                                Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')
                            ).join('\n');
                            const link = document.createElement("a");
                            link.href = "data:text/csv;charset=utf-8," + encodeURI(headers + "\n" + rows);
                            link.download = "history.csv";
                            link.click();
                        } else if (format === 'pdf') {
                            const jsPDF = require('jspdf').jsPDF;
                            const autoTable = require('jspdf-autotable').default;
                            const doc = new jsPDF();
                            doc.text('Transaction History', 14, 15);

                            const tableColumns = ['Date', 'Action', 'Student', 'Book', 'Fine'];
                            const tableRows = cleanData.map(r => [
                                r.Date, r.Action, r.Student, r.Book.substring(0, 20), r.Fine
                            ]);

                            autoTable(doc, {
                                head: [tableColumns], body: tableRows, startY: 20
                            });
                            doc.save('history.pdf');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default TransactionHistoryPage;
