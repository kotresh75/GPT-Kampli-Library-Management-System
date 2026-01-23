const db = require('./db');

db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'transac%'`, (err, rows) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("Tables found:", rows);
    }
});
