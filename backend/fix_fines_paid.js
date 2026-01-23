const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../DB/lms.sqlite');

db.run("UPDATE fines SET is_paid = 1 WHERE status IN ('Paid', 'Waived') AND is_paid = 0", function (err) {
    if (err) console.error("Error:", err);
    else console.log(`Fixed ${this.changes} rows (Set is_paid=1 for Paid/Waived fines)`);
    db.close();
});
