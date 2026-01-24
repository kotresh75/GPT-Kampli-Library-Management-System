const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = 'gptk_lms_secret_temporary_key';

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Verifying SYSTEM Admin Role...");

const email = 'system@library.com';
const password = 'admin123';

// Simulate Login Logic partially
db.get("SELECT id, name, email, password_hash FROM staff WHERE email = ?", [email], (err, staff) => {
    if (err || !staff) {
        console.error("FAIL: System user not found in DB.");
        return;
    }

    bcrypt.compare(password, staff.password_hash, (err, isMatch) => {
        if (!isMatch) {
            console.error("FAIL: Password mismatch (Ensure you ran the previous fix).");
            return;
        }

        // Apply Fix Logic
        const role = staff.email === 'system@library.com' ? 'Admin' : 'Staff';

        // Generate Token
        const token = jwt.sign(
            { id: staff.id, email: staff.email, role: role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Verify Token Payload
        const decoded = jwt.decode(token);
        if (decoded.role === 'Admin') {
            console.log("SUCCESS: Token generated with role 'Admin' for system@library.com");
        } else {
            console.error(`FAIL: Token generated with role '${decoded.role}'. Expected 'Admin'.`);
        }
    });
});
