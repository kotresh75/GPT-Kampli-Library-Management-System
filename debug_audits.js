const db = require('./backend/db');

db.all("SELECT id, timestamp, action_type, description FROM audit_logs ORDER BY timestamp DESC LIMIT 20", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Raw Timestamps (DESC):");
        rows.forEach(r => console.log(`${r.timestamp} | ${r.action_type}`));
    }
});
