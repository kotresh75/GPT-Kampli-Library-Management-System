const express = require('express');
const router = express.Router();
const utilController = require('../controllers/utilController');

router.get('/icons', utilController.getProfileIcons);

module.exports = router;
