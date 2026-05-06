const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Request, SUPPORTED_CITIES, SERVICE_TYPES } = require('../constants');

/*
  Request — a customer's service request directed at a specific vendor.
  Created when the customer hits "Finalise Vendor" in the you-do-it flow,
  or when Tendr's team assigns a vendor in the let-us-do-it flow.
*/
const requestSchema = new Schema(
  {
    // Who is making the request
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualConsumer',
    },
    corporateCustomerId: {
      type: Schema.Types.ObjectId,
      ref: 'CorporateConsumer',
    },

    // Which vendor is being requested
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },

    // Link back to the event plan (optional — present for logged-in flows)
    eventPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'EventPlan',
    },

    // Service being requested
    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      required: true,
    },

    // Event details (denormalised for quick access without joining EventPlan)
    eventName:      { type: String, trim: true },
    eventType:      { type: String, trim: true },
    guestCount:     { type: String },
    budget:         { type: String },
    location:       { type: String, enum: SUPPORTED_CITIES },
    eventDate:      { type: String },
    additionalInfo: { type: String, trim: true },

    // Booking type
    bookingType: {
      type: String,
      enum: ['you-do-it', 'let-us-do-it'],
      default: 'you-do-it',
    },

    // Request lifecycle status
    status: {
      type: String,
      enum: Request.STATUS,
      default: Request.DEFAULT_STATUS,
    },
  },
  { timestamps: true }
);

// Ensure at least one customer reference
requestSchema.pre('save', function (next) {
  if (!this.customerId && !this.corporateCustomerId) {
    return next(new Error('Either customerId or corporateCustomerId must be provided'));
  }
  if (this.customerId && this.corporateCustomerId) {
    return next(new Error('Cannot have both customerId and corporateCustomerId'));
  }
  next();
});

requestSchema.index({ customerId: 1, createdAt: -1 });
requestSchema.index({ vendorId: 1, status: 1 });
requestSchema.index({ status: 1 });

module.exports = mongoose.model('Request', requestSchema);
