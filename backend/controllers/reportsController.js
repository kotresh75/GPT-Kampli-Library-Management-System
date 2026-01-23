const db = require('../db');

// Helper to run query as promise
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.getCirculationStats = async (req, res) => {
    try {
        const { period } = req.query; // e.g. '30days' (default)

        // 1. Summary Counts
        // Active Issues (Currently in circulation)
        const activeIssuesSql = "SELECT COUNT(*) as count FROM circulation";
        // Monthly Returns (Completed transactions)
        const monthlyReturnsSql = "SELECT COUNT(*) as count FROM transaction_logs WHERE action_type = 'RETURN' AND timestamp >= date('now', '-30 days')";
        // Overdue Items
        const overdueSql = "SELECT COUNT(*) as count FROM circulation WHERE date(due_date) < date('now')";

        const activeIssued = await runQuery(activeIssuesSql);
        const monthlyReturns = await runQuery(monthlyReturnsSql);
        const activeOverdue = await runQuery(overdueSql);

        // 2. Trend Chart (Last 14 Days) - Daily Issue vs Return
        // Note: SQLite doesn't have a simple date sequence generator without recursion, so we group by existing data.
        const dailyTrendSql = `
            SELECT date(timestamp) as date, action_type, COUNT(*) as count 
            FROM transaction_logs 
            WHERE timestamp >= date('now', '-14 days')
            AND action_type IN ('ISSUE', 'RETURN')
            GROUP BY date(timestamp), action_type
            ORDER BY date(timestamp)
        `;
        const trendRaw = await runQuery(dailyTrendSql);

        // Process trend data frontend-friendly [ { date, issue, return } ]
        const trendMap = {};
        trendRaw.forEach(row => {
            if (!trendMap[row.date]) trendMap[row.date] = { date: row.date, issue: 0, return: 0 };
            if (row.action_type === 'ISSUE') trendMap[row.date].issue = row.count;
            if (row.action_type === 'RETURN') trendMap[row.date].return = row.count;
        });
        const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

        // 3. Top Borrowed Books (from transaction logs in last 90 days)
        const topBooksSql = `
            SELECT b.title, COUNT(t.id) as count
            FROM transaction_logs t
            JOIN book_copies bc ON t.copy_id = bc.id
            JOIN books b ON bc.book_isbn = b.isbn
            WHERE t.action_type = 'ISSUE'
            AND t.timestamp >= date('now', '-90 days')
            GROUP BY b.title
            ORDER BY count DESC
            LIMIT 5
        `;
        const topBooks = await runQuery(topBooksSql);

        res.json({
            summary: {
                active_issued: activeIssued[0].count,
                monthly_returns: monthlyReturns[0].count,
                active_overdue: activeOverdue[0].count
            },
            trend,
            top_books: topBooks
        });
    } catch (err) {
        console.error("Circulation Report Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getFinancialStats = async (req, res) => {
    try {
        // 1. Financial Summary
        const collectedSql = "SELECT SUM(amount) as total FROM fines WHERE status = 'Paid'";
        const pendingSql = "SELECT SUM(amount) as total FROM fines WHERE status = 'Unpaid'";
        const waivedSql = "SELECT SUM(amount) as total FROM fines WHERE status = 'Waived'"; // Assuming 'Waived' or 'Paid' with remark? Checking status generally.

        const collected = await runQuery(collectedSql);
        const pending = await runQuery(pendingSql);
        const waived = await runQuery(waivedSql);

        // 2. Daily Collection Trend (Last 30 days)
        const dailyCollectionSql = `
            SELECT date(payment_date) as date, SUM(amount) as total
            FROM fines
            WHERE status IN ('Paid', 'Waived') 
            AND payment_date >= date('now', '-30 days')
            GROUP BY date(payment_date)
            ORDER BY date(payment_date)
        `;
        const trend = await runQuery(dailyCollectionSql);

        res.json({
            summary: {
                collected: collected[0].total || 0,
                pending: pending[0].total || 0,
                waived: waived[0].total || 0
            },
            trend
        });
    } catch (err) {
        console.error("Financial Report Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getInventoryStats = async (req, res) => {
    try {
        // 1. Base Counts
        const totalBooks = await runQuery("SELECT COUNT(*) as count FROM books");
        const totalCopies = await runQuery("SELECT COUNT(*) as count FROM book_copies");
        const totalValue = await runQuery("SELECT SUM(price) as total FROM books"); // Approximate value if price is in 'books'
        // Note: If price is per copy, we'd need to join or assume. Assuming 'price' is in books schema per title.

        // 2. Distribution by Department
        const byDeptSql = `
            SELECT d.name, COUNT(bc.id) as count 
            FROM book_copies bc
            JOIN books b ON bc.book_isbn = b.isbn
            JOIN departments d ON b.dept_id = d.id 
            GROUP BY d.name
        `;
        const byDept = await runQuery(byDeptSql);

        // 3. Status Dist
        const byStatusSql = `
            SELECT status, COUNT(*) as count 
            FROM book_copies 
            GROUP BY status
        `;
        const byStatus = await runQuery(byStatusSql);

        res.json({
            summary: {
                titles: totalBooks[0].count,
                volumes: totalCopies[0].count,
                estimated_value: totalValue[0]?.total || 0
            },
            distribution: {
                department: byDept,
                status: byStatus
            }
        });
    } catch (err) {
        console.error("Inventory Report Error:", err);
        res.status(500).json({ error: err.message });
    }
};
