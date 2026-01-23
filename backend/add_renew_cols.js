const db = require('./db');

const sql1 = "ALTER TABLE circulation ADD COLUMN last_renewed_date TEXT";
const sql2 = "ALTER TABLE circulation ADD COLUMN renewal_count INTEGER DEFAULT 0";

db.serialize(() => {
    db.run(sql1, (err) => {
        if (err) console.log("Column last_renewed_date might already exist or error:", err.message);
        else console.log("Added last_renewed_date");
    });
    db.run(sql2, (err) => {
        if (err) console.log("Column renewal_count might already exist or error:", err.message);
        else console.log("Added renewal_count");
    });
});
