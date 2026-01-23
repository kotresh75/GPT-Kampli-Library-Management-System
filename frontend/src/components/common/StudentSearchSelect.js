import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Plus } from 'lucide-react';

const StudentSearchSelect = ({ onSelect, selectedStudents = [], placeholder = "Search student..." }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef(null);

    // Ensure selectedStudents is always an array
    const selectedList = Array.isArray(selectedStudents) ? selectedStudents : (selectedStudents ? [selectedStudents] : []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                searchStudents();
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const searchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/api/students?search=${query}&limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.data) {
                // Filter out already selected students
                const filtered = data.data.filter(s => !selectedList.some(sel => sel.id === s.id));
                setResults(filtered);
                setShowResults(true);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (student) => {
        const updated = [...selectedList, student];
        onSelect(updated);
        setQuery('');
        setShowResults(false);
    };

    const handleRemove = (id) => {
        const updated = selectedList.filter(s => s.id !== id);
        onSelect(updated);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>

            {/* Selected Chips Area */}
            {selectedList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {selectedList.map(student => (
                        <div key={student.id} className="glass-chip fade-in" style={{
                            background: 'rgba(72, 187, 120, 0.2)',
                            border: '1px solid rgba(72, 187, 120, 0.3)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '0.85rem'
                        }}>
                            <User size={14} />
                            <span>{student.full_name}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(student.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: 'inherit', opacity: 0.7 }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="input-group">
                <Search className="input-icon" size={18} />
                <input
                    type="text"
                    className="glass-input"
                    placeholder={selectedList.length > 0 ? "Add another student..." : placeholder}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                />
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" style={{ position: 'absolute', right: '10px' }} />}
            </div>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="glass-panel scale-in" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    marginTop: '5px',
                    padding: '5px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                    {results.map(student => (
                        <div
                            key={student.id}
                            onClick={() => handleSelect(student)}
                            style={{
                                padding: '10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: '0.2s',
                            }}
                            className="hover-bg"
                        >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={14} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{student.full_name}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{student.register_number} • {student.department_name}</div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <Plus size={16} style={{ opacity: 0.5 }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .hover-bg:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default StudentSearchSelect;
