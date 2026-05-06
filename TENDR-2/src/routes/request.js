const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { authConsumer } = require('../middleware/auth');
const BookingService = require('../services/booking');

const router = express.Router();

router.post(
  '/',
  authConsumer,
  [
    body('serviceType').isString().notEmpty().withMessage('Service type is required'),
    body('preferredDateRange.start').isISO8601().withMessage('Valid start date required'),
    body('preferredDateRange.end').isISO8601().withMessage('Valid end date required'),
    body('details').isString().notEmpty().withMessage('Request details are required'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const customerId = req.consumer._id;
      const consumerType = req.consumerType; // 'INDIVIDUAL' or 'CORPORATE'
      const { serviceType, preferredDateRange, details } = req.body;
      const request = await BookingService.createRequest(customerId, serviceType, preferredDateRange, details, consumerType);
      return res.status(201).json({
        message: 'Request created successfully',
        request
      });
    } catch (err) {
      console.error('Create request error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router; 