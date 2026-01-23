import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, RotateCcw, Lock, Calendar, DollarSign, BookOpen, FileText } from 'lucide-react';
import PasswordPromptModal from '../components/common/PasswordPromptModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import GlassSelect from '../components/common/GlassSelect';

const PolicyPage = () => {
    const [activeTab, setActiveTab] = useState('borrowing');
    const [activeProfile, setActiveProfile] = useState('student');
    const [policies, setPolicies] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState({});

    // Notification State
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const showNotification = (title, message, type = 'info') => setNotification({ isOpen: true, title, message, type });
    const closeNotification = () => setNotification(n => ({ ...n, isOpen: false }));

    // Fetch Policies
    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/policy');
            const data = await res.json();
            setPolicies(data);
        } catch (err) {
            showNotification('Error', "Failed to load policies (ERR_POL_LOAD)", 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Change in deeply nested objects
    const handleChange = (section, path, value) => {
        setPolicies(prev => {
            const updated = { ...prev };
            // Simple path handling for now (assuming 1 or 2 levels deep)
            if (section === 'policy_borrowing') {
                updated[section][activeProfile][path] = value;
            } else if (section === 'policy_financial') {
                updated[section][path] = value;
            } else if (section === 'policy_calendar') {
                updated[section][path] = value;
            } else {
                updated[section][path] = value;
            }
            return updated;
        });
        setUnsavedChanges(prev => ({ ...prev, [section]: true }));
    };

    const handleSave = () => {
        setIsPromptOpen(true);
    };

    const confirmSave = async (password) => {
        // Prepare the user ID - robust check
        const user = JSON.parse(localStorage.getItem('user_info')) || JSON.parse(localStorage.getItem('user'));
        const adminId = user ? user.id : null;

        try {
            const res = await fetch('http://localhost:3001/api/policy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates: policies, // We send full policies or just diffs. Sending full for simplicity.
                    admin_id: adminId,
                    admin_password: password
                })
            });
            const data = await res.json();

            if (res.ok) {
                showNotification('Success', `Policy Updated! New Version: ${data.version}`, 'success');
                setIsPromptOpen(false);
                setUnsavedChanges({});
                fetchPolicies(); // Refresh
            } else {
                showNotification('Update Failed', data.error + " (ERR_POL_UPD)", 'error');
                setIsPromptOpen(false); // Close prompt to allow retry or cancel
            }
        } catch (e) {
            showNotification('Network Error', "Network Error (ERR_NET_POL)", 'error');
            setIsPromptOpen(false);
        }
    };

    if (loading) return <div className="p-4">Loading Policies...</div>;
    if (!policies) return <div className="p-4">Error loading policies.</div>;

    const renderBorrowingTab = () => (
        <div className="glass-panel p-4 animate-fade-in">
            <h4 className="border-b border-glass pb-2 mb-4 font-medium flex items-center gap-2">
                <BookOpen size={18} /> Default Borrowing Rules
            </h4>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="field-label">Max Books Allowed</label>
                    <input
                        type="number" className="glass-input w-full"
                        value={policies.policy_borrowing['student']?.maxBooks || 0}
                        onChange={e => handleChange('policy_borrowing', 'maxBooks', parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label className="field-label">Loan Period (Days)</label>
                    <input
                        type="number" className="glass-input w-full"
                        value={policies.policy_borrowing['student']?.loanDays || 0}
                        onChange={e => handleChange('policy_borrowing', 'loanDays', parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label className="field-label">Renewal Period (Days)</label>
                    <input
                        type="number" className="glass-input w-full"
                        placeholder="Same as Loan Period"
                        value={policies.policy_borrowing['student']?.renewalDays || ''}
                        onChange={e => handleChange('policy_borrowing', 'renewalDays', parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label className="field-label">Max Renewals</label>
                    <input
                        type="number" className="glass-input w-full"
                        value={policies.policy_borrowing['student']?.maxRenewals || 0}
                        onChange={e => handleChange('policy_borrowing', 'maxRenewals', parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label className="field-label">Grace Period (Days)</label>
                    <input
                        type="number" className="glass-input w-full"
                        value={policies.policy_borrowing['student']?.gracePeriod || 0}
                        onChange={e => handleChange('policy_borrowing', 'gracePeriod', parseInt(e.target.value))}
                    />
                </div>

                <div className="col-span-2 mt-4 p-4 border border-red-500/30 rounded bg-red-500/5">
                    <label className="field-label text-red-300 flex items-center gap-2"><Lock size={14} /> Auto-Block Threshold</label>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-400">Block borrowing if unpaid fines exceed ₹</span>
                        <input
                            type="number" className="glass-input w-32"
                            value={policies.policy_borrowing['student']?.blockFineThreshold || 0}
                            onChange={e => handleChange('policy_borrowing', 'blockFineThreshold', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinancialTab = () => (
        <div className="glass-panel p-4 animate-fade-in space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="field-label">Daily Fine Rate (₹)</label>
                    <input
                        type="number" step="0.5" className="glass-input w-full"
                        value={policies.policy_financial.dailyFineRate}
                        onChange={e => handleChange('policy_financial', 'dailyFineRate', parseFloat(e.target.value))}
                    />
                </div>
                <div>
                    <label className="field-label">Max Fine Cap (Per Student)</label>
                    <input
                        type="number" className="glass-input w-full"
                        value={policies.policy_financial.maxFinePerStudent}
                        onChange={e => handleChange('policy_financial', 'maxFinePerStudent', parseInt(e.target.value))}
                    />
                </div>
            </div>

            <div>
                <h4 className="border-b border-glass pb-2 mb-4 font-medium">Damage & Lost Book Fines</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="field-label">Fine Amount: Damaged Book</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">₹</span>
                            <input
                                type="number" className="glass-input w-full"
                                value={policies.policy_financial.damagedFineAmount || 100}
                                onChange={e => handleChange('policy_financial', 'damagedFineAmount', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Fine Amount: Lost Book</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">₹</span>
                            <input
                                type="number" className="glass-input w-full"
                                value={policies.policy_financial.lostFineAmount || 500}
                                onChange={e => handleChange('policy_financial', 'lostFineAmount', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={policies.policy_financial.allowStaffEditAmount}
                        onChange={e => handleChange('policy_financial', 'allowStaffEditAmount', e.target.checked)}
                    />
                    <span>Allow Staff to Edit Fine Amounts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={policies.policy_financial.allowStaffWaive}
                        onChange={e => handleChange('policy_financial', 'allowStaffWaive', e.target.checked)}
                    />
                    <span>Allow Staff to Waive Fines</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={policies.policy_financial.allowStaffEditDamageLost || false}
                        onChange={e => handleChange('policy_financial', 'allowStaffEditDamageLost', e.target.checked)}
                    />
                    <span>Allow Staff to Edit Damage/Lost Fines</span>
                </label>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Lock size={24} className="text-accent" /> Library Rules & Policy
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Version: {policies.policy_version ? `v${policies.policy_version}` : 'v1.0'}</p>
                </div>
                <div className="flex gap-3">
                    <button className="icon-btn-ghost flex items-center gap-2" onClick={fetchPolicies}>
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button className="primary-glass-btn flex items-center gap-2" onClick={handleSave}>
                        <Save size={16} /> Save & Publish
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-glass">
                {[
                    { id: 'borrowing', icon: BookOpen, label: 'Borrowing Rules' },
                    { id: 'financial', icon: DollarSign, label: 'Financials' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-all rounded-t-lg
                            ${activeTab === tab.id
                                ? 'bg-white/10 text-white border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'borrowing' && renderBorrowingTab()}
                {activeTab === 'financial' && renderFinancialTab()}
            </div>

            <PasswordPromptModal
                isOpen={isPromptOpen}
                onClose={() => setIsPromptOpen(false)}
                onSuccess={confirmSave}
                message="This action will modify global system policies. Please confirm your identity."
            />

            {/* Notification Modal */}
            <ConfirmationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                onConfirm={closeNotification}
                title={notification.title}
                message={notification.message}
                confirmText="OK"
                cancelText=""
                isDanger={notification.type === 'error'}
            />
        </div>
    );
};

export default PolicyPage;
