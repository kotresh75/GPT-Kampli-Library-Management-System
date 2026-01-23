const db = require('./backend/db');

console.log("Checking for 'SYSTEM' staff user...");

db.get("SELECT * FROM staff WHERE id = 'SYSTEM'", (err, row) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("SYSTEM User:", row ? "Exists" : "MISSING");
    }
});
