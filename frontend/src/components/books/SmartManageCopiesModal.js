import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, Filter, Plus, Trash2, AlertCircle, CheckCircle, Layers } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import ConfirmationModal from '../common/ConfirmationModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/components/smart-form-modal.css';

const SmartManageCopiesModal = ({ book, onClose, onUpdate }) => {
    const { t } = useLanguage();
    const [copies, setCopies] = useState([]);
    const [filteredCopies, setFilteredCopies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [adding, setAdding] = useState(false);
    const [numToAdd, setNumToAdd] = useState(1);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [isReady, setIsReady] = useState(false);

    // Fetch Copies
    const fetchCopies = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:17221/api/books/${book.isbn}`);
            const data = await res.json();
            if (data.copies) setCopies(data.copies);
        } catch (error) {
            console.error("Failed to fetch copies", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCopies();
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, [book]);

    // Filtering
    useEffect(() => {
        let result = copies;
        if (filterStatus !== 'All') {
            result = result.filter(c => c.status === filterStatus);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.accession_number.toLowerCase().includes(q) ||
                (c.location && c.location.toLowerCase().includes(q))
            );
        }
        setFilteredCopies(result);
    }, [copies, filterStatus, searchQuery]);

    const handleStatusChange = async (copyId, newStatus) => {
        // Optimistic Update
        const updated = copies.map(c => c.id === copyId ? { ...c, status: newStatus } : c);
        setCopies(updated);

        try {
            await fetch(`http://localhost:17221/api/books/copy/${copyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Update failed", error);
            fetchCopies(); // Revert
        }
    };

    const handleAddCopies = async () => {
        if (numToAdd < 1) return;
        setAdding(true);
        try {
            await fetch(`http://localhost:17221/api/books/${book.isbn}/add-copies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: numToAdd })
            });
            await fetchCopies();
            if (onUpdate) onUpdate();
            setNumToAdd(1);
        } catch (error) {
            console.error("Failed to add copies", error);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteClick = (id) => setConfirmModal({ isOpen: true, id });

    const executeDelete = async () => {
        if (!confirmModal.id) return;
        try {
            const res = await fetch(`http://localhost:17221/api/books/copy/${confirmModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchCopies();
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setConfirmModal({ isOpen: false, id: null });
        }
    };

    if (!isReady) return null;

    return ReactDOM.createPortal(
        <div className="smart-form-overlay" onClick={onClose}>
            <div className="smart-form-modal" onClick={e => e.stopPropagation()} style={{ width: '600px', maxHeight: '80vh' }}>

                {/* Header */}
                <div className="smart-form-header" style={{ padding: '16px 24px' }}>
                    <div className="flex items-center gap-3">
                        <div style={{ width: 32, height: 32, background: 'rgba(159, 122, 234, 0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9f7aea' }}>
                            <Layers size={18} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{t('books.manage.title')}</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, opacity: 0.8 }}>{book.title}</p>
                        </div>
                    </div>
                    <button className="smart-form-close" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Stats Bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ flex: 1, padding: '10px', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('books.manage.total')}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{copies.length}</div>
                    </div>
                    <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'rgba(72, 187, 120, 0.05)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#48bb78', textTransform: 'uppercase' }}>{t('books.manage.avail')}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#48bb78' }}>{copies.filter(c => c.status === 'Available').length}</div>
                    </div>
                    <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'rgba(237, 137, 54, 0.05)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#ed8936', textTransform: 'uppercase' }}>{t('books.manage.issued')}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ed8936' }}>{copies.filter(c => c.status === 'Issued').length}</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div style={{ padding: '12px 24px', display: 'flex', gap: '10px' }}>
                    <div className="input-wrapper" style={{ flex: 1 }}>
                        <input
                            className="smart-input"
                            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                            placeholder={t('books.manage.search')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <div className="input-icon-right"><Search size={14} /></div>
                    </div>
                    <div className="input-wrapper" style={{ width: '160px' }}>
                        <GlassSelect
                            options={[
                                { value: "All", label: t('books.manage.status_all') },
                                { value: "Available", label: t('books.manage.status_avail') },
                                { value: "Issued", label: t('books.manage.status_issued') },
                                { value: "Lost", label: t('books.manage.status_lost') },
                                { value: "Maintenance", label: t('books.manage.status_maint') }
                            ]}
                            value={filterStatus}
                            onChange={setFilterStatus}
                            showSearch={false}
                            small
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="smart-form-body" style={{ padding: '0 24px 24px', gap: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 1, boxShadow: '0 1px 0 var(--glass-border)' }}>
                                <tr>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('books.manage.col_id')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('books.manage.col_loc')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('books.manage.col_status')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('books.manage.col_action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}><div className="spinner-sm mx-auto"></div></td></tr>
                                ) : filteredCopies.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('books.manage.no_copies')}</td></tr>
                                ) : (
                                    filteredCopies.map(copy => (
                                        <tr key={copy.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{copy.accession_number}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{copy.location || '-'}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                {copy.status === 'Issued' ? (
                                                    <span style={{ color: '#ed8936', fontSize: '0.85rem', fontWeight: 600 }}>Issued</span>
                                                ) : (
                                                    <div style={{ width: '130px' }}>
                                                        <GlassSelect
                                                            options={[
                                                                { value: "Available", label: t('books.manage.status_avail'), color: '#48bb78' },
                                                                { value: "Maintenance", label: t('books.manage.status_maint'), color: '#ecc94b' },
                                                                { value: "Lost", label: t('books.manage.status_lost'), color: '#fc8181' },
                                                                { value: "Damaged", label: t('books.manage.status_damaged'), color: '#fc8181' }
                                                            ]}
                                                            value={copy.status}
                                                            onChange={(val) => handleStatusChange(copy.id, val)}
                                                            showSearch={false}
                                                            small
                                                            className="table-glass-select"
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleDeleteClick(copy.id)}
                                                    disabled={copy.status === 'Issued'}
                                                    style={{
                                                        background: 'none', border: 'none', padding: '4px', cursor: copy.status === 'Issued' ? 'not-allowed' : 'pointer',
                                                        color: '#fc8181', opacity: copy.status === 'Issued' ? 0.3 : 0.8
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Add */}
                <div className="smart-form-footer" style={{ justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10"
                            onClick={() => setNumToAdd(Math.max(1, numToAdd - 1))}
                        >-</button>
                        <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{numToAdd}</span>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10"
                            onClick={() => setNumToAdd(numToAdd + 1)}
                        >+</button>
                    </div>
                    <button
                        onClick={handleAddCopies}
                        disabled={adding}
                        className="btn-submit"
                        style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    >
                        {adding ? t('books.manage.adding') : <><Plus size={16} /> {t('books.manage.add_btn')}</>}
                    </button>
                </div>

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={executeDelete}
                    title={t('books.manage.delete_title')}
                    message={t('books.manage.delete_msg')}
                    confirmText={t('books.manage.delete_btn')}
                    isDanger={true}
                />
            </div>
        </div>,
        document.body
    );
};

export default SmartManageCopiesModal;
