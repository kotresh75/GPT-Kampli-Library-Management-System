const db = require('./db');

const testQuery = async () => {
    const student_id = 'd1974921-a3d7-47a7-9c33-1c9c7495ccee'; // Kotresh C
    const status = undefined;
    const search = undefined;
    const limit = 100;

    let query = `
        SELECT l.id, l.session_txn_id, l.timestamp as date, l.action_type as status,
               COALESCE(s.full_name, l.student_name, json_extract(l.details, '$.student_name')) as student_name, 
               COALESCE(s.register_number, l.student_reg_no, json_extract(l.details, '$.student_reg_no'), json_extract(l.details, '$.roll_number')) as register_number, 
               COALESCE(d.name, l.student_dept, json_extract(l.details, '$.student_dept')) as department_name,
               COALESCE(b.title, l.book_title, json_extract(l.details, '$.book_title')) as book_title, 
               COALESCE(b.isbn, l.book_isbn, json_extract(l.details, '$.book_isbn')) as isbn, 
               COALESCE(c.accession_number, json_extract(l.details, '$.accession'), json_extract(l.details, '$.copy_accession')) as accession_number,
               l.details
        FROM transaction_logs l
        LEFT JOIN students s ON l.student_id = s.id
        LEFT JOIN departments d ON s.dept_id = d.id
        LEFT JOIN book_copies c ON l.copy_id = c.id
        LEFT JOIN books b ON c.book_isbn = b.isbn
        WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'All') {
        query += ` AND l.action_type = ?`;
        params.push(status.toUpperCase());
    }

    if (student_id) {
        // Strict match for Student ID
        query += ` AND (l.student_id = ?)`;
        params.push(student_id);
    }

    query += ` ORDER BY REPLACE(l.timestamp, 'T', ' ') DESC LIMIT ?`;
    params.push(limit);

    console.log("Query:", query);
    console.log("Params:", params);

    db.all(query, params, (err, rows) => {
        if (err) console.error("Error:", err);
        else console.log("Rows found:", rows.length);
        if (rows.length > 0) console.log("First Row:", rows[0]);
    });
};

testQuery();
