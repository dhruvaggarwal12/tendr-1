const mongoose = require('mongoose');
const { Schema } = mongoose;
const { CANCELLATION_STATUS, Cancellation } = require('../constants');

// Booking schema file
 


const cancellationSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'IndividualConsumer' }, // For individual consumers
  corporateCustomerId: { type: Schema.Types.ObjectId, ref: 'CorporateConsumer' }, // For corporate consumers
  requestedAt: { type: Date, default: Date.now },
  timeBeforeEvent: { type: Number, required: true }, // in hours
  refundAmount: { type: Number, required: true },
  refundStatus: {
    type: String,
    enum: Cancellation.STATUS,
    default: Cancellation.DEFAULT_STATUS
  }
});

// Validation to ensure either customerId or corporateCustomerId is provided
cancellationSchema.pre('save', function(next) {
  if (!this.customerId && !this.corporateCustomerId) {
    return next(new Error('Either customerId or corporateCustomerId must be provided'));
  }
  if (this.customerId && this.corporateCustomerId) {
    return next(new Error('Cannot have both customerId and corporateCustomerId'));
  }
  next();
});

module.exports = mongoose.model('Cancellation', cancellationSchema); 