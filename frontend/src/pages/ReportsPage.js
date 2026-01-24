import React, { useState, useEffect } from 'react';
import {
    FileText, TrendingUp, DollarSign, Package, Calendar,
    Printer, AlertCircle, Sparkles
} from 'lucide-react';
import GlassSelect from '../components/common/GlassSelect';

// Import New Modular Analytics Components
import CirculationAnalytics from '../components/analytics/CirculationAnalytics';
import FinancialAnalytics from '../components/analytics/FinancialAnalytics';
import InventoryAnalytics from '../components/analytics/InventoryAnalytics';

const SmartReportsPage = () => {
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

    return (
        <div className="dashboard-content h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900">
            {/* Header */}
            <div className="flex-none p-6 pb-2 no-print relative z-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                <FileText size={28} />
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Library Insights
                            </span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 ml-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Academic Performance & Usage Metrics
                        </p>
                    </div>

                    {/* Smart Controls */}
                    <div className="flex items-center gap-3">
                        <div className="w-[180px]">
                            <GlassSelect
                                value={period}
                                onChange={setPeriod}
                                options={[
                                    { value: '7days', label: 'Last 7 Days' },
                                    { value: '30days', label: 'Last 30 Days' },
                                    { value: '90days', label: 'Last 3 Months' },
                                    { value: '365days', label: 'Last Year' }
                                ]}
                                icon={Calendar}
                            />
                        </div>

                        <button
                            className="btn btn-secondary text-sm backdrop-blur-md border-white/10 hover:bg-white/10 text-white"
                            onClick={handlePrint}
                        >
                            <Printer size={16} />
                            <span className="hidden md:inline">Export</span>
                        </button>
                    </div>
                </div>

                {/* Smart Tabs - Circulation Desk Style */}
                <div className="flex gap-3 border-b border-white/10 relative px-6 pb-6">
                    <div className="glass-panel flex gap-1 p-1 rounded-full">
                        {[
                            { id: 'circulation', label: 'Circulation', icon: TrendingUp },
                            { id: 'financial', label: 'Financials', icon: DollarSign },
                            { id: 'inventory', label: 'Inventory', icon: Package }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`btn rounded-full flex items-center gap-2 ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 relative z-10">
                {/* Background Decor */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]"></div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={24} className="text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-gray-400 font-mono text-sm tracking-widest animate-pulse">ANALYZING METRICS...</p>
                    </div>
                ) : !stats ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 m-4 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                        <AlertCircle size={48} className="text-red-400 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">System Offline</h3>
                        <p className="text-gray-500 max-w-md">Analytics engine could not retrieve data. Please check your connection.</p>
                        <button onClick={fetchReportData} className="mt-6 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <div className="pb-10 animate-fade-in-up">
                        {activeTab === 'circulation' && <CirculationAnalytics stats={stats} loading={loading} />}
                        {activeTab === 'financial' && <FinancialAnalytics stats={stats} />}
                        {activeTab === 'inventory' && <InventoryAnalytics stats={stats} />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartReportsPage;
