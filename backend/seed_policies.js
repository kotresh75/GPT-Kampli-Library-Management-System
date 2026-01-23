const db = require('./db');

// Default Policies based on Spec 8.13
const policies = [
    {
        key: 'policy_borrowing',
        value: JSON.stringify({
            student: { maxBooks: 3, loanDays: 15, maxRenewals: 1, gracePeriod: 0, blockFineThreshold: 500 },
            alumni: { maxBooks: 1, loanDays: 14, maxRenewals: 0, gracePeriod: 0, blockFineThreshold: 100 },
            staff: { maxBooks: 5, loanDays: 30, maxRenewals: 2, gracePeriod: 3, autoRenew: false }
        }),
        category: 'Policy',
        description: 'Borrowing Rules per Profile',
        data_type: 'json'
    },
    {
        key: 'policy_financial',
        value: JSON.stringify({
            dailyFineRate: 5.00,
            maxFinePerTxn: 500,
            maxFinePerStudent: 2000,
            damagePresets: [
                { id: 1, name: 'Torn Pages', amount: 50 },
                { id: 2, name: 'Water Damage', amount: 100 },
                { id: 3, name: 'Binding Repair', amount: 30 }
            ],
            allowStaffEditAmount: false,
            allowStaffWaive: false
        }),
        category: 'Policy',
        description: 'Fine & Financial Settings',
        data_type: 'json'
    },
    {
        key: 'policy_calendar',
        value: JSON.stringify({
            weeklyHolidays: [0], // 0 = Sunday
            excludeHolidays: true
        }),
        category: 'Policy',
        description: 'Holiday & Calendar Settings',
        data_type: 'json'
    },
    {
        key: 'policy_general',
        value: JSON.stringify({
            content: "<ul><li>Silence must be maintained.</li><li>ID cards are mandatory.</li><li>Mobile phones prohibited.</li></ul>"
        }),
        category: 'Policy',
        description: 'General Rules & Regulations',
        data_type: 'html'
    },
    {
        key: 'policy_version',
        value: '1.0',
        category: 'Policy',
        description: 'Current Policy Version',
        data_type: 'string',
        is_user_editable: 0
    }
];

console.log("Seeding Policy Settings...");

db.serialize(() => {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO system_settings (key, value, category, description, data_type, is_user_editable)
        VALUES (?, ?, ?, ?, ?, 1)
    `);

    policies.forEach(p => {
        stmt.run(p.key, p.value, p.category, p.description, p.data_type, (err) => {
            if (err) console.error(`Error inserting ${p.key}:`, err);
            else console.log(`Processed ${p.key}`);
        });
    });

    stmt.finalize(() => {
        console.log("Seeding Complete.");
    });
});
