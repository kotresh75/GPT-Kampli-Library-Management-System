import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Wifi, Cpu, HardDrive, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const SystemHealthPage = () => {
    const [health, setHealth] = useState(null);
    const [connectivity, setConnectivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingNet, setCheckingNet] = useState(false);

    useEffect(() => {
        fetchHealth();
    }, []);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/health');
            const data = await res.json();
            setHealth(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const runNetCheck = async () => {
        setCheckingNet(true);
        try {
            const res = await fetch('http://localhost:3001/api/health/connectivity');
            const data = await res.json();
            setConnectivity(data);
        } catch (err) {
            setConnectivity({ internet: false, error: 'Failed' });
        } finally {
            setCheckingNet(false);
        }
    };

    const StatusIndicator = ({ status }) => {
        if (status === 'Online' || status === 'Connected' || status === true)
            return <div className="flex items-center gap-2 text-green-400"><CheckCircle size={16} /> OK</div>;
        if (status === 'Unknown')
            return <div className="flex items-center gap-2 text-yellow-400"><AlertTriangle size={16} /> Checking</div>;
        return <div className="flex items-center gap-2 text-red-400"><XCircle size={16} /> Error</div>;
    };

    if (loading) return <div className="p-10 text-white">Running Diagnostics...</div>;
    if (!health) return <div className="p-10 text-white">Failed to connect to server backend.</div>;

    const formatUptime = (sec) => {
        const days = Math.floor(sec / 86400);
        const hours = Math.floor((sec % 86400) / 3600);
        return `${days}d ${hours}h`;
    };

    return (
        <div className="p-8 text-white h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3"><Activity className="text-accent" /> System Health Diagnostics</h1>
                    <p className="text-gray-400 text-sm mt-1">Real-time server monitoring • {new Date(health.timestamp).toLocaleString()}</p>
                </div>
                <button className="primary-glass-btn flex items-center gap-2" onClick={fetchHealth}>
                    <RefreshCw size={16} /> Refresh Status
                </button>
            </div>

            <div className="dashboard-kpi-grid">
                <div className="glass-panel p-5 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-300 uppercase tracking-wider"><Server size={16} /> Server Node</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Platform</span>
                                <span>{health.system.platform} ({health.system.arch})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Uptime</span>
                                <span className="font-mono">{formatUptime(health.system.uptime)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Status</span>
                                <StatusIndicator status={health.status} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-5 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-300 uppercase tracking-wider"><Database size={16} /> Local Database</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center w-full">
                                <span className="text-gray-400">Type</span>
                                <span>SQLite</span>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <span className="text-gray-400">Size</span>
                                <span className="font-mono">{health.database.size}</span>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <span className="text-gray-400">Connection</span>
                                <StatusIndicator status={health.database.status} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-5 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-300 uppercase tracking-wider"><Wifi size={16} /> Connectivity</h3>

                        {!connectivity ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <p className="text-sm text-gray-400 mb-4">Run test to check external access</p>
                                <button className="glass-btn flex items-center gap-2" onClick={runNetCheck} disabled={checkingNet}>
                                    {checkingNet ? <RefreshCw className="animate-spin" size={14} /> : <Wifi size={14} />}
                                    {checkingNet ? 'Testing...' : 'Test Connectivity'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Internet</span>
                                    <StatusIndicator status={connectivity.internet} />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Gateway Latency</span>
                                    <span className="font-mono">{connectivity.latency}</span>
                                </div>
                                <button className="text-xs text-accent hover:underline mt-2" onClick={runNetCheck}>Re-run Test</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Grid */}
            {/* Performance Grid */}
            <h2 className="text-xl font-bold mb-4">Resource Usage</h2>
            <div className="dashboard-kpi-grid">
                <div className="glass-panel p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">CPU Load</h3>
                            <div className="text-2xl font-bold text-white mt-1">
                                {health.system.cpuLoad}%
                            </div>
                        </div>
                        <div className="p-2 rounded-md bg-white/5 text-gray-400">
                            <Cpu size={20} />
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block mb-1">Load Average</span>
                        <div className="text-xs text-gray-500 truncate" title={health.system.cpuModel}>
                            {health.system.cpuModel}
                            <span className="block text-gray-600 mt-1">(Real-time)</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Memory Usage</h3>
                            <div className="text-2xl font-bold text-white mt-1">
                                {health.system.memory.usage}%
                            </div>
                        </div>
                        <div className="p-2 rounded-md bg-white/5 text-gray-400">
                            <HardDrive size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className="bg-accent h-full transition-all duration-500"
                                style={{ width: `${health.system.memory.usage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Used: {health.system.memory.usage}%</span>
                            <span>{((health.system.memory.total - health.system.memory.free) / 1024 / 1024 / 1024).toFixed(1)}GB / {(health.system.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default SystemHealthPage;
