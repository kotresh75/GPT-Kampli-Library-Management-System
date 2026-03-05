import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Wifi, Cpu, HardDrive, RefreshCw, CheckCircle, AlertTriangle, XCircle, Zap, Box, Shield, HeartPulse, Gauge, Bug, ExternalLink, Copy, FolderOpen, Clock, Monitor, Layers, MemoryStick, Hash, GitBranch, MessageSquare, FileText, ChevronRight, Terminal, Info } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useTutorial } from '../context/TutorialContext';

const SystemHealthPage = () => {
    const { t } = useLanguage();
    const { setPageContext } = useTutorial();
    useEffect(() => {
        setPageContext('system-health');
    }, []);
    const [health, setHealth] = useState(null);
    const [connectivity, setConnectivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingNet, setCheckingNet] = useState(false);
    const [healthScore, setHealthScore] = useState(0);
    const [logPath, setLogPath] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch log file path on mount
    useEffect(() => {
        if (window.electron?.getLogPath) {
            window.electron.getLogPath().then(p => setLogPath(p || ''));
        }
    }, []);

    // Calculate Smart Health Score whenever health/connectivity changes
    useEffect(() => {
        if (!health) return;

        let score = 100;
        const deductions = [];

        // 1. CPU Impact (Max 30 points)
        const cpu = parseFloat(health.system.cpuLoad) || 0;
        if (cpu > 50) deductions.push((cpu - 50) * 0.6);

        // 2. Memory Impact (Max 30 points)
        const mem = parseFloat(health.system.memory.usage) || 0;
        if (mem > 60) deductions.push((mem - 60) * 0.6);

        // 3. Disk Impact (Max 20 points)
        if (health.system.disk) {
            const disk = parseFloat(health.system.disk.usagePercent) || 0;
            if (disk > 80) deductions.push((disk - 80) * 1);
        }

        // 4. Connectivity Impact (Max 20 points)
        if (connectivity && !connectivity.internet) deductions.push(20);

        const totalDeduction = deductions.reduce((a, b) => a + b, 0);
        setHealthScore(Math.max(0, Math.round(100 - totalDeduction)));

    }, [health, connectivity]);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:17221/api/health');
            const data = await res.json();
            setHealth(data);

            // Auto-check connectivity if not done yet
            if (!connectivity) {
                const netRes = await fetch('http://localhost:17221/api/health/connectivity');
                const netData = await netRes.json();
                setConnectivity(netData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const runNetCheck = async () => {
        setCheckingNet(true);
        try {
            const res = await fetch('http://localhost:17221/api/health/connectivity');
            const data = await res.json();
            setConnectivity(data);
        } catch (err) {
            setConnectivity({ internet: false, error: 'Failed' });
        } finally {
            setCheckingNet(false);
        }
    };

    const getHealthStatus = (score) => {
        if (score >= 90) return { label: t('sidebar.sys_health.status.optimal') || 'OPTIMAL', color: 'text-green-400', bg: 'bg-green-500' };
        if (score >= 70) return { label: t('sidebar.sys_health.status.good') || 'GOOD', color: 'text-blue-400', bg: 'bg-blue-500' };
        if (score >= 50) return { label: t('sidebar.sys_health.status.fair') || 'FAIR', color: 'text-yellow-400', bg: 'bg-yellow-500' };
        return { label: t('sidebar.sys_health.status.critical') || 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500' };
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (sec) => {
        const days = Math.floor(sec / 86400);
        const hours = Math.floor((sec % 86400) / 3600);
        return `${days}d ${hours}h`;
    };

    if (!health && loading) return <div className="p-10 text-white flex items-center gap-3"><RefreshCw className="animate-spin" /> Initializing...</div>;
    if (!health) return <div className="p-10 text-white">System Core Offline.</div>;

    const healthStatus = getHealthStatus(healthScore);

    return (
        <div className="p-6 text-white h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f1025] to-[#0f1025]">

            {/* Header - Compact */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                        <Activity className="text-cyan-400" size={20} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                            {t('sidebar.sys_health.title') || 'System Diagnostics'}
                        </span>
                    </h1>
                </div>
                <button
                    className="px-4 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium flex items-center gap-2 transition-all"
                    onClick={fetchHealth}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('sidebar.sys_health.scan') || 'Scan'}
                </button>
            </div>

            {/* DASHBOARD GRID */}
            <div className="dashboard-kpi-grid">

                {/* 1. Health Score - Uses standard StatsCard classes mixed with ID Card layout */}
                <div className="stats-card md:col-span-2 relative overflow-hidden group border-t border-cyan-500/30">
                    <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
                    <div className="stats-card-header relative z-10 flex items-center justify-between w-full h-full">
                        <div>
                            <h3 className="stats-card-title text-cyan-400">{t('sidebar.sys_health.score_title') || 'System Health Score'}</h3>
                            <div className="flex items-baseline gap-3 mt-1">
                                <span className="stats-card-value text-5xl">{healthScore}</span>
                                <span className={`text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/5 ${healthStatus.color}`}>
                                    {healthStatus.label}
                                </span>
                            </div>
                        </div>
                        <div className={`stats-card-icon bg-cyan-500/10 text-cyan-400 w-16 h-16`}>
                            <Activity size={32} />
                        </div>
                    </div>
                </div>

                {/* 2. CPU */}
                <div className="stats-card group">
                    <div className="stats-card-header">
                        <div>
                            <h3 className="stats-card-title">{t('sidebar.sys_health.cpu') || 'CPU Load'}</h3>
                            <p className="stats-card-value">{health.system.cpuLoad}%</p>
                        </div>
                        <div className="stats-card-icon blue">
                            <Cpu size={24} />
                        </div>
                    </div>
                    <div className="mt-auto pt-4">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                            <div className={`h-full ${parseFloat(health.system.cpuLoad) > 80 ? 'bg-red-500' : 'bg-blue-500'} transition-all`} style={{ width: `${health.system.cpuLoad}%` }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate font-mono">{health.system.cpuModel}</p>
                    </div>
                </div>

                {/* 3. RAM */}
                <div className="stats-card group">
                    <div className="stats-card-header">
                        <div>
                            <h3 className="stats-card-title">{t('sidebar.sys_health.memory') || 'Memory'}</h3>
                            <p className="stats-card-value">{health.system.memory.usage}%</p>
                        </div>
                        <div className="stats-card-icon purple">
                            <Box size={24} />
                        </div>
                    </div>
                    <div className="mt-auto pt-4">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                            <div className={`h-full ${parseFloat(health.system.memory.usage) > 80 ? 'bg-red-500' : 'bg-purple-400'} transition-all`} style={{ width: `${health.system.memory.usage}%` }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate font-mono">Free: {formatBytes(health.system.memory.free)}</p>
                    </div>
                </div>

                {/* 4. Disk */}
                <div className="stats-card group">
                    <div className="stats-card-header">
                        <div>
                            <h3 className="stats-card-title">{t('sidebar.sys_health.disk') || 'Disk Space'}</h3>
                            <p className="stats-card-value">{health.system.disk ? `${health.system.disk.usagePercent}%` : '...'}</p>
                        </div>
                        <div className="stats-card-icon green">
                            <HardDrive size={24} />
                        </div>
                    </div>
                    <div className="mt-auto pt-4">
                        {health.system.disk ? (
                            <>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                                    <div className={`h-full ${parseFloat(health.system.disk.usagePercent) > 90 ? 'bg-red-500' : 'bg-green-400'} transition-all`} style={{ width: `${health.system.disk.usagePercent}%` }}></div>
                                </div>
                                <p className="text-[10px] text-gray-400 truncate font-mono">Free: {formatBytes(health.system.disk.free)}</p>
                            </>
                        ) : (
                            <p className="text-[10px] text-gray-500">Scanning storage...</p>
                        )}
                    </div>
                </div>

                {/* 5. Network - Adjusted span if needed, fitting into grid naturally */}
                <div className="stats-card group">
                    <div className="stats-card-header">
                        <div>
                            <h3 className="stats-card-title">{t('sidebar.sys_health.uplink') || 'Uplink'}</h3>
                            <p className={`stats-card-value text-2xl ${connectivity?.internet ? 'text-white' : 'text-red-400'}`}>
                                {connectivity ? (connectivity.internet ?
                                    (t('sidebar.sys_health.status.online') || 'ONLINE') :
                                    (t('sidebar.sys_health.status.offline') || 'OFFLINE')) : '...'}
                            </p>
                        </div>
                        <div className="stats-card-icon orange">
                            <Wifi size={24} />
                        </div>
                    </div>
                    <div className="mt-auto pt-4">
                        <div className="flex gap-1 h-1.5 items-end mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={`w-full rounded-sm ${connectivity?.internet ? 'bg-orange-400' : 'bg-white/10'}`} style={{ height: `${20 + (i * 20)}%`, opacity: connectivity?.internet ? 1 : 0.3 }}></div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate font-mono">{t('sidebar.sys_health.ping') || 'Ping'}: {connectivity?.latency || '-'}</p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════
                SYSTEM PARAMETERS — REDESIGNED
               ═══════════════════════════════════════ */}
            <div className="glass-panel p-0 overflow-hidden">
                {/* Section Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.06) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(6,182,212,0.3)'
                        }}>
                            <Shield size={16} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main, #e5e7eb)' }}>
                                {t('sidebar.sys_health.system_params') || 'System Parameters'}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', marginTop: '2px' }}>
                                Runtime environment & infrastructure details
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.7rem', color: 'var(--text-secondary, #6b7280)', fontFamily: 'monospace'
                    }}>
                        <div style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                            animation: 'pulse 2s infinite'
                        }} />
                        Live Monitoring
                    </div>
                </div>

                {/* Parameter Cards Grid */}
                <div style={{
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                }}>
                    {/* Host Platform Card */}
                    <div style={{
                        background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                        borderRadius: '12px', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                        transition: 'all 0.2s ease',
                        borderLeft: '3px solid #06b6d4'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'rgba(6,182,212,0.12)', color: '#06b6d4',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Monitor size={15} />
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '10px', background: 'rgba(16,185,129,0.1)',
                                color: '#10b981', border: '1px solid rgba(16,185,129,0.2)'
                            }}>Active</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>
                                {t('sidebar.sys_health.host') || 'Host Platform'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main, #e5e7eb)', textTransform: 'capitalize' }}>
                                {health.system.platform}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary, #6b7280)' }}>
                                {health.system.arch}
                            </p>
                        </div>
                    </div>

                    {/* Database Card */}
                    <div style={{
                        background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                        borderRadius: '12px', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                        transition: 'all 0.2s ease',
                        borderLeft: '3px solid #8b5cf6'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Database size={15} />
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '10px',
                                background: health.database.status === 'Connected' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: health.database.status === 'Connected' ? '#10b981' : '#ef4444',
                                border: `1px solid ${health.database.status === 'Connected' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                            }}>{health.database.status}</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>
                                {t('sidebar.sys_health.db') || 'Database'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main, #e5e7eb)' }}>
                                SQLite
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary, #6b7280)' }}>
                                Size: {health.database.size}
                            </p>
                        </div>
                    </div>

                    {/* CPU Model Card */}
                    <div style={{
                        background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                        borderRadius: '12px', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                        transition: 'all 0.2s ease',
                        borderLeft: '3px solid #3b82f6'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Cpu size={15} />
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '10px', background: 'rgba(59,130,246,0.1)',
                                color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'
                            }}>{health.system.cpuLoad}%</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>
                                Processor
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main, #e5e7eb)' }} title={health.system.cpuModel}>
                                {health.system.cpuModel?.length > 30 ? health.system.cpuModel.substring(0, 30) + '…' : health.system.cpuModel}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary, #6b7280)' }}>
                                Load: {health.system.cpuLoad}%
                            </p>
                        </div>
                    </div>

                    {/* Node Runtime Card */}
                    <div style={{
                        background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                        borderRadius: '12px', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                        transition: 'all 0.2s ease',
                        borderLeft: '3px solid #10b981'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'rgba(16,185,129,0.12)', color: '#10b981',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Terminal size={15} />
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '10px', background: 'rgba(16,185,129,0.1)',
                                color: '#10b981', border: '1px solid rgba(16,185,129,0.2)'
                            }}>Running</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>
                                Node Runtime
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main, #e5e7eb)' }}>
                                {health.process?.version || 'N/A'}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary, #6b7280)' }}>
                                PID: {health.process?.pid || '—'}
                            </p>
                        </div>
                    </div>

                    {/* System Uptime Card */}
                    <div style={{
                        background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                        borderRadius: '12px', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                        transition: 'all 0.2s ease',
                        borderLeft: '3px solid #f59e0b'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Clock size={15} />
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '10px', background: 'rgba(245,158,11,0.1)',
                                color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)'
                            }}>Uptime</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>
                                System Uptime
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main, #e5e7eb)' }}>
                                {formatUptime(health.system.uptime)}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary, #6b7280)' }}>
                                App: {formatUptime(health.process?.uptime || 0)}
                            </p>
                        </div>
                    </div>

                    {/* App Memory Card */}
                    <div style={{
                        background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                        borderRadius: '12px', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                        transition: 'all 0.2s ease',
                        borderLeft: '3px solid #ec4899'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'rgba(236,72,153,0.12)', color: '#ec4899',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Layers size={15} />
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '10px', background: 'rgba(236,72,153,0.1)',
                                color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)'
                            }}>Live</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>
                                {t('sidebar.sys_health.app_mem') || 'App Memory'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main, #e5e7eb)' }}>
                                {health.process?.memory ? formatBytes(health.process.memory.rss) : 'N/A'}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary, #6b7280)' }}>
                                Heap: {health.process?.memory ? formatBytes(health.process.memory.heapUsed) : '—'} / {health.process?.memory ? formatBytes(health.process.memory.heapTotal) : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Disk Path Footer */}
                {health.database.path && (
                    <div style={{
                        padding: '10px 20px',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        background: 'rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-secondary, #6b7280)'
                    }}>
                        <Database size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <span style={{ opacity: 0.6, flexShrink: 0 }}>DB Path:</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={health.database.path}>
                            {health.database.path}
                        </span>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════
                REPORT A BUG — REDESIGNED
               ═══════════════════════════════════════ */}
            <div className="glass-panel p-0 overflow-hidden mt-4">
                {/* Gradient Banner Header */}
                <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(249,115,22,0.08) 50%, rgba(234,179,8,0.06) 100%)',
                    borderBottom: '1px solid rgba(239,68,68,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ef4444, #f97316)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
                        }}>
                            <Bug size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #e5e7eb)' }}>
                                {t('sidebar.sys_health.bug_title') || 'Report a Bug'}
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary, #9ca3af)' }}>
                                Help us improve by reporting issues on GitHub
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const url = 'https://github.com/kotresh75/GPT-Kampli-Library-Management-System';
                            if (window.electron?.openExternalUrl) {
                                window.electron.openExternalUrl(url);
                            } else {
                                window.open(url, '_blank');
                            }
                        }}
                        style={{
                            fontSize: '0.7rem', color: '#f97316', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
                            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <ExternalLink size={12} /> Open Source
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Step-by-Step Instructions */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                        marginBottom: '20px'
                    }}>
                        {[
                            { step: 1, icon: FileText, title: 'Describe the Issue', desc: 'Write what happened and when', color: '#ef4444' },
                            { step: 2, icon: FolderOpen, title: 'Attach Log File', desc: 'Copy the log path below', color: '#f59e0b' },
                            { step: 3, icon: ExternalLink, title: 'Submit on GitHub', desc: 'Click the button to report', color: '#10b981' }
                        ].map(({ step, icon: Icon, title, desc, color }) => (
                            <div key={step} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '10px',
                                padding: '14px', borderRadius: '10px',
                                background: 'var(--glass-bg, rgba(255,255,255,0.02))',
                                border: '1px solid var(--glass-border, rgba(255,255,255,0.06))'
                            }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                                    background: `${color}15`, color: color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700
                                }}>
                                    {step}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main, #e5e7eb)' }}>
                                        {title}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: 'var(--text-secondary, #9ca3af)' }}>
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Auto-populated System Snapshot */}
                    <div style={{
                        padding: '14px', borderRadius: '10px', marginBottom: '16px',
                        background: 'rgba(59,130,246,0.04)',
                        border: '1px solid rgba(59,130,246,0.12)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <Info size={13} style={{ color: '#60a5fa' }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                System Snapshot (Auto-included in report)
                            </span>
                        </div>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 20px',
                            fontSize: '0.72rem', fontFamily: 'monospace'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>OS</span>
                                <span style={{ color: 'var(--text-main, #e5e7eb)', textTransform: 'capitalize' }}>{health.system.platform} ({health.system.arch})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>Node</span>
                                <span style={{ color: 'var(--text-main, #e5e7eb)' }}>{health.process?.version || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>CPU</span>
                                <span style={{ color: 'var(--text-main, #e5e7eb)' }}>{health.system.cpuLoad}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>Memory</span>
                                <span style={{ color: 'var(--text-main, #e5e7eb)' }}>{health.system.memory.usage}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>DB</span>
                                <span style={{ color: 'var(--text-main, #e5e7eb)' }}>{health.database.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>Health</span>
                                <span style={{ color: healthScore >= 70 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                                    {healthScore}/100
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Log file path */}
                    {logPath && (
                        <div style={{
                            marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px', borderRadius: '10px',
                            background: 'rgba(6,182,212,0.05)',
                            border: '1px solid rgba(6,182,212,0.15)'
                        }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                                background: 'rgba(6,182,212,0.12)', color: '#06b6d4',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FolderOpen size={14} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>Log File Location</p>
                                <p style={{
                                    margin: '2px 0 0', fontSize: '0.72rem', fontFamily: 'monospace',
                                    color: 'var(--text-main, #d1d5db)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }} title={logPath}>{logPath}</p>
                            </div>
                            <button
                                style={{
                                    fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                                    background: 'rgba(6,182,212,0.1)', color: '#06b6d4', fontWeight: 600,
                                    border: '1px solid rgba(6,182,212,0.25)',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    transition: 'all 0.2s ease', flexShrink: 0
                                }}
                                onClick={() => {
                                    navigator.clipboard.writeText(logPath);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                            >
                                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                                {copied ? (t('sidebar.sys_health.copied') || 'Copied!') : (t('sidebar.sys_health.copy_path') || 'Copy Path')}
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            style={{
                                flex: 1, padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                                background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)',
                                color: '#f87171', fontWeight: 600, fontSize: '0.82rem',
                                border: '1px solid rgba(239,68,68,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => {
                                const version = health?.process?.version || 'unknown';
                                const platform = health?.system?.platform || 'unknown';
                                const arch = health?.system?.arch || 'unknown';
                                const body = encodeURIComponent(
                                    `## Bug Report\n\n**App Version:** ${document.title || 'GPTK LMS'}\n**Node Version:** ${version}\n**OS:** ${platform} (${arch})\n**Health Score:** ${healthScore}/100\n**CPU Load:** ${health?.system?.cpuLoad || '—'}%\n**Memory Usage:** ${health?.system?.memory?.usage || '—'}%\n**Database:** ${health?.database?.status || '—'} (${health?.database?.size || '—'})\n\n### What happened?\n\nDescribe the issue here...\n\n### Steps to reproduce\n\n1. \n2. \n3. \n\n### Expected behavior\n\n\n### Log file\n\nAttach the log file from: \`${logPath}\`\n`
                                );
                                const url = `https://github.com/kotresh75/GPT-Kampli-Library-Management-System/issues/new?title=${encodeURIComponent('Bug: ')}&body=${body}&labels=bug`;
                                if (window.electron?.openExternalUrl) {
                                    window.electron.openExternalUrl(url);
                                } else {
                                    window.open(url, '_blank');
                                }
                            }}
                        >
                            <Bug size={16} />
                            {t('sidebar.sys_health.report_bug') || 'Report Bug on GitHub'}
                            <ChevronRight size={14} style={{ opacity: 0.6 }} />
                        </button>
                        <button
                            style={{
                                padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                                background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                                color: 'var(--text-secondary, #9ca3af)', fontWeight: 600, fontSize: '0.82rem',
                                border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => {
                                const url = 'https://github.com/kotresh75/GPT-Kampli-Library-Management-System/issues';
                                if (window.electron?.openExternalUrl) {
                                    window.electron.openExternalUrl(url);
                                } else {
                                    window.open(url, '_blank');
                                }
                            }}
                        >
                            <MessageSquare size={16} />
                            View Issues
                        </button>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default SystemHealthPage;
