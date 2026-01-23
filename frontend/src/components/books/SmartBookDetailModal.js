import React, { useState, useEffect } from 'react';
import {
    X, BookOpen, Clock, Users, Edit, Layers, Copy, Check,
    Calendar, AlertTriangle, Book, CreditCard, User, Bookmark
} from 'lucide-react';
import '../../styles/components/smart-book-detail.css';

const SmartBookDetailModal = ({ book, onClose, onEdit, onManageCopies }) => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, circulation, history
    const [holders, setHolders] = useState([]);
    const [loadingHolders, setLoadingHolders] = useState(false);

    // History State
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [copiedIsbn, setCopiedIsbn] = useState(false);

    // Fetch holders when circulation tab is active
    useEffect(() => {
        if (activeTab === 'circulation' && book?.isbn) {
            setLoadingHolders(true);
            const token = localStorage.getItem('auth_token');
            fetch(`http://localhost:3001/api/circulation/holders/${book.isbn}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setHolders(data);
                    else setHolders([]);
                })
                .catch(console.error)
                .finally(() => setLoadingHolders(false));
        }
    }, [activeTab, book]);

    // Fetch history when history tab is active
    useEffect(() => {
        if (activeTab === 'history' && book?.isbn) {
            setLoadingHistory(true);
            const token = localStorage.getItem('auth_token');
            // Using isbn param for strict filtering
            fetch(`http://localhost:3001/api/circulation/history?isbn=${encodeURIComponent(book.isbn)}&limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setHistory(data);
                    else setHistory([]);
                })
                .catch(console.error)
                .finally(() => setLoadingHistory(false));
        }
    }, [activeTab, book]);

    if (!book) return null;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedIsbn(true);
        setTimeout(() => setCopiedIsbn(false), 2000);
    };

    const formatDate = (ds) => {
        if (!ds) return '-';
        return new Date(ds).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Calculate availability percentage for ring
    const availabilityPercent = book.total_copies > 0
        ? Math.round(((book.available_copies || 0) / book.total_copies) * 100)
        : 0;

    // Ring calculation (circumference = 2 * Ï€ * 54 â‰ˆ 339)
    const circumference = 339;
    const strokeDashoffset = circumference - (availabilityPercent / 100) * circumference;
    const ringColor = availabilityPercent > 50 ? 'var(--primary-color)' : (availabilityPercent > 0 ? '#ed8936' : '#fc8181');

    return (
        <div className="smart-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="smart-detail-modal">
                {/* Hero Section */}
                <div className="detail-hero" style={{
                    backgroundImage: `url(${book.cover_image_url || ''})`
                }}>
                    <div className="hero-overlay" />

                    <button className="hero-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className="hero-content">
                        <div className="book-cover-large">
                            {book.cover_image_url ? (
                                <img src={book.cover_image_url} alt={book.title} />
                            ) : (
                                <div className="book-cover-placeholder">
                                    <BookOpen size={40} />
                                </div>
                            )}
                        </div>
                        <div className="hero-info">
                            <h1 className="hero-title">{book.title}</h1>
                            <div className="hero-meta" style={{ marginBottom: '12px' }}>
                                <span>{book.author}</span>
                                <span style={{ opacity: 0.5 }}>•</span>
                                <span style={{ opacity: 0.8 }}>{book.publisher}</span>
                            </div>
                            <div className="hero-meta">
                                <span className="hero-badge">{book.category || 'General'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => copyToClipboard(book.isbn)}>
                                    <span style={{ opacity: 0.7 }}>ISBN:</span>
                                    <span className="font-mono">{book.isbn}</span>
                                    {copiedIsbn ? <Check size={14} color="#48bb78" /> : <Copy size={14} style={{ opacity: 0.5 }} />}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="smart-tabs">
                    <button
                        className={`smart-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <Book size={18} /> Overview
                    </button>
                    <button
                        className={`smart-tab-btn ${activeTab === 'circulation' ? 'active' : ''}`}
                        onClick={() => setActiveTab('circulation')}
                    >
                        <Users size={18} /> Holders
                        {holders.length > 0 && <span className="text-xs bg-white/10 px-2 rounded-full">{holders.length} active</span>}
                    </button>
                    <button
                        className={`smart-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <Clock size={18} /> History
                    </button>
                </div>

                {/* Content Area */}
                <div className="detail-content">
                    {activeTab === 'overview' && (
                        <div className="detail-grid">
                            <div className="detail-left">
                                <div className="detail-card">
                                    <div className="card-header">
                                        <h3 className="card-title">Bibliographic Information</h3>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">ISBN-13</span>
                                        <span className="data-value font-mono">{book.isbn}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Category</span>
                                        <span className="data-value">{book.category}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Publisher</span>
                                        <span className="data-value">{book.publisher || '-'}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Price</span>
                                        <span className="data-value">{book.price ? `$${book.price}` : '-'}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Full Title</span>
                                        <span className="data-value">{book.title}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-right">
                                <div className="detail-card" style={{ textAlign: 'center' }}>
                                    <h3 className="card-title" style={{ justifyContent: 'center', marginBottom: '20px' }}>Current Availability</h3>

                                    <div className="availability-ring">
                                        <svg width="120" height="120" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="54" className="ring-bg" />
                                            <circle cx="60" cy="60" r="54" className="ring-value"
                                                style={{ strokeDasharray: circumference, strokeDashoffset, stroke: ringColor }}
                                            />
                                        </svg>
                                        <div className="ring-content">
                                            <span className="ring-number" style={{ color: ringColor }}>
                                                {book.available_copies || 0}
                                            </span>
                                            <span className="ring-label">Available</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{book.total_copies}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ed8936' }}>
                                                {book.total_copies - (book.available_copies || 0)}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Issued</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="action-grid">
                                    <button className="smart-action-btn primary" onClick={() => onEdit(book)}>
                                        <Edit size={16} /> Edit Book Details
                                    </button>
                                    <button className="smart-action-btn secondary" onClick={() => onManageCopies(book)}>
                                        <Layers size={16} /> Manage Copies
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'circulation' && (
                        <div>
                            {loadingHolders ? (
                                <div className="p-10 flex justify-center"><div className="spinner-lg"></div></div>
                            ) : holders.length === 0 ? (
                                <div className="smart-import-empty">
                                    <Users size={48} />
                                    <p>No active holders.</p>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>All copies are currently on the shelf.</span>
                                </div>
                            ) : (
                                <div className="holder-list">
                                    {holders.map((loan, idx) => (
                                        <div key={loan.transaction_id || idx} className="holder-item">
                                            <div className="holder-info">
                                                <h4>{loan.student_name}</h4>
                                                <div className="holder-meta">
                                                    {loan.register_number} • {loan.department_name}
                                                </div>
                                            </div>
                                            <div className="holder-status">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <span className="text-xs text-[var(--text-secondary)]">Copy:</span>
                                                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-xs">#{loan.accession_number}</span>
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    {loan.overdue_days > 0 ? (
                                                        <span className="copy-badge lost">
                                                            Overdue {Math.floor(loan.overdue_days)} days
                                                        </span>
                                                    ) : (
                                                        <span className="copy-badge available">
                                                            Due: {formatDate(loan.due_date)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            {loadingHistory ? (
                                <div className="p-10 flex justify-center"><div className="spinner-lg"></div></div>
                            ) : history.length === 0 ? (
                                <div className="smart-import-empty">
                                    <Clock size={48} />
                                    <p>No circulation history.</p>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>This book has no recorded transactions yet.</span>
                                </div>
                            ) : (
                                <div className="holder-list">
                                    {history.map((tx, idx) => (
                                        <div key={tx.id || idx} className="holder-item">
                                            <div className="holder-info">
                                                <h4>{tx.student_name || 'Unknown Student'}</h4>
                                                <div className="holder-meta">
                                                    {tx.register_number} {tx.department_name ? `• ${tx.department_name}` : ''}
                                                </div>
                                                <div className="holder-meta" style={{ marginTop: '4px', opacity: 0.7 }}>
                                                    {formatDate(tx.issue_date)} — {tx.status}
                                                </div>
                                            </div>
                                            <div className="holder-status">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <span className="text-xs text-[var(--text-secondary)]">Copy:</span>
                                                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-xs">#{tx.accession_number}</span>
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    <span className={`copy-badge ${tx.status === 'RETURN' ? 'available' :
                                                        tx.status === 'ISSUE' ? 'borrowed' :
                                                            'lost'
                                                        }`}>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartBookDetailModal;
