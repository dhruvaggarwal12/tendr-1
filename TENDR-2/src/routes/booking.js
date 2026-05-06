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
    body('offerId').isMongoId(),
    body('paymentId').isMongoId(),
    body('customerId').isMongoId(),
    body('vendorId').isMongoId(),
    body('schedule.date').isISO8601(),
    body('schedule.timeSlot').isString().notEmpty(),
    body('items').isObject(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { offerId, paymentId, customerId, vendorId, schedule, items } = req.body;
      const consumerType = req.consumerType; // 'INDIVIDUAL' or 'CORPORATE'
      const booking = await BookingService.createBooking(offerId, paymentId, customerId, vendorId, schedule, items, consumerType);
      return res.status(201).json(booking);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router; 