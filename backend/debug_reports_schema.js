const db = require('./db');

const run = async () => {
    // 1. Test Trend Query
    console.log("=== Test Trend Query ===");
    const dailyTrendSql = `
        SELECT date(timestamp) as date, action_type, COUNT(*) as count 
        FROM transaction_logs 
        WHERE timestamp >= date('now', '-14 days')
        AND action_type IN ('ISSUE', 'RETURN')
        GROUP BY date(timestamp), action_type
        ORDER BY date(timestamp)
    `;

    db.all(dailyTrendSql, [], (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Raw Trend Rows:", rows);

            // Emulate Backend Processing
            const trendMap = {};
            rows.forEach(row => {
                // Ensure date is not null
                if (!row.date) {
                    console.warn("Row with null date found:", row);
                    return;
                }
                if (!trendMap[row.date]) trendMap[row.date] = { date: row.date, issue: 0, return: 0 };
                if (row.action_type === 'ISSUE') trendMap[row.date].issue = row.count;
                if (row.action_type === 'RETURN') trendMap[row.date].return = row.count;
            });
            const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
            console.log("Processed Trend Data:", JSON.stringify(trend, null, 2));
        }
    });
};

run();
