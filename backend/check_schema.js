const db = require('./db');

db.all("PRAGMA table_info(circulation)", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows);
    }
});
