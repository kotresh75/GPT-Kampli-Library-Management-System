import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { IndianRupee, Clock, CheckCircle, AlertCircle, FileText, Filter, Search, Trash2 } from 'lucide-react';
import ReceiptPreviewModal from '../components/finance/ReceiptPreviewModal';
import ConfirmationModal from '../components/common/ConfirmationModal'; // Assuming exists

const FineManagementPage = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFines, setSelectedFines] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [currentReceiptData, setCurrentReceiptData] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'waive', id: ... }

    useEffect(() => {
        fetchFines();
    }, [activeTab]);

    const fetchFines = async () => {
        setLoading(true);
        try {
            // Mapping tabs to status: pending -> Unpaid, history -> Paid/Waived
            const status = activeTab === 'pending' ? 'Unpaid' : '';
            const url = status
                ? `http://localhost:3001/api/fines?status=${status}`
                : `http://localhost:3001/api/fines`; // History fetches all or just paid/waived

            const res = await fetch(url);
            const data = await res.json();

            // If history tab, maybe filter out Unpaid locally or backend supports multiple status? 
            // For now backend supports single status filter. 
            // Let's filter client side if history tab.
            if (Array.isArray(data)) {
                // If history tab, filter out Unpaid locally
                if (activeTab === 'history') {
                    setFines(data.filter(f => f.status !== 'Unpaid'));
                } else {
                    setFines(data);
                }
            } else {
                console.error("Fines API returned non-array:", data);
                setFines([]); // Safe fallback to prevent runtime crash
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCollect = async () => {
        if (selectedFines.length === 0) return;

        // Group logic or simple single student validation could be here
        // For MVP, just send IDs.
        try {
            const res = await fetch('http://localhost:3001/api/fines/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fine_ids: selectedFines,
                    payment_method: 'Cash', // Dropdown in future
                    collector_id: 'current-staff-id'
                })
            });

            if (res.ok) {
                // Prepare receipt data
                const paidFines = fines.filter(f => selectedFines.includes(f.id));
                const total = paidFines.reduce((sum, f) => sum + f.amount, 0);
                const studentName = paidFines[0]?.student_name || 'Student'; // Assuming all same student

                setCurrentReceiptData({
                    id: 'REC-' + Date.now(),
                    student_name: studentName,
                    roll_number: paidFines[0]?.roll_number,
                    items: paidFines.map(f => ({ description: `${f.reason} - ${f.book_title || ''}`, amount: f.amount })),
                    total: total,
                    payment_method: 'Cash'
                });
                setShowReceipt(true);

                fetchFines(); // Refresh
                setSelectedFines([]);
            } else {
                alert("Payment Failed (ERR_FINE_PAY)");
            }
        } catch (e) {
            alert("Error processing payment (ERR_FINE_PROC)");
        }
    };

    const handleWaive = async (fineId) => {
        const reason = prompt("Enter reason for waiving:");
        if (!reason) return;

        try {
            const res = await fetch('http://localhost:3001/api/fines/waive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fine_id: fineId,
                    reason: reason,
                    staff_id: 'current-staff-id'
                })
            });
            if (res.ok) fetchFines();
        } catch (e) {
            alert("Error waiving fine (ERR_FINE_WAIVE)");
        }
    };

    const toggleSelect = (id) => {
        setSelectedFines(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredFines = fines.filter(f =>
        f.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col p-6 text-white overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <IndianRupee size={24} className="text-accent" /> Fine Management
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage overdue payments and history</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            className="glass-input pl-10"
                            placeholder="Find Student..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-glass">
                {['pending', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedFines([]); }}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-all rounded-t-lg capitalize
                            ${activeTab === tab
                                ? 'bg-white/10 text-white border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab === 'pending' ? <Clock size={16} /> : <FileText size={16} />} {tab === 'pending' ? 'Pending Dues' : 'Fine History'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto glass-panel p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-gray-300 sticky top-0 backdrop-blur-md">
                        <tr>
                            {activeTab === 'pending' && <th className="p-4 w-10">Select</th>}
                            <th className="p-4">Student</th>
                            <th className="p-4">Book / Reason</th>
                            <th className="p-4">Due Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-glass/20">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center">Loading Data...</td></tr>
                        ) : filteredFines.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">No records found.</td></tr>
                        ) : (
                            filteredFines.map(fine => (
                                <tr key={fine.id} className="hover:bg-white/5 transition-colors">
                                    {activeTab === 'pending' && (
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedFines.includes(fine.id)}
                                                onChange={() => toggleSelect(fine.id)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="p-4">
                                        <div className="font-medium">{fine.student_name}</div>
                                        <div className="text-xs text-gray-400">{fine.roll_number}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">{fine.book_title || 'N/A'}</div>
                                        <div className="text-xs text-amber-300">{fine.reason}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {fine.due_date ? formatDate(fine.due_date) : '-'}
                                    </td>
                                    <td className="p-4 font-bold text-red-300">
                                        ₹{fine.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${fine.status === 'Paid' ? 'bg-green-500/20 text-green-300' : fine.status === 'Waived' ? 'bg-gray-500/20 text-gray-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {fine.status}
                                        </span>
                                        {fine.payment_date && <div className="text-xs text-gray-500 mt-1">{formatDate(fine.payment_date)}</div>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {activeTab === 'pending' ? (
                                            <button
                                                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 px-3 py-1.5 rounded transition-colors"
                                                onClick={() => handleWaive(fine.id)}
                                            >
                                                Waive Off
                                            </button>
                                        ) : (
                                            <button
                                                className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded transition-colors"
                                                onClick={() => {
                                                    setCurrentReceiptData({
                                                        id: `REC-REF-${fine.id.slice(0, 5)}`,
                                                        student_name: fine.student_name,
                                                        roll_number: fine.roll_number,
                                                        amount: fine.amount,
                                                        reason: fine.reason,
                                                        payment_method: fine.payment_method
                                                    });
                                                    setShowReceipt(true);
                                                }}
                                            >
                                                View Receipt
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bulk Actions for Pending Tab */}
            {activeTab === 'pending' && selectedFines.length > 0 && (
                <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-gray-900 border border-glass p-4 rounded-lg shadow-xl animate-bounce-in">
                    <div className="text-sm">
                        <span className="font-bold">{selectedFines.length}</span> Selected
                        <span className="mx-2 text-gray-500">|</span>
                        Total: <span className="font-bold text-accent">₹{filteredFines.filter(f => selectedFines.includes(f.id)).reduce((s, f) => s + f.amount, 0).toFixed(2)}</span>
                    </div>
                    <button className="primary-glass-btn flex items-center gap-2" onClick={handleCollect}>
                        <IndianRupee size={18} /> Collect Payment
                    </button>
                </div>
            )}

            <ReceiptPreviewModal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                transaction={currentReceiptData}
            />
        </div>
    );
};

export default FineManagementPage;
