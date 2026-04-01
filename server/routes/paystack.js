const express = require('express');
const router  = express.Router();
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getStudentPendingFees,
} = require('../controllers/paystackController');
const { protect } = require('../middleware/auth');

// Webhook must use raw body — registered before json middleware in index.js
router.post('/webhook', paystackWebhook);

// Initialize a new online payment
router.post('/initialize', protect, initializePayment);

// Verify after redirect from Paystack
router.get('/verify/:reference', protect, verifyPayment);

// Get pending fees for a student (for the pay-fees page)
router.get('/pending/:studentId', protect, getStudentPendingFees);

module.exports = router;
