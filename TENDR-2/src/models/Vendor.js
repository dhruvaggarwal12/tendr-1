const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { SERVICE_TYPES, DJ_SETUP_OPTIONS, DECORATOR_VENUE_COVERAGE, CATERER_MENU_TYPE, SUPPORTED_CITIES, DECORATOR_THEMES, DJ_EVENT_TYPES, CATERER_CUISINE, CATERER_SERVICE_STYLE, CAKE_SIZES, DELIVERY_OPTIONS, PRODUCT_CATEGORIES, VENDOR_STATUS } = require('../constants');
const bcrypt = require('bcryptjs');
// Review model will be required dynamically to avoid circular dependency

/*
Vendor Schema Structure:
- Base fields: name, gstNumber, teamSize, locations, totalEventsCompleted, maxConcurrentEvents, portfolioPhotos, serviceType, phoneNumber, address, yearsOfExperience, reviews, upiId
- Discriminators:
  - DJ: setup (array of DJ_SETUP_OPTIONS), lightsIncluded, eventTypes (array of DJ_EVENT_TYPES)
  - Decorator: venueCoverage (array of DECORATOR_VENUE_COVERAGE), themes (array of DECORATOR_THEMES)
  - Photographer: photographersCount, videographersCount, socialMedia, album
  - Caterer: cuisine (array of CATERER_CUISINE), serviceStyle (array of CATERER_SERVICE_STYLE), menuType (array of CATERER_MENU_TYPE), beverages
*/

// Base Vendor Schema
const vendorBaseSchema = new Schema({
  name: { type: String, required: true },
  gstNumber: { type: String, required: true, unique: true },
  teamSize: { type: Number, required: true },
  locations: [{ type: String, enum: SUPPORTED_CITIES, required: true }],
  totalEventsCompleted: { type: Number, required: true, default: 0 },
  maxConcurrentEvents: { type: Number, required: true, default: 1 },
  portfolioPhotos: {
    type: [{ type: String }], // Cloudinary URLs
    validate: [
      arr => arr.length <= 10,
      'Cannot have more than 10 portfolio photos.'
    ],
    required: false
  },
  serviceType: { type: String, required: true, enum: SERVICE_TYPES },
  phoneNumber: { type: String, required: true, unique: true },
  phoneVerified: { type: Boolean, default: false },
  address: {
    street: { type: String, required: true },
    city: { type: String, enum: SUPPORTED_CITIES, required: true },
    state: { type: String, required: true }
  },
  yearsOfExperience: { type: Number, required: true },
  avgReviewScore: { type: Number, default: 0 },
  panNumber: { type: String, required: true, unique: true },
  upiId: { type: String }, // optional
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  rankingScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: Object.values(VENDOR_STATUS), 
    default: VENDOR_STATUS.PENDING 
  },
  rejectionReason: { type: String }, // Optional reason for rejection
  approvedAt: { type: Date }, // Timestamp when vendor was approved
  approvedBy: { type: String }, // Admin who approved the vendor
  createdAt: { type: Date, default: Date.now }
}, {
  discriminatorKey: 'serviceType',
  timestamps: true
});

// Indexes
vendorBaseSchema.index({ locations: 1 });
vendorBaseSchema.index({ rankingScore: -1 });
vendorBaseSchema.index({ yearsOfExperience: -1 });
vendorBaseSchema.index({ totalEventsCompleted: -1 });
vendorBaseSchema.index({ avgReviewScore: -1 });
vendorBaseSchema.index({ serviceType: 1 });
vendorBaseSchema.index({ status: 1 });

// Hash password before saving
vendorBaseSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
vendorBaseSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate average review score
vendorBaseSchema.methods.calculateAvgReviewScore = async function () {
  const Review = require('./Review');
  const reviews = await Review.find({ vendorId: this._id, status: 'APPROVED' });
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.averageRating, 0);
  return sum / reviews.length;
};

