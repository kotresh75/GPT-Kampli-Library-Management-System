const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

const SYSTEM_PASSWORD = 'admin123';
const SALT_ROUNDS = 10;

console.log(`Resetting 'system@library.com' password to '${SYSTEM_PASSWORD}'...`);

bcrypt.hash(SYSTEM_PASSWORD, SALT_ROUNDS, (err, hash) => {
    if (err) {
        console.error("Hashing failed:", err);
        return;
    }

    db.run("UPDATE staff SET password_hash = ? WHERE id = 'SYSTEM'", [hash], function (err) {
        if (err) {
            console.error("Update failed:", err);
        } else {
            console.log(`Success! Updated ${this.changes} row(s).`);
            console.log("You can now login as 'system@library.com' with password 'admin123'.");
        }
    });

    // Also verify strict match for a random new staff to ensure create flow is good
    // Actually, createStaff uses 'password123' by default. Let's not mess with others unless requested.
});
