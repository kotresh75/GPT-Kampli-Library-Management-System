import React, { useState, useEffect } from 'react';
import { X, Download, FileText, FileSpreadsheet, Layers, CheckCircle2, Filter, Printer } from 'lucide-react';
import PrintPreviewModal from './PrintPreviewModal';
import { generatePrintContent } from '../../utils/SmartPrinterHandler';
import { useLanguage } from '../../context/LanguageContext';

const SmartExportModal = ({ onClose, onExport, totalCount, selectedCount, filteredCount, entityName = "Items", data = [], columns = [], onFetchAll, allowedFormats = ['xlsx', 'csv', 'pdf', 'print'] }) => {
    const { t } = useLanguage();
    const [scope, setScope] = useState('all'); // all, selected, filtered
    const [format, setFormat] = useState(allowedFormats[0] || 'xlsx');
    const [loading, setLoading] = useState(false);

    // Print Preview State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [printData, setPrintData] = useState({ html: '', paperSize: 'A4' });

    // Fetch settings on mount (simulated context or local storage)
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:17221/api/settings/app');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.warn("Could not fetch settings for printing, using defaults.");
            }
        };
        fetchSettings();
    }, []);

    const handleExport = () => {
        if (format === 'print') {
            // Check if parent handles print action (returns true)
            const handled = onExport && onExport(scope, format);
            if (handled === true) {
                onClose();
                return;
            }
            handlePrintPreview();
        } else {
            if (onExport) onExport(scope, format);
            onClose();
        }
    };

    const handlePrintPreview = async () => {
        let dataToPrint = data;

        // 1. Determine if we need to fetch all data
        // If scope is 'all' or 'filtered' and we have onFetchAll and total filtered/all > current data length
        // Note: 'data' passed from parent usually matches the grid view (current page)
        // If user wants to print "Filtered View" (which usually implies all matching filter, not just page 1), we should fetch.

        const needsFetch = onFetchAll && (filteredCount > data.length || (scope === 'all' && totalCount > data.length));

        if (needsFetch) {
            setLoading(true);
            try {
                // Determine what to fetch based on scope
                // Usually onFetchAll handles using current filters + limit=all
                // We might need to pass scope? but pages usually handle filters internally.
                const fullData = await onFetchAll();
                if (fullData && Array.isArray(fullData)) {
                    dataToPrint = fullData;
                }
            } catch (error) {
                console.error("Failed to fetch all data for print", error);
                // Fallback to existing data or alert? 
                // We'll just continue with current data to avoid breakage
            } finally {
                setLoading(false);
            }
        }

        const title = `${entityName} Report ${scope !== 'all' ? `(${scope})` : ''}`;
        const content = generatePrintContent(title, dataToPrint, columns, settings);
        setPrintData(content);
        setIsPreviewOpen(true);
    };

    const handlePreviewSettingsChange = (newSize) => {
        // Regenerate content with new size
        // We need to keep 'printData' context if we fetched full data. 
        // Ideally we should store the 'dataToPrint' in state if we want to support resizing dynamic data.
        // For simplicity, we might rebuild it or we need to persist the dataToPrint.
        // Let's rely on printData.html if generatePrintContent is pure, but it needs data.
        // Improvement: Store 'currentPreviewData' in state.
    };

    const ScopeOption = ({ id, label, count, icon: Icon, disabled }) => (
        <div
            onClick={() => !disabled && setScope(id)}
            className="scope-option"
            style={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
                borderColor: scope === id ? 'var(--primary-color)' : 'var(--border-color)',
                background: scope === id ? 'var(--hover-overlay)' : 'transparent',
            }}
        >
            <div className="scope-icon" style={{
                background: scope === id ? 'var(--primary-color)' : 'var(--surface-secondary)',
                color: scope === id ? '#fff' : 'var(--text-secondary)'
            }}>
                <Icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{count} {entityName}</div>
            </div>
            {scope === id && <CheckCircle2 size={20} style={{ color: 'var(--primary-color)' }} />}
        </div>
    );

    return (
        <>
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
            }}>
                <div className="glass-panel bounce-in" style={{ width: '480px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '24px' }}>

                    {/* Header */}
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--surface-secondary)',
                        borderTopLeftRadius: '24px', // Match glass-panel radius
                        borderTopRightRadius: '24px' // Match glass-panel radius
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', background: 'var(--hover-overlay)', borderRadius: '10px', color: 'var(--text-primary)' }}>
                                <Download size={22} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{t('common.export.title')}</h2>
                                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)', opacity: 0.8 }}>{t('common.export.subtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="icon-btn-ghost"><X size={20} /></button>
                    </div>

                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Scope Selection */}
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('common.export.source')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <ScopeOption id="all" label={`${t('common.export.all')} ${entityName}`} count={totalCount} icon={Layers} />
                                {/* Always enabled - user can choose filtered even if same as all */}
                                <ScopeOption id="filtered" label={t('common.export.filtered')} count={filteredCount} icon={Filter} />
                                <ScopeOption id="selected" label={t('common.export.selected')} count={selectedCount} icon={CheckCircle2} disabled={selectedCount === 0} />
                            </div>
                        </div>

                        {/* Format Selection */}
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('common.export.format')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${allowedFormats.length}, 1fr)`, gap: '8px' }}>

                                {/* Excel Option */}
                                {allowedFormats.includes('xlsx') && (
                                    <div
                                        onClick={() => setFormat('xlsx')}
                                        className="format-card"
                                        style={{
                                            borderColor: format === 'xlsx' ? '#10b981' : 'var(--border-color)',
                                            background: format === 'xlsx' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <FileSpreadsheet size={24} style={{ color: format === 'xlsx' ? '#10b981' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.excel')}</span>
                                    </div>
                                )}

                                {/* CSV Option */}
                                {allowedFormats.includes('csv') && (
                                    <div
                                        onClick={() => setFormat('csv')}
                                        className="format-card"
                                        style={{
                                            borderColor: format === 'csv' ? '#3b82f6' : 'var(--border-color)',
                                            background: format === 'csv' ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <FileText size={24} style={{ color: format === 'csv' ? '#3b82f6' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.csv')}</span>
                                    </div>
                                )}

                                {/* PDF Option */}
                                {allowedFormats.includes('pdf') && (
                                    <div
                                        onClick={() => setFormat('pdf')}
                                        className="format-card"
                                        style={{
                                            borderColor: format === 'pdf' ? '#ef4444' : 'var(--border-color)',
                                            background: format === 'pdf' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <FileText size={24} style={{ color: format === 'pdf' ? '#ef4444' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.pdf')}</span>
                                    </div>
                                )}

                                {/* NEW Print Option */}
                                {allowedFormats.includes('print') && (
                                    <div
                                        onClick={() => setFormat('print')}
                                        className="format-card"
                                        style={{
                                            borderColor: format === 'print' ? '#8b5cf6' : 'var(--border-color)',
                                            background: format === 'print' ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <Printer size={24} style={{ color: format === 'print' ? '#8b5cf6' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.print')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleExport}
                            className="primary-glass-btn"
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                background:
                                    format === 'xlsx' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                        format === 'pdf' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' :
                                            format === 'print' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' :
                                                'var(--primary-btn-bg)'
                            }}
                        >
                            {format === 'print' ? <Printer size={20} /> : <Download size={20} />}
                            {format === 'print' ? t('common.export.preview_print') : `${t('common.export.export_btn')} ${format === 'xlsx' ? t('common.export.excel') : format === 'pdf' ? t('common.export.pdf') : t('common.export.csv')}`}
                        </button>

                    </div>
                </div>

                <style jsx>{`
                    .scope-option {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .scope-option:hover {
                        background: var(--hover-overlay);
                        border-color: var(--border-color-strong);
                    }
                    .scope-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .format-card {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 16px;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .format-card:hover {
                        background: var(--hover-overlay);
                        border-color: var(--border-color-strong);
                    }
                `}</style>
            </div>

            {/* Print Preview Modal */}
            <PrintPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title={`Print ${entityName}`}
                contentHtml={printData.html}
                paperSize={printData.paperSize}
                onSettingsChange={handlePreviewSettingsChange}
            />
        </>
    );
};

export default SmartExportModal;
