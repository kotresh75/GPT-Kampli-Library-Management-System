const db = require('../db');
const socketService = require('../services/socketService');
const { v4: uuidv4 } = require('uuid');
const imageService = require('../services/imageService');

// Get all departments with book counts
exports.getDepartments = (req, res) => {
    const { search } = req.query;

    // Using subquery or group by to get counts
    // Note: dept_id in books table is the join key. But wait, books uses 'category' string not dept_id in current implementation?
    // Let's check bookController.js... In Step 702/704 we fixed schema to use 'category' column, but schema has 'dept_id'.
    // The current bookController uses 'category' (text name) to store department.
    // Ideally we should join on name if 'category' stores name, or adjust.
    // Since 'departments' table has 'name', and books table has 'category' (which stores name like 'Computer Science'), we join on name.

    let query = `
        SELECT d.*,
               COUNT(DISTINCT b.id) as book_count,
               COUNT(DISTINCT CASE WHEN s.status != 'Deleted' THEN s.id END) as student_count
        FROM departments d
        LEFT JOIN books b ON d.name = b.category
        LEFT JOIN students s ON d.id = s.dept_id
    `;

    let params = [];

    if (search) {
        query += " WHERE d.name LIKE ? OR d.code LIKE ?";
        params.push(`%${search}%`, `%${search}%`);
    }

    query += " GROUP BY d.id ORDER BY d.name ASC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Add Department
exports.addDepartment = (req, res) => {
    const { name, code, description } = req.body;

    if (!name || !code) {
        return res.status(400).json({ error: "Name and Code are required" });
    }

    const id = uuidv4();
    const sql = "INSERT INTO departments (id, name, code, description) VALUES (?, ?, ?, ?)";

    db.run(sql, [id, name, code, description], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint')) {
                return res.status(409).json({ error: "Department Code or Name already exists" });
            }
            return res.status(500).json({ error: err.message });
        }
        socketService.emit('dept_update', { type: 'ADD', id });
        res.status(201).json({ message: "Department created", id, name, code });
    });
};

// Update Department
exports.updateDepartment = (req, res) => {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const sql = "UPDATE departments SET name = ?, code = ?, description = ?, updated_at = datetime('now', '+05:30') WHERE id = ?";

    db.run(sql, [name, code, description, id], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint')) {
                return res.status(409).json({ error: "Department Code or Name already exists" });
            }
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: "Department not found" });
        socketService.emit('dept_update', { type: 'UPDATE', id });
        res.json({ message: "Department updated" });
    });
};

// Delete Department
exports.deleteDepartment = (req, res) => {
    const { id } = req.params;

    // Check availability
    // Note: We should ideally check if any books or students link to this dept first.
    // For now, simple delete. DB Foreign Keys might restrict this if set to RESTRICT (default depends on sqlite version/pragma)

    db.get("SELECT name FROM departments WHERE id = ?", [id], (err, deptRow) => {
        if (err) return res.status(500).json({ error: err.message });
        const deptName = deptRow?.name;

        db.run("DELETE FROM departments WHERE id = ?", [id], function (err) {
            if (err) {
                if (err.message.includes('FOREIGN KEY constraint failed')) {
                    return res.status(409).json({ error: "Cannot delete: This department is in use by Books or Students." });
                }
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) return res.status(404).json({ error: "Department not found" });
            // Delete HOD signature file
            if (deptName) imageService.deleteImageFile('signatures', 'hod_' + deptName);
            socketService.emit('dept_update', { type: 'DELETE', id });
            res.json({ message: "Department deleted" });
        });
    });
};

// Upload HOD Signature for a Department — accepts file via multer
exports.uploadHodSignature = async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: "No signature image provided" });
    }

    // Get department name for filename
    db.get("SELECT name FROM departments WHERE id = ?", [id], async (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Department not found" });

        try {
            const relativePath = await imageService.saveBufferAsWebP(req.file.buffer, 'signatures', 'hod_' + row.name, { maxWidth: 600, quality: 85 });
            if (!relativePath) {
                return res.status(500).json({ error: "Failed to process signature image" });
            }

            const sql = "UPDATE departments SET hod_signature = ?, updated_at = datetime('now', '+05:30') WHERE id = ?";
            db.run(sql, [relativePath, id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                socketService.emit('dept_update', { type: 'UPDATE', id });
                res.json({ message: "HOD signature uploaded successfully" });
            });
        } catch (err) {
            console.error("[HOD Signature] Processing Error:", err.message);
            res.status(500).json({ error: "Failed to process signature" });
        }
    });
};

// Delete HOD Signature for a Department
exports.deleteHodSignature = (req, res) => {
    const { id } = req.params;

    // Get department name to delete the correct file
    db.get("SELECT name FROM departments WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row?.name) imageService.deleteImageFile('signatures', 'hod_' + row.name);

        const sql = "UPDATE departments SET hod_signature = NULL, updated_at = datetime('now', '+05:30') WHERE id = ?";
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Department not found" });
            socketService.emit('dept_update', { type: 'UPDATE', id });
            res.json({ message: "HOD signature deleted successfully" });
        });
    });
};

// Get single department (for fetching HOD signature)
exports.getDepartmentById = (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM departments WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Department not found" });
        res.json(row);
    });
};
