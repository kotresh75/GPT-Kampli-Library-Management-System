const db = require('../db');
const bcrypt = require('bcryptjs');
const auditService = require('../services/auditService');

// ─── Constants ──────────────────────────────────────────
const MAX_CELL_PREVIEW = 200;   // Truncate cells longer than this in grid view
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

// ─── Helpers ────────────────────────────────────────────

/**
 * Get list of valid user tables from sqlite_master (excludes internal sqlite tables).
 */
function getValidTables() {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
            [],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(r => r.name));
            }
        );
    });
}

/**
 * Validate that a table name exists in the database (prevents SQL injection).
 */
async function validateTable(tableName) {
    const tables = await getValidTables();
    return tables.includes(tableName);
}

/**
 * Truncate a string value for grid display.
 */
function truncateValue(value, maxLen = MAX_CELL_PREVIEW) {
    if (value === null || value === undefined) return value;
    const str = String(value);
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen);
}

// ─── 1. Verify Access ──────────────────────────────────
// POST /api/database/verify-access
// Verifies the admin's password before granting DB viewer access.
exports.verifyAccess = (req, res) => {
    const { password } = req.body;
    const { id, role } = req.user; // from verifyAdmin middleware

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    // Determine table based on role
    let table = role === 'Admin' ? 'admins' : 'staff';
    if (id === 'SYSTEM') table = 'staff';

    db.get(`SELECT password_hash FROM ${table} WHERE id = ?`, [id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Authentication error' });
            if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

            // Audit log
            auditService.log(
                req.user,
                'DB_VIEWER_ACCESS',
                'Database',
                `Admin accessed DB Viewer`,
                { ip: req.ip }
            );

            res.json({ success: true, message: 'Access granted' });
        });
    });
};

