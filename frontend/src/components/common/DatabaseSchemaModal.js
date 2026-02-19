import React, { useState, useEffect, useCallback } from 'react';
import { X, Database, Table2, Key, Hash, ArrowRight, Columns3, Link2, AlertCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import '../../styles/components/database-schema.css';

const DatabaseSchemaModal = () => {
    const { currentUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTable, setActiveTable] = useState(null);

    // Global Alt+D Listener — Admin only, must be logged in
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && (e.key === 'd' || e.key === 'D')) {
                e.preventDefault();
                const token = localStorage.getItem('auth_token');
                if (!token || !currentUser || currentUser.role !== 'Admin') return;
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentUser]);

    // Fetch schema when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('Not authenticated. Please log in first.');
            setLoading(false);
            return;
        }

        fetch('http://localhost:17221/api/utils/db-schema', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setSchema(data);
                if (data.tables?.length > 0) {
                    setActiveTable(data.tables[0].name);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [isOpen]);

    // Escape to close
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    const formatBytes = useCallback((bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    if (!isOpen) return null;

    const currentTable = schema?.tables?.find(t => t.name === activeTable);

    return (
        <div className="db-schema-overlay" onClick={() => setIsOpen(false)}>
            <div className="db-schema-modal" onClick={e => e.stopPropagation()}>

                {/* ── Sidebar ── */}
                <div className="db-schema-sidebar">
                    <div className="db-schema-sidebar-header">
                        <div className="db-schema-sidebar-title">
                            <div className="db-schema-sidebar-title-icon">
                                <Database size={18} />
                            </div>
                            DB Schema
                        </div>

                        {schema && (
                            <div className="db-schema-stats">
                                <div className="db-schema-stat">
                                    <span className="db-schema-stat-value">{schema.totalTables}</span>
                                    <span className="db-schema-stat-label">Tables</span>
                                </div>
                                <div className="db-schema-stat">
                                    <span className="db-schema-stat-value">{schema.totalIndexes}</span>
                                    <span className="db-schema-stat-label">Indexes</span>
                                </div>
                                <div className="db-schema-stat">
                                    <span className="db-schema-stat-value">{formatBytes(schema.dbSizeBytes)}</span>
                                    <span className="db-schema-stat-label">Size</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="db-schema-table-list">
                        {schema?.tables?.map(table => (
                            <button
                                key={table.name}
                                className={`db-schema-table-item ${activeTable === table.name ? 'active' : ''}`}
                                onClick={() => setActiveTable(table.name)}
                            >
                                <div className="db-schema-table-name">
                                    <div className="db-schema-table-icon">
                                        <Table2 size={14} />
                                    </div>
                                    {table.name}
                                </div>
                                <span className="db-schema-row-count">{table.rowCount}</span>
                            </button>
                        ))}
                    </div>

                    <div className="db-schema-sidebar-footer">
                        <kbd>Alt</kbd>+<kbd>D</kbd> toggle • <kbd>Esc</kbd> close
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="db-schema-content">
                    <div className="db-schema-content-header">
                        <div className="db-schema-content-title">
                            <Table2 size={20} />
                            {currentTable ? currentTable.name : 'Database Schema'}
                        </div>
                        <button className="db-schema-close-btn" onClick={() => setIsOpen(false)} title="Close (Esc)">
                            <X size={16} />
                        </button>
                    </div>

                    {loading && (
                        <div className="db-schema-loading">
                            <div className="db-schema-spinner" />
                            Loading schema...
                        </div>
                    )}

                    {error && (
                        <div className="db-schema-error">
                            <AlertCircle size={28} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && currentTable && (
                        <div className="db-schema-content-body">

                            {/* Meta Info */}
                            <div className="db-schema-meta">
                                <div className="db-schema-meta-chip">
                                    <Columns3 size={14} />
                                    <strong>{currentTable.columns.length}</strong> Columns
                                </div>
                                <div className="db-schema-meta-chip">
                                    <Hash size={14} />
                                    <strong>{currentTable.rowCount.toLocaleString()}</strong> Rows
                                </div>
                                {currentTable.foreignKeys.length > 0 && (
                                    <div className="db-schema-meta-chip">
                                        <Link2 size={14} />
                                        <strong>{currentTable.foreignKeys.length}</strong> Foreign Keys
                                    </div>
                                )}
                                {currentTable.indexes.length > 0 && (
                                    <div className="db-schema-meta-chip">
                                        <Key size={14} />
                                        <strong>{currentTable.indexes.length}</strong> Indexes
                                    </div>
                                )}
                            </div>

                            {/* Columns */}
                            <div className="db-schema-section-title">
                                <Columns3 size={14} /> Columns
                            </div>
                            <table className="db-schema-columns-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Constraints</th>
                                        <th>Default</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTable.columns.map((col, i) => (
                                        <tr key={col.cid}>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{i + 1}</td>
                                            <td>
                                                <div className="db-col-name">
                                                    {col.isPrimaryKey && <Key size={12} color="#fbbf24" />}
                                                    {col.name}
                                                </div>
                                            </td>
                                            <td><span className="db-badge db-badge-type">{col.type}</span></td>
                                            <td>
                                                {col.isPrimaryKey && <span className="db-badge db-badge-pk">PK</span>}
                                                {' '}
                                                {col.notNull && <span className="db-badge db-badge-nn">NOT NULL</span>}
                                            </td>
                                            <td>
                                                {col.defaultValue !== null ? (
                                                    <span className="db-badge db-badge-default">{col.defaultValue}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Foreign Keys */}
                            {currentTable.foreignKeys.length > 0 && (
                                <>
                                    <div className="db-schema-section-title">
                                        <Link2 size={14} /> Foreign Keys
                                    </div>
                                    <div className="db-schema-fk-list">
                                        {currentTable.foreignKeys.map((fk, i) => (
                                            <div key={i} className="db-schema-fk-item">
                                                <strong>{fk.from}</strong>
                                                <ArrowRight size={14} />
                                                <strong>{fk.table}</strong>.{fk.to}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Indexes */}
                            {currentTable.indexes.length > 0 && (
                                <>
                                    <div className="db-schema-section-title">
                                        <Key size={14} /> Indexes
                                    </div>
                                    <div className="db-schema-index-list">
                                        {currentTable.indexes.map((idx, i) => (
                                            <div key={i} className="db-schema-index-item">
                                                {idx.sql || idx.name}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* CREATE SQL */}
                            <div className="db-schema-section-title">
                                <Database size={14} /> CREATE Statement
                            </div>
                            <pre className="db-schema-sql">{currentTable.sql}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseSchemaModal;
