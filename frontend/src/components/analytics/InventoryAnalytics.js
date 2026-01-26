import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Package, Layers, DollarSign, Archive, AlertTriangle } from 'lucide-react';
import StatsCard from '../dashboard/StatsCard';
import { useLanguage } from '../../context/LanguageContext';

const InventoryAnalytics = ({ stats }) => {
    const { t } = useLanguage();
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></span>
                        <span className="text-sm font-bold text-white">{payload[0].name}</span>
                    </div>
                    <div className="text-xl font-bold text-white mt-1 pl-4">
                        {payload[0].value} <span className="text-xs text-gray-500 font-normal">{t('reports.analytics.inv.books')}</span>
                    </div>
                    <div className="text-xs text-gray-500 pl-4 mt-1">
                        {((payload[0].percent || 0) * 100).toFixed(1)}% {t('reports.analytics.inv.of_total')}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Inventory Cards - Forced 2 Columns */}
            <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatsCard
                    title={t('reports.analytics.inv.total_volumes')}
                    value={stats?.summary?.volumes || 0}
                    icon={Layers}
                    color="blue"
                    trend={null}
                />
                <StatsCard
                    title={t('reports.analytics.inv.unique_titles')}
                    value={stats?.summary?.titles || 0}
                    icon={Package}
                    color="purple"
                    trend={null}
                />
                <StatsCard
                    title={t('reports.analytics.inv.total_value')}
                    value={`₹${stats?.summary?.estimated_value?.toLocaleString() || '0'}`}
                    icon={DollarSign}
                    color="green"
                    trend={t('reports.analytics.inv.estimated_cost')}
                />
            </div>

            {/* Main Inventory Grid - Forced 2 Columns */}
            <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {/* Collection by Department REMOVED as per request */}

                {/* Status Breakdown */}
                <div className="chart-widget p-8 border-none bg-gradient-to-br from-white/5 to-transparent flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-400" />
                        {t('reports.analytics.inv.asset_health')}
                    </h3>

                    <div className="space-y-6">
                        {stats?.distribution?.status?.map((item, idx) => {
                            const total = stats.summary.volumes || 1;
                            const percent = ((item.count / total) * 100).toFixed(1);

                            let theme = { bg: 'bg-gray-500', text: 'text-gray-400', glow: 'shadow-none' };
                            if (item.status === 'Available') theme = { bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' };
                            if (item.status === 'Issued') theme = { bg: 'bg-indigo-500', text: 'text-indigo-400', glow: 'shadow-[0_0_10px_rgba(99,102,241,0.3)]' };
                            if (item.status === 'Lost') theme = { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]' };
                            if (item.status === 'Damaged') theme = { bg: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]' };

                            return (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${theme.text} mb-0.5`}>{item.status}</span>
                                            <span className="text-xs text-gray-500">
                                                {item.status === 'Available' ? t('reports.analytics.inv.ready_issue') :
                                                    item.status === 'Issued' ? t('reports.analytics.inv.with_students') :
                                                        item.status === 'Lost' ? t('reports.analytics.inv.marked_lost') : t('reports.analytics.inv.needs_repair')}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-white font-mono font-bold text-lg">{item.count}</span>
                                            <span className="text-gray-500 text-xs ml-1">({percent}%)</span>
                                        </div>
                                    </div>
                                    {/* Progress Bar with Glow */}
                                    <div className="w-full bg-black/20 rounded-full h-3 p-0.5 overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full rounded-full ${theme.bg} ${theme.glow} relative overflow-hidden transition-all duration-700 ease-out group-hover:opacity-90`}
                                            style={{ width: `${percent}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryAnalytics;
