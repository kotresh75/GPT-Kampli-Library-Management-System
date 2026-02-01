import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CirculationAnalytics from '../components/analytics/CirculationAnalytics';
import FinancialAnalytics from '../components/analytics/FinancialAnalytics';
import InventoryAnalytics from '../components/analytics/InventoryAnalytics';

// Simple header for print
const PrintHeader = ({ title }) => (
    <div className="mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-bold text-black mb-2">GPTK Library Management System</h1>
        <h2 className="text-xl text-gray-700">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">Generated on: {new Date().toLocaleString()}</p>
    </div>
);

const PrintableReport = () => {
    const [searchParams] = useSearchParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const period = searchParams.get('period') || '30days';

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                // Fetch data for all needed sections
                // Assuming we can re-use the same endpoint or fetch multiple
                // Since ReportsPage fetches based on tab, here we want ALL.
                // We might need to fetch 3 times or if backend supports 'all'
                // Let's assume we fetch sequentially for now to be safe

                const [circRes, finRes, invRes] = await Promise.all([
                    fetch(`http://localhost:17221/api/reports/circulation?period=${period}`),
                    fetch(`http://localhost:17221/api/reports/financial?period=${period}`),
                    fetch(`http://localhost:17221/api/reports/inventory?period=${period}`)
                ]);

                const circData = await circRes.json();

                // For financial and inventory, if they differ significantly in structure, we merge them
                // But previously ReportsPage put them all in "stats".
                // Let's merge them into one 'stats' object if components expect it.
                // CirculationAnalytics expects "stats" (containing trend, summary, top_books)
                // Financial might expect different keys.

                const finData = await finRes.json();
                const invData = await invRes.json();

                // Merge: 
                // We need to pass the specific slice to each component if they expect "stats" to be the root response
                setStats({
                    circulation: circData,
                    financial: finData,
                    inventory: invData
                });

            } catch (err) {
                console.error("Failed to load PDF data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [period]);

    useEffect(() => {
        if (!loading && stats) {
            // Auto print after a small delay to ensure rendering
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, [loading, stats]);

    // Close tab after print
    useEffect(() => {
        const handleAfterPrint = () => {
            window.close();
        };
        window.addEventListener("afterprint", handleAfterPrint);
        return () => window.removeEventListener("afterprint", handleAfterPrint);
    }, []);

    if (loading) return <div className="p-10 text-center">Preparing Report...</div>;

    return (
        <div className="bg-white min-h-screen text-black p-10 print-layout">
            <style>{`
                @media print {
                    @page { margin: 10mm; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                    .page-break { page-break-before: always; }
                    
                    /* Overrides for Chart Components to look good on paper */
                    .text-white { color: #000 !important; }
                    .text-gray-400 { color: #555 !important; }
                    .bg-white\\/5 { background: #f5f5f5 !important; border: 1px solid #ddd !important; }
                }
                .print-layout { max-width: 210mm; margin: 0 auto; } /* A4 width approx */
            `}</style>

            <PrintHeader title={`Library Insights Report (${period})`} />

            {/* Circulation Section */}
            <section className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-l-4 border-blue-600 pl-3">Circulation Analytics</h3>
                {/* We pass specific stats if component expects root, or modified stats */}
                <CirculationAnalytics stats={stats.circulation} loading={false} />
            </section>

            <div className="page-break"></div>

            {/* Financial Section */}
            <section className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-l-4 border-green-600 pl-3">Financial Analytics</h3>
                <FinancialAnalytics stats={stats.financial} />
            </section>

            <div className="page-break"></div>

            {/* Inventory Section */}
            <section className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-l-4 border-purple-600 pl-3">Inventory Analytics</h3>
                <InventoryAnalytics stats={stats.inventory} />
            </section>

            <div className="text-center text-xs text-gray-400 mt-10 border-t pt-2 no-print">
                <p>End of Report</p>
                <button
                    onClick={() => window.print()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                >
                    Print Again
                </button>
            </div>
        </div>
    );
};

export default PrintableReport;
