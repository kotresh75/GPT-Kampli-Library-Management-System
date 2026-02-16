const express = require('express');
const router = express.Router();
const dbController = require('../controllers/databaseController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// All routes require Admin authentication
router.post('/verify-access', verifyAdmin, dbController.verifyAccess);
router.get('/tables', verifyAdmin, dbController.listTables);
router.get('/schema/:table', verifyAdmin, dbController.getSchema);
router.get('/query/:table', verifyAdmin, dbController.queryTable);
router.get('/cell/:table/:rowid/:column', verifyAdmin, dbController.getCellValue);
router.post('/row/:table', verifyAdmin, dbController.insertRow);
router.put('/row/:table/:rowid', verifyAdmin, dbController.updateRow);
router.delete('/row/:table/:rowid', verifyAdmin, dbController.deleteRow);

module.exports = router;
