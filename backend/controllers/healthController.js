const db = require('../db');
const os = require('os');
const path = require('path');
const fs = require('fs');

const osUtils = require('os-utils');

exports.getSystemHealth = async (req, res) => {
    // Wrap cpuUsage in a promise
    const getCpuUsage = () => {
        return new Promise((resolve) => {
            osUtils.cpuUsage((val) => {
                resolve(val);
            });
        });
    };

    const cpuLoad = await getCpuUsage();

    const health = {
        status: 'Online',
        timestamp: new Date(),
        system: {
            uptime: os.uptime(),
            platform: os.platform(),
            arch: os.arch(),
            cpuModel: os.cpus()[0].model,
            cpuLoad: (cpuLoad * 100).toFixed(1),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1)
            }
        },
        database: {
            status: 'Unknown',
            size: 'Unknown'
        },
        network: {
            status: 'Online' // Basic assumption since we received the request
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
    // Ping Google DNS (8.8.8.8) logic or similar could go here.
    // Simulating for now.
    setTimeout(() => {
        res.json({
            internet: true,
            latency: Math.floor(Math.random() * 50) + 10 + 'ms',
            gateway: 'Reachable'
        });
    }, 500);
};
