import React, { useState, useEffect } from 'react';
import {
    FileText, TrendingUp, DollarSign, Package, Download, Calendar,
    ArrowUpRight, ArrowDownRight, Printer, AlertCircle, CheckCircle, Book
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('circulation');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('30days'); // '7days', '30days', '90days'

    useEffect(() => {
        fetchReportData();
    }, [activeTab, period]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/reports/${activeTab}?period=${period}`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

    const renderCirculationReport = () => (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            {/* KPI Cards */}
            <div className="dashboard-kpi-grid">
                <StatsCard
                    title="Active Loans"
                    value={stats?.summary?.active_issued}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatsCard
                    title="Returns (30d)"
                    value={stats?.summary?.monthly_returns}
                    icon={CheckCircle}
                    color="green"
                />
                <StatsCard
                    title="Overdue Items"
                    value={stats?.summary?.active_overdue}
                    icon={AlertCircle}
                    color="red"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="font-bold text-lg mb-6">Issue vs Return Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.trend || []}>
                                <defs>
                                    <linearGradient id="colorIssue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickCount={7} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="issue" stroke="#8884d8" fillOpacity={1} fill="url(#colorIssue)" name="Issued" />
                                <Area type="monotone" dataKey="return" stroke="#82ca9d" fillOpacity={1} fill="url(#colorReturn)" name="Returned" />
                                <Legend />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="font-bold text-lg mb-4">Top Borrowed Books</h3>
                    <div className="overflow-y-auto max-h-80">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-500 border-b border-white/10">
                                <tr>
                                    <th className="text-left pb-2">Title</th>
                                    <th className="text-right pb-2">Issues</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.top_books?.map((book, idx) => (
                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-3 pr-2 text-gray-300 font-medium truncate max-w-[150px]" title={book.title}>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono">{idx + 1}</span>
                                                {book.title}
                                            </div>
                                        </td>
                                        <td className="py-3 text-right font-mono text-accent">{book.count}</td>
                                    </tr>
                                ))}
                                {(!stats?.top_books || stats.top_books.length === 0) && (
                                    <tr><td colSpan="2" className="py-4 text-center text-gray-500">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinancialReport = () => (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            {/* KPI Cards */}
            <div className="dashboard-kpi-grid">
                <StatsCard
                    title="Total Collected"
                    value={`₹${stats?.summary?.collected?.toFixed(2)}`}
                    icon={DollarSign}
                    color="emerald"
                />
                <StatsCard
                    title="Pending Dues"
                    value={`₹${stats?.summary?.pending?.toFixed(2)}`}
                    icon={DollarSign}
                    color="orange"
                />
                <StatsCard
                    title="Waived Amount"
                    value={`₹${stats?.summary?.waived?.toFixed(2)}`}
                    icon={DollarSign}
                    color="blue"
                />
            </div>

            <div className="glass-panel p-6">
                <h3 className="font-bold text-lg mb-6">Daily Collection Trend (Last 30 Days)</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.trend || []}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} name="Collection (₹)" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderInventoryReport = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="dashboard-kpi-grid">
                <StatsCard
                    title="Unique Titles"
                    value={stats?.summary?.titles}
                    icon={Book}
                    color="purple"
                />
                <StatsCard
                    title="Total Volumes"
                    value={stats?.summary?.volumes}
                    icon={Package}
                    color="blue"
                />
                <StatsCard
                    title="Est. Value"
                    value={`₹${stats?.summary?.estimated_value?.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="font-bold text-lg mb-6">Distribution by Department</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.distribution?.department || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="count"
                                    nameKey="name"
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        // Simple Label Logic
                                        if (percent < 0.05) return null;
                                        return `${(percent * 100).toFixed(0)}%`;
                                    }}
                                >
                                    {stats?.distribution?.department?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="font-bold text-lg mb-6">Volume Status</h3>
                    <div className="space-y-4">
                        {stats?.distribution?.status?.map((item, idx) => {
                            const total = stats.summary.volumes || 1;
                            const percent = ((item.count / total) * 100).toFixed(1);
                            let color = 'bg-gray-500';
                            if (item.status === 'Available') color = 'bg-green-500';
                            if (item.status === 'Issued') color = 'bg-blue-500';
                            if (item.status === 'Lost') color = 'bg-red-500';
                            if (item.status === 'Damaged') color = 'bg-orange-500';

                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{item.status}</span>
                                        <span className="font-mono text-gray-400">{item.count} ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${color}`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 text-white h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText size={24} className="text-accent" /> Reports & Analytics
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Real-time system insights</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="glass-input pl-3 pr-8 py-2 text-sm appearance-none cursor-pointer hover:bg-white/10"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 3 Months</option>
                        </select>
                        <Calendar size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>

                    <button className="primary-glass-btn flex items-center gap-2" onClick={handlePrint}>
                        <Printer size={16} /> Print
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-glass no-print">
                {['circulation', 'financial', 'inventory'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-all rounded-t-lg capitalize
                        ${activeTab === tab ? 'bg-white/10 text-white border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab === 'circulation' && <TrendingUp size={16} />}
                        {tab === 'financial' && <DollarSign size={16} />}
                        {tab === 'inventory' && <Package size={16} />}
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="spinner-lg"></div>
                </div>
            ) : !stats ? (
                <div className="p-20 text-center text-red-400 fade-in">Failed to load data.</div>
            ) : (
                <>
                    {activeTab === 'circulation' && renderCirculationReport()}
                    {activeTab === 'financial' && renderFinancialReport()}
                    {activeTab === 'inventory' && renderInventoryReport()}
                </>
            )}
        </div>
    );
};

export default ReportsPage;
