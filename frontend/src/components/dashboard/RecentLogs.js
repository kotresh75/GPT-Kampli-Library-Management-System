import React from 'react';
import { Clock, ShieldAlert, User, FileText, Settings, Database, AlertTriangle } from 'lucide-react';

const RecentLogs = ({ title, logs = [], type = 'general', icon: Icon }) => {

    const getIcon = (log) => {
        if (log.module === 'Security') return <ShieldAlert size={16} className="text-red-400" />;
        if (log.action_type === 'IMPORT') return <Database size={16} className="text-blue-400" />;
        if (log.module === 'Settings') return <Settings size={16} className="text-gray-400" />;
        if (log.action_type === 'ISSUE') return <FileText size={16} className="text-green-400" />;
        return <User size={16} className="text-indigo-400" />;
    };

    return (
        <div className="glass-panel p-5 h-full">
            <h3 className="card-title mb-4 flex items-center gap-2">
                {Icon && <Icon size={18} className="text-accent" />}
                {title}
            </h3>
            <div className="logs-list space-y-3 overflow-y-auto max-h-60 pr-2">
                {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No recent activity.</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="log-item p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 opacity-80">
                                    {getIcon(log)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-200 truncate" title={log.description}>
                                        {log.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-400">
                                            {log.actor_role}: {log.actor_id}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock size={12} />
                                            <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentLogs;
