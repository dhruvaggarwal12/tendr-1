const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authConsumer } = require('../middleware/auth');
const { Consumer } = require('../models');
const { validateRequest, consumerValidation } = require('../middleware/validator');
const { SUPPORTED_CITIES } = require('../constants');
const reviewService = require('../services/reviewService');
const { checkConsumerPhoneVerified, delAsync } = require('../services/otp');

// Constants
const PUBLIC_FIELDS = ['_id', 'name', 'profilePhotoUrl', 'vendorStats'];

// Helper Functions
const filterPublicFields = (user) => {
  const filtered = {};
  PUBLIC_FIELDS.forEach(field => {
    if (user[field] !== undefined) {
      filtered[field] = user[field];
    }
  });
  return filtered;
};

// Update current user profile
router.patch('/me', authConsumer, consumerValidation.updateProfile, validateRequest, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowed = ['name', 'profilePhotoUrl', 'password', 'address', 'phoneNumber'];
    const isValidOperation = updates.every(update => allowed.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    // Handle phone number update with verification
    if (req.body.phoneNumber && req.body.phoneNumber !== req.user.phoneNumber) {
      const isVerified = await checkConsumerPhoneVerified(req.body.phoneNumber);
      if (!isVerified) {
        return res.status(400).json({ error: 'Phone number not verified. Please verify before updating.' });
      }
      
      // Check if new phone number already exists
      const existingConsumer = await Consumer.findOne({ phoneNumber: req.body.phoneNumber });
      if (existingConsumer) {
        return res.status(400).json({ error: 'Phone number already in use by another account' });
      }
      
      // Remove verification flag from Redis
      await delAsync(`phoneVerified:consumer:${req.body.phoneNumber}`);
      
      // Set phoneVerified to true for the new number
      req.body.phoneVerified = true;
    }

    // If address is present, validate the city
    if (req.body.address) {
      const { city } = req.body.address;
      if (city && !SUPPORTED_CITIES.includes(city)) {
        return res.status(400).json({ error: `City '${city}' is not supported` });
      }

      // Directly overwrite the address
      req.user.address = req.body.address;
    }

    // Handle other fields
    updates.forEach(update => {
      if (update !== 'address') {
        req.user[update] = req.body[update];
      }
    });

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get user profile
router.get('/profile', authConsumer, async (req, res) => {
  try {
    const user = await Consumer.findById(req.user._id)
      .select('-__v -createdAt -updatedAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get consumer's reviews
router.get('/:id/reviews', authConsumer, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the authenticated consumer is requesting their own reviews
    if (req.consumer._id.toString() !== id) {
      return res.status(403).json({ error: 'Unauthorized to view these reviews' });
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await reviewService.getConsumerReviews(id, options);

    res.json({
      ...result,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviewable bookings for consumer
router.get('/:id/reviewable-bookings', authConsumer, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the authenticated consumer is requesting their own bookings
    if (req.consumer._id.toString() !== id) {
      return res.status(403).json({ error: 'Unauthorized to view these bookings' });
    }

    const bookings = await reviewService.getReviewableBookings(id);

    res.json({
      bookings,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 