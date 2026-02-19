const express = require('express');
const router = express.Router();
const utilController = require('../controllers/utilController');
const dbSchemaController = require('../controllers/dbSchemaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/icons', utilController.getProfileIcons);
router.get('/db-schema', verifyToken, dbSchemaController.getSchema);

module.exports = router;
