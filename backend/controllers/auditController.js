const db = require('../db');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

exports.getAllLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, startDate, endDate, action_type, module, role, search } = req.query;
        const offset = (page - 1) * limit;

        // Base Query - actor_id can be UUID or email, so check both id and email matches
        let query = `
            SELECT al.*, 
                   COALESCE(a.name, s.name, 'System') as actor_name, 
                   COALESCE(a.email, s.email, al.actor_id) as actor_email
            FROM audit_logs al
            LEFT JOIN admins a ON (al.actor_id = a.id OR al.actor_id = a.email) AND al.actor_role = 'Admin'
            LEFT JOIN staff s ON (al.actor_id = s.id OR al.actor_id = s.email) AND al.actor_role = 'Staff'
            WHERE 1=1
        `;

        const params = [];

        // Filters
        if (startDate) {
            query += ` AND date(al.timestamp) >= date(?)`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND date(al.timestamp) <= date(?)`;
            params.push(endDate);
        }
        if (action_type) {
            query += ` AND al.action_type = ?`;
            params.push(action_type);
        }
        if (module) {
            query += ` AND al.module = ?`;
            params.push(module);
        }
        if (role) {
            query += ` AND al.actor_role = ?`;
            params.push(role);
        }
        if (search) {
            query += ` AND (al.description LIKE ? OR al.metadata LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        // Count Total for Pagination
        const countQuery = `SELECT count(*) as total FROM (` + query + `)`;

        // Sorting
        const { sortBy = 'timestamp', order = 'desc' } = req.query;
        const validSortColumns = ['timestamp', 'action_type', 'module', 'actor_role'];
        const sortColumn = validSortColumns.includes(sortBy) ? `al.${sortBy}` : 'al.timestamp';
        const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Finalize Data Query
        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;

        // Execute Count
        const totalResult = await new Promise((resolve, reject) => {
            // Need to reconstruct params for count query appropriately or just use the where clause part
            // SQLite safe way:
            const whereClauseStartIndex = query.indexOf('WHERE');
            const whereClauseEndIndex = query.indexOf('ORDER BY');
            const whereClause = query.substring(whereClauseStartIndex, whereClauseEndIndex);

            // Re-using params (they match the WHERE clause)
            db.get(`SELECT count(*) as total FROM audit_logs al LEFT JOIN admins a ON (al.actor_id = a.id OR al.actor_id = a.email) AND al.actor_role = 'Admin' LEFT JOIN staff s ON (al.actor_id = s.id OR al.actor_id = s.email) AND al.actor_role = 'Staff' ${whereClause}`, params, (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        });

        // Execute Data Query
        const logs = await new Promise((resolve, reject) => {
            db.all(query, [...params, limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            data: logs,
            pagination: {
                total: totalResult,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalResult / limit)
            }
        });

    } catch (err) {
        console.error("Audit Logs Error:", err);
        res.status(500).json({ error: "Failed to fetch audit logs" });
    }
};

exports.getAuditStats = async (req, res) => {
    try {
        const getCount = (condition) => {
            return new Promise((resolve, reject) => {
                db.get(`SELECT count(*) as count FROM audit_logs WHERE ${condition}`, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.count : 0);
                });
            });
        };

        const [totalToday, securityAlerts, adminActions, totalCount] = await Promise.all([
            getCount("date(timestamp) = date('now')"),
            getCount("module = 'Security' AND date(timestamp) > date('now', '-30 days')"),
            getCount("actor_role = 'Admin' AND date(timestamp) = date('now')"),
            getCount("1=1")
        ]);

        res.json({
            today: totalToday,
            security: securityAlerts,
            admin_today: adminActions,
            total_logs: totalCount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.exportLogs = async (req, res) => {
    try {
        // Simple CSV export of ALL matching current filters (ignoring pagination)
        const { startDate, endDate, action_type, module, role, search } = req.query;
        console.log("Exporting logs, format:", req.query.format);

        let query = `
            SELECT al.timestamp, al.actor_role, 
                   COALESCE(a.name, s.name, 'System') as actor_name, 
                   al.action_type, al.module, al.description 
            FROM audit_logs al
            LEFT JOIN admins a ON (al.actor_id = a.id OR al.actor_id = a.email) AND al.actor_role = 'Admin'
            LEFT JOIN staff s ON (al.actor_id = s.id OR al.actor_id = s.email) AND al.actor_role = 'Staff'
            WHERE 1=1
        `;

        const params = [];

        if (startDate) { query += ` AND date(al.timestamp) >= date(?)`; params.push(startDate); }
        if (endDate) { query += ` AND date(al.timestamp) <= date(?)`; params.push(endDate); }
        if (action_type) { query += ` AND al.action_type = ?`; params.push(action_type); }
        if (module) { query += ` AND al.module = ?`; params.push(module); }
        if (role) { query += ` AND al.actor_role = ?`; params.push(role); }
        if (search) {
            query += ` AND (al.description LIKE ? OR al.metadata LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY al.timestamp DESC`;

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            const format = req.query.format || 'csv';

            if (format === 'xlsx') {
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(rows.map(row => ({
                    Timestamp: row.timestamp,
                    Role: row.actor_role,
                    Name: row.actor_name,
                    Action: row.action_type,
                    Module: row.module,
                    Description: row.description
                })));
                XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");
                const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

                res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.attachment('audit_logs.xlsx');
                return res.send(buffer);
            }

            if (format === 'pdf') {
                const doc = new PDFDocument();
                res.header('Content-Type', 'application/pdf');
                res.attachment('audit_logs.pdf');
                doc.pipe(res);

                doc.fontSize(18).text('Audit Logs', { align: 'center' });
                doc.moveDown();

                rows.forEach(row => {
                    doc.fontSize(10).font('Helvetica-Bold').text(`[${row.timestamp}] ${row.action_type} - ${row.module}`);
                    doc.font('Helvetica').text(`User: ${row.actor_name} (${row.actor_role})`);
                    doc.text(`Description: ${row.description}`);
                    doc.moveDown(0.5);
                    doc.lineWidth(0.5).moveTo(doc.x, doc.y).lineTo(500, doc.y).stroke();
                    doc.moveDown(0.5);
                });

                doc.end();
                return;
            }

            // Default CSV
            const header = "Timestamp,Role,Name,Action,Module,Description\n";
            const csv = rows.map(row => {
                const safeDesc = row.description ? `"${row.description.replace(/"/g, '""')}"` : "";
                return `${row.timestamp},${row.actor_role},${row.actor_name},${row.action_type},${row.module},${safeDesc}`;
            }).join("\n");

            res.header('Content-Type', 'text/csv');
            res.attachment('audit_logs.csv');
            return res.send(header + csv);
        });

    } catch (err) {
        res.status(500).json({ error: "Export failed" });
    }
};