// Calculate ranking score
vendorBaseSchema.methods.calculateRankingScore = async function () {
  // Weights for different factors
  const weights = {
    avgReviewScore: 0.4,      // 40% weight for average review score
    totalEvents: 0.2,         // 20% weight for total events completed
    experience: 0.2,          // 20% weight for years of experience
    portfolio: 0.1,           // 10% weight for portfolio completeness
    verification: 0.1         // 10% weight for verification status
  };

  // Calculate portfolio completeness (0-1)
  const portfolioScore = Math.min(this.portfolioPhotos.length / 10, 1);

  // Calculate verification score (0-1)
  const verificationScore = this.phoneVerified ? 1 : 0;

  // Calculate experience score (0-1, capped at 20 years)
  const experienceScore = Math.min(this.yearsOfExperience / 20, 1);

  // Calculate total events score (0-1, capped at 100 events)
  const eventsScore = Math.min(this.totalEventsCompleted / 100, 1);

  // Get current average review score
  const avgReviewScore = await this.calculateAvgReviewScore();

  // Calculate final ranking score (0-100)
  const rankingScore = (
    (avgReviewScore * weights.avgReviewScore * 20) + // Convert 5-star rating to 100-point scale
    (eventsScore * weights.totalEvents * 100) +
    (experienceScore * weights.experience * 100) +
    (portfolioScore * weights.portfolio * 100) +
    (verificationScore * weights.verification * 100)
  );

  return Math.round(rankingScore);
};

// Update scores
vendorBaseSchema.methods.updateScores = async function () {
  this.avgReviewScore = await this.calculateAvgReviewScore();
  this.rankingScore = await this.calculateRankingScore();
  await this.save();
};

// Static method to update all vendors' scores
vendorBaseSchema.statics.updateAllScores = async function () {
  const vendors = await this.find();
  for (const vendor of vendors) {
    await vendor.updateScores();
  }
};

// Base Model
const Vendor = mongoose.model('Vendor', vendorBaseSchema);

// DJ Discriminator
const djSchema = new Schema({
  setup: [{ type: String, enum: DJ_SETUP_OPTIONS, required: true }],
  lightsIncluded: { type: Boolean, default: false },
  eventTypes: [{ type: String, enum: DJ_EVENT_TYPES }]
});
Vendor.discriminator('DJ', djSchema);

// Decorator Discriminator
const decoratorSchema = new Schema({
  venueCoverage: [{ type: String, enum: DECORATOR_VENUE_COVERAGE }],
  themes: [{ type: String, enum: DECORATOR_THEMES }]
});
Vendor.discriminator('Decorator', decoratorSchema);

// Photographer Discriminator
const photographerSchema = new Schema({
  photographersCount: { type: Number, default: 1 },
  videographersCount: { type: Number, default: 0 },
  socialMedia: { type: Boolean, default: false },
  album: { type: Boolean, default: true }
});
Vendor.discriminator('Photographer', photographerSchema);

// Caterer Discriminator
const catererSchema = new Schema({
  cuisine: [{ type: String, enum: CATERER_CUISINE }],
  serviceStyle: [{ type: String, enum: CATERER_SERVICE_STYLE }],
  menuType: [{ type: String, enum: CATERER_MENU_TYPE }],
  beveragesRequired: { type: Boolean, default: false }
});
Vendor.discriminator('Caterer', catererSchema);

// GiftHamper Discriminator
const giftHamperSchema = new Schema({
  deliveryOptions: [{ type: String, enum: DELIVERY_OPTIONS, required: true }],
  panIndiaDelivery: { type: Boolean, default: false },
  deliveryAreas: [{ type: String, enum: SUPPORTED_CITIES }], // If not pan India
  maxDeliveryCapacity: { type: Number, required: true, default: 10 },
  deliveryTimeRange: {
    min: { type: Number, required: true, default: 1 }, // minimum days
    max: { type: Number, required: true, default: 7 }  // maximum days
  }
});
Vendor.discriminator('GiftHamper', giftHamperSchema);

// Cake Discriminator
const cakeSchema = new Schema({
  availableSizes: [{ type: String, enum: CAKE_SIZES, required: true }],
  customFlavors: [{ type: String }],
  pricesNegotiable: { type: Boolean, default: false },
  deliveryOptions: [{ type: String, enum: DELIVERY_OPTIONS, required: true }],
  pickupAddress: { type: String } // Optional pickup address if pickup is available
});
Vendor.discriminator('Cake', cakeSchema);

// Add service-specific indexes
djSchema.index({ setup: 1 });
djSchema.index({ lightsIncluded: 1 });
decoratorSchema.index({ venueCoverage: 1 });
decoratorSchema.index({ themes: 1 });
photographerSchema.index({ photographersCount: 1 });
photographerSchema.index({ videographersCount: 1 });
catererSchema.index({ cuisine: 1 });
catererSchema.index({ serviceStyle: 1 });
catererSchema.index({ menuType: 1 });
giftHamperSchema.index({ panIndiaDelivery: 1 });
giftHamperSchema.index({ deliveryAreas: 1 });
giftHamperSchema.index({ deliveryOptions: 1 });
cakeSchema.index({ availableSizes: 1 });
cakeSchema.index({ pricesNegotiable: 1 });
cakeSchema.index({ deliveryOptions: 1 });

module.exports = Vendor; 