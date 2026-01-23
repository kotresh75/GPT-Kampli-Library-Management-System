const db = require('../db');

exports.getAllLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, startDate, endDate, action_type, module, role, search } = req.query;
        const offset = (page - 1) * limit;

        // Base Query
        let query = `
            SELECT al.*, 
                   COALESCE(a.name, s.name, 'System') as actor_name, 
                   COALESCE(a.email, s.email, 'system@gptk.edu.in') as actor_email
            FROM audit_logs al
            LEFT JOIN admins a ON al.actor_id = a.id AND al.actor_role = 'Admin'
            LEFT JOIN staff s ON al.actor_id = s.id AND al.actor_role = 'Staff'
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
            db.get(`SELECT count(*) as total FROM audit_logs al LEFT JOIN admins a ON al.actor_id = a.id AND al.actor_role = 'Admin' LEFT JOIN staff s ON al.actor_id = s.id AND al.actor_role = 'Staff' ${whereClause}`, params, (err, row) => {
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

        const [totalToday, securityAlerts, adminActions] = await Promise.all([
            getCount("date(timestamp) = date('now')"),
            getCount("module = 'Security' AND date(timestamp) > date('now', '-30 days')"),
            getCount("actor_role = 'Admin' AND date(timestamp) = date('now')")
        ]);

        res.json({
            today: totalToday,
            security: securityAlerts,
            admin_today: adminActions
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.exportLogs = async (req, res) => {
    try {
        // Simple CSV export of ALL matching current filters (ignoring pagination)
        const { startDate, endDate, action_type, module, role, search } = req.query;

        let query = `
            SELECT al.timestamp, al.actor_role, 
                   COALESCE(a.name, s.name, 'System') as actor_name, 
                   al.action_type, al.module, al.description 
            FROM audit_logs al
            LEFT JOIN admins a ON al.actor_id = a.id AND al.actor_role = 'Admin'
            LEFT JOIN staff s ON al.actor_id = s.id AND al.actor_role = 'Staff'
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

            // Generate CSV
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
