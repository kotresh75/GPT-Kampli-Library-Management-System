const fs = require('fs');
const path = require('path');

const TRACKING_FILE = path.resolve(__dirname, '../config/dirty_tables.json');

// Ensure config dir exists
if (!fs.existsSync(path.dirname(TRACKING_FILE))) {
    fs.mkdirSync(path.dirname(TRACKING_FILE), { recursive: true });
}

let dirtyTables = new Set();
let isDirtySession = false; // Keep the simple flag for server shutdown check

// Load from disk on startup
if (fs.existsSync(TRACKING_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
        if (Array.isArray(data)) {
            dirtyTables = new Set(data);
            if (dirtyTables.size > 0) isDirtySession = true;
        }
    } catch (e) {
        console.error('[ChangeDetection] Failed to load dirty tables:', e);
    }
}

const save = () => {
    try {
        fs.writeFileSync(TRACKING_FILE, JSON.stringify([...dirtyTables]), 'utf8');
    } catch (e) {
        console.error('[ChangeDetection] Failed to save dirty tables:', e);
    }
};

module.exports = {
    markDirty: (tableName) => {
        if (!tableName) {
            // Fallback for generic "something changed"
            isDirtySession = true;
            return;
        }

        if (!dirtyTables.has(tableName)) {
            console.log(`[SmartBackup] Table '${tableName}' marked as dirty.`);
            dirtyTables.add(tableName);
            isDirtySession = true;
            save();
        }
    },

    isDirty: () => isDirtySession || dirtyTables.size > 0,

    getDirtyTables: () => [...dirtyTables],

    clearDirtyTable: (tableName) => {
        if (dirtyTables.has(tableName)) {
            dirtyTables.delete(tableName);
            save();
        }
        if (dirtyTables.size === 0) isDirtySession = false;
    },

    reset: () => {
        dirtyTables.clear();
        isDirtySession = false;
        save();
    }
};
