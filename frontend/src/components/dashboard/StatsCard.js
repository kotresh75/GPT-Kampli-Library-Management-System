import React from 'react';
import { ArrowRight } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color, onClick }) => {
    const colorClass = `stats-card-icon ${color || 'blue'}`;

    return (
        <div
            className={`stats-card animate-fade-in-up ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="stats-card-header">
                <div>
                    <h3 className="stats-card-title">{title}</h3>
                    <p className="stats-card-value">{value}</p>
                </div>
                <div className={colorClass}>
                    <Icon size={24} />
                </div>
            </div>

            {onClick && (
                <div className="stats-card-trend flex items-center gap-1 mt-4 text-secondary">
                    View Details <ArrowRight size={14} />
                </div>
            )}
        </div>
    );
};

export default StatsCard;
