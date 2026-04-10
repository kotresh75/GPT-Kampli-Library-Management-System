const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/', bookController.getBooks);
router.post('/bulk', bookController.bulkUploadBooks); // Specific route first
router.post('/bulk-delete', bookController.bulkDeleteBooks); // Bulk delete with pre-validation
router.post('/', bookController.addBook);

// IMPORTANT: /copy/:id routes MUST come before /:isbn to prevent Express from matching 'copy' as an ISBN
router.put('/copy/:id', bookController.updateCopyStatus);
router.delete('/copy/:id', bookController.deleteCopy);

router.get('/:isbn', bookController.getBookDetails);
router.put('/:isbn', bookController.updateBook);
router.delete('/:isbn', bookController.deleteBook);
router.post('/:isbn/add-copies', bookController.addCopies);

module.exports = router;
