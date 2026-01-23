const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const auditService = require('../services/auditService');

// SECRET should eventually check system_settings, but for now we fallback
const JWT_SECRET = 'gptk_lms_secret_temporary_key';

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Helper to check password and send response
    const verifyAndSend = (user, roleRaw) => {
        // Normalize role
        const role = roleRaw || user.role || (roleRaw === 'admin' ? 'Admin' : 'Staff');

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Authentication error' });

            if (!isMatch) {
                // Log Login Failure
                auditService.log(
                    email,
                    'LOGIN_FAILED',
                    'Auth',
                    `Login failed for email: ${email}`,
                    { ip: req.ip, reason: 'Invalid Password' }
                );
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate Token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: role },
                JWT_SECRET,
                { expiresIn: '12h' }
            );

            // Update Last Login (Table depends on role)
            const table = role === 'Admin' ? 'admins' : 'staff';
            db.run(`UPDATE ${table} SET last_login = datetime('now', '+05:30') WHERE id = ?`, [user.id]);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: role,
                    // specific fields
                    designation: user.designation,
                    permissions: user.access_permissions ? JSON.parse(user.access_permissions) : []
                }
            });

            // Log Login Success
            auditService.log(
                { id: user.id, role: role },
                'LOGIN',
                'Auth',
                `User logged in: ${user.email}`,
                { ip: req.ip }
            );
        });
    };

    // 1. Check Admins Table
    const adminQuery = "SELECT id, name, email, password_hash, 'Admin' as role FROM admins WHERE email = ?";
    db.get(adminQuery, [email], (err, admin) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (admin) {
            return verifyAndSend(admin, 'Admin');
        }

        // 2. Check Staff Table
        const staffQuery = "SELECT id, name, email, password_hash, designation, access_permissions, 'Staff' as role FROM staff WHERE email = ? AND status = 'Active'";
        db.get(staffQuery, [email], (err, staff) => {
            if (err) return res.status(500).json({ message: 'Database error' });

            if (staff) {
                return verifyAndSend(staff, 'Staff');
            }

            // Log Login Failure (User not found in Staff)
            auditService.log(
                email,
                'LOGIN_FAILED',
                'Auth',
                `Login failed for email: ${email}`,
                { ip: req.ip, reason: 'User not found' }
            );
            return res.status(401).json({ message: 'Invalid credentials' });
        });
    });
};
// --- Forgot Password Logic ---

exports.requestPasswordReset = (req, res) => {
    const { email } = req.body;
    const nodemailer = require('nodemailer');

    // Audit Request
    auditService.log(email, 'PASSWORD_RESET_REQUEST', 'Auth', `Password reset requested for ${email}`, { ip: req.ip });

    // Check if user exists (Admins only for now, can extend to Staff)
    db.get("SELECT id FROM admins WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'Email not found in our records.' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 mins

        // Store OTP (Upsert: Replace if exists)
        db.run("INSERT OR REPLACE INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)",
            [email, otp, expiresAt],
            async (err) => {
                if (err) return res.status(500).json({ message: 'Failed to generate OTP' });

                // Get email config from database
                db.get("SELECT value FROM system_settings WHERE key = 'email_config'", [], async (err, row) => {
                    let emailSent = false;

                    if (!err && row) {
                        try {
                            const config = JSON.parse(row.value);

                            if (config.enabled && config.provider === 'smtp') {
                                // Fix common typo: smpt -> smtp
                                const host = config.host === 'smpt.gmail.com' ? 'smtp.gmail.com' : config.host;

                                const transporter = nodemailer.createTransport({
                                    host: host,
                                    port: parseInt(config.port) || 587,
                                    secure: config.secure || config.port === 465,
                                    auth: {
                                        user: config.user,
                                        pass: config.pass
                                    }
                                });

                                const mailOptions = {
                                    from: `"${config.fromName || 'GPTK Library'}" <${config.user}>`,
                                    to: email,
                                    subject: 'Password Reset OTP - GPTK Library',
                                    text: `Your OTP for password reset is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
                                    html: `
                                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                                            <h2 style="color: #3b82f6;">Password Reset Request</h2>
                                            <p>Your OTP for password reset is:</p>
                                            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
                                            </div>
                                            <p style="color: #6b7280;">This code expires in 10 minutes.</p>
                                            <p style="color: #6b7280;">If you did not request this password reset, please ignore this email.</p>
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                                            <p style="color: #9ca3af; font-size: 12px;">GPTK Library Management System</p>
                                        </div>
                                    `
                                };

                                await transporter.sendMail(mailOptions);
                                emailSent = true;
                                console.log(`[Email] OTP sent to ${email}`);
                            }
                        } catch (emailErr) {
                            console.error('[Email] Failed to send OTP:', emailErr.message);
                        }
                    }

                    // Fallback: Log to console if email not sent
                    if (!emailSent) {
                        console.log(`[CONSOLE FALLBACK] OTP for ${email}: ${otp}`);
                    }

                    res.json({
                        message: emailSent ? 'OTP sent to your email.' : 'OTP generated. Check server console (email not configured).',
                        emailSent
                    });
                });
            }
        );
    });
};


exports.verifyOTP = (req, res) => {
    const { email, otp } = req.body;

    db.get("SELECT * FROM password_resets WHERE email = ? AND otp = ?", [email, otp], (err, record) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!record) return res.status(400).json({ message: 'Invalid OTP' });

        if (new Date(record.expires_at) < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        res.json({ message: 'OTP verified successfully' });
    });
};

exports.resetPassword = (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Double check OTP validity
    db.get("SELECT * FROM password_resets WHERE email = ? AND otp = ?", [email, otp], (err, record) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!record || new Date(record.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP request' });
        }

        // Hash new password
        const saltRounds = 10;
        bcrypt.hash(newPassword, saltRounds, (err, hash) => {
            if (err) return res.status(500).json({ message: 'Encryption failed' });

            // Update Admin Password
            db.run("UPDATE admins SET password_hash = ? WHERE email = ?", [hash, email], (err) => {
                if (err) return res.status(500).json({ message: 'Failed to update password' });

                // Clear OTP
                db.run("DELETE FROM password_resets WHERE email = ?", [email]);

                // Audit Reset Success
                auditService.log(email, 'PASSWORD_RESET_SUCCESS', 'Auth', `Password successfully reset for ${email}`, { ip: req.ip });

                res.json({ message: 'Password updated successfully. Please login.' });
            });
        });
    });
};
