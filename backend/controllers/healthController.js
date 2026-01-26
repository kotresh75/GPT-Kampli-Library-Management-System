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
    const dbPath = path.resolve(__dirname, '../../DB/lms.sqlite');
    try {
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            health.database.size = (stats.size / 1024 / 1024).toFixed(2) + ' MB';
            health.database.status = 'Connected';

            // Perform simple query to confirm logic
            db.get("SELECT 1", [], (err) => {
                if (err) health.database.status = 'Error';
                res.json(health);
            });
        } else {
            health.database.status = 'File Missing';
            res.json(health);
        }
    } catch (e) {
        health.database.status = 'Check Failed';
        res.json(health);
    }
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
