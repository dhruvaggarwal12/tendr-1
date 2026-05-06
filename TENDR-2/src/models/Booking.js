const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Booking } = require('../constants');
const RequirementsSchema = require('./RequirementSchema');

const bookingSchema = new Schema({
  offerId: { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'IndividualConsumer' }, // For individual consumers
  corporateCustomerId: { type: Schema.Types.ObjectId, ref: 'CorporateConsumer' }, // For corporate consumers
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  schedule: {
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }
  },
  totalAmount: {type: Number, required: true},
  items: [RequirementsSchema], // JSON of booked items/services
  status: {
    type: String,
    enum: Booking.STATUS,
    default: Booking.DEFAULT_STATUS
  },
  createdAt: { type: Date, default: Date.now }
});

// Validation to ensure either customerId or corporateCustomerId is provided
bookingSchema.pre('save', function(next) {
  if (!this.customerId && !this.corporateCustomerId) {
    return next(new Error('Either customerId or corporateCustomerId must be provided'));
  }
  if (this.customerId && this.corporateCustomerId) {
    return next(new Error('Cannot have both customerId and corporateCustomerId'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
