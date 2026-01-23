const db = require('./backend/db');

console.log("Seeding 'SYSTEM' staff user...");

const id = 'SYSTEM';
const name = 'System Administrator';
const email = 'system@library.com';
const password_hash = '$2b$10$SystemHashValueForMocking123'; // Mock hash
const status = 'Active';

db.run(`INSERT OR IGNORE INTO staff (id, name, email, password_hash, status) VALUES (?, ?, ?, ?, ?)`,
    [id, name, email, password_hash, status],
    function (err) {
        if (err) {
            console.error("Error inserting SYSTEM user:", err);
        } else {
            console.log(`SYSTEM user processed. Changes: ${this.changes}`);
        }
    }
);
