const db = require('./backend/db');

db.all("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger'", [], (err, rows) => {
    if (err) {
        console.error("Error fetching triggers:", err);
        return;
    }
    console.log("Found Triggers:", rows.length);
    rows.forEach(row => {
        console.log(`--- Trigger: ${row.name} on ${row.tbl_name} ---`);
        console.log(row.sql);
    });
});
