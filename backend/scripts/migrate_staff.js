const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Starting Staff Table Migration...");

    // 1. Rename existing table
    db.run("ALTER TABLE staff RENAME TO staff_old", (err) => {
        if (err) {
            console.error("Error renaming table (maybe already migrated?):", err.message);
            // If it fails, maybe table doesn't exist or already done. We'll try to proceed or exit.
            // If table doesn't exist, we can't rename. 
        } else {
            console.log("Renamed staff to staff_old");
        }
    });

    // 2. Create new table with updated CHECK constraint
    const createQuery = `CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        designation TEXT,
        access_permissions TEXT, -- JSON Array
        password_hash TEXT NOT NULL,
        status TEXT CHECK(status IN ('Active', 'Disabled', 'Deleted')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`;

    db.run(createQuery, (err) => {
        if (err) {
            console.error("Error creating new staff table:", err);
            return;
        }
        console.log("Created new staff table with updated schema");

        // 3. Copy data
        const copyQuery = `INSERT INTO staff (id, name, email, phone, designation, access_permissions, password_hash, status, created_at, last_login, updated_at)
                           SELECT id, name, email, phone, designation, access_permissions, password_hash, status, created_at, last_login, updated_at
                           FROM staff_old`;

        db.run(copyQuery, (err) => {
            if (err) {
                console.error("Error copying data:", err);
                // Attempt to rollback? simplified script, manual fix if fails.
                return;
            }
            console.log("Copied data to new table");

            // 4. Drop old table
            db.run("DROP TABLE staff_old", (err) => {
                if (err) console.error("Error dropping old table:", err);
                else console.log("Dropped staff_old table");

                console.log("Migration Complete.");
            });
        });
    });
});

db.close();
