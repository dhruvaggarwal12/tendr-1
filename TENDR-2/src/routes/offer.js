const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { authConsumer, authVendor } = require('../middleware/auth');
const BookingService = require('../services/booking');

const router = express.Router();

// POST /offers - Vendor creates offer
router.post(
  '/',
  authVendor,
  [
    body('conversationId').isMongoId().withMessage('Invalid conversation ID'),
    body('customerId').isMongoId().withMessage('Invalid customer ID'),
    body('totalPrice').isNumeric().withMessage('Total price must be a number'),
    body('breakdown').isObject().withMessage('Breakdown must be an object'),
    body('expiry').isISO8601().withMessage('Valid expiry date required'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { conversationId, customerId, totalPrice, breakdown, expiry } = req.body;
      const vendorId = req.vendor._id;
      
      // Note: We need to determine consumer type from the conversation
      const conversation = await require('../models/Conversation').findById(conversationId);
      const consumerType = conversation.corporateCustomerId ? 'CORPORATE' : 'INDIVIDUAL';
      
      const offer = await BookingService.createOffer(
        conversationId, 
        vendorId, 
        customerId, 
        totalPrice, 
        breakdown, 
        expiry,
        consumerType
      );
      
      return res.status(201).json({
        message: 'Offer created successfully',
        offer
      });
    } catch (err) {
      console.error('Create offer error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /offers/:offerId/accept - Customer accepts offer
router.post(
  '/:offerId/accept',
  authConsumer,
  async (req, res) => {
    try {
      const { offerId } = req.params;
      const customerId = req.consumer._id;
      const consumerType = req.consumerType; // 'INDIVIDUAL' or 'CORPORATE'
      
      const result = await BookingService.acceptOffer(offerId, customerId, consumerType);
      
      return res.json({
        message: 'Offer accepted successfully',
        ...result
      });
    } catch (err) {
      console.error('Accept offer error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /offers/:offerId/reject - Customer rejects offer
router.post(
  '/:offerId/reject',
  authConsumer,
  async (req, res) => {
    try {
      const { offerId } = req.params;
      const customerId = req.consumer._id;
      const consumerType = req.consumerType; // 'INDIVIDUAL' or 'CORPORATE'
      
      const offer = await require('../models/Offer').findById(offerId);
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }
      
      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? offer.corporateCustomerId.toString() === customerId.toString()
        : offer.customerId.toString() === customerId.toString();
      
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      offer.status = 'REJECTED';
      await offer.save();
      
      return res.json({
        message: 'Offer rejected successfully',
        offer
      });
    } catch (err) {
      console.error('Reject offer error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router; 