const db = require('./backend/db');

console.log("--- Inspecting Recent Transactions ---");

db.all("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1", [], (err, txns) => {
    if (err) { console.error(err); return; }
    if (txns.length === 0) { console.log("No transactions found."); return; }

    const txn = txns[0];
    console.log("Latest Transaction:", txn);

    // Check Student
    db.get("SELECT * FROM students WHERE id = ?", [txn.student_id], (err, student) => {
        console.log("Student:", student ? `${student.full_name} (${student.id})` : "NOT FOUND");
    });

    // Check Copy
    db.get("SELECT * FROM book_copies WHERE id = ?", [txn.copy_id], (err, copy) => {
        console.log("Copy:", copy ? `${copy.accession_number} (ISBN: ${copy.book_isbn}) (BookID: ${copy.book_id})` : "NOT FOUND");

        if (copy) {
            // Check Book via ISBN
            db.get("SELECT * FROM books WHERE isbn = ?", [copy.book_isbn], (err, book) => {
                console.log("Book (via ISBN):", book ? `${book.title} (${book.isbn})` : "NOT FOUND");
            });

            // Simulate the Loan Query
            const query = `
                SELECT t.id as transaction_id, b.title 
                FROM transactions t
                JOIN book_copies c ON t.copy_id = c.id
                JOIN books b ON c.book_isbn = b.isbn
                WHERE t.id = ?
            `;
            db.all(query, [txn.id], (err, rows) => {
                console.log("Query Test Result (using c.book_isbn = b.isbn):", rows.length > 0 ? "SUCCESS" : "FAILURE - No Match");
                if (rows.length > 0) console.log(rows);
            });
        }
    });
});
