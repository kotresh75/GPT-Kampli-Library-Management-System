const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { getISTISOWithOffset } = require('./utils/dateUtils');

// Ensure DB directory exists
const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
        // Enable Foreign Keys
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) console.error("Failed to enable Foreign Keys:", err);
            else {
                initializeTables();

                // DATA REPAIR: Fix missing IDs for copies created before the fix
                db.run("UPDATE book_copies SET id = lower(hex(randomblob(16))) WHERE id IS NULL", (err) => {
                    if (!err && this.changes > 0) console.log("Fixed missing IDs for book_copies");
                });
                // DATA REPAIR: Fix missing IDs for books created before the fix
                db.run("UPDATE books SET id = lower(hex(randomblob(16))) WHERE id IS NULL", (err) => {
                    if (!err && this.changes > 0) console.log("Fixed missing IDs for books");
                });

                // DATA REPAIR: Remove old Root Admin (if exists) as we use veerkotresh@gmail.com now
                db.run("DELETE FROM admins WHERE email = '922f1ffd-6f3e-219e-6aab-3565b783402e@gmail.com'", (err) => {
                    if (!err && this.changes > 0) console.log("Removed old Root Admin (922f1ffd...)");
                });
            }
        });
    }
});

function initializeTables() {
    db.serialize(() => {

        // 5.8 departments (Created first as it's a dependency)
        db.run(`CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            code TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now', '+05:30')),
            updated_at TEXT DEFAULT (datetime('now', '+05:30'))
        )`);

        // 5.1 students
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            register_number TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            dept_id TEXT NOT NULL,
            semester TEXT,
            email TEXT NOT NULL,
            phone TEXT,
            dob TEXT NOT NULL,
            address TEXT,
            status TEXT CHECK(status IN ('Active', 'Blocked', 'Alumni', 'Graduated', 'Deleted')),
            created_at TEXT DEFAULT (datetime('now', '+05:30')),
            updated_at TEXT DEFAULT (datetime('now', '+05:30')),
            FOREIGN KEY (dept_id) REFERENCES departments(id)
        )`);

        // 5.2 staff
        db.run(`CREATE TABLE IF NOT EXISTS staff (
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
        )`);

        // 5.3 admins
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            status TEXT CHECK(status IN ('Active', 'Disabled')),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // 5.4 books
        db.run(`CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            isbn TEXT UNIQUE,
            title TEXT NOT NULL,
            author TEXT,
            publisher TEXT,
            dept_id TEXT,
            price REAL,
            cover_image_url TEXT,
            ebook_link TEXT,
            total_copies INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now', '+05:30')),
            updated_at TEXT DEFAULT (datetime('now', '+05:30')),
            FOREIGN KEY (dept_id) REFERENCES departments(id)
        )`);

        // 5.5 book_copies
        db.run(`CREATE TABLE IF NOT EXISTS book_copies (
            id TEXT PRIMARY KEY,
            accession_number TEXT UNIQUE,
            book_id TEXT,
            status TEXT CHECK(status IN ('Available', 'Issued', 'Lost', 'Maintenance')),
            location TEXT,
            created_at TEXT DEFAULT (datetime('now', '+05:30')),
            updated_at TEXT DEFAULT (datetime('now', '+05:30')),
            FOREIGN KEY (book_id) REFERENCES books(id)
        )`);

        // 5.6 circulation (Active Loans)
        db.run(`CREATE TABLE IF NOT EXISTS circulation (
            id TEXT PRIMARY KEY,
            session_txn_id TEXT,
            student_id TEXT,
            copy_id TEXT,
            issued_by TEXT,
            issue_date TEXT,
            due_date TEXT,
            last_renewed_date TEXT,
            renewal_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (copy_id) REFERENCES book_copies(id)
        )`);

        // 5.7 transaction_logs (History/Ledger) - Decoupled
        db.run(`CREATE TABLE IF NOT EXISTS transaction_logs (
            id TEXT PRIMARY KEY,
            session_txn_id TEXT,
            action_type TEXT, -- ISSUE, RETURN, RENEW, LOST, DAMAGED
            student_id TEXT, -- Kept for reference, no FK constraint
            student_name TEXT, -- SNAPSHOT
            student_reg_no TEXT, -- SNAPSHOT
            student_dept TEXT, -- SNAPSHOT
            copy_id TEXT, -- Kept for reference, no FK constraint
            book_title TEXT, -- SNAPSHOT
            book_isbn TEXT, -- SNAPSHOT
            performed_by TEXT,
            timestamp TEXT DEFAULT (datetime('now', '+05:30')),
            details TEXT -- JSON for remarks, fine amounts, etc.
        )`);

        // 5.7 fines - Decoupled
        db.run(`CREATE TABLE IF NOT EXISTS fines (
            id TEXT PRIMARY KEY,
            receipt_number TEXT UNIQUE,
            transaction_id TEXT,
            student_id TEXT, -- No FK
            student_name TEXT, -- SNAPSHOT
            student_reg_no TEXT, -- SNAPSHOT
            amount REAL,
            status TEXT CHECK(status IN ('Unpaid', 'Paid', 'Waived')) DEFAULT 'Unpaid',
            is_paid INTEGER DEFAULT 0,
            payment_date TEXT,
            collected_by TEXT,
            remark TEXT,
            created_at TEXT DEFAULT (datetime('now', '+05:30')),
            updated_at TEXT DEFAULT (datetime('now', '+05:30')),
            FOREIGN KEY (transaction_id) REFERENCES transaction_logs(id)
        )`);

        // 5.9 broadcast_logs
        db.run(`CREATE TABLE IF NOT EXISTS broadcast_logs (
            id TEXT PRIMARY KEY,
            sender_id TEXT,
            sent_at TEXT,
            subject TEXT,
            message_body TEXT,
            target_group TEXT,
            recipient_count INTEGER,
            status TEXT CHECK(status IN ('Sent', 'Failed'))
        )`);

        // 5.10 audit_logs (Updated Schema)
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT DEFAULT (datetime('now', '+05:30')),
            actor_id TEXT,
            actor_role TEXT,
            action_type TEXT,
            module TEXT,
            description TEXT,
            ip_address TEXT,
            metadata TEXT, -- JSON
            remark TEXT
        )`);

        // 5.11 email_config
        db.run(`CREATE TABLE IF NOT EXISTS email_config (
            id TEXT PRIMARY KEY,
            service_status INTEGER DEFAULT 0,
            provider TEXT,
            smtp_host TEXT,
            smtp_port INTEGER,
            smtp_secure INTEGER,
            smtp_user TEXT,
            smtp_pass TEXT,
            cloud_api_key TEXT,
            cloud_region TEXT,
            from_email TEXT,
            from_name TEXT,
            triggers TEXT, -- JSON
            updated_at TEXT DEFAULT (datetime('now', '+05:30'))
        )`);

        // 5.12 policy_config
        db.run(`CREATE TABLE IF NOT EXISTS policy_config (
            id TEXT PRIMARY KEY,
            policy_version INTEGER,
            active_from TEXT,
            profiles TEXT, -- JSON
            financials TEXT, -- JSON
            holidays TEXT, -- JSON
            security TEXT, -- JSON
            updated_at TEXT DEFAULT (datetime('now', '+05:30'))
        )`);

        // 5.13 sync_queue
        db.run(`CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            table_name TEXT NOT NULL,
            record_id TEXT NOT NULL,
            operation TEXT CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
            data TEXT, -- JSON
            status TEXT CHECK(status IN ('pending', 'synced', 'failed')),
            created_at TEXT DEFAULT (datetime('now', '+05:30')),
            synced_at TEXT
        )`);

        // 5.14 system_settings (Updated with data_type column)
        db.run(`CREATE TABLE IF NOT EXISTS system_settings (
            id TEXT PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            category TEXT,
            description TEXT,
            data_type TEXT DEFAULT 'string',
            is_user_editable INTEGER DEFAULT 1,
            updated_by TEXT,
            updated_at TEXT DEFAULT (datetime('now', '+05:30'))
        )`);

        // 5.15 password_resets (NEW for Forgot Password)
        db.run(`CREATE TABLE IF NOT EXISTS password_resets (
            email TEXT PRIMARY KEY,
            otp TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now', '+05:30'))
        )`);


        console.log("Database tables initialized successfully.");

        // Migration: Add shelf_location column if missing
        db.run("ALTER TABLE books ADD COLUMN shelf_location TEXT", (err) => {
            if (!err) console.log("Migration: Added shelf_location column to books table.");
            // Ignore error if column already exists
        });

        // Seed Default Settings & Admin User
        seedSystemSettings();
        seedAdminUser();
        seedSystemUser();
    });
}

