const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// All audit routes should be protected
const { verifyAdmin } = require('../middleware/authMiddleware');
router.use(verifyAdmin);

router.get('/', auditController.getAllLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/export', auditController.exportLogs);

module.exports = router;
