const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware (Authenticated Admins Only)
const { verifyAdmin } = require('../middleware/authMiddleware');
router.use(verifyAdmin);

router.get('/', adminController.getAdmins);
router.post('/', adminController.createAdmin);
router.put('/:id', adminController.updateAdmin);
router.patch('/:id/status', adminController.toggleStatus);
router.post('/:id/reset-password', adminController.resetPassword);
router.delete('/:id', adminController.deleteAdmin);
router.get('/:id/logs', adminController.getAdminLogs);
router.get('/broadcast/history', adminController.getBroadcastHistory);
router.post('/broadcast', adminController.broadcastMessage);

module.exports = router;
