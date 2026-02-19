const db = require('../db');

/**
 * GET /api/utils/db-schema
 * Returns full database schema: tables, columns, row counts, indexes
 */
exports.getSchema = async (req, res) => {
    try {
        // 1. Get all tables
        const tables = await dbAll(
            "SELECT name, type, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        );

        // 2. Get all indexes
        const indexes = await dbAll(
            "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY tbl_name, name"
        );

        // 3. For each table, get column info and row count
        const schema = [];
        for (const table of tables) {
            const columns = await dbAll(`PRAGMA table_info("${table.name}")`);
            const countResult = await dbGet(`SELECT COUNT(*) as count FROM "${table.name}"`);

            // Get foreign keys for this table
            const foreignKeys = await dbAll(`PRAGMA foreign_key_list("${table.name}")`);

            // Get indexes for this table
            const tableIndexes = indexes
                .filter(idx => idx.tbl_name === table.name)
                .map(idx => ({
                    name: idx.name,
                    sql: idx.sql
                }));

            schema.push({
                name: table.name,
                sql: table.sql,
                rowCount: countResult ? countResult.count : 0,
                columns: columns.map(col => ({
                    cid: col.cid,
                    name: col.name,
                    type: col.type || 'ANY',
                    notNull: col.notnull === 1,
                    defaultValue: col.dflt_value,
                    isPrimaryKey: col.pk === 1
                })),
                foreignKeys: foreignKeys.map(fk => ({
                    from: fk.from,
                    table: fk.table,
                    to: fk.to
                })),
                indexes: tableIndexes
            });
        }

        // 4. Database file size (approximate via page_count * page_size)
        const pageCount = await dbGet("PRAGMA page_count");
        const pageSize = await dbGet("PRAGMA page_size");
        const dbSizeBytes = (pageCount?.page_count || 0) * (pageSize?.page_size || 0);

        res.json({
            totalTables: schema.length,
            totalIndexes: indexes.length,
            dbSizeBytes,
            tables: schema
        });
    } catch (error) {
        console.error('Schema fetch error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Promise wrappers for db
function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}
