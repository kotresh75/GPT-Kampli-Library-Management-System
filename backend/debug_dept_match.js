const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

const inputs = ['CSE', 'CS', 'ECE', 'EC', 'ME', 'MECH', 'Civil', 'CE', 'RandomCode', 'Computer Science'];

console.log("--- Testing Department Resolution ---");

db.serialize(() => {
    const check = (input) => {
        return new Promise((resolve) => {
            const searchTerm = input.trim();
            // The exact SQL from bookController.js
            const sql = `
                SELECT id, name, code FROM departments 
                WHERE upper(name) = upper(?) 
                   OR upper(code) = upper(?) 
                   OR upper(?) LIKE (upper(code) || '%')
            `;

            db.get(sql, [searchTerm, searchTerm, searchTerm], (err, row) => {
                if (err) console.error("Error:", err);
                console.log(`Input: "${input}" -> Resolved: ${row ? `${row.code} (${row.name})` : 'NULL'}`);
                resolve();
            });
        });
    };

    const run = async () => {
        for (const input of inputs) {
            await check(input);
        }
    };

    run();
});
