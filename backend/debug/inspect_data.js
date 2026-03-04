const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Logic to find the DB path (copied from db.js)
const isDev = process.env.NODE_ENV !== 'production';
const userDataPath = process.env.USER_DATA_PATH || (isDev
    ? path.resolve(__dirname, '..')
    : path.join(process.env.APPDATA || process.env.HOME, 'GPTK Library Manager'));

const dbPath = path.join(userDataPath, 'DB', 'lms.sqlite');
const uploadsPath = path.join(userDataPath, 'Uploads');

console.log('Database Path:', dbPath);
console.log('Uploads Path:', uploadsPath);

if (!fs.existsSync(dbPath)) {
    console.error('Database file not found!');
    process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    console.log('\n--- Admins Table ---');
    db.all("SELECT id, name, email, profile_icon FROM admins", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });

    console.log('\n--- Staff Table ---');
    db.all("SELECT id, name, email, profile_icon FROM staff", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
});
