import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Settings, Maximize2 } from 'lucide-react';
import { printDocument } from '../../utils/SmartPrinterHandler';

const PrintPreviewModal = ({ isOpen, onClose, title, contentHtml, paperSize, onSettingsChange }) => {
    const iframeRef = useRef(null);
    const [currentSize, setCurrentSize] = useState(paperSize || 'A4');

    useEffect(() => {
        if (isOpen && iframeRef.current && contentHtml) {
            const doc = iframeRef.current.contentDocument;
            doc.open();
            doc.write(contentHtml);
            doc.close();
        }
    }, [isOpen, contentHtml]);

    useEffect(() => {
        if (paperSize) setCurrentSize(paperSize);
    }, [paperSize]);

    const handlePrint = () => {
        // Trigger print on the iframe
        if (iframeRef.current) {
            iframeRef.current.contentWindow.focus();
            iframeRef.current.contentWindow.print();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
        }}>
            <div className="glass-panel" style={{
                width: '90%', height: '90%',
                padding: 0, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                background: '#1a1a1a', border: '1px solid #333',
                borderRadius: '24px'
            }}>

                {/* Toolbar */}
                <div style={{
                    padding: '12px 20px',
                    background: '#252525',
                    borderBottom: '1px solid #333',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{title} - Print Preview</div>

                        {/* Size Switcher for Quick Test */}
                        <div style={{ display: 'flex', background: '#333', borderRadius: '6px', padding: '2px' }}>
                            {['58mm', '80mm', 'A4'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => onSettingsChange && onSettingsChange(size)}
                                    style={{
                                        background: currentSize === size ? '#3b82f6' : 'transparent',
                                        color: currentSize === size ? '#fff' : '#aaa',
                                        border: 'none', padding: '4px 10px', borderRadius: '4px',
                                        fontSize: '0.8rem', cursor: 'pointer',
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handlePrint}
                            className="primary-glass-btn"
                            style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}
                        >
                            <Printer size={18} /> Print Now
                        </button>
                        <button onClick={onClose} className="icon-btn-ghost"><X size={20} color="#fff" /></button>
                    </div>
                </div>

                {/* Preview Area */}
                <div style={{ flex: 1, background: '#555', display: 'flex', justifyContent: 'center', overflow: 'auto', padding: '40px' }}>
                    <div style={{
                        background: '#fff',
                        width: currentSize === 'A4' ? '210mm' : currentSize === '80mm' ? '80mm' : '58mm',
                        minHeight: '297mm', // A4 Height roughly
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                        transition: 'width 0.3s ease'
                    }}>
                        <iframe
                            ref={iframeRef}
                            style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
                            title="Print Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintPreviewModal;
