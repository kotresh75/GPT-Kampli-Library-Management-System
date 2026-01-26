const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', departmentController.addDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

// HOD Signature routes
router.post('/:id/signature', departmentController.uploadHodSignature);
router.delete('/:id/signature', departmentController.deleteHodSignature);

module.exports = router;
