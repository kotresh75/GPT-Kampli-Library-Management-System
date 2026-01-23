const db = require('./db');

console.log("Checking books table...");
db.all("SELECT * FROM books", [], (err, rows) => {
    if (err) {
        console.error("Error:", err.message);
    } else {
        console.log("Books found:", rows.length);
        console.log(JSON.stringify(rows, null, 2));
    }
});

console.log("Checking book_copies table...");
db.all("SELECT * FROM book_copies", [], (err, rows) => {
    if (err) console.error(err);
    else console.log("Copies found:", rows.length);
});

setTimeout(() => process.exit(0), 1000);
