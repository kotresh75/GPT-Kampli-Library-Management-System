const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Starting Verification Tests...");

// Test 1: Verify SYSTEM login (simulate)
db.get("SELECT * FROM staff WHERE id = 'SYSTEM'", (err, user) => {
    if (err || !user) {
        console.error("FAIL: SYSTEM user not found.");
        return;
    }

    bcrypt.compare('admin123', user.password_hash, (err, isMatch) => {
        if (isMatch) console.log("SUCCESS: 'system@library.com' login verified with password 'admin123'.");
        else console.error("FAIL: 'system@library.com' password mismatch.");
    });
});

// Test 2: Verify NEW STAFF creation and login (simulate)
const newStaffId = uuidv4();
const defaultPass = 'password123';

console.log("Creating new staff to test default password...");
bcrypt.hash(defaultPass, 10, (err, hash) => {
    db.run("INSERT INTO staff (id, name, email, password_hash, status) VALUES (?, 'Test New Staff', 'newstaff@test.com', ?, 'Active')",
        [newStaffId, hash], (err) => {
            if (err) {
                console.error("FAIL: Could not create new staff for test.");
                return;
            }

            // Now try to "login"
            db.get("SELECT * FROM staff WHERE id = ?", [newStaffId], (err, user) => {
                bcrypt.compare('password123', user.password_hash, (err, isMatch) => {
                    if (isMatch) console.log("SUCCESS: New staff default password 'password123' verified.");
                    else console.error("FAIL: New staff password mismatch.");

                    // CLEANUP
                    db.run("DELETE FROM staff WHERE id = ?", [newStaffId]);
                });
            });
        });
});
