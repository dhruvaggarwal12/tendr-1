// src/models/Offer.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Offer } = require('../constants');

const offerSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'IndividualConsumer' }, // For individual consumers
  corporateCustomerId: { type: Schema.Types.ObjectId, ref: 'CorporateConsumer' }, // For corporate consumers
  totalPrice: { type: Number, required: true },
  breakdown: { type: Schema.Types.Mixed, required: true }, // JSON breakdown of pricing
  expiry: { type: Date, required: true },
  status: {
    type: String,
    enum: Offer.STATUS,
    default: Offer.DEFAULT_STATUS
  },
  createdAt: { type: Date, default: Date.now }
});

// Validation to ensure either customerId or corporateCustomerId is provided
offerSchema.pre('save', function(next) {
  if (!this.customerId && !this.corporateCustomerId) {
    return next(new Error('Either customerId or corporateCustomerId must be provided'));
  }
  if (this.customerId && this.corporateCustomerId) {
    return next(new Error('Cannot have both customerId and corporateCustomerId'));
  }
  next();
});

module.exports = mongoose.model('Offer', offerSchema);
