const db = require('../db');
const bcrypt = require('bcrypt');
// eslint-disable-next-line
const { v4: uuidv4 } = require('uuid');
const auditService = require('../services/auditService');

// Get All App Settings
exports.getAppSettings = (req, res) => {
    // Fetch categories: App, Data, Email, Security
    // Exclude 'Policy' which is for the Policy Page
    db.all("SELECT * FROM system_settings WHERE category IN ('App', 'Data', 'Email', 'Security')", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const settings = {};
        rows.forEach(row => {
            try {
                if (row.data_type === 'json') {
                    settings[row.key] = JSON.parse(row.value);
                } else {
                    settings[row.key] = row.value;
                }
            } catch (e) {
                settings[row.key] = row.value;
            }
        });
        res.json(settings);
    });
};

// Update App Settings
exports.updateAppSettings = async (req, res) => {
    try {
        const { updates, admin_password, admin_id } = req.body;

        console.log("[Settings] updateAppSettings called with keys:", updates ? Object.keys(updates) : 'none');

        // Validate updates object
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: "No updates provided (ERR_SET_NO_DATA)" });
        }

        const keys = Object.keys(updates);

        // If no keys to update, just return success
        if (keys.length === 0) {
            return res.json({ success: true, message: "No changes to save" });
        }

        // Check if sensitive categories are being updated
        const sensitivePrefixes = ['sec_', 'email_', 'backup_'];
        const isSensitive = keys.some(k => sensitivePrefixes.some(pre => k.startsWith(pre)));

        if (isSensitive) {
            if (!admin_password) return res.status(400).json({ error: "Admin password required for sensitive settings (ERR_SET_AUTH)" });
            if (!admin_id) return res.status(400).json({ error: "Admin ID required (ERR_SET_ID)" });

            console.log(`[Settings] Verifying admin ID: ${admin_id}`);

            // Verify Password - check admins table (not staff)
            const admin = await new Promise((resolve, reject) => {
                db.get("SELECT password_hash FROM admins WHERE id = ?", [admin_id], (err, row) => {
                    if (err) reject(err); else resolve(row);
                });
            });

            console.log(`[Settings] Admin found:`, admin ? 'yes' : 'no', 'has password_hash:', admin?.password_hash ? 'yes' : 'no');

            if (!admin) return res.status(403).json({ error: "Unauthorized - admin not found (ERR_SET_UNAUTH)" });
            if (!admin.password_hash) return res.status(500).json({ error: "Admin password not set (ERR_SET_PWD_MISSING)" });

            const match = await bcrypt.compare(admin_password, admin.password_hash);
            if (!match) return res.status(401).json({ error: "Invalid Password (ERR_SET_PWD)" });
        }

        // Proceed Update - using Promise to properly handle async
        return new Promise((resolve) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                let completed = 0;
                let errorOccurred = false;
                let errorDetails = null;

                keys.forEach(key => {
                    let value = updates[key];
                    if (typeof value === 'object') value = JSON.stringify(value);

                    db.run("UPDATE system_settings SET value = ? WHERE key = ?", [value, key], function (err) {
                        completed++;
                        if (err) {
                            console.error(`[Settings] Error updating key '${key}':`, err.message);
                            errorOccurred = true;
                            errorDetails = err.message;
                        } else {
                            console.log(`[Settings] Updated '${key}': ${this.changes} rows affected`);
                        }

                        // When all updates are done
                        if (completed === keys.length) {
                            if (errorOccurred) {
                                db.run("ROLLBACK", () => {
                                    res.status(500).json({ error: `Update failed: ${errorDetails} (ERR_SET_DB)` });
                                    resolve();
                                });
                            } else {
                                // Log Audit
                                if (admin_id) {
                                    auditService.log(admin_id, 'UPDATE_SETTINGS', 'Settings', `Updated keys: ${keys.join(', ')}`);
                                }

                                db.run("COMMIT", () => {
                                    res.json({ success: true });
                                    resolve();
                                });
                            }
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error("[Settings] Server error:", error);
        res.status(500).json({ error: "Server error updating settings (ERR_SET_SRV)" });
    }
};

// Change Password (User specific)
exports.changeUserPassword = async (req, res) => {
    const { user_id, current_password, new_password } = req.body;

    db.get("SELECT password_hash FROM staff WHERE id = ?", [user_id], async (err, user) => {
        if (err || !user) return res.status(404).json({ error: "User not found" });

        const match = await bcrypt.compare(current_password, user.password_hash);
        if (!match) return res.status(401).json({ error: "Current password incorrect" });

        const hashed = await bcrypt.hash(new_password, 10);
        db.run("UPDATE staff SET password_hash = ? WHERE id = ?", [hashed, user_id], (err) => {
            if (err) return res.status(500).json({ error: "Failed to update password" });

            res.json({ success: true });
        });
    });
};

// Test Email
exports.testEmail = async (req, res) => {
    const { email } = req.body;
    const nodemailer = require('nodemailer');

    // Get email config from database
    db.get("SELECT value FROM system_settings WHERE key = 'email_config'", [], async (err, row) => {
        if (err || !row) {
            return res.status(500).json({ error: "Email configuration not found (ERR_EMAIL_CFG)" });
        }

        try {
            const config = JSON.parse(row.value);

            if (!config.enabled) {
                return res.status(400).json({ error: "Email service is disabled (ERR_EMAIL_TEST)" });
            }

            // Create transporter based on provider
            let transporter;

            if (config.provider === 'smtp') {
                // Fix common typo: smpt -> smtp
                const host = config.host === 'smpt.gmail.com' ? 'smtp.gmail.com' : config.host;

                transporter = nodemailer.createTransport({
                    host: host,
                    port: parseInt(config.port) || 587,
                    secure: config.secure || config.port === 465,
                    auth: {
                        user: config.user,
                        pass: config.pass
                    }
                });
            } else {
                // For other providers (sendgrid, aws_ses) - would need SDK
                return res.status(400).json({ error: `Provider '${config.provider}' not implemented yet (ERR_EMAIL_PROVIDER)` });
            }

            // Verify connection
            try {
                await transporter.verify();
                console.log("[Email] SMTP connection verified successfully");
            } catch (verifyErr) {
                console.error("[Email] SMTP verification failed:", verifyErr.message);
                return res.status(500).json({
                    error: `SMTP connection failed: ${verifyErr.message} (ERR_EMAIL_CONN)`
                });
            }

            // Send test email
            const targetEmail = email || config.user;
            const mailOptions = {
                from: `"${config.fromName || 'GPTK Library'}" <${config.user}>`,
                to: targetEmail,
                subject: 'GPTK LMS - Test Email',
                text: 'This is a test email from GPTK Library Management System. If you received this, your email configuration is working correctly!',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                        <h2 style="color: #3b82f6;">✅ Test Email Successful!</h2>
                        <p>This is a test email from <strong>GPTK Library Management System</strong>.</p>
                        <p>If you received this, your email configuration is working correctly!</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">
                            Sent from: ${config.fromName || 'GPTK Library'}<br>
                            Provider: ${config.provider.toUpperCase()}<br>
                            Host: ${config.host}
                        </p>
                    </div>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("[Email] Test email sent successfully:", info.messageId);

            res.json({
                success: true,
                message: `Test email sent to ${targetEmail}`,
                messageId: info.messageId
            });

        } catch (e) {
            console.error("[Email] Test email error:", e);
            res.status(500).json({ error: `Failed to send test email: ${e.message} (ERR_EMAIL_SEND)` });
        }
    });
};
