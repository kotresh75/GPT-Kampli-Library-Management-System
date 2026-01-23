const express = require('express');
const router = express.Router();
const circulationController = require('../controllers/circulationHandler');
const { verifyStaff } = require('../middleware/authMiddleware');

router.use(verifyStaff);

// Validate Borrower (Identifier = RegNo or ID)
router.get('/validate-borrower/:identifier', circulationController.validateBorrower);

// Issue Books
router.post('/issue', circulationController.issueBook);

// Get Active Loans for Student/Book
router.get('/history', circulationController.getTransactionHistory);
router.get('/loans/:studentId', circulationController.getStudentActiveLoans);
router.get('/holders/:isbn', circulationController.getBookActiveLoans);

// Get Next Accession for Replacement
router.get('/next-accession/:isbn', circulationController.getNextAccession);

// Return Book
router.post('/return', circulationController.returnBook);

// Renew Book
router.post('/renew', circulationController.renewBook);

// Search & Resolve
router.get('/search/students', circulationController.searchStudents);
router.get('/search/books', circulationController.searchBooks);
router.post('/resolve-scan', circulationController.resolveScan);

// Issued Students (for Return Tab)
router.get('/issued-students', circulationController.getIssuedStudents);

// Policy Defaults for Return/Renew UI
router.get('/policy-defaults', circulationController.getPolicyDefaults);

module.exports = router;
