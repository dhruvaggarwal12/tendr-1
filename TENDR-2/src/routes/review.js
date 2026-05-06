const express = require('express');
const router = express.Router();
const reviewService = require('../services/reviewService');
const { authConsumer, authVendor } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { logger } = require('../middleware/logger');

// Create a new review (Consumer only)
router.post('/', authConsumer, upload.array('reviewPhotos', 5), async (req, res) => {
  try {
    const { bookingId, ratings, reviewText } = req.body;
    const consumerId = req.consumer._id;

    // Parse ratings if it's a string (from form data)
    let parsedRatings;
    try {
      parsedRatings = typeof ratings === 'string' ? JSON.parse(ratings) : ratings;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid ratings format' });
    }

    // Get review photo URLs from uploaded files
    const reviewPhotos = req.files ? req.files.map(file => file.path) : [];

    const reviewData = {
      ratings: parsedRatings,
      reviewText,
      reviewPhotos
    };

    const review = await reviewService.createReview(bookingId, consumerId, reviewData);

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        _id: review._id,
        ratings: review.ratings,
        averageRating: review.averageRating,
        reviewText: review.reviewText,
        reviewPhotos: review.reviewPhotos,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    logger.error('Error creating review:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get reviews for a specific vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      minRating: minRating ? parseInt(minRating) : undefined
    };

    const result = await reviewService.getVendorReviews(vendorId, options);

    res.json({
      ...result,
      success: true
    });
  } catch (error) {
    logger.error('Error getting vendor reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reviews by a specific consumer
router.get('/consumer/:consumerId', authConsumer, async (req, res) => {
  try {
    const { consumerId } = req.params;

    // Check if the authenticated consumer is requesting their own reviews
    if (req.consumer._id.toString() !== consumerId) {
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

    const result = await reviewService.getConsumerReviews(consumerId, options);

    res.json({
      ...result,
      success: true
    });
  } catch (error) {
    logger.error('Error getting consumer reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific review by ID
router.get('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewService.getReviewById(reviewId);

    res.json({
      review,
      success: true
    });
  } catch (error) {
    logger.error('Error getting review:', error);
    res.status(404).json({ error: error.message });
  }
});

// Add vendor response to a review (Vendor only)
router.post('/:reviewId/vendor-response', authVendor, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { responseText } = req.body;
    const vendorId = req.vendor._id;

    if (!responseText) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    const review = await reviewService.addVendorResponse(reviewId, vendorId, responseText);

    res.json({
      message: 'Vendor response added successfully',
      review: {
        _id: review._id,
        vendorResponse: review.vendorResponse
      },
      success: true
    });
  } catch (error) {
    logger.error('Error adding vendor response:', error);
    res.status(400).json({ error: error.message });
  }
});

// Mark a review as helpful
router.post('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewService.markReviewHelpful(reviewId);

    res.json({
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes,
      success: true
    });
  } catch (error) {
    logger.error('Error marking review as helpful:', error);
    res.status(400).json({ error: error.message });
  }
});

// Flag a review as inappropriate
router.post('/:reviewId/flag', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await reviewService.flagReview(reviewId, reason);

    res.json({
      message: 'Review flagged for moderation',
      success: true
    });
  } catch (error) {
    logger.error('Error flagging review:', error);
    res.status(400).json({ error: error.message });
  }
});

// Check if a booking can be reviewed
router.get('/booking/:bookingId/can-review', authConsumer, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const consumerId = req.consumer._id;

    const result = await reviewService.canReviewBooking(bookingId, consumerId);

    res.json({
      ...result,
      success: true
    });
  } catch (error) {
    logger.error('Error checking review eligibility:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reviewable bookings for a consumer
router.get('/consumer/:consumerId/reviewable-bookings', authConsumer, async (req, res) => {
  try {
    const { consumerId } = req.params;

    // Check if the authenticated consumer is requesting their own bookings
    if (req.consumer._id.toString() !== consumerId) {
      return res.status(403).json({ error: 'Unauthorized to view these bookings' });
    }

    const bookings = await reviewService.getReviewableBookings(consumerId);

    res.json({
      bookings,
      success: true
    });
  } catch (error) {
    logger.error('Error getting reviewable bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rating categories (for frontend form)
router.get('/rating-categories', (req, res) => {
  const { RATING_CATEGORIES } = require('../models/Review');

  res.json({
    categories: {
      overall: { label: 'Overall Experience', description: 'Overall satisfaction with the service' },
      quality: { label: 'Quality of Service', description: 'How would you rate the quality of work?' },
      punctuality: { label: 'Punctuality', description: 'Did they arrive on time?' },
      professionalism: { label: 'Professionalism', description: 'How professional was their behavior?' },
      valueForMoney: { label: 'Value for Money', description: 'Was the service worth the price?' },
      communication: { label: 'Communication', description: 'How was their communication throughout?' }
    },
    success: true
  });
});

module.exports = router;