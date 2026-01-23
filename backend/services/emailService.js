const nodemailer = require('nodemailer');
const db = require('../db');
const { getISTDate } = require('../utils/dateUtils');

// Helper to get email config
const getEmailConfig = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT value FROM system_settings WHERE key = 'email_config'", (err, row) => {
            if (err) return reject(err);
            if (!row || !row.value) return resolve(null);
            try {
                const config = JSON.parse(row.value);
                if (!config.enabled) return resolve(null);
                resolve(config);
            } catch (e) {
                resolve(null);
            }
        });
    });
};

// Create Transporter
const createTransporter = (config) => {
    if (config.provider === 'smtp') {
        const host = config.host === 'smpt.gmail.com' ? 'smtp.gmail.com' : config.host; // Fix common typo
        return nodemailer.createTransport({
            host: host,
            port: parseInt(config.port) || 587,
            secure: config.secure || config.port === 465,
            auth: {
                user: config.user,
                pass: config.pass
            }
        });
    }
    // Future: Add other providers
    return null;
};

// Generic Send Function
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const config = await getEmailConfig();
        if (!config) {
            console.log(`[Email] Skipped: Service disabled or unconfigured. Subject: ${subject}`);
            return false;
        }

        const transporter = createTransporter(config);
        if (!transporter) {
            console.error(`[Email] Error: Unsupported provider ${config.provider}`);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"${config.fromName || 'GPTK Library'}" <${config.user}>`,
            to,
            subject,
            text,
            html
        });

        console.log(`[Email] Sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email] Failed to send to ${to}:`, error.message);
        return false;
    }
};

// --- Templates ---

const baseTemplate = (content, footerInfo = '') => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">GPTK Library</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Govt Polytechnic, Kampli</p>
    </div>
    <div style="padding: 30px 20px; background-color: #f9fafb;">
        ${content}
    </div>
    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;">&copy; ${getISTDate().getFullYear()} GPTK Library Management System</p>
        ${footerInfo ? `<p style="margin: 5px 0;">${footerInfo}</p>` : ''}
    </div>
</div>
`;

exports.sendTransactionReceipt = async (type, student, details) => {
    // type: 'ISSUE', 'RETURN', 'RENEW'
    const subjectMap = {
        'ISSUE': `📚 Book Issued: ${details.title}`,
        'RETURN': `↩️ Book Returned: ${details.title}`,
        'RENEW': `🔄 Book Renewed: ${details.title}`
    };

    const subject = subjectMap[type] || 'Library Transaction';

    let bodyContent = '';
    if (type === 'ISSUE') {
        bodyContent = `
            <h2 style="color: #2563eb; margin-top: 0;">Book Issued Successfully</h2>
            <p>Dear <strong>${student.name}</strong>,</p>
            <p>You have successfully borrowed the following book:</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Title:</strong> ${details.title}</p>
                <p style="margin: 5px 0;"><strong>Accession No:</strong> ${details.accession}</p>
                <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(details.due_date).toLocaleDateString()}</p>
            </div>
            <p>Please return the book on or before the due date to avoid fines.</p>
        `;
    } else if (type === 'RETURN') {
        bodyContent = `
            <h2 style="color: #10b981; margin-top: 0;">Book Returned Successfully</h2>
            <p>Dear <strong>${student.name}</strong>,</p>
            <p>We have received the following book:</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Title:</strong> ${details.title}</p>
                <p style="margin: 5px 0;"><strong>Returned On:</strong> ${getISTDate().toLocaleDateString()}</p>
                ${details.fine_amount > 0 ? `<p style="margin: 5px 0; color: #ef4444;"><strong>Fine Generated:</strong> ₹${details.fine_amount}</p>` : '<p style="margin: 5px 0; color: #10b981;"><strong>Status:</strong> No Dues</p>'}
            </div>
        `;
    } else if (type === 'RENEW') {
        bodyContent = `
            <h2 style="color: #8b5cf6; margin-top: 0;">Book Renewed Successfully</h2>
            <p>Dear <strong>${student.name}</strong>,</p>
            <p>The borrowing period for the following book has been extended:</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Title:</strong> ${details.title}</p>
                <p style="margin: 5px 0;"><strong>New Due Date:</strong> ${new Date(details.new_due_date).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Renewals Used:</strong> ${details.renewals_used}</p>
            </div>
        `;
    }

    return sendEmail({
        to: student.email,
        subject,
        html: baseTemplate(bodyContent)
    });
};

exports.sendFineReceipt = async (student, receipt) => {
    const subject = `💰 Payment Receipt: ₹${receipt.total}`;

    const itemsHtml = receipt.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${item.description}</td>
            <td style="padding: 10px; text-align: right;">₹${item.amount.toFixed(2)}</td>
        </tr>
    `).join('');

    // Ensure Receipt ID has REC- prefix
    const displayReceiptId = receipt.id.toString().startsWith('REC-') ? receipt.id : `REC-${receipt.id}`;

    const bodyContent = `
        <h2 style="color: #10b981; margin-top: 0;">Payment Received</h2>
        <p>Dear <strong>${student.name}</strong>,</p>
        <p>Thank you for your payment. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
            <thead>
                <tr style="background: #f3f4f6; color: #6b7280; font-size: 12px; text-transform: uppercase;">
                    <th style="padding: 10px; text-align: left;">Description</th>
                    <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr style="font-weight: bold; background: #f9fafb;">
                    <td style="padding: 10px; text-align: right;">Total Paid:</td>
                    <td style="padding: 10px; text-align: right;">₹${receipt.total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        <p style="font-size: 12px; color: #9ca3af;">Receipt ID: ${displayReceiptId}</p>
    `;

    return sendEmail({
        to: student.email,
        subject,
        html: baseTemplate(bodyContent)
    });
};

exports.sendOverdueNotice = async (student, loans) => {
    const subject = `⚠️ Overdue Alert: You have ${loans.length} overdue item(s)`;

    const itemsHtml = loans.map(loan => `
        <li style="margin-bottom: 10px;">
            <strong>${loan.book_title}</strong><br>
            <span style="font-size: 12px; color: #ef4444;">Due: ${new Date(loan.due_date).toLocaleDateString()} (${loan.overdue_days} days late)</span>
        </li>
    `).join('');

    const bodyContent = `
        <h2 style="color: #ef4444; margin-top: 0;">Overdue Notice</h2>
        <p>Dear <strong>${student.name}</strong>,</p>
        <p>This is a reminder that you have <strong>${loans.length}</strong> book(s) that are past their due date.</p>
        <ul style="background: white; padding: 20px 40px; border-radius: 6px; border: 1px solid #fee2e2;">
            ${itemsHtml}
        </ul>
        <p>Please return them as soon as possible to minimize late fines.</p>
    `;

    return sendEmail({
        to: student.email,
        subject,
        html: baseTemplate(bodyContent)
    });
};

exports.sendBroadcast = async (recipient, subject, message) => {
    // recipient: { name, email }
    const bodyContent = `
        <h2 style="color: #4b5563; margin-top: 0;">Notice from Library</h2>
        <p>Dear <strong>${recipient.name}</strong>,</p>
        <div style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
        </div>
    `;

    return sendEmail({
        to: recipient.email,
        subject: `📢 ${subject}`,
        html: baseTemplate(bodyContent)
    });
};

module.exports = {
    sendTransactionReceipt: exports.sendTransactionReceipt,
    sendFineReceipt: exports.sendFineReceipt,
    sendOverdueNotice: exports.sendOverdueNotice,
    sendBroadcast: exports.sendBroadcast,
    sendEmail // Export generic too just in case
};
