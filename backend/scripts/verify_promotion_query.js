const db = require('../db');

console.log("Verifying Promotion Queries...");

const queryDefaulters = `
    SELECT s.id, s.full_name, s.register_number, s.semester, d.name as department,
            COUNT(DISTINCT t.id) as pending_books, 
            COUNT(DISTINCT f.id) as pending_fines
    FROM students s
    LEFT JOIN departments d ON s.dept_id = d.id
    LEFT JOIN circulation t ON s.id = t.student_id
    LEFT JOIN fines f ON s.id = f.student_id AND f.status = 'Unpaid'
    WHERE s.status = 'Active'
    GROUP BY s.id
    HAVING pending_books > 0 OR pending_fines > 0
`;

db.all(queryDefaulters, (err, rows) => {
    if (err) {
        console.error("❌ scanForPromotion Query FAILED:", err.message);
        process.exit(1);
    } else {
        console.log(`✅ scanForPromotion Query SUCCESS. Found ${rows.length} defaulters.`);

        const queryGetDefaulters = `
            SELECT s.id, s.full_name as name, s.register_number as register_no, d.name as department, 
                   COUNT(DISTINCT t.id) as pending_books, 
                   COUNT(DISTINCT f.id) as pending_fines
            FROM students s
            LEFT JOIN departments d ON s.dept_id = d.id
            LEFT JOIN circulation t ON s.id = t.student_id
            LEFT JOIN fines f ON s.id = f.student_id AND f.status = 'Unpaid'
            WHERE s.status = 'Active'
            GROUP BY s.id
            HAVING pending_books > 0 OR pending_fines > 0
        `;

        db.all(queryGetDefaulters, (err, rows) => {
            if (err) {
                console.error("❌ getDefaulters Query FAILED:", err.message);
                process.exit(1);
            } else {
                console.log(`✅ getDefaulters Query SUCCESS. Found ${rows.length} defaulters.`);
                process.exit(0);
            }
        });
    }
});
