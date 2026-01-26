const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Reading config from:", dbPath);

db.get("SELECT value FROM system_settings WHERE key = 'backup_config'", (err, row) => {
    if (err) {
        console.error("Error:", err);
    } else if (row) {
        console.log("Config:", row.value);
    } else {
        console.log("No backup_config found in system_settings");
    }
    db.close();
});
