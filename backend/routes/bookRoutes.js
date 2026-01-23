const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/', bookController.getBooks);
router.post('/bulk', bookController.bulkUploadBooks); // Specific route first
router.post('/', bookController.addBook);
router.get('/:isbn', bookController.getBookDetails);
router.put('/:isbn', bookController.updateBook);
router.delete('/:isbn', bookController.deleteBook);
router.put('/copy/:id', bookController.updateCopyStatus);
router.post('/:isbn/add-copies', bookController.addCopies);
router.delete('/copy/:id', bookController.deleteCopy);

// Bulk Import
router.post('/bulk', bookController.bulkUploadBooks);

module.exports = router;
