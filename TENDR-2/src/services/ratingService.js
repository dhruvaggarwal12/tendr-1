const eventBus = require('./eventBus');
const Vendor = require('../models/Vendor');
const PolicyEngine = require('./policyEngine');

const RatingService = {
  // Reduce vendor rating by a given amount
  async reduceRating(vendorId, amount) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const currentRating = vendor.rating || 5;
      const newRating = Math.max(0, currentRating - amount);
      
      vendor.rating = newRating;
      vendor.ratingReductions = vendor.ratingReductions || [];
      vendor.ratingReductions.push({
        amount,
        reason: 'Frequent cancellations',
        date: new Date()
      });

      await vendor.save();

      console.log(`Vendor ${vendorId} rating reduced from ${currentRating} to ${newRating}`);
      
      // Emit rating reduction event
      eventBus.emit('VendorRatingReduced', {
        vendorId,
        previousRating: currentRating,
        newRating,
        reductionAmount: amount
      });

      return vendor;
    } catch (error) {
      console.error('RatingService.reduceRating error:', error);
      throw new Error(`Failed to reduce rating: ${error.message}`);
    }
  },

  // Increase vendor rating (for recovery)
  async increaseRating(vendorId, amount, reason = 'Performance improvement') {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const currentRating = vendor.rating || 5;
      const newRating = Math.min(5, currentRating + amount);
      
      vendor.rating = newRating;
      vendor.ratingIncreases = vendor.ratingIncreases || [];
      vendor.ratingIncreases.push({
        amount,
        reason,
        date: new Date()
      });

      await vendor.save();

      console.log(`Vendor ${vendorId} rating increased from ${currentRating} to ${newRating}`);
      
      // Emit rating increase event
      eventBus.emit('VendorRatingIncreased', {
        vendorId,
        previousRating: currentRating,
        newRating,
        increaseAmount: amount,
        reason
      });

      return vendor;
    } catch (error) {
      console.error('RatingService.increaseRating error:', error);
      throw new Error(`Failed to increase rating: ${error.message}`);
    }
  },

  // Calculate rating impact from reviews
  async calculateRatingFromReviews(vendorId) {
    try {
      const Review = require('../models/Review');
      const reviews = await Review.find({ vendorId, status: 'APPROVED' });
      
      if (reviews.length === 0) {
        return { averageRating: 5, totalReviews: 0 };
      }

      let totalRating = 0;
      let totalWeight = 0;

      for (const review of reviews) {
        const reviewRating = PolicyEngine.calculateRatingImpact(review.ratings);
        const weight = review.helpfulCount + 1; // Weight by helpful votes
        
        totalRating += reviewRating * weight;
        totalWeight += weight;
      }

      const averageRating = totalWeight > 0 ? totalRating / totalWeight : 5;

      return {
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        totalReviews: reviews.length
      };
    } catch (error) {
      console.error('RatingService.calculateRatingFromReviews error:', error);
      throw new Error(`Failed to calculate rating from reviews: ${error.message}`);
    }
  },

  // Update vendor rating from reviews
  async updateVendorRatingFromReviews(vendorId) {
    try {
      const ratingData = await this.calculateRatingFromReviews(vendorId);
      
      const vendor = await Vendor.findByIdAndUpdate(vendorId, {
        rating: ratingData.averageRating,
        totalReviews: ratingData.totalReviews,
        lastRatingUpdate: new Date()
      }, { new: true });

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      console.log(`Updated vendor ${vendorId} rating to ${ratingData.averageRating} from ${ratingData.totalReviews} reviews`);
      
      return vendor;
    } catch (error) {
      console.error('RatingService.updateVendorRatingFromReviews error:', error);
      throw new Error(`Failed to update vendor rating: ${error.message}`);
    }
  },

  // Get rating statistics
  async getRatingStatistics() {
    try {
      const stats = await Vendor.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalVendors: { $sum: 1 },
            highRatedVendors: { $sum: { $cond: [{ $gte: ['$rating', 4.5] }, 1, 0] } },
            lowRatedVendors: { $sum: { $cond: [{ $lte: ['$rating', 3] }, 1, 0] } }
          }
        }
      ]);

      return stats[0] || {
        averageRating: 5,
        totalVendors: 0,
        highRatedVendors: 0,
        lowRatedVendors: 0
      };
    } catch (error) {
      console.error('RatingService.getRatingStatistics error:', error);
      return {
        averageRating: 5,
        totalVendors: 0,
        highRatedVendors: 0,
        lowRatedVendors: 0
      };
    }
  },

  // Get vendor rating history
  async getVendorRatingHistory(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      return {
        currentRating: vendor.rating || 5,
        totalReviews: vendor.totalReviews || 0,
        ratingReductions: vendor.ratingReductions || [],
        ratingIncreases: vendor.ratingIncreases || [],
        lastRatingUpdate: vendor.lastRatingUpdate
      };
    } catch (error) {
      console.error('RatingService.getVendorRatingHistory error:', error);
      throw new Error(`Failed to get rating history: ${error.message}`);
    }
  }
};

module.exports = RatingService; 