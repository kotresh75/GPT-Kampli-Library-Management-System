const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Logic to find the DB path (copied from db.js)
const isDev = process.env.NODE_ENV !== 'production';
const userDataPath = process.env.USER_DATA_PATH || (isDev
    ? path.resolve(__dirname, '..')
    : path.join(process.env.APPDATA || process.env.HOME, 'GPTK Library Manager'));

const dbPath = path.join(userDataPath, 'DB', 'lms.sqlite');
const dumpPath = path.join(__dirname, 'schema_dump.txt');

console.log('Inspecting Database at:', dbPath);

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

const stream = fs.createWriteStream(dumpPath);
stream.write(`Database Schema Dump\n`);
stream.write(`Database Path: ${dbPath}\n\n`);

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('Error fetching tables:', err);
            return;
        }

        stream.write(`Found ${tables.length} tables:\n`);

        let completed = 0;
        if (tables.length === 0) {
            stream.write('No tables found.\n');
            stream.end();
            console.log('Schema dump completed (no tables).');
            return;
        }

        tables.forEach(table => {
            db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
                if (err) {
                    console.error(`Error fetching info for table ${table.name}:`, err);
                    stream.write(`\n--- Table: ${table.name} (Error fetching info) ---\n`);
                } else {
                    stream.write(`\n--- Table: ${table.name} ---\n`);
                    columns.forEach(col => {
                        stream.write(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}\n`);
                    });
                }
                completed++;
                if (completed === tables.length) {
                    stream.write('\nSchema Inspection Completed.\n');
                    stream.end();
                    console.log(`Schema dumped to ${dumpPath}`);
                }
            });
        });
    });
});