// ─── 2. List Tables ─────────────────────────────────────
// GET /api/database/tables
exports.listTables = async (req, res) => {
    try {
        const tables = await getValidTables();

        // Get row count for each table
        const tableInfoPromises = tables.map(tableName => {
            return new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM "${tableName}"`, [], (err, row) => {
                    if (err) return resolve({ name: tableName, count: 0, error: err.message });
                    resolve({ name: tableName, count: row.count });
                });
            });
        });

        const tableInfo = await Promise.all(tableInfoPromises);
        res.json({ tables: tableInfo });
    } catch (err) {
        console.error('[DB Viewer] Error listing tables:', err);
        res.status(500).json({ error: err.message });
    }
};

// ─── 3. Get Table Schema ────────────────────────────────
// GET /api/database/schema/:table
exports.getSchema = async (req, res) => {
    const { table } = req.params;

    try {
        const isValid = await validateTable(table);
        if (!isValid) return res.status(400).json({ error: `Invalid table: ${table}` });

        db.all(`PRAGMA table_info("${table}")`, [], (err, columns) => {
            if (err) return res.status(500).json({ error: err.message });

            // Also fetch foreign keys
            db.all(`PRAGMA foreign_key_list("${table}")`, [], (fkErr, fkeys) => {
                const foreignKeys = fkErr ? [] : fkeys;

                res.json({
                    table,
                    columns: columns.map(col => ({
                        cid: col.cid,
                        name: col.name,
                        type: col.type || 'TEXT',
                        notnull: col.notnull === 1,
                        defaultValue: col.dflt_value,
                        pk: col.pk === 1
                    })),
                    foreignKeys: foreignKeys.map(fk => ({
                        from: fk.from,
                        toTable: fk.table,
                        toColumn: fk.to
                    }))
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── 4. Query Table (Paginated) ─────────────────────────
// GET /api/database/query/:table
// Query params: page, pageSize, sortBy, sortDir, search, filters (JSON)
exports.queryTable = async (req, res) => {
    const { table } = req.params;

    try {
        const isValid = await validateTable(table);
        if (!isValid) return res.status(400).json({ error: `Invalid table: ${table}` });

        // Parse query parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE));
        const sortBy = req.query.sortBy || null;
        const sortDir = (req.query.sortDir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const search = req.query.search || '';
        let filters = [];
        try {
            if (req.query.filters) filters = JSON.parse(req.query.filters);
        } catch (e) { /* ignore parse errors */ }

        // Get columns first for search and validation
        const columns = await new Promise((resolve, reject) => {
            db.all(`PRAGMA table_info("${table}")`, [], (err, cols) => {
                if (err) return reject(err);
                resolve(cols);
            });
        });

        const columnNames = columns.map(c => c.name);

        // Build WHERE clause
        let whereClauses = [];
        let whereParams = [];

        // Global search across all columns
        if (search.trim()) {
            const searchClauses = columnNames.map(col => `"${col}" LIKE ?`);
            whereClauses.push(`(${searchClauses.join(' OR ')})`);
            columnNames.forEach(() => whereParams.push(`%${search.trim()}%`));
        }

        // Column-specific filters
        if (Array.isArray(filters)) {
            filters.forEach(f => {
                if (!f.column || !columnNames.includes(f.column)) return;
                const col = `"${f.column}"`;

                switch (f.operator) {
                    case 'equals':
                        whereClauses.push(`${col} = ?`);
                        whereParams.push(f.value);
                        break;
                    case 'not_equals':
                        whereClauses.push(`${col} != ?`);
                        whereParams.push(f.value);
                        break;
                    case 'contains':
                        whereClauses.push(`${col} LIKE ?`);
                        whereParams.push(`%${f.value}%`);
                        break;
                    case 'starts_with':
                        whereClauses.push(`${col} LIKE ?`);
                        whereParams.push(`${f.value}%`);
                        break;
                    case 'ends_with':
                        whereClauses.push(`${col} LIKE ?`);
                        whereParams.push(`%${f.value}`);
                        break;
                    case 'is_null':
                        whereClauses.push(`${col} IS NULL`);
                        break;
                    case 'is_not_null':
                        whereClauses.push(`${col} IS NOT NULL`);
                        break;
                    case 'gt':
                        whereClauses.push(`CAST(${col} AS REAL) > ?`);
                        whereParams.push(parseFloat(f.value));
                        break;
                    case 'lt':
                        whereClauses.push(`CAST(${col} AS REAL) < ?`);
                        whereParams.push(parseFloat(f.value));
                        break;
                    case 'gte':
                        whereClauses.push(`CAST(${col} AS REAL) >= ?`);
                        whereParams.push(parseFloat(f.value));
                        break;
                    case 'lte':
                        whereClauses.push(`CAST(${col} AS REAL) <= ?`);
                        whereParams.push(parseFloat(f.value));
                        break;
                }
            });
        }

        const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Validate sortBy column
        const orderStr = sortBy && columnNames.includes(sortBy)
            ? `ORDER BY "${sortBy}" ${sortDir}`
            : `ORDER BY rowid ASC`;

        const offset = (page - 1) * pageSize;

        // Get total count (with filters)
        const countResult = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as total FROM "${table}" ${whereStr}`, whereParams, (err, row) => {
                if (err) return reject(err);
                resolve(row.total);
            });
        });

        // Get data
        const query = `SELECT rowid, * FROM "${table}" ${whereStr} ${orderStr} LIMIT ? OFFSET ?`;
        const queryParams = [...whereParams, pageSize, offset];

        db.all(query, queryParams, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            // Truncate large values and flag them
            const processedRows = rows.map(row => {
                const truncatedFields = [];
                const processedRow = {};

                Object.entries(row).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && String(value).length > MAX_CELL_PREVIEW) {
                        processedRow[key] = truncateValue(value);
                        truncatedFields.push(key);
                    } else {
                        processedRow[key] = value;
                    }
                });

                processedRow.__truncated = truncatedFields;
                return processedRow;
            });

            res.json({
                table,
                data: processedRows,
                pagination: {
                    page,
                    pageSize,
                    totalRows: countResult,
                    totalPages: Math.ceil(countResult / pageSize)
                },
                columns: columns.map(c => ({
                    name: c.name,
                    type: c.type || 'TEXT',
                    pk: c.pk === 1
                }))
            });
        });
    } catch (err) {
        console.error('[DB Viewer] Query error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ─── 5. Get Full Cell Value ─────────────────────────────
// GET /api/database/cell/:table/:rowid/:column
exports.getCellValue = async (req, res) => {
    const { table, rowid, column } = req.params;

    try {
        const isValid = await validateTable(table);
        if (!isValid) return res.status(400).json({ error: `Invalid table: ${table}` });

        // Validate column
        const columns = await new Promise((resolve, reject) => {
            db.all(`PRAGMA table_info("${table}")`, [], (err, cols) => {
                if (err) return reject(err);
                resolve(cols.map(c => c.name));
            });
        });

        if (!columns.includes(column)) {
            return res.status(400).json({ error: `Invalid column: ${column}` });
        }

        db.get(`SELECT "${column}" FROM "${table}" WHERE rowid = ?`, [rowid], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Row not found' });

            const value = row[column];
            const length = value !== null && value !== undefined ? String(value).length : 0;

            // Detect type
            let dataType = 'text';
            if (value === null) dataType = 'null';
            else if (typeof value === 'number') dataType = 'number';
            else if (String(value).startsWith('data:image/')) dataType = 'base64_image';
            else if (String(value).startsWith('{') || String(value).startsWith('[')) {
                try { JSON.parse(value); dataType = 'json'; } catch (e) { }
            }

            res.json({
                table,
                rowid: parseInt(rowid),
                column,
                value,
                length,
                dataType
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── 6. Insert Row ──────────────────────────────────────
// POST /api/database/row/:table
exports.insertRow = async (req, res) => {
    const { table } = req.params;
    const rowData = req.body.data;

    try {
        const isValid = await validateTable(table);
        if (!isValid) return res.status(400).json({ error: `Invalid table: ${table}` });

        if (!rowData || typeof rowData !== 'object' || Object.keys(rowData).length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }

        // Validate columns
        const columns = await new Promise((resolve, reject) => {
            db.all(`PRAGMA table_info("${table}")`, [], (err, cols) => {
                if (err) return reject(err);
                resolve(cols.map(c => c.name));
            });
        });

        const validKeys = Object.keys(rowData).filter(k => columns.includes(k));
        if (validKeys.length === 0) {
            return res.status(400).json({ error: 'No valid columns provided' });
        }

        const colNames = validKeys.map(k => `"${k}"`).join(', ');
        const placeholders = validKeys.map(() => '?').join(', ');
        const values = validKeys.map(k => rowData[k] === '' ? null : rowData[k]);

        const sql = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`;

        db.run(sql, values, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Audit
            auditService.log(
                req.user,
                'DB_INSERT',
                'Database',
                `Inserted row into ${table}`,
                { table, rowid: this.lastID }
            );

            res.json({
                success: true,
                message: `Row inserted into ${table}`,
                rowid: this.lastID,
                changes: this.changes
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── 7. Update Row ──────────────────────────────────────
// PUT /api/database/row/:table/:rowid
exports.updateRow = async (req, res) => {
    const { table, rowid } = req.params;
    const rowData = req.body.data;

    try {
        const isValid = await validateTable(table);
        if (!isValid) return res.status(400).json({ error: `Invalid table: ${table}` });

        if (!rowData || typeof rowData !== 'object' || Object.keys(rowData).length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }

        // Validate columns
        const columns = await new Promise((resolve, reject) => {
            db.all(`PRAGMA table_info("${table}")`, [], (err, cols) => {
                if (err) return reject(err);
                resolve(cols.map(c => c.name));
            });
        });

        const validKeys = Object.keys(rowData).filter(k => columns.includes(k));
        if (validKeys.length === 0) {
            return res.status(400).json({ error: 'No valid columns provided' });
        }

        const setClauses = validKeys.map(k => `"${k}" = ?`).join(', ');
        const values = validKeys.map(k => rowData[k] === '' ? null : rowData[k]);
        values.push(rowid);

        const sql = `UPDATE "${table}" SET ${setClauses} WHERE rowid = ?`;

        db.run(sql, values, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Row not found' });
            }

            // Audit
            auditService.log(
                req.user,
                'DB_UPDATE',
                'Database',
                `Updated row ${rowid} in ${table}`,
                { table, rowid, columns: validKeys }
            );

            res.json({
                success: true,
                message: `Row ${rowid} updated in ${table}`,
                changes: this.changes
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── 8. Delete Row ──────────────────────────────────────
// DELETE /api/database/row/:table/:rowid
exports.deleteRow = async (req, res) => {
    const { table, rowid } = req.params;

    try {
        const isValid = await validateTable(table);
        if (!isValid) return res.status(400).json({ error: `Invalid table: ${table}` });

        db.run(`DELETE FROM "${table}" WHERE rowid = ?`, [rowid], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Row not found' });
            }

            // Audit
            auditService.log(
                req.user,
                'DB_DELETE',
                'Database',
                `Deleted row ${rowid} from ${table}`,
                { table, rowid }
            );

            res.json({
                success: true,
                message: `Row ${rowid} deleted from ${table}`,
                changes: this.changes
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
