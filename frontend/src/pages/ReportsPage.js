import React, { useState, useEffect } from 'react';
import {
    FileText, TrendingUp, DollarSign, Package, Calendar,
    Printer, AlertCircle, Sparkles
} from 'lucide-react';
import GlassSelect from '../components/common/GlassSelect';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';

// Import New Modular Analytics Components
import CirculationAnalytics from '../components/analytics/CirculationAnalytics';
import FinancialAnalytics from '../components/analytics/FinancialAnalytics';
import SmartExportModal from '../components/common/SmartExportModal';
import InventoryAnalytics from '../components/analytics/InventoryAnalytics';

const SmartReportsPage = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('circulation');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('30days'); // '7days', '30days', '90days'

    useEffect(() => {
        fetchReportData();
    }, [activeTab, period]);

    const socket = useSocket();
    useEffect(() => {
        if (!socket) return;
        const handleUpdate = () => {
            console.log("Report Data Update: Refreshing");
            fetchReportData();
        };
        // Listen to all relevant sources
        socket.on('circulation_update', handleUpdate);
        socket.on('fine_update', handleUpdate);
        socket.on('book_update', handleUpdate);
        return () => {
            socket.off('circulation_update', handleUpdate);
            socket.off('fine_update', handleUpdate);
            socket.off('book_update', handleUpdate);
        };
    }, [socket, activeTab, period]);

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

    const [showExportModal, setShowExportModal] = useState(false);

    const getExportData = () => {
        if (!stats) return { data: [], columns: [] };

        if (activeTab === 'circulation') {
            const trendData = (stats.trend || []).map(trend => ({
                [t('reports.export.dates')]: new Date(trend.date).toLocaleDateString(),
                [t('reports.export.issues')]: trend.issue,
                [t('reports.export.returns')]: trend.return,
                [t('reports.export.renewals')]: trend.renew || 0
            }));

            return {
                title: t('reports.export.circ_title'),
                data: trendData,
                columns: [t('reports.export.dates'), t('reports.export.issues'), t('reports.export.returns'), t('reports.export.renewals')]
            };
        }

        if (activeTab === 'financial') {
            const financialData = (stats.transactions || []).map(tx => ({
                [t('reports.export.dates')]: new Date(tx.date).toLocaleDateString(),
                [t('reports.export.desc')]: tx.description,
                [t('reports.export.amount')]: tx.amount,
                [t('reports.export.type')]: tx.type
            }));
            return {
                title: t('reports.export.fin_title'),
                data: financialData,
                columns: [t('reports.export.dates'), t('reports.export.desc'), t('reports.export.amount'), t('reports.export.type')]
            };
        }

        if (activeTab === 'inventory') {
            const inventoryData = (stats.categories || []).map(c => ({
                [t('reports.export.cat')]: c._id || c.name,
                [t('reports.export.count')]: c.count,
                [t('reports.export.val')]: c.total_value || 0
            }));
            return {
                title: t('reports.export.inv_title'),
                data: inventoryData,
                columns: [t('reports.export.cat'), t('reports.export.count'), t('reports.export.val')]
            };
        }

        return { data: [], columns: [] };
    };

    const handlePrintClick = () => {
        setShowExportModal(true);
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
                                {t('reports.title')}
                            </span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 ml-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {t('reports.subtitle')}
                        </p>
                    </div>

                    {/* Smart Controls */}
                    <div className="flex items-center gap-3">
                        <div className="w-[180px]">
                            <GlassSelect
                                value={period}
                                onChange={setPeriod}
                                options={[
                                    { value: '7days', label: t('reports.period.7days') },
                                    { value: '30days', label: t('reports.period.30days') },
                                    { value: '90days', label: t('reports.period.90days') },
                                    { value: '365days', label: t('reports.period.365days') }
                                ]}
                                icon={Calendar}
                            />
                        </div>

                        <button
                            className="btn btn-secondary text-sm backdrop-blur-md border-white/10 hover:bg-white/10 text-white"
                            onClick={handlePrintClick}
                        >
                            <Printer size={16} />
                            <span className="hidden md:inline">{t('reports.export_print')}</span>
                        </button>
                    </div>
                </div>

                {/* Smart Tabs - Circulation Desk Style */}
                <div className="flex gap-3 border-b border-white/10 relative px-6 pb-6">
                    <div className="glass-panel flex gap-1 p-1 rounded-full">
                        {[
                            { id: 'circulation', label: t('reports.tabs.circulation'), icon: TrendingUp },
                            { id: 'financial', label: t('reports.tabs.financial'), icon: DollarSign },
                            { id: 'inventory', label: t('reports.tabs.inventory'), icon: Package }
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
                        <p className="text-gray-400 font-mono text-sm tracking-widest animate-pulse">{t('reports.loading')}</p>
                    </div>
                ) : !stats ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 m-4 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                        <AlertCircle size={48} className="text-red-400 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">{t('reports.offline_title')}</h3>
                        <p className="text-gray-500 max-w-md">{t('reports.offline_desc')}</p>
                        <button onClick={fetchReportData} className="mt-6 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                            {t('reports.retry')}
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

            {showExportModal && (
                <SmartExportModal
                    onClose={() => setShowExportModal(false)}
                    totalCount={getExportData().data.length}
                    filteredCount={getExportData().data.length}
                    selectedCount={0}
                    entityName={getExportData().title}
                    data={getExportData().data}
                    columns={getExportData().columns}
                    allowedFormats={['print']}
                    // No need for onFetchAll here as 'stats' contains the full summary dataset
                    onExport={(scope, format) => {
                        if (format === 'print') {
                            // Open separate print window
                            window.open(`/print/report?period=${period}`, '_blank');
                            setShowExportModal(false);
                            return true; // Signal handled
                        } else {
                            // For now validation log
                            console.log("Exporting", format, getExportData().data);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default SmartReportsPage;
