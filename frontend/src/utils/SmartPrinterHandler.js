/**
 * SmartPrinterHandler
 * Handles data formatting and printing based on Hardware Settings
 */

const getPrintStyles = (paperSize) => {
    const baseStyles = `
        body { font-family: 'Inter', sans-serif; color: #000; margin: 0; padding: 0; }
        .print-container { width: 100%; }
        .print-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .org-name { font-size: 1.2em; font-weight: bold; text-transform: uppercase; }
        .doc-title { font-size: 1.1em; font-weight: bold; margin-top: 5px; }
        .print-date { font-size: 0.8em; color: #555; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        @media print {
            .no-print { display: none; }
            @page { margin: 10mm; }
        }
    `;

    // Thermal Specific Styles (58mm / 80mm)
    if (paperSize === '58mm' || paperSize === '80mm') {
        return `
            ${baseStyles}
            body { font-family: 'Courier New', monospace; font-size: 12px; }
            .print-container { width: ${paperSize === '58mm' ? '58mm' : '80mm'}; margin: 0 auto; }
            .print-header { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px; }
            .org-name { font-size: 1.1em; }
            .doc-title { font-size: 1em; }
            table { font-size: 11px; }
            th, td { padding: 4px 2px; border: none; border-bottom: 1px dashed #ccc; }
            th { background: transparent; border-bottom: 1px solid #000; }
        `;
    }

    // A4 (Standard)
    return `
        ${baseStyles}
        body { font-size: 14px; }
        table { font-size: 12px; }
        th { background-color: #f3f3f3; -webkit-print-color-adjust: exact; }
    `;
};

