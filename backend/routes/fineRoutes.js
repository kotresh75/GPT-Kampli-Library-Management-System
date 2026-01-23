const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', fineController.getAllFines);
router.get('/receipt/:receiptId', fineController.getReceiptDetails);
router.get('/student/:studentId', fineController.getStudentFines);

// Protect actions to ensure audit logging captures the actor
router.post('/collect', verifyToken, fineController.collectFine);
router.post('/waive', verifyToken, fineController.waiveFine);
router.post('/update', verifyToken, fineController.updateFine);
router.post('/resend-receipt', verifyToken, fineController.resendReceipt);

module.exports = router;
