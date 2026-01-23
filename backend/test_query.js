const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

const query = `
    SELECT b.isbn, b.title, b.dept_id, b.category, d.id as joined_dept_id, d.name as joined_dept_name,
           COALESCE(d.name, b.category, 'Unassigned') as final_dept_name
    FROM books b
    LEFT JOIN departments d ON (b.dept_id = d.id OR (b.dept_id IS NULL AND b.category = d.name))
    LIMIT 5
`;

db.all(query, [], (err, rows) => {
    if (err) console.error(err);
    else console.table(rows);
});
