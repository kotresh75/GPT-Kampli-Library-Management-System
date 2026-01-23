const db = require('./db');

db.get("SELECT * FROM transaction_logs ORDER BY timestamp DESC LIMIT 1", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Latest Transaction Log:");
        console.log("ID:", row.id);
        console.log("Action:", row.action_type);
        console.log("Timestamp (Stored):", row.timestamp);
        console.log("Details JSON (Parsed):");
        try {
            console.log(JSON.stringify(JSON.parse(row.details), null, 2));
        } catch (e) {
            console.log("Raw Details:", row.details);
        }
    }
});
