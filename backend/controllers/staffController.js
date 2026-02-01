const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const auditService = require('../services/auditService');
const socketService = require('../services/socketService');

// Helper for Audit Logging (Reusing the concept, ideally this would be a shared utility)


// GET /api/staff
exports.getAllStaff = (req, res) => {
    const { search = '', designation = '', status = '' } = req.query;

    let query = `
        SELECT 
            s.id, s.name, s.email, s.phone, s.designation, s.access_permissions, 
            s.status, s.last_login, s.created_at,
            (SELECT COUNT(*) FROM transaction_logs WHERE performed_by = s.id) as transaction_count
        FROM staff s 
        WHERE s.status != 'Deleted'`;
    let params = [];

    if (search) {
        query += ` AND (s.name LIKE ? OR s.email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }
    if (designation) {
        query += ` AND s.designation = ?`;
        params.push(designation);
    }
    if (status) {
        query += ` AND s.status = ?`;
        params.push(status);
    }

    query += ` ORDER BY s.created_at DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Parse permissions JSON
        const data = rows.map(r => ({
            ...r,
            access_permissions: r.access_permissions ? JSON.parse(r.access_permissions) : []
        }));

        res.json(data);
    });
};

// GET /api/staff/stats
exports.getStats = (req, res) => {
    const queries = {
        total: "SELECT COUNT(*) as count FROM staff WHERE status != 'Deleted'",
        active: "SELECT COUNT(*) as count FROM staff WHERE status = 'Active'",
        disabled: "SELECT COUNT(*) as count FROM staff WHERE status = 'Disabled'",
        transactions: "SELECT COUNT(*) as count FROM transaction_logs WHERE performed_by IN (SELECT id FROM staff WHERE status != 'Deleted')"
    };

    const results = {};

    db.get(queries.total, [], (err, row) => {
        results.total = row ? row.count : 0;

        db.get(queries.active, [], (err, row) => {
            results.active = row ? row.count : 0;

            db.get(queries.disabled, [], (err, row) => {
                results.disabled = row ? row.count : 0;

                db.get(queries.transactions, [], (err, row) => {
                    results.totalTransactions = row ? row.count : 0;
                    res.json(results);
                });
            });
        });
    });
};

// POST /api/staff
exports.createStaff = (req, res) => {
    const { name, email, phone, designation, access_permissions } = req.body;
    const actorId = req.user ? req.user.id : 'SYSTEM';
    const actorRole = req.user ? req.user.role : 'System';

    if (!name || !email) return res.status(400).json({ error: "Name and Email are required" });

    const defaultPassword = "password123";
    const saltRounds = 10;
    const permissionsJson = JSON.stringify(access_permissions || []);

    bcrypt.hash(defaultPassword, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ error: "Encryption failed" });

        const id = uuidv4();
        const query = `INSERT INTO staff (id, name, email, phone, designation, access_permissions, password_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`;

        db.run(query, [id, name, email, phone, designation, permissionsJson, hash], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(409).json({ error: "Email already exists" });
                return res.status(500).json({ error: err.message });
            }

            auditService.log(req.user, 'CREATE', 'Staff Mgmt', `Created staff: ${name} (${designation})`, { staff_id: id });
            socketService.emit('staff_update', { type: 'CREATE', id });
            res.json({ message: "Staff created successfully", id });
        });
    });
};

// PUT /api/staff/:id
exports.updateStaff = (req, res) => {
    const { id } = req.params;
    const { name, phone, designation, access_permissions } = req.body;
    const actorId = req.user ? req.user.id : 'SYSTEM';
    const actorRole = req.user ? req.user.role : 'System';

    const permissionsJson = JSON.stringify(access_permissions || []);

    const query = `UPDATE staff SET name=?, phone=?, designation=?, access_permissions=?, updated_at=datetime('now', '+05:30') WHERE id=?`;
    db.run(query, [name, phone, designation, permissionsJson, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        auditService.log(req.user, 'UPDATE', 'Staff Mgmt', `Updated staff: ${name}`, { staff_id: id });
        socketService.emit('staff_update', { type: 'UPDATE', id });
        res.json({ message: "Staff updated successfully" });
    });
};

