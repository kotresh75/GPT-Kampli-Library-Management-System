const db = require('./db');

// Wait for DB to initialize
setTimeout(() => {
    console.log("Running Settings Migration...\n");

    // First, let's check what columns exist
    db.all("PRAGMA table_info(system_settings)", [], (err, columns) => {
        if (err) {
            console.error("Error checking table:", err.message);
            process.exit(1);
        }

        const existingColumns = columns.map(c => c.name);
        console.log("Existing columns:", existingColumns.join(', '));

        // Add missing columns one by one
        const addColumnIfMissing = (colName, colDef, callback) => {
            if (!existingColumns.includes(colName)) {
                db.run(`ALTER TABLE system_settings ADD COLUMN ${colName} ${colDef}`, (err) => {
                    if (err) console.log(`Error adding ${colName}:`, err.message);
                    else console.log(`✓ Added column: ${colName}`);
                    callback();
                });
            } else {
                console.log(`• Column exists: ${colName}`);
                callback();
            }
        };

        // Chain the column additions
        addColumnIfMissing('data_type', "TEXT DEFAULT 'string'", () => {
            addColumnIfMissing('is_user_editable', "INTEGER DEFAULT 1", () => {
                // Now seed the settings
                console.log("\nSeeding App Settings...\n");
                seedSettings();
            });
        });
    });
}, 2000);

function seedSettings() {
    const settings = [
        {
            key: 'app_appearance',
            value: JSON.stringify({
                theme: 'system',
                glassIntensity: 10,
                soundSuccess: true,
                soundError: true,
                language: 'en',
                fontScale: 100,
                highContrast: false
            }),
            category: 'App',
            description: 'Appearance & Feedback settings',
            data_type: 'json'
        },
        {
            key: 'app_hardware',
            value: JSON.stringify({
                scannerMode: 'keyboard',
                scannerPrefix: '',
                defaultPrinter: '',
                paperSize: '80mm',
                autoPrint: false
            }),
            category: 'App',
            description: 'Hardware & Peripherals',
            data_type: 'json'
        },
        {
            key: 'app_security',
            value: JSON.stringify({
                autoLockMinutes: 0
            }),
            category: 'App',
            description: 'User Security Settings',
            data_type: 'json'
        },
        {
            key: 'backup_config',
            value: JSON.stringify({
                connectionUri: '',
                autoBackup: false,
                frequency: 'daily'
            }),
            category: 'Data',
            description: 'Backup Configuration',
            data_type: 'json'
        },
        {
            key: 'email_config',
            value: JSON.stringify({
                enabled: false,
                provider: 'smtp',
                host: '',
                port: 587,
                secure: false,
                user: '',
                pass: '',
                apiKey: '',
                region: '',
                fromName: 'College Library',
                fromEmail: 'library@college.edu'
            }),
            category: 'Email',
            description: 'Email Service Configuration',
            data_type: 'json'
        },
        {
            key: 'email_events',
            value: JSON.stringify({
                issueReceipt: true,
                returnReceipt: true,
                renewalConfirmation: true,
                broadcastMessages: true,
                overdueAlerts: true,
                finePaymentReceipt: true
            }),
            category: 'Email',
            description: 'Email Trigger Events',
            data_type: 'json'
        },
        {
            key: 'sec_login',
            value: JSON.stringify({
                maxAttempts: 5,
                minLength: 8,
                requireUppercase: true,
                requireNumber: true,
                requireSymbol: false
            }),
            category: 'Security',
            description: 'Login Security Rules',
            data_type: 'json'
        },
        {
            key: 'sec_actions',
            value: JSON.stringify({
                bulkDelete: true,
                restoreBackup: true,
                policyChanges: true,
                staffModification: true
            }),
            category: 'Security',
            description: 'Critical Action Protection',
            data_type: 'json'
        }
    ];

    db.serialize(() => {
        // Use INSERT OR REPLACE based on key (unique column)
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO system_settings (key, value, category, description, data_type, is_user_editable)
            VALUES (?, ?, ?, ?, ?, 1)
        `);

        settings.forEach(p => {
            stmt.run(p.key, p.value, p.category, p.description, p.data_type, (err) => {
                if (err) console.error(`✗ Error with ${p.key}:`, err.message);
                else console.log(`✓ ${p.key}`);
            });
        });

        stmt.finalize(() => {
            console.log("\n=== Migration Complete! ===");
            console.log("Please restart the backend server.");
            process.exit(0);
        });
    });
}
