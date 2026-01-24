const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Restoring SYSTEM password to 'admin123'...");
bcrypt.hash("admin123", 10, (err, hash) => {
    db.run("UPDATE staff SET password_hash=? WHERE id='SYSTEM'", [hash], function () {
        console.log("Restored. Changes:", this.changes);
    });
});
