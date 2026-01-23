const db = require('./backend/db');

// Test logic on the specific broken timestamp found earlier
const testTs = '2026-01-21T07:50:44.996Z';
console.log("Original:", testTs);

db.get(`SELECT datetime(?, 'localtime') as converted`, [testTs], (err, row) => {
    if (err) console.error(err);
    else console.log("Converted:", row.converted);
});
