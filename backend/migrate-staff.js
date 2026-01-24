/**
 * Migration: Fix staff table CHECK constraint
 * Run this once to allow 'Deleted' status for soft deletes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database:', err);
        process.exit(1);
    }
    console.log('Connected to database at:', dbPath);
});

db.serialize(() => {
    console.log('Starting staff table migration...');

    // 1. Create a new table with correct schema
    db.run(`
        CREATE TABLE IF NOT EXISTS staff_new (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            designation TEXT,
            access_permissions TEXT,
            password_hash TEXT NOT NULL,
            status TEXT CHECK(status IN ('Active', 'Disabled', 'Deleted')),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating new table:', err);
            return;
        }
        console.log('Step 1: Created new staff table with updated schema');
    });

    // 2. Copy data from old table to new table
    db.run(`
        INSERT OR REPLACE INTO staff_new 
        SELECT id, name, email, phone, designation, access_permissions, 
               password_hash, status, created_at, last_login, updated_at 
        FROM staff WHERE status IN ('Active', 'Disabled')
    `, (err) => {
        if (err) {
            console.error('Error copying data:', err);
            return;
        }
        console.log('Step 2: Copied data to new table');
    });

    // 3. Drop old table
    db.run(`DROP TABLE IF EXISTS staff`, (err) => {
        if (err) {
            console.error('Error dropping old table:', err);
            return;
        }
        console.log('Step 3: Dropped old staff table');
    });

    // 4. Rename new table to staff
    db.run(`ALTER TABLE staff_new RENAME TO staff`, (err) => {
        if (err) {
            console.error('Error renaming table:', err);
            return;
        }
        console.log('Step 4: Renamed new table to staff');
        console.log('\nMigration completed successfully!');
        console.log('The staff table now supports "Deleted" status for soft deletes.');
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('Database connection closed.');
    }
});
