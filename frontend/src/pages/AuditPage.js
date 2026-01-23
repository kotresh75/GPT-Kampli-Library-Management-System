import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Shield, Download, Filter, Search, Calendar, User,
    Activity, AlertTriangle, CheckCircle
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';

const AuditPage = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ today: 0, security: 0, admin_today: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
                limit: 20,
                ...filters
            });
            const res = await axios.get(`http://localhost:3001/api/audit?${params}`, { headers });
            setLogs(res.data.data);
            setTotalPages(res.data.pagination.totalPages);
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
    }, [page, filters]); // Re-fetch when page or filters change

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to page 1 on filter change
    };

    const handleExport = () => {
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams(filters);
        if (token) params.append('token', token);
        window.open(`http://localhost:3001/api/audit/export?${params}`, '_blank');
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="dashboard-title flex items-center gap-2">
                        <Shield size={28} className="text-emerald-400" />
                        Audit & Compliance
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Track system activity, security, and compliance logs.</p>
                </div>
                <button onClick={handleExport} className="primary-glass-btn flex items-center gap-2">
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Stats Row */}
            <div className="dashboard-kpi-grid">
                <StatsCard
                    title="Logs Today"
                    value={stats.today}
                    icon={Activity}
                    color="blue"
                />
                <StatsCard
                    title="Security Alerts"
                    value={stats.security}
                    icon={AlertTriangle}
                    color="red"
                />
                <StatsCard
                    title="Admin Actions"
                    value={stats.admin_today}
                    icon={User}
                    color="orange"
                />
            </div>

            {/* Filters Section */}
            <div className="glass-panel p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-gray-400 mb-1 block">Search Details</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search descriptions..."
                                className="glass-input pl-10 w-full"
                            />
                        </div>
                    </div>

                    <div className="w-[150px]">
                        <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="glass-input w-full"
                        />
                    </div>

                    <div className="w-[150px]">
                        <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="glass-input w-full"
                        />
                    </div>

                    <div className="w-[150px]">
                        <label className="text-xs text-gray-400 mb-1 block">Module</label>
                        <select
                            name="module"
                            value={filters.module}
                            onChange={handleFilterChange}
                            className="glass-input w-full"
                        >
                            <option value="">All Modules</option>
                            <option value="Auth">Auth</option>
                            <option value="Books">Books</option>
                            <option value="Students">Students</option>
                            <option value="Circulation">Circulation</option>
                            <option value="Fines">Fines</option>
                            <option value="Settings">Settings</option>
                            <option value="Security">Security</option>
                        </select>
                    </div>

                    <div className="w-[150px]">
                        <label className="text-xs text-gray-400 mb-1 block">Role</label>
                        <select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            className="glass-input w-full"
                        >
                            <option value="">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Staff">Staff</option>
                            <option value="System">System</option>
                        </select>
                    </div>

                    <div className="w-[150px]">
                        <label className="text-xs text-gray-400 mb-1 block">Action Type</label>
                        <select
                            name="action_type"
                            value={filters.action_type}
                            onChange={handleFilterChange}
                            className="glass-input w-full"
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="LOGIN">Login</option>
                            <option value="ISSUE">Issue</option>
                            <option value="RETURN">Return</option>
                        </select>
                    </div>

                    <div className="w-[150px]">
                        <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
                        <select
                            name="sortCombo" // Virtual field for UI
                            value={`${filters.sortBy}-${filters.order}`}
                            onChange={(e) => {
                                const [sortBy, order] = e.target.value.split('-');
                                setFilters(prev => ({ ...prev, sortBy, order }));
                            }}
                            className="glass-input w-full"
                        >
                            <option value="timestamp-desc">Recent First</option>
                            <option value="timestamp-asc">Oldest First</option>
                            <option value="module-asc">Module (A-Z)</option>
                            <option value="module-desc">Module (Z-A)</option>
                            <option value="action_type-asc">Action (A-Z)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-semibold">Timestamp</th>
                                <th className="p-4 font-semibold">Actor</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Action</th>
                                <th className="p-4 font-semibold">Module</th>
                                <th className="p-4 font-semibold">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-2"></div>
                                        <p>Loading audit trail...</p>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-red-400">
                                        <div className="mb-2"><AlertTriangle className="inline" size={24} /></div>
                                        {error}
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id || Math.random()} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-gray-400 whitespace-nowrap">
                                            {/* Format: DD/MM/YYYY HH:MM:SS */}
                                            {(() => {
                                                if (!log.timestamp) return '-';
                                                try {
                                                    // Handle SQLite 'YYYY-MM-DD HH:MM:SS' or ISO
                                                    const date = new Date(log.timestamp.replace(' ', 'T'));
                                                    if (isNaN(date.getTime())) return log.timestamp;

                                                    const d = date.getDate().toString().padStart(2, '0');
                                                    const m = (date.getMonth() + 1).toString().padStart(2, '0');
                                                    const y = date.getFullYear();
                                                    const t = date.toLocaleTimeString('en-GB', { hour12: true });
                                                    return `${d}/${m}/${y} ${t}`;
                                                } catch (e) {
                                                    return log.timestamp;
                                                }
                                            })()}
                                        </td>
                                        <td className="p-4 font-medium text-white">
                                            {log.actor_name}
                                            <div className="text-xs text-gray-500">{log.actor_email}</div>
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${log.actor_role === 'Admin' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {log.actor_role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold bg-${getActionColor(log.action_type)}-500/10 text-${getActionColor(log.action_type)}-400 border border-${getActionColor(log.action_type)}-500/20`}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300">{log.module}</td>
                                        <td className="p-4 text-gray-300 max-w-xs truncate" title={log.description}>
                                            {log.description}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
                    <span className="text-sm text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 disabled:opacity-50 text-sm"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 rounded border border-white/10 hover:bg-white/10 disabled:opacity-50 text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditPage;
