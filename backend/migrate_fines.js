const db = require('./db');

db.run("ALTER TABLE fines ADD COLUMN status TEXT DEFAULT 'Unpaid'", (err) => {
    if (err) {
        if (err.message.includes("duplicate column name")) {
            console.log("Column 'status' already exists.");
        } else {
            console.error("Migration Failed:", err);
        }
    } else {
        console.log("Migration Success: Added 'status' column to fines table.");
    }
});
