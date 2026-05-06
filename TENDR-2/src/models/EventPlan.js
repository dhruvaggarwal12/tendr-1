const mongoose = require('mongoose');
const { Schema } = mongoose;
const { SUPPORTED_CITIES, SERVICE_TYPES } = require('../constants');

/*
  EventPlan — saved when a customer submits their event planning form.
  Ties together the customer, their event details, chosen service categories,
  booking type, and which vendors they finalised.
*/
const eventPlanSchema = new Schema(
  {
    // Who planned it
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualConsumer',
      required: true,
      index: true,
    },

    // Booking flow type
    bookingType: {
      type: String,
      enum: ['you-do-it', 'let-us-do-it'],
      required: true,
    },

    // Event details (from the multi-step form)
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    guests:    { type: String, required: true },
    budget:    { type: String, required: true },
    location: {
      type: String,
      enum: SUPPORTED_CITIES,
      required: true,
    },
    date:           { type: String, required: true },
    additionalInfo: { type: String, trim: true, default: '' },

    // Service categories the customer selected
    selectedServices: [{ type: String, enum: SERVICE_TYPES }],

    // Vendors finalised per service category — { Caterer: vendorId, DJ: vendorId }
    finalisedVendors: {
      type: Map,
      of: { type: Schema.Types.ObjectId, ref: 'Vendor' },
      default: {},
    },

    // Status of this event plan
    status: {
      type: String,
      enum: ['draft', 'submitted', 'in_progress', 'completed', 'cancelled'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

eventPlanSchema.index({ customerId: 1, createdAt: -1 });
eventPlanSchema.index({ status: 1 });
eventPlanSchema.index({ location: 1 });
eventPlanSchema.index({ date: 1 });

module.exports = mongoose.model('EventPlan', eventPlanSchema);
