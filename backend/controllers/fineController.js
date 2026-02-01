const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../services/emailService');
const { getISTDate, getSQLiteISTTimestamp } = require('../utils/dateUtils');
const auditService = require('../services/auditService');
const socketService = require('../services/socketService');

// Get All Fines (or filtered)
exports.getAllFines = (req, res) => {
    const { status } = req.query;
    console.log(`[API] GET /fines called with status: '${status}'`);

    let sql = `
        SELECT f.*, f.remark as reason, 
               COALESCE(f.student_name, s.full_name) as student_name, 
               COALESCE(f.student_reg_no, s.register_number) as roll_number,
               s.profile_image, 
               d.name as department_name, 
               COALESCE(t.book_title, b.title) as book_title,
               COALESCE(t.book_isbn, b.isbn) as book_isbn,
               b.cover_image,
               COALESCE(bc.accession_number, json_extract(t.details, '$.accession')) as accession_number,
               json_extract(t.details, '$.due_date') as due_date,
               json_extract(t.details, '$.issue_date') as issue_date,
               json_extract(t.details, '$.last_renewed_date') as last_renewed_date
        FROM fines f
        LEFT JOIN students s ON f.student_id = s.id
        LEFT JOIN departments d ON s.dept_id = d.id
        LEFT JOIN transaction_logs t ON f.transaction_id = t.id
        LEFT JOIN book_copies bc ON t.copy_id = bc.id
        LEFT JOIN books b ON bc.book_isbn = b.isbn
    `;
    const params = [];

    if (status) {
        sql += " WHERE f.status = ?";
        params.push(status);
    }

    sql += " ORDER BY f.created_at DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("[API] GET /fines Error:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[API] GET /fines returned ${rows.length} rows`);
        res.json(rows);
    });
};

// Get Fines by Student
exports.getStudentFines = (req, res) => {
    const { studentId } = req.params;
    const sql = `
        SELECT f.*, f.remark as reason, s.full_name as student_name, s.register_number as roll_number, s.profile_image, 
               COALESCE(t.book_title, b.title) as book_title,
               COALESCE(t.book_isbn, b.isbn) as book_isbn,
               b.cover_image,
               COALESCE(bc.accession_number, json_extract(t.details, '$.accession')) as accession_number,
               json_extract(t.details, '$.due_date') as due_date,
               json_extract(t.details, '$.issue_date') as issue_date,
               json_extract(t.details, '$.last_renewed_date') as last_renewed_date
        FROM fines f
        JOIN students s ON f.student_id = s.id
        LEFT JOIN transaction_logs t ON f.transaction_id = t.id
        LEFT JOIN book_copies bc ON t.copy_id = bc.id 
        LEFT JOIN books b ON bc.book_isbn = b.isbn
        WHERE f.student_id = ?
        ORDER BY f.created_at DESC
    `;
    db.all(sql, [studentId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Collect Fine Payment
exports.collectFine = (req, res) => {
    const { fine_ids, payment_method } = req.body;

    let collector_id = req.user ? req.user.id : 'SYSTEM';

    // Fallback if needed but prefer authenticated user
    if (!req.user && req.body.collector_id) {
        collector_id = req.body.collector_id;
    }

    // fine_ids is array of fine IDs to pay

    if (!fine_ids || fine_ids.length === 0) return res.status(400).json({ error: "No fines selected" });

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const now = getSQLiteISTTimestamp();

        // We need to process each fine to log it correctly and update it
        // Let's do a chain of updates.

        const processFines = async () => {
            const paidItems = [];
            let studentIdForEmail = null;
            const receiptId = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            try {
                for (const fineId of fine_ids) {
                    // 1. Get Fine Details (Use Snapshot data from original transaction Log if available)
                    const fine = await new Promise((resolve, reject) => {
                        db.get(`
                            SELECT f.*, f.remark as reason, 
                                   t.copy_id, 
                                   COALESCE(t.book_title, b.title) as book_title,
                                   COALESCE(t.book_isbn, b.isbn) as book_isbn,
                                   COALESCE(bc.accession_number, json_extract(t.details, '$.accession')) as accession_number,
                                   COALESCE(t.student_name, s.full_name) as student_name,
                                   COALESCE(t.student_reg_no, s.register_number) as student_reg_no,
                                   COALESCE(t.student_dept, d.name) as student_dept
                            FROM fines f 
                            LEFT JOIN transaction_logs t ON f.transaction_id = t.id 
                            LEFT JOIN students s ON f.student_id = s.id
                            LEFT JOIN departments d ON s.dept_id = d.id
                            LEFT JOIN book_copies bc ON t.copy_id = bc.id
                            LEFT JOIN books b ON bc.book_isbn = b.isbn
                            WHERE f.id = ? AND f.status = 'Unpaid'
                        `, [fineId], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    });

                    if (!fine) continue; // Skip if not found or already paid

                    // 2. Update Fine Status
                    await new Promise((resolve, reject) => {
                        db.run(`UPDATE fines SET status = 'Paid', is_paid = 1, payment_date = ?, receipt_number = ?, collected_by = ? WHERE id = ?`,
                            [now, receiptId, collector_id, fineId], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                    });

                    // 3. Log to transaction_logs (The Ledger)
                    // We create a new transaction log entry for the PAYMENT
                    const logId = uuidv4();
                    const [dateStr, timeStr] = now.split(' ');
                    const details = JSON.stringify({
                        fine_id: fine.id,
                        amount: fine.amount,
                        payment_method: payment_method,
                        reason: fine.reason,
                        book_title: fine.book_title,
                        accession: fine.accession_number, // Snapshot Acc
                        original_transaction_id: fine.transaction_id,
                        receipt_id: receiptId,
                        action_date: dateStr,
                        action_time: timeStr
                    });

                    await new Promise((resolve, reject) => {
                        db.run(`
                            INSERT INTO transaction_logs (
                                id, action_type, student_id, copy_id, performed_by, timestamp, details,
                                student_name, student_reg_no, student_dept, book_title, book_isbn
                            )
                            VALUES (?, 'FINE_PAID', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            logId, fine.student_id, fine.copy_id, collector_id, now, details,
                            fine.student_name, fine.student_reg_no, fine.student_dept, fine.book_title, fine.book_isbn
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });

                    studentIdForEmail = fine.student_id;
                    paidItems.push({
                        description: `${fine.reason} - ${fine.book_title || ''}`,
                        amount: fine.amount
                    });
                }

                // 5. Audit Log (Batch)
                const auditUser = req.user ? { id: req.user.id, role: req.user.role || 'Admin' } : collector_id;
                let auditMsg = `Collected ${fine_ids.length} fines. IDs: ${fine_ids.join(', ')}`;

                // If we processed fines and have a student ID, try to get name for log
                // (Optimization: we have studentName in the last processed fine usually)
                if (paidItems.length > 0 && fine_ids.length > 0) {
                    // We can't easily grab the name here without keeping it from loop or fetching.
                    // The loop has access to 'fine.student_name'. Let's assume single student payment usually.
                    // But simplest is to just say "Collected payment".
                    // Better: "Collected fine(s) total ₹${total} from Student..."
                    // Let's rely on the fact that usually it's one student.
                    // We will leave it generic but add total amount?
                    const totalPaid = paidItems.reduce((acc, i) => acc + i.amount, 0);
                    auditMsg = `Collected fines (Total: ₹${totalPaid}). IDs: ${fine_ids.join(', ')}`;
                }

                auditService.log(auditUser, 'FINE_COLLECTED', 'Finance', auditMsg);

                db.run("COMMIT", () => {
                    // Send Email Receipt Async
                    if (studentIdForEmail && paidItems.length > 0) {
                        db.get("SELECT full_name as name, email FROM students WHERE id = ?", [studentIdForEmail], (err, student) => {
                            if (student && student.email) {
                                const total = paidItems.reduce((acc, item) => acc + item.amount, 0);
                                emailService.sendFineReceipt(student, {
                                    id: receiptId,
                                    total: total,
                                    items: paidItems
                                });
                            }
                        });
                    }
                    socketService.emit('fine_update', { type: 'COLLECT' });
                    res.json({ success: true, receiptId });
                });

            } catch (err) {
                console.error("Payment Processing Error:", err);
                db.run("ROLLBACK");
                res.status(500).json({ error: "Payment processing failed" });
            }
        };

        processFines();
    });
};

