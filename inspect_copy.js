const db = require('./backend/db');

const accession = '9780000000001-001';

console.log(`Inspecting Copy: ${accession}`);

db.get("SELECT * FROM book_copies WHERE accession_number = ?", [accession], (err, copy) => {
    if (err) {
        console.error("Error fetching copy:", err);
        return;
    }
    if (!copy) {
        console.error("Copy NOT FOUND in book_copies table (simple select).");
        return;
    }

    console.log("Copy Found:", copy);

    // Check Book linkage
    db.get("SELECT * FROM books WHERE id = ?", [copy.book_id], (err, bookById) => {
        console.log("Book by ID lookup:", bookById ? "Found" : "NOT FOUND", copy.book_id);
    });

    db.get("SELECT * FROM books WHERE isbn = ?", [copy.book_isbn], (err, bookByIsbn) => {
        console.log("Book by ISBN lookup:", bookByIsbn ? "Found" : "NOT FOUND", copy.book_isbn);
    });
});
