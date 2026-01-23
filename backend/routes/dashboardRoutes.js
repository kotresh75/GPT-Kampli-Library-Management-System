const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// In a real app, ensure middleware verification here
router.get('/stats', dashboardController.getStats);
router.get('/charts', dashboardController.getCharts);
router.get('/logs', dashboardController.getLogs);
router.get('/details', dashboardController.getDetails);

module.exports = router;
