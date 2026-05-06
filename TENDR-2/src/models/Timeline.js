const mongoose = require('mongoose');
const { Schema } = mongoose;

const timelineItemSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 500 },
  cardTitle: { type: String, maxlength: 200 },
  cardSubtitle: { type: String, maxlength: 200 },
  cardDetailedText: { type: String, maxlength: 1000 },
  checked: { type: Boolean, default: false },
  completedAt: { type: Date },
  order: { type: Number, required: true }
}, { _id: false });

const timelineSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'IndividualConsumer', required: true },
  corporateUserId: { type: Schema.Types.ObjectId, ref: 'CorporateConsumer' },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  eventType: { 
    type: String, 
    enum: ['wedding', 'birthday', 'corporate', 'getTogether', 'officeParty', 'concert', 'custom'],
    default: 'custom'
  },
  items: [timelineItemSchema],
  linkedBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Validation to ensure either userId or corporateUserId is provided
timelineSchema.pre('save', function(next) {
  if (!this.userId && !this.corporateUserId) {
    return next(new Error('Either userId or corporateUserId must be provided'));
  }
  if (this.userId && this.corporateUserId) {
    return next(new Error('Cannot have both userId and corporateUserId'));
  }
  next();
});

// Update the updatedAt field on save
timelineSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
timelineSchema.index({ userId: 1, createdAt: -1 });
timelineSchema.index({ corporateUserId: 1, createdAt: -1 });
timelineSchema.index({ eventType: 1 });
timelineSchema.index({ linkedBookingId: 1 });

module.exports = mongoose.model('Timeline', timelineSchema);