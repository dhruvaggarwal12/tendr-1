const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { Consumer } = require('../models');
const Vendor = require('../models/Vendor');
const PolicyEngine = require('./policyEngine');
const eventBus = require('./eventBus');

const ReviewService = {
  // Create a new review
  async createReview(bookingId, consumerId, reviewData) {
    try {
      // Validate booking exists and is completed
      const booking = await Booking.findById(bookingId).populate('customerId');
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.customerId._id.toString() !== consumerId.toString()) {
        throw new Error('Unauthorized to review this booking');
      }

      if (booking.status !== 'COMPLETED') {
        throw new Error('Can only review completed bookings');
      }

      // Check if review already exists
      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        throw new Error('Review already exists for this booking');
      }

      // Get consumer details
      const consumer = await Consumer.findById(consumerId);
      if (!consumer) {
        throw new Error('Consumer not found');
      }

      // Validate ratings
      const { ratings, reviewText, reviewPhotos = [] } = reviewData;

      if (!ratings || typeof ratings !== 'object') {
        throw new Error('Ratings are required');
      }

      const requiredRatingCategories = ['overall', 'quality', 'punctuality', 'professionalism', 'valueForMoney', 'communication'];
      for (const category of requiredRatingCategories) {
        if (!ratings[category] || ratings[category] < 1 || ratings[category] > 5) {
          throw new Error(`Invalid rating for ${category}. Must be between 1 and 5`);
        }
      }

      if (!reviewText || reviewText.length < 10 || reviewText.length > 1000) {
        throw new Error('Review text must be between 10 and 1000 characters');
      }

      // Calculate average rating using PolicyEngine
      const averageRating = PolicyEngine.calculateRatingImpact(ratings);

      // Create review
      const review = new Review({
        bookingId,
        vendorId: booking.vendorId,
        consumerId,
        consumerName: consumer.name,
        consumerProfilePhoto: consumer.profilePhoto,
        ratings,
        averageRating,
        reviewText,
        reviewPhotos
      });

      await review.save();

      // Update vendor's average rating
      await this.updateVendorRating(booking.vendorId);

      // Emit event
      eventBus.emit('ReviewCreated', {
        reviewId: review._id,
        vendorId: booking.vendorId,
        consumerId,
        bookingId,
        averageRating: review.averageRating
      });

      return review;
    } catch (error) {
      console.error('ReviewService.createReview error:', error);
      throw error;
    }
  },

  // Update vendor's overall rating based on all reviews
  async updateVendorRating(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const ratingData = await Review.getVendorAverageRating(vendorId);

      // Update vendor's average review score
      vendor.avgReviewScore = ratingData.averageRating;

      // Update ranking score (this will recalculate based on new rating)
      vendor.rankingScore = await vendor.calculateRankingScore();

      await vendor.save();

      return ratingData;
    } catch (error) {
      console.error('ReviewService.updateVendorRating error:', error);
      throw error;
    }
  },

  // Get reviews for a vendor with pagination and caching
  async getVendorReviews(vendorId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minRating,
        status = 'APPROVED'
      } = options;

      const query = { vendorId, status };

      if (minRating) {
        query.averageRating = { $gte: minRating };
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;

      const [reviews, totalCount, ratingData, ratingDistribution] = await Promise.all([
        Review.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Review.countDocuments(query),
        Review.getVendorAverageRating(vendorId),
        Review.getRatingDistribution(vendorId)
      ]);

      return {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalReviews: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        ratingData,
        ratingDistribution
      };
    } catch (error) {
      console.error('ReviewService.getVendorReviews error:', error);
      throw error;
    }
  },

  // Get a specific review
  async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }
      return review;
    } catch (error) {
      console.error('ReviewService.getReviewById error:', error);
      throw error;
    }
  },

  // Get reviews by consumer with pagination
  async getConsumerReviews(consumerId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;

      const [reviews, totalCount] = await Promise.all([
        Review.find({ consumerId })
          .populate('vendorId', 'name serviceType')
          .populate('bookingId', 'schedule')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Review.countDocuments({ consumerId })
      ]);

      return {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalReviews: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('ReviewService.getConsumerReviews error:', error);
      throw error;
    }
  },

  // Add vendor response to a review
  async addVendorResponse(reviewId, vendorId, responseText) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Verify vendor owns this review
      if (review.vendorId.toString() !== vendorId.toString()) {
        throw new Error('Unauthorized to respond to this review');
      }

      // Check if response already exists
      if (review.vendorResponse) {
        throw new Error('Vendor response already exists');
      }

      // Validate response text
      if (!responseText || responseText.length < 10 || responseText.length > 500) {
        throw new Error('Response text must be between 10 and 500 characters');
      }

      // Add response
      review.vendorResponse = {
        responseText,
        responseDate: new Date()
      };

      await review.save();

      // Emit event
      eventBus.emit('VendorResponseAdded', {
        reviewId: review._id,
        vendorId,
        responseText
      });

      return review;
    } catch (error) {
      console.error('ReviewService.addVendorResponse error:', error);
      throw error;
    }
  },

  // Mark a review as helpful
  async markReviewHelpful(reviewId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      review.helpfulCount += 1;
      await review.save();

      return review;
    } catch (error) {
      console.error('ReviewService.markReviewHelpful error:', error);
      throw error;
    }
  },

  // Flag a review for inappropriate content
  async flagReview(reviewId, reason) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Valid flag reasons
      const validReasons = ['inappropriate', 'spam', 'fake', 'offensive', 'other'];
      if (!validReasons.includes(reason)) {
        throw new Error('Invalid flag reason');
      }

      review.flagged = true;
      review.flagReason = reason;
      review.flaggedAt = new Date();

      await review.save();

      // Emit event for moderation
      eventBus.emit('ReviewFlagged', {
        reviewId: review._id,
        reason,
        vendorId: review.vendorId
      });

      return review;
    } catch (error) {
      console.error('ReviewService.flagReview error:', error);
      throw error;
    }
  },

  // Check if a consumer can review a booking
  async canReviewBooking(bookingId, consumerId) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return { canReview: false, reason: 'Booking not found' };
      }

      if (booking.customerId.toString() !== consumerId.toString()) {
        return { canReview: false, reason: 'Unauthorized' };
      }

      if (booking.status !== 'COMPLETED') {
        return { canReview: false, reason: 'Booking not completed' };
      }

      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        return { canReview: false, reason: 'Review already exists' };
      }

      return { canReview: true };
    } catch (error) {
      console.error('ReviewService.canReviewBooking error:', error);
      throw error;
    }
  },

  // Get all bookings that can be reviewed by a consumer
  async getReviewableBookings(consumerId) {
    try {
      const completedBookings = await Booking.find({
        customerId: consumerId,
        status: 'COMPLETED'
      }).populate('vendorId', 'name serviceType');

      const reviewableBookings = [];

      for (const booking of completedBookings) {
        const existingReview = await Review.findOne({ bookingId: booking._id });
        if (!existingReview) {
          reviewableBookings.push(booking);
        }
      }

      return reviewableBookings;
    } catch (error) {
      console.error('ReviewService.getReviewableBookings error:', error);
      throw error;
    }
  }
};

module.exports = ReviewService; 