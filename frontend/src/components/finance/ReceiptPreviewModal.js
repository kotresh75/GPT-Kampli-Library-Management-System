import React, { useState, useEffect } from 'react';
import PrintPreviewModal from '../common/PrintPreviewModal';
import { generateReceiptContent } from '../../utils/SmartPrinterHandler';

const ReceiptPreviewModal = ({ isOpen, onClose, transaction }) => {
    const [printData, setPrintData] = useState({ html: '', paperSize: '80mm' });
    const [settings, setSettings] = useState({});

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/settings/app');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.warn("Could not fetch settings for receipt, using defaults.");
            }
        };
        fetchSettings();
    }, []);

    // Generate content when transaction or settings change
    useEffect(() => {
        if (isOpen && transaction) {
            const content = generateReceiptContent(transaction, settings);
            setPrintData(content);
        }
    }, [isOpen, transaction, settings]);

    const handleSettingsChange = (newSize) => {
        const newSettings = { ...settings, app_hardware: { ...settings.app_hardware, paperSize: newSize } };
        const content = generateReceiptContent(transaction, newSettings);
        setPrintData(content);
    };

    if (!isOpen || !transaction) return null;

    return (
        <PrintPreviewModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Receipt #${transaction.receipt_number || transaction.id}`}
            contentHtml={printData.html}
            paperSize={printData.paperSize}
            onSettingsChange={handleSettingsChange}
        />
    );
};

export default ReceiptPreviewModal;
