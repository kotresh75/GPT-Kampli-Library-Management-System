const db = require('./db');

db.get("SELECT value FROM system_settings WHERE key = 'email_config'", [], (err, row) => {
    if (err) {
        console.log("Error:", err.message);
    } else if (row) {
        console.log("email_config value:", row.value);
        try {
            const config = JSON.parse(row.value);
            console.log("Parsed config:", config);
            console.log("enabled:", config.enabled);
        } catch (e) {
            console.log("Parse error:", e.message);
        }
    } else {
        console.log("email_config NOT FOUND in database");
    }
    process.exit();
});
