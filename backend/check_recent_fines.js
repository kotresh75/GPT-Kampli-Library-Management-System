const db = require('./db');

db.all(`SELECT * FROM fines ORDER BY created_at DESC LIMIT 5`, (err, rows) => {
    if (err) {
        console.error("Fines Error:", err);
    } else {
        console.log("Recent Fines:", rows);
    }
});

db.all(`SELECT * FROM audit_logs WHERE action_type = 'RETURN' ORDER BY timestamp DESC LIMIT 5`, (err, rows) => {
    if (err) {
        console.error("Audit Logs Error:", err);
    } else {
        console.log("Recent Return Logs:", rows);
    }
});
