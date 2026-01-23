const db = require('./backend/db');

console.log("Fixing Schema: Dropping corrupted tables...");

db.serialize(() => {
    // Disable Foreign Keys temporarily to allow dropping
    db.run("PRAGMA foreign_keys = OFF;");

    db.run("DROP TABLE IF EXISTS transactions", (err) => {
        if (!err) console.log("Dropped transactions table.");
        else console.error("Error dropping transactions:", err);
    });

    db.run("DROP TABLE IF EXISTS fines", (err) => {
        if (!err) console.log("Dropped fines table.");
        else console.error("Error dropping fines:", err);
    });

    // Note: We rely on the app restart to recreate them via db.js initializeTables()
    // but we can also trigger it here if we exported it.
    // simpler to just ask user to restart.
});
