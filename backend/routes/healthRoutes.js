const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/', healthController.getSystemHealth);
router.get('/connectivity', healthController.performConnectivityCheck);

module.exports = router;
