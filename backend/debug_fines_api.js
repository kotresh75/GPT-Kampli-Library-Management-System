const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Find a student with fines
    db.get("SELECT student_id, COUNT(*) as count FROM fines GROUP BY student_id LIMIT 1", (err, row) => {
        if (err) {
            console.error("Error finding student:", err);
            return;
        }
        if (!row) {
            console.log("No fines found in DB at all.");
            return;
        }

        const studentId = row.student_id;
        console.log(`Found student with fines: ${studentId} (Count: ${row.count})`);

        // 2. Run the specific query from fineController.js
        const sql = `
            SELECT f.*, f.remark as reason, s.full_name as student_name, s.register_number as roll_number, t.due_date, t.return_date, b.title as book_title
            FROM fines f
            JOIN students s ON f.student_id = s.id
            LEFT JOIN transaction_logs t ON f.transaction_id = t.id
            LEFT JOIN book_copies bc ON t.copy_id = bc.id 
            LEFT JOIN books b ON bc.book_isbn = b.isbn
            WHERE f.student_id = ?
            ORDER BY f.created_at DESC
        `;
        // Note: I adjusted 'bc.book_id = b.id' to 'bc.book_isbn = b.isbn' because earlier schema check showed 'book_isbn' in 'book_copies'.
        // Wait, let me check the original controller code again.
        // Controller has: LEFT JOIN books b ON bc.book_id = b.id
        // If 'book_copies' uses 'book_isbn', then 'book_id' might be null or missing, causing LEFT JOIN to fail (returning null titles), but rows should still appear.

        db.all(sql, [studentId], (err, rows) => {
            if (err) {
                console.error("Query Error:", err);
            } else {
                console.log(`Query returned ${rows.length} rows.`);
                console.log(JSON.stringify(rows[0], null, 2));
            }
        });
    });
});