function seedSystemUser() {
    db.get("SELECT count(*) as count FROM staff WHERE id = 'SYSTEM'", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log("Seeding SYSTEM staff user...");
            const bcrypt = require('bcrypt');
            const password = 'admin123';
            const saltRounds = 10;

            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.error("Failed to hash SYSTEM password:", err);
                    return;
                }
                const insert = db.prepare("INSERT INTO staff (id, name, email, password_hash, status) VALUES (?, ?, ?, ?, ?)");
                insert.run('SYSTEM', 'System Administrator', 'system@library.com', hash, 'Active', (err) => {
                    if (err) console.error("Failed to insert SYSTEM user:", err);
                    else console.log("SYSTEM user seeded successfully with password 'admin123'.");
                });
                insert.finalize();
            });
        }
    });
}

function seedAdminUser() {
    db.get("SELECT count(*) as count FROM admins WHERE email = 'veerkotresh@gmail.com'", (err, row) => {
        if (err) {
            console.error("Error checking admin user:", err);
            return;
        }
        if (row && row.count === 0) {
            console.log("Seeding initial admin user...");
            const bcrypt = require('bcrypt');
            const password = '12345678';
            const saltRounds = 10;

            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                    return;
                }
                const insert = db.prepare("INSERT INTO admins (id, name, email, password_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?)");
                // Simple mock UUID for seed
                const id = 'admin-seed-' + Date.now();
                const createdAt = getISTISOWithOffset();

                insert.run(id, 'System Admin', 'veerkotresh@gmail.com', hash, 'Active', createdAt, (err) => {
                    if (err) console.error("Failed to insert admin:", err);
                    else console.log("Admin user seeded successfully.");
                });
                insert.finalize();
            });
        }
    });
}

function seedSystemSettings() {
    db.get("SELECT count(*) as count FROM system_settings", (err, row) => {
        if (row && row.count === 0) {
            console.log("Seeding default system settings (No .env)...");
            const insert = db.prepare("INSERT INTO system_settings (id, key, value, category, description) VALUES (?, ?, ?, ?, ?)");
            // Simple mock UUID for seed
            const newId = () => Math.random().toString(36).substr(2, 9);

            insert.run(newId(), 'server.port', '3001', 'network', 'Port for the internal API server');
            insert.run(newId(), 'app.header_title', 'GPTK Library', 'ui', 'Title in App Header');
            insert.run(newId(), 'circ.fine_per_day', '1.00', 'circulation', 'Fine per overdue day');

            insert.finalize();
        }
    });
}

module.exports = db;
