import React from 'react';
import { Book, Edit, Layers } from 'lucide-react';

const BookCard = ({ book, onEdit, onManageCopies }) => {
    // Determine placeholder color based on Dept/Category
    const getDeptColor = (dept) => {
        const colors = {
            'Computer Science': '#4fd1c5',
            'Electronics': '#63b3ed',
            'Mechanical': '#f6ad55',
            'Civil': '#fc8181',
            'General': '#b794f4'
        };
        return colors[dept] || '#cbd5e0';
    };

    return (
        <div className="glass-card bounce-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Cover Area */}
            <div style={{
                height: '140px',
                background: `linear-gradient(135deg, ${getDeptColor(book.category)}aa, ${getDeptColor(book.category)}55)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                ) : (
                    <Book size={48} color="white" style={{ opacity: 0.8 }} />
                )}

                <span className="badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem' }}>
                    {book.category}
                </span>
            </div>

            {/* Content */}
            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px', lineHeight: '1.3', height: '42px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {book.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {book.author} | {book.publisher}
                </p>

                {/* Availability Bar */}
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '600' }}>
                        <span>Available</span>
                        <span>{book.available_copies} / {book.total_copies}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${(book.available_copies / book.total_copies) * 100}%`,
                            height: '100%',
                            background: book.available_copies > 0 ? '#48bb78' : '#f56565',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div style={{ padding: '10px 15px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.1)' }}>
                <button className="icon-btn-sm" onClick={() => onEdit(book)} style={{ flex: 1, justifyContent: 'center' }}>
                    <Edit size={16} /> Edit
                </button>
                <button className="icon-btn-sm" onClick={() => onManageCopies(book)} style={{ flex: 1, justifyContent: 'center' }}>
                    <Layers size={16} /> Copies
                </button>
            </div>
        </div>
    );
};

export default BookCard;
