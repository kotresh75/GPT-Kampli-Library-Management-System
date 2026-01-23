const db = require('./db');

db.all("SELECT * FROM transaction_logs ORDER BY timestamp DESC LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
});
