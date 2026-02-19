const { MongoClient } = require('mongodb');
const db = require('../db');
const auditService = require('./auditService');
const { v4: uuidv4 } = require('uuid');

// Helper to get SQLite data
const getTableData = (tableName) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const tables = [
    'departments', 'students', 'staff', 'admins', 'books', 'book_copies',
    'circulation', 'transaction_logs', 'fines', 'broadcast_logs', 'audit_logs',
    'system_settings', 'policy_config', 'email_config'
];

exports.testConnection = async (uri) => {
    let client;
    try {
        client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
        await client.db().command({ ping: 1 });
        return { success: true, message: "Connected successfully" };
    } catch (error) {
        throw new Error(`Connection failed: ${error.message}`);
    } finally {
        if (client) await client.close();
    }
};

exports.performCloudBackup = async () => {
    let client;
    try {
        console.log('[CloudBackup] Starting backup process...');

        // 1. Get Config
        const config = await new Promise((resolve, reject) => {
            db.get("SELECT value FROM system_settings WHERE key = 'backup_config'", (err, row) => {
                if (err) reject(err);
                if (!row) resolve({});
                else resolve(JSON.parse(row.value));
            });
        });

        if (!config.connectionUri) {
            console.log('[CloudBackup] No connection URI configured. Skipping.');
            return { success: false, error: "No URI configured" };
        }

        // 2. Connectivity Check (Simple DNS)
        const dns = require('dns').promises;
        try {
            await dns.lookup('google.com');
        } catch (e) {
            console.log('[CloudBackup] Offline: Skipping backup.');
            return { success: false, error: "System Offline", skipped: true };
        }

        // 3. Connect to MongoDB
        client = new MongoClient(config.connectionUri);
        await client.connect();
        const mongoDb = client.db(); // Uses DB from URI or default

        console.log('[CloudBackup] Connected to MongoDB Atlas.');

        // 3. Sync Tables
        // Get list of dirty tables from ChangeDetection
        const changeDetection = require('./changeDetection');
        const dirtyTables = changeDetection.getDirtyTables();

        let tablesToBackup = [];

        if (dirtyTables.length > 0) {
            console.log(`[CloudBackup] Smart Backup: Only syncing modified tables: ${dirtyTables.join(', ')}`);
            // Validate tables exist in schema
            tablesToBackup = tables.filter(t => dirtyTables.includes(t));
        } else {
            // Fallback: If no specific tables tracked (shouldn't happen with new hook), sync all
            // Or if user forced backup manually via Settings Page (we should probably sync all then)
            // But for 'on_close' automation, this branch might mean "nothing to sync" if isDirty() check passed?
            // Safer to sync ALL if we are here and unsure.
            console.log('[CloudBackup] No specific dirty tables found. Performing FULL backup.');
            tablesToBackup = tables;
        }

        let totalRecords = 0;
        for (const table of tablesToBackup) {
            const rows = await getTableData(table);

            // Even if empty, we might need to sync empty state if it was cleared locally?
            // Our logic: Clear Mongo Collection -> Insert Rows.
            // If rows is empty, we just clear collection. Correct.

            const collection = mongoDb.collection(table);
            await collection.deleteMany({});

            if (rows && rows.length > 0) {
                await collection.insertMany(rows);
                console.log(`[CloudBackup] Backed up ${rows.length} records from ${table}`);
                totalRecords += rows.length;
            } else {
                console.log(`[CloudBackup] Cleared ${table} (now empty)`);
            }

            // Mark as clean
            if (dirtyTables.includes(table)) {
                changeDetection.clearDirtyTable(table);
            }
        }

        // 4. Update Audit Log
        console.log('[CloudBackup] Backup completed successfully.');
        auditService.log('SYSTEM', 'BACKUP_CLOUD', 'System', `Backed up ${tablesToBackup.length} tables (${totalRecords} records) to MongoDB Atlas`);

        return { success: true, totalRecords };

    } catch (error) {
        console.error('[CloudBackup] Backup failed:', error);
        auditService.log('SYSTEM', 'BACKUP_FAILED', 'System', `Cloud backup failed: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        if (client) await client.close();
    }
};

exports.restoreFromCloud = async () => {
    let client;
    try {
        console.log('[CloudRestore] Starting restore process...');

        // 1. Get Config
        const config = await new Promise((resolve, reject) => {
            db.get("SELECT value FROM system_settings WHERE key = 'backup_config'", (err, row) => {
                if (err) reject(err);
                if (!row) resolve({});
                else resolve(JSON.parse(row.value));
            });
        });

        if (!config.connectionUri) {
            return { success: false, error: "No connection URI configured" };
        }

        // 2. Connect to MongoDB
        client = new MongoClient(config.connectionUri);
        await client.connect();
        const mongoDb = client.db();

        console.log('[CloudRestore] Connected to MongoDB Atlas. Fetching data...');

        // 3. Perform Restore in Transaction
        return await new Promise(async (resolve, reject) => {
            try {
                // Manually manage transaction with Promises
                // Wrap db.run in a helper for cleaner code
                const runDb = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, (err) => err ? rej(err) : res()));

                try {
                    await runDb("PRAGMA foreign_keys = OFF;");
                    await runDb("BEGIN TRANSACTION;");

                    let totalRestored = 0;

                    for (const table of tables) {
                        const collection = mongoDb.collection(table);
                        const documents = await collection.find({}).toArray();

                        if (documents.length > 0) {
                            // Clear Local Table
                            await runDb(`DELETE FROM ${table}`);

                            // Insert Data using Prepare Statement
                            const keys = Object.keys(documents[0]).filter(k => k !== '_id'); // Exclude Mongo ID

                            if (keys.length > 0) {
                                const placeholders = keys.map(() => '?').join(',');
                                const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;

                                const stmt = db.prepare(sql);
                                const runStmt = (values) => new Promise((res, rej) => stmt.run(values, (err) => err ? rej(err) : res()));

                                for (const doc of documents) {
                                    const values = keys.map(k => {
                                        const val = doc[k];
                                        return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
                                    });
                                    await runStmt(values);
                                }
                                stmt.finalize();

                                console.log(`[CloudRestore] Restored ${documents.length} records to ${table}`);
                                totalRestored += documents.length;
                            }
                        }
                    }

                    await runDb("COMMIT;");
                    await runDb("PRAGMA foreign_keys = ON;");

                    console.log('[CloudRestore] Restore completed successfully.');
                    auditService.log('SYSTEM', 'RESTORE_CLOUD', 'System', `Restored ${totalRestored} records from MongoDB Atlas`);
                    resolve({ success: true, totalRecords: totalRestored });

                } catch (txErr) {
                    await runDb("ROLLBACK;");
                    await runDb("PRAGMA foreign_keys = ON;");
                    throw txErr;
                }

            } catch (err) {
                console.error('[CloudRestore] Restore failed:', err);
                auditService.log('SYSTEM', 'RESTORE_FAILED', 'System', `Cloud restore failed: ${err.message}`);
                reject({ success: false, error: err.message });
            }
        });

    } catch (error) {
        return { success: false, error: error.message };
    } finally {
        if (client) await client.close();
    }
};
