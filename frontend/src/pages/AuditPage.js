import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Shield, Download, Search, Filter, Calendar, User,
    Activity, AlertTriangle, Layers, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import StatsCard from '../components/dashboard/StatsCard';
import SmartAuditTable from '../components/dashboard/SmartAuditTable';
import GlassSelect from '../components/common/GlassSelect';
import SmartExportModal from '../components/common/SmartExportModal';

const AuditPage = () => {
    const { t } = useLanguage();
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

    const socket = useSocket();

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token} ` };

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
            setError(error.response?.data?.message || t('audit.err_fetch'));
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

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
                    <Shield size={28} className="text-emerald-400" /> {t('audit.title')}
                </h1>
                <p className="text-white/60">{t('audit.subtitle')}</p>
            </div>

            {/* Stats Row */}
            <div className="dashboard-kpi-grid mb-6">
                <StatsCard title={t('audit.stats.today')} value={stats.today} icon={Activity} color="blue" />
                <StatsCard title={t('audit.stats.security')} value={stats.security} icon={AlertTriangle} color="red" />
                <StatsCard title={t('audit.stats.admin')} value={stats.admin_today} icon={User} color="orange" />
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
                            placeholder={t('audit.search_placeholder')}
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
                                { value: '', label: t('audit.filters.all_modules') },
                                { value: 'Auth', label: t('audit.filters.modules.auth') },
                                { value: 'Books', label: t('audit.filters.modules.books') },
                                { value: 'Students', label: t('audit.filters.modules.students') },
                                { value: 'Circulation', label: t('audit.filters.modules.circulation') },
                                { value: 'Fines', label: t('audit.filters.modules.fines') },
                                { value: 'Settings', label: t('audit.filters.modules.settings') },
                                { value: 'Security', label: t('audit.filters.modules.security') }
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
                                { value: '', label: t('audit.filters.all_actions') },
                                { value: 'CREATE', label: t('audit.filters.actions.create') },
                                { value: 'UPDATE', label: t('audit.filters.actions.update') },
                                { value: 'DELETE', label: t('audit.filters.actions.delete') },
                                { value: 'LOGIN', label: t('audit.filters.actions.login') },
                                { value: 'ISSUE', label: t('audit.filters.actions.issue') },
                                { value: 'RETURN', label: t('audit.filters.actions.return') }
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
                                { value: '', label: t('audit.filters.all_roles') },
                                { value: 'Admin', label: t('audit.filters.roles.admin') },
                                { value: 'Staff', label: t('audit.filters.roles.staff') },
                                { value: 'System', label: t('audit.filters.roles.system') }
                            ]}
                            icon={User}
                            small
                        />
                    </div>

                    <div className="flex-1"></div>

                    <button className="toolbar-icon-btn" onClick={handleExportClick} title={t('audit.export_btn')}>
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
                    totalCount={stats.total_logs || 0}
                    filteredCount={filteredTotal}
                    selectedCount={0}
                    entityName="Logs"
                    data={logs.map(log => ({
                        TIMESTAMP: new Date(log.timestamp).toLocaleString(),
                        ACTOR: log.actor_name || log.user_id || 'System',
                        ROLE: log.actor_role || 'System',
                        ACTION: log.action_type,
                        MODULE: log.module,
                        DESCRIPTION: log.description || log.details || '-'
                    }))}
                    columns={['TIMESTAMP', 'ACTOR', 'ROLE', 'ACTION', 'MODULE', 'DESCRIPTION']}
                    onFetchAll={async () => {
                        try {
                            const token = localStorage.getItem('auth_token');
                            const headers = { Authorization: `Bearer ${token}` };
                            const params = new URLSearchParams({
                                ...filters,
                                limit: 10000 // Fetch all
                            });
                            const res = await axios.get(`http://localhost:3001/api/audit?${params}`, { headers });
                            const allLogs = res.data.data;
                            return allLogs.map(log => ({
                                TIMESTAMP: new Date(log.timestamp).toLocaleString(),
                                ACTOR: log.actor_name || log.user_id || 'System',
                                ROLE: log.actor_role || 'System',
                                ACTION: log.action_type,
                                MODULE: log.module,
                                DESCRIPTION: log.description || log.details || '-'
                            }));
                        } catch (e) {
                            console.error("Fetch all failed", e);
                            return [];
                        }
                    }}
                />
            )}
        </div>
    );
};

export default AuditPage;
