const db = require('./db');

db.all("PRAGMA table_info(system_settings)", [], (err, rows) => {
    if (err) {
        console.error("Error:", err);
        return;
    }
    console.log("Schema:", rows);
});

db.all("SELECT * FROM system_settings", [], (err, rows) => {
    if (err) {
        console.error("Error fetching data:", err);
        return;
    }
    console.log("Data:", rows);
});
