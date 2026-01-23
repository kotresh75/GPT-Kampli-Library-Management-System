import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, BookOpen, Search, AlertCircle, CheckCircle } from 'lucide-react';
import GlassSelect from '../common/GlassSelect';
import '../../styles/components/smart-form-modal.css';

const SmartAddBookModal = ({ onClose, onAdded }) => {
    // 1. Data State
    const [formData, setFormData] = useState({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        dept_id: '',
        price: '',
        total_copies: 1,
        cover_image_url: '',
        shelf_location: ''
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchSuccess, setFetchSuccess] = useState('');
    const [isReady, setIsReady] = useState(false);

    // 2. Fetch Departments & Layout Delay
    useEffect(() => {
        fetch('http://localhost:3001/api/departments')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setDepartments(data) : [])
            .catch(err => console.error("Failed to fetch depts", err));

        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 3. Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'isbn') {
            setFetchSuccess('');
            setError('');
        }
    };

    const handleDeptChange = (value) => {
        setFormData(prev => ({ ...prev, dept_id: value }));
    };

    const generateAutoISBN = () => {
        const randomId = `AG-${Math.floor(Math.random() * 10000000000)}`;
        setFormData(prev => ({ ...prev, isbn: randomId }));
        setFetchSuccess('Auto-generated ID ready');
    };

    const fetchMetadata = async () => {
        const cleanIsbn = formData.isbn.replace(/-/g, '').trim();
        if (!cleanIsbn || cleanIsbn.length < 10) return;
        if (cleanIsbn.startsWith('AG')) return;

        setFetchLoading(true);
        setError('');
        setFetchSuccess('');

        try {
            // 1. Google Books
            const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
            const googleData = await googleRes.json();

            if (googleData.items && googleData.items.length > 0) {
                const book = googleData.items[0].volumeInfo;
                setFormData(prev => ({
                    ...prev,
                    title: book.title || prev.title,
                    author: book.authors ? book.authors.join(', ') : prev.author,
                    publisher: book.publisher || prev.publisher,
                    cover_image_url: book.imageLinks?.thumbnail?.replace('http:', 'https:') || prev.cover_image_url,
                }));
                setFetchSuccess('Found on Google Books');
                setFetchLoading(false);
                return;
            }

            // 2. OpenLibrary Fallback
            const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
            const olData = await olRes.json();
            const key = `ISBN:${cleanIsbn}`;

            if (olData[key]) {
                const book = olData[key];
                setFormData(prev => ({
                    ...prev,
                    title: book.title || prev.title,
                    author: book.authors ? book.authors.map(a => a.name).join(', ') : prev.author,
                    publisher: book.publishers ? book.publishers.map(p => p.name).join(', ') : prev.publisher,
                    cover_image_url: book.cover?.medium || book.cover?.large || prev.cover_image_url
                }));
                setFetchSuccess('Found on OpenLibrary');
                setFetchLoading(false);
                return;
            }

            setError("Book details not found. Please fill manually.");
        } catch (err) {
            console.error("Fetch metadata failed", err);
            setError("Network error fetching metadata.");
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.dept_id) {
            setError("Please select a department");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save book');

            onAdded();
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
                        Add New Book
                    </h2>
                    <button className="smart-form-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-form-body">
                    {/* ISBN Section */}
                    <div className="form-group">
                        <label className="form-label">ISBN-13 or ID</label>
                        <div className="input-wrapper">
                            <input
                                name="isbn"
                                className={`smart-input ${error && !formData.title ? 'error' : ''}`}
                                value={formData.isbn}
                                onChange={handleChange}
                                placeholder="Enter ISBN to auto-fill details"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchMetadata(); } }}
                                onBlur={() => { if (formData.isbn && !formData.title) fetchMetadata(); }}
                            />
                            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8 }}>
                                {fetchLoading && <div className="spinner-sm" style={{ width: 16, height: 16 }} />}
                                <button type="button" onClick={generateAutoISBN} className="input-action-btn">
                                    Auto ID
                                </button>
                            </div>
                        </div>
                        {fetchSuccess && <div className="success-msg"><CheckCircle size={14} /> {fetchSuccess}</div>}
                        {error && !formData.dept_id && <div className="validation-msg"><AlertCircle size={14} /> {error}</div>}
                    </div>

                    <form id="add-book-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>
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
                                <label className="form-label">Quantity</label>
                                <input
                                    name="total_copies"
                                    type="number"
                                    className="smart-input"
                                    value={formData.total_copies}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
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
                    <button type="submit" form="add-book-form" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : <><Save size={18} /> Save Book</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SmartAddBookModal;
