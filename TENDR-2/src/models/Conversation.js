const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Conversation } = require('../constants');

const conversationSchema = new Schema({
  requestId: { type: Schema.Types.ObjectId, ref: 'Request', required: false },
  customerId: { type: Schema.Types.ObjectId, ref: 'IndividualConsumer' }, // For individual consumers
  corporateCustomerId: { type: Schema.Types.ObjectId, ref: 'CorporateConsumer' }, // For corporate consumers
  // participants: [{ type: Schema.Types.ObjectId, ref: 'Consumer', required: true }],
  // messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  status: {
    type: String,
    enum: Conversation.STATUS,
    default: Conversation.DEFAULT_STATUS
  },
  createdAt: { type: Date, default: Date.now }
});

// Validation to ensure either customerId or corporateCustomerId is provided
conversationSchema.pre('save', function(next) {
  if (!this.customerId && !this.corporateCustomerId) {
    return next(new Error('Either customerId or corporateCustomerId must be provided'));
  }
  if (this.customerId && this.corporateCustomerId) {
    return next(new Error('Cannot have both customerId and corporateCustomerId'));
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
