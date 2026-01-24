import React from 'react';
import { ArrowRight } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color, onClick, trend }) => {
    const colorClass = `stats-card-icon ${color || 'blue'}`;

    return (
        <div
            className={`stats-card animate-fade-in-up ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} transition-transform duration-200`}
            onClick={onClick}
        >
            <div className="stats-card-header">
                <div>
                    <h3 className="stats-card-title">{title}</h3>
                    <p className="stats-card-value font-mono">{value}</p>
                </div>
                <div className={colorClass}>
                    <Icon size={24} />
                </div>
            </div>

            {(trend || onClick) && (
                <div className="flex items-center justify-between mt-4">
                    {trend && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.includes('+') ? 'bg-green-500/10 text-green-400' :
                                trend.includes('-') ? 'bg-red-500/10 text-red-400' :
                                    'bg-white/10 text-gray-400'
                            }`}>
                            {trend}
                        </span>
                    )}

                    {onClick && (
                        <div className="stats-card-trend flex items-center gap-1 text-secondary ml-auto text-xs">
                            View <ArrowRight size={12} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatsCard;
