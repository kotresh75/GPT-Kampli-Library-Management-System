const db = require('./backend/db');

console.log("Searching sqlite_master for 'students_old'...");

db.all("SELECT * FROM sqlite_master WHERE sql LIKE '%students_old%'", [], (err, rows) => {
    if (err) {
        console.error("Error:", err);
        return;
    }
    console.log(`Found ${rows.length} matches.`);
    rows.forEach(row => {
        console.log(`[${row.type}] ${row.name}`);
        console.log(row.sql);
        console.log('-----------------------------------');
    });
});
