const db = require('./db');

db.get("SELECT * FROM system_settings WHERE key = 'policy_borrowing'", (err, row) => {
    if (err) {
        console.error("DB Error:", err);
    } else {
        console.log("Found Row:", row);
        if (row && row.value) {
            try {
                console.log("Parsed Value:", JSON.parse(row.value));
            } catch (e) {
                console.log("Failed to parse JSON value:", row.value);
            }
        }
    }
});
