const db = require('./backend/db');

db.serialize(() => {
    console.log("Adding 'status' column to books table...");
    db.run("ALTER TABLE books ADD COLUMN status TEXT DEFAULT 'Active'", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column 'status' already exists.");
            } else {
                console.error("Failed to add column:", err.message);
            }
        } else {
            console.log("Successfully added 'status' column.");
        }
    });

    // Also verify or add for book_copies if needed, but user specifically asked for Books title stuff.
    // Let's stick to books first.
});
