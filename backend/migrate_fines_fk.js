const db = require('./db');

db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // 1. Rename existing table
    db.run("ALTER TABLE fines RENAME TO fines_old");

    // 2. Create new table with correct FK and Schema
    db.run(`CREATE TABLE fines (
        id TEXT PRIMARY KEY,
        receipt_number TEXT UNIQUE,
        transaction_id TEXT,
        student_id TEXT,
        amount REAL,
        status TEXT CHECK(status IN ('Unpaid', 'Paid', 'Waived')) DEFAULT 'Unpaid',
        is_paid INTEGER DEFAULT 0,
        payment_date TEXT,
        collected_by TEXT,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transaction_logs(id), -- Corrected FK
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (collected_by) REFERENCES staff(id)
    )`);

    // 3. Copy data
    // Note: status column might not exist in fines_old if previous migration failed/reverted, 
    // but we added it earlier. 'is_paid' maps to status logic? 
    // We previously added 'status' column.

    // We need to match columns carefully.
    // fines_old has: id, receipt_number, transaction_id, student_id, amount, is_paid, payment_date, collected_by, remark, created_at, updated_at
    // AND 'status' (added in previous step).

    db.run(`INSERT INTO fines (id, receipt_number, transaction_id, student_id, amount, status, is_paid, payment_date, collected_by, remark, created_at, updated_at)
            SELECT id, receipt_number, transaction_id, student_id, amount, status, is_paid, payment_date, collected_by, remark, created_at, updated_at
            FROM fines_old`, (err) => {
        if (err) {
            console.error("Data Copy Error:", err);
            db.run("ROLLBACK");
            return;
        }

        // 4. Drop old table
        db.run("DROP TABLE fines_old");

        db.run("COMMIT", (err) => {
            if (err) console.error("Commit Error:", err);
            else console.log("Migration Success: Fines table re-created with correct FK.");
        });
    });
});
