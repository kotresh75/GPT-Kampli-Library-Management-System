const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'backend/DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("--- Removing Soft-Deleted Students ---");

db.serialize(() => {
    // 1. Check count before
    db.get("SELECT count(*) as count FROM students WHERE status = 'Deleted'", (err, row) => {
        if (err) {
            console.error("Error checking count:", err);
            return;
        }
        console.log(`Found ${row.count} soft-deleted students.`);

        if (row.count > 0) {
            // 2. Delete
            db.run("DELETE FROM students WHERE status = 'Deleted'", function (err) {
                if (err) {
                    console.error("Error deleting:", err);
                } else {
                    console.log(`Successfully deleted ${this.changes} records.`);
                }

                // 3. Verify
                db.get("SELECT count(*) as count FROM students WHERE status = 'Deleted'", (err, finalRow) => {
                    if (err) console.error(err);
                    else console.log(`Remaining soft-deleted students: ${finalRow.count}`);
                });
            });
        }
    });
});
