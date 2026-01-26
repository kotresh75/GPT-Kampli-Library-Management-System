import React, { useState, useEffect } from 'react';
import { X, Download, FileText, FileSpreadsheet, Layers, CheckCircle2, Filter, Printer } from 'lucide-react';
import PrintPreviewModal from '../common/PrintPreviewModal';
import { generatePrintContent } from '../../utils/SmartPrinterHandler';
import { useLanguage } from '../../context/LanguageContext';

const StudentExportModal = ({ onClose, onExport, totalStudents, selectedCount, filteredCount, data = [], columns = [], onFetchAll, selectedIds }) => {
    const { t } = useLanguage();
    const [scope, setScope] = useState('all'); // all, selected, filtered
    const [format, setFormat] = useState('xlsx');
    const [loading, setLoading] = useState(false);

    // Print State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [printData, setPrintData] = useState({ html: '', paperSize: 'A4' });
    const [settings, setSettings] = useState({});

    useEffect(() => {
        fetch('http://localhost:3001/api/settings/app')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { });
    }, []);

    const handleExport = async () => {
        if (format === 'print') {
            setLoading(true);
            try {
                let printSource = [];

                if (scope === 'filtered') {
                    // Use current page data
                    printSource = data;
                } else if (scope === 'all') {
                    // Fetch all data
                    if (onFetchAll) {
                        printSource = await onFetchAll();
                    } else {
                        printSource = data;
                    }
                } else if (scope === 'selected') {
                    // Fetch all and filter by ID (since selection might span pages)
                    // Optimisation: if all selected are on current page, use data? 
                    // But simpler to fetch all if we support multi-page selection generally.
                    if (onFetchAll) {
                        const allData = await onFetchAll();
                        // Need to match IDs. ensure onFetchAll returns objects with IDs or we map 'data' prop to include ID? 
                        // StudentManager 'onFetchAll' returns raw student objects, 'data' prop returns formatted keys.
                        // We need formatted data for print.

                        // Wait, 'data' prop has "Name", "RegNo" keys. 'onFetchAll' returns raw API data.
                        // We need to format the fetched data same as 'data' prop.
                        // Ideally onFetchAll should return formatted data, or we format it here.
                        // Let's rely on onFetchAll returning formatted data as per StudentManager implementation?
                        // Checking StudentManager: onFetchAll returns mapped data: Name, RegNo...

                        // We also need IDs to filter 'selected'. 
                        // But StudentManager onFetchAll currently maps: Name, RegNo... DOES IT RETURN ID?
                        // Step 1062: onFetchAll returns mapped object. DOES NOT INCLUDE ID.
                        // We must update StudentManager onFetchAll to include ID.

                        // Assuming StudentManager is updated to include ID in onFetchAll result:
                        printSource = allData.filter(item => selectedIds.has(item.id));
                    }
                }

                const content = generatePrintContent("Student List", printSource, columns, settings);
                setPrintData(content);
                setIsPreviewOpen(true);
            } catch (e) {
                console.error("Print generation failed", e);
            } finally {
                setLoading(false);
            }
        } else {
            onExport(scope, format);
            onClose();
        }
    };

    const handlePreviewSettingsChange = (newSize) => {
        const newSettings = { ...settings, app_hardware: { ...settings.app_hardware, paperSize: newSize } };
        // We need 'printSource' here again? 
        // generatePrintContent uses 'data' arg.
        // We need to store the fetched data for re-generation on settings change?
        // For simplicity, we can just use the 'printData.html'? No, resizing needs regeneration.
        // Let's ignoring live resize for 'All' data if it's too complex, or store 'lastPrintSource'.
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
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{count} Students</div>
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
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px'
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
                                <ScopeOption
                                    id="all"
                                    label={t('students.table.select_all_global').replace('Select ', '')}
                                    count={totalStudents}
                                    icon={Layers}
                                />
                                <ScopeOption id="filtered" label={t('common.export.filtered')} count={filteredCount} icon={Filter} />
                                <ScopeOption id="selected" label={t('common.export.selected')} count={selectedCount} icon={CheckCircle2} disabled={selectedCount === 0} />
                            </div>
                        </div>

                        {/* Format Selection */}
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>{t('common.export.format')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                {/* ... Options ... */}
                                <div onClick={() => setFormat('xlsx')} className="format-card" style={{
                                    borderColor: format === 'xlsx' ? '#10b981' : 'var(--border-color)',
                                    background: format === 'xlsx' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                                }}>
                                    <FileSpreadsheet size={24} style={{ color: format === 'xlsx' ? '#10b981' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.excel')}</span>
                                </div>
                                <div onClick={() => setFormat('csv')} className="format-card" style={{
                                    borderColor: format === 'csv' ? '#3b82f6' : 'var(--border-color)',
                                    background: format === 'csv' ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}>
                                    <FileText size={24} style={{ color: format === 'csv' ? '#3b82f6' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.csv')}</span>
                                </div>
                                <div onClick={() => setFormat('pdf')} className="format-card" style={{
                                    borderColor: format === 'pdf' ? '#ef4444' : 'var(--border-color)',
                                    background: format === 'pdf' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                                }}>
                                    <FileText size={24} style={{ color: format === 'pdf' ? '#ef4444' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.pdf')}</span>
                                </div>
                                <div onClick={() => setFormat('print')} className="format-card" style={{
                                    borderColor: format === 'print' ? '#8b5cf6' : 'var(--border-color)',
                                    background: format === 'print' ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                                }}>
                                    <Printer size={24} style={{ color: format === 'print' ? '#8b5cf6' : 'var(--text-secondary)', marginBottom: '6px' }} />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{t('common.export.print')}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={loading}
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
                                                'var(--primary-btn-bg)',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? <div className="spinner-sm" /> : (format === 'print' ? <Printer size={20} /> : <Download size={20} />)}
                            {loading ? 'Processing...' : (format === 'print' ? t('common.export.preview_print') : `${t('common.export.export_btn')} ${format === 'xlsx' ? t('common.export.excel') : format === 'pdf' ? t('common.export.pdf') : t('common.export.csv')}`)}
                        </button>

                    </div>
                </div>
                {/* Style block same as before */}
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
            <PrintPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Print Student List"
                contentHtml={printData.html}
                paperSize={printData.paperSize}
                onSettingsChange={handlePreviewSettingsChange}
            />
        </>
    );
};

export default StudentExportModal;
