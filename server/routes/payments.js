const express = require('express');
const router  = express.Router();
const {
  getPayments,
  getPaymentById,
  getPaymentsByStudent,
  getPaymentSummary,
  createPayment,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');
const { protect }   = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

// Summary (dashboard stats)
router.get('/summary', protect, getPaymentSummary);

// By student
router.get('/student/:studentId', protect, getPaymentsByStudent);

// CRUD
router.get('/',    protect, getPayments);
router.get('/:id', protect, getPaymentById);
router.post('/',   protect, adminOnly, createPayment);
router.put('/:id', protect, adminOnly, updatePayment);
router.delete('/:id', protect, adminOnly, deletePayment);

module.exports = router;
