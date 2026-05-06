// src/routes/payments.js
const express             = require('express');
const { body }            = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { authConsumer }            = require('../middleware/auth');
const PaymentService      = require('../services/payment');

const router = express.Router();

// POST /api/payments/create-order
// Body: { offerId, customerId, amount, paymentType }
router.post(
  '/create-order',
  authConsumer,
  [
    body('offerId')
      .isMongoId().withMessage('Invalid offerId'),
    body('customerId')
      .isMongoId().withMessage('Invalid customerId'),
    body('amount')
      .isNumeric().withMessage('Amount must be a number')
      .custom(v => v > 0).withMessage('Amount must be > 0'),
    body('paymentType')
      .optional()
      .isIn(['BOOKING', 'SUBSCRIPTION', 'ADD_ON'])
      .withMessage('Invalid payment type'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { offerId, customerId, amount, paymentType = 'BOOKING' } = req.body;
      
      // Verify customer owns this payment
      if (req.consumer._id.toString() !== customerId.toString()) {
        return res.status(403).json({ error: 'Unauthorized to create payment for this customer' });
      }

      const { order, payment } = await PaymentService.createOrder(
        offerId,
        customerId,
        amount,
        null, // method to be set on verification
        paymentType
      );
      
      return res.status(201).json({ 
        message: 'Payment order created successfully',
        order, 
        payment 
      });
    } catch (err) {
      console.error('Create order error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/payments/verify
// Body: { paymentId, razorpayPaymentId }
router.post(
  '/verify',
  authConsumer,
  [
    body('paymentId')
      .isMongoId().withMessage('Invalid paymentId'),
    body('razorpayPaymentId')
      .notEmpty().withMessage('razorpayPaymentId is required'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { paymentId, razorpayPaymentId } = req.body;
      
      // Verify payment belongs to authenticated user
      const payment = await PaymentService.getPaymentStatus(paymentId);
      if (payment.customerId && payment.customerId.toString() !== req.consumer._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized to verify this payment' });
      }

      const result = await PaymentService.verifyAndRecordPayment(
        paymentId,
        razorpayPaymentId
      );
      
      return res.json({
        message: 'Payment verification completed',
        ...result
      });
    } catch (err) {
      console.error('Verify payment error:', err);
      return res.status(400).json({ error: err.message });
    }
  }
);

// GET /api/payments/:paymentId/status
// Get payment status
router.get(
  '/:paymentId/status',
  authConsumer,
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      const paymentStatus = await PaymentService.getPaymentStatus(paymentId);
      
      // Verify payment belongs to authenticated user
      if (paymentStatus.customerId && paymentStatus.customerId.toString() !== req.consumer._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized to access this payment' });
      }

      return res.json({
        message: 'Payment status retrieved successfully',
        payment: paymentStatus
      });
    } catch (err) {
      console.error('Get payment status error:', err);
      return res.status(404).json({ error: err.message });
    }
  }
);

// POST /api/payments/:paymentId/retry
// Retry failed payment
router.post(
  '/:paymentId/retry',
  authConsumer,
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      // Verify payment belongs to authenticated user
      const payment = await PaymentService.getPaymentStatus(paymentId);
      if (payment.customerId && payment.customerId.toString() !== req.consumer._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized to retry this payment' });
      }

      const result = await PaymentService.retryPayment(paymentId);
      
      return res.json({
        message: 'Payment retry initiated successfully',
        ...result
      });
    } catch (err) {
      console.error('Retry payment error:', err);
      return res.status(400).json({ error: err.message });
    }
  }
);

// POST /api/payments/:paymentId/refund
// Process refund
router.post(
  '/:paymentId/refund',
  authConsumer,
  [
    body('refundAmount')
      .isNumeric().withMessage('Refund amount must be a number')
      .custom(v => v > 0).withMessage('Refund amount must be > 0'),
    body('notes')
      .optional()
      .isString().withMessage('Notes must be a string'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { refundAmount, notes = '' } = req.body;
      
      // Verify payment belongs to authenticated user
      const payment = await PaymentService.getPaymentStatus(paymentId);
      if (payment.customerId && payment.customerId.toString() !== req.consumer._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized to refund this payment' });
      }

      const result = await PaymentService.processRefund(paymentId, refundAmount, notes);
      
      return res.json({
        message: 'Refund processed successfully',
        ...result
      });
    } catch (err) {
      console.error('Process refund error:', err);
      return res.status(400).json({ error: err.message });
    }
  }
);

module.exports = router;
