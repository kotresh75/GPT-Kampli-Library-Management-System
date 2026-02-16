const db = require('../db');

exports.getProfileIcons = (req, res) => {
    db.all("SELECT id, name, data FROM profile_icons", [], (err, rows) => {
        if (err) {
            console.error("Error fetching icons:", err);
            return res.status(500).json({ error: "Failed to fetch icons" });
        }
        res.json(rows);
    });
};
