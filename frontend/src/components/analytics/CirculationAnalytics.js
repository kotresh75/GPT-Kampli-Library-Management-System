import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart, Line } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, BookOpen, Clock } from 'lucide-react';
import StatsCard from '../dashboard/StatsCard';

const CirculationAnalytics = ({ stats, loading }) => {
    // Helper to calculate real trends from data
    const getTrend = (dataKey) => {
        if (!stats?.trend || stats.trend.length < 2) return null;
        const current = stats.trend[stats.trend.length - 1][dataKey] || 0;
        const previous = stats.trend[stats.trend.length - 2][dataKey] || 0;
        const diff = current - previous;
        const pct = previous > 0 ? ((diff / previous) * 100).toFixed(0) : 0;
        return { value: pct, label: `${diff > 0 ? '+' : ''}${pct}% vs yesterday` };
    };

    const issueTrend = getTrend('issue');
    const returnTrend = getTrend('return');

    // Custom Chart Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-gray-400 text-xs mb-2 font-mono uppercase tracking-wider">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 mb-1 last:mb-0">
                            <span className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}></span>
                            <span className="text-sm font-bold text-white min-w-[60px]">{entry.name}</span>
                            <span className="text-sm font-mono" style={{ color: entry.color }}>{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Grid - Forced 2 Columns */}
            <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatsCard
                    title="Active Issues"
                    value={stats?.summary?.active_issued || 0}
                    icon={BookOpen}
                    color="blue"
                    trend={null} // Removed static placeholder
                />
                <StatsCard
                    title="Books Returned"
                    value={stats?.summary?.monthly_returns || 0}
                    icon={TrendingUp}
                    color="green"
                    trend={returnTrend ? returnTrend.label : null}
                />
                <StatsCard
                    title="Overdue Books"
                    value={stats?.summary?.active_overdue || 0}
                    icon={Clock}
                    color="red"
                    trend="Strict Action Required"
                />
                <StatsCard
                    title="Defaulter Ratio"
                    value={`${stats?.summary?.active_issued ? ((stats.summary.active_overdue / stats.summary.active_issued) * 100).toFixed(1) : 0}%`}
                    icon={Activity}
                    color="orange"
                    trend={null}
                />
            </div>

            {/* Main Charts Grid - Forced 2 Columns with Inline Style */}
            <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {/* Circulation Trends REMOVED as per request */}

                {/* Popular Books */}
                <div className="chart-widget p-0 overflow-hidden border-none bg-white/5 flex flex-col">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <BookOpen size={16} className="text-amber-400" />
                            Most Demanded Books
                        </h3>
                        <button className="px-3 py-1 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full transition-all">
                            View All
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
                                <tr>
                                    <th className="p-3 pl-4 rounded-l-lg">Rank</th>
                                    <th className="p-3">Book Title</th>
                                    <th className="p-3 text-right rounded-r-lg">Circulation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.top_books?.map((book, idx) => (
                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                        <td className="p-3 pl-4 font-mono text-gray-500">
                                            <span className={`w-6 h-6 flex items-center justify-center rounded-md font-bold text-xs
                                                ${idx === 0 ? 'bg-amber-500/20 text-amber-500' :
                                                    idx === 1 ? 'bg-slate-400/20 text-slate-400' :
                                                        idx === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-gray-400'}`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">{book.title}</div>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
                                                {book.count} <ArrowUpRight size={10} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Insights Panel */}
                <div className="chart-widget p-5 border-none bg-gradient-to-b from-purple-900/10 to-transparent flex flex-col gap-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Activity size={16} className="text-purple-400" />
                        Quick Stats
                    </h3>

                    <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={14} className="text-green-400" />
                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Most Active</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-snug">
                                {stats?.top_books && stats.top_books.length > 0 ? (
                                    <>Top book is <strong className="text-white">"{stats.top_books[0].title.substring(0, 20)}..."</strong></>
                                ) : 'Data analyzing...'}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={14} className="text-blue-400" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">System Load</span>
                            </div>
                            <p className="text-sm text-white font-mono leading-snug">
                                {stats?.trend ? stats.trend.reduce((acc, curr) => acc + curr.issue + curr.return, 0) : 0} transactions
                                <span className="text-gray-400 font-sans ml-1">processed in this period.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CirculationAnalytics;
