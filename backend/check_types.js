const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err);
    db.all('SELECT DISTINCT action_type FROM audit_logs', (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });
});
