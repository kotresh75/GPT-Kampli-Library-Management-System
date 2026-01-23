const db = require('../db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const auditService = require('../services/auditService');

// Helper for Audit Logging (Reusing the concept, ideally this would be a shared utility)


// GET /api/staff
exports.getAllStaff = (req, res) => {
    const { search = '', designation = '', status = '' } = req.query;

    let query = `SELECT id, name, email, phone, designation, access_permissions, status, last_login, created_at FROM staff WHERE status != 'Deleted'`;
    let params = [];

    if (search) {
        query += ` AND (name LIKE ? OR email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }
    if (designation) {
        query += ` AND designation = ?`;
        params.push(designation);
    }
    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

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
        res.json({ message: "Status updated" });
    });
};

// DELETE /api/staff/:id (Soft Delete)
exports.deleteStaff = (req, res) => {
    const { id } = req.params;
    const actorId = req.user ? req.user.id : 'SYSTEM';
    const actorRole = req.user ? req.user.role : 'System';

    const query = `UPDATE staff SET status='Deleted', updated_at=datetime('now', '+05:30') WHERE id=?`;
    db.run(query, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        auditService.log(req.user, 'DELETE', 'Staff Mgmt', `Soft deleted staff ${id}`, { staff_id: id });
        res.json({ message: "Staff deleted successfully" });
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
