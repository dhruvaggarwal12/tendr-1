const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { authConsumer } = require('../middleware/auth');
const CancellationService = require('../services/cancellationService');

const router = express.Router();

// POST /cancellations - Customer cancels booking
router.post(
  '/',
  authConsumer,
  [
    body('bookingId').isMongoId().withMessage('Invalid booking ID'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const customerId = req.consumer._id;
      const consumerType = req.consumerType; // 'INDIVIDUAL' or 'CORPORATE'
      const { bookingId, reason } = req.body;
      
      // Step 1: Initiate cancellation
      const cancellation = await CancellationService.initiateCancellation(bookingId, customerId, reason, consumerType);
      
      // Step 2: Process refund (if eligible)
      const refundResult = await CancellationService.processRefund(cancellation._id);
      
      return res.status(200).json({
        message: 'Cancellation processed successfully',
        cancellation,
        refund: refundResult
      });
    } catch (err) {
      console.error('Cancellation error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /cancellations - Get cancellation status
router.get(
  '/:cancellationId',
  authConsumer,
  async (req, res) => {
    try {
      const { cancellationId } = req.params;
      const customerId = req.consumer._id;
      const consumerType = req.consumerType; // 'INDIVIDUAL' or 'CORPORATE'
      
      const cancellation = await CancellationService.getCancellationStatus(cancellationId, customerId, consumerType);
      
      return res.json({
        message: 'Cancellation status retrieved successfully',
        cancellation
      });
    } catch (err) {
      console.error('Get cancellation error:', err);
      return res.status(404).json({ error: err.message });
    }
  }
);

module.exports = router; 