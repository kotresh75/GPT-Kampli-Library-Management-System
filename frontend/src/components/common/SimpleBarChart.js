import React from 'react';

const SimpleBarChart = ({ data, categoryKey, valueKey, color = 'bg-accent', height = 200 }) => {
    if (!data || data.length === 0) return <div className="text-center text-gray-500 py-10">No Data Available</div>;

    const maxValue = Math.max(...data.map(d => d[valueKey]));

    return (
        <div className="w-full">
            <div className="flex items-end gap-2 w-full" style={{ height: `${height}px` }}>
                {data.map((item, index) => {
                    const heightPercent = maxValue > 0 ? (item[valueKey] / maxValue) * 100 : 0;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {item[categoryKey]}: {item[valueKey]}
                            </div>

                            <div
                                className={`w-full rounded-t-sm transition-all duration-500 hover:brightness-110 ${color}`}
                                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                            ></div>
                        </div>
                    );
                })}
            </div>
            {/* X-Axis Labels */}
            <div className="flex gap-2 w-full mt-2 border-t border-white/10 pt-2">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 text-center text-xs text-gray-400 truncate px-1" title={item[categoryKey]}>
                        {item[categoryKey]}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleBarChart;
