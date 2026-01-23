import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, BookOpen, Lock } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import '../../styles/components/smart-form-modal.css';

const SmartEditBookModal = ({ book, onClose, onUpdated }) => {
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
            if (!res.ok) throw new Error(data.error || 'Failed to update book');

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
                        Edit Book Details
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {/* ISBN Section (Read Only) */}
                    <div className="form-group">
                        <label className="form-label">ISBN-13 (Locked)</label>
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
                                <label className="form-label">Title</label>
                                <input
                                    name="title"
                                    className="smart-input"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Book Title"
                                    required
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Author</label>
                                <input
                                    name="author"
                                    className="smart-input"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Author Name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <GlassSelect
                                options={departments.map(d => ({ value: d.id, label: d.name }))}
                                value={formData.dept_id}
                                onChange={handleDeptChange}
                                placeholder="Select Department"
                            />
                        </div>

                        {/* Details Grid */}
                        <div className="form-row">
                            <div className="form-col form-group">
                                <label className="form-label">Publisher</label>
                                <input
                                    name="publisher"
                                    className="smart-input"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Price</label>
                                <input
                                    name="price"
                                    type="number"
                                    className="smart-input"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Quantity (Read Only)</label>
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
                                <label className="form-label">Cover Image URL</label>
                                <input
                                    name="cover_image_url"
                                    className="smart-input"
                                    value={formData.cover_image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </div>
                            <div className="form-col form-group">
                                <label className="form-label">Shelf Location</label>
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
                    <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                    <button type="submit" form="edit-book-form" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : <><Save size={18} /> Update Book</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SmartEditBookModal;
