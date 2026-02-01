const db = require('../db');
const os = require('os');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const osUtils = require('os-utils');

// Helper: Get Disk Space (Node 18+)
const getDiskUsage = (dirPath) => {
    return new Promise((resolve) => {
        try {
            fs.statfs(dirPath, (err, stats) => {
                if (err) {
                    resolve(null);
                } else {
                    const total = stats.bsize * stats.blocks;
                    const free = stats.bsize * stats.bfree;
                    const used = total - free;
                    resolve({
                        total: total,
                        free: free,
                        used: used,
                        usagePercent: ((used / total) * 100).toFixed(1)
                    });
                }
            });
        } catch (e) {
            resolve(null);
        }
    });
};

exports.getSystemHealth = async (req, res) => {
    // 1. CPU Usage
    const getCpuUsage = () => {
        return new Promise((resolve) => {
            osUtils.cpuUsage((val) => {
                resolve(val);
            });
        });
    };

    const cpuLoad = await getCpuUsage();

    // 2. Disk Usage (Check drive where App is installed)
    const appDir = path.resolve(__dirname, '../../');
    const diskStats = await getDiskUsage(appDir);

    // 3. Process Memory
    const processMem = process.memoryUsage();

    const health = {
        status: 'Online',
        timestamp: new Date(),
        system: {
            uptime: os.uptime(),
            platform: os.platform(),
            arch: os.arch(),
            cpuModel: os.cpus()[0]?.model || 'Unknown',
            cpuLoad: (cpuLoad * 100).toFixed(1),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1)
            },
            disk: diskStats
        },
        process: {
            uptime: process.uptime(),
            memory: {
                rss: processMem.rss, // Resident Set Size
                heapTotal: processMem.heapTotal,
                heapUsed: processMem.heapUsed
            },
            version: process.version
        },
        database: {
            status: 'Unknown',
            size: 'Unknown'
        }
    };

    // DB Check
    const dbPath = db.dbPath; // Use the exported path from db.js

    // DEBUG: Add path to response to verify in UI
    health.database.path = dbPath;

    // STRATEGY CHANGE: Trust the connection, not the filesystem
    // Windows/Electron permissions can sometimes hide files from fs.stat even if writable
    db.get("SELECT 1", [], (err) => {
        if (!err) {
            // Success! We are connected.
            health.database.status = 'Connected';

            // Try to get size, but don't fail if we can't
            try {
                if (fs.existsSync(dbPath)) {
                    const stats = fs.statSync(dbPath);
                    health.database.size = (stats.size / 1024 / 1024).toFixed(2) + ' MB';
                } else {
                    health.database.size = 'Connected';
                }
            } catch (e) {
                health.database.size = 'Unknown';
            }
            res.json(health);
        } else {
            // Query failed, now we debug why
            health.database.status = 'Connection Failed';
            health.database.error = err.message;

            // Check filesystem as diagnosis
            try {
                if (!fs.existsSync(dbPath)) {
                    health.database.status = 'File Missing on Disk';
                }
            } catch (fsErr) {
                health.database.fsError = fsErr.message;
            }
            res.json(health);
        }
    });
};

exports.performConnectivityCheck = async (req, res) => {
    const start = Date.now();

    // Check Google DNS
    dns.lookup('google.com', (err) => {
        const latency = Date.now() - start;
        if (err) {
            res.json({
                internet: false,
                error: err.code,
                latency: null
            });
        } else {
            res.json({
                internet: true,
                latency: latency + 'ms',
                gateway: 'Reachable'
            });
        }
    });
};