// Waive Fine
exports.waiveFine = (req, res) => {
    const { fine_id, reason } = req.body;
    const staff_id = req.user ? req.user.id : (req.body.staff_id || 'SYSTEM');

    db.get(`
        SELECT f.*, f.remark as reason, 
               t.copy_id,
               COALESCE(t.book_title, b.title) as book_title,
               COALESCE(t.book_isbn, b.isbn) as book_isbn,
               COALESCE(bc.accession_number, json_extract(t.details, '$.accession')) as accession_number,
               COALESCE(t.student_name, s.full_name) as student_name,
               COALESCE(t.student_reg_no, s.register_number) as student_reg_no,
               COALESCE(t.student_dept, d.name) as student_dept
        FROM fines f 
        LEFT JOIN transaction_logs t ON f.transaction_id = t.id 
        LEFT JOIN students s ON f.student_id = s.id
        LEFT JOIN departments d ON s.dept_id = d.id
        LEFT JOIN book_copies bc ON t.copy_id = bc.id
        LEFT JOIN books b ON bc.book_isbn = b.isbn
        WHERE f.id = ?
    `, [fine_id], (err, fine) => {
        if (err || !fine) return res.status(404).json({ error: "Fine not found" });

        const sid = fine.student_id;
        const now = getSQLiteISTTimestamp();

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Update Fine
            db.run("UPDATE fines SET status = 'Waived', is_paid = 1, remark = ? WHERE id = ?", [reason, fine_id], (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: "Update failed" });
                }

                // Log to transaction_logs (The Ledger)
                const logId = uuidv4();
                const [dateStr, timeStr] = now.split(' ');
                const details = JSON.stringify({
                    fine_id: fine.id,
                    amount: fine.amount,
                    waiver_reason: reason,
                    original_reason: fine.reason,
                    accession: fine.accession_number, // Snapshot Acc
                    action_date: dateStr,
                    action_time: timeStr
                });

                db.run(`
                    INSERT INTO transaction_logs (
                        id, action_type, student_id, copy_id, performed_by, timestamp, details,
                        student_name, student_reg_no, student_dept, book_title, book_isbn
                    )
                    VALUES (?, 'FINE_WAIVED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    logId, sid, fine.copy_id, staff_id, now, details,
                    fine.student_name, fine.student_reg_no, fine.student_dept, fine.book_title, fine.book_isbn
                ], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: "Logging failed" });
                    }

                    // Recalc Student Fines - SKIPPED

                    // Audit Log
                    const auditUser = req.user ? { id: req.user.id, role: req.user.role || 'Admin' } : staff_id;
                    auditService.log(auditUser, 'FINE_WAIVED', 'Finance', `Waived fine ${fine_id} for ${fine.student_name} (${fine.student_reg_no}). Reason: ${reason}`);

                    db.run("COMMIT", () => {
                        res.json({ success: true });
                    });
                });
            });
        });
    });
};

// Update fine (Edit Amount/Reason)
exports.updateFine = (req, res) => {
    const { fine_id, amount, reason } = req.body;
    const staff_id = req.user ? req.user.id : (req.body.staff_id || 'SYSTEM');

    db.get(`
        SELECT f.*, f.remark as reason, 
               t.copy_id,
               COALESCE(t.book_title, b.title) as book_title,
               COALESCE(t.book_isbn, b.isbn) as book_isbn,
               COALESCE(bc.accession_number, json_extract(t.details, '$.accession')) as accession_number,
               COALESCE(t.student_name, s.full_name) as student_name,
               COALESCE(t.student_reg_no, s.register_number) as student_reg_no,
               COALESCE(t.student_dept, d.name) as student_dept
        FROM fines f 
        LEFT JOIN transaction_logs t ON f.transaction_id = t.id 
        LEFT JOIN students s ON f.student_id = s.id
        LEFT JOIN departments d ON s.dept_id = d.id
        LEFT JOIN book_copies bc ON t.copy_id = bc.id
        LEFT JOIN books b ON bc.book_isbn = b.isbn
        WHERE f.id = ?
    `, [fine_id], (err, fine) => {
        if (err || !fine) return res.status(404).json({ error: "Fine not found" });

        const sid = fine.student_id;
        const now = getSQLiteISTTimestamp();
        const oldAmount = fine.amount;
        const oldReason = fine.reason;

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Update Fine
            db.run("UPDATE fines SET amount = ?, remark = ? WHERE id = ?", [amount, reason, fine_id], (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: "Update failed" });
                }

                // Log to transaction_logs (The Ledger)
                const logId = uuidv4();
                const details = JSON.stringify({
                    fine_id: fine.id,
                    old_amount: oldAmount,
                    new_amount: amount,
                    old_reason: oldReason,
                    new_reason: reason,
                    accession: fine.accession_number // Snapshot Acc
                });

                db.run(`
                    INSERT INTO transaction_logs (
                        id, action_type, student_id, copy_id, performed_by, timestamp, details,
                        student_name, student_reg_no, student_dept, book_title, book_isbn
                    )
                    VALUES (?, 'FINE_EDITED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    logId, sid, fine.copy_id, staff_id, now, details,
                    fine.student_name, fine.student_reg_no, fine.student_dept, fine.book_title, fine.book_isbn
                ], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: "Logging failed" });
                    }

                    // Recalc Student Fines - SKIPPED

                    // Audit Log
                    const auditUser = req.user ? { id: req.user.id, role: req.user.role || 'Admin' } : staff_id;
                    auditService.log(auditUser, 'FINE_EDITED', 'Finance', `Edited fine ${fine_id} for ${fine.student_name} (${fine.student_reg_no}). Amount: ${oldAmount}->${amount}`);

                    db.run("COMMIT", () => {
                        res.json({ success: true });
                    });
                });
            });
        });
    });
};

