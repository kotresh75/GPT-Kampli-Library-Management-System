import React, { useState } from 'react';
import { CreditCard, User, BookOpen, AlertCircle, CheckCircle, XCircle, Loader, Trash2, ScanLine, ArrowRight } from 'lucide-react';
import GlassAutocomplete from '../common/GlassAutocomplete';
import ConfirmationModal from '../common/ConfirmationModal';
import StatusModal from '../common/StatusModal';

const IssueTab = () => {
    // Left Panel State
    const [identifier, setIdentifier] = useState('');
    const [student, setStudent] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loadingStudent, setLoadingStudent] = useState(false);

    // Book Scan State
    const [bookInput, setBookInput] = useState('');
    const [cart, setCart] = useState([]);

    // Feedback
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [inlineMessage, setInlineMessage] = useState(null);

    const showError = (msg) => setStatusModal({ isOpen: true, type: 'error', title: 'Error', message: msg });
    const showSuccess = (msg) => setStatusModal({ isOpen: true, type: 'success', title: 'Success', message: msg });

    // Focus Management
    const [activeField, setActiveField] = useState('student'); // 'student' | 'book'

    // --- Student Logic ---

    // 1. Search Students for Dropdown
    const searchStudents = async (query) => {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:3001/api/circulation/search/students?q=${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    };

    // 2. Validate Selected/Scanned Student
    const validateStudent = async (idOrRegNo) => {
        if (!idOrRegNo) return;
        setLoadingStudent(true);
        setLoadingStudent(true);
        setAlerts([]);
        setStudent(null);
        setCart([]);

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/circulation/validate-borrower/${idOrRegNo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                if (data.valid) {
                    setStudent(data.student);
                    setActiveField('book'); // Move focus
                } else {
                    setStudent(data.student);
                    setStudent(data.student);
                    setAlerts(data.alerts || []);
                    showError("Student blocked from borrowing. See alerts.");
                }
            } else {
                showError(data.error || "Student validation failed");
            }
        } catch (err) {
            showError("Network Error");
        } finally {
            setLoadingStudent(false);
        }
    };

    // --- Book Logic ---

    // 1. Search Books for Dropdown
    const searchBooks = async (query) => {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:3001/api/circulation/search/books?q=${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return data.map(b => ({ ...b, label: `${b.title} (${b.isbn})` }));
    };

    // 2. Handle Add (Raw Scan OR Selection)
    const handleBookAdd = async (valOrItem) => {
        let code = '';
        if (typeof valOrItem === 'string') {
            code = valOrItem; // Raw scan
        } else {
            code = valOrItem.isbn; // Object from search
        }

        if (!code) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/circulation/resolve-scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });
            const data = await res.json();

            if (res.ok && data.resolved) {
                const acc = data.value;

                if (cart.includes(acc)) {
                    showError(`Item ${acc} already in cart`);
                    setBookInput('');
                    return;
                }

                setCart([...cart, acc]);
                if (data.type === 'ISBN_RESOLVED') {
                    setInlineMessage({ type: 'success', text: `Resolved ISBN to copy: ${acc}` });
                    setTimeout(() => setInlineMessage(null), 3000);
                }
                setBookInput('');
            } else {
                showError(data.error || "Item not found or unavailable");
            }
        } catch (e) {
            showError("Network Error");
        }
    };

    // Remove from Cart
    const removeFromCart = (acc) => {
        setCart(cart.filter(item => item !== acc));
    };

    // --- Issue Logic ---
    const handleConfirmIssue = async () => {
        if (!student || cart.length === 0) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/circulation/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    student_id: student.id,
                    copy_accession_numbers: cart
                })
            });
            const data = await res.json();

            if (res.ok) {
                const failures = data.results.filter(r => r.status === 'Failed');
                if (failures.length > 0) {
                    showError(`Some items failed: ${failures.map(f => `${f.accession} (${f.reason})`).join(', ')}`);
                    const successfulAccs = data.results.filter(r => r.status === 'Success').map(r => r.accession);
                    setCart(cart.filter(acc => !successfulAccs.includes(acc)));
                } else {
                    showSuccess(`Issued ${cart.length} books successfully.`);
                    setCart([]);
                    setStudent(null);
                    setIdentifier('');
                    setActiveField('student');
                }
            } else {
                showError(data.error || "Issue failed");
            }
        } catch (err) {
            showError("Network Error");
        }
    };

    const handleStudentSelect = async (studentItem) => {
        const regNo = studentItem.register_number;
        setIdentifier(regNo);
        await validateStudent(regNo);
    };

    const handleClearStudent = () => {
        const resetState = () => {
            setStudent(null);
            setIdentifier('');
            setCart([]);
            setAlerts([]);
            setActiveField('student');
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        };

        if (cart.length > 0) {
            setConfirmModal({
                isOpen: true,
                title: "Clear Current Session?",
                message: "Changing the student now will remove all scanned items from the cart. Are you sure you want to proceed?",
                isDanger: true,
                confirmText: "Yes, Clear Session",
                cancelText: "Cancel",
                onConfirm: resetState
            });
        } else {
            resetState();
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '24px' }}>

            {/* --- LEFT COLUMN: SCANNING & INPUTS --- */}
            <div style={{ flex: '7', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Section 1: Identify Borrower */}
                <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <User size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Identify Borrower</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scan student ID card or search by name</p>
                        </div>
                    </div>

                    {!student ? (
                        <div style={{ maxWidth: '500px' }}>
                            <GlassAutocomplete
                                placeholder="Scan Register No..."
                                value={identifier}
                                onChange={setIdentifier}
                                onSearch={searchStudents}
                                onSelect={handleStudentSelect}
                                onEnterRaw={validateStudent}
                                renderItem={(s) => (
                                    <div className="py-1">
                                        <div className="font-bold text-white">{s.full_name}</div>
                                        <div className="text-xs text-gray-400">{s.register_number} • {s.department_name}</div>
                                    </div>
                                )}
                                autoFocus={activeField === 'student'}
                                icon={User}
                            />
                        </div>
                    ) : (
                        // Active Student Card
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <h2 className="text-sm font-bold text-white whitespace-nowrap">{student.full_name}</h2>
                                <span className="text-gray-500">•</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-white/80 font-mono text-xs whitespace-nowrap">{student.register_number}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-sm text-gray-400 whitespace-nowrap">{student.department_code || student.department_name}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-sm text-gray-400 whitespace-nowrap">Sem {student.semester}</span>
                            </div>

                            <button
                                onClick={handleClearStudent}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/5"
                            >
                                <XCircle size={16} /> Change
                            </button>
                        </div>
                    )}

                    {/* Alerts / Loading Overlay */}
                    {loadingStudent && <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"><Loader className="animate-spin text-white" /></div>}
                </div>

                {/* Section 2: Book Scanning */}
                <div className={`glass-panel transition-all duration-300 ${!student || alerts.length > 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`} style={{ padding: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <BookOpen size={24} className="text-pink-400" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Scan Books</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scan barcode or enter accession number</p>
                        </div>
                    </div>

                    <div style={{ maxWidth: '600px' }}>
                        <GlassAutocomplete
                            placeholder="Scan Book Barcode..."
                            value={bookInput}
                            onChange={setBookInput}
                            onSearch={searchBooks}
                            onSelect={handleBookAdd}
                            onEnterRaw={handleBookAdd}
                            renderItem={(b) => (
                                <div className="py-1">
                                    <div className="font-bold text-white">{b.title}</div>
                                    <div className="text-xs text-gray-400">{b.author} • {b.isbn}</div>
                                </div>
                            )}
                            autoFocus={activeField === 'book'}
                            icon={ScanLine}
                            disabled={!student || alerts.length > 0}
                        />
                        <div className="flex justify-between mt-2 px-1 h-6">
                            {inlineMessage ? (
                                <span className={`text-xs font-bold ${inlineMessage.type === 'success' ? 'text-green-400' : 'text-red-400'} animate-in fade-in slide-in-from-top-1`}>
                                    {inlineMessage.type === 'success' && <CheckCircle size={12} className="inline mr-1" />}
                                    {inlineMessage.text}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500">Press Enter to add to cart</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        {alerts.length > 0 && (
                            <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-3 rounded-xl mt-4">
                                <div className="flex items-center gap-2 font-bold mb-2">
                                    <AlertCircle size={18} /> Account Alerts
                                </div>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {alerts.map((msg, i) => <li key={i}>{msg}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN: SUMMARY --- */}
            <div className="glass-panel" style={{ flex: '3', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                <div className="p-5 border-b border-white/10 bg-white/5">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <CreditCard size={20} className="text-purple-400" /> Checkout Cart
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                            <BookOpen size={48} className="mb-3" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((acc, idx) => (
                            <div key={idx} className="group flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                        <BookOpen size={16} />
                                    </div>
                                    <span className="font-mono text-sm font-semibold truncate">{acc}</span>
                                </div>
                                <button
                                    onClick={() => removeFromCart(acc)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t border-white/10 bg-white/5">
                    <div className="flex justify-between mb-4 text-sm text-gray-400">
                        <span>Total Items</span>
                        <span className="text-white font-bold">{cart.length}</span>
                    </div>
                    <button
                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
                        disabled={!student || alerts.length > 0 || cart.length === 0}
                        onClick={handleConfirmIssue}
                    >
                        Complete Issue <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                onConfirm={confirmModal.onConfirm}
            />

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />
        </div>
    );
};

export default IssueTab;
