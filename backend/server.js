const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3001; // Default port, eventually load from DB

// Init Cron Service
require('./services/cronService').init();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/circulation', require('./routes/circulationRoutes'));
app.use('/api/policy', require('./routes/policyRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

// API: Get Status
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', db: 'connected' });
});

// --- Basic Settings Endpoint (Read-Only Public for now) ---
app.get('/api/settings', (req, res) => {
    db.all("SELECT key, value, category, description FROM system_settings", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});


app.listen(PORT, () => {
    console.log(`backend Server running on http://localhost:${PORT}`);
});

// Graceful Shutdown
function shutdown() {
    console.log("Stopping backend Server...");
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown); // Handle Ctrl+C locally too