// PATCH /api/staff/:id/status
exports.toggleStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const actorId = req.user ? req.user.id : 'SYSTEM';
    const actorRole = req.user ? req.user.role : 'System';

    if (!['Active', 'Disabled'].includes(status)) return res.status(400).json({ error: "Invalid status" });

    const query = `UPDATE staff SET status=?, updated_at=datetime('now', '+05:30') WHERE id=?`;
    db.run(query, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        auditService.log(req.user, 'STATUS_CHANGE', 'Staff Mgmt', `Changed status of staff ${id} to ${status}`, { staff_id: id, status });
        socketService.emit('staff_update', { type: 'UPDATE', id });
        res.json({ message: "Status updated" });
    });
};

// DELETE /api/staff/:id (Permanent Delete)
exports.deleteStaff = (req, res) => {
    const { id } = req.params;

    // Prevent deleting the System Administrator
    if (id === 'SYSTEM' || id.toLowerCase() === 'system') {
        return res.status(403).json({ error: "System Administrator account cannot be deleted." });
    }

    // First get staff info for audit log
    db.get("SELECT name, email FROM staff WHERE id = ?", [id], (err, staff) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!staff) return res.status(404).json({ error: "Staff not found" });

        // Clear foreign key references first
        db.serialize(() => {
            // Set issued_by to NULL in circulation
            db.run("UPDATE circulation SET issued_by = NULL WHERE issued_by = ?", [id]);
            // Set performed_by to NULL in transaction_logs
            db.run("UPDATE transaction_logs SET performed_by = NULL WHERE performed_by = ?", [id]);
            // Set collected_by to NULL in fines
            db.run("UPDATE fines SET collected_by = NULL WHERE collected_by = ?", [id]);


            // Now permanently delete the staff
            db.run("DELETE FROM staff WHERE id = ?", [id], function (err) {
                if (err) return res.status(500).json({ error: err.message });

                auditService.log(req.user, 'DELETE', 'Staff Mgmt', `Deleted staff: ${staff.name} (${staff.email})`, { staff_id: id });
                socketService.emit('staff_update', { type: 'DELETE', id });
                res.json({ message: "Staff deleted permanently" });
            });
        });
    });
};

// POST /api/staff/:id/reset-password
exports.resetPassword = (req, res) => {
    const { id } = req.params;
    const actorId = req.user ? req.user.id : 'SYSTEM';
    const actorRole = req.user ? req.user.role : 'System';

    const defaultPassword = "password123";
    const saltRounds = 10;

    bcrypt.hash(defaultPassword, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ error: "Encryption error" });

        db.run("UPDATE staff SET password_hash=? WHERE id=?", [hash, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            auditService.log(req.user, 'RESET_PASSWORD', 'Staff Mgmt', `Reset password for staff ${id}`, { staff_id: id });
            socketService.emit('staff_update', { type: 'UPDATE', id });
            res.json({ message: "Password reset to 'password123'" });
        });
    });
};

// GET /api/staff/:id/activity
exports.getStaffActivity = (req, res) => {
    const { id } = req.params;
    // Assuming staff actions are logged in `audit_logs` with `actor_id = staff_id`
    // OR we might have specific transaction logs. For now, we look at audit_logs (if staff actions are audited there)
    // AND we can also look at `transactions` where `issued_by = id` or `fines` where `collected_by = id`.

    // For this task, user wants "Chronological list of actions".
    // We'll combine:
    // 1. Audit Logs (System actions)
    // 2. Transactions (Issues)
    // 3. Fines (Collections) -- If those tables have timestamps.

    // We will stick to `audit_logs` for now, assuming future staff actions will write there. 
    // BUT we can perform a UNION query for a richer timeline if tables are compatible.

    const query = `SELECT * FROM audit_logs WHERE actor_id = ? ORDER BY timestamp DESC LIMIT 50`;
    db.all(query, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};
