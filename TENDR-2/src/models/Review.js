const mongoose = require('mongoose');
const { Schema } = mongoose;

// Rating categories for different aspects of service
const RATING_CATEGORIES = {
  OVERALL: 'overall',
  QUALITY: 'quality',
  PUNCTUALITY: 'punctuality',
  PROFESSIONALISM: 'professionalism',
  VALUE_FOR_MONEY: 'valueForMoney',
  COMMUNICATION: 'communication'
};

const reviewSchema = new Schema({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // One review per booking
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  consumerId: {
    type: Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },

  // Consumer details (cached for performance)
  consumerName: {
    type: String,
    required: true
  },
  consumerProfilePhoto: {
    type: String // Cloudinary URL
  },

  // Rating system - each category rated 1-5
  ratings: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },

  // Calculated average rating
  averageRating: {
    type: Number,
    min: 1,
    max: 5
  },

  // Review text
  reviewText: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },

  // Review photos (optional)
  reviewPhotos: [{
    type: String // Cloudinary URLs
  }],

  // Response from vendor (optional)
  vendorResponse: {
    text: {
      type: String,
      maxlength: 500
    },
    respondedAt: {
      type: Date
    }
  },

  // Review status
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED' // Auto-approve by default, can be moderated later
  },

  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0
  },

  // Flag for inappropriate content
  flagged: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ vendorId: 1, createdAt: -1 });
reviewSchema.index({ consumerId: 1 });
reviewSchema.index({ averageRating: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Calculate average rating before saving
reviewSchema.pre('save', function (next) {
  const ratings = this.ratings;
  const sum = ratings.overall + ratings.quality + ratings.punctuality +
    ratings.professionalism + ratings.valueForMoney + ratings.communication;
  this.averageRating = Math.round((sum / 6) * 10) / 10; // Round to 1 decimal
  next();
});

// Static method to get vendor's average rating
reviewSchema.statics.getVendorAverageRating = async function (vendorId) {
  const result = await this.aggregate([
    { $match: { vendorId: mongoose.Types.ObjectId(vendorId), status: 'APPROVED' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$averageRating' },
        totalReviews: { $sum: 1 },
        categoryAverages: {
          $push: {
            overall: '$ratings.overall',
            quality: '$ratings.quality',
            punctuality: '$ratings.punctuality',
            professionalism: '$ratings.professionalism',
            valueForMoney: '$ratings.valueForMoney',
            communication: '$ratings.communication'
          }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0, categoryAverages: {} };
  }

  const data = result[0];

  // Calculate category averages
  const categoryAverages = {};
  const categories = ['overall', 'quality', 'punctuality', 'professionalism', 'valueForMoney', 'communication'];

  categories.forEach(category => {
    const sum = data.categoryAverages.reduce((acc, rating) => acc + rating[category], 0);
    categoryAverages[category] = Math.round((sum / data.totalReviews) * 10) / 10;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    categoryAverages
  };
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function (vendorId) {
  const distribution = await this.aggregate([
    { $match: { vendorId: mongoose.Types.ObjectId(vendorId), status: 'APPROVED' } },
    {
      $group: {
        _id: { $round: ['$averageRating'] },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Convert to object format
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach(item => {
    result[item._id] = item.count;
  });

  return result;
};

module.exports = mongoose.model('Review', reviewSchema);
module.exports.RATING_CATEGORIES = RATING_CATEGORIES; 