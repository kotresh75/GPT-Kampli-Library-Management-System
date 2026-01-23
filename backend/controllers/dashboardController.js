const db = require('../db');

exports.getStats = async (req, res) => {
    try {
        const getCount = (query) => {
            return new Promise((resolve, reject) => {
                db.get(query, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.count || row.total || 0 : 0);
                });
            });
        };

        const [
            totalBooks,
            totalStudents,
            booksIssuedToday,
            overdueBooks,
            totalFines,
            lostBooks
        ] = await Promise.all([
            getCount("SELECT count(*) as count FROM books"),
            getCount("SELECT count(*) as count FROM students"),
            // Use transaction_logs for today's issues
            getCount("SELECT count(*) as count FROM transaction_logs WHERE action_type = 'ISSUE' AND date(timestamp) = date('now')"),
            // Use circulation for active overdue loans
            getCount("SELECT count(*) as count FROM circulation WHERE date(due_date) < date('now')"),
            getCount("SELECT sum(amount) as total FROM fines WHERE is_paid = 1"),
            getCount("SELECT count(*) as count FROM book_copies WHERE status = 'Lost'")
        ]);

        res.json({
            totalBooks,
            totalStudents,
            booksIssuedToday,
            overdueBooks,
            totalFines: totalFines || 0,
            lostBooks
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

exports.getCharts = (req, res) => {
    const charts = {};

    // Books by Dept
    const booksByDeptQuery = `
        SELECT d.code as name, count(b.id) as value 
        FROM books b 
        JOIN departments d ON b.dept_id = d.id 
        GROUP BY d.id
    `;

    // Students by Dept
    const studentsByDeptQuery = `
        SELECT d.code as name, count(s.id) as value 
        FROM students s 
        JOIN departments d ON s.dept_id = d.id 
        GROUP BY d.id
    `;

    db.all(booksByDeptQuery, [], (err, bookRows) => {
        if (err) return res.status(500).json({ error: err.message });
        charts.booksByDept = bookRows;

        db.all(studentsByDeptQuery, [], (err, studentRows) => {
            if (err) return res.status(500).json({ error: err.message });
            charts.studentsByDept = studentRows;

            // Most Issued Books (Top 5) - From Transaction Logs
            const mostIssuedQuery = `
                SELECT b.title as name, count(tl.id) as value
                FROM transaction_logs tl
                JOIN book_copies bc ON tl.copy_id = bc.id
                JOIN books b ON bc.book_isbn = b.isbn
                WHERE tl.action_type = 'ISSUE'
                GROUP BY b.id
                ORDER BY value DESC
                LIMIT 5
            `;

            db.all(mostIssuedQuery, [], (err, topBooks) => {
                if (err) {
                    console.error("Error fetching top books:", err);
                    charts.mostIssuedBooks = []; // Fallback
                } else {
                    charts.mostIssuedBooks = topBooks;
                }
                res.json(charts);
            });
        });
    });
};

exports.getLogs = async (req, res) => {
    try {
        const getRecentLogs = (limit = 10) => {
            return new Promise((resolve, reject) => {
                db.all(`
                    SELECT * FROM audit_logs 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                `, [limit], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        };

        const logs = await getRecentLogs(10);

        res.json({
            recent: logs
        });

    } catch (err) {
        console.error("Dashboard Logs Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getDetails = (req, res) => {
    const { type } = req.query;
    let query = '';
    let params = [];

    if (type === 'issued_today') {
        // Transactions with Action ISSUE today
        query = `
            SELECT tl.timestamp, b.title, s.full_name as student, s.register_number, bc.accession_number
            FROM transaction_logs tl
            JOIN book_copies bc ON tl.copy_id = bc.id
            JOIN books b ON bc.book_isbn = b.isbn
            JOIN students s ON tl.student_id = s.id
            WHERE tl.action_type = 'ISSUE' 
            AND date(tl.timestamp) = date('now')
            ORDER BY tl.timestamp DESC
        `;
    } else if (type === 'overdue') {
        // Active loans past due date
        query = `
            SELECT c.due_date, b.title, s.full_name as student, s.register_number, bc.accession_number
            FROM circulation c
            JOIN book_copies bc ON c.copy_id = bc.id
            JOIN books b ON bc.book_isbn = b.isbn
            JOIN students s ON c.student_id = s.id
            WHERE date(c.due_date) < date('now')
            ORDER BY c.due_date ASC
        `;
    } else if (type === 'lost_damaged') {
        // Copies marked as Lost or Damaged
        query = `
            SELECT bc.updated_at as date, bc.status, b.title, bc.accession_number
             -- We might not have student info easily here unless we query last transaction, for simplicity listing books
            FROM book_copies bc
            JOIN books b ON bc.book_isbn = b.isbn
            WHERE bc.status IN ('Lost', 'Damaged')
            ORDER BY bc.updated_at DESC
        `;
    } else {
        return res.status(400).json({ error: "Invalid type" });
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Dashboard Detail Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};
