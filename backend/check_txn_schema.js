const db = require('./db');

db.all(`PRAGMA table_info(transaction_logs)`, (err, rows) => {
    if (err) {
        console.error("PRAGMA Error:", err);
    } else {
        console.log("Transaction Logs Columns:", rows);
    }
});
