const db = require('./db');

const settings = [
    // 1. Appearance
    {
        key: 'app_appearance',
        value: JSON.stringify({
            theme: 'system', // light, dark, system
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
    // 2. Hardware
    {
        key: 'app_hardware',
        value: JSON.stringify({
            scannerMode: 'keyboard', // keyboard, serial
            scannerPrefix: '',
            defaultPrinter: '',
            paperSize: '80mm',
            autoPrint: false
        }),
        category: 'App',
        description: 'Hardware & Peripherals',
        data_type: 'json'
    },
    // 3. Account Security (User-level)
    {
        key: 'app_security',
        value: JSON.stringify({
            autoLockMinutes: 0 // 0 = Never, 5, 10, 15, 30
        }),
        category: 'App',
        description: 'User Security Settings',
        data_type: 'json'
    },
    // 4. Data (Backup Config)
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
    // 5. Email Config
    {
        key: 'email_config',
        value: JSON.stringify({
            enabled: false,
            provider: 'smtp', // smtp, sendgrid, aws_ses
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
    // 6. System Security - Login Rules
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
    // 7. System Security - Critical Actions
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

console.log("Seeding App Settings...");

db.serialize(() => {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO system_settings (key, value, category, description, data_type, is_user_editable)
        VALUES (?, ?, ?, ?, ?, 1)
    `);

    settings.forEach(p => {
        stmt.run(p.key, p.value, p.category, p.description, p.data_type, (err) => {
            if (err) console.error(`Error inserting ${p.key}:`, err);
            else console.log(`Processed ${p.key}`);
        });
    });

    stmt.finalize(() => {
        console.log("Seeding Complete.");
    });
});
