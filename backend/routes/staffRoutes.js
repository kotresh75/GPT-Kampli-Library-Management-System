const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Middleware: Protected (Admins only)
const { verifyAdmin } = require('../middleware/authMiddleware');
router.use(verifyAdmin);

router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.patch('/:id/status', staffController.toggleStatus);
router.delete('/:id', staffController.deleteStaff);
router.post('/:id/reset-password', staffController.resetPassword);
router.get('/:id/activity', staffController.getStaffActivity);

module.exports = router;
