const db = require('./db');

console.log("Applying DB patches Phase 2...");

db.serialize(() => {
    // 1. Add book_isbn column to book_copies
    db.run("ALTER TABLE book_copies ADD COLUMN book_isbn TEXT", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error("Error adding book_isbn:", err.message);
        } else {
            console.log("Column 'book_isbn' added to book_copies.");
        }
    });

    // 2. Clean up broken book records (id is null)
    db.run("DELETE FROM books WHERE id IS NULL", (err) => {
        if (!err) console.log("Cleaned up invalid book records.");
    });

    // 3. Clean up orphaned copies
    db.run("DELETE FROM book_copies WHERE book_isbn IS NULL", (err) => {
        if (!err) console.log("Cleaned up invalid copies.");
    });
});

setTimeout(() => {
    console.log("Patch complete.");
    process.exit(0);
}, 1000);
