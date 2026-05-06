// src/models/Payment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Payment } = require('../constants');

const paymentSchema = new Schema({
  // Payment Type - to distinguish between different payment types
  paymentType: {
    type: String,
    enum: ['BOOKING', 'SUBSCRIPTION', 'ADD_ON'],
    required: true
  },
  
  // References - these can be different based on payment type
  offerId: { type: Schema.Types.ObjectId, ref: 'Offer' }, // For booking payments
  customerId: { type: Schema.Types.ObjectId, ref: 'IndividualConsumer' }, // For individual consumers
  corporateConsumerId: { type: Schema.Types.ObjectId, ref: 'CorporateConsumer' }, // For corporate consumers
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'CorporateSubscription' }, // For subscription payments
  
  // Payment Details
  amount: { type: Number, required: true },
  method: { type: String, enum: Payment.METHODS, required: true },
  status: { type: String, enum: Payment.STATUS, default: Payment.DEFAULT_STATUS },
  
  // Razorpay Integration
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  
  // Additional Details
  description: { type: String }, // Payment description
  transactionDate: { type: Date, default: Date.now },
  currency: { type: String, default: 'INR' },
  
  // For corporate subscriptions
  billingCycle: { type: String, enum: ['MONTHLY', 'ANNUAL'] },
  planType: { type: String, enum: ['BASIC', 'PRO', 'ELITE'] },
  
  // Refund information
  refundId: { type: String },
  refundAmount: { type: Number },
  refundNotes: { type: String },
  refundError: { type: String },
  
  createdAt: { type: Date, default: Date.now }  
}, {
  timestamps: true
});

// Indexes for efficient querying
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ corporateConsumerId: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionDate: -1 });

// Compound indexes for common queries
paymentSchema.index({ paymentType: 1, status: 1 });
paymentSchema.index({ corporateConsumerId: 1, paymentType: 1 });

// Virtual to get the appropriate customer reference
paymentSchema.virtual('customer').get(function() {
  return this.customerId || this.corporateConsumerId;
});

// Method to check if payment is for corporate subscription
paymentSchema.methods.isCorporateSubscription = function() {
  return this.paymentType === 'SUBSCRIPTION' && this.corporateConsumerId;
};

// Method to check if payment is for individual booking
paymentSchema.methods.isIndividualBooking = function() {
  return this.paymentType === 'BOOKING' && this.customerId;
};

// Method to get payment description
paymentSchema.methods.getDescription = function() {
  if (this.description) return this.description;
  
  switch (this.paymentType) {
    case 'SUBSCRIPTION':
      return `${this.planType} Plan - ${this.billingCycle} Subscription`;
    case 'BOOKING':
      return 'Event Booking Payment';
    case 'ADD_ON':
      return 'Add-on Service Payment';
    default:
      return 'Payment';
  }
};

module.exports = mongoose.model('Payment', paymentSchema);
