const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err);
    db.run('DROP TABLE audit_logs', (err) => {
        if (err) console.error("Drop error:", err);
        else console.log("Dropped table audit_logs. Restart server to recreate.");
    });
});
