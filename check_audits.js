const db = require('./backend/db');

db.all("SELECT * FROM audit_logs WHERE action_type = 'BROADCAST' ORDER BY timestamp DESC LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Found Logs:", rows.length);
        console.log(JSON.stringify(rows, null, 2));
    }
});