// Get Receipt Details
exports.getReceiptDetails = (req, res) => {
    const { receiptId } = req.params;

    // We search transaction_logs for 'FINE_PAID' actions where details contains this receiptId
    const sql = `
        SELECT t.*, 
               COALESCE(t.student_name, s.full_name) as student_name, 
               COALESCE(t.student_reg_no, s.register_number) as register_number 
        FROM transaction_logs t
        LEFT JOIN students s ON t.student_id = s.id
        WHERE t.action_type = 'FINE_PAID' AND t.details LIKE ?
    `;

    db.all(sql, [`%${receiptId}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: "Receipt not found" });

        const receiptData = {
            id: receiptId,
            student_name: rows[0].student_name,
            register_number: rows[0].register_number,
            date: rows[0].timestamp,
            items: [],
            total: 0
        };

        rows.forEach(row => {
            const details = JSON.parse(row.details || '{}');
            if (details.receipt_id === receiptId) {
                receiptData.items.push({
                    description: `${details.reason} - ${details.book_title || ''}`,
                    amount: details.amount,
                    payment_method: details.payment_method
                });
                receiptData.total += details.amount;
            }
        });

        res.json(receiptData);
    });
};

// Resend Receipt Email
exports.resendReceipt = (req, res) => {
    const { fine_id } = req.body;

    if (!fine_id) return res.status(400).json({ error: "Fine ID required" });

    db.get(`
        SELECT f.*, s.full_name, s.email, s.register_number, 
               t.book_title
        FROM fines f
        JOIN students s ON f.student_id = s.id
        LEFT JOIN transaction_logs t ON f.transaction_id = t.id
        WHERE f.id = ? AND f.status = 'Paid'
    `, [fine_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Paid fine record not found or student missing" });
        if (!row.email) return res.status(400).json({ error: "Student has no email address" });

        // Try to find the original receipt ID from logs, else generate one
        db.get(`SELECT details FROM transaction_logs WHERE action_type='FINE_PAID' AND details LIKE ?`, [`%${fine_id}%`], (err, logRow) => {

            let receiptId = 'REC-Reissue-' + Date.now();
            if (logRow && logRow.details) {
                try {
                    const d = JSON.parse(logRow.details);
                    if (d.receipt_id) receiptId = d.receipt_id;
                } catch (e) { }
            }

            const receiptData = {
                id: receiptId,
                total: row.amount,
                items: [{
                    description: `${row.remark || row.reason} - ${row.book_title || 'Fine'}`,
                    amount: row.amount
                }]
            };

            emailService.sendFineReceipt({ name: row.full_name, email: row.email }, receiptData)
                .then(sent => {
                    if (sent) res.json({ message: "Receipt resent successfully" });
                    else res.status(500).json({ error: "Failed to send email (Service might be disabled)" });
                })
                .catch(err => res.status(500).json({ error: err.message }));
        });
    });
};