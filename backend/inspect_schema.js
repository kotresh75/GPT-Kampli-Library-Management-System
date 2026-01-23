const db = require('./db');

db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='transaction_logs'", [], (err, row) => {
    if (err) console.error(err);
    else console.log(row ? row.sql : "Table not found");
});
