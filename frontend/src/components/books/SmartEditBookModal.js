import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, BookOpen, Lock } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/components/smart-form-modal.css';

const SmartEditBookModal = ({ book, onClose, onUpdated }) => {
    const { t } = useLanguage();
    // 1. Data State (Pre-filled)
    const [formData, setFormData] = useState({
        isbn: book.isbn,
        title: book.title,
        author: book.author || '',
        publisher: book.publisher || '',
        dept_id: book.dept_id || '',
        price: book.price || '',
        total_copies: book.total_copies,
        cover_image_url: book.cover_image_url || '',
        shelf_location: book.shelf_location || ''
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isReady, setIsReady] = useState(false);

    // 2. Fetch Departments & Layout Delay
    useEffect(() => {
        fetch('http://localhost:3001/api/departments')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setDepartments(data) : [])
            .catch(console.error);

        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 3. Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDeptChange = (value) => {
        setFormData(prev => ({ ...prev, dept_id: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`http://localhost:3001/api/books/${book.isbn}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('books.modal.err_update'));

            onUpdated();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isReady) return null;

    return ReactDOM.createPortal(
        <div className="smart-form-overlay" onClick={onClose}>
            <div className="smart-form-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="smart-form-header">
                    <h2>
                        <div style={{ width: 32, height: 32, background: 'var(--primary-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={18} color="white" />
                        </div>
                        {t('books.modal.title_edit')}
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {/* ISBN Section (Read Only) */}
                    <div className="form-group">
                        <label className="form-label">{t('books.modal.isbn_locked')}</label>
                        <div className="input-wrapper">
                            <input
                                value={formData.isbn}
                                className="smart-input"
                                disabled
                            />
                            <div className="input-icon-right">
                                <Lock size={16} />
                            </div>
                        </div>
                    </div>

                    <form id="edit-book-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>
                        {error && <div className="validation-msg">{error}</div>}

                        {/* Title & Author */}
                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">{t('books.modal.title')}</label>
                                <input
                                    name="title"
                                    className="smart-input"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder={t('books.modal.title_placeholder')}
                                    required
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">{t('books.modal.author')}</label>
                                <input
                                    name="author"
                                    className="smart-input"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder={t('books.modal.author_placeholder')}
                                    required
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="form-group">
                            <label className="form-label">{t('books.modal.dept')}</label>
                            <GlassSelect
                                options={departments.map(d => ({ value: d.id, label: d.name }))}
                                value={formData.dept_id}
                                onChange={handleDeptChange}
                                placeholder={t('books.modal.dept_select')}
                            />
                        </div>

                        {/* Details Grid */}
                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">{t('books.modal.publisher')}</label>
                                <input
                                    name="publisher"
                                    className="smart-input"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">{t('books.modal.price')}</label>
                                <input
                                    name="price"
                                    type="number"
                                    className="smart-input"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">{t('books.modal.qty_readonly')}</label>
                                <div className="input-wrapper">
                                    <input
                                        value={formData.total_copies}
                                        className="smart-input"
                                        disabled
                                        title="Use 'Manage Copies' to change quantity"
                                    />
                                    <div className="input-icon-right">
                                        <Lock size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cover & Location */}
                        <div className="form-row">
                            <div className="form-col form-group" style={{ flex: 2 }}>
                                <label className="form-label">{t('books.modal.cover')}</label>
                                <input
                                    name="cover_image_url"
                                    className="smart-input"
                                    value={formData.cover_image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">{t('books.modal.shelf')}</label>
                                <input
                                    name="shelf_location"
                                    className="smart-input"
                                    value={formData.shelf_location}
                                    onChange={handleChange}
                                    placeholder="e.g. A-1"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="smart-form-footer">
                    <button type="button" onClick={onClose} className="btn-cancel">{t('books.modal.cancel')}</button>
                    <button type="submit" form="edit-book-form" disabled={loading} className="btn-submit">
                        {loading ? t('books.modal.saving') : <><Save size={18} /> {t('books.modal.update')}</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SmartEditBookModal;
