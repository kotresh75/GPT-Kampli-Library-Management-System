const db = require('../db');
const auditService = require('../services/auditService');
const bcrypt = require('bcrypt');
const socketService = require('../services/socketService');

// Get All Policies
exports.getPolicies = (req, res) => {
    const keys = ['policy_borrowing', 'policy_financial', 'policy_calendar', 'policy_general', 'policy_version'];
    // Using simple IN clause or multiple ORs. simpler to fetch all with category 'Policy'

    db.all("SELECT * FROM system_settings WHERE category = 'Policy'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const policies = {};
        rows.forEach(row => {
            try {
                if (row.data_type === 'json') {
                    policies[row.key] = JSON.parse(row.value);
                } else {
                    policies[row.key] = row.value;
                }
            } catch (e) {
                console.error(`Error parsing ${row.key}`, e);
                policies[row.key] = row.value;
            }
        });

        res.json(policies);
    });
};

// Update Policies
exports.updatePolicies = async (req, res) => {
    const { updates, admin_password, admin_id } = req.body;

    // 1. Validate Admin Password
    if (!admin_password) return res.status(400).json({ error: "Admin password required" });

    // Fetch Admin to verify password. 
    // Assuming the requester sends their ID, or we use a generic 'admin' check if auth middleware isn't strict yet.
    // For this implementation, let's assume we validate against the requesting user's ID.
    // If admin_id is not provided, we might fail or default to a check. 
    // Let's assume the frontend sends the current user's ID.

    if (!admin_id) return res.status(400).json({ error: "Admin ID required for verification" });

    // 2. Verify Admin from 'admins' table (Correct Source)
    console.log(`[Policy] Verifying admin ID: ${admin_id}`);
    db.get("SELECT id, email, password_hash FROM admins WHERE id = ?", [admin_id], async (err, admin) => {
        if (err) {
            console.error("[Policy] DB Error during admin verification:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        if (!admin) {
            console.error("[Policy] Admin not found for ID:", admin_id);
            return res.status(403).json({ error: "Admin not found or unauthorized" });
        }

        const match = await bcrypt.compare(admin_password, admin.password_hash);
        if (!match) return res.status(401).json({ error: "Invalid Password" });

        // 2. Proceed with Updates
        const keysToUpdate = Object.keys(updates);

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const stmt = db.prepare("UPDATE system_settings SET value = ? WHERE key = ?");
            let errorOccurred = false;

            keysToUpdate.forEach(key => {
                let value = updates[key];
                if (typeof value === 'object') value = JSON.stringify(value);

                stmt.run(value, key, (err) => {
                    if (err) errorOccurred = true;
                });
            });

            // Increment Version
            // Fetch current, increment, save. Or just doing it simply:
            // "UPDATE system_settings SET value = CAST(value AS DECIMAL) + 0.1 WHERE key = 'policy_version'"
            // But version is string "1.0". Let's roughly increment or set timestamp.
            // Let's just set it to Date.now() or increment.

            // We'll update version manually in the loop if passed, or auto-increment.
            // The spec says "Increments policy_version (v1.2 -> v1.3)"

            db.get("SELECT value FROM system_settings WHERE key='policy_version'", (err, row) => {
                let newVer = "1.0";
                if (row) {
                    let num = parseFloat(row.value);
                    if (!isNaN(num)) newVer = (num + 0.1).toFixed(1);
                }

                stmt.run(newVer.toString(), 'policy_version');

                stmt.finalize(() => {
                    if (errorOccurred) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: "Failed to update settings" });
                    }

                    // Log Audit with proper user object
                    const userForAudit = {
                        id: admin.email, // Use email as actor_id for display
                        role: 'Admin'
                    };
                    auditService.log(userForAudit, 'UPDATE_POLICY', 'Policy', `Updated keys: ${keysToUpdate.join(', ')}`).then(() => {
                        // Done
                    });

                    db.run("COMMIT", () => {
                        socketService.emit('policy_update', { version: newVer });
                        res.json({ success: true, version: newVer });
                    });
                });
            });
        });
    });
};
