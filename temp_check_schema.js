const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = 'f:/GPTK Library Management System/backend/DB/lms.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Connect error:", err);
        return;
    }
    db.all('PRAGMA table_info(audit_logs)', (err, rows) => {
        if (err) console.error("Query error:", err);
        else console.log(JSON.stringify(rows, null, 2));
    });
});
