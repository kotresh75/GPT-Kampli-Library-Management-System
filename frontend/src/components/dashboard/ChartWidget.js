import React from 'react';

const ChartWidget = ({ title, children }) => {
    return (
        <div className="chart-widget">
            <h3 className="chart-widget-title">
                {title}
            </h3>
            <div className="chart-container">
                {children}
            </div>
        </div>
    );
};

export default ChartWidget;
