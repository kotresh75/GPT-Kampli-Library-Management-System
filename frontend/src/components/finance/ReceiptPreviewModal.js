import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';

const ReceiptPreviewModal = ({ isOpen, onClose, transaction }) => {
    const printRef = useRef();

    if (!isOpen || !transaction) return null;

    // Helper for DD/MM/YYYY format
    const formatReceiptDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-GB');
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=400');
        printWindow.document.write('<html><head><title>Receipt</title>');
        // Inject styles for print
        printWindow.document.write(`
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
                body {
                    font-family: 'Courier Prime', 'Courier New', monospace;
                    background-color: #fff;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                }
                .receipt-container {
                    width: 320px;
                    padding: 0;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .text-sm { font-size: 12px; }
                .text-xs { font-size: 10px; }
                .border-b { border-bottom: 1px dashed #000; }
                .border-t { border-top: 1px dashed #000; }
                .my-2 { margin-top: 8px; margin-bottom: 8px; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .mb-1 { margin-bottom: 4px; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write('<div class="receipt-container">');
        printWindow.document.write(content);
        printWindow.document.write('</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-0 relative animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-4 border-b border-glass flex justify-between items-center bg-black/20">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Printer size={18} className="text-gray-400" /> Transaction Receipt
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Receipt Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#2d3436] flex justify-center">

                    {/* The Thermal Receipt */}
                    <div ref={printRef} className="bg-white text-black p-6 w-[320px] shadow-xl relative receipt-paper" style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}>

                        {/* ZigZag Top */}
                        <div className="absolute top-[-5px] left-0 w-full h-[10px] bg-white" style={{
                            clipPath: 'polygon(0% 100%, 2% 0%, 4% 100%, 6% 0%, 8% 100%, 10% 0%, 12% 100%, 14% 0%, 16% 100%, 18% 0%, 20% 100%, 22% 0%, 24% 100%, 26% 0%, 28% 100%, 30% 0%, 32% 100%, 34% 0%, 36% 100%, 38% 0%, 40% 100%, 42% 0%, 44% 100%, 46% 0%, 48% 100%, 50% 0%, 52% 100%, 54% 0%, 56% 100%, 58% 0%, 60% 100%, 62% 0%, 64% 100%, 66% 0%, 68% 100%, 70% 0%, 72% 100%, 74% 0%, 76% 100%, 78% 0%, 80% 100%, 82% 0%, 84% 100%, 86% 0%, 88% 100%, 90% 0%, 92% 100%, 94% 0%, 96% 100%, 98% 0%, 100% 100%)'
                        }}></div>

                        {/* Content */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold uppercase tracking-wider mb-1">GPTK Library</h2>
                            <div className="text-xs text-gray-600">Govt Polytechnic, Kampli</div>
                        </div>

                        <div className="text-center border-b border-black border-dashed pb-2 mb-4">
                            <h3 className="font-bold text-lg">PAYMENT RECEIPT</h3>
                        </div>

                        <div className="text-sm space-y-1 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Receipt #:</span>
                                <span className="font-bold text-xs">{transaction.receipt_number || transaction.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span>{formatReceiptDate(transaction.date || new Date())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Student:</span>
                                <span className="font-bold text-right max-w-[160px]">{transaction.student_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Reg No:</span>
                                <span>{transaction.roll_number}</span>
                            </div>
                        </div>

                        <div className="border-t border-b border-black border-dashed py-2 mb-4 text-sm">
                            <div className="flex justify-between font-bold mb-2">
                                <span>Description</span>
                                <span>Amount</span>
                            </div>

                            {transaction.items && transaction.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between mb-1">
                                    <span className="text-gray-800 max-w-[200px]">{item.description}</span>
                                    <span>₹{item.amount.toFixed(2)}</span>
                                </div>
                            ))}
                            {!transaction.items && (
                                <div className="flex justify-between">
                                    <span>Fine Payment</span>
                                    <span>₹{transaction.amount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold mb-6">
                            <span>TOTAL PAID:</span>
                            <span>₹{transaction.total ? transaction.total.toFixed(2) : transaction.amount.toFixed(2)}</span>
                        </div>

                        <div className="text-sm mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Mode:</span>
                                <span className="uppercase">{transaction.payment_method || 'Cash'}</span>
                            </div>
                        </div>

                        {/* Mock Barcode */}
                        <div className="text-center opacity-80 mb-4">
                            <div className="h-12 bg-black w-[80%] mx-auto mb-1" style={{
                                maskImage: 'repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 4px)',
                                WebkitMaskImage: 'repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 4px)'
                            }}></div>
                            <div className="text-[10px] tracking-[4px]">{transaction.id.replace('REC-', '')}</div>
                        </div>

                        <div className="text-center text-[10px] text-gray-500 mt-4">
                            <div>Thank you for clearing your dues!</div>
                            <div>Computer Generated Receipt</div>
                        </div>

                        {/* ZigZag Bottom */}
                        <div className="absolute bottom-[-5px] left-0 w-full h-[10px] bg-white" style={{
                            clipPath: 'polygon(0% 0%, 2% 100%, 4% 0%, 6% 100%, 8% 0%, 10% 100%, 12% 0%, 14% 100%, 16% 0%, 18% 100%, 20% 0%, 22% 100%, 24% 0%, 26% 100%, 28% 0%, 30% 100%, 32% 0%, 34% 100%, 36% 0%, 38% 100%, 40% 0%, 42% 100%, 44% 0%, 46% 100%, 48% 0%, 50% 100%, 52% 0%, 54% 100%, 56% 0%, 58% 100%, 60% 0%, 62% 100%, 64% 0%, 66% 100%, 68% 0%, 70% 100%, 72% 0%, 74% 100%, 76% 0%, 78% 100%, 80% 0%, 82% 100%, 84% 0%, 86% 100%, 88% 0%, 90% 100%, 92% 0%, 94% 100%, 96% 0%, 98% 100%, 100% 0%)'
                        }}></div>
                    </div>

                </div>

                <div className="p-4 border-t border-glass flex justify-end gap-3 bg-black/20">
                    <button onClick={onClose} className="glass-btn px-4 py-2 text-sm text-gray-300 hover:text-white">
                        Close
                    </button>
                    <button onClick={handlePrint} className="primary-glass-btn flex items-center gap-2 px-6">
                        <Printer size={16} /> Print Receipt
                    </button>
                </div>
            </div>

            {/* Import Google Font for Thermal Look */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
            `}</style>
        </div>
    );
};

export default ReceiptPreviewModal;
