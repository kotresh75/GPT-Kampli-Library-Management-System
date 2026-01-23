const db = require('./db');
const { v4: uuidv4 } = require('uuid');

// 1. Check specific ISBN
const targetISBN = '9789355434029';

console.log(`Checking Book: ${targetISBN}...`);

db.get("SELECT * FROM books WHERE isbn = ?", [targetISBN], (err, book) => {
    if (err) {
        console.error("Error fetching book:", err);
        return;
    }
    if (!book) {
        console.error("❌ Book not found with ISBN:", targetISBN);
        console.log("Creating book now...");

        // Create Mock Book
        const bookId = uuidv4();
        db.run(`INSERT INTO books (id, isbn, title, author, publisher, total_copies) VALUES (?, ?, 'Mock Book Title', 'Mock Author', 'Mock Publisher', 10)`,
            [bookId, targetISBN], (err) => {
                if (err) console.error("Create Book Failed", err);
                else {
                    console.log("✅ Created Mock Book.");
                    createCopies(bookId, targetISBN, 1);
                }
            });
    } else {
        console.log("✅ Book Found:", book.title);
        checkCopies(book.id, targetISBN);
    }
});

function checkCopies(bookId, isbn) {
    db.all("SELECT * FROM book_copies WHERE book_id = ?", [bookId], (err, copies) => {
        if (err) {
            console.error("Error fetching copies:", err);
            return;
        }
        console.log(`Found ${copies.length} copies.`);

        // Check if a copy exists with Accession Number = ISBN (Simple case for testing)
        // OR if specific accession exists.
        // User tried scanning the ISBN as the Accession Number.
        // So we should verify if a copy exists where accession_number = isbn.

        const isbnCopy = copies.find(c => c.accession_number === isbn);
        if (isbnCopy) {
            console.log("✅ Copy with Accession Number = ISBN exists.");
            console.log("Status:", isbnCopy.status);
            if (isbnCopy.status !== 'Available') {
                console.log("⚠️ Copy is not Available. Resetting to Available...");
                db.run("UPDATE book_copies SET status = 'Available' WHERE id = ?", [isbnCopy.id], (err) => {
                    if (!err) console.log("✅ Copy reset to Available.");
                });
            }
        } else {
            console.log("❌ No copy found with Accession Number matching ISBN.");
            console.log("Creating proper copy now so scanning works...");
            createCopies(bookId, isbn, 1);
        }
    });
}

function createCopies(bookId, accessionPrefix, count) {
    // Create a copy where Accession Number IS the ISBN for testing simplicity
    // And maybe some others.

    const copyId = uuidv4();
    // Accession = accessionPrefix (which is the ISBN in this context)
    db.run(`INSERT INTO book_copies (id, accession_number, book_id, status, location) VALUES (?, ?, ?, 'Available', 'Shelf A')`,
        [copyId, accessionPrefix, bookId], (err) => {
            if (err) console.error("Failed to create copy:", err);
            else console.log(`✅ Created Copy with Accession: ${accessionPrefix}`);
        });
}
