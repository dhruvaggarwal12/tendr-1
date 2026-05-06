const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const { authConsumer, authVendor } = require('../middleware/auth');
const BookingService = require('../services/booking');

// POST /conversations - Vendor accepts request and opens conversation
router.post('/', authVendor, async (req, res) => {
  try {
    const { requestId, vendorId } = req.body;
    
    // Verify vendor owns this conversation
    if (req.vendor._id.toString() !== vendorId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to open conversation for this vendor' });
    }

    if (!requestId || !vendorId) {
      return res.status(400).json({ error: 'Both requestId and vendorId are required.' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ error: 'Invalid requestId or vendorId.' });
    }

    // Open conversation using BookingService
    const conversation = await BookingService.openConversation(requestId, vendorId);
    
    return res.status(201).json({
      message: 'Conversation opened successfully',
      conversation
    });

  } catch (err) {
    console.error('Error opening conversation:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /conversations - Get conversations for user
router.get('/', authConsumer, async (req, res) => {
  try {
    const customerId = req.consumer._id;
    const conversations = await Conversation.find({
      $or: [{ customerId }, { corporateCustomerId: customerId }],
      status: { $ne: 'CLOSED' }
    }).populate('requestId').sort({ updatedAt: -1 });
    
    return res.json({
      message: 'Conversations retrieved successfully',
      conversations
    });
  } catch (err) {
    console.error('Error getting conversations:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;