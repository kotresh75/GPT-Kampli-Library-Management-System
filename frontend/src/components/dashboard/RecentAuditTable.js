import React from 'react';
import { Clock, ShieldAlert, User, FileText, Settings, Database } from 'lucide-react';

const RecentAuditTable = ({ logs = [] }) => {

    const getIcon = (log) => {
        if (log.module === 'Security') return <ShieldAlert size={16} className="text-red-400" />;
        if (log.action_type === 'IMPORT') return <Database size={16} className="text-blue-400" />;
        if (log.module === 'Settings') return <Settings size={16} className="text-gray-400" />;
        if (log.action_type === 'ISSUE' || log.action_type === 'RETURN') return <FileText size={16} className="text-green-400" />;
        return <User size={16} className="text-indigo-400" />;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 rounded-tl-lg">Action</th>
                            <th className="p-4">Module</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Actor</th>
                            <th className="p-4 rounded-tr-lg">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500 italic">No recent activity found.</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors text-sm">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-white/5 border border-white/5">
                                                {getIcon(log)}
                                            </div>
                                            <span className="font-medium text-white">{log.action_type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        <span className="px-2 py-1 rounded text-xs bg-white/5 border border-white/10">
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300 max-w-md truncate" title={log.description}>
                                        {log.description}
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        <div className="flex flex-col">
                                            <span className="text-white text-xs">{log.actor_role}</span>
                                            <span className="text-[10px] text-gray-500">{log.actor_id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {formatDate(log.timestamp)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentAuditTable;
