const db = require('./backend/db');

console.log("Starting Migration: Fix Audit Log Timestamps...");

const query = `
    UPDATE audit_logs 
    SET timestamp = datetime(timestamp, 'localtime') 
    WHERE timestamp LIKE '%T%'
`;

db.run(query, [], function (err) {
    if (err) {
        console.error("Migration Failed:", err);
    } else {
        console.log(`Migration Success. Rows updated: ${this.changes}`);
    }
    // Also remove any Z if it remains (datetime usually handles it, but just in case)
    // Actually datetime returns YYYY-MM-DD HH:MM:SS, so it's clean.
});
