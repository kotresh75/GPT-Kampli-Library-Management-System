const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

const TEST_EMAIL = 'SYSTEM'; // Testing with ID 'SYSTEM' (system@library.com)
const NEW_HASH = '';

console.log("Simulating Password Reset for ID: " + TEST_EMAIL);

// 1. Manually hash
bcrypt.hash("password123", 10, (err, hash) => {
    if (err) {
        console.error("Bcrypt Error:", err);
        return;
    }
    console.log("Generated Hash:", hash);

    // 2. Try DB Update
    db.run("UPDATE staff SET password_hash=? WHERE id=?", [hash, TEST_EMAIL], function (err) {
        if (err) {
            console.error("DB Error:", err);
        } else {
            console.log("DB Update Success. Changes:", this.changes);
            if (this.changes === 0) console.warn("No rows updated. ID might be wrong.");
        }
    });
});
