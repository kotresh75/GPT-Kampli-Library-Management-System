const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsHandler');

router.get('/app', settingsController.getAppSettings);
router.put('/app', settingsController.updateAppSettings);
router.post('/change-password', settingsController.changeUserPassword);
router.post('/test-email', settingsController.testEmail);

module.exports = router;
