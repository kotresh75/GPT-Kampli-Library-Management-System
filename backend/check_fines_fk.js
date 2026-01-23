const db = require('./db');

db.all(`PRAGMA foreign_key_list(fines)`, (err, rows) => {
    if (err) {
        console.error("PRAGMA Error:", err);
    } else {
        console.log("Fines Foreign Keys:", rows);
    }
});