const formatTableData = (data, columns, title) => {
    if (!data || !data.length) return '<p class="text-center">No Data Available</p>';

    const headers = columns.map(col => `<th>${col.label || col}</th>`).join('');
    const rows = data.map(item => {
        const cells = columns.map(col => {
            // Handle obj based or simple string columns
            const val = typeof col === 'object' ?
                (col.render ? col.render(item) : item[col.key]) :
                item[col]; // If columns are just keys

            // Clean simple render outputs if they are React elements (not supported in raw HTML print)
            // For now assuming primitive values or simple strings
            return `<td>${val !== undefined && val !== null ? val : '-'}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    return `
        <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
};

const formatReceiptHtml = (transaction, paperSize) => {
    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-GB');
        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const isThermal = paperSize === '58mm' || paperSize === '80mm';
    const width = paperSize === '58mm' ? '58mm' : paperSize === '80mm' ? '80mm' : '100%';
    const fontFamily = isThermal ? "'Courier Prime', 'Courier New', monospace" : "'Inter', sans-serif";

    // Items Rows
    const itemsHtml = (transaction.items || []).map(item => `
        <div class="row">
            <span class="col-desc">${item.description}</span>
            <span class="col-amount">₹${parseFloat(item.amount).toFixed(2)}</span>
        </div>
    `).join('') || `
        <div class="row">
            <span class="col-desc">Fine Payment</span>
            <span class="col-amount">₹${parseFloat(transaction.amount).toFixed(2)}</span>
        </div>
    `;

    return `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
            body { font-family: ${fontFamily}; margin: 0; padding: 10px; font-size: 12px; }
            .receipt-box { width: ${width}; margin: 0 auto; background: #fff; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .header-title { font-size: 1.2em; font-weight: bold; margin-bottom: 2px; }
            .sub-title { font-size: 0.8em; color: #555; }
            .dashed-line { border-bottom: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .col-desc { flex: 1; text-align: left; }
            .col-amount { white-space: nowrap; margin-left: 10px; }
            .total-row { font-size: 1.1em; font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; margin-top: 15px; font-size: 0.8em; color: #666; }
            .barcode { height: 30px; background: #000; width: 80%; margin: 10px auto; mask-image: repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 4px); -webkit-mask-image: repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 4px); }
        </style>
        
        <div class="receipt-box">
            <div class="text-center">
                <div class="header-title">GPTK LIBRARY</div>
                <div class="sub-title">Govt Polytechnic, Kampli</div>
                <div class="dashed-line"></div>
                <div class="font-bold">PAYMENT RECEIPT</div>
            </div>

            <div style="margin-top: 10px;">
                <div class="row">
                    <span>Receipt #:</span>
                    <span class="font-bold">${transaction.receipt_number || transaction.id}</span>
                </div>
                <div class="row">
                    <span>Date:</span>
                    <span>${formatDate(transaction.date)}</span>
                </div>
                <div class="row">
                    <span>Student:</span>
                    <span class="font-bold text-right">${transaction.student_name}</span>
                </div>
                <div class="row">
                    <span>Reg No:</span>
                    <span>${transaction.roll_number}</span>
                </div>
            </div>

            <div class="dashed-line"></div>
            
            <div class="row font-bold">
                <span>Description</span>
                <span>Amount</span>
            </div>
            ${itemsHtml}

            <div class="dashed-line"></div>

            <div class="row total-row">
                <span>TOTAL PAID:</span>
                <span>₹${(transaction.total || transaction.amount).toFixed(2)}</span>
            </div>
            
            <div class="row" style="margin-top: 5px;">
                <span>Payment Mode:</span>
                <span class="uppercase">${transaction.payment_method || 'Cash'}</span>
            </div>

            <div class="text-center" style="font-size: 10px; letter-spacing: 2px; margin-top: 15px;">${(transaction.id || '').replace('REC-', '')}</div>

            <div class="footer">
                Thank you for clearing your dues!<br>
                Computer Generated Receipt
            </div>
        </div>
    `;
};

export const generateReceiptContent = (transaction, settings = {}) => {
    // Determine Settings
    const hardware = settings.app_hardware || {};
    const paperSize = hardware.paperSize || '80mm'; // Default receipts to 80mm usually

    const fullHtml = formatReceiptHtml(transaction, paperSize);

    return { html: fullHtml, paperSize };
};

export const generatePrintContent = (title, data, columns, settings = {}) => {
    // Determine Settings (Default to A4 if missing)
    const hardware = settings.app_hardware || {};
    const paperSize = hardware.paperSize || 'A4';

    // Organization Info (could be from settings too)
    const orgName = "GPTK Library"; // Needs to be dynamic later
    const dateStr = new Date().toLocaleString('en-IN');

    // Generate HTML
    const styles = getPrintStyles(paperSize);
    const tableHtml = formatTableData(data, columns, title);

    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print - ${title}</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="print-container">
                <div class="print-header">
                    <div class="org-name">${orgName}</div>
                    <div class="doc-title">${title}</div>
                    <div class="print-date">${dateStr}</div>
                </div>
                ${tableHtml}
                <div class="print-footer" style="text-align:center; font-size:0.8em; margin-top:20px; color:#888;">
                    Generated by LibMaster
                </div>
            </div>
        </body>
        </html>
    `;

    return { html: fullHtml, paperSize };
};

export const printDocument = async (printContent, settings = {}) => {
    const hardware = settings.app_hardware || {};
    const printMode = hardware.printMode || 'system';

    // 1. Silent Print (Bypasses System Dialog)
    if (printMode === 'silent' && window.electron && window.electron.printSilent) {
        // Use the selected printer if available
        const printerName = hardware.defaultPrinter === 'system_default' ? '' : hardware.defaultPrinter;
        try {
            await window.electron.printSilent(printContent.html, printerName);
            // Optionally notify success?
        } catch (e) {
            console.error("Silent print failed, falling back to window.print", e);
            // Fallback to window print below
        }
        return;
    }

    // 2. Standard System Dialog (or fallback)
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Pop-up blocked! Please allow pop-ups for printing.');
        return;
    }

    printWindow.document.write(printContent.html);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Optional: Close after print
        // printWindow.close(); 
    };
};
