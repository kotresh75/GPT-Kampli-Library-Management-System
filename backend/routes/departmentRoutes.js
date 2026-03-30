const express = require('express');
const router = express.Router();
const multer = require('multer');
const departmentController = require('../controllers/departmentController');

// Multer: memory storage for image uploads (buffer → sharp → WebP)
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', departmentController.addDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

// HOD Signature routes
router.post('/:id/signature', imageUpload.single('photo'), departmentController.uploadHodSignature);
router.delete('/:id/signature', departmentController.deleteHodSignature);

module.exports = router;
