import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Shield, Download, Search, Calendar, User,
    Activity, AlertTriangle, Layers
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import SmartAuditTable from '../components/dashboard/SmartAuditTable';
import GlassSelect from '../components/common/GlassSelect';
import SmartExportModal from '../components/common/SmartExportModal';

const AuditPage = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ today: 0, security: 0, admin_today: 0, total_logs: 0 });
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(20);
    const [showExportModal, setShowExportModal] = useState(false);

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        action_type: '',
        module: '',
        role: '',
        search: '',
        sortBy: 'timestamp',
        order: 'desc'
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };

            const params = new URLSearchParams({
                page,
                limit,
                ...filters
            });
            const res = await axios.get(`http://localhost:3001/api/audit?${params}`, { headers });
            setLogs(res.data.data);
            setTotalPages(res.data.pagination.totalPages);
            setFilteredTotal(res.data.pagination.total);
            setError(null);
        } catch (error) {
            console.error("Error fetching logs:", error);
            setError(error.response?.data?.message || "Failed to load audit logs. Please check your connection or permissions.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get('http://localhost:3001/api/audit/stats', { headers });
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [page, filters, limit]); // Re-fetch when page, filters or limit change

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to page 1 on filter change
    };

    const handleExportClick = () => {
        setShowExportModal(true);
    };

    const handleSmartExport = async (scope, format) => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };
            let params = new URLSearchParams();

            if (scope === 'filtered') {
                Object.keys(filters).forEach(key => {
                    if (filters[key]) params.append(key, filters[key]);
                });
            }

            params.append('format', format);

            setLoading(true); // Optional: show loading indicator
            const response = await axios.get(`http://localhost:3001/api/audit/export?${params.toString()}`, {
                headers,
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Set filename based on format
            const extension = format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
            link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.${extension}`);

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            setLoading(false);
        } catch (error) {
            console.error("Export failed:", error);
            setLoading(false);
            // Optionally show error notification
        }
    };

    const getActionColor = (action) => {
        if (['DELETE', 'DISABLE'].includes(action)) return 'red';
        if (['UPDATE', 'EDIT'].includes(action)) return 'orange';
        if (['CREATE', 'ADD'].includes(action)) return 'green';
        if (action === 'LOGIN') return 'blue';
        return 'gray';
    };

    return (
        <div className="dashboard-content fade-in">
            {/* Header & Toolbar */}
            <div className="mb-6">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 12, marginBottom: '5px' }}>
                    <Shield size={28} className="text-emerald-400" /> Audit & Compliance
                </h1>
                <p className="text-white/60">Track system activity, security, and compliance logs.</p>
            </div>

            {/* Stats Row */}
            <div className="dashboard-kpi-grid mb-6">
                <StatsCard title="Logs Today" value={stats.today} icon={Activity} color="blue" />
                <StatsCard title="Security Alerts" value={stats.security} icon={AlertTriangle} color="red" />
                <StatsCard title="Admin Actions" value={stats.admin_today} icon={User} color="orange" />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="catalog-toolbar flex-wrap gap-y-4">
                    {/* Search */}
                    <div className="toolbar-search" style={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Search size={20} />
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search Logs..."
                        />
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
                        <Calendar size={16} className="text-white/40 ml-1" />
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="bg-transparent border-none text-white text-sm focus:outline-none p-1"
                        />
                        <span className="text-white/20">-</span>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="bg-transparent border-none text-white text-sm focus:outline-none p-1"
                        />
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                    {/* Dropdowns */}
                    <div style={{ width: '140px' }}>
                        <GlassSelect
                            value={filters.module}
                            onChange={(val) => handleFilterChange({ target: { name: 'module', value: val } })}
                            options={[
                                { value: '', label: 'All Modules' },
                                { value: 'Auth', label: 'Auth' },
                                { value: 'Books', label: 'Books' },
                                { value: 'Students', label: 'Students' },
                                { value: 'Circulation', label: 'Circulation' },
                                { value: 'Fines', label: 'Fines' },
                                { value: 'Settings', label: 'Settings' },
                                { value: 'Security', label: 'Security' }
                            ]}
                            icon={Layers}
                            small
                        />
                    </div>

                    <div style={{ width: '140px' }}>
                        <GlassSelect
                            value={filters.action_type}
                            onChange={(val) => handleFilterChange({ target: { name: 'action_type', value: val } })}
                            options={[
                                { value: '', label: 'All Actions' },
                                { value: 'CREATE', label: 'Create' },
                                { value: 'UPDATE', label: 'Update' },
                                { value: 'DELETE', label: 'Delete' },
                                { value: 'LOGIN', label: 'Login' },
                                { value: 'ISSUE', label: 'Issue' },
                                { value: 'RETURN', label: 'Return' }
                            ]}
                            icon={Activity}
                            small
                        />
                    </div>

                    <div style={{ width: '130px' }}>
                        <GlassSelect
                            value={filters.role}
                            onChange={(val) => handleFilterChange({ target: { name: 'role', value: val } })}
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'Admin', label: 'Admin' },
                                { value: 'Staff', label: 'Staff' },
                                { value: 'System', label: 'System' }
                            ]}
                            icon={User}
                            small
                        />
                    </div>

                    <div className="flex-1"></div>

                    <button className="toolbar-icon-btn" onClick={handleExportClick} title="Export CSV">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-panel" style={{ flex: 1, padding: '0px', display: 'flex', flexDirection: 'column', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <SmartAuditTable
                    logs={logs}
                    loading={loading}
                    sortConfig={{ key: filters.sortBy, direction: filters.order }}
                    onSort={(key) => {
                        let direction = 'asc';
                        if (filters.sortBy === key && filters.order === 'asc') direction = 'desc';
                        setFilters(prev => ({ ...prev, sortBy: key, order: direction }));
                    }}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages,
                        itemsPerPage: limit,
                        onPageChange: (p) => setPage(p),
                        onItemsPerPageChange: (newLimit) => { setLimit(newLimit); setPage(1); }
                    }}
                />
            </div>

            {showExportModal && (
                <SmartExportModal
                    onClose={() => setShowExportModal(false)}
                    onExport={handleSmartExport}
                    totalCount={stats.total_logs || 0} // Ideally fetch total count from backend stats or pagination
                    filteredCount={filteredTotal} // Approx, or pagination.totalItems if we had it
                    selectedCount={0}
                    entityName="Logs"
                />
            )}
        </div>
    );
};

export default AuditPage;
