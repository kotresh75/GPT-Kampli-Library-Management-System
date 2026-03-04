const db = require('./db');
const settingsHandler = require('./controllers/settingsHandler');
const bcrypt = require('bcryptjs');

const TEST_ADMIN_ID = 'TEST_ADMIN_DEBUG';
const TEST_PASSWORD = 'password123';
const TEST_KEY = 'backup_test_key';

async function runTest() {
    console.log("Starting Debug Test...");

    // 1. Setup Test Admin
    console.log("Creating Test Admin...");
    await new Promise((resolve, reject) => {
        const hash = bcrypt.hashSync(TEST_PASSWORD, 10);
        db.run("INSERT OR REPLACE INTO admins (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [TEST_ADMIN_ID, 'test@debug.com', hash, 'Test Admin', 'Super Admin', new Date().toISOString()],
            (err) => {
                if (err) reject(err);
                else resolve();
            });
    });

    // 2. Mock Request/Response
    const req = {
        body: {
            updates: {
                [TEST_KEY]: { connectionUri: "mongodb://test", autoBackup: true }
            },
            admin_id: TEST_ADMIN_ID,
            admin_password: TEST_PASSWORD
        }
    };

    const res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log(`Response [${this.statusCode || 200}]:`, JSON.stringify(data, null, 2));
            this.data = data;
        }
    };

    // 3. Call Controller
    console.log("Calling updateAppSettings...");
    try {
        await settingsHandler.updateAppSettings(req, res);
    } catch (e) {
        console.error("Controller threw error:", e);
    }

    // 4. Verify DB
    console.log("Verifying DB...");
    await new Promise((resolve) => {
        db.get("SELECT value FROM system_settings WHERE key = ?", [TEST_KEY], (err, row) => {
            if (err) console.error("DB Error:", err);
            else {
                console.log("DB Value:", row ? row.value : "NOT FOUND");
            }
            resolve();
        });
    });

    // 5. Cleanup
    console.log("Cleaning up...");
    db.run("DELETE FROM admins WHERE id = ?", [TEST_ADMIN_ID]);
    db.run("DELETE FROM system_settings WHERE key = ?", [TEST_KEY]);
    
    // Check if real backup_config exists and print it (masked)
    db.get("SELECT value FROM system_settings WHERE key = 'backup_config'", (err, row) => {
        if (row) {
            console.log("Current Real Backup Config:", row.value);
        } else {
            console.log("Real Backup Config: NOT FOUND");
        }
    });

    setTimeout(() => {
        console.log("Done.");
        process.exit(0);
    }, 1000);
}

// Wait for DB connection
setTimeout(runTest, 2000);
