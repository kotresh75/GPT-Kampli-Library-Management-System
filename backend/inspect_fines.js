const db = require('./db');

db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='fines'", [], (err, row) => {
    if (err) console.error(err);
    else console.log(row ? row.sql : "Table not found");
});
